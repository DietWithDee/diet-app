// firebaseUtils.js
import { db, storage } from "./firebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  Timestamp, 
  orderBy, 
  query,
  increment,
  limit,
  startAfter
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
      likesCount: 0, // Initialize likes count
      helpfulCount: 0, // Initialize helpful count
      notHelpfulCount: 0, // Initialize not helpful count
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
      likesCount: doc.data().likesCount || 0, // Ensure likesCount exists
      helpfulCount: doc.data().helpfulCount || 0, // Ensure helpfulCount exists
      notHelpfulCount: doc.data().notHelpfulCount || 0 // Ensure notHelpfulCount exists
    }));
    
    return { success: true, data: articles };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return { success: false, error: error.message };
  }
};

// GET articles with pagination
export const getArticlesPaged = async (pageSize = 6, lastVisibleDoc = null) => {
  try {
    let q;
    if (lastVisibleDoc) {
      q = query(
        collection(db, "articles"), 
        orderBy("createdAt", "desc"), 
        startAfter(lastVisibleDoc),
        limit(pageSize)
      );
    } else {
      q = query(
        collection(db, "articles"), 
        orderBy("createdAt", "desc"), 
        limit(pageSize)
      );
    }
    
    const snapshot = await getDocs(q);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    
    const articles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      likesCount: doc.data().likesCount || 0,
      helpfulCount: doc.data().helpfulCount || 0,
      notHelpfulCount: doc.data().notHelpfulCount || 0
    }));
    
    return { 
      success: true, 
      data: articles, 
      lastVisible, 
      hasMore: articles.length === pageSize 
    };
  } catch (error) {
    console.error("Error fetching paged articles:", error);
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
      const data = docSnap.data();
      return { 
        success: true, 
        data: { 
          id: docSnap.id, 
          ...data,
          likesCount: data.likesCount || 0, // Ensure likesCount exists
          helpfulCount: data.helpfulCount || 0, // Ensure helpfulCount exists
          notHelpfulCount: data.notHelpfulCount || 0 // Ensure notHelpfulCount exists
        } 
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

export const getAllEmails = async()=>{
  try {
    const q = query(collection(db, "emails"), orderBy("createdAt", "desc")); 
    const snapshot = await getDocs(q); 

    if (snapshot.empty) {
      console.log("No emails found");
      return { success: true, data: [] }; 
    }

    const emails = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Emails fetched successfully:", emails);
    console.log("Total emails:", emails.length);

    return { success: true, data: emails };
  } catch (error) {
    console.error("error fetching emails:", error); 
    return { success: false, error : error.message};
  }
}

// SIMPLIFIED LIKES IMPLEMENTATION (without user tracking)
export const likeNews = async (articleId) => {
  try {
    const articleRef = doc(db, "articles", articleId);
    
    // Check if article exists
    const articleDoc = await getDoc(articleRef);
    if (!articleDoc.exists()) {
      return { success: false, message: "Article not found" };
    }

    // Simply increment the likes counter
    await updateDoc(articleRef, {
      likesCount: increment(1)
    });

    return { success: true, message: "Article liked successfully!" };
  } catch (error) {
    console.error("Error liking article:", error);
    return { success: false, message: "Error liking article", error: error.message };
  }
};

// Mark article as helpful
export const markArticleHelpful = async (articleId, isHelpful) => {
  try {
    const articleRef = doc(db, "articles", articleId);
    
    // Check if article exists
    const articleDoc = await getDoc(articleRef);
    if (!articleDoc.exists()) {
      return { success: false, message: "Article not found" };
    }

    // Increment the appropriate counter
    const updateField = isHelpful ? 'helpfulCount' : '';
    await updateDoc(articleRef, {
      [updateField]: increment(1)
    });

    return { 
      success: true, 
      message: `Article marked as ${isHelpful ? 'helpful' : ''} successfully!` 
    };
  } catch (error) {
    console.error("Error marking article helpfulness:", error);
    return { 
      success: false, 
      message: "Error updating article feedback", 
      error: error.message 
    };
  }
};