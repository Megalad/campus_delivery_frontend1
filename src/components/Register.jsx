import React, { useState, useEffect } from 'react';

const Register = ({ onSwitch }) => {  
  const [role, setRole] = useState('Customer');
  const [dbLocations, setDbLocations] = useState([]);

  // Fetch locations from MongoDB when the component loads
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`);
        if (response.ok) {
          const data = await response.json();
          setDbLocations(data);
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };
    fetchLocations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userData = {
      fullname: e.target.fullname.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      password: e.target.password.value,
      location: e.target.location.value,
      role: role 
    };

    console.log("SENDING:", userData);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful! Please sign in.");
        if (typeof onSwitch === 'function') onSwitch();
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error connection to backend:", error);
      alert("Could not connect to the server.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-orange-400 opacity-20 blur-3xl"></div>
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl z-10 border border-white/50">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-slate-900">
            Create Account
          </h2>
          <p className="mt-4 text-center text-sm text-slate-500 font-medium">
            Join CampusOne Delivery today.
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole('Customer')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${
                role === 'Customer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Student / Staff
            </button>
            <button
              type="button"
              onClick={() => setRole('Vendor')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${
                role === 'Vendor' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Shop Owner
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input name="fullname" type="text" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none bg-white/50" placeholder="John Doe" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input name="email" type="email" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none bg-white/50" placeholder="user@domain.com" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
              <input name="phone" type="tel" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none bg-white/50" placeholder="08X-XXX-XXXX" />
            </div>

            {/* ONLY SHOW FACULTY DROPDOWN IF CUSTOMER */}
            {role === 'Customer' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Faculty</label>
                <select 
                  name="location" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none bg-white/50 appearance-none cursor-pointer"
                >
                  <option value="MSME">Martin de Tours School of Management</option>
                  <option value="ARTS">Theodore Maria School of Arts</option>
                  <option value="COMMARTS">Communication Arts</option>
                  <option value="VME">Engineering</option>
                  <option value="VMS">Science and Technology</option>
                  <option value="ARCH">Architecture and Design</option>
                  <option value="LAW">Law</option>
                  <option value="NURSING">Nursing Science</option>
                  <option value="BIOTECH">Biotechnology</option>
                  <option value="MUSIC">Music</option>
                </select>
              </div>
            )}

            {/* HIDDEN INPUT FOR VENDOR LOCATION SO BACKEND DOESN'T BREAK */}
            {role === 'Vendor' && (
               <input type="hidden" name="location" value="PENDING_SETUP" />
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input name="password" type="password" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none bg-white/50" placeholder="••••••••" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full flex justify-center py-3.5 px-4 text-sm font-bold rounded-xl text-white transition-all duration-200 shadow-lg transform hover:-translate-y-0.5 ${
                role === 'Vendor' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {role === 'Vendor' ? 'Register as Shop Owner' : 'Register as Customer'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <button type="button" onClick={onSwitch} className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;