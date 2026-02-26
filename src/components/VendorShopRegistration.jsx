import React, { useState } from 'react';

const VendorShopRegistration = ({ userId, onComplete }) => {
  const [imagePreview, setImagePreview] = useState(null);

  // Handle image preview when a file is selected
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting with User ID:", userId);
    
    // Use FormData for file uploads
    const formData = new FormData();
    formData.append('shopName', e.target.shopName.value);
    formData.append('locationId', e.target.location.value);
    formData.append('cuisineType', e.target.cuisine.value);
    formData.append('ownerId', userId); // FK linking to Entity 1
    
    // Attach the file if it exists
    if (e.target.shopImage.files[0]) {
      formData.append('image', e.target.shopImage.files[0]);
    }

    try {
      // NOTE: Do NOT set Content-Type header when sending FormData
      // The browser will automatically set it to multipart/form-data
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/register-shop`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Shop Registered Successfully!");
        onComplete(); // Move to the Vendor Dashboard
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error registering shop:", error);
      alert("Could not connect to the server.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <h2 className="text-3xl font-black text-slate-900 mb-2">Register Your Shop</h2>
        <p className="text-slate-500 mb-8 font-medium">Set up your campus presence.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Shop Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Shop Name</label>
            <input name="shopName" type="text" required placeholder="e.g., Skyline Cafe"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500 transition-all" />
          </div>

          {/* Location Selection - Entity 5 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Campus Location</label>
            <select name="location" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500 appearance-none">
              <option value="AUMALL">AU Mall</option>
              <option value="AUPLAZA">AU Plaza</option>
              <option value="CANTEEN">Campus Canteen</option>
            </select>
          </div>

          {/* Cuisine Type */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Cuisine Type</label>
            <input name="cuisine" type="text" required placeholder="e.g., Thai Fusion, Drinks"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500 transition-all" />
          </div>

          {/* Shop Image Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Shop Photo</label>
            <div className="relative group border-2 border-dashed border-slate-200 rounded-2xl p-4 hover:border-orange-500 transition-colors">
              <input 
                name="shopImage" 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className="flex flex-col items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-32 w-full object-cover rounded-xl" />
                ) : (
                  <>
                    <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs font-bold text-slate-400">Upload Shop Photo</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/20">
            Create Shop Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorShopRegistration;