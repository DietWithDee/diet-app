import { db, storage } from "./firebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  Timestamp, 
  query,
  orderBy
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// CREATE event
export const createEvent = async (title, date, location, description, imageInput) => {
  try {
    let imageUrl = "";

    // Handle image upload
    if (imageInput && imageInput instanceof File) {
      const storageRef = ref(storage, `eventImages/${Date.now()}_${imageInput.name}`);
      const snapshot = await uploadBytes(storageRef, imageInput);
      imageUrl = await getDownloadURL(snapshot.ref);
    } else if (typeof imageInput === 'string') {
      imageUrl = imageInput;
    }

    const docRef = await addDoc(collection(db, "events"), {
      title,
      date, // YYYY-MM-DD string
      location,
      description,
      imageUrl,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: error.message };
  }
};

// GET all events
export const getAllEvents = async () => {
    try {
      const q = query(collection(db, "events"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: events };
    } catch (error) {
      console.error("Error fetching events:", error);
      return { success: false, error: error.message };
    }
  };

// UPDATE event
export const updateEvent = async (eventId, title, date, location, description, imageInput) => {
  try {
    let updateData = {
      title,
      date,
      location,
      description,
      updatedAt: Timestamp.now()
    };

    if (imageInput) {
      if (imageInput instanceof File) {
        const storageRef = ref(storage, `eventImages/${Date.now()}_${imageInput.name}`);
        const snapshot = await uploadBytes(storageRef, imageInput);
        const imageUrl = await getDownloadURL(snapshot.ref);
        updateData.imageUrl = imageUrl;
      } else if (typeof imageInput === 'string' && imageInput.trim() !== '') {
        updateData.imageUrl = imageInput;
      }
    }

    await updateDoc(doc(db, "events", eventId), updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: error.message };
  }
};

// DELETE event
export const deleteEvent = async (eventId, imageUrl) => {
  try {
    // Delete image if exists
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes("firebasestorage.googleapis.com")) {
      const imageRef = ref(storage, imageUrl);
      try {
        await deleteObject(imageRef);
      } catch (e) {
        console.error("Error deleting old event image: ", e);
      }
    }

    // Delete event document
    await deleteDoc(doc(db, "events", eventId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, error: error.message };
  }
};
