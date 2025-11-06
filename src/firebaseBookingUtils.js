import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Assuming you have firebaseConfig.js

// Mock function to get booking status
export const getBookingStatus = async () => {
  try {
    // In a real application, fetch from Firestore
    const docRef = doc(db, "settings", "booking");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, isOpen: docSnap.data().isOpen };
    } else {
      console.log("No such document! Setting default to true.");
      await setDoc(docRef, { isOpen: true });
      return { success: true, isOpen: true };
    }
    
    // Mock implementation
    // await new Promise(resolve => setTimeout(resolve, 500));
    // const mockStatus = localStorage.getItem('mockBookingStatus');
    // if (mockStatus === null) {
    //   localStorage.setItem('mockBookingStatus', 'true');
    //   return { success: true, isOpen: true };
    // }
    // return { success: true, isOpen: JSON.parse(mockStatus) };
  } catch (error) {
    console.error("Error getting booking status:", error);
    return { success: false, error: error.message };
  }
};

// Mock function to set booking status
export const setBookingStatus = async (isOpen) => {
  try {
    // In a real application, set to Firestore
    const docRef = doc(db, "settings", "booking");
    await setDoc(docRef, { isOpen });

    // Mock implementation
    // await new Promise(resolve => setTimeout(resolve, 500));
    // localStorage.setItem('mockBookingStatus', JSON.stringify(isOpen));
    return { success: true };
  } catch (error) {
    console.error("Error setting booking status:", error);
    return { success: false, error: error.message };
  }
};