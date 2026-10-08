import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiInfo, FiUploadCloud, FiFileText } from 'react-icons/fi';
import API_URL from '../config/api';

const DEPARTMENTS = ['Hostel','Library','Transport','Academic','Examination','Placement','Infrastructure','IT Support', 'Water Facility', 'Electrical Maintenance', 'Cleaning Service'];
const PRIORITIES = ['Low','Medium','High','Critical'];

const priorityBadge = { 
  Low: 'bg-emerald-100 text-emerald-700', 
  Medium: 'bg-amber-100 text-amber-700', 
  High: 'bg-orange-100 text-orange-700', 
  Critical: 'bg-rose-100 text-rose-700 font-bold' 
};

const CreateComplaint = () => {
  const [form, setForm] = useState({ title:'', description:'', complaintDepartment:'Hostel', priority:'Medium' });
  const [attachment, setAttachment] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (form.title.trim().length < 5) e.title = 'Title must be at least 5 characters.';
    if (form.description.trim().length < 10) e.description = 'Description must be at least 10 characters.';
    return e;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const token = localStorage.getItem('token');
    const data = new FormData();
    Object.entries(form).forEach(([k,v]) => data.append(k, v));
    if (attachment) data.append('attachment', attachment);

    try {
      await axios.post(`${API_URL}/api/complaints`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('✅ Complaint submitted successfully! Redirecting...');
      setTimeout(() => navigate('/complaints/my'), 1500);
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Submission failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Create Complaint</h1>
        <p className="text-slate-500 mt-1 text-xs sm:text-sm">Fill in the details below to submit your complaint. We'll ensure it reaches the right department.</p>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-3xl flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shrink-0">1</div>
          <span className="font-semibold text-blue-600 text-xs sm:text-sm">Details</span>
        </div>
        <div className="flex-1 h-0.5 bg-slate-200 mx-2 sm:mx-4"></div>
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">2</div>
          <span className="font-semibold text-slate-400 text-xs sm:text-sm">Attachment</span>
        </div>
        <div className="flex-1 h-0.5 bg-slate-200 mx-2 sm:mx-4"></div>
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">3</div>
          <span className="font-semibold text-slate-400 text-xs sm:text-sm">Submit</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8">
            
            <div className="flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100">
              <FiFileText className="w-5 h-5 text-blue-500 shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Complaint Details</h2>
            </div>

            {success && <div className="mb-5 sm:mb-6 p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2"><FiCheckCircle className="w-5 h-5 shrink-0" />{success}</div>}
            {errors.api && <div className="mb-5 sm:mb-6 p-3.5 sm:p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm">{errors.api}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              
              {/* Title & Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Complaint Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={form.title} onChange={handleChange}
                    placeholder="e.g. Projector not working in Lab 3"
                    className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 focus:bg-white'}`} />
                  {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Priority <span className="text-red-500">*</span></label>
                  <select name="priority" value={form.priority} onChange={handleChange}
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                  {form.priority && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${form.priority === 'Critical' ? 'bg-rose-500' : form.priority === 'High' ? 'bg-orange-500' : form.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                      <span className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold tracking-wide uppercase ${priorityBadge[form.priority]}`}>{form.priority} Level</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Department Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Department <span className="text-red-500">*</span></label>
                  <select name="complaintDepartment" value={form.complaintDepartment} onChange={handleChange}
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Category <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <select className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                    <option>Infrastructure</option>
                    <option>Academics</option>
                    <option>Management</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5}
                  placeholder="Describe the issue in detail. Include location, time, and any other relevant information..."
                  className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 focus:bg-white'}`} />
                <div className="flex justify-between items-center mt-1">
                  {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : <span></span>}
                  <p className="text-xs text-slate-400 font-medium">{form.description.length}/1000</p>
                </div>
              </div>

              {/* Location */}
              <div>
                 <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Location <span className="text-slate-400 font-normal">(Optional)</span></label>
                 <input type="text" placeholder="e.g. Block A, Room 101" className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Attachment <span className="text-slate-400 font-normal">(Optional – Images or PDF)</span></label>
                <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl p-4 sm:p-6 hover:border-blue-400 hover:bg-blue-50/50 transition-all group flex flex-col items-center justify-center cursor-pointer relative text-center">
                  <input type="file" onChange={(e) => setAttachment(e.target.files[0])} accept="image/*,application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <FiUploadCloud className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs sm:text-sm font-medium text-slate-700"><span className="text-blue-600">Click to upload</span> or drag and drop</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Supports: JPG, PNG, PDF (Max 10MB)</p>
                  {attachment && <div className="mt-3 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-2 max-w-full truncate"><FiCheckCircle className="shrink-0" /> <span className="truncate">{attachment.name}</span></div>}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setForm({ title:'', description:'', complaintDepartment:'Hostel', priority:'Medium' })} className="px-5 py-2.5 sm:py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition text-xs sm:text-sm flex items-center justify-center gap-2">
                  Reset
                </button>

                <button type="submit" disabled={loading}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-200/50 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm">
                  {loading ? (
                    <><svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting...</>
                  ) : (
                    <> 🚀 Submit Complaint </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Side Info Panels */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Guidelines Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <FiInfo className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">Complaint Guidelines</h3>
                <p className="text-[11px] sm:text-xs text-slate-500">Follow these for faster resolution.</p>
              </div>
            </div>
            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-600 font-medium">
              <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> Enter a clear and concise title.</li>
              <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> Select the correct department.</li>
              <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> Provide detailed description of the issue.</li>
              <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> Attach supporting evidence (photos).</li>
              <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> Mention exact location if applicable.</li>
            </ul>
          </div>

          {/* Resolution Time Card */}
          <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-900 text-sm sm:text-base">Average Resolution Time</h3>
                <p className="text-[11px] sm:text-xs text-emerald-600">Expected time based on department.</p>
              </div>
            </div>
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
                <span className="text-xs sm:text-sm font-medium text-emerald-800 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Hostel</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-900">2 Days</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
                <span className="text-xs sm:text-sm font-medium text-emerald-800 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Library</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-900">1 Day</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
                <span className="text-xs sm:text-sm font-medium text-emerald-800 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> IT Support</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-900">4 Hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-medium text-emerald-800 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Others</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-900">2-3 Days</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateComplaint;
