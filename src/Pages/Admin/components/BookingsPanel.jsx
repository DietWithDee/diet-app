import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Calendar, Phone, Mail, FileText, Clock, CheckCircle, Activity, ChevronDown, Target, AlertTriangle } from 'lucide-react';
import { getBookingStatus, setBookingStatus } from '../../../firebaseBookingUtils';

const BookingsPanel = ({ showNotification }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, contacted, completed
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  useEffect(() => {
    const fetchStatus = async () => {
      const result = await getBookingStatus();
      if (result.success) {
        setIsBookingOpen(result.isOpen);
      }
    };
    fetchStatus();
  }, []);

  const handleToggleClick = () => {
    if (isBookingOpen) {
      // If opening -> closing, show confirmation
      setShowConfirmModal(true);
    } else {
      // If closing -> opening, do it immediately
      updateBookingStatus(true);
    }
  };

  const updateBookingStatus = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const result = await setBookingStatus(newStatus);
      if (result.success) {
        setIsBookingOpen(newStatus);
        showNotification('success', `Bookings are now ${newStatus ? 'open' : 'closed'}.`);
      } else {
        showNotification('error', 'Failed to update booking status.');
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      showNotification('error', 'An error occurred.');
    } finally {
      setIsUpdatingStatus(false);
      setShowConfirmModal(false);
    }
  };

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
      
      {/* Booking Status Toggle Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBookingOpen ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Booking Status</h3>
            <p className="text-xs text-gray-500">Enable or disable new client bookings</p>
          </div>
        </div>

        <button 
          onClick={handleToggleClick}
          disabled={isUpdatingStatus}
          className={`relative inline-flex items-center h-9 rounded-full w-16 transition-colors focus:outline-none ${isBookingOpen ? 'bg-green-500' : 'bg-gray-300'} ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span className="sr-only">Toggle Booking Status</span>
          <span
            className={`${
              isBookingOpen ? 'translate-x-8' : 'translate-x-1'
            } inline-block w-7 h-7 transform bg-white rounded-full transition-transform shadow-sm`}
          />
          <span className={`absolute ${isBookingOpen ? 'left-2' : 'right-2'} text-[10px] font-black text-white uppercase`}>
            {isBookingOpen ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Close Bookings?</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              This will prevent new clients from booking consultations on the website. You can re-open them at any time.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateBookingStatus(false)}
                disabled={isUpdatingStatus}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Updating...' : 'Yes, Close Bookings'}
              </button>
            </div>
          </div>
        </div>
      )}
      
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
              {f} 
              {f === 'pending' && bookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-md text-[10px]">{bookings.filter(b => b.status === 'pending').length}</span>
              )}
              {f === 'contacted' && bookings.filter(b => b.status === 'contacted').length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-md text-[10px]">{bookings.filter(b => b.status === 'contacted').length}</span>
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
