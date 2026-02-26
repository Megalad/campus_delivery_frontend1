import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the logged-in student
  const savedUser = JSON.parse(localStorage.getItem('user'));
  const customerId = savedUser?._id || savedUser?.id;

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!customerId) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/customer/${customerId}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
    
    // Optional: Refresh orders automatically every 5 seconds to show live updates!
    const interval = setInterval(fetchMyOrders, 5000);
    return () => clearInterval(interval);
  }, [customerId]);

  // Helper function to style the status badges beautifully
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': 
        return (
          <span className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Sent to Vendor
          </span>
        );
      case 'accepted': 
        return (
          <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Order Accepted
          </span>
        );
      case 'preparing': 
        return (
          <span className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-orange-100">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Cooking Now
          </span>
        );
      case 'ready': 
        return (
          <span className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-green-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Ready for Pickup
          </span>
        );
      case 'completed': 
        return (
          <span className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Completed
          </span>
        );
      case 'cancelled': 
        return (
          <span className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Cancelled
          </span>
        );
      default: 
        return null;
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Loading your orders...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans pb-20">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">My Orders</h1>
            <p className="text-slate-500 font-medium mt-1">Track your active meals and order history</p>
          </div>
          <button onClick={() => navigate('/home')} className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-sm">
            &larr; Back to Home
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200">
            <div className="text-5xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">You haven't ordered anything yet</h3>
            <p className="text-slate-500 mb-6">Explore the campus and find something delicious!</p>
            <button onClick={() => navigate('/home')} className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600">Browse Food</button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 hover:shadow-md transition-shadow">
                
                {/* Order Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 mb-4 gap-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={order.vendorId?.image ? `${import.meta.env.VITE_API_URL}${order.vendorId.image}` : 'https://via.placeholder.com/50'} 
                      alt="Shop" 
                      className="w-14 h-14 rounded-full object-cover border border-slate-100"
                    />
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{order.vendorId?.shopName || 'Unknown Shop'}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{order.vendorId?.locationId}</p>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-6 pl-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700 font-medium">
                      <span><span className="text-orange-500 font-black mr-3">{item.quantity}x</span> {item.name}</span>
                      <span className="text-slate-400">{item.price * item.quantity} ฿</span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Order ID</p>
                    <p className="font-mono font-bold text-slate-700">#{order._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total</p>
                    <p className="font-black text-xl text-orange-500">{order.totalAmount} ฿</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;