import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { getArticles, getAllEmails, getAllUsers } from '../../firebaseUtils';
import { getBookingStatus, setBookingStatus } from '../../firebaseBookingUtils';
import { useAuth } from '../../AuthContext';
import Notification from './components/Notification';
import ArticlesManager from './components/ArticlesManager';
import UserJourneyPanel from './components/UserJourneyPanel';


// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' or 'journey'
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersFetched, setUsersFetched] = useState(false);


  const showNotification = React.useCallback((type, message) => {
    setNotification({ type, message });
  }, []);

  const closeNotification = React.useCallback(() => {
    setNotification(null);
  }, []);



  // Function to fetch booking status
  const fetchBookingStatus = React.useCallback(async () => {
    const result = await getBookingStatus();
    if (result.success) {
      return result.isOpen;
    } else {
      showNotification('error', 'Failed to load booking status.');
      console.error('Error loading booking status:', result.error);
      return false; // Default to closed on error
    }
  }, [showNotification]);


  // Function to update booking status
  const updateBookingStatusInFirestore = async (status) => {
    const result = await setBookingStatus(status);
    if (result.success) {
      showNotification('success', `Bookings are now ${status ? 'open' : 'closed'}.`);
      return { success: true };
    } else {
      showNotification('error', 'Failed to update booking status.');
      console.error('Error updating booking status:', result.error);
      return { success: false };
    }
  };

  useEffect(() => {
    const getStatus = async () => {
      const status = await fetchBookingStatus();
      setIsBookingOpen(status);
    };
    getStatus();
  }, [fetchBookingStatus]);

  const handleBookingToggle = async () => {
    const newStatus = !isBookingOpen;
    const result = await updateBookingStatusInFirestore(newStatus);
    if (result.success) {
      setIsBookingOpen(newStatus);
    } else {
      showNotification('error', 'Failed to update booking status.');
    }
  };


  const loadArticles = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getArticles(true); // Pass true to include drafts and scheduled
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
  }, [showNotification]);


  useEffect(() => {
    loadArticles();
    // Fetch subscriber count
    const fetchSubscribers = async () => {
      try {
        const result = await getAllEmails();
        if (result.success) {
          setSubscriberCount(result.data?.length || 0);
        }
      } catch (err) {
        console.error('Error fetching subscriber count:', err);
      }
    };
    fetchSubscribers();
  }, [loadArticles]);


  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const loadUsers = React.useCallback(async (force = false) => {
    if (usersLoading || (usersFetched && !force)) return;
    
    setUsersLoading(true);
    try {
      const result = await getAllUsers(200);
      if (result.success) {
        setUsers(result.data || []);
        setUsersFetched(true);
      } else {
        showNotification('error', 'Failed to load user data');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      showNotification('error', 'Failed to load user data');
    } finally {
      setUsersLoading(false);
    }
  }, [usersLoading, usersFetched, showNotification]);

  // Handle tab switch - pre-fetch users if needed
  useEffect(() => {
    if (activeTab === 'journey' && !usersFetched) {
      loadUsers();
    }
  }, [activeTab, usersFetched, loadUsers]);

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
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-5 border border-green-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl font-bold flex-shrink-0">
              📧
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{subscriberCount}</p>
              <p className="text-sm text-gray-500">Total Subscribers</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border border-green-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl font-bold flex-shrink-0">
              📝
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{articles.length}</p>
              <p className="text-sm text-gray-500">Articles Published</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('journey')}
            className={`bg-white rounded-xl shadow-md p-5 border flex items-center gap-4 transition-all hover:shadow-lg text-left ${activeTab === 'journey' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-blue-100'}`}
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold flex-shrink-0">
              📊
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">User Journey</p>
              <p className="text-sm text-blue-600 font-medium">View Analytics</p>
            </div>
          </button>

        </div>

        {/* Booking Toggle UI */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-green-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-green-700">Manage Bookings</h2>
          <label htmlFor="booking-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                id="booking-toggle"
                className="sr-only"
                checked={isBookingOpen}
                onChange={handleBookingToggle}
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${isBookingOpen ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isBookingOpen ? 'translate-x-full' : ''}`}
              ></div>
            </div>
            <div className={`ml-3 font-bold transition-colors ${isBookingOpen ? 'text-green-600' : 'text-gray-700'}`}>
              {isBookingOpen ? 'Bookings Open' : 'Bookings Closed'}
            </div>
          </label>
        </div>


        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('articles')}
              className={`flex-1 py-4 px-6 text-center font-bold transition-all ${activeTab === 'articles' ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              Articles
            </button>
            <button 
              onClick={() => setActiveTab('journey')}
              className={`flex-1 py-4 px-6 text-center font-bold transition-all ${activeTab === 'journey' ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              User Journey Analytics
            </button>
          </div>


          <div className="p-6">
            {activeTab === 'articles' ? (
              isLoading ? (
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
              )
            ) : (
              <UserJourneyPanel 
                showNotification={showNotification} 
                users={users}
                loading={usersLoading}
                loadUsers={loadUsers}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
