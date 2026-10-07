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

  if (loading) return <div className="p-8">Loading dashboard overview...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-1">System Overview & Management</p>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Students" value={stats.totalStudents} color="blue" />
            <StatCard title="Total Coordinators" value={stats.totalCoordinators} color="purple" />
            <StatCard title="Total Staff" value={stats.totalStaff} color="green" />
            <StatCard title="Active Users" value={stats.activeUsers} color="emerald" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-4">Complaints Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Complaints" value={stats.totalComplaints} color="slate" />
            <StatCard title="Pending" value={stats.pendingComplaints} color="yellow" />
            <StatCard title="In Progress" value={stats.inProgressComplaints} color="orange" />
            <StatCard title="Resolved / Closed" value={stats.resolvedComplaints + stats.closedComplaints} color="teal" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-4">System Monitoring</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500 font-medium">Today's Complaints</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stats.todaysComplaints}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500 font-medium">Recently Closed</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stats.recentlyClosed}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500 font-medium">Total Registered Users</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stats.totalRegisteredUsers}</p>
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
    <div className={`p-6 rounded-2xl shadow-sm border flex items-center gap-4 bg-white transition hover:-translate-y-1 hover:shadow-md duration-200`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${colorMap[color]}`}>
        {value}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

export default AdminOverview;
