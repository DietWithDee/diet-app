import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  Clock, 
  CheckCircle, 
  Activity, 
  ChevronDown, 
  Target, 
  AlertTriangle,
  MessageCircle,
  ExternalLink,
  Flame,
  UserCheck,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ShieldCheck,
  CreditCard,
  Settings,
  X,
  Plus,
  Trash2,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  Edit3,
  Filter
} from 'lucide-react';
import { 
  getBookingSettings, 
  updateBookingSettings, 
  setBookingStatus,
  generateTimeSlots,
  DEFAULT_BOOKING_SETTINGS 
} from '../../../firebaseBookingUtils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const BookingsPanel = ({ showNotification, highlightRef = null }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, contacted, completed
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Availability & Calendar Settings State
  const [bookingSettings, setBookingSettings] = useState(DEFAULT_BOOKING_SETTINGS);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempSettings, setTempSettings] = useState(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [newBlockedDate, setNewBlockedDate] = useState('');

  // Top Schedule Calendar & Date Filter State
  const [selectedDateFilter, setSelectedDateFilter] = useState(null); // 'YYYY-MM-DD' or null
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [isCalendarCollapsedMobile, setIsCalendarCollapsedMobile] = useState(false);

  // Slot Editing State for an Individual Booking
  const [editingBookingSlot, setEditingBookingSlot] = useState(null); // booking object or null
  const [slotEditDate, setSlotEditDate] = useState('');
  const [slotEditTime, setSlotEditTime] = useState('');
  const [isSavingSlot, setIsSavingSlot] = useState(false);

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
    const fetchSettings = async () => {
      const result = await getBookingSettings();
      if (result.success) {
        setBookingSettings(result.settings);
        setIsBookingOpen(result.settings.isOpen);
      }
    };
    fetchSettings();
  }, []);

  const handleOpenSettingsModal = () => {
    setTempSettings(JSON.parse(JSON.stringify(bookingSettings || DEFAULT_BOOKING_SETTINGS)));
    setNewBlockedDate('');
    setShowSettingsModal(true);
  };

  const handleSaveSettings = async () => {
    if (!tempSettings) return;
    setIsSavingSettings(true);
    try {
      const res = await updateBookingSettings(tempSettings);
      if (res.success) {
        setBookingSettings(tempSettings);
        setIsBookingOpen(tempSettings.isOpen);
        showNotification('success', 'Calendar availability & settings saved successfully.');
        setShowSettingsModal(false);
      } else {
        showNotification('error', `Failed to save: ${res.error}`);
      }
    } catch (err) {
      console.error('Error saving booking settings:', err);
      showNotification('error', 'An error occurred while saving.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleToggleCalendarFeature = () => {
    if (!tempSettings) return;
    setTempSettings(prev => ({
      ...prev,
      enableCalendarBooking: !prev.enableCalendarBooking
    }));
  };

  const handleDayScheduleChange = (dayKey, field, value) => {
    if (!tempSettings) return;
    setTempSettings(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [dayKey]: {
          ...prev.weeklySchedule[dayKey],
          [field]: value
        }
      }
    }));
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate || !tempSettings) return;
    if (tempSettings.blockedDates?.includes(newBlockedDate)) {
      showNotification('info', 'Date is already in blackout list.');
      return;
    }
    setTempSettings(prev => ({
      ...prev,
      blockedDates: [...(prev.blockedDates || []), newBlockedDate].sort()
    }));
    setNewBlockedDate('');
  };

  const handleRemoveBlockedDate = (dateToRemove) => {
    if (!tempSettings) return;
    setTempSettings(prev => ({
      ...prev,
      blockedDates: (prev.blockedDates || []).filter(d => d !== dateToRemove)
    }));
  };

  // Toggle individual time slots on/off for a weekday schedule
  const handleToggleDaySlot = (dayKey, slotLabel) => {
    if (!tempSettings) return;
    const currentSchedule = tempSettings.weeklySchedule?.[dayKey] || {};
    const disabled = currentSchedule.disabledSlots || [];
    const isCurrentlyDisabled = disabled.includes(slotLabel);

    const updatedDisabled = isCurrentlyDisabled
      ? disabled.filter(s => s !== slotLabel)
      : [...disabled, slotLabel];

    setTempSettings(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [dayKey]: {
          ...prev.weeklySchedule[dayKey],
          disabledSlots: updatedDisabled
        }
      }
    }));
  };

  // Booking Slot Editing Handlers
  const handleStartEditSlot = (booking, e) => {
    if (e) e.stopPropagation();
    setEditingBookingSlot(booking);
    setSlotEditDate(booking.scheduledDate || new Date().toISOString().split('T')[0]);
    setSlotEditTime(booking.scheduledTime || '10:00 AM');
  };

  const handleSaveBookingSlot = async () => {
    if (!editingBookingSlot) return;
    if (!slotEditDate || !slotEditTime) {
      showNotification('error', 'Please provide both a date and time slot.');
      return;
    }
    setIsSavingSlot(true);
    try {
      const bookingRef = doc(db, 'bookings', editingBookingSlot.id);
      await updateDoc(bookingRef, {
        scheduledDate: slotEditDate,
        scheduledTime: slotEditTime,
        updatedAt: new Date().toISOString()
      });
      showNotification('success', `Appointment slot updated: ${slotEditDate} at ${slotEditTime}.`);
      setEditingBookingSlot(null);
    } catch (err) {
      console.error('Error saving slot:', err);
      showNotification('error', 'Failed to update slot.');
    } finally {
      setIsSavingSlot(false);
    }
  };

  const handleClearBookingSlot = async () => {
    if (!editingBookingSlot) return;
    setIsSavingSlot(true);
    try {
      const bookingRef = doc(db, 'bookings', editingBookingSlot.id);
      await updateDoc(bookingRef, {
        scheduledDate: null,
        scheduledTime: null,
        updatedAt: new Date().toISOString()
      });
      showNotification('success', 'Appointment slot removed. Reverted to flexible coordination.');
      setEditingBookingSlot(null);
    } catch (err) {
      console.error('Error clearing slot:', err);
      showNotification('error', 'Failed to clear slot.');
    } finally {
      setIsSavingSlot(false);
    }
  };

  // When highlightRef is provided in URL, automatically select that booking for detail view
  useEffect(() => {
    if (highlightRef && bookings.length > 0) {
      const match = bookings.find(b => b.paystackReference === highlightRef || b.id === highlightRef);
      if (match) {
        setSelectedBooking(match);
      }
    }
  }, [highlightRef, bookings]);

  // Keep selectedBooking updated with real-time data
  useEffect(() => {
    if (selectedBooking) {
      const fresh = bookings.find(b => b.id === selectedBooking.id);
      if (fresh) setSelectedBooking(fresh);
    }
  }, [bookings]);

  const handleToggleClick = () => {
    if (isBookingOpen) {
      setShowConfirmModal(true);
    } else {
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
      showNotification('success', `Marked as ${newStatus}.`);
    } catch (error) {
      console.error("Error updating status:", error);
      showNotification('error', 'Failed to update booking status.');
    }
  };

  const handleQuickToggleCalendar = async () => {
    const nextState = !bookingSettings?.enableCalendarBooking;
    try {
      const res = await updateBookingSettings({ enableCalendarBooking: nextState });
      if (res.success) {
        setBookingSettings(prev => ({ ...prev, enableCalendarBooking: nextState }));
        showNotification('success', `Client calendar slot picker is now ${nextState ? 'enabled' : 'disabled'}.`);
      } else {
        showNotification('error', 'Failed to update calendar toggle.');
      }
    } catch (err) {
      showNotification('error', 'An error occurred.');
    }
  };

  const handlePrevMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (dateStr) => {
    if (selectedDateFilter === dateStr) {
      setSelectedDateFilter(null); // Deselect if already active
    } else {
      setSelectedDateFilter(dateStr);
    }
  };

  // Map of scheduled sessions per YYYY-MM-DD
  const sessionsByDate = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      if (b.scheduledDate && b.status !== 'cancelled') {
        map[b.scheduledDate] = (map[b.scheduledDate] || 0) + 1;
      }
    });
    return map;
  }, [bookings]);

  const totalSessionsWithDates = useMemo(() => {
    return Object.values(sessionsByDate).reduce((sum, count) => sum + count, 0);
  }, [sessionsByDate]);

  // Calendar matrix calculation for the top calendar
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Empty offset cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: null, dateStr: null, isCurrentMonth: false });
    }

    const todayObj = new Date();
    const todayYear = todayObj.getFullYear();
    const todayMonth = String(todayObj.getMonth() + 1).padStart(2, '0');
    const todayDay = String(todayObj.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

    for (let d = 1; d <= lastDate; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      const sessionCount = sessionsByDate[dateStr] || 0;
      const isToday = dateStr === todayStr;

      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        sessionCount,
        isToday,
        isSelected: selectedDateFilter === dateStr
      });
    }

    return days;
  }, [calendarMonth, sessionsByDate, selectedDateFilter]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // 1. Status filter
      if (filter !== 'all' && b.status !== filter) return false;
      // 2. Date filter (if selected)
      if (selectedDateFilter && b.scheduledDate !== selectedDateFilter) return false;
      return true;
    });
  }, [bookings, filter, selectedDateFilter]);

  const pendingCount = useMemo(() => bookings.filter(b => b.status === 'pending').length, [bookings]);
  const contactedCount = useMemo(() => bookings.filter(b => b.status === 'contacted').length, [bookings]);
  const completedCount = useMemo(() => bookings.filter(b => b.status === 'completed').length, [bookings]);

  const formatWhatsAppUrl = (phone, name) => {
    if (!phone) return null;
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0') && clean.length === 10) {
      clean = '233' + clean.slice(1);
    }
    const firstName = (name || 'there').split(' ')[0];
    const text = `Hello ${firstName}, this is Nana Ama Dwamena (Dee) from Diet With Dee! I received your consultation booking and would love to coordinate our session time.`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case 'contacted':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Contacted</span>;
      case 'pending':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Pending</span>;
    }
  };

  const formatDate = (dateField) => {
    if (!dateField) return 'Recently';
    if (dateField.toDate) {
      return dateField.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
    return new Date(dateField).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
        <p className="text-stone-500 text-xs font-medium">Loading bookings...</p>
      </div>
    );
  }

  // ==========================================
  // DETAIL VIEW SCREEN (Minimalist & Focused)
  // ==========================================
  if (selectedBooking) {
    const res = selectedBooking.userResults || {};
    const whatsappUrl = formatWhatsAppUrl(selectedBooking.phone, selectedBooking.name);

    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-xs">
          <button
            onClick={() => setSelectedBooking(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors p-1"
          >
            <ArrowLeft size={16} />
            <span>Back to all bookings</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-stone-400 hidden sm:inline">Status:</span>
            <select
              value={selectedBooking.status || 'pending'}
              onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value)}
              className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="pending">⏳ Pending</option>
              <option value="contacted">📞 Contacted</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>
        </div>

        {/* Client Header Card */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-base border border-emerald-100 flex-shrink-0">
                {selectedBooking.name ? selectedBooking.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-stone-900">{selectedBooking.name}</h3>
                  {res.hasAccount && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Registered
                    </span>
                  )}
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mt-1">
                  <a href={`mailto:${selectedBooking.email}`} className="hover:text-emerald-700 flex items-center gap-1">
                    <Mail size={12} className="text-stone-400" />
                    <span>{selectedBooking.email}</span>
                  </a>
                  <a href={`tel:${selectedBooking.phone}`} className="hover:text-emerald-700 flex items-center gap-1">
                    <Phone size={12} className="text-stone-400" />
                    <span>{selectedBooking.phone}</span>
                  </a>
                  <span className="text-stone-400 flex items-center gap-1">
                    <Clock size={12} />
                    <span>{formatDate(selectedBooking.createdAt)}</span>
                  </span>
                </div>
              </div>
            </div>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <MessageCircle size={15} />
                <span>Chat on WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Appointment Session Slot Card */}
        <div className={`rounded-2xl p-4 sm:p-5 border shadow-xs ${
          selectedBooking.scheduledDate 
            ? 'bg-emerald-50/70 border-emerald-200' 
            : 'bg-white border-stone-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={15} className={selectedBooking.scheduledDate ? "text-emerald-700" : "text-stone-400"} />
              <span>Appointment Session Slot</span>
            </h4>
            <div className="flex items-center gap-2">
              {selectedBooking.scheduledDate ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Booked via Calendar
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                  Arranged via WhatsApp
                </span>
              )}
              <button
                type="button"
                onClick={(e) => handleStartEditSlot(selectedBooking, e)}
                className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <Edit3 size={12} className="text-emerald-600" />
                <span>{selectedBooking.scheduledDate ? 'Reschedule Slot' : 'Assign Slot'}</span>
              </button>
            </div>
          </div>
          {selectedBooking.scheduledDate ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div>
                <p className="text-sm sm:text-base font-bold text-stone-900">
                  {new Date(selectedBooking.scheduledDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {selectedBooking.scheduledTime || 'Slot pending'} (GMT)
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Pre-selected session time for this consultation.
                </p>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-emerald-850 shadow-2xs">
                <Clock size={13} className="text-emerald-600" />
                <span>{selectedBooking.scheduledTime} (GMT)</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-stone-500">
              <p className="leading-relaxed">
                No calendar slot assigned yet. Coordinate personally with the client on WhatsApp or assign a specific date & time.
              </p>
            </div>
          )}
        </div>

        {/* Complete Health Snapshot */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Target size={14} className="text-emerald-600" />
              <span>Patient Health Snapshot</span>
            </h4>
            {res.bmiCategory && (
              <span className="text-[11px] font-medium text-stone-500 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-lg">
                BMI Status: {res.bmiCategory}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            <div className="bg-stone-50/80 p-3 rounded-xl border border-stone-100">
              <span className="text-[10px] font-medium text-stone-400 uppercase">Weight</span>
              <p className="text-sm font-semibold text-stone-900 mt-0.5">{res.weight ? `${res.weight} kg` : 'N/A'}</p>
            </div>
            <div className="bg-stone-50/80 p-3 rounded-xl border border-stone-100">
              <span className="text-[10px] font-medium text-stone-400 uppercase">Height</span>
              <p className="text-sm font-semibold text-stone-900 mt-0.5">{res.height ? `${res.height} cm` : 'N/A'}</p>
            </div>
            <div className="bg-stone-50/80 p-3 rounded-xl border border-stone-100">
              <span className="text-[10px] font-medium text-stone-400 uppercase">Current BMI</span>
              <p className="text-sm font-semibold text-rose-700 mt-0.5">{res.bmi || 'N/A'}</p>
            </div>
            <div className="bg-stone-50/80 p-3 rounded-xl border border-stone-100">
              <span className="text-[10px] font-medium text-stone-400 uppercase">Goal</span>
              <p className="text-sm font-semibold text-stone-900 mt-0.5 truncate">{res.goal || 'General Health'}</p>
            </div>
            <div className="bg-stone-50/80 p-3 rounded-xl border border-stone-100">
              <span className="text-[10px] font-medium text-stone-400 uppercase">Calorie Target</span>
              <p className="text-sm font-semibold text-stone-900 mt-0.5">{res.dailyCalories ? `${res.dailyCalories} kcal` : 'N/A'}</p>
            </div>
            <div className="bg-stone-50/80 p-3 rounded-xl border border-stone-100">
              <span className="text-[10px] font-medium text-stone-400 uppercase">Dietary</span>
              <p className="text-sm font-semibold text-stone-900 mt-0.5 truncate">{res.dietaryRestrictions || 'None'}</p>
            </div>
          </div>

          {/* Conditions & Client Note */}
          <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
            {res.healthConditions && (
              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 text-rose-900">
                <span className="font-semibold">Reported Medical Conditions: </span>
                <span>{res.healthConditions}</span>
              </div>
            )}
            {res.dislikes && (
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-amber-900">
                <span className="font-semibold">Allergies / Dislikes: </span>
                <span>{res.dislikes}</span>
              </div>
            )}
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-stone-700">
              <span className="font-semibold text-stone-600">Client Note: </span>
              <span className="italic">{selectedBooking.message || 'No additional note provided during booking.'}</span>
            </div>
          </div>
        </div>

        {/* Booking Payment Metadata */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CreditCard size={14} className="text-stone-500" />
            <span>Transaction Details</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-medium text-stone-400 uppercase">Type</span>
              <p className="font-semibold text-stone-800 mt-0.5">
                {selectedBooking.consultationType === 'followup' ? 'Follow-Up (₵400)' : 'Initial (₵800)'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-medium text-stone-400 uppercase">Amount Paid</span>
              <p className="font-semibold text-emerald-700 mt-0.5">GHS {selectedBooking.amount}</p>
            </div>
            <div>
              <span className="text-[10px] font-medium text-stone-400 uppercase">Paystack Reference</span>
              <p className="font-mono text-stone-600 mt-0.5 truncate">{selectedBooking.paystackReference || selectedBooking.id}</p>
            </div>
            <div>
              <span className="text-[10px] font-medium text-stone-400 uppercase">Payment Status</span>
              <p className="font-semibold text-stone-800 mt-0.5">Verified & Paid ✅</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MINIMAL LIST VIEW (Clean & Mobile-Friendly)
  // ==========================================
  return (
    <div className="space-y-4">
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-xl border border-stone-200">
            <h3 className="text-base font-semibold text-stone-900 mb-1.5">Pause Online Bookings?</h3>
            <p className="text-stone-500 text-xs mb-5 leading-relaxed">
              New clients will not be able to book on the website until you turn this back on.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-1.5 text-stone-600 font-semibold hover:bg-stone-100 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => updateBookingStatus(false)}
                disabled={isUpdatingStatus}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs"
              >
                {isUpdatingStatus ? 'Updating...' : 'Pause Bookings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Availability & Calendar Settings Modal */}
      {showSettingsModal && tempSettings && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100 bg-stone-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/60">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900">Consultation Availability & Calendar</h3>
                  <p className="text-[11px] text-stone-500">Configure weekly consultation hours and calendar slot booking.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
              
              {/* Feature Toggle Card */}
              <div className={`p-4 rounded-2xl border transition-all ${
                tempSettings.enableCalendarBooking 
                  ? 'bg-emerald-50/60 border-emerald-200' 
                  : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-stone-900">Client Calendar Slot Selection</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tempSettings.enableCalendarBooking
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-200 text-stone-600'
                      }`}>
                        {tempSettings.enableCalendarBooking ? 'Enabled' : 'Disabled (Default)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                      When enabled, clients pick an available date and time slot right on the booking page. When disabled (default), clients book normally and session dates are arranged personally via WhatsApp.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={tempSettings.enableCalendarBooking}
                    onClick={handleToggleCalendarFeature}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      tempSettings.enableCalendarBooking ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        tempSettings.enableCalendarBooking ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Weekly Working Schedule */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={13} className="text-emerald-600" />
                    <span>Weekly Availability Schedule</span>
                  </h4>
                  <span className="text-[10px] text-stone-400 font-medium">Times in GMT</span>
                </div>

                <div className="space-y-2 border border-stone-200/80 rounded-2xl p-3 bg-white">
                  {DAYS_OF_WEEK.map(({ key, label }) => {
                    const sched = tempSettings.weeklySchedule?.[key] || { active: false, start: '10:00', end: '15:00' };

                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                          sched.active ? 'bg-emerald-50/20 border-emerald-200/70' : 'bg-stone-50/60 border-stone-100 opacity-60'
                        }`}
                      >
                        <label className="flex items-center gap-2.5 cursor-pointer min-w-28">
                          <input
                            type="checkbox"
                            checked={sched.active}
                            onChange={(e) => handleDayScheduleChange(key, 'active', e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-stone-800">{label}</span>
                        </label>

                        {sched.active ? (
                          <div className="space-y-2 w-full sm:w-auto">
                            <div className="flex items-center gap-2 text-xs sm:justify-end">
                              <span className="text-stone-400 text-[11px]">From</span>
                              <input
                                type="time"
                                value={sched.start || '10:00'}
                                onChange={(e) => handleDayScheduleChange(key, 'start', e.target.value)}
                                className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                              <span className="text-stone-400 text-[11px]">To</span>
                              <input
                                type="time"
                                value={sched.end || '15:00'}
                                onChange={(e) => handleDayScheduleChange(key, 'end', e.target.value)}
                                className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                            
                            {/* Granular Time Slots Selector (Tap to toggle on/off) */}
                            <div className="flex flex-wrap items-center gap-1 sm:justify-end pt-1">
                              <span className="text-[10px] text-stone-400 font-medium mr-1">Slots:</span>
                              {generateTimeSlots(sched.start || '10:00', sched.end || '15:00', tempSettings.slotDurationMinutes || 60).map(slot => {
                                const isDisabled = (sched.disabledSlots || []).includes(slot);
                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => handleToggleDaySlot(key, slot)}
                                    title={isDisabled ? "Click to enable this slot" : "Click to disable this slot"}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all border cursor-pointer ${
                                      isDisabled
                                        ? 'bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                    }`}
                                  >
                                    {slot}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic">Day off (Unavailable)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Slot Duration */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Consultation Slot Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 45, 60].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setTempSettings(prev => ({ ...prev, slotDurationMinutes: dur }))}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        tempSettings.slotDurationMinutes === dur
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {dur} Minutes
                    </button>
                  ))}
                </div>
              </div>

              {/* Blackout Dates */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={13} className="text-rose-600" />
                  <span>Blackout Dates (Days Off / Holidays)</span>
                </h4>
                <p className="text-[11px] text-stone-500">
                  Clients will not be able to book on these specific dates, even if the weekday is normally active.
                </p>

                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddBlockedDate}
                    disabled={!newBlockedDate}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Block Date</span>
                  </button>
                </div>

                {tempSettings.blockedDates && tempSettings.blockedDates.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tempSettings.blockedDates.map(dateStr => (
                      <span
                        key={dateStr}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold"
                      >
                        <span>{dateStr}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlockedDate(dateStr)}
                          className="text-rose-400 hover:text-rose-700 transition-colors ml-0.5"
                          title="Remove blackout date"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-400 italic">No blackout dates added yet.</p>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-4 sm:p-5 border-t border-stone-100 bg-stone-50/40">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-stone-600 font-semibold hover:bg-stone-100 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isSavingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Reschedule Appointment Slot Modal */}
      {editingBookingSlot && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100 bg-stone-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    {editingBookingSlot.scheduledDate ? 'Reschedule Consultation Slot' : 'Assign Consultation Slot'}
                  </h3>
                  <p className="text-[11px] text-stone-500 truncate max-w-xs">
                    Client: {editingBookingSlot.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingBookingSlot(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 space-y-4 text-xs">
              
              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 uppercase tracking-wider block text-[11px]">
                  Consultation Date *
                </label>
                <input
                  type="date"
                  value={slotEditDate}
                  onChange={(e) => setSlotEditDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Time Slots Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 uppercase tracking-wider block text-[11px]">
                  Select Time Slot *
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'].map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSlotEditTime(time)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        slotEditTime === time
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>

                {/* Custom Time input */}
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[11px] text-stone-400 font-medium whitespace-nowrap">Or custom time:</span>
                  <input
                    type="text"
                    value={slotEditTime}
                    onChange={(e) => setSlotEditTime(e.target.value)}
                    placeholder="e.g. 11:30 AM"
                    className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Slot Confirmation Preview */}
              {slotEditDate && slotEditTime && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">Assigned Slot Preview</span>
                  <p className="font-bold text-xs mt-0.5">
                    {new Date(slotEditDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at {slotEditTime} (GMT)
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-t border-stone-100 bg-stone-50/50">
              {editingBookingSlot.scheduledDate ? (
                <button
                  type="button"
                  onClick={handleClearBookingSlot}
                  disabled={isSavingSlot}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear Slot
                </button>
              ) : <div></div>}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBookingSlot(null)}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBookingSlot}
                  disabled={isSavingSlot}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {isSavingSlot ? 'Saving...' : 'Save Slot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TOP SECTION: Controls on Left, Schedule Calendar on Right */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        
        {/* LEFT COLUMN: System Controls & Operational Filters (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          
          {/* Master Toggles Card */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">System Toggles</span>
              <button
                type="button"
                onClick={handleOpenSettingsModal}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Settings size={13} />
                <span>Configure Hours</span>
              </button>
            </div>

            {/* Toggle 1: Online Bookings Master */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-stone-900">Accept Online Bookings</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isBookingOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}>
                    {isBookingOpen ? 'Open' : 'Paused'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">Allow new clients to book consultations on website</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isBookingOpen}
                onClick={handleToggleClick}
                disabled={isUpdatingStatus}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isBookingOpen ? 'bg-emerald-600' : 'bg-stone-300'
                } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    isBookingOpen ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Calendar Slot Selection for Clients */}
            <div className="flex items-center justify-between pt-2.5 border-t border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-stone-900">Client Calendar Slot Picker</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    bookingSettings?.enableCalendarBooking ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}>
                    {bookingSettings?.enableCalendarBooking ? 'Enabled' : 'Disabled (Default)'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">Let clients select session time during checkout</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={bookingSettings?.enableCalendarBooking}
                onClick={handleQuickToggleCalendar}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  bookingSettings?.enableCalendarBooking ? 'bg-emerald-600' : 'bg-stone-300'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    bookingSettings?.enableCalendarBooking ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Quick Status Filters Card */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2.5 flex-1 flex flex-col justify-center">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Status Filter</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  filter === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>All</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  filter === 'all' ? 'bg-stone-700 text-white' : 'bg-stone-200 text-stone-700'
                }`}>
                  {bookings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilter('pending')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  filter === 'pending'
                    ? 'bg-rose-600 text-white'
                    : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>Pending</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  filter === 'pending' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-700'
                }`}>
                  {pendingCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilter('contacted')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  filter === 'contacted'
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>Contacted</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  filter === 'contacted' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  {contactedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilter('completed')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  filter === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Completed</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  filter === 'completed' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {completedCount}
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Schedule Mini Calendar with Green Dots (7 cols) */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-900">
                {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </span>
              <div className="flex items-center gap-1 ml-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  title="Next month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {totalSessionsWithDates > 0 && (
                <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>{totalSessionsWithDates} Booked</span>
                </span>
              )}
              {/* Mobile collapse toggle */}
              <button
                type="button"
                onClick={() => setIsCalendarCollapsedMobile(!isCalendarCollapsedMobile)}
                className="sm:hidden p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                title={isCalendarCollapsedMobile ? "Expand Calendar" : "Collapse Calendar"}
              >
                {isCalendarCollapsedMobile ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>
          </div>

          {/* Calendar Grid (collapsible on mobile) */}
          <div className={`${isCalendarCollapsedMobile ? 'hidden sm:block' : 'block'}`}>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center py-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <span key={d} className="text-xs font-bold text-stone-400 uppercase">
                  {d}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarDays.map((day, idx) => {
                if (!day.isCurrentMonth) {
                  return <div key={`empty-${idx}`} className="h-8 sm:h-9" />;
                }

                const hasSessions = day.sessionCount > 0;
                const isSelected = day.isSelected;
                const isToday = day.isToday;

                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => handleDateClick(day.dateStr)}
                    className={`h-8 sm:h-9 rounded-xl flex flex-col items-center justify-center text-xs transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-xs scale-102 ring-2 ring-emerald-600'
                        : hasSessions
                        ? 'bg-emerald-50/70 border border-emerald-200 text-emerald-950 font-bold hover:bg-emerald-100'
                        : isToday
                        ? 'bg-stone-50 text-stone-900 font-bold border border-stone-300'
                        : 'text-stone-600 hover:bg-stone-100 font-medium'
                    }`}
                  >
                    <span>{day.dayNumber}</span>
                    {/* Green Dot Indicator on Days with Sessions */}
                    {hasSessions && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full -mt-0.5 ${
                          isSelected ? 'bg-white' : 'bg-emerald-600'
                        }`}
                        title={`${day.sessionCount} consultation(s)`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar Filter Indicator Bar */}
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">
              {selectedDateFilter ? (
                <>
                  Filtered by date: <strong className="text-emerald-800">{new Date(selectedDateFilter).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                </>
              ) : (
                <>
                  Showing: <strong className="text-stone-800">All dates</strong> • Tap any date with a green dot to filter
                </>
              )}
            </span>
            {selectedDateFilter && (
              <button
                type="button"
                onClick={() => setSelectedDateFilter(null)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors"
              >
                Clear Date Filter ×
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Header bar above booking cards */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Consultation Bookings ({filteredBookings.length})
          </h3>
          {selectedDateFilter && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              📅 {selectedDateFilter}
            </span>
          )}
          {filter !== 'all' && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200 uppercase">
              {filter}
            </span>
          )}
        </div>
        {(selectedDateFilter || filter !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSelectedDateFilter(null);
              setFilter('all');
            }}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 underline"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Minimal Booking Cards List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-xs">
          <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-stone-700">No {filter !== 'all' ? filter : ''} bookings</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredBookings.map((booking) => {
            const isMatch = highlightRef && (booking.paystackReference === highlightRef || booking.id === highlightRef);
            const whatsappUrl = formatWhatsAppUrl(booking.phone, booking.name);

            return (
              <div
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className={`group bg-white rounded-2xl p-3.5 sm:p-4 border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isMatch
                    ? 'border-emerald-500 shadow-sm bg-emerald-50/20'
                    : 'border-stone-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs'
                }`}
              >
                {/* Left: Client name, tier, date */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 group-hover:bg-emerald-50 text-stone-700 group-hover:text-emerald-800 flex items-center justify-center font-semibold text-xs flex-shrink-0 transition-colors">
                    {booking.name ? booking.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-semibold text-stone-900 truncate">{booking.name}</p>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      <span>{booking.consultationType === 'followup' ? 'Follow-Up' : 'Initial'}</span>
                      <span>•</span>
                      <span className="font-medium text-emerald-700">GHS {booking.amount}</span>
                      <span>•</span>
                      <span>{formatDate(booking.createdAt)}</span>
                      {booking.scheduledDate && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[10px] border border-emerald-200">
                            <Clock size={10} className="text-emerald-600" />
                            <span>{booking.scheduledDate} {booking.scheduledTime || ''}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Actions (Slot, WhatsApp, Details) */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <button
                    type="button"
                    onClick={(e) => handleStartEditSlot(booking, e)}
                    title={booking.scheduledDate ? "Reschedule appointment slot" : "Assign appointment slot"}
                    className="px-2 py-1 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-emerald-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 size={11} className="text-stone-400 group-hover:text-emerald-600" />
                    <span>{booking.scheduledDate ? 'Reschedule' : 'Set Slot'}</span>
                  </button>

                  {whatsappUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(whatsappUrl, '_blank');
                      }}
                      title="Open WhatsApp"
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1 text-xs font-semibold text-stone-400 group-hover:text-emerald-700 transition-colors">
                    <span>Details</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingsPanel;
