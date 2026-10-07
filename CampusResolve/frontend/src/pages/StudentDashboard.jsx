import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FiFileText, FiClock, FiSettings, FiCheckCircle, FiXCircle, FiBell, FiPlus, FiMessageSquare } from 'react-icons/fi';
import ContactAdminModal from '../components/ContactAdminModal';
import API_URL from '../config/api';

const statusColors = {
  'Submitted':    'bg-blue-100 text-blue-800 border border-blue-200',
  'Under Review': 'bg-purple-100 text-purple-800 border border-purple-200',
  'Assigned':     'bg-indigo-100 text-indigo-800 border border-indigo-200',
  'In Progress':  'bg-amber-100 text-amber-800 border border-amber-200',
  'Resolved':     'bg-emerald-100 text-emerald-800 border border-emerald-200',
  'Closed':       'bg-slate-100 text-slate-700 border border-slate-200',
  'Rejected':     'bg-rose-100 text-rose-800 border border-rose-200',
};

const priorityColors = {
  'Low':      'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'Medium':   'bg-amber-50 text-amber-600 border border-amber-200',
  'High':     'bg-rose-50 text-rose-600 border border-rose-200',
  'Critical': 'bg-red-100 text-red-700 border border-red-300 font-bold',
};

const chartColors = {
  Submitted: '#3b82f6',
  Assigned: '#6366f1',
  'In Progress': '#f59e0b',
  Resolved: '#10b981',
};

const StatCard = ({ label, value, icon, gradient, trend }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 shadow-sm border border-slate-100 bg-white group hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}>
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 bg-gradient-to-br ${gradient} transition-transform group-hover:scale-110`}></div>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-sm font-semibold text-slate-500 mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        {trend && <p className="text-xs font-medium text-emerald-500 mt-2 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          {trend}
        </p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${gradient} shadow-sm`}>
        {icon}
      </div>
    </div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0 });
  const [myComplaints, setMyComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, myRes, notifRes] = await Promise.all([
          axios.get(`${API_URL}/api/complaints/stats`, { headers }),
          axios.get(`${API_URL}/api/complaints/my`, { headers }),
          axios.get(`${API_URL}/api/notifications`, { headers }),
        ]);
        setStats(statsRes.data || { total: 0, pending: 0, resolved: 0, rejected: 0 });
        setMyComplaints(Array.isArray(myRes.data) ? myRes.data : []);
        setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
        setMyComplaints([]);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Compute status overview for the chart
  const statusOverview = [
    { name: 'Submitted', count: myComplaints.filter(c => c.status === 'Submitted').length },
    { name: 'Assigned', count: myComplaints.filter(c => c.status === 'Assigned').length },
    { name: 'In Progress', count: myComplaints.filter(c => c.status === 'In Progress').length },
    { name: 'Resolved', count: myComplaints.filter(c => c.status === 'Resolved').length },
  ];

  const recentComplaints = myComplaints.slice(0, 5);
  const recentNotifications = notifications.slice(0, 5);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getRelativeTime = (dateString) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) {
      const hoursDifference = Math.round((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60));
      if (hoursDifference === 0) return 'Just now';
      return rtf.format(hoursDifference, 'hour');
    }
    return rtf.format(daysDifference, 'day');
  };

  return (
    <div className="bg-slate-50 min-h-screen -m-6 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              Good morning, {user?.name?.split(' ')[0] || 'Student'} <span className="text-3xl">👋</span>
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">Track your complaints and updates in real-time.</p>
          </div>
          <Link to="/complaints/new"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-200/50 transition-all duration-300 transform hover:-translate-y-0.5">
            <FiPlus className="w-5 h-5" />
            Create Complaint
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Complaints" value={stats.total} gradient="from-blue-500 to-indigo-600" icon={<FiFileText className="w-6 h-6" />} trend="+2 this week" />
          <StatCard label="Pending" value={stats.pending} gradient="from-amber-400 to-orange-500" icon={<FiClock className="w-6 h-6" />} trend="Requires attention" />
          <StatCard label="In Progress" value={myComplaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length} gradient="from-purple-500 to-pink-500" icon={<FiSettings className="w-6 h-6" />} />
          <StatCard label="Resolved" value={stats.resolved} gradient="from-emerald-400 to-teal-500" icon={<FiCheckCircle className="w-6 h-6" />} trend="Completed" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Chart Area */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="font-bold text-slate-800 text-lg">Complaint Distribution</h2>
               </div>
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={statusOverview} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                     <Tooltip 
                       cursor={{fill: '#f1f5f9'}}
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     />
                     <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={40}>
                       {statusOverview.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={chartColors[entry.name] || '#94a3b8'} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Recent Complaints Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                <h2 className="font-bold text-slate-800 text-lg">Recent Complaints</h2>
                <Link to="/complaints/my" className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                  View all <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center p-16 text-slate-400">
                  <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                </div>
              ) : recentComplaints.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiFileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 mb-1">No complaints submitted yet</h3>
                  <p className="text-slate-500 text-sm mb-4">You haven't raised any issues. Everything looks good!</p>
                  <Link to="/complaints/new" className="text-blue-600 hover:underline text-sm font-semibold">Submit your first complaint</Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-lg">ID / Title</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 rounded-tr-lg">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentComplaints.map(c => (
                        <tr key={c._id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-400 font-mono mb-0.5">#{c._id.substring(c._id.length - 6).toUpperCase()}</span>
                              <Link to={`/complaints/${c._id}`} className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-[200px]">
                                {c.title}
                              </Link>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">
                            {c.complaintDepartment || c.department}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${priorityColors[c.priority] || 'bg-slate-100 text-slate-700'}`}>
                              {c.priority || 'Medium'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${statusColors[c.status] || 'bg-slate-100 text-slate-700'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                            {formatDate(c.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            
            {/* Contact Admin Block */}
            <div className="bg-slate-900 rounded-2xl shadow-sm p-6 text-white text-center relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition"></div>
               <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition"></div>
               <div className="relative z-10">
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                   <FiMessageSquare className="w-6 h-6 text-white" />
                 </div>
                 <h3 className="font-bold text-lg mb-2">Need Support?</h3>
                 <p className="text-sm text-slate-300 mb-5">Having account issues or technical problems? Let us know.</p>
                 <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-sm font-bold transition w-full shadow-lg">
                   Contact Admin
                 </button>
               </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <FiBell className="w-5 h-5 text-slate-400" />
                  Recent Updates
                </h2>
                <Link to="/notifications" className="text-xs text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-md">View all</Link>
              </div>
              
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiBell className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No new notifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentNotifications.map(n => (
                    <div key={n._id} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                         {n.message.toLowerCase().includes('resolved') ? (
                           <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                         ) : n.message.toLowerCase().includes('assigned') ? (
                           <FiSettings className="w-5 h-5 text-indigo-500" />
                         ) : (
                           <FiBell className="w-5 h-5 text-blue-500" />
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 mb-0.5">{n.title || 'Notification'}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-2 uppercase tracking-wider">{getRelativeTime(n.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      
      <ContactAdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default StudentDashboard;
