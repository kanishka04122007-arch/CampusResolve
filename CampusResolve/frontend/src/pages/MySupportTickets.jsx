import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiMessageSquare, FiClock, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import API_URL from '../config/api';

const MySupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/support/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTickets(res.data);
    } catch (err) {
      setError('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Open': return <span className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold bg-blue-100 text-blue-700">Open</span>;
      case 'In Progress': return <span className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold bg-amber-100 text-amber-700">In Progress</span>;
      case 'Resolved': return <span className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold bg-emerald-100 text-emerald-700">Resolved</span>;
      default: return <span className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Support Tickets</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">View your submitted support requests and admin replies.</p>
        </div>
        <button onClick={fetchTickets} className="self-end sm:self-auto p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition shadow-sm" aria-label="Refresh tickets">
          <FiRefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <div className="p-3.5 sm:p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm">{error}</div>}

      {loading && tickets.length === 0 ? (
        <div className="flex justify-center py-12">
          <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 sm:p-12 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FiMessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-slate-300" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">No tickets found</h3>
          <p className="text-slate-500 text-xs sm:text-sm">You haven't submitted any support requests yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {tickets.map(ticket => (
            <div key={ticket._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 flex flex-col h-full">
              <div className="flex flex-col min-[420px]:flex-row justify-between items-start gap-2 mb-3 sm:mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 block">
                    Ticket #{ticket._id.substring(ticket._id.length - 6)}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">{ticket.issueType}</h3>
                </div>
                {getStatusBadge(ticket.status)}
              </div>
              
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mb-3 sm:mb-4">
                <FiClock className="w-3.5 h-3.5" /> {formatDate(ticket.createdAt)}
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 sm:p-4 mb-4 flex-1">
                <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
              </div>

              {ticket.adminReply && (
                <div className="mt-auto border-t border-slate-100 pt-3 sm:pt-4">
                  <h4 className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FiCheckCircle className="w-4 h-4 text-emerald-500" /> Admin Reply
                  </h4>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 sm:p-4">
                    <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{ticket.adminReply}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySupportTickets;
