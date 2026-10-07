import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const DEPARTMENTS = ['Hostel','Library','Transport','Academic','Examination','Placement','Infrastructure','IT Support'];
const PRIORITIES = ['Low','Medium','High','Critical'];

const EditComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'', description:'', complaintDepartment:'Hostel', priority:'Medium' });
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [fetchError, setFetchError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const c = res.data;
        if (c.status !== 'Submitted') {
          setFetchError('This complaint can no longer be edited because it has already been reviewed.');
        } else {
          setForm({ title: c.title, description: c.description, complaintDepartment: c.complaintDepartment, priority: c.priority });
        }
      } catch (e) {
        setFetchError(e.response?.data?.message || 'Failed to load complaint.');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.trim().length < 5) e.title = 'Title must be at least 5 characters.';
    if (!form.description.trim() || form.description.trim().length < 10) e.description = 'Description must be at least 10 characters.';
    return e;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (attachment) data.append('attachment', attachment);

    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      navigate('/complaints/my');
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Update failed. Try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-24 text-slate-400">
      <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      Loading...
    </div>
  );

  if (fetchError) return (
    <div className="flex flex-col items-center justify-center p-24 text-slate-400">
      <p className="text-4xl mb-3">🚫</p>
      <p className="font-medium text-red-500 text-center max-w-sm">{fetchError}</p>
      <button onClick={() => navigate('/complaints/my')} className="mt-4 text-blue-600 hover:underline text-sm">← Back to My Complaints</button>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Edit Complaint</h1>
        <p className="text-slate-500 mt-1">Update your complaint details below. Only editable while status is <span className="font-semibold text-yellow-600">Submitted</span>.</p>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        {errors.api && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{errors.api}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Complaint Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={form.title} onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Department & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Complaint Department <span className="text-red-500">*</span></label>
              <select name="complaintDepartment" value={form.complaintDepartment} onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority <span className="text-red-500">*</span></label>
              <select name="priority" value={form.priority} onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={5}
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Replace Attachment <span className="text-slate-400 font-normal">(Optional)</span></label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-blue-400 transition">
              <input type="file" onChange={(e) => setAttachment(e.target.files[0])} accept="image/*,application/pdf"
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {attachment && <p className="mt-2 text-xs text-slate-500">📎 Selected: {attachment.name}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/complaints/my')}
              className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {saving
                ? <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Saving...</>
                : <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Save Changes
                  </>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditComplaint;
