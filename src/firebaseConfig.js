// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9KL8sWtWB6zrEp4Nm0pviP8ngwEypxmg",
  authDomain: "diet-with-dee.firebaseapp.com",
  projectId: "diet-with-dee",
  storageBucket: "diet-with-dee.firebasestorage.app",
  messagingSenderId: "850418905256",
  appId: "1:850418905256:web:d55d3a90b6ac119581929d",
  measurementId: "G-XEWCHGYQ2M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize and export Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);