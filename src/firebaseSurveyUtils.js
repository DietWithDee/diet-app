import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Fetch survey open/close status from Firestore settings collection.
 * Defaults to true (open) if the setting document does not exist yet.
 */
export const getSurveyStatus = async () => {
  try {
    if (!db) {
      return { success: true, isOpen: true };
    }
    const docRef = doc(db, "settings", "survey");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { success: true, isOpen: data.isOpen !== false };
    }
    // Default to open if not explicitly configured
    return { success: true, isOpen: true };
  } catch (error) {
    console.error("Error getting survey status:", error);
    // Graceful fallback to true so errors don't block users
    return { success: false, isOpen: true, error: error.message };
  }
};

/**
 * Update survey status in Firestore settings collection.
 * @param {boolean} isOpen
 */
export const setSurveyStatus = async (isOpen) => {
  try {
    if (!db) {
      return { success: false, error: "Database not initialized" };
    }
    const docRef = doc(db, "settings", "survey");
    await setDoc(
      docRef,
      {
        isOpen: Boolean(isOpen),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true, isOpen: Boolean(isOpen) };
  } catch (error) {
    console.error("Error setting survey status:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Subscribe to real-time survey status changes.
 * @param {(isOpen: boolean) => void} callback
 * @returns {() => void} unsubscribe function
 */
export const subscribeSurveyStatus = (callback) => {
  if (!db) {
    callback(true);
    return () => {};
  }
  try {
    const docRef = doc(db, "settings", "survey");
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          callback(data.isOpen !== false);
        } else {
          callback(true);
        }
      },
      (error) => {
        console.warn("Real-time survey status subscription notice:", error);
        callback(true);
      }
    );
  } catch (error) {
    console.warn("Error setting up survey status listener:", error);
    callback(true);
    return () => {};
  }
};
