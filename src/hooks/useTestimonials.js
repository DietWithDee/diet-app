import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch approved testimonials (public)
  const fetchApprovedTestimonials = useCallback(() => {
    setLoading(true);
    const q = query(
      collection(db, 'testimonials'),
      where('status', '==', 'approved'),
      orderBy('approvedAt', 'desc')
    );
    
    return onSnapshot(q, 
      (snapshot) => {
        setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching testimonials:', err);
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  // Fetch all testimonials (admin only)
  const fetchAllTestimonials = useCallback(() => {
    setLoading(true);
    const q = query(
      collection(db, 'testimonials'),
      orderBy('submittedAt', 'desc')
    );
    
    return onSnapshot(q,
      (snapshot) => {
        setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching all testimonials:', err);
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  // Submit new testimonial
  const submitTestimonial = async (data) => {
    try {
      await addDoc(collection(db, 'testimonials'), {
        ...data,
        status: 'pending',
        submittedAt: serverTimestamp(),
        isFeatured: false,
      });
      return { success: true };
    } catch (err) {
      console.error('Error submitting testimonial:', err);
      return { success: false, error: err.message };
    }
  };

  // Admin: Approve/Reject
  const updateTestimonialStatus = async (docId, status, adminUid) => {
    try {
      const docRef = doc(db, 'testimonials', docId);
      await updateDoc(docRef, {
        status,
        approvedAt: serverTimestamp(),
        approvedBy: adminUid,
      });
      return { success: true };
    } catch (err) {
      console.error('Error updating testimonial status:', err);
      return { success: false, error: err.message };
    }
  };

  // Admin: Toggle featured status
  const toggleFeatured = async (docId, isFeatured) => {
    try {
      const docRef = doc(db, 'testimonials', docId);
      await updateDoc(docRef, { isFeatured });
      return { success: true };
    } catch (err) {
      console.error('Error toggling featured status:', err);
      return { success: false, error: err.message };
    }
  };

  // Admin: Delete testimonial
  const deleteTestimonial = async (docId) => {
    try {
      await deleteDoc(doc(db, 'testimonials', docId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    testimonials,
    loading,
    error,
    fetchApprovedTestimonials,
    fetchAllTestimonials,
    submitTestimonial,
    updateTestimonialStatus,
    toggleFeatured,
    deleteTestimonial,
  };
};
