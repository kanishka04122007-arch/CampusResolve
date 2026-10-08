import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import API_URL from '../../config/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDepartments = () => {
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentStats();
  }, []);

  const fetchDepartmentStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartmentData(res.data.departmentWise);
    } catch (error) {
      console.error('Error fetching department stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: departmentData.map(d => d._id),
    datasets: [
      {
        label: 'Pending',
        data: departmentData.map(d => d.pending),
        backgroundColor: 'rgba(250, 204, 21, 0.7)',
        borderColor: 'rgba(250, 204, 21, 1)',
        borderWidth: 1,
      },
      {
        label: 'Resolved',
        data: departmentData.map(d => d.resolved),
        backgroundColor: 'rgba(52, 211, 153, 0.7)',
        borderColor: 'rgba(52, 211, 153, 1)',
        borderWidth: 1,
      },
      {
        label: 'Closed',
        data: departmentData.map(d => d.closed),
        backgroundColor: 'rgba(148, 163, 184, 0.7)',
        borderColor: 'rgba(148, 163, 184, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true },
      y: { stacked: true }
    },
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400 text-xs sm:text-sm">Loading department analytics...</div>;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Department Analytics</h1>
        <p className="text-slate-500 mt-1 text-xs sm:text-sm">Complaint statistics across all campus departments</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">Complaint Status by Department</h2>
        <div className="h-72 sm:h-96 min-w-0 relative">
          <Bar options={chartOptions} data={chartData} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left whitespace-nowrap text-xs sm:text-sm min-w-[550px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] sm:text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-4 sm:px-6 py-3.5">Department Name</th>
                <th className="px-4 sm:px-6 py-3.5">Total Complaints</th>
                <th className="px-4 sm:px-6 py-3.5">Pending</th>
                <th className="px-4 sm:px-6 py-3.5">Resolved</th>
                <th className="px-4 sm:px-6 py-3.5">Closed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentData.map((d, index) => (
                <tr key={index} className="hover:bg-slate-50 transition">
                  <td className="px-4 sm:px-6 py-3.5 font-medium text-slate-800">{d._id}</td>
                  <td className="px-4 sm:px-6 py-3.5 font-bold text-slate-700">{d.count}</td>
                  <td className="px-4 sm:px-6 py-3.5 text-yellow-600 font-semibold">{d.pending}</td>
                  <td className="px-4 sm:px-6 py-3.5 text-emerald-600 font-semibold">{d.resolved}</td>
                  <td className="px-4 sm:px-6 py-3.5 text-slate-500 font-semibold">{d.closed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDepartments;
