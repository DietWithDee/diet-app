import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Migration script to deduplicate newsletter entries.
 * It reads all documents in the 'emails' collection.
 * For each document, it ensures a new document exists with the ID = email.
 * If the current document's ID is NOT the email, it deletes the old document.
 * If multiple documents have the same email, it merges them into one (email as ID).
 */
export const deduplicateNewsletterEmails = async () => {
  try {
    const emailsRef = collection(db, "emails");
    const snapshot = await getDocs(emailsRef);
    
    if (snapshot.empty) {
      return { success: true, migrated: 0, deleted: 0 };
    }

    const emailMap = new Map(); // email -> { data, originalIds }
    
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const email = data.email?.trim()?.toLowerCase();
      if (!email) return;

      if (!emailMap.has(email)) {
        emailMap.set(email, { 
          data: { ...data, email }, // Ensure email is trimmed/lowered
          originalIds: [] 
        });
      }
      emailMap.get(email).originalIds.push(docSnap.id);
    });

    let migrated = 0;
    let deleted = 0;
    const batchSize = 400; // Firestore batch limit is 500
    let currentBatch = writeBatch(db);
    let operationCount = 0;

    const commitBatchIfFull = async () => {
      if (operationCount >= batchSize) {
        await currentBatch.commit();
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    };

    for (const [email, { data, originalIds }] of emailMap.entries()) {
      // 1. Ensure the document with ID = email exists
      const targetDocRef = doc(db, "emails", email);
      currentBatch.set(targetDocRef, data, { merge: true });
      operationCount++;
      migrated++;
      await commitBatchIfFull();

      // 2. Delete any documents that are NOT the target ID
      for (const id of originalIds) {
        if (id !== email) {
          const oldDocRef = doc(db, "emails", id);
          currentBatch.delete(oldDocRef);
          operationCount++;
          deleted++;
          await commitBatchIfFull();
        }
      }
    }

    if (operationCount > 0) {
      await currentBatch.commit();
    }

    return { success: true, migrated, deleted };
  } catch (error) {
    console.error("Deduplication error:", error);
    return { success: false, error: error.message };
  }
};
