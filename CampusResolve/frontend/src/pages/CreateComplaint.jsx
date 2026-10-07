import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiInfo, FiUploadCloud, FiFileText } from 'react-icons/fi';

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
      await axios.post('http://localhost:5000/api/complaints', data, {
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
    <div className="bg-slate-50 min-h-screen -m-6 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Create Complaint</h1>
          <p className="text-slate-500 mt-2 text-sm">Fill in the details below to submit your complaint. We'll ensure it reaches the right department.</p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-3xl mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">1</div>
            <span className="font-semibold text-blue-600 text-sm">Details</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200 mx-4"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">2</div>
            <span className="font-semibold text-slate-400 text-sm">Attachment</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200 mx-4"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">3</div>
            <span className="font-semibold text-slate-400 text-sm">Submit</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form Area (2 Columns Wide) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <FiFileText className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-bold text-slate-800">Complaint Details</h2>
              </div>

              {success && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2"><FiCheckCircle className="w-5 h-5" />{success}</div>}
              {errors.api && <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">{errors.api}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Title & Priority Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Complaint Title <span className="text-red-500">*</span></label>
                    <input type="text" name="title" value={form.title} onChange={handleChange}
                      placeholder="e.g. Projector not working in Lab 3"
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 focus:bg-white'}`} />
                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority <span className="text-red-500">*</span></label>
                    <select name="priority" value={form.priority} onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                      {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                    </select>
                    {form.priority && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${form.priority === 'Critical' ? 'bg-rose-500' : form.priority === 'High' ? 'bg-orange-500' : form.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${priorityBadge[form.priority]}`}>{form.priority} Level</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Department Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department <span className="text-red-500">*</span></label>
                    <select name="complaintDepartment" value={form.complaintDepartment} onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <select className="w-full px-4 py-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                      <option>Infrastructure</option>
                      <option>Academics</option>
                      <option>Management</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={5}
                    placeholder="Describe the issue in detail. Include location, time, and any other relevant information..."
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 focus:bg-white'}`} />
                  <div className="flex justify-between items-center mt-1">
                    {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : <span></span>}
                    <p className="text-xs text-slate-400 font-medium">{form.description.length}/1000</p>
                  </div>
                </div>

                {/* Location */}
                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location <span className="text-slate-400 font-normal">(Optional)</span></label>
                   <input type="text" placeholder="e.g. Block A, Room 101" className="w-full px-4 py-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Attachment <span className="text-slate-400 font-normal">(Optional – Images or PDF)</span></label>
                  <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50/50 transition-all group flex flex-col items-center justify-center cursor-pointer relative">
                    <input type="file" onChange={(e) => setAttachment(e.target.files[0])} accept="image/*,application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <FiUploadCloud className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-slate-700"><span className="text-blue-600">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">Supports: JPG, PNG, PDF (Max 10MB)</p>
                    {attachment && <div className="mt-4 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-2"><FiCheckCircle /> {attachment.name}</div>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setForm({ title:'', description:'', complaintDepartment:'Hostel', priority:'Medium' })} className="px-6 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition text-sm flex items-center gap-2">
                    Reset
                  </button>

                  <button type="submit" disabled={loading}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-200/50 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                    {loading ? (
                      <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting...</>
                    ) : (
                      <> 🚀 Submit Complaint </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Side Info Panels */}
          <div className="space-y-6">
            
            {/* Guidelines Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FiInfo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Complaint Guidelines</h3>
                  <p className="text-xs text-slate-500">Follow these for faster resolution.</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 font-medium">
                <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" /> Enter a clear and concise title.</li>
                <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" /> Select the correct department.</li>
                <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" /> Provide detailed description of the issue.</li>
                <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" /> Attach supporting evidence (photos).</li>
                <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" /> Mention exact location if applicable.</li>
              </ul>
            </div>

            {/* Resolution Time Card */}
            <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                  <FiClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900 text-base">Average Resolution Time</h3>
                  <p className="text-xs text-emerald-600">Expected time based on department.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
                  <span className="text-sm font-medium text-emerald-800 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Hostel</span>
                  <span className="text-sm font-bold text-emerald-900">2 Days</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
                  <span className="text-sm font-medium text-emerald-800 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Library</span>
                  <span className="text-sm font-bold text-emerald-900">1 Day</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
                  <span className="text-sm font-medium text-emerald-800 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> IT Support</span>
                  <span className="text-sm font-bold text-emerald-900">4 Hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-emerald-800 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Others</span>
                  <span className="text-sm font-bold text-emerald-900">2-3 Days</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateComplaint;
