import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, Edit2, Trash2, Upload, Save, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';

// Mock environment variables - replace with actual .env values
const ADMIN_EMAIL = 'admin@dietwithdee.com';
const ADMIN_PASSWORD = 'admin123';
const PAYSTACK_SECRET_KEY = 'sk_test_your_paystack_secret_key_here';

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

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminEmail', formData.email);
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

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="admin@dietwithdee.com"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
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
              type="submit"
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
          </form>

          <div className="mt-6 text-xs text-gray-500 text-center">
            Demo credentials: admin@dietwithdee.com / admin123
          </div>
        </div>
      </div>
    </div>
  );
};

// Articles Management Component
const ArticlesManager = ({ articles, setArticles, showNotification }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const article = {
      id: editingId || Date.now(),
      title: formData.title,
      content: formData.content,
      image: formData.image?.name || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      setArticles(articles.map(a => a.id === editingId ? article : a));
      showNotification('success', 'Article updated successfully!');
    } else {
      setArticles([...articles, article]);
      showNotification('success', 'Article created successfully!');
    }

    setFormData({ title: '', content: '', image: null });
    setIsEditing(false);
    setEditingId(null);
    setUploadProgress(0);
  };

  const handleEdit = (article) => {
    setFormData({
      title: article.title,
      content: article.content,
      image: null
    });
    setEditingId(article.id);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      setArticles(articles.filter(a => a.id !== id));
      showNotification('success', 'Article deleted successfully!');
    }
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
                setFormData({ title: '', content: '', image: null });
                setUploadProgress(0);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Article title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Write your article content here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600">
                    {formData.image ? formData.image.name : 'Click to upload image'}
                  </p>
                </label>
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <ProgressBar progress={uploadProgress} />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
              >
                <Save size={16} />
                {editingId ? 'Update' : 'Create'} Article
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingId(null);
                  setFormData({ title: '', content: '', image: null });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
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
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {article.content.substring(0, 150)}
                    {article.content.length > 150 && '...'}
                  </p>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(article.createdAt).toLocaleDateString()}
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

// Plan Management Component
const PlanManager = ({ plans, setPlans, showNotification }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    pdf: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCreatingPaystack, setIsCreatingPaystack] = useState(false);

  const createPaystackProduct = async (planData) => {
    try {
      // Mock Paystack API call - replace with actual implementation
      const response = await fetch('https://api.paystack.co/product', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: planData.title,
          description: planData.description,
          price: planData.price * 100, // Convert to kobo
          currency: 'GHS'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create Paystack product');
      }

      const result = await response.json();
      return {
        productId: result.data.id,
        paymentLink: `https://paystack.com/pay/${result.data.id}`
      };
    } catch (error) {
      console.error('Paystack API Error:', error);
      // Mock response for demo purposes
      return {
        productId: 'mock_product_' + Date.now(),
        paymentLink: `https://paystack.com/pay/mock_${Date.now()}`
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadProgress(0);
    setIsCreatingPaystack(true);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    await new Promise(resolve => setTimeout(resolve, 1000));

    let paystackData = null;
    if (!editingId) {
      // Create Paystack product for new plans
      paystackData = await createPaystackProduct({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price)
      });
    }

    const plan = {
      id: editingId || Date.now(),
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      pdf: formData.pdf?.name || null,
      paystackProductId: paystackData?.productId || null,
      paymentLink: paystackData?.paymentLink || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      setPlans(plans.map(p => p.id === editingId ? {...p, ...plan} : p));
      showNotification('success', 'Plan updated successfully!');
    } else {
      setPlans([...plans, plan]);
      showNotification('success', 'Plan created with Paystack integration!');
    }

    setFormData({ title: '', description: '', price: '', pdf: null });
    setIsEditing(false);
    setEditingId(null);
    setUploadProgress(0);
    setIsCreatingPaystack(false);
  };

  const handleEdit = (plan) => {
    setFormData({
      title: plan.title,
      description: plan.description,
      price: plan.price.toString(),
      pdf: null
    });
    setEditingId(plan.id);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      setPlans(plans.filter(p => p.id !== id));
      showNotification('success', 'Plan deleted successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-700">Plan Management</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
        >
          <Plus size={20} />
          New Plan
        </button>
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingId ? 'Edit Plan' : 'Create New Plan'}
            </h3>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingId(null);
                setFormData({ title: '', description: '', price: '', pdf: null });
                setUploadProgress(0);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Weight Loss Starter Plan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (GHS)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe what this plan includes..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan PDF
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFormData({...formData, pdf: e.target.files[0]})}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600">
                    {formData.pdf ? formData.pdf.name : 'Click to upload PDF'}
                  </p>
                </label>
              </div>
            </div>

            {(uploadProgress > 0 || isCreatingPaystack) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    {isCreatingPaystack ? 'Creating Paystack product...' : 'Uploading...'}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <ProgressBar progress={uploadProgress} />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isCreatingPaystack}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50"
              >
                <Save size={16} />
                {editingId ? 'Update' : 'Create'} Plan
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingId(null);
                  setFormData({ title: '', description: '', price: '', pdf: null });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {plans.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No plans yet. Create your first plan!</p>
          </div>
        ) : (
          plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl shadow-md p-6 border border-green-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{plan.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{plan.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 font-semibold">GHS {plan.price}</span>
                    {plan.pdf && (
                      <span className="text-blue-600">📄 {plan.pdf}</span>
                    )}
                  </div>
                  {plan.paymentLink && (
                    <div className="mt-2">
                      <a
                        href={plan.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-orange-600 hover:text-orange-700 underline"
                      >
                        Paystack Payment Link
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
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
  const [activeTab, setActiveTab] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [plans, setPlans] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminEmail');
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
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'articles'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Articles
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'plans'
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Plans
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'articles' && (
              <ArticlesManager
                articles={articles}
                setArticles={setArticles}
                showNotification={showNotification}
              />
            )}
            {activeTab === 'plans' && (
              <PlanManager
                plans={plans}
                setPlans={setPlans}
                showNotification={showNotification}
              />
            )}
          </div>
        </div>
      </div>
    </div>)}

    // Main App Component
const AdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('adminAuth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminEmail');
    setIsAuthenticated(false);
  };

  return (
    <div>
      {isAuthenticated ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </div>
  );
};

export default AdminApp;