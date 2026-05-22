import React, { useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

function SubmissionReviewModal({ testimonial, onApprove, onReject, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    await onApprove();
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    await onReject();
    setIsSubmitting(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) return timestamp.toDate().toLocaleString();
    if (timestamp instanceof Date) return timestamp.toLocaleString();
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 p-6 flex justify-between items-center text-white'>
          <div>
            <h2 className='text-2xl font-bold'>Review Testimonial</h2>
            <p className='text-green-100 text-sm'>Approve or reject this submission</p>
          </div>
          <button onClick={onClose} className='hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition'>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='p-8 space-y-6'>
          {/* Submission Details */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-600'>Name</p>
              <p className='font-bold text-lg'>{testimonial.name}</p>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Email</p>
              <p className='font-semibold text-gray-800'>{testimonial.email}</p>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Location</p>
              <p className='font-semibold'>{testimonial.location}</p>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Profession</p>
              <p className='font-semibold'>{testimonial.profession || '—'}</p>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Plan</p>
              <p className='font-semibold capitalize'>{(testimonial.plan || '').replace(/-/g, ' ')}</p>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Rating</p>
              <div className='flex'>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                ))}
              </div>
            </div>
          </div>

          <hr className='my-6' />

          {/* Testimonial Content */}
          <div>
            <p className='text-sm text-gray-600 font-semibold mb-3'>Testimonial</p>
            <p className='text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg italic'>
              "{testimonial.content}"
            </p>
          </div>

          {/* Submission Date */}
          <div className='text-xs text-gray-500'>
            Submitted: {formatDate(testimonial.submittedAt)}
          </div>
        </div>

        {/* Actions Footer */}
        <div className='sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3'>
          <button
            onClick={onClose}
            className='px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition'
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className='px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2'
          >
            <XCircle size={18} /> Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className='px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2 ml-auto'
          >
            <CheckCircle size={18} /> Approve
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubmissionReviewModal;
