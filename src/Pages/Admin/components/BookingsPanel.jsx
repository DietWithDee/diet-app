import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Calendar, Phone, Mail, FileText, Clock, CheckCircle, Activity, ChevronDown, Target } from 'lucide-react';

const BookingsPanel = ({ showNotification }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, contacted, completed

  useEffect(() => {
    // Real-time listener on the bookings collection
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = [];
      snapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() });
      });
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      showNotification('error', 'Failed to load live bookings.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showNotification]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: newStatus });
      showNotification('success', `Booking marked as ${newStatus}.`);
    } catch (error) {
      console.error("Error updating status:", error);
      showNotification('error', 'Failed to update booking status.');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading recent bookings...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'contacted': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'pending': 
      default:
        return 'bg-amber-100 text-amber-800 border border-amber-200 shadow-sm';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-green-50">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-green-600" />
            Recent Bookings
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage client consultations and follow-ups.</p>
        </div>
        
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
          {['all', 'pending', 'contacted', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === f ? 'bg-white text-green-700 shadow shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {f} {f === 'pending' && bookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-md text-xs">{bookings.filter(b => b.status === 'pending').length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No {filter !== 'all' ? filter : ''} bookings found.</h3>
          <p className="text-gray-500">New paid bookings will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-green-50 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center transition-all hover:shadow-md">
              
              {/* Info Column */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h3 className="text-lg font-bold text-gray-900">{booking.name}</h3>
                  <div className="flex gap-2">
                    {booking.consultationType === 'followup' ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg uppercase tracking-wide border border-emerald-100">Follow-Up (₵400)</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg uppercase tracking-wide border border-blue-100">Initial (₵800)</span>
                    )}
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg uppercase tracking-wide border border-green-100 border-dashed">Paid ✅</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <a href={`mailto:${booking.email}`} className="hover:text-green-600 underline decoration-green-300">{booking.email}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <a href={`tel:${booking.phone}`} className="hover:text-green-600">{booking.phone}</a>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Clock size={16} className="text-gray-400" />
                    <span>Booked: {booking.createdAt ? booking.createdAt.toDate().toLocaleString() : 'Just now'}</span>
                  </div>
                </div>

                {/* Health snapshot toggle/preview */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-wrap gap-x-6 gap-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-indigo-400" />
                    <span className="text-xs font-bold text-gray-700">Goal:</span>
                    <span className="text-xs text-gray-600">{booking.userResults?.goal || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-rose-400" />
                    <span className="text-xs font-bold text-gray-700">BMI:</span>
                    <span className="text-xs text-gray-600">{booking.userResults?.bmi || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2 w-full mt-1 border-t border-gray-200 pt-2">
                    <FileText size={14} className="text-orange-400 mt-0.5" />
                    <span className="text-xs font-bold text-gray-700">Notes:</span>
                    <span className="text-xs text-gray-600 italic">"{booking.message || 'No additional notes provided.'}"</span>
                  </div>
                </div>
              </div>

              {/* Actions Column */}
              <div className="w-full md:w-auto flex flex-col items-end gap-3 min-w-[200px]">
                <div className="w-full relative">
                  <select
                    value={booking.status || 'pending'}
                    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                    className={`appearance-none w-full px-4 py-3 rounded-xl font-bold text-center cursor-pointer outline-none transition-colors ${getStatusColor(booking.status || 'pending')}`}
                  >
                    <option value="pending">⏳ Pending Contact</option>
                    <option value="contacted">📞 Contacted / Scheduled</option>
                    <option value="completed">✅ Consultation Completed</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                </div>
                
                <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider text-right w-full pr-2">
                  Ref: {booking.paystackReference?.substring(0,8)}...
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPanel;
