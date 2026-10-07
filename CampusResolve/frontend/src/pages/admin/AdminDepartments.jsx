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
      const res = await axios.get('http://localhost:5000/api/admin/reports', {
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
    scales: {
      x: { stacked: true },
      y: { stacked: true }
    },
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    }
  };

  if (loading) return <div className="p-8">Loading department analytics...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Department Analytics</h1>
        <p className="text-slate-500 mt-1">Complaint statistics across all campus departments</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Complaint Status by Department</h2>
        <div className="h-96">
          <Bar options={chartOptions} data={chartData} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Department Name</th>
                <th className="px-6 py-4">Total Complaints</th>
                <th className="px-6 py-4">Pending</th>
                <th className="px-6 py-4">Resolved</th>
                <th className="px-6 py-4">Closed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentData.map((d, index) => (
                <tr key={index} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">{d._id}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{d.count}</td>
                  <td className="px-6 py-4 text-yellow-600 font-semibold">{d.pending}</td>
                  <td className="px-6 py-4 text-emerald-600 font-semibold">{d.resolved}</td>
                  <td className="px-6 py-4 text-slate-500 font-semibold">{d.closed}</td>
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
