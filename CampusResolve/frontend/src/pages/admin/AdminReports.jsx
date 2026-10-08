import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import API_URL from '../../config/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(res.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !reportData) return <div className="p-12 text-center text-slate-400 text-xs sm:text-sm">Loading reports & analytics...</div>;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlyChartData = {
    labels: reportData.monthlyComplaints.map(m => `${monthNames[m._id.month - 1]} ${m._id.year}`),
    datasets: [
      {
        label: 'Complaints',
        data: reportData.monthlyComplaints.map(m => m.count),
        borderColor: 'rgba(37, 99, 235, 1)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const priorityChartData = {
    labels: reportData.priorityDistribution.map(p => p._id),
    datasets: [
      {
        data: reportData.priorityDistribution.map(p => p.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // High - Red
          'rgba(245, 158, 11, 0.8)',  // Medium - Orange
          'rgba(59, 130, 246, 0.8)'   // Low - Blue
        ],
        borderWidth: 0
      }
    ]
  };

  const resolutionChartData = {
    labels: reportData.statusDistribution.map(s => s._id),
    datasets: [
      {
        label: 'Status Distribution',
        data: reportData.statusDistribution.map(s => s.count),
        backgroundColor: [
          'rgba(203, 213, 225, 0.8)', // Submitted
          'rgba(250, 204, 21, 0.8)',  // Assigned / Progress
          'rgba(52, 211, 153, 0.8)',  // Resolved
          'rgba(148, 163, 184, 0.8)', // Closed
          'rgba(99, 102, 241, 0.8)'
        ],
      }
    ]
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1 text-xs sm:text-sm">Deep dive into system metrics and resolution rates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Monthly Trend (Line Chart) */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">Monthly Complaint Trend</h2>
          <div className="h-60 sm:h-64 relative min-w-0">
            <Line data={monthlyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Priority Distribution (Pie Chart) */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">Priority Distribution</h2>
          <div className="h-60 sm:h-64 flex justify-center relative min-w-0">
            <Pie data={priorityChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Resolution Rate (Bar Chart) */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">Overall Status Distribution</h2>
          <div className="h-64 sm:h-72 relative min-w-0">
            <Bar 
              data={resolutionChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }} 
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminReports;
