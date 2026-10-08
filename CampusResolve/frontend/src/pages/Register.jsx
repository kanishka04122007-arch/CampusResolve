import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const ACADEMIC_DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'AI & DS', 'CSBS'];
const COMPLAINT_DEPARTMENTS = ['Hostel','Library','Transport','Academic','Examination','Placement','Infrastructure','IT Support', 'Water Facility', 'Electrical Maintenance', 'Cleaning Service'];
const ROLES = ['student', 'coordinator', 'staff']; // admin usually created via seeder

const Register = () => {
  const [formData, setFormData] = useState({ name:'', email:'', password:'', role:'student', department:'CSE', phone:'', registerNumber:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role') {
      const isStudent = value === 'student';
      setFormData({ 
        ...formData, 
        [name]: value, 
        department: isStudent ? ACADEMIC_DEPARTMENTS[0] : COMPLAINT_DEPARTMENTS[0] 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await register(formData);
    setLoading(false);
    if (res.success) {
      navigate('/login');
    } else {
      setError(res.message);
    }
  };

  const currentDepartments = formData.role === 'student' ? ACADEMIC_DEPARTMENTS : COMPLAINT_DEPARTMENTS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl mb-3 sm:mb-4 shadow-lg">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Create Account</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Join CampusResolve today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 border border-slate-100">
          {error && (
            <div className="mb-4 p-3.5 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Kanishka" required
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="1234567890" required
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            {formData.role === 'student' && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Register Number</label>
                <input type="text" name="registerNumber" value={formData.registerNumber} onChange={handleChange} placeholder="e.g., 20CS01" required={formData.role === 'student'}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              </div>
            )}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min. 6 characters" required
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Role</label>
                <select name="role" value={formData.role} onChange={handleChange}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition capitalize bg-white">
                  {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Department</label>
                <select name="department" value={formData.department} onChange={handleChange}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white truncate">
                  {currentDepartments.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm sm:text-base">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-xs sm:text-sm text-slate-500 mt-5 sm:mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
