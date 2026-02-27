import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import CustomerHome from './components/CustomerHome';
import VendorShopRegistration from './components/VendorShopRegistration';
import VendorList from './components/VendorList';
import VendorDashboard from './components/VendorDashboard';
import VendorMenu from './components/VendorMenu';
import CustomerMenu from './components/CustomerMenu';
import CustomerOrders from './components/CustomerOrders';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';

function AppRoutes({ user, setUser, hasShop, setHasShop, handleLogout }) {
  const navigate = useNavigate();

  // ✅ Stable navigation callbacks (no full page reload)
  const handleSwitchToLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleSwitchToRegister = useCallback(() => {
    navigate('/register');
  }, [navigate]);

  const handleVendorComplete = useCallback(() => {
    setHasShop(true);
  }, [setHasShop]);

  return (
    <>
      {user && (
        <div className="bg-slate-900 text-white text-right py-2 px-6 text-sm flex justify-between items-center border-b border-slate-800">
          <span className="text-slate-400 italic font-bold">CampusOne Delivery</span>
          <div className="flex items-center gap-4">
            <span className="font-medium mr-2">
              Hello, <span className="text-orange-400 font-bold">{user.name}</span>
            </span>

            {/* ADMIN LINK */}
            {user.role === 'admin' && (
              <Link to="/admin-dashboard" className="text-white hover:text-orange-400 font-bold uppercase tracking-wider text-[10px] border-r border-slate-700 pr-4">
                System Admin
              </Link>
            )}

            {/* TRACK ORDERS LINK (FIXED SPACING HERE!) */}
            {(user.role === 'Customer' || user.role === 'admin') && (
              <Link to="/my-orders" className="text-white hover:text-orange-400 font-bold uppercase tracking-wider text-[10px] border-r border-slate-700 pr-4">
                Track Orders
              </Link>
            )}
            
            {/* PROFILE SETTINGS LINK */}
            <Link to="/profile" className="text-white hover:text-orange-400 font-bold uppercase tracking-wider text-[10px]">
              Settings
            </Link>

            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-red-600 px-3 py-1 rounded-lg transition-colors text-[10px] uppercase font-bold tracking-wider ml-2"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <Routes>
        {/* --- AUTH ROUTES --- */}
        <Route
          path="/login"
          element={!user ? (
            <Login
              onLoginSuccess={(loggedInUser) => {
                setUser(loggedInUser);
                // NEW: Instantly update hasShop state so there is no delay!
                setHasShop(loggedInUser.hasShop || false); 
              }}
              onSwitch={handleSwitchToRegister}
            />
          ) : (
            user?.role === 'admin' ? <Navigate to="/admin-dashboard" replace /> :
            user?.role === 'Vendor' ? <Navigate to="/vendor-register" replace /> :
            <Navigate to="/home" replace />
          )}
        />

        <Route
          path="/register"
          element={!user ? (
            <Register onSwitch={handleSwitchToLogin} />
          ) : (
            <Navigate to="/home" replace />
          )}
        />

        {/* --- CUSTOMER & ADMIN SHARED ROUTES --- */}
        <Route
          path="/home"
          element={(user && user?.role !== 'Vendor') ? <CustomerHome /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/vendors/:locationId"
          element={(user && user?.role !== 'Vendor') ? <VendorList /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/shop/:vendorId"
          element={(user && user?.role !== 'Vendor') ? <CustomerMenu /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/my-orders"
          element={(user && user?.role !== 'Vendor') ? <CustomerOrders /> : <Navigate to="/login" replace />}
        />

        {/* --- VENDOR ROUTES --- */}
        <Route
          path="/vendor-register"
          element={
            user?.role === 'Vendor' ? (
              hasShop ? <Navigate to="/vendor-dashboard" replace /> : (
                <VendorShopRegistration
                  userId={user._id || user.id}
                  onComplete={handleVendorComplete}
                />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/vendor-dashboard"
          element={user?.role === 'Vendor' ? <VendorDashboard user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/vendor-menu"
          element={user?.role === 'Vendor' ? <VendorMenu user={user} /> : <Navigate to="/login" replace />}
        />

        {/* --- ADMIN EXCLUSIVE ROUTES --- */}
        <Route
          path="/admin-dashboard"
          element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" replace />}
        />

        {/* --- CATCH-ALL REDIRECT --- */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // NEW: Read hasShop directly from local storage so we don't flash the setup page
  const [hasShop, setHasShop] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return parsed.hasShop || false;
    }
    return false;
  });

  useEffect(() => {
    const verifyVendorShop = async () => {
      // NEW: Check for capital V
      if (user?.role === 'Vendor' || user?.role === 'vendor') {
        try {
          // NEW: Replaced hardcoded "my-server-1" with dynamic VITE_API_URL
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/my-shop/${user._id || user.id}`);
          if (response.ok) {
            setHasShop(true);
            
            // Silently update local storage to keep it fresh
            const updatedUser = { ...user, hasShop: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } else {
            setHasShop(false);
          }
        } catch (error) {
          console.error("Error verifying shop:", error);
        }
      }
    };

    // Only run the fetch check if we don't already know they have a shop
    if (!hasShop) {
      verifyVendorShop();
    }
  }, [user]);

  const handleLogout = useCallback(() => {
    setUser(null);
    setHasShop(false);
    localStorage.removeItem('user');
  }, []);

  return (
    <Router>
      <AppRoutes
        user={user}
        setUser={setUser}
        hasShop={hasShop}
        setHasShop={setHasShop}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;