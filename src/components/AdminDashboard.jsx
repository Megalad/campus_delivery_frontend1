import React, { useEffect, useState } from 'react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [facultyFilter, setFacultyFilter] = useState('ALL'); // NEW: Faculty Filter

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Admin Fetch Error:", err);
    }
  };

  const fetchManagementData = async () => {
    try {
      const userRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`);
      setUsers(await userRes.json());
      
      const vendorRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/vendors`);
      setVendors(await vendorRes.json());

      const locRes = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`);
      if (locRes.ok) setLocations(await locRes.json());
    } catch (err) {
      console.error("Management Fetch Error:", err);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await fetchStats();
      await fetchManagementData();
      setLoading(false);
    };
    loadAllData();
    
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleForceCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to FORCE CANCEL this order?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (response.ok) fetchStats(); 
    } catch (err) {
      console.error("Error cancelling order:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, { method: 'DELETE' });
      if (response.ok) fetchManagementData(); 
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm("WARNING: This will delete the shop and all its menu items. Continue?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/vendors/${vendorId}`, { method: 'DELETE' });
      if (response.ok) fetchManagementData(); 
    } catch (err) {
      console.error("Error deleting vendor:", err);
    }
  };
  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationName: newLocation.trim() })
      });
      if (response.ok) {
        setNewLocation('');
        fetchManagementData(); // Refresh the list
      }
    } catch (err) {
      console.error("Error adding location:", err);
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campus location?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/locations/${id}`, { method: 'DELETE' });
      if (response.ok) fetchManagementData();
    } catch (err) {
      console.error("Error deleting location:", err);
    }
  };

  if (loading || !stats) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse">Loading System Data...</div>;

  const completedOrders = stats.orders.filter(o => o.status === 'completed');
  const totalPlatformRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = completedOrders.length > 0 ? Math.round(totalPlatformRevenue / completedOrders.length) : 0;
  const fulfillmentRate = stats.totalOrders > 0 ? ((completedOrders.length / stats.totalOrders) * 100).toFixed(1) : 0;
  
  // NEW: Double filter logic (Status + Faculty)
  const filteredOrders = stats.orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchFaculty = facultyFilter === 'ALL' || o.customerId?.locationId === facultyFilter;
    return matchStatus && matchFaculty;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Command Center</h1>
            <p className="text-slate-500 font-medium mt-1">Platform overview and user management</p>
          </div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-slate-200 pb-px">
          {/* UPDATED: Added 'locations' to the array below */}
          {['overview', 'users', 'vendors', 'locations'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${
                activeTab === tab ? 'border-orange-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab === 'overview' ? 'Live Overview' : `Manage ${tab}`}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Users</p>
                <p className="text-3xl font-black text-slate-900">{stats.totalUsers}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registered Shops</p>
                <p className="text-3xl font-black text-orange-500">{stats.totalVendors}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gross Revenue</p>
                <p className="text-3xl font-black text-green-500">{totalPlatformRevenue} <span className="text-sm text-slate-300">THB</span></p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fulfillment Rate</p>
                <p className="text-3xl font-black text-blue-500">{fulfillmentRate}%</p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 overflow-hidden">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  Master Order Log
                  <span className="text-[10px] font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live
                  </span>
                </h2>
                
                <div className="flex flex-wrap gap-3 items-center">
                  {/* NEW: FACULTY DROPDOWN */}
                  <select
                    value={facultyFilter}
                    onChange={(e) => setFacultyFilter(e.target.value)}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-200 text-slate-700 outline-none cursor-pointer bg-white hover:bg-slate-50 transition-colors"
                  >
                    <option value="ALL">All Faculties</option>
                    <option value="MSME">MSME</option>
                    <option value="ARTS">Arts</option>
                    <option value="COMMARTS">Comm Arts</option>
                    <option value="VME">Engineering</option>
                    <option value="VMS">Science & Tech</option>
                    <option value="ARCH">Architecture</option>
                    <option value="LAW">Law</option>
                    <option value="NURSING">Nursing</option>
                    <option value="BIOTECH">Biotech</option>
                    <option value="MUSIC">Music</option>
                  </select>

                  <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    {['all', 'pending', 'completed', 'cancelled'].map(status => (
                      <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${filterStatus === status ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-700'}`}>
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="py-4 px-4 whitespace-nowrap">Order ID</th>
                      {/* NEW CUSTOMER COLUMN */}
                      <th className="py-4 px-4 whitespace-nowrap">Customer</th>
                      <th className="py-4 px-4 whitespace-nowrap">Vendor</th>
                      <th className="py-4 px-4 whitespace-nowrap text-center">Payment</th>
                      <th className="py-4 px-4 whitespace-nowrap text-right">Amount</th>
                      <th className="py-4 px-4 whitespace-nowrap text-center">Status</th>
                      <th className="py-4 px-4 whitespace-nowrap text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-slate-700">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No orders match this filter.</td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 font-mono text-xs font-bold text-slate-500">#{order._id.slice(-6).toUpperCase()}</td>
                          
                          {/* CUSTOMER DATA */}
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-900">{order.customerId?.name || 'Deleted User'}</p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.customerId?.locationId || 'Unknown'}</span>
                          </td>

                          <td className="py-4 px-4">
                            <p className="font-black text-slate-900">{order.vendorId?.shopName || 'Deleted Shop'}</p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.vendorId?.locationId || 'Unknown'}</span>
                          </td>
                          <td className="py-4 px-4 text-center"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">{order.paymentMethod || 'Cash'}</span></td>
                          <td className="py-4 px-4 text-right font-black text-orange-500">{order.totalAmount} THB</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`uppercase text-[10px] font-black px-3 py-1.5 rounded-md tracking-wider ${order.status === 'completed' ? 'bg-slate-900 text-white' : order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {['pending', 'accepted', 'preparing'].includes(order.status) ? (
                              <button onClick={() => handleForceCancelOrder(order._id)} className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest">Force Cancel</button>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Locked</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: USERS --- */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 animate-fade-in-up overflow-hidden">
            <h2 className="text-xl font-bold text-slate-900 mb-6">User Database</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-4 px-4">Name</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4">Role</th>
                    <th className="py-4 px-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-slate-700">
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.locationId || 'Unknown'}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-500">{u.email}</td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'Vendor' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(u._id)} className="text-[10px] font-bold text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-md transition-colors uppercase tracking-widest">Ban User</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: VENDORS --- */}
        {activeTab === 'vendors' && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 animate-fade-in-up overflow-hidden">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Registered Shops</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-4 px-4">Shop Name</th>
                    <th className="py-4 px-4">Location</th>
                    <th className="py-4 px-4">Cuisine</th>
                    <th className="py-4 px-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-slate-700">
                  {vendors.map((v) => (
                    <tr key={v._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-black text-slate-900">{v.shopName}</td>
                      <td className="py-4 px-4 font-bold text-slate-500">{v.locationId}</td>
                      <td className="py-4 px-4 text-slate-400">{v.cuisineType}</td>
                      <td className="py-4 px-4 text-right">
                        <button onClick={() => handleDeleteVendor(v._id)} className="text-[10px] font-bold text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-md transition-colors uppercase tracking-widest">Delete Shop</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NEW --- TAB CONTENT: LOCATIONS --- */}
        {activeTab === 'locations' && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 animate-fade-in-up overflow-hidden">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Campus Food Locations</h2>
            
            {/* Add New Location Form */}
            <form onSubmit={handleAddLocation} className="flex gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <input 
                type="text" 
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. AU Plaza, Main Cafeteria..." 
                className="flex-grow px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none font-bold text-slate-700"
              />
              <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors uppercase tracking-widest text-sm">
                Add Location
              </button>
            </form>

            {/* Locations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-4 px-4">Location Name</th>
                    <th className="py-4 px-4">Database ID</th>
                    <th className="py-4 px-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-slate-700">
                  {locations.map((loc) => (
                    <tr key={loc._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-black text-slate-900">{loc.locationName}</td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-400">{loc._id}</td>
                      <td className="py-4 px-4 text-right">
                        <button onClick={() => handleDeleteLocation(loc._id)} className="text-[10px] font-bold text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-md transition-colors uppercase tracking-widest">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {locations.length === 0 && (
                    <tr><td colSpan="3" className="py-8 text-center text-slate-400 font-bold">No locations created yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;