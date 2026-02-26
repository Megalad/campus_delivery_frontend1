import React, { useState } from 'react';

const Login = ({ onSwitch, onLoginSuccess }) => {
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    const loginData = {
      email: e.target.email.value,
      password: e.target.password.value
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      // ✅ Always parse once, so error branch can use message safely
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setErrorMessage(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login connection error:", error);
      setErrorMessage("Could not connect to the server. Is the backend running?");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-orange-400 opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl z-10 border border-white/50">
        
        <div>
          <h2 className="mt-2 text-center text-4xl font-extrabold tracking-tight text-slate-900">
            CampusOne <span className="text-orange-600">Delivery</span>
          </h2>
          <p className="mt-4 text-center text-sm text-slate-500">
            Welcome back! Sign in to get your campus meals delivered.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-600 text-sm font-semibold p-3 rounded-lg text-center border border-red-100">
            {errorMessage}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="email-address" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3.5 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/50 focus:bg-white"
                placeholder="student@au.edu"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3.5 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/50 focus:bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded cursor-pointer transition-colors"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-200 shadow-lg transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <button 
              type="button"
              onClick={onSwitch}
              className="font-semibold text-orange-600 hover:text-orange-500 transition-colors"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;