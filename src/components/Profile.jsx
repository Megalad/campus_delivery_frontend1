import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '', locationId: '' });
  const [dbLocations, setDbLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const userId = user?._id || user?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            locationId: data.locationId || ''
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`);
        if (response.ok) setDbLocations(await response.json());
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };

    if (userId) {
      fetchProfile();
      fetchLocations();
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local storage and global state so the header name changes instantly!
        const updatedUser = { ...user, name: data.user.name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage('Server connection error.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Account Settings</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your personal information</p>
          </div>
          <button onClick={() => navigate(-1)} className="text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors">
            &larr; Go Back
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registered Email</p>
              <p className="font-bold text-slate-900">{user.email}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Type</p>
              <p className="font-black text-orange-500 uppercase tracking-wider">{user.role}</p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none font-bold text-slate-700" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none font-bold text-slate-700" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                {user.role === 'Vendor' ? 'Shop Location' : 'Faculty'}
              </label>
              <select 
                value={formData.locationId}
                onChange={(e) => setFormData({...formData, locationId: e.target.value})}
                disabled={user.role === 'Vendor'} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none font-bold text-slate-700 cursor-pointer"
              >
                {user.role === 'Vendor' ? (
                  <>
                    {dbLocations.length === 0 && <option value="">Loading locations...</option>}
                    {dbLocations.map((loc) => (
                      <option key={loc._id} value={loc.locationName}>
                        {loc.locationName}
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    <option value="MSME">Martin de Tours School of Management and Economics</option>
                    <option value="ARTS">Theodore Maria School of Arts</option>
                    <option value="COMMARTS">Albert Laurence School of Communication Arts</option>
                    <option value="VME">Vincent Mary School of Engineering</option>
                    <option value="VMS">Vincent Mary School of Science and Technology</option>
                    <option value="ARCH">Montfort del Rosario School of Architecture and Design</option>
                    <option value="LAW">Thomas Aquinas School of Law</option>
                    <option value="NURSING">Bernadette de Lourdes School of Nursing Science</option>
                    <option value="BIOTECH">Theophane Venard School of Biotechnology</option>
                    <option value="MUSIC">Louis Nobiron School of Music</option>
                  </>
                )}
              </select>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full py-4 rounded-xl font-black text-white bg-slate-900 hover:bg-orange-500 transition-colors uppercase tracking-widest text-sm">
                Save Changes
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Profile;