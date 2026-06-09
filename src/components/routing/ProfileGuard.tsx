import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateUser } from '../../firebase/firestoreService';

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [district, setDistrict] = useState('');
  const [school, setSchool] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const districts = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
    'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam',
    'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram',
    'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur',
    'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
    'Tiruppur', 'Tirupattur', 'Tiruvallur', 'Tiruvarur', 'Tiruvannamalai',
    'Vellore', 'Virudhunagar', 'Viluppuram', 'Kanniyakumari'
  ];

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    // Only apply to students
    if (user.role !== 'student') {
      setNeedsProfile(false);
      setLoading(false);
      return;
    }

    // Check if required fields exist
    const hasName = !!user.name || !!user.Name || !!user.UserName;
    const hasAge = !!user.Age;
    const hasDistrict = !!user.SchoolDistrict || !!user.district;
    const hasSchool = !!user.SchoolName || !!user.school;

    if (!hasName || !hasAge || !hasDistrict || !hasSchool) {
      setNeedsProfile(true);
      // Pre-fill existing fields if any
      if (hasName) setName(user.name || user.Name || user.UserName || '');
      if (hasAge) setAge(user.Age || '');
      if (hasDistrict) setDistrict(user.SchoolDistrict || user.district || '');
      if (hasSchool) setSchool(user.SchoolName || user.school || '');
    } else {
      setNeedsProfile(false);
    }
    
    setLoading(false);
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !district || !school) {
      setError("Please fill in all fields.");
      return;
    }
    
    setSaving(true);
    setError('');
    
    const userId = user?.id;
    if (!userId) {
      setError("User session not found.");
      return;
    }

    try {
      await updateUser(userId, {
        Name: name,
        UserName: name,
        Age: age,
        SchoolDistrict: district,
        SchoolName: school
      });
      // Refresh user context so the app knows we have the details
      await refreshUser();
      setNeedsProfile(false);
    } catch (err: any) {
      setError("Failed to save details: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-gold animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (needsProfile) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-navy border border-divider rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />
          
          <div className="text-center mb-6">
            <span className="text-4xl block mb-2">👋</span>
            <h1 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
            <p className="text-gray-400 text-sm">
              We need a few details before you can start playing and learning.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="Enter your full name"
                className="w-full bg-navy-mid border border-divider rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => { setAge(e.target.value); setError(''); }}
                placeholder="Enter your age"
                min="4"
                max="99"
                className="w-full bg-navy-mid border border-divider rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-semibold">District</label>
              <select
                value={district}
                onChange={e => { setDistrict(e.target.value); setError(''); }}
                className="w-full bg-navy-mid border border-divider rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\' fill=\'none\' stroke=\'%23a1a1aa\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M3 5l3 3 3-3\'/%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat' }}
              >
                <option value="" disabled>Select your District</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-semibold">School Name</label>
              <input
                type="text"
                value={school}
                onChange={e => { setSchool(e.target.value); setError(''); }}
                placeholder="Enter your school name"
                className="w-full bg-navy-mid border border-divider rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700/40 rounded-xl px-3 py-2 mt-2">
                <p className="text-red-400 text-xs text-center">⚠ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className={`w-full mt-6 bg-gold text-navy font-bold py-3 rounded-xl transition-all hover:bg-gold-light active:scale-[0.98] ${saving ? "opacity-70 cursor-wait" : ""}`}
            >
              {saving ? "Saving..." : "Save Details & Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
