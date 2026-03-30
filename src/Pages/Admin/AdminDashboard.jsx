import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { getArticles, getAllEmails, getAllUsers, getAllUsersPaged } from '../../firebaseUtils';

import { useAuth } from '../../AuthContext';
import Notification from './components/Notification';
import ArticlesManager from './components/ArticlesManager';
import UserJourneyPanel from './components/UserJourneyPanel';
import BookingsPanel from './components/BookingsPanel';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'journey' | 'bookings'
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersFetched, setUsersFetched] = useState(false);
  const [lastVisibleUser, setLastVisibleUser] = useState(null);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [contactedBookings, setContactedBookings] = useState(0);


  useEffect(() => {
    // Listener for pending bookings
    const qPending = query(collection(db, 'bookings'), where('status', '==', 'pending'));
    const unsubscribePending = onSnapshot(qPending, (snapshot) => {
      setPendingBookings(snapshot.docs.length);
    });

    // Listener for contacted bookings
    const qContacted = query(collection(db, 'bookings'), where('status', '==', 'contacted'));
    const unsubscribeContacted = onSnapshot(qContacted, (snapshot) => {
      setContactedBookings(snapshot.docs.length);
    });

    return () => {
      unsubscribePending();
      unsubscribeContacted();
    };
  }, []);

  const showNotification = React.useCallback((type, message) => {
    setNotification({ type, message });
  }, []);

  const closeNotification = React.useCallback(() => {
    setNotification(null);
  }, []);



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

  const loadUsers = React.useCallback(async (force = false, isNextPage = false) => {
    if (usersLoading) return;
    if (usersFetched && !force && !isNextPage) return;
    
    setUsersLoading(true);
    try {
      const pageSize = 20;
      const result = await getAllUsersPaged(pageSize, isNextPage ? lastVisibleUser : null);
      
      if (result.success) {
        if (isNextPage) {
          setUsers(prev => [...prev, ...result.data]);
        } else {
          setUsers(result.data || []);
        }
        setLastVisibleUser(result.lastVisible);
        setHasMoreUsers(result.hasMore);
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
  }, [usersLoading, usersFetched, lastVisibleUser, showNotification]);

  

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
          
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`bg-white rounded-xl shadow-md p-5 border flex items-center gap-4 transition-all hover:shadow-lg text-left ${activeTab === 'bookings' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-amber-100'}`}
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xl font-bold flex-shrink-0">
              📅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold text-gray-800">{pendingBookings}</p>
                  {pendingBookings > 0 && (
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" title="Pending Contact"></span>
                  )}
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold text-gray-800">{contactedBookings}</p>
                  {contactedBookings > 0 && (
                    <span className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" title="Contacted / In Progress"></span>
                  )}
                </div>
              </div>
              <p className="text-sm text-amber-600 font-medium">Pending Bookings</p>
            </div>
          </button>

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
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 flex justify-center items-center gap-2 py-4 px-6 text-center font-bold transition-all ${activeTab === 'bookings' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              Bookings Manager
              {pendingBookings > 0 && (
                <div className="relative">
                  <span className="flex items-center justify-center px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full min-w-[20px] leading-tight">
                    {pendingBookings}
                  </span>
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25"></span>
                </div>
              )}
              {contactedBookings > 0 && (
                <div className="relative">
                  <span className="flex items-center justify-center px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] rounded-full min-w-[20px] leading-tight font-black">
                    {contactedBookings}
                  </span>
                  <span className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-25"></span>
                </div>
              )}
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
            ) : activeTab === 'journey' ? (
              <UserJourneyPanel 
                showNotification={showNotification} 
                users={users}
                loading={usersLoading}
                loadUsers={loadUsers}
                hasMore={hasMoreUsers}
              />
            ) : (

              <BookingsPanel showNotification={showNotification} />
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
