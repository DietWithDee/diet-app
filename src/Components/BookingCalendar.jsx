import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { generateTimeSlots, getBookedSlotsForDate } from '../firebaseBookingUtils';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BookingCalendar = ({
  settings,
  selectedDate,
  selectedTime,
  onSelectSlot
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isPrevDisabled = useMemo(() => {
    return (
      currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() === today.getMonth()
    );
  }, [currentMonth, today]);

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const lastDate = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: null, isCurrentMonth: false, dateStr: null });
    }

    // Days of current month
    for (let day = 1; day <= lastDate; day++) {
      const d = new Date(year, month, day);
      d.setHours(0, 0, 0, 0);

      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      const dayName = DAY_NAMES[d.getDay()];
      const daySchedule = settings?.weeklySchedule?.[dayName];
      const isDayActive = daySchedule?.active ?? true;

      const isPast = d < today;
      const isBlocked = settings?.blockedDates?.includes(dateStr);

      const isAvailable = !isPast && isDayActive && !isBlocked;

      days.push({
        dayNumber: day,
        isCurrentMonth: true,
        dateStr,
        isAvailable,
        dayName,
        isPast,
        isBlocked
      });
    }

    return days;
  }, [currentMonth, today, settings]);

  // Load booked slots when selectedDate changes
  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }

    let isMounted = true;
    const loadBooked = async () => {
      setLoadingSlots(true);
      const res = await getBookedSlotsForDate(selectedDate);
      if (isMounted) {
        setBookedSlots(res.bookedSlots || []);
        setLoadingSlots(false);
      }
    };

    loadBooked();
    return () => { isMounted = false; };
  }, [selectedDate]);

  // Compute available slots for the selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];

    const dateParts = selectedDate.split('-').map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dayName = DAY_NAMES[dateObj.getDay()];

    const daySchedule = settings?.weeklySchedule?.[dayName] || {
      active: true,
      start: '10:00',
      end: '15:00'
    };

    if (!daySchedule.active) return [];

    const start = daySchedule.start || '10:00';
    const end = daySchedule.end || '15:00';
    const duration = settings?.slotDurationMinutes || 60;

    const allSlots = generateTimeSlots(start, end, duration);
    if (daySchedule.disabledSlots && Array.isArray(daySchedule.disabledSlots)) {
      return allSlots.filter(s => !daySchedule.disabledSlots.includes(s));
    }
    return allSlots;
  }, [selectedDate, settings]);

  const handleDayClick = (dayObj) => {
    if (!dayObj.isAvailable) return;
    onSelectSlot({
      date: dayObj.dateStr,
      time: '' // Reset slot when new date is picked
    });
  };

  const handleTimeClick = (timeSlot) => {
    if (bookedSlots.includes(timeSlot)) return;
    onSelectSlot({
      date: selectedDate,
      time: timeSlot
    });
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-sm space-y-5">
      
      {/* Header with Title and Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
            <CalendarIcon size={18} className="text-emerald-600" />
            <span>Select Consultation Date & Time</span>
          </h3>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Choose an available slot with Nana Ama (Dee) • Ghana Time (GMT)
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-stone-500 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Available</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-200"></span>
            <span>Unavailable</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Month Calendar (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Month & Nav Controls */}
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-bold text-stone-800">
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={isPrevDisabled}
                className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <span key={d} className="text-[11px] font-semibold text-stone-400 py-1 uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day, idx) => {
              if (!day.isCurrentMonth) {
                return <div key={`empty-${idx}`} className="h-9 sm:h-10" />;
              }

              const isSelected = selectedDate === day.dateStr;

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  disabled={!day.isAvailable}
                  className={`h-9 sm:h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs scale-102 font-bold'
                      : day.isAvailable
                      ? 'bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/50 cursor-pointer'
                      : 'text-stone-300 bg-stone-50/60 cursor-not-allowed line-through decoration-stone-200'
                  }`}
                >
                  {day.dayNumber}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Time Slot Selector (5 cols) */}
        <div className="lg:col-span-5 bg-stone-50/70 rounded-2xl p-4 border border-stone-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-200/60">
              <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-600" />
                <span>Available Times</span>
              </span>
              {selectedDate && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>

            {!selectedDate ? (
              <div className="py-8 text-center text-xs text-stone-400">
                <CalendarIcon size={24} className="mx-auto mb-1.5 opacity-40" />
                Please select an available day on the calendar to view consultation hours.
              </div>
            ) : loadingSlots ? (
              <div className="py-8 text-center text-xs text-stone-500 flex flex-col items-center justify-center gap-2">
                <Loader size={18} className="animate-spin text-emerald-600" />
                <span>Loading available slots...</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                No slots available on this day. Please select another date.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto no-scrollbar pr-0.5">
                {availableSlots.map(slot => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = selectedTime === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleTimeClick(slot)}
                      disabled={isBooked}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : isBooked
                          ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed line-through'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/40 cursor-pointer'
                      }`}
                    >
                      <span>{slot}</span>
                      {isSelected && <CheckCircle2 size={12} className="text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Summary Card */}
          {selectedDate && selectedTime && (
            <div className="mt-4 pt-3 border-t border-stone-200/80 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 text-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Confirmed Session Slot</span>
              <p className="font-bold text-emerald-950 mt-0.5">
                {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at {selectedTime} (GMT)
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default BookingCalendar;
