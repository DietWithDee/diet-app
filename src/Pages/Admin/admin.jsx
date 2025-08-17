import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle, Loader, Bold, Italic, Underline, List, ListOrdered, Link, Quote, Type } from 'lucide-react';
import { createArticle, getArticles , deleteArticle} from '../../firebaseUtils';
import { sendNewArticleNewsletter } from '../../EmailTemplateSystem/emailServices';
import NoIndex from "../../Components/NoIndex";

// Mock environment variables
const ADMIN_EMAIL = 'admin@dietwithdee.org';
const ADMIN_PASSWORD = 'admin123';

// Rich Text Editor Component - FIXED VERSION
const RichTextEditor = ({ value, onChange, disabled = false }) => {
  const editorRef = useRef(null);
  const [isActive, setIsActive] = useState({
    bold: false,
    italic: false,
    underline: false
  });

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command, value = null) => {
    if (disabled) return;
    
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateContent();
    checkActiveStates();
  };

  const updateContent = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const checkActiveStates = () => {
    setIsActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline')
    });
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    
    // Handle common shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
      }
    }
  };

  const insertLink = () => {
    if (disabled) return;
    
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const formatBlock = (tag) => {
    if (disabled) return;
    execCommand('formatBlock', tag);
  };

  const insertQuote = () => {
    if (disabled) return;
    
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (selectedText) {
      // If text is selected, wrap it in a styled blockquote
      const quoteHtml = `<blockquote style="border-left: 4px solid #10b981; padding-left: 16px; margin: 16px 0; font-style: italic; color: #059669;">${selectedText}</blockquote>`;
      execCommand('insertHTML', quoteHtml);
    } else {
      // If no text selected, insert an empty blockquote
      const quoteHtml = `<blockquote style="border-left: 4px solid #10b981; padding-left: 16px; margin: 16px 0; font-style: italic; color: #059669;">Your quote here...</blockquote><br>`;
      execCommand('insertHTML', quoteHtml);
    }
  };

  const insertList = (ordered = false) => {
    if (disabled) return;
    
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (selectedText) {
      // Split selected text into lines and create list items
      const lines = selectedText.split('\n').filter(line => line.trim() !== '');
      const listItems = lines.map(line => `<li>${line.trim()}</li>`).join('');
      const listHtml = ordered 
        ? `<ol style="margin: 16px 0; padding-left: 24px;">${listItems}</ol>`
        : `<ul style="margin: 16px 0; padding-left: 24px;">${listItems}</ul>`;
      execCommand('insertHTML', listHtml);
    } else {
      // Insert empty list
      const listHtml = ordered 
        ? `<ol style="margin: 16px 0; padding-left: 24px;"><li>List item 1</li><li>List item 2</li></ol><br>`
        : `<ul style="margin: 16px 0; padding-left: 24px;"><li>List item 1</li><li>List item 2</li></ul><br>`;
      execCommand('insertHTML', listHtml);
    }
  };

  const ToolbarButton = ({ onClick, active, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? 'bg-green-100 text-green-700' : 'text-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 bg-gray-50 flex flex-wrap gap-1 text-gray-800">
        <ToolbarButton 
          onClick={() => execCommand('bold')} 
          active={isActive.bold}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={() => execCommand('italic')} 
          active={isActive.italic}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={() => execCommand('underline')} 
          active={isActive.underline}
          title="Underline (Ctrl+U)"
        >
          <Underline size={16} />
        </ToolbarButton>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton 
          onClick={() => insertList(false)}
          title="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={() => insertList(true)}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton 
          onClick={insertQuote}
          title="Quote"
        >
          <Quote size={16} />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={insertLink}
          title="Insert Link"
        >
          <Link size={16} />
        </ToolbarButton>
        
        <div className="w-px h-6 bg-gray-300 mx-1 text-gray-800" />
        
        <select 
          className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-800"
          onChange={(e) => formatBlock(e.target.value)}
          disabled={disabled}
          defaultValue=""
        >
          <option value="">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraph</option>
        </select>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={updateContent}
        onKeyUp={checkActiveStates}
        onMouseUp={checkActiveStates}
        onKeyDown={handleKeyDown}
        className={`p-3 min-h-[200px] focus:outline-none ${
          disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white text-gray-800'
        }`}
        style={{
          fontSize: '14px',
          lineHeight: '1.5'
        }}
        suppressContentEditableWarning={true}
        placeholder="Write your article content here..."
      />
    </div>
  );
};

// Notification Component
const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
      type === 'success' 
        ? 'bg-green-50 border-green-500 text-green-800' 
        : 'bg-red-50 border-red-500 text-red-800'
    }`}>
      <div className="flex items-center gap-2">
        {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-60">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
);

// Login Component
const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Invalid email or password');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600">
              DietWithDee
            </h1>
            <p className="text-gray-600 mt-2">Admin Panel</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                  placeholder="admin@dietwithdee.org"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12 text-gray-800"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center">
            Demo credentials: admin@dietwithdee.org / admin123
          </div>
        </div>
      </div>
    </div>
  );
};

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
    setFormData({...formData, imageUrl: url});
    
    if (url) {
      // Simple URL validation
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

    // Scroll to top on step change
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
      // Call delete function from firebaseUtils or backend
      deleteArticle(id);
      showNotification('success', 'Article deleted successfully!');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    
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
                onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                onChange={(content) => setFormData({...formData, content})}
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

// Main Admin Dashboard Component
const AdminDashboard = ({ onLogout }) => {
  const [articles, setArticles] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const result = await getArticles();
      if (result.success) {
        setArticles(result.data || []);
      } else {
        showNotification('error', 'Failed to load articles');
        console.error('Error loading articles:', result.error);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      showNotification('error', 'Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}

      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600">
              DietWithDee Admin
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <div className="flex-1 py-4 px-6 text-center font-medium text-green-600 border-b-2 border-green-600 bg-green-50">
              Articles
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-green-600" size={32} />
                <span className="ml-2 text-gray-600">Loading articles...</span>
              </div>
            ) : (
              <ArticlesManager
                articles={articles}
                setArticles={setArticles}
                showNotification={showNotification}
                loadArticles={loadArticles}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// Main App Component
const AdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };


  return (
    <NoIndex>
    <div>
      {isAuthenticated ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </div>
    </NoIndex>
  );
};

export default AdminApp;

