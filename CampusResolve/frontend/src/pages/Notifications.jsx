import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/api/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading notifications...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Stay updated on all complaint and system events.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="text-xs sm:text-sm px-3.5 sm:px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors shadow-sm self-start sm:self-auto"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && <div className="p-3.5 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm">{error}</div>}

      <div className="space-y-3 sm:space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center p-8 sm:p-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <h3 className="text-base sm:text-lg font-medium text-slate-700">No notifications yet</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">When you receive updates, they will appear here.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif._id} 
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${notif.read ? 'bg-white border-slate-100 text-slate-700 shadow-sm' : 'bg-blue-50/50 border-blue-200 shadow-sm'}`}
            >
              <div className="flex flex-col min-[480px]:flex-row items-start justify-between gap-3">
                <div className="flex gap-3 sm:gap-4 min-w-0">
                  <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 ${notif.read ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-600'}`}>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className={`font-semibold text-sm sm:text-base ${notif.read ? 'text-slate-800' : 'text-blue-900'}`}>
                      {notif.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed break-words">
                      {notif.message}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-2 font-medium">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 self-end min-[480px]:self-start shrink-0">
                  {!notif.read && (
                    <button 
                      onClick={() => markAsRead(notif._id)}
                      className="p-1.5 sm:p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                      title="Mark as read"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notif._id)}
                    className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
