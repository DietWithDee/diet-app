// firebaseUtils.js
import { db, storage } from "../../src/firebaseConfig"; 
import { collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// CREATE article with cover image
export const createArticle = async (title, content, imageFile) => {
  try {
    let imageUrl = "";

    if (imageFile) {
      const storageRef = ref(storage, `coverImages/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const docRef = await addDoc(collection(db, "articles"), {
      title,
      content,
      coverImage: imageUrl,
      createdAt: Timestamp.now(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating article:", error);
    return { success: false, error };
  }
};

export const getArticles = async () => {
  try {
    const snapshot = await getDocs(collection(db, "articles"));
    const articles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, data: articles };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return { success: false, error };
  }
};