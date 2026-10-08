import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../config/api';

const statusColors = {
  'Assigned':    'bg-indigo-100 text-indigo-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  'Resolved':    'bg-green-100 text-green-800',
  'Closed':      'bg-slate-100 text-slate-700',
};

const priorityColors = {
  Low: 'text-green-600', Medium: 'text-yellow-600',
  High: 'text-orange-600', Critical: 'text-red-700 font-bold'
};

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm flex items-center gap-4 sm:gap-5">
    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-800">{value}</p>
      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const StaffDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, assigned: 0, inProgress: 0, resolved: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          axios.get(`${API_URL}/api/staff/stats`, { headers }),
          axios.get(`${API_URL}/api/staff/complaints`, { headers }),
        ]);
        setStats(statsRes.data);
        setRecent(complaintsRes.data.slice(0, 5));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Staff Dashboard</h1>
        <p className="text-slate-500 mt-1 text-xs sm:text-sm">
          Welcome back, <span className="font-semibold text-green-600">{user?.name}</span>.
          {user?.department && <> · <span className="text-slate-600">{user.department}</span></>}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard label="Total Assigned"  value={stats.total}      color="bg-blue-100"   icon="📋" />
        <StatCard label="Pending Start"   value={stats.assigned}   color="bg-indigo-100" icon="🔔" sub="Needs attention" />
        <StatCard label="In Progress"     value={stats.inProgress} color="bg-orange-100" icon="⚙️" />
        <StatCard label="Resolved"        value={stats.resolved}   color="bg-green-100"  icon="✅" />
      </div>

      {/* Quick actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/staff/complaints"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-green-200 transition text-center">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          View All Complaints
        </Link>
      </div>

      {/* Recent complaints table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm sm:text-base">Recent Assigned Complaints</h2>
          <Link to="/staff/complaints" className="text-xs sm:text-sm text-green-600 hover:underline font-medium">View all →</Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 sm:p-16 text-slate-400">
            <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Loading...
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center p-12 sm:p-16 text-slate-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium text-xs sm:text-sm">No complaints assigned yet.</p>
            <p className="text-xs text-slate-400 mt-1">The coordinator will assign complaints to you soon.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap min-w-[550px]">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] sm:text-xs">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-semibold">Student</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-semibold">Priority</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-semibold">Assigned On</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recent.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 sm:px-6 py-3.5 font-medium text-slate-800 max-w-[180px] truncate">{c.title}</td>
                    <td className="px-4 sm:px-6 py-3.5 text-slate-500 text-xs">{c.createdBy?.name || 'N/A'}</td>
                    <td className={`px-4 sm:px-6 py-3.5 font-semibold text-xs ${priorityColors[c.priority]}`}>{c.priority}</td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[c.status] || 'bg-slate-100 text-slate-700'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-slate-400 text-xs">
                      {c.assignedAt ? new Date(c.assignedAt).toLocaleDateString() : new Date(c.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <Link to={`/staff/complaints/${c._id}`}
                        className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition inline-block">
                        Work
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
