import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../config/api';

// ── Role color themes ───────────────────────────────────────────────────────
const roleTheme = {
  student:     { active: 'bg-blue-600 text-white', badge: 'text-blue-300 bg-blue-900/50', logo: 'bg-blue-600' },
  coordinator: { active: 'bg-indigo-600 text-white', badge: 'text-indigo-300 bg-indigo-900/50', logo: 'bg-indigo-600' },
  staff:       { active: 'bg-emerald-600 text-white', badge: 'text-emerald-300 bg-emerald-900/50', logo: 'bg-emerald-600' },
  admin:       { active: 'bg-rose-600 text-white', badge: 'text-rose-300 bg-rose-900/50', logo: 'bg-rose-600' },
};

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
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
      .catch(err => console.error("Error fetching notifications", err));
    }
  }, [user, location.pathname]); // re-fetch on navigation

  const handleLogout = () => { logout(); navigate('/login'); };

  const rawRole = String(user?.role || 'student').toLowerCase();
  const role = rawRole.includes('admin') ? 'admin' : rawRole.includes('coord') ? 'coordinator' : rawRole.includes('staff') ? 'staff' : 'student';
  const theme = roleTheme[role] || roleTheme.student;

  const getLinks = (role) => {
    const commonLinks = [
      {
        to: '/notifications', label: 'Notifications',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
        badgeCount: unreadCount
      },
      {
        to: '/profile', label: 'Profile',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      }
    ];

    if (role === 'coordinator') {
      return [
        {
          to: '/coordinator', label: 'Dashboard',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        },
        {
          to: '/coordinator/complaints', label: 'All Complaints',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        },
        {
          to: '/coordinator/staff', label: 'Manage Staff',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        },
        ...commonLinks
      ];
    } else if (role === 'staff') {
      return [
        {
          to: '/staff', label: 'Dashboard',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        },
        {
          to: '/staff/complaints', label: 'My Complaints',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        },
        ...commonLinks
      ];
    } else if (role === 'admin') {
      return [
        {
          to: '/admin', label: 'Dashboard',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        },
        {
          to: '/admin/support', label: 'Support Requests',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        },
        {
          to: '/admin/users', label: 'Users',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        },
        {
          to: '/admin/complaints', label: 'Complaints',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        },
        ...commonLinks
      ];
    } else {
      return [
        {
          to: '/student', label: 'Dashboard',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        },
        {
          to: '/complaints/new', label: 'Create Complaint',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        },
        {
          to: '/support/my', label: 'My Support Tickets',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        },
        {
          to: '/complaints/my', label: 'My Complaints',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        },
        ...commonLinks
      ];
    }
  };

  const links = getLinks(role);

  // Exact match for root dashboard routes, prefix match for sub-routes
  const rootRoutes = ['/coordinator', '/student', '/staff', '/admin'];
  const isActive = (to) => {
    if (rootRoutes.includes(to)) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="w-64 min-h-screen bg-[#1E293B] border-r border-slate-800 flex flex-col shadow-xl z-10 relative">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${theme.logo} rounded-xl flex items-center justify-center shadow-lg`}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-white text-[15px] tracking-wide">CampusResolve</p>
            <p className="text-[10px] text-slate-400">Your Voice • Our Priority</p>
          </div>
        </div>
      </div>

      {/* User Info - Dark Theme Redesign */}
      <div className="px-6 py-6 border-b border-slate-800/50 bg-[#162032]">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 group">
            {user?.profilePicture ? (
              <img src={`${API_URL}/${user.profilePicture}`} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-lg border-[3px] border-[#1E293B] transition-transform group-hover:scale-105" />
            ) : (
              <div className={`w-20 h-20 ${theme.logo} rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg border-[3px] border-[#1E293B] transition-transform group-hover:scale-105`}>
                {user?.name?.substring(0,2).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-1 right-1.5 w-4 h-4 bg-emerald-500 border-2 border-[#162032] rounded-full" title="Online"></span>
          </div>
          
          <p className="text-base font-bold text-white truncate w-full mb-0.5">{user?.name}</p>
          <p className="text-xs font-medium text-slate-400 capitalize mb-2">{role}</p>
          
          {user?.department && (
            <div className="bg-slate-800/80 border border-slate-700/50 px-3 py-1.5 rounded-lg w-full mb-2">
              <p className="text-[11px] font-semibold text-blue-300 truncate text-center uppercase tracking-wider">
                {user.department} Department
              </p>
            </div>
          )}
          
          {role === 'student' && user?.studentId && (
            <p className="text-[11px] text-slate-400">
              Student ID: <span className="font-semibold text-slate-300">{user.studentId || "22CSE017"}</span>
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {links.map(link => {
          const active = isActive(link.to);
          return (
            <Link key={link.to} to={link.to}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active 
                  ? theme.active 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}>
              <div className="flex items-center gap-3">
                {link.icon}
                {link.label}
              </div>
              {link.badgeCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-rose-500 rounded-full shadow-sm">
                  {link.badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-5 border-t border-slate-800/50">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
