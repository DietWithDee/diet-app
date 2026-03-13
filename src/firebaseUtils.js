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
  where,
  increment,
  limit,
  startAfter
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// CREATE article - FIXED to handle both File objects and URL strings
export const createArticle = async (title, content, imageInput, status = 'published', scheduledPublishDate = null) => {
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
      status,
      scheduledPublishDate: scheduledPublishDate ? Timestamp.fromDate(new Date(scheduledPublishDate)) : null,
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
export const getArticles = async (includeUnpublished = false) => {
  try {
    let q;
    if (includeUnpublished) {
      q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    } else {
      q = query(collection(db, "articles"), where("status", "==", "published"), orderBy("createdAt", "desc"));
    }
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
export const getArticlesPaged = async (pageSize = 6, lastVisibleDoc = null, includeUnpublished = false) => {
  try {
    let q;
    let baseConstraints = [];
    if (!includeUnpublished) {
      baseConstraints.push(where("status", "==", "published"));
    }
    baseConstraints.push(orderBy("createdAt", "desc"));

    if (lastVisibleDoc) {
      q = query(
        collection(db, "articles"), 
        ...baseConstraints,
        startAfter(lastVisibleDoc),
        limit(pageSize)
      );
    } else {
      q = query(
        collection(db, "articles"), 
        ...baseConstraints,
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
export const updateArticle = async (articleId, title, content, imageInput, status = 'published', scheduledPublishDate = null) => {
  try {
    let updateData = {
      title,
      content,
      status,
      scheduledPublishDate: scheduledPublishDate ? Timestamp.fromDate(new Date(scheduledPublishDate)) : null,
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
export const deleteArticle = async (articleId, coverImageUrl, articleContent) => {
  try {
    // 1. Delete cover image if it exists in Firebase Storage
    if (coverImageUrl && typeof coverImageUrl === 'string' && coverImageUrl.includes("firebasestorage.googleapis.com")) {
      const imageRef = ref(storage, coverImageUrl);
      try {
        await deleteObject(imageRef);
      } catch (e) {
        console.error("Error deleting old cover image: ", e);
      }
    }

    // 2. Extract and delete all inline images from the content HTML
    if (articleContent && typeof articleContent === 'string') {
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        let match;
        while ((match = imgRegex.exec(articleContent)) !== null) {
            const inlineUrl = match[1];
            if (inlineUrl.includes("firebasestorage.googleapis.com")) {
                const inlineImageRef = ref(storage, inlineUrl);
                try {
                    await deleteObject(inlineImageRef);
                } catch (e) {
                    console.error("Error deleting inline image: ", e);
                }
            }
        }
    }

    // 3. Delete article from Firestore
    await deleteDoc(doc(db, "articles", articleId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting article:", error);
    return { success: false, error: error.message };
  }
};

// GET single article by ID
export const getArticleById = async (articleId, includeUnpublished = false) => {
  try {
    const docSnap = await getDoc(doc(db, "articles", articleId));
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      if (!includeUnpublished && data.status && data.status !== 'published') {
        return { success: false, error: "Article not found or not published" };
      }

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
    const trimmedEmail = email.trim().toLowerCase();
    
    // Check if email already exists
    const q = query(collection(db, "emails"), where("email", "==", trimmedEmail));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { success: true, exists: true };
    }

    const docRef = await addDoc(collection(db, "emails"), {
      email: trimmedEmail,
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

// --- ANALYTICS / USER JOURNEY UTILS ---

// Get all users (for admin)
export const getAllUsers = async (limitCount = 100) => {
  try {
    const q = query(
      collection(db, "users"), 
      orderBy("updatedAt", "desc"), 
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching all users:", error);
    return { success: false, error: error.message };
  }
};

// Get a specific user's logs
export const getUserLogs = async (uid) => {
  try {
    const q = query(
      collection(db, "users", uid, "logs"), 
      orderBy("loggedAt", "desc")
    );
    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: logs };
  } catch (error) {
    console.error(`Error fetching logs for user ${uid}:`, error);
    return { success: false, error: error.message };
  }
};