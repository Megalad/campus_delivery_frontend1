import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VendorMenu = ({ user }) => {
  const [items, setItems] = useState([]);
  const [shop, setShop] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shopRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/my-shop/${user._id || user.id}`);
        const shopData = await shopRes.json();
        setShop(shopData);

        if (shopData._id) {
          const itemsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/items/vendor/${shopData._id}`);
          if (itemsRes.ok) {
            const itemsData = await itemsRes.json();
            setItems(itemsData);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shop || !shop._id) {
      alert("Error: Shop data not loaded yet.");
      return;
    }

    const formData = new FormData();
    formData.append('name', e.target.name.value);
    formData.append('price', e.target.price.value);
    formData.append('category', e.target.category.value);
    formData.append('vendorId', shop._id);
    
    if (e.target.image.files[0]) {
      formData.append('image', e.target.image.files[0]);
    }

    try {
      const url = editingItem 
        ? `${import.meta.env.VITE_API_URL}/api/items/edit/${editingItem._id}`
        : `${import.meta.env.VITE_API_URL}/api/items/add`;
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body: formData });

      if (response.ok) {
        const savedItem = await response.json();
        
        if (editingItem) {
          setItems(items.map(item => item._id === savedItem._id ? savedItem : item));
          setEditingItem(null); 
        } else {
          setItems([...items, savedItem]);
        }

        e.target.reset(); 
        setImagePreview(null);
      } else {
        alert("Failed to save item");
      }
    } catch (err) {
      console.error("Error saving item:", err);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/items/delete/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setItems(items.filter(item => item._id !== itemId)); 
      } else {
        alert("Failed to delete item.");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const startEditing = (item) => {
    setEditingItem(item);
    setImagePreview(item.image ? `${import.meta.env.VITE_API_URL}${item.image}` : null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setImagePreview(null);
    document.getElementById("itemForm").reset(); 
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Menu Management</h1>
            <p className="text-slate-500 font-medium mt-1">Keep your menu fresh and updated</p>
          </div>
          <button onClick={() => navigate('/vendor-dashboard')} className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-sm">
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Dynamic Form (Add / Edit) */}
          <div className={`md:col-span-1 p-6 rounded-3xl shadow-sm border h-fit transition-colors ${editingItem ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold ${editingItem ? 'text-orange-600' : 'text-slate-900'}`}>
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              {editingItem && (
                <button onClick={cancelEdit} className="text-sm font-bold text-slate-400 hover:text-slate-600">Cancel</button>
              )}
            </div>

            <form id="itemForm" key={editingItem ? editingItem._id : 'new'} onSubmit={handleSubmit} className="space-y-4">
              <input name="name" defaultValue={editingItem?.name || ''} type="text" placeholder="Item Name (e.g., Pad Thai)" required className="w-full p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-orange-500 border border-slate-200" />
              <input name="price" defaultValue={editingItem?.price || ''} type="number" placeholder="Price (THB)" required className="w-full p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-orange-500 border border-slate-200" />
              
              <select name="category" defaultValue={editingItem?.category || 'Main'} className="w-full p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-orange-500 border border-slate-200 cursor-pointer">
                <option value="Main">Main Dish</option>
                <option value="Drink">Drink</option>
                <option value="Snack">Snack</option>
                <option value="Dessert">Dessert</option>
              </select>
              
              {/* Pure text upload box */}
              <div className="border-2 border-dashed border-slate-200 bg-white p-4 rounded-xl text-center relative hover:border-orange-500 transition-colors">
                <input name="image" type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                {imagePreview ? (
                  <img src={imagePreview} className="h-24 w-full object-cover rounded-lg" alt="Preview" />
                ) : (
                  <div className="py-4">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Click to Upload Image</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG supported</p>
                  </div>
                )}
              </div>
              
              <button type="submit" className={`w-full font-bold py-3 rounded-xl transition-colors text-white ${editingItem ? 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30' : 'bg-slate-900 hover:bg-slate-800'}`}>
                {editingItem ? 'Save Changes' : 'Add to Menu'}
              </button>
            </form>
          </div>

          {/* Current Menu Items List */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Your Live Menu</h2>
            {items.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
                <p className="text-slate-400 font-medium text-lg">Your menu is empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map(item => (
                  <div key={item._id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:border-orange-200 transition-colors group">
                    <img 
                      src={item.image ? `${import.meta.env.VITE_API_URL}${item.image}` : 'https://via.placeholder.com/100'} 
                      alt={item.name} 
                      className="w-20 h-20 rounded-xl object-cover border border-slate-100"
                    />
                    <div className="flex-grow">
                      <h3 className="font-bold text-slate-900">{item.name}</h3>
                      <p className="text-orange-500 font-black">{item.price} ฿</p>
                      <span className="text-xs text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-md mt-1 inline-block">{item.category}</span>
                    </div>
                    
                    {/* TEXT-BASED EDIT & DELETE BUTTONS */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(item)} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors text-xs font-bold uppercase tracking-wider">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-xs font-bold uppercase tracking-wider">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default VendorMenu;