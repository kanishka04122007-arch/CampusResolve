import React, { useState } from 'react';
import axios from 'axios';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import API_URL from '../config/api';

const ContactAdminModal = ({ isOpen, onClose }) => {
  const [issueType, setIssueType] = useState('Account Problem');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Message is required');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/support`, 
        { issueType, message },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
        setIssueType('Account Problem');
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit support request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">Support Request</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <FiCheckCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1">Ticket Submitted</h4>
              <p className="text-xs sm:text-sm text-slate-500">The admin will review your request shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {error && <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs sm:text-sm">{error}</div>}
              
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Issue Type</label>
                <select 
                  value={issueType} 
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition"
                >
                  <option>Account Problem</option>
                  <option>Complaint Problem</option>
                  <option>Technical Issue</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Message</label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
              >
                {loading ? (
                  <><svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting...</>
                ) : (
                  'Submit Ticket'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactAdminModal;
