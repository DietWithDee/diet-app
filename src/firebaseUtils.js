// firebaseUtils.js
import { db, storage } from "./firebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, // ADD THIS MISSING IMPORT
  doc, 
  updateDoc, 
  deleteDoc, 
  Timestamp, 
  orderBy, 
  query 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// CREATE article - FIXED to handle both File objects and URL strings
export const createArticle = async (title, content, imageInput) => {
  try {
    let imageUrl = "";

    // Handle both File objects and URL strings
    if (imageInput) {
      if (imageInput instanceof File) {
        // If it's a File object, upload it
        const storageRef = ref(storage, `coverImages/${Date.now()}_${imageInput.name}`);
        const snapshot = await uploadBytes(storageRef, imageInput);
        imageUrl = await getDownloadURL(snapshot.ref);
      } else if (typeof imageInput === 'string') {
        // If it's a URL string, use it directly
        imageUrl = imageInput;
      }
    }

    // Add article to Firestore
    const docRef = await addDoc(collection(db, "articles"), {
      title,
      content,
      coverImage: imageUrl,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating article:", error);
    return { success: false, error: error.message };
  }
};

// GET all articles
export const getArticles = async () => {
  try {
    // Query articles ordered by creation date (newest first)
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    const articles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return { success: true, data: articles };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return { success: false, error: error.message };
  }
};

// UPDATE article - FIXED to handle both File objects and URL strings
export const updateArticle = async (articleId, title, content, imageInput) => {
  try {
    let updateData = {
      title,
      content,
      updatedAt: Timestamp.now()
    };

    // Handle both File objects and URL strings
    if (imageInput) {
      if (imageInput instanceof File) {
        // If it's a File object, upload it
        const storageRef = ref(storage, `coverImages/${Date.now()}_${imageInput.name}`);
        const snapshot = await uploadBytes(storageRef, imageInput);
        const imageUrl = await getDownloadURL(snapshot.ref);
        updateData.coverImage = imageUrl;
      } else if (typeof imageInput === 'string') {
        // If it's a URL string, use it directly
        updateData.coverImage = imageInput;
      }
    }

    // Update article in Firestore
    await updateDoc(doc(db, "articles", articleId), updateData);

    return { success: true };
  } catch (error) {
    console.error("Error updating article:", error);
    return { success: false, error: error.message };
  }
};

// DELETE article
export const deleteArticle = async (articleId) => {
  try {
    // Get article data first to delete associated image
    const articleDoc = await getDoc(doc(db, "articles", articleId));
    const articleData = articleDoc.data();

    // Delete associated image if exists and it's a Firebase Storage URL
    if (articleData && articleData.coverImage) {
      try {
        // Only try to delete if it's a Firebase Storage URL
        if (articleData.coverImage.includes('firebase')) {
          const imageRef = ref(storage, articleData.coverImage);
          await deleteObject(imageRef);
        }
      } catch (imageError) {
        console.warn("Error deleting associated image:", imageError);
        // Continue with article deletion even if image deletion fails
      }
    }

    // Delete article from Firestore
    await deleteDoc(doc(db, "articles", articleId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting article:", error);
    return { success: false, error: error.message };
  }
};

// GET single article by ID
export const getArticleById = async (articleId) => {
  try {
    const docSnap = await getDoc(doc(db, "articles", articleId));
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        data: { id: docSnap.id, ...docSnap.data() } 
      };
    } else {
      return { success: false, error: "Article not found" };
    }
  } catch (error) {
    console.error("Error fetching article:", error);
    return { success: false, error: error.message };
  }
};

export const saveEmailToFirestore = async (email) => {
  try {
    const docRef = await addDoc(collection(db, "emails"), {
      email,
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving email:", error);
    return { success: false, error: error.message };
  }
};