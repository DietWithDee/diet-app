import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader } from 'lucide-react';
import { createArticle, deleteArticle } from '../../../firebaseUtils';
import { sendNewArticleNewsletter } from '../../../EmailTemplateSystem/emailServices';
import RichTextEditor from './RichTextEditor';
import ProgressBar from './ProgressBar';

// Articles Management Component
const ArticlesManager = ({ articles, setArticles, showNotification, loadArticles }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Validate and preview image URL
  const handleImageUrlChange = (url) => {
    setFormData({ ...formData, imageUrl: url });

    if (url) {
      try {
        new URL(url);
        setImagePreview(url);
      } catch {
        setImagePreview('');
      }
    } else {
      setImagePreview('');
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

      const result = await createArticle(formData.title, formData.content, formData.imageUrl);

      clearInterval(interval);
      setUploadProgress(100);

      if (result.success) {
        showNotification('success', 'Article created successfully!');
        await loadArticles();

        try {
          const newsletterResult = await sendNewArticleNewsletter(
            formData.title,
            formData.imageUrl,
            result.id
          );

          if (newsletterResult.success) {
            showNotification('success', `Newsletter sent to ${newsletterResult.sent} subscribers!`);
          } else {
            showNotification('error', 'Article created but newsletter failed to send');
          }
        } catch (error) {
          console.error('Newsletter error:', error);
          showNotification('error', 'Article created but newsletter failed to send');
        }

        setFormData({ title: '', content: '', imageUrl: '' });
        setImagePreview('');
        setIsEditing(false);
        setEditingId(null);
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
      imageUrl: article.coverImage || ''
    });
    setImagePreview(article.coverImage || '');
    setEditingId(article.id);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      setArticles(articles.filter(a => a.id !== id));
      deleteArticle(id);
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
                setFormData({ title: '', content: '', imageUrl: '' });
                setImagePreview('');
                setUploadProgress(0);
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                placeholder="https://example.com/image.jpg"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a valid image URL (jpg, png, gif, webp)
              </p>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-32 object-cover rounded"
                      onError={() => setImagePreview('')}
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
                  setFormData({ title: '', content: '', imageUrl: '' });
                  setImagePreview('');
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
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-20 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
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
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Created: {formatDate(article.createdAt)}</span>
                    {article.coverImage && (
                      <span className="text-blue-600">🖼️ Has Image</span>
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
                    onClick={() => handleDelete(article.id)}
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
};

export default ArticlesManager;
