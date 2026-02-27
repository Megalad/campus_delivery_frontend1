import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VendorShopRegistration = ({ user, onComplete }) => {
  const navigate = useNavigate();
  const [shopName, setShopName] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [locationId, setLocationId] = useState('');
  const [dbLocations, setDbLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // 1. Fetch the exact locations you created in the Admin Dashboard
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`);
        if (response.ok) {
          const data = await response.json();
          setDbLocations(data);
          // Set the first location as default if it exists
          if (data.length > 0) setLocationId(data[0].locationName);
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Safety check: Grab user from props, or fallback to LocalStorage
    const currentUser = user || JSON.parse(localStorage.getItem('user'));

    if (!currentUser || (!currentUser.id && !currentUser._id)) {
      alert("Session lost. Please log out and log back in.");
      return;
    }

    const finalUserId = currentUser.id || currentUser._id;

    // IMPORTANT: Because backend uses 'multer', we MUST use FormData instead of JSON
    const formData = new FormData();
    formData.append('ownerId', finalUserId); // Backend expects 'ownerId'
    formData.append('shopName', shopName);
    formData.append('cuisineType', cuisineType);
    formData.append('locationId', locationId);
    // Note: We leave 'image' out for now since the backend says 'req.file ? ... : ""'

    try {
      // 1. Updated the URL to include /register-shop
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/register-shop`, {
        method: 'POST',
        // 2. DO NOT set 'Content-Type'. The browser automatically sets it for FormData!
        body: formData
      });

      if (response.ok) {
        alert("Shop successfully registered!");
        if (onComplete) onComplete(); 
        navigate('/vendor'); 
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            alert(data.message || "Failed to register shop.");
        } else {
            alert(`Server Error: The route was not found (${response.status})`);
        }
      }
    } catch (error) {
      console.error("Error creating shop:", error);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900">Set Up Your Shop</h2>
          <p className="text-slate-500 mt-2 font-medium">Just one more step to start selling!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Shop Name</label>
            <input 
              type="text" 
              required 
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              placeholder="e.g. Skyline Cafe"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Cuisine Type</label>
            <input 
              type="text" 
              required 
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              placeholder="e.g. Thai, Beverages, Fast Food"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Campus Location</label>
            <select 
              required
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all cursor-pointer bg-white"
            >
              {loadingLocations ? (
                <option value="">Loading locations...</option>
              ) : dbLocations.length === 0 ? (
                <option value="">No locations available</option>
              ) : (
                dbLocations.map(loc => (
                  <option key={loc._id} value={loc.locationName}>{loc.locationName}</option>
                ))
              )}
            </select>
            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mt-2 text-right">
              * This cannot be changed later
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loadingLocations || dbLocations.length === 0}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors mt-4 disabled:bg-slate-300"
          >
            Open Shop
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorShopRegistration;