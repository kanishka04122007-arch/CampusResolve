import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiBell, FiBarChart2, FiActivity } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const roles = [
    { id: 'student', label: 'Student' },
    { id: 'coordinator', label: 'Coordinator' },
    { id: 'staff', label: 'Staff' },
    { id: 'admin', label: 'Admin' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Attempt login
    const res = await login(email, password);
    setLoading(false);
    
    if (res.success) {
      // For security/UX, ensure the selected role matches their actual role
      if (res.role.toLowerCase() !== selectedRole.toLowerCase()) {
        setError(`You are registered as a ${res.role}, not a ${selectedRole}. Please select the correct role or contact admin.`);
        // Note: Realistically, you might want to log them out here or just let them through and redirect. 
        // We'll enforce the redirect to their actual role to be safe, but show a warning if they picked wrong.
        // For now, let's just forcefully route them to their actual role.
      }
      navigate(`/${res.role.toLowerCase()}`);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden font-sans">
      
      {/* Left Side - Campus Illustration & Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 to-teal-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Abstract Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-300 opacity-20 rounded-full blur-3xl"></div>

        <div className={`z-10 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">CampusResolve</h1>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Smart Complaint <br/> Management System
          </h2>
          <p className="text-emerald-50 text-lg max-w-md opacity-90 leading-relaxed">
            Report issues, track progress, and get quick resolutions seamlessly across the campus.
          </p>
        </div>

        <div className={`z-10 space-y-6 transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div className="bg-white/20 p-3 rounded-lg"><FiActivity className="text-white text-xl" /></div>
            <div>
              <h3 className="text-white font-semibold">Complaint Tracking</h3>
              <p className="text-emerald-100 text-sm">Real-time status updates</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div className="bg-white/20 p-3 rounded-lg"><FiCheckCircle className="text-white text-xl" /></div>
            <div>
              <h3 className="text-white font-semibold">Fast Resolution</h3>
              <p className="text-emerald-100 text-sm">Automated routing to staff</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div className="bg-white/20 p-3 rounded-lg"><FiBell className="text-white text-xl" /></div>
            <div>
              <h3 className="text-white font-semibold">Real-Time Notifications</h3>
              <p className="text-emerald-100 text-sm">Instant alerts on updates</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div className="bg-white/20 p-3 rounded-lg"><FiBarChart2 className="text-white text-xl" /></div>
            <div>
              <h3 className="text-white font-semibold">Analytics Dashboard</h3>
              <p className="text-emerald-100 text-sm">Comprehensive reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className={`w-full max-w-md transition-all duration-700 delay-100 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back 👋</h2>
            <p className="text-slate-500">Please sign in to your account.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <a href="#" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition">Forgot Password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Select Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <label 
                      key={role.id} 
                      className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
                        selectedRole === role.id 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-slate-200 hover:border-emerald-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="role" 
                        value={role.id}
                        checked={selectedRole === role.id}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 focus:ring-2" 
                      />
                      <span className="text-sm font-medium">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2 mt-2"
              >
                {loading ? (
                  <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Processing...</>
                ) : 'Sign In to Dashboard'}
              </button>
            </form>
          </div>
          
          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#3B82F6] font-semibold hover:underline">
              Register Now
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;
