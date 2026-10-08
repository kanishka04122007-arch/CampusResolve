import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../config/api';

const roleTheme = {
  student:     { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', logo: 'bg-blue-600' },
  coordinator: { badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', logo: 'bg-indigo-600' },
  staff:       { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', logo: 'bg-emerald-600' },
  admin:       { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', logo: 'bg-rose-600' },
};

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => {
        setUnreadCount(res.data.filter(n => !n.read).length);
      })
      .catch(err => console.error("Error fetching notifications in Navbar", err));
    }
  }, [user, location.pathname]);

  const rawRole = String(user?.role || 'student').toLowerCase();
  const role = rawRole.includes('admin') ? 'admin' : rawRole.includes('coord') ? 'coordinator' : rawRole.includes('staff') ? 'staff' : 'student';
  const theme = roleTheme[role] || roleTheme.student;

  return (
    <header className="lg:hidden sticky top-0 z-30 w-full bg-[#1E293B] border-b border-slate-800 text-white shadow-md">
      <div className="flex items-center justify-between px-3.5 py-3 sm:px-5">
        {/* Left: Hamburger Button & Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            type="button"
            className="p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-slate-600"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to={`/${role}`} className="flex items-center gap-2 group">
            <div className={`w-8 h-8 ${theme.logo} rounded-lg flex items-center justify-center shadow-md transition-transform group-hover:scale-105`}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm sm:text-base tracking-tight">CampusResolve</span>
          </Link>
        </div>

        {/* Right: Role Badge, Notifications & Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`hidden min-[380px]:inline-flex px-2 py-0.5 text-[10px] sm:text-xs font-semibold capitalize rounded-md border ${theme.badge}`}>
            {role}
          </span>

          <Link
            to="/notifications"
            className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition focus:outline-none"
            aria-label="View notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-800 transition focus:outline-none"
            aria-label="View user profile"
          >
            {user?.profilePicture ? (
              <img
                src={`${API_URL}/${user.profilePicture}`}
                alt="Profile"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className={`w-7 h-7 sm:w-8 sm:h-8 ${theme.logo} rounded-full flex items-center justify-center text-white font-bold text-xs shadow`}>
                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
