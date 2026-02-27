import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default placeholder image for locations fetched from the database
  const defaultImage = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80';

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`);
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleLocationSelect = (locationName) => {
    // We pass the locationName (e.g., "AU Plaza") to match how your vendors are likely filtered
    navigate(`/vendors/${locationName}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header / Hero Section */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-center text-white mb-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-4 relative z-10">Hungry? We've got you.</h1>
          <p className="text-slate-400 text-lg font-medium relative z-10">Select your campus location to see available food vendors.</p>
        </div>

        {/* Location Grid */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Campus Locations</h2>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 font-bold animate-pulse py-12">
            Loading Campus Locations...
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center text-slate-400 font-bold py-12">
            No locations available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {locations.map((loc) => (
              <button
                key={loc._id}
                onClick={() => handleLocationSelect(loc.locationName)}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-orange-200 transition-all group flex flex-col text-left overflow-hidden h-full"
              >
                {/* Image Banner Container */}
                <div className="h-48 w-full overflow-hidden relative">
                  <img
                    src={defaultImage}
                    alt={loc.locationName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Text Container */}
                <div className="p-6 flex-grow flex flex-col justify-end bg-white relative z-10">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-500 transition-colors">{loc.locationName}</h3>
                  <p className="text-slate-500 text-sm mt-1">Explore food vendors here</p>
                </div>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerHome;