import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VendorDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); 
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const shopRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/my-shop/${user._id || user.id}`);
        const shopData = await shopRes.json();
        setShop(shopData);

        if (shopData._id) {
          const ordersRes = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/vendor/${shopData._id}`);
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            setOrders(ordersData);
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchDashboardData();
  }, [user]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));
      }
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  const toggleShopStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/${shop._id}/toggle-status`, { method: 'PUT' });
      if (response.ok) {
        const updatedShop = await response.json();
        setShop(updatedShop); 
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  if (!shop) return <div className="p-10 text-center text-slate-500 mt-20 font-bold animate-pulse">Loading your dashboard...</div>;

  const tabs = ['Pending', 'Accepted', 'Preparing', 'Ready'];
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const activeCount = orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status)).length;
  const todaysRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0);
  const displayedOrders = orders.filter(o => o.status === activeTab.toLowerCase());

  return (
    <div className="min-h-screen bg-white p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Vendor Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">{shop.shopName}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleShopStatus}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${
                shop.isOpen ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              }`}
            >
              {shop.isOpen ? 'Status: OPEN' : 'Status: CLOSED'}
            </button>

            <select 
              onChange={(e) => { if (e.target.value === "menu") navigate('/vendor-menu'); }}
              className="border border-slate-200 rounded-lg px-4 py-2 bg-white text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm outline-none cursor-pointer"
            >
              <option value="dashboard">Live Orders</option>
              <option value="menu">Manage Menu</option>
            </select>
          </div>
        </div>

        {/* --- LIVE STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pending Orders</p>
              <p className="text-5xl font-black text-orange-500">{pendingCount}</p>
            </div>
            <div className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-black rounded-md tracking-widest">PND</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Active Orders</p>
              <p className="text-5xl font-black text-blue-500">{activeCount}</p>
            </div>
            <div className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-black rounded-md tracking-widest">ACT</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Revenue (Completed)</p>
              <p className="text-5xl font-black text-green-500">{todaysRevenue} <span className="text-2xl text-slate-300">THB</span></p>
            </div>
            <div className="px-3 py-1 bg-green-50 text-green-600 text-xs font-black rounded-md tracking-widest">THB</div>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="border-b border-slate-200 mb-10">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.toLowerCase();
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`pb-4 text-sm font-bold transition-colors border-b-2 uppercase tracking-wider ${
                    isActive ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </nav>
        </div>

        {/* --- DYNAMIC ORDERS AREA --- */}
        {displayedOrders.length === 0 ? (
          <div className="flex justify-center items-center py-32 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
            <p className="text-slate-400 font-bold text-lg uppercase tracking-wider">No {activeTab} orders right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedOrders.map((order) => (
              <div key={order._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ORDER ID</p>
                    <p className="font-mono text-slate-900 font-bold">#{order._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TOTAL</p>
                    <p className="font-black text-xl text-orange-500">{order.totalAmount} THB</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6 flex-grow">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm font-medium text-slate-700">
                      <span><span className="text-orange-500 font-black mr-2">{item.quantity}x</span> {item.name}</span>
                    </div>
                  ))}
                </div>
                {/* PAYMENT VERIFICATION AREA */}
                <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${order.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {order.paymentMethod || 'Cash'}
                    </span>
                  </div>
                  {order.paymentMethod === 'PromptPay' && order.paymentSlip && (
                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Transfer Slip</span>
                      <a href={`${import.meta.env.VITE_API_URL}${order.paymentSlip}`} target="_blank" rel="noreferrer">
                        <img src={`${import.meta.env.VITE_API_URL}${order.paymentSlip}`} alt="Slip" className="w-full h-32 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity cursor-pointer" />
                      </a>
                    </div>
                  )}
                </div>
                {/* ACTION BUTTONS */}
                {activeTab === 'pending' && (
                  <div className="flex gap-3 mt-auto">
                    <button onClick={() => updateOrderStatus(order._id, 'accepted')} className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors">Accept Order</button>
                    <button onClick={() => updateOrderStatus(order._id, 'cancelled')} className="px-4 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors">Cancel</button>
                  </div>
                )}
                {activeTab === 'accepted' && (
                  <button onClick={() => updateOrderStatus(order._id, 'preparing')} className="w-full mt-auto bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors">Start Preparing</button>
                )}
                {activeTab === 'preparing' && (
                  <button onClick={() => updateOrderStatus(order._id, 'ready')} className="w-full mt-auto bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors">Mark as Ready</button>
                )}
                {activeTab === 'ready' && (
                  <button onClick={() => updateOrderStatus(order._id, 'completed')} className="w-full mt-auto bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors">Handed to Customer</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;