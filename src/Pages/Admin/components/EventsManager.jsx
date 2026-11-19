import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader, Calendar, MapPin, Link as LinkIcon, ExternalLink, Mail } from 'lucide-react';
import { createEvent, updateEvent, deleteEvent, getAllEvents } from '../../../firebaseEventsUtils';
import RichTextEditor from './RichTextEditor';
import ProgressBar from './ProgressBar';
import SafeImage from '../../../Components/SafeImage';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const EventsManager = React.memo(({ showNotification }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    imageUrl: '',
    eventLink: '',
    broadcastNewsletter: false
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Delete Confirmation Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEvents = async () => {
    setIsLoading(true);
    const result = await getAllEvents();
    if (result.success) {
      setEvents(result.data || []);
    } else {
      showNotification('error', 'Failed to load events');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'Image file size must be less than 5MB');
        e.target.value = '';
        return;
      }
      setFormData({ ...formData, imageUrl: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      let result;

      if (editingId) {
        result = await updateEvent(editingId, formData.title, formData.date, formData.location, formData.description, formData.imageUrl, formData.eventLink, formData.broadcastNewsletter);
      } else {
        result = await createEvent(formData.title, formData.date, formData.location, formData.description, formData.imageUrl, formData.eventLink, formData.broadcastNewsletter);
      }

      clearInterval(interval);
      setUploadProgress(100);

      if (result.success) {
        const msg = editingId
          ? (formData.broadcastNewsletter ? 'Event updated and queued for newsletter broadcast!' : 'Event updated successfully!')
          : (formData.broadcastNewsletter ? 'Event created and queued for newsletter broadcast!' : 'Event created successfully!');
        showNotification('success', msg);
        await loadEvents();
        resetForm();
      } else {
        showNotification('error', 'Failed to save event. Please try again.');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      showNotification('error', 'Failed to save event. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', date: '', location: '', description: '', imageUrl: '', eventLink: '', broadcastNewsletter: false });
    setImagePreview('');
    setIsEditing(false);
    setEditingId(null);
    setUploadProgress(0);
  };

  const formRef = React.useRef(null);

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      date: event.date || '',
      location: event.location || '',
      description: event.description || '',
      imageUrl: event.imageUrl || '',
      eventLink: event.eventLink || '',
      broadcastNewsletter: Boolean(event.broadcastNewsletter && !event.newsletterSent)
    });
    setImagePreview(event.imageUrl || '');
    setEditingId(event.id);
    setIsEditing(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    const result = await deleteEvent(eventToDelete.id, eventToDelete.imageUrl);
    if (result.success) {
      setEvents(events.filter(e => e.id !== eventToDelete.id));
      showNotification('success', 'Event deleted successfully!');
    } else {
      showNotification('error', 'Failed to delete event.');
    }
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setEventToDelete(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-stone-900">Events Management</h2>
          <p className="text-xs text-stone-500 font-medium">Create and publish community events</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsEditing(true);
            setTimeout(() => {
              formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs"
        >
          <Plus size={16} />
          <span>New Event</span>
        </button>
      </div>

      {/* Responsive Edit/Create Form */}
      {isEditing && (
        <div ref={formRef} className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-stone-200 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-stone-100">
            <h3 className="text-sm font-semibold text-stone-800">
              {editingId ? 'Edit Event' : 'Create New Event'}
            </h3>
            <button
              onClick={resetForm}
              className="text-stone-400 hover:text-stone-700 p-1"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs text-stone-900"
                placeholder="Event title"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Responsive grid for Date & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs text-stone-900"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs text-stone-900"
                  placeholder="e.g. Accra, Ghana or Zoom"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Event Link (optional)</label>
              <input
                type="url"
                value={formData.eventLink}
                onChange={(e) => setFormData({ ...formData, eventLink: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs text-stone-900"
                placeholder="e.g. https://zoom.us/j/..., https://forms.gle/..."
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">Description</label>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <RichTextEditor
                  value={formData.description}
                  onChange={(description) => setFormData({ ...formData, description })}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Featured Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-700 bg-white"
                disabled={isSubmitting}
              />
              {imagePreview && (
                <div className="mt-2.5">
                  <p className="text-[11px] font-medium text-stone-500 mb-1">Preview:</p>
                  <div className="border border-stone-200 rounded-xl p-1.5 bg-stone-50 inline-block">
                    <SafeImage
                      src={imagePreview}
                      alt="Preview"
                      className="h-28 object-contain rounded-lg"
                      wrapperClassName="h-28"
                    />
                  </div>
                </div>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Saving event...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <ProgressBar progress={uploadProgress} />
              </div>
            )}

            {/* Newsletter Broadcast Option */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 hover:bg-emerald-50/40 border border-stone-200 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.broadcastNewsletter}
                  onChange={(e) => setFormData({ ...formData, broadcastNewsletter: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  disabled={isSubmitting}
                />
                <div className="flex items-center gap-1.5 text-xs text-stone-700">
                  <Mail size={14} className="text-emerald-600 flex-shrink-0" />
                  <span className="font-medium">Broadcast as a newsletter to subscribers</span>
                  {formData.broadcastNewsletter && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Will broadcast
                    </span>
                  )}
                </div>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 transition-all shadow-xs"
              >
                {isSubmitting ? <Loader className="animate-spin" size={14} /> : <Save size={14} />}
                <span>{editingId ? 'Update' : 'Create'} Event</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="px-3.5 py-2 border border-stone-200 text-stone-700 rounded-xl text-xs font-medium hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="grid gap-3">
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
            <Loader className="animate-spin mx-auto text-emerald-600" size={24} />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-stone-400 bg-white rounded-2xl border border-stone-200 text-xs">
            No events found. Tap "New Event" to create one.
          </div>
        ) : (
          events.map(event => {
            const isUpcoming = new Date(event.date) >= new Date(new Date().setHours(0,0,0,0));
            return (
              <div key={event.id} className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs flex flex-col sm:flex-row gap-3.5 items-start">
                {event.imageUrl && (
                  <div className="w-full sm:w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100">
                    <SafeImage
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      wrapperClassName="w-full h-full"
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between w-full">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-semibold text-stone-900 leading-snug">{event.title}</h3>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {event.newsletterSent ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Mail size={10} /> Newsletter Sent
                          </span>
                        ) : event.broadcastNewsletter ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Mail size={10} /> Queued
                          </span>
                        ) : null}
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${isUpcoming ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500'}`}>
                          {isUpcoming ? 'Upcoming' : 'Past'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 mt-1.5">
                      <span className="flex items-center gap-1"><Calendar size={13} className="text-stone-400" /> {event.date}</span>
                      {event.location && <span className="flex items-center gap-1"><MapPin size={13} className="text-stone-400" /> {event.location}</span>}
                      {event.eventLink && (
                        <a href={event.eventLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-700 hover:underline truncate max-w-[200px]">
                          <ExternalLink size={12} />
                          <span>Link</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-3 self-end">
                    <button 
                      onClick={() => handleEdit(event)} 
                      className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition-colors text-xs flex items-center gap-1"
                    >
                      <Edit2 size={13} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(event)} 
                      className="p-1.5 text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEventToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        itemName={eventToDelete?.title}
        isLoading={isDeleting}
      />
    </div>
  );
});

export default EventsManager;
