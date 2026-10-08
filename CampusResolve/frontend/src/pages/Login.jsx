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
      if (res.role.toLowerCase() !== selectedRole.toLowerCase()) {
        setError(`You are registered as a ${res.role}, not a ${selectedRole}. Please select the correct role or contact admin.`);
      }
      navigate(`/${res.role.toLowerCase()}`);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row overflow-x-hidden font-sans">
      
      {/* Mobile Top Header (Visible only on < lg) */}
      <div className="lg:hidden flex items-center justify-center gap-3 pt-6 pb-2 px-4">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">CampusResolve</h1>
          <p className="text-[11px] text-slate-500 font-medium">Smart Complaint Management</p>
        </div>
      </div>

      {/* Left Side - Campus Illustration & Features (Hidden on mobile/tablet, flex on lg+) */}
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

        <div className={`z-10 space-y-4 xl:space-y-6 transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative flex-1">
        <div className={`w-full max-w-md transition-all duration-700 delay-100 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1.5 sm:mb-2">Welcome Back 👋</h2>
            <p className="text-xs sm:text-sm text-slate-500">Please sign in to your account.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-5 sm:p-8 border border-slate-100">
            {error && (
              <div className="mb-5 sm:mb-6 p-3.5 sm:p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 sm:gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700">Password</label>
                  <a href="#" className="text-[11px] sm:text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition">Forgot Password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Select Role</label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {roles.map((role) => (
                    <label 
                      key={role.id} 
                      className={`flex items-center gap-2 p-2.5 sm:p-3 border rounded-xl cursor-pointer transition-all ${
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
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 focus:ring-2 shrink-0" 
                      />
                      <span className="text-xs sm:text-sm font-medium truncate">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2 mt-2 text-sm sm:text-base"
              >
                {loading ? (
                  <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Processing...</>
                ) : 'Sign In to Dashboard'}
              </button>
            </form>
          </div>
          
          <p className="text-center text-xs sm:text-sm text-slate-500 mt-6 sm:mt-8">
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
