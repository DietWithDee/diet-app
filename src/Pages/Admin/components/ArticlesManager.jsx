import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader, Tag } from 'lucide-react';
import { createArticle, updateArticle, deleteArticle, getArticleTags } from '../../../firebaseUtils';
import RichTextEditor from './RichTextEditor';
import ProgressBar from './ProgressBar';
import SafeImage from '../../../Components/SafeImage';

// Articles Management Component
const ArticlesManager = React.memo(({ articles, setArticles, showNotification, loadArticles }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    status: 'published',
    scheduledPublishDate: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Fetch tags for suggestions
  const fetchTags = React.useCallback(async () => {
    const res = await getArticleTags();
    if (res.success) setAllTags(res.data);
  }, []);

  React.useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Validate and preview image file or URL
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'Image file size must be less than 5MB');
        e.target.value = ''; // clear selection
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
      const finalStatus = formData.status;
      const finalDate = finalStatus === 'scheduled' ? formData.scheduledPublishDate : null;

      if (editingId) {
        result = await updateArticle(editingId, formData.title, formData.content, formData.imageUrl, finalStatus, finalDate, formData.tags);
      } else {
        result = await createArticle(formData.title, formData.content, formData.imageUrl, finalStatus, finalDate, formData.tags);
      }

      clearInterval(interval);
      setUploadProgress(100);

      if (result.success) {
        showNotification('success', editingId ? 'Article updated successfully!' : 'Article created successfully!');
        await loadArticles();
        await fetchTags(); // Refresh suggestions with new tags

        setFormData({ title: '', content: '', imageUrl: '', status: 'published', scheduledPublishDate: '', tags: [] });
        setImagePreview('');
        setIsEditing(false);
        setEditingId(null);
        setTagInput('');
      } else {
        showNotification('error', 'Failed to create article. Please try again.');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      showNotification('error', 'Failed to create article. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleEdit = (article) => {
    setFormData({
      title: article.title,
      content: article.content,
      imageUrl: article.coverImage || '',
      status: article.status || 'published',
      scheduledPublishDate: article.scheduledPublishDate && article.scheduledPublishDate.toDate
        ? article.scheduledPublishDate.toDate().toISOString().slice(0, 16)
        : '',
      tags: article.tags || []
    });
    setImagePreview(article.coverImage || '');
    setEditingId(article.id);
    setIsEditing(true);
  };

  const handleDelete = (article) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      setArticles(articles.filter(a => a.id !== article.id));
      deleteArticle(article.id, article.coverImage, article.content);
      showNotification('success', 'Article deleted successfully!');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-700">Articles Management</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-bold"
        >
          <Plus size={20} />
          New Article
        </button>
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingId ? 'Edit Article' : 'Create New Article'}
            </h3>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingId(null);
                setFormData({ title: '', content: '', imageUrl: '', status: 'published', scheduledPublishDate: '', tags: [] });
                setImagePreview('');
                setUploadProgress(0);
                setTagInput('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                placeholder="Article title"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Content
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-2">
                Use the toolbar to format your text. Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline)
              </p>
            </div>

            {/* Tags Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                      className="hover:text-green-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const tag = tagInput.trim().toLowerCase();
                        if (tag && !formData.tags.includes(tag)) {
                          setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                          setTagInput('');
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                    placeholder="Type a tag and press Enter"
                    disabled={isSubmitting}
                  />
                  {tagInput && allTags.filter(t => t.startsWith(tagInput.toLowerCase()) && !formData.tags.includes(t)).length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {allTags
                        .filter(t => t.startsWith(tagInput.toLowerCase()) && !formData.tags.includes(t))
                        .map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                              setTagInput('');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-green-50 text-gray-700 text-sm"
                          >
                            {tag}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const tag = tagInput.trim().toLowerCase();
                    if (tag && !formData.tags.includes(tag)) {
                      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                      setTagInput('');
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tags help with article recommendations. Suggested: {allTags.slice(0, 5).join(', ')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 bg-white"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a valid image file (jpg, png, gif, webp)
              </p>

              {/* Status and Scheduling */}
              <div className="mt-4 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 bg-white"
                    disabled={isSubmitting}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                {formData.status === 'scheduled' && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publish Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledPublishDate}
                      onChange={(e) => setFormData({ ...formData, scheduledPublishDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                      disabled={isSubmitting}
                      required={formData.status === 'scheduled'}
                    />
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <SafeImage
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-32 object-cover rounded"
                      wrapperClassName="max-w-full h-32"
                    />
                  </div>
                </div>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Creating article...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <ProgressBar progress={uploadProgress} />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingId ? 'Update' : 'Create'} Article
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingId(null);
                  setFormData({ title: '', content: '', imageUrl: '', status: 'published', scheduledPublishDate: '', tags: [] });
                  setImagePreview('');
                  setTagInput('');
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No articles yet. Create your first article!</p>
          </div>
        ) : (
          articles.map(article => (
            <div key={article.id} className="bg-white rounded-xl shadow-md p-6 border border-green-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  {article.coverImage && (
                    <div className="mb-3">
                      <SafeImage
                        src={article.coverImage}
                        alt={article.title}
                        className="w-20 h-16 object-cover rounded-lg"
                        wrapperClassName="w-20 h-16"
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{article.title}</h3>
                  <div
                    className="text-gray-600 text-sm mb-2 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: article.content.length > 150
                        ? article.content.substring(0, 150) + '...'
                        : article.content
                    }}
                  />
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-medium border border-gray-200">
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Created: {formatDate(article.createdAt)}</span>
                    <span className={`font-medium px-2 py-0.5 rounded-full ${article.status === 'published' ? 'bg-green-100 text-green-700' : article.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {article.status ? article.status.charAt(0).toUpperCase() + article.status.slice(1) : 'Published'}
                    </span>
                    {article.status === 'scheduled' && article.scheduledPublishDate && (
                       <span>Scheduled: {formatDate(article.scheduledPublishDate)}</span>
                    )}
                    {article.coverImage && (
                      <span className="text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full bg-gray-50">🖼️ Image</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(article)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(article)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default ArticlesManager;
