import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../../config/api';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400 text-xs sm:text-sm">Loading dashboard overview...</div>;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-1 text-xs sm:text-sm">System Overview & Management</p>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard title="Total Students" value={stats.totalStudents} color="blue" />
            <StatCard title="Total Coordinators" value={stats.totalCoordinators} color="purple" />
            <StatCard title="Total Staff" value={stats.totalStaff} color="green" />
            <StatCard title="Active Users" value={stats.activeUsers} color="emerald" />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4">Complaints Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard title="Total Complaints" value={stats.totalComplaints} color="slate" />
              <StatCard title="Pending" value={stats.pendingComplaints} color="yellow" />
              <StatCard title="In Progress" value={stats.inProgressComplaints} color="orange" />
              <StatCard title="Resolved / Closed" value={stats.resolvedComplaints + stats.closedComplaints} color="teal" />
            </div>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4">System Monitoring</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Today's Complaints</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1 sm:mt-2">{stats.todaysComplaints}</p>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Recently Closed</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1 sm:mt-2">{stats.recentlyClosed}</p>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Total Registered Users</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1 sm:mt-2">{stats.totalRegisteredUsers}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    green: 'bg-green-100 text-green-600 border-green-200',
    emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
    orange: 'bg-orange-100 text-orange-600 border-orange-200',
    teal: 'bg-teal-100 text-teal-600 border-teal-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl shadow-sm border flex items-center gap-3.5 sm:gap-4 bg-white transition hover:-translate-y-1 hover:shadow-md duration-200">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold shrink-0 ${colorMap[color]}`}>
        {value}
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

export default AdminOverview;
