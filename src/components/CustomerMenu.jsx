import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CustomerMenu = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  
  const [vendor, setVendor] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // Payment & Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('PromptPay');
  const [slipImage, setSlipImage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const vendorRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/${vendorId}`);
        const vendorData = await vendorRes.json();
        setVendor(vendorData);

        const itemsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/items/vendor/${vendorId}`);
        const itemsData = await itemsRes.json();
        setItems(itemsData);
      } catch (err) {
        console.error("Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuData();
  }, [vendorId]);

  const addToCart = (itemToAdd) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(cartItem => cartItem._id === itemToAdd._id);
      if (existingItem) {
        return prevCart.map(cartItem => 
          cartItem._id === itemToAdd._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { ...itemToAdd, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(cartItem => cartItem._id === itemId);
      if (existingItem.quantity === 1) {
        return prevCart.filter(cartItem => cartItem._id !== itemId);
      }
      return prevCart.map(cartItem => 
        cartItem._id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
      );
    });
  };

  const clearCart = () => setCart([]);
  const getItemQuantity = (itemId) => cart.find(c => c._id === itemId)?.quantity || 0;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const submitOrder = async (e) => {
    e.preventDefault();
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const customerId = savedUser?._id || savedUser?.id;

    if (!customerId) {
      alert("Error: You must be logged in.");
      return;
    }

    if (paymentMethod === 'PromptPay' && !slipImage) {
      alert("Please upload your payment slip to continue.");
      return;
    }

    const formattedItems = cart.map(item => ({
      itemId: item._id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    const formData = new FormData();
    formData.append('customerId', customerId);
    formData.append('vendorId', vendor._id);
    formData.append('totalAmount', cartTotal);
    formData.append('paymentMethod', paymentMethod);
    formData.append('items', JSON.stringify(formattedItems)); 
    
    if (slipImage) {
      formData.append('paymentSlip', slipImage);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/create`, {
        method: 'POST',
        body: formData, 
      });

      if (response.ok) {
        setShowPaymentModal(false);
        setShowSuccessModal(true);
        clearCart();
      } else {
        alert("Failed to place order.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Loading menu...</div>;
  if (!vendor) return <div className="text-center py-20 text-red-500 font-bold">Shop not found!</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans pb-40 relative">
      <div className="max-w-5xl mx-auto relative">
        <button onClick={() => navigate(-1)} className="text-slate-500 font-bold hover:text-slate-900 transition-colors mb-6 flex items-center uppercase text-xs tracking-widest">
          Back to Shops
        </button>

        <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-slate-100 mb-6">
          <div className="h-64 bg-slate-200 relative">
            <img src={vendor.image ? `${import.meta.env.VITE_API_URL}${vendor.image}` : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'} alt={vendor.shopName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
            <div className="absolute bottom-8 left-8 text-white">
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3 inline-block">{vendor.locationId}</span>
              <h1 className="text-5xl font-black mb-1">{vendor.shopName}</h1>
              <p className="text-slate-300 font-medium text-lg">{vendor.cuisineType} Cuisine</p>
            </div>
          </div>
        </div>

        {/* SHOP CLOSED BANNER */}
        {!vendor.isOpen && (
          <div className="bg-red-50 border border-red-100 p-6 rounded-3xl mb-8 text-center shadow-sm">
            <h3 className="text-red-600 font-black text-xl uppercase tracking-widest mb-1">Shop is Currently Closed</h3>
            <p className="text-red-500 font-medium">The vendor is not accepting new orders at this time. Please check back later.</p>
          </div>
        )}

        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
          <span>Menu</span>
          <span className="ml-3 bg-slate-200 text-slate-600 text-sm py-1 px-3 rounded-full">{items.length} items</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => {
            const qty = getItemQuantity(item._id);
            return (
              <div key={item._id} className={`bg-white p-4 rounded-3xl shadow-sm border transition-all flex items-center gap-6 ${qty > 0 ? 'border-orange-500 shadow-orange-100' : 'border-slate-100 hover:shadow-md'} ${!vendor.isOpen ? 'opacity-70 grayscale-[30%]' : ''}`}>
                <img src={item.image ? `${import.meta.env.VITE_API_URL}${item.image}` : 'https://via.placeholder.com/150'} alt={item.name} className="w-28 h-28 rounded-2xl object-cover" />
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
                    <span className="text-orange-500 font-black text-lg">{item.price} THB</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-md mt-1 inline-block">{item.category}</span>
                  
                  {/* CART LOGIC: Lock buttons if vendor is closed */}
                  {qty > 0 ? (
                    <div className="w-full mt-4 flex items-center justify-between bg-orange-50 rounded-xl p-1 border border-orange-200">
                      <button onClick={() => removeFromCart(item._id)} className="w-10 h-8 flex items-center justify-center bg-white text-orange-600 font-bold rounded-lg shadow-sm hover:bg-orange-100 transition-colors">-</button>
                      <span className="font-black text-orange-600">{qty}</span>
                      <button onClick={() => addToCart(item)} className="w-10 h-8 flex items-center justify-center bg-orange-500 text-white font-bold rounded-lg shadow-sm hover:bg-orange-600 transition-colors">+</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(item)} 
                      disabled={!vendor.isOpen}
                      className={`w-full mt-4 font-bold py-2 rounded-xl transition-colors flex justify-center items-center gap-2 active:scale-95 text-sm uppercase tracking-wider ${vendor.isOpen ? 'bg-slate-900 text-white hover:bg-orange-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                      {vendor.isOpen ? 'Add to Cart' : 'Closed'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Checkout Bar */}
      {cart.length > 0 && !showSuccessModal && vendor.isOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 animate-fade-in-up">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider">Your Order</p>
              <p className="text-2xl font-black text-slate-900">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} <span className="text-slate-300 mx-2">|</span> {cartTotal} THB
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={clearCart} className="px-6 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors uppercase text-sm tracking-wider">Clear</button>
              <button onClick={() => setShowPaymentModal(true)} className="px-10 py-4 rounded-2xl font-black text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1 uppercase text-sm tracking-widest">
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Payment Details</h3>
            
            <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setPaymentMethod('PromptPay')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${paymentMethod === 'PromptPay' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                PromptPay
              </button>
              <button 
                onClick={() => setPaymentMethod('Cash')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${paymentMethod === 'Cash' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Cash on Delivery
              </button>
            </div>

            <form onSubmit={submitOrder}>
              {paymentMethod === 'PromptPay' ? (
                <div className="space-y-4 mb-8">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Vendor QR Code</p>
                    
                    {/* NEW: Sized, centered, and rounded QR image! */}
                    <img 
                      src="/scan.JPG" 
                      alt="PromptPay QR Code" 
                      className="w-48 h-48 object-contain mx-auto rounded-xl mb-4 border border-slate-200 shadow-sm" 
                    />
                    
                    <p className="font-black text-slate-900 text-xl">{cartTotal} THB</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Upload Transfer Slip</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setSlipImage(e.target.files[0])}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center mb-8">
                  <p className="font-bold text-slate-700 mb-1">Pay with Cash</p>
                  <p className="text-sm text-slate-500">Please prepare exact change of <span className="font-black text-slate-900">{cartTotal} THB</span> when picking up your food.</p>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-5 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 w-1/3 text-sm uppercase tracking-wider">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-orange-500 transition-colors text-sm uppercase tracking-wider">Confirm Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFESSIONAL SUCCESS MODAL (Text Only) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full text-center shadow-2xl animate-fade-in-up border border-slate-100">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-green-500 font-black text-2xl uppercase tracking-widest">Done</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3">Order Received!</h3>
            <p className="text-slate-500 font-medium mb-8 text-lg">The vendor has your ticket and will start preparing your food shortly.</p>
            <button 
              onClick={() => navigate('/home')}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-orange-500 transition-colors uppercase text-sm tracking-widest"
            >
              Back to Campus Locations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;