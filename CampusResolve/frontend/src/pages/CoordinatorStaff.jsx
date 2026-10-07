import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CoordinatorStaff = () => {
  const [staffList, setStaffList]     = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading]         = useState(true);
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [staffRes, complaintsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/coordinator/staff', { headers }),
          axios.get('http://localhost:5000/api/coordinator/complaints', { headers }),
        ]);
        setStaffList(staffRes.data);
        setAllComplaints(complaintsRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  // Calculate workload per staff member
  const getWorkload = (staffId) => {
    const assigned = allComplaints.filter(
      c => c.assignedTo && c.assignedTo._id?.toString() === staffId
    );
    return {
      total:      assigned.length,
      active:     assigned.filter(c => ['Assigned','In Progress'].includes(c.status)).length,
      resolved:   assigned.filter(c => ['Resolved','Closed'].includes(c.status)).length,
    };
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
          <p className="text-slate-500 mt-1">View staff members and their current complaint workload.</p>
        </div>
        <Link to="/coordinator"
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
          ← Dashboard
        </Link>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Staff',         value: staffList.length,                                                           color: 'bg-blue-50 border-blue-200 text-blue-700',   dot: 'bg-blue-400' },
          { label: 'Active Work',          value: allComplaints.filter(c => ['Assigned','In Progress'].includes(c.status)).length, color: 'bg-orange-50 border-orange-200 text-orange-700', dot: 'bg-orange-400' },
          { label: 'Resolved This Dept',   value: allComplaints.filter(c => ['Resolved','Closed'].includes(c.status)).length,      color: 'bg-green-50 border-green-200 text-green-700',   dot: 'bg-green-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-5 py-4 flex items-center gap-4 ${s.color}`}>
            <div className={`w-3 h-3 rounded-full ${s.dot}`} />
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium opacity-80">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16 text-slate-400">
            <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Loading staff...
          </div>
        ) : staffList.length === 0 ? (
          <div className="text-center p-16 text-slate-400">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-medium">No staff members found.</p>
            <p className="text-sm mt-1">Register staff accounts to assign complaints.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Staff Member</th>
                  <th className="px-6 py-3 text-left font-semibold">Department</th>
                  <th className="px-6 py-3 text-left font-semibold">Active Complaints</th>
                  <th className="px-6 py-3 text-left font-semibold">Resolved</th>
                  <th className="px-6 py-3 text-left font-semibold">Workload</th>
                  <th className="px-6 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staffList.map(s => {
                  const wl = getWorkload(s._id);
                  const busyPct = wl.total > 0 ? Math.round((wl.active / Math.max(wl.total, 1)) * 100) : 0;
                  const barColor = busyPct >= 80 ? 'bg-red-400' : busyPct >= 50 ? 'bg-orange-400' : 'bg-green-400';

                  return (
                    <tr key={s._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {s.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{s.name}</p>
                            <p className="text-xs text-slate-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{s.department || <span className="italic text-slate-300">—</span>}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold text-lg ${wl.active > 0 ? 'text-orange-600' : 'text-slate-300'}`}>
                          {wl.active}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">active</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-lg text-green-600">{wl.resolved}</span>
                        <span className="text-xs text-slate-400 ml-1">done</span>
                      </td>
                      <td className="px-6 py-4 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${busyPct}%` }} />
                          </div>
                          <span className="text-xs text-slate-400 w-8 text-right">{busyPct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/coordinator/complaints?assignTo=${s._id}`}
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition">
                          Assign
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordinatorStaff;
