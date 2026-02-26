import React from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerHome = () => {
  const navigate = useNavigate();

  // Pre-defined campus locations with placeholder images
  const locations = [
    { 
      id: 'AUMALL', 
      name: 'AU Mall', 
      // Image of a modern mall/food court interior
      image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=600&q=80',
      desc: 'Food court, cafes, and retail shops',
    },
    { 
      id: 'AUPLAZA', 
      name: 'AU Plaza', 
      // Image of a lively cafeteria setting
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
      desc: 'Main student cafeteria and local food',
    },
    { 
      id: 'BOOKSTORE', 
      name: 'Book Store', 
      // Image of a bookstore/cafe vibe
      image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80',
      desc: 'Business faculty and coffee stands',
    },
  ];

  const handleLocationSelect = (locationId) => {
    navigate(`/vendors/${locationId}`);
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => handleLocationSelect(loc.id)}
              // Changed layout to flex-col for banner image style
              className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-orange-200 transition-all group flex flex-col text-left overflow-hidden h-full"
            >
              {/* Image Banner Container */}
              <div className="h-48 w-full overflow-hidden relative">
                <img
                  src={loc.image}
                  alt={loc.name}
                  // Added slow zoom effect on hover
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Subtle dark overlay to make text pop if needed */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Text Container */}
              <div className="p-6 flex-grow flex flex-col justify-end bg-white relative z-10">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-500 transition-colors">{loc.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{loc.desc}</p>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CustomerHome;