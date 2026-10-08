import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiMessageSquare, FiSearch, FiRefreshCw, FiX, FiCheck } from 'react-icons/fi';
import API_URL from '../config/api';

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/support`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    setReplyLoading(true);
    try {
      const res = await axios.put(`${API_URL}/api/support/${selectedTicket._id}/reply`, 
        { adminReply: replyText, status: 'Resolved' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTickets(tickets.map(t => t._id === selectedTicket._id ? res.data : t));
      setSelectedTicket(null);
      setReplyText('');
    } catch (err) {
      console.error('Failed to reply', err);
    } finally {
      setReplyLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await axios.put(`${API_URL}/api/support/${id}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTickets(tickets.map(t => t._id === id ? res.data : t));
      if (selectedTicket && selectedTicket._id === id) {
        setSelectedTicket(res.data);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter !== 'All' && t.status !== filter) return false;
    if (searchTerm && !t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) && !t.issueType.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Open': return <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-blue-100 text-blue-700">Open</span>;
      case 'In Progress': return <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-amber-100 text-amber-700">In Progress</span>;
      case 'Resolved': return <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-100 text-emerald-700">Resolved</span>;
      default: return <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Support Requests</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Manage and resolve student support tickets.</p>
        </div>
        <button onClick={fetchTickets} className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm self-start sm:self-auto">
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[500px] md:min-h-[600px]">
        {/* Left List Pane */}
        <div className={`w-full ${selectedTicket ? 'md:w-5/12 lg:w-1/3 border-r border-slate-100 hidden md:flex' : 'md:w-full'} flex-col bg-slate-50/50`}>
          <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-white space-y-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search students or issues..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
              {['All', 'Open', 'In Progress', 'Resolved'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${filter === f ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 sm:p-12 text-center text-slate-500 text-xs sm:text-sm">No support requests found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredTickets.map(ticket => (
                  <button
                    key={ticket._id}
                    onClick={() => { setSelectedTicket(ticket); setReplyText(ticket.adminReply || ''); }}
                    className={`w-full text-left p-3.5 sm:p-4 transition-colors hover:bg-blue-50/50 ${selectedTicket?._id === ticket._id ? 'bg-blue-50/80 border-l-4 border-blue-500' : 'border-l-4 border-transparent bg-white'}`}
                  >
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className="font-bold text-slate-800 text-xs sm:text-sm truncate pr-1">{ticket.studentName}</span>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-600 mb-1">{ticket.issueType}</p>
                    <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">{ticket.message}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        {selectedTicket ? (
          <div className="flex-1 flex flex-col bg-white">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start gap-3">
              <div className="w-full sm:w-auto">
                <button onClick={() => setSelectedTicket(null)} className="md:hidden text-blue-600 text-xs sm:text-sm font-semibold mb-3 flex items-center gap-1">
                  &larr; Back to list
                </button>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-base sm:text-xl font-bold text-slate-800">{selectedTicket.issueType}</h2>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Submitted by <span className="font-semibold text-slate-700">{selectedTicket.studentName}</span> on {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 self-start sm:self-auto">
                {selectedTicket.status === 'Open' && (
                  <button onClick={() => updateStatus(selectedTicket._id, 'In Progress')} className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition">
                    Mark In Progress
                  </button>
                )}
                {selectedTicket.status !== 'Resolved' && (
                  <button onClick={() => updateStatus(selectedTicket._id, 'Resolved')} className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition">
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
              <div className="mb-6 sm:mb-8">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">Student Message</h4>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 sm:p-5">
                  <p className="text-slate-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">Admin Reply</h4>
                {selectedTicket.status === 'Resolved' && selectedTicket.adminReply ? (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 sm:p-5">
                    <p className="text-slate-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.adminReply}</p>
                  </div>
                ) : (
                  <form onSubmit={handleReply} className="space-y-3 sm:space-y-4">
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply to the student here..."
                      rows={4}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                    />
                    <div className="flex justify-end">
                      <button 
                        type="submit" 
                        disabled={replyLoading || !replyText.trim()}
                        className="w-full sm:w-auto px-5 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-md shadow-blue-200 disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {replyLoading ? 'Sending...' : <><FiCheck className="w-4 h-4" /> Send Reply & Resolve</>}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50 flex-col text-slate-400 p-8 text-center">
            <FiMessageSquare className="w-16 h-16 mb-4 text-slate-200" />
            <h3 className="text-lg font-bold text-slate-500 mb-1">No Ticket Selected</h3>
            <p className="text-sm">Select a support ticket from the list to view details and reply.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupportTickets;
