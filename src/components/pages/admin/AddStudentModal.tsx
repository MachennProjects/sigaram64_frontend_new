import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { createStudentAccount, saveBulkStudents } from '../../../firebase/firestoreService';

interface AddStudentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStudentModal({ onClose, onSuccess }: AddStudentModalProps) {
  const [tab, setTab] = useState<'single' | 'bulk'>('single');
  
  // Single State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');
  const [district, setDistrict] = useState('');
  
  // Bulk State
  const [bulkSchool, setBulkSchool] = useState('');
  const [bulkDistrict, setBulkDistrict] = useState('');
  const [bulkCount, setBulkCount] = useState<number>(10);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !email || !school || !district) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createStudentAccount({
        Name: name,
        UserName: name,
        Age: age,
        Email: email,
        SchoolName: school,
        SchoolDistrict: district
      }, password || undefined);
      setSuccessMsg(`Successfully created student: ${name}`);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create student");
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkSchool || !bulkDistrict || bulkCount < 1) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const shortSchool = bulkSchool.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toLowerCase();
      
      const payload = [];
      for (let i = 1; i <= bulkCount; i++) {
        const serial = i.toString().padStart(3, '0');
        const genEmail = `${shortSchool}${serial}@sigaram64.com`;
        // Generate a random secure password (min 8 chars)
        const genPass = Math.random().toString(36).slice(-5).toUpperCase() + "A1!";
        
        payload.push({
          data: {
            Name: `${bulkSchool} Student ${serial}`,
            UserName: `${bulkSchool} Student ${serial}`,
            Email: genEmail,
            SchoolName: bulkSchool,
            SchoolDistrict: bulkDistrict
          },
          password: genPass
        });
      }

      const created = await saveBulkStudents(payload);
      
      // Cache the result to allow re-downloading from Admin Dashboard
      localStorage.setItem('sigaram64_last_bulk', JSON.stringify({
        date: new Date().toISOString(),
        school: bulkSchool,
        users: created
      }));

      // Generate CSV
      let csv = "Name,Email,Password,School,District\n";
      created.forEach(u => {
        csv += `"${u.Name}","${u.Email}","${u.password}","${u.SchoolName}","${u.SchoolDistrict}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sigaram64_${shortSchool}_${bulkCount}_Students.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setSuccessMsg(`Successfully created ${created.length} students and downloaded CSV!`);
      setTimeout(() => {
        onSuccess();
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Failed to create students in bulk");
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-navy border border-divider rounded-2xl w-full max-w-md relative shadow-2xl animate-scaleIn flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-navy-mid/50">
          <h2 className="text-lg font-bold text-white">Add Student</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-divider">
          <button
            onClick={() => setTab('single')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === 'single' ? 'bg-gold text-navy' : 'text-gray-400 hover:text-white hover:bg-navy-mid'}`}
          >
            Single User
          </button>
          <button
            onClick={() => setTab('bulk')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === 'bulk' ? 'bg-gold text-navy' : 'text-gray-400 hover:text-white hover:bg-navy-mid'}`}
          >
            Bulk Create
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {successMsg ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-900/30 text-green-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-green-500/30">✓</div>
              <h3 className="text-white font-bold text-lg mb-2">Success</h3>
              <p className="text-green-400 text-sm">{successMsg}</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-900/30 border border-red-700/40 text-red-400 text-xs px-3 py-2 rounded-lg mb-4 text-center">
                  ⚠️ {error}
                </div>
              )}

              {tab === 'single' ? (
                <form onSubmit={handleSingleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Full Name *</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="input-field py-2 text-sm" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Age *</label>
                    <input type="number" required min="4" max="99" value={age} onChange={e => setAge(e.target.value)} className="input-field py-2 text-sm" placeholder="e.g. 10" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Email *</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field py-2 text-sm" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Password (Optional)</label>
                    <input type="text" value={password} onChange={e => setPassword(e.target.value)} className="input-field py-2 text-sm" placeholder="Auto-generated if empty" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">School Name *</label>
                    <input type="text" required value={school} onChange={e => setSchool(e.target.value)} className="input-field py-2 text-sm" placeholder="e.g. KV School" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">District *</label>
                    <select required value={district} onChange={e => setDistrict(e.target.value)} className="input-field py-2 text-sm appearance-none">
                      <option value="" disabled>Select District</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={loading} className={`w-full btn-gold py-2.5 mt-4 ${loading ? 'opacity-70 cursor-wait' : ''}`}>
                    {loading ? "Creating..." : "Create Student"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleBulkSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">School Name *</label>
                    <input type="text" required value={bulkSchool} onChange={e => setBulkSchool(e.target.value)} className="input-field py-2 text-sm" placeholder="e.g. Vidya Mandir" />
                    <p className="text-[10px] text-gray-500 mt-1">Emails will be: vidyamandir001@sigaram64.com</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">District *</label>
                    <select required value={bulkDistrict} onChange={e => setBulkDistrict(e.target.value)} className="input-field py-2 text-sm appearance-none">
                      <option value="" disabled>Select District</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Number of Students *</label>
                    <input type="number" required min="1" max="100" value={bulkCount} onChange={e => setBulkCount(parseInt(e.target.value))} className="input-field py-2 text-sm" />
                    <p className="text-[10px] text-gray-500 mt-1">Maximum 100 at a time</p>
                  </div>
                  <button type="submit" disabled={loading} className={`w-full btn-gold py-2.5 mt-4 ${loading ? 'opacity-70 cursor-wait' : ''}`}>
                    {loading ? "Generating & Saving..." : `Generate ${bulkCount} Students`}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
