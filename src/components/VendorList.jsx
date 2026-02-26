import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VendorList = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/location/${locationId}`);
        if (response.ok) {
          const data = await response.json();
          setVendors(data);
        } else {
          console.error("Failed to fetch vendors");
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [locationId]);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Vendors at <span className="text-orange-500">{locationId}</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Choose a shop to view their menu</p>
          </div>
          <button 
            onClick={() => navigate('/home')}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors"
          >
            &larr; Back to Locations
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold text-lg animate-pulse uppercase tracking-widest">
            Loading vendors...
          </div>
        ) : vendors.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-widest">No shops open here yet</h3>
            <p className="text-slate-500">Check back later or try a different campus location.</p>
          </div>
        ) : (
          /* Vendor Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <div 
                key={vendor._id} 
                className={`bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:border-orange-200 transition-all group flex flex-col cursor-pointer ${!vendor.isOpen ? 'opacity-80' : ''}`}
                onClick={() => navigate(`/shop/${vendor._id}`)} 
              >
                {/* Image Section */}
                <div className="h-48 bg-slate-200 overflow-hidden relative">
                  <img 
                    src={vendor.image ? `${import.meta.env.VITE_API_URL}${vendor.image}` : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'} 
                    alt={vendor.shopName}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!vendor.isOpen ? 'grayscale' : ''}`}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' }}
                  />
                  
                  {/* NEW: DYNAMIC OPEN/CLOSED BADGE */}
                  <div className={`absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black shadow-sm flex items-center space-x-1 tracking-widest ${vendor.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                    <span className={`w-2 h-2 rounded-full ${vendor.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span>{vendor.isOpen ? 'OPEN' : 'CLOSED'}</span>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-1 transition-colors ${vendor.isOpen ? 'text-slate-900 group-hover:text-orange-500' : 'text-slate-600'}`}>
                    {vendor.shopName}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mb-4">{vendor.cuisineType} Cuisine</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">View Menu</span>
                    <span className={`font-bold text-sm flex items-center transition-transform ${vendor.isOpen ? 'text-orange-500 group-hover:translate-x-1' : 'text-slate-400'}`}>
                      &rarr;
                    </span>
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

export default VendorList;