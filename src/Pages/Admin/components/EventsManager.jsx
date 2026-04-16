import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader, Calendar, MapPin } from 'lucide-react';
import { createEvent, updateEvent, deleteEvent, getAllEvents } from '../../../firebaseEventsUtils';
import RichTextEditor from './RichTextEditor';
import ProgressBar from './ProgressBar';
import SafeImage from '../../../Components/SafeImage';

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
    imageUrl: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

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
        result = await updateEvent(editingId, formData.title, formData.date, formData.location, formData.description, formData.imageUrl);
      } else {
        result = await createEvent(formData.title, formData.date, formData.location, formData.description, formData.imageUrl);
      }

      clearInterval(interval);
      setUploadProgress(100);

      if (result.success) {
        showNotification('success', editingId ? 'Event updated successfully!' : 'Event created successfully!');
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

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const resetForm = () => {
    setFormData({ title: '', date: '', location: '', description: '', imageUrl: '' });
    setImagePreview('');
    setIsEditing(false);
    setEditingId(null);
    setUploadProgress(0);
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      date: event.date || '',
      location: event.location || '',
      description: event.description || '',
      imageUrl: event.imageUrl || ''
    });
    setImagePreview(event.imageUrl || '');
    setEditingId(event.id);
    setIsEditing(true);
  };

  const handleDelete = async (event) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const result = await deleteEvent(event.id, event.imageUrl);
      if (result.success) {
        setEvents(events.filter(e => e.id !== event.id));
        showNotification('success', 'Event deleted successfully!');
      } else {
        showNotification('error', 'Failed to delete event.');
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-700">Events Management</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-bold"
        >
          <Plus size={20} />
          New Event
        </button>
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingId ? 'Edit Event' : 'Create New Event'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-800"
                placeholder="Event title"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-800"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-800"
                  placeholder="e.g. Accra, Ghana or Zoom"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Description</label>
              <RichTextEditor
                value={formData.description}
                onChange={(description) => setFormData({ ...formData, description })}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white"
                disabled={isSubmitting}
              />
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 inline-block">
                    <SafeImage
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 object-contain rounded"
                      wrapperClassName="h-32"
                    />
                  </div>
                </div>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Saving event...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <ProgressBar progress={uploadProgress} />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
              >
                {isSubmitting ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                {editingId ? 'Update' : 'Create'} Event
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {isLoading ? (
           <div className="text-center py-12"><Loader className="animate-spin mx-auto text-green-600" size={32} /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No events found. Create your first event!</p>
          </div>
        ) : (
          events.map(event => {
            const isUpcoming = new Date(event.date) >= new Date(new Date().setHours(0,0,0,0));
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-md p-6 border border-green-100 flex flex-col sm:flex-row gap-4">
                {event.imageUrl && (
                  <div className="w-full sm:w-32 h-32 flex-shrink-0">
                    <SafeImage
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover rounded-lg"
                      wrapperClassName="w-full h-full"
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${isUpcoming ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {isUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                       <span className="flex items-center gap-1"><Calendar size={14}/> {event.date}</span>
                       {event.location && <span className="flex items-center gap-1"><MapPin size={14}/> {event.location}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 self-end">
                    <button onClick={() => handleEdit(event)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(event)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

export default EventsManager;
