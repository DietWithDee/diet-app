import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const DEFAULT_BOOKING_SETTINGS = {
  isOpen: true,
  enableCalendarBooking: false, // Default OFF as requested
  slotDurationMinutes: 60,
  minNoticeHours: 12,
  weeklySchedule: {
    monday: { active: false, start: "10:00", end: "15:00" },
    tuesday: { active: true, start: "10:00", end: "15:00" },
    wednesday: { active: true, start: "10:00", end: "15:00" },
    thursday: { active: true, start: "10:00", end: "15:00" },
    friday: { active: true, start: "10:00", end: "15:00" },
    saturday: { active: true, start: "10:00", end: "14:00" },
    sunday: { active: true, start: "11:00", end: "15:00" }
  },
  blockedDates: []
};

// Generate time slot labels from start to end (e.g. "10:00" to "15:00" -> ["10:00 AM", ...])
export const generateTimeSlots = (start = "10:00", end = "15:00", intervalMinutes = 60) => {
  const slots = [];
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);

  let current = new Date();
  current.setHours(startHour, startMin, 0, 0);

  const endTime = new Date();
  endTime.setHours(endHour, endMin, 0, 0);

  while (current < endTime) {
    const hours = current.getHours();
    const minutes = current.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHour = hours % 12 || 12;
    const formattedMin = minutes < 10 ? `0${minutes}` : minutes;
    slots.push(`${formattedHour}:${formattedMin} ${ampm}`);

    current = new Date(current.getTime() + intervalMinutes * 60000);
  }

  return slots;
};

// GET all booking settings
export const getBookingSettings = async () => {
  try {
    const docRef = doc(db, "settings", "booking");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        success: true,
        settings: {
          ...DEFAULT_BOOKING_SETTINGS,
          ...data,
          weeklySchedule: {
            ...DEFAULT_BOOKING_SETTINGS.weeklySchedule,
            ...(data.weeklySchedule || {})
          },
          blockedDates: Array.isArray(data.blockedDates) ? data.blockedDates : []
        }
      };
    } else {
      await setDoc(docRef, DEFAULT_BOOKING_SETTINGS);
      return { success: true, settings: DEFAULT_BOOKING_SETTINGS };
    }
  } catch (error) {
    console.error("Error getting booking settings:", error);
    return { success: false, settings: DEFAULT_BOOKING_SETTINGS, error: error.message };
  }
};

// UPDATE booking settings
export const updateBookingSettings = async (updates) => {
  try {
    const docRef = doc(db, "settings", "booking");
    await setDoc(docRef, updates, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating booking settings:", error);
    return { success: false, error: error.message };
  }
};

// Legacy compatibility
export const getBookingStatus = async () => {
  const res = await getBookingSettings();
  if (res.success) {
    return { 
      success: true, 
      isOpen: res.settings.isOpen,
      enableCalendarBooking: Boolean(res.settings.enableCalendarBooking)
    };
  }
  return { success: false, isOpen: true, enableCalendarBooking: false };
};

export const setBookingStatus = async (isOpen) => {
  return updateBookingSettings({ isOpen });
};

// GET already booked slots for a specific date (YYYY-MM-DD)
export const getBookedSlotsForDate = async (dateStr) => {
  try {
    if (!dateStr) return { success: true, bookedSlots: [] };
    const q = query(
      collection(db, "bookings"),
      where("scheduledDate", "==", dateStr)
    );
    const snapshot = await getDocs(q);
    const booked = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.status !== "cancelled" && data.scheduledTime) {
        booked.push(data.scheduledTime);
      }
    });
    return { success: true, bookedSlots: booked };
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    return { success: false, bookedSlots: [], error: error.message };
  }
};
