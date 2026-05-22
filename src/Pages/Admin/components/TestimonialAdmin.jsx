import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../AuthContext';
import { useTestimonials } from '../../../hooks/useTestimonials';
import { CheckCircle, XCircle, Trash2, Star, Loader2 } from 'lucide-react';
import SubmissionReviewModal from './SubmissionReviewModal';

function TestimonialAdmin() {
  const { user } = useAuth();
  const { testimonials, loading, fetchAllTestimonials, updateTestimonialStatus, toggleFeatured, deleteTestimonial } = useTestimonials();
  
  const [filter, setFilter] = useState('pending');
  const [selectedForReview, setSelectedForReview] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchAllTestimonials();
  }, [fetchAllTestimonials]);

  const filtered = testimonials.filter(t => 
    filter === 'all' ? true : t.status === filter
  );

  const getTabCount = (tabName) => {
    return testimonials.filter(t => 
      tabName === 'all' ? true : t.status === tabName
    ).length;
  };

  const handleApprove = async (docId) => {
    setActionLoading(prev => ({ ...prev, [docId]: true }));
    const result = await updateTestimonialStatus(docId, 'approved', user?.uid);
    if (result.success) {
      setSelectedForReview(null);
    }
    setActionLoading(prev => ({ ...prev, [docId]: false }));
  };

  const handleReject = async (docId) => {
    setActionLoading(prev => ({ ...prev, [docId]: true }));
    const result = await updateTestimonialStatus(docId, 'rejected', user?.uid);
    if (result.success) {
      setSelectedForReview(null);
    }
    setActionLoading(prev => ({ ...prev, [docId]: false }));
  };

  const handleToggleFeatured = async (docId, currentFeatured) => {
    setActionLoading(prev => ({ ...prev, [docId]: true }));
    await toggleFeatured(docId, !currentFeatured);
    setActionLoading(prev => ({ ...prev, [docId]: false }));
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      setActionLoading(prev => ({ ...prev, [docId]: true }));
      await deleteTestimonial(docId);
      setActionLoading(prev => ({ ...prev, [docId]: false }));
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='animate-spin w-8 h-8 text-green-600' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Testimonial Management</h2>
        <p className='text-gray-600'>Review and approve customer testimonials</p>
      </div>

      {/* Filter Tabs */}
      <div className='flex gap-2 flex-wrap'>
        {['pending', 'approved', 'rejected', 'all'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === tab
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({getTabCount(tab)})
          </button>
        ))}
      </div>

      {/* Testimonials Grid */}
      <div className='grid gap-4'>
        {filtered.length === 0 ? (
          <div className='bg-gray-50 p-8 rounded-lg text-center text-gray-600'>
            No testimonials to display
          </div>
        ) : (
          filtered.map(testimonial => (
            <div key={testimonial.id} className='bg-white border-l-4 border-green-500 p-6 rounded-lg shadow hover:shadow-md transition-shadow'>
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h3 className='font-bold text-lg text-gray-800'>{testimonial.name}</h3>
                  <p className='text-sm text-gray-600'>{testimonial.location} • {testimonial.profession}</p>
                  <p className='text-xs text-gray-500 mt-1'>Plan: <span className='font-semibold'>{testimonial.plan}</span></p>
                </div>
                <div className='flex gap-2'>
                  {testimonial.status === 'approved' && (
                    <span className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold'>✓ Approved</span>
                  )}
                  {testimonial.status === 'pending' && (
                    <span className='px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold'>⏳ Pending</span>
                  )}
                  {testimonial.status === 'rejected' && (
                    <span className='px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold'>✗ Rejected</span>
                  )}
                </div>
              </div>

              <p className='text-gray-700 mb-4 italic'>"{testimonial.content.substring(0, 150)}..."</p>

              <div className='flex gap-2 flex-wrap'>
                {testimonial.status === 'pending' && (
                  <>
                    <button
                      onClick={() => setSelectedForReview(testimonial)}
                      className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-semibold'
                    >
                      Review
                    </button>
                    <button
                      onClick={() => handleReject(testimonial.id)}
                      disabled={actionLoading[testimonial.id]}
                      className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm flex items-center gap-1 disabled:opacity-50'
                    >
                      <XCircle size={16} /> {actionLoading[testimonial.id] ? 'Rejecting...' : 'Reject'}
                    </button>
                  </>
                )}

                {testimonial.status === 'approved' && (
                  <>
                    <button
                      onClick={() => handleToggleFeatured(testimonial.id, testimonial.isFeatured)}
                      disabled={actionLoading[testimonial.id]}
                      className={`px-4 py-2 rounded text-sm font-semibold flex items-center gap-1 disabled:opacity-50 ${
                        testimonial.isFeatured
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      <Star size={16} /> {testimonial.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleDelete(testimonial.id)}
                  disabled={actionLoading[testimonial.id]}
                  className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm flex items-center gap-1 ml-auto disabled:opacity-50'
                >
                  <Trash2 size={16} /> {actionLoading[testimonial.id] ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedForReview && (
        <SubmissionReviewModal
          testimonial={selectedForReview}
          onApprove={() => handleApprove(selectedForReview.id)}
          onReject={() => handleReject(selectedForReview.id)}
          onClose={() => setSelectedForReview(null)}
        />
      )}
    </div>
  );
}

export default TestimonialAdmin;
