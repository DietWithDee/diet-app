import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import logo from '../../assets/LOGO.webp';
import { 
  LayoutDashboard,
  Loader, 
  Calendar, 
  Users, 
  FileText, 
  Mail, 
  MessageSquare, 
  ClipboardList, 
  Ticket, 
  Menu, 
  X, 
  ExternalLink, 
  LogOut, 
  RefreshCw, 
  ShieldCheck
} from 'lucide-react';
import { getArticles, getAllEmails, getAllUsers } from '../../firebaseUtils';
import { useAuth } from '../../AuthContext';
import Notification from './components/Notification';
import DashboardOverview from './components/DashboardOverview';
import ArticlesManager from './components/ArticlesManager';
import UserJourneyPanel from './components/UserJourneyPanel';
import BookingsPanel from './components/BookingsPanel';
import EventsManager from './components/EventsManager';
import SubscribersPanel from './components/SubscribersPanel';
import TestimonialAdmin from './components/TestimonialAdmin';
import SurveysPanel from './components/SurveysPanel';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const AdminDashboard = () => {
  const { tab: tabFromPath } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const refFromUrl = searchParams.get('ref');

  // Allowed tabs: 'dashboard' | 'bookings' | 'journey' | 'articles' | 'subscribers' | 'testimonials' | 'surveys' | 'events'
  const validTabs = useMemo(() => [
    'dashboard', 
    'bookings', 
    'journey', 
    'articles', 
    'subscribers', 
    'testimonials', 
    'surveys', 
    'events'
  ], []);

  // Determine current active tab from:
  // 1. Path param: /admin/:tab
  // 2. Query param: ?tab=... (for backwards compatibility)
  // 3. Default: 'dashboard'
  const resolveTab = useCallback(() => {
    if (tabFromPath && validTabs.includes(tabFromPath.toLowerCase())) {
      return tabFromPath.toLowerCase();
    }
    const tabFromQuery = searchParams.get('tab');
    if (tabFromQuery && validTabs.includes(tabFromQuery.toLowerCase())) {
      return tabFromQuery.toLowerCase();
    }
    return 'dashboard';
  }, [tabFromPath, searchParams, validTabs]);

  // Synchronous state for ZERO-DELAY (0ms) instant tab switching!
  const [activeTab, setActiveTabState] = useState(resolveTab);

  // Sync state if URL changes externally (e.g. browser back/forward buttons or direct link)
  useEffect(() => {
    const currentResolved = resolveTab();
    if (currentResolved !== activeTab) {
      setActiveTabState(currentResolved);
    }
  }, [resolveTab]);

  // Cleanly redirect bare /admin or legacy /admin?tab=xyz to clean path /admin/xyz
  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      const tab = resolveTab();
      const ref = searchParams.get('ref');
      const search = (tab === 'bookings' && ref) ? `?ref=${encodeURIComponent(ref)}` : '';
      navigate(`/admin/${tab}${search}`, { replace: true });
    }
  }, [location.pathname, resolveTab, searchParams, navigate]);

  const setActiveTab = useCallback((newTab) => {
    if (!validTabs.includes(newTab)) return;

    // 1. Update local state immediately on current frame for 0ms instantaneous switch!
    setActiveTabState(newTab);
    setIsMobileMenuOpen(false);

    // 2. Synchronize URL path to /admin/:tab without blocking the UI
    const ref = searchParams.get('ref');
    const search = (newTab === 'bookings' && ref) ? `?ref=${encodeURIComponent(ref)}` : '';
    navigate(`/admin/${newTab}${search}`, { replace: false });
  }, [validTabs, searchParams, navigate]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersFetched, setUsersFetched] = useState(false);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [contactedBookings, setContactedBookings] = useState(0);
  const [pendingTestimonials, setPendingTestimonials] = useState(0);
  const [draftArticlesCount, setDraftArticlesCount] = useState(0);
  const [surveyCount, setSurveyCount] = useState(0);

  const { user, signOut } = useAuth();

  // Listeners for real-time counts across the collections
  useEffect(() => {
    const qPending = query(collection(db, 'bookings'), where('status', '==', 'pending'));
    const unsubscribePending = onSnapshot(qPending, (snapshot) => {
      setPendingBookings(snapshot.docs.length);
    });

    const qContacted = query(collection(db, 'bookings'), where('status', '==', 'contacted'));
    const unsubscribeContacted = onSnapshot(qContacted, (snapshot) => {
      setContactedBookings(snapshot.docs.length);
    });

    const qTestimonials = query(collection(db, 'testimonials'), where('status', '==', 'pending'));
    const unsubscribeTestimonials = onSnapshot(qTestimonials, (snapshot) => {
      setPendingTestimonials(snapshot.docs.length);
    });

    const qDraftArticles = query(collection(db, 'articles'), where('status', '==', 'draft'));
    const unsubscribeDraftArticles = onSnapshot(qDraftArticles, (snapshot) => {
      setDraftArticlesCount(snapshot.docs.length);
    }, (err) => {
      console.warn('Draft articles listener:', err);
    });

    const qSurveys = query(collection(db, 'surveys'));
    const unsubscribeSurveys = onSnapshot(qSurveys, (snapshot) => {
      setSurveyCount(snapshot.docs.length);
    });

    return () => {
      unsubscribePending();
      unsubscribeContacted();
      unsubscribeTestimonials();
      unsubscribeDraftArticles();
      unsubscribeSurveys();
    };
  }, []);

  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getArticles(true);
      if (result.success) {
        setArticles(result.data || []);
      } else {
        showNotification('error', 'Failed to load articles');
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      showNotification('error', 'Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const loadUsers = useCallback(async (force = false) => {
    if (usersLoading) return;
    if (usersFetched && !force) return;
    
    setUsersLoading(true);
    try {
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.data || []);
        setUsersFetched(true);
      } else {
        showNotification('error', 'Failed to load user journeys');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      showNotification('error', 'Failed to load user journeys');
    } finally {
      setUsersLoading(false);
    }
  }, [usersLoading, usersFetched, showNotification]);

  // Initial background data fetch (runs once on mount)
  useEffect(() => {
    loadArticles();
    loadUsers();

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
  }, [loadArticles, loadUsers]);

  const handleLogout = async () => {
    await signOut();
  };

  const navItems = [
    {
      group: 'Overview',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
        }
      ]
    },
    {
      group: 'Clinical Operations',
      items: [
        {
          id: 'bookings',
          label: 'Bookings',
          icon: Calendar,
          badge: pendingBookings > 0 ? `${pendingBookings} New` : null,
          badgeColor: 'bg-rose-500 text-white animate-pulse',
        },
        {
          id: 'journey',
          label: 'User Journeys',
          icon: Users,
          badge: users.length > 0 ? `${users.length}` : null,
          badgeColor: 'bg-stone-800 text-stone-300',
        },
      ]
    },
    {
      group: 'Content & Publishing',
      items: [
        {
          id: 'articles',
          label: 'Articles & Blog',
          icon: FileText,
          badge: draftArticlesCount > 0 
            ? `${draftArticlesCount} Draft${draftArticlesCount === 1 ? '' : 's'}` 
            : (articles.length > 0 ? `${articles.length}` : null),
          badgeColor: draftArticlesCount > 0 
            ? 'bg-amber-500 text-white animate-pulse' 
            : 'bg-stone-800 text-stone-300',
        },
        {
          id: 'subscribers',
          label: 'Subscribers',
          icon: Mail,
          badge: subscriberCount > 0 ? `${subscriberCount}` : null,
          badgeColor: 'bg-emerald-950 text-emerald-400',
        },
        {
          id: 'testimonials',
          label: 'Testimonials',
          icon: MessageSquare,
          badge: pendingTestimonials > 0 ? `${pendingTestimonials}` : null,
          badgeColor: 'bg-rose-500 text-white animate-pulse',
        },
        {
          id: 'surveys',
          label: 'Surveys',
          icon: ClipboardList,
          badge: surveyCount > 0 ? `${surveyCount}` : null,
          badgeColor: 'bg-amber-950 text-amber-400',
        },
        {
          id: 'events',
          label: 'Events Manager',
          icon: Ticket,
        },
      ]
    }
  ];

  const currentTabMeta = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Clinical Dashboard', subtitle: 'Executive overview of appointments, patient progress, and community' };
      case 'bookings':
        return { title: 'Consultation Bookings', subtitle: 'Manage client bookings, health snapshots, and outreach' };
      case 'journey':
        return { title: 'User Journey Analytics', subtitle: 'Explore client health profiles, weight logs, and BMI progress' };
      case 'articles':
        return { title: 'Articles & Newsletter', subtitle: 'Create, schedule, and broadcast nutrition guides' };
      case 'subscribers':
        return { title: 'Subscribers Database', subtitle: 'View community audience and newsletter reach' };
      case 'testimonials':
        return { title: 'Client Testimonials', subtitle: 'Review and approve client success stories' };
      case 'surveys':
        return { title: 'Surveys & Feedback', subtitle: 'Analyze visitor pain points and consultation intent' };
      case 'events':
        return { title: 'Events Manager', subtitle: 'Organize and publish community wellness events' };
      default:
        return { title: 'Admin Portal', subtitle: 'DietWithDee Clinical Dashboard' };
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col md:flex-row antialiased font-sans">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}

      {/* MOBILE BACKDROP FOR DRAWER */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-stone-900 text-stone-200 flex flex-col justify-between border-r border-stone-800 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Brand Header */}
          <div className="p-4 sm:p-5 border-b border-stone-800/80 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="DietWithDee Logo" 
                className="h-9 w-auto object-contain flex-shrink-0" 
              />
              <div>
                <h1 className="font-bold text-white text-sm sm:text-base leading-tight tracking-tight">
                  DietWithDee
                </h1>
                <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Clinical Admin Portal
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 md:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-5 no-scrollbar">
            {navItems.map((group, gIdx) => (
              <div key={gIdx}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 px-3 mb-1.5">
                  {group.group}
                </p>
                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-xs transition-all text-left ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={16} className={isActive ? 'text-white' : 'text-stone-400'} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${item.badgeColor || 'bg-stone-800 text-stone-300'}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Sidebar Footer User Info */}
          <div className="p-3 sm:p-4 border-t border-stone-800/80 flex-shrink-0 bg-stone-900/90">
            <div className="flex items-center justify-between bg-stone-800/60 p-2 rounded-xl border border-stone-800 mb-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-emerald-800 text-emerald-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">
                    {user?.displayName || 'Authorized Admin'}
                  </p>
                  <p className="text-[10px] text-stone-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <a 
                href="/" 
                target="_blank" 
                rel="noreferrer"
                title="View Website"
                className="p-1 text-stone-400 hover:text-emerald-400 transition-colors flex-shrink-0"
              >
                <ExternalLink size={14} />
              </a>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </aside>

      {/* ================= MAIN CONTENT CANVAS ================= */}
      <main className="flex-1 flex flex-col min-h-screen w-full overflow-x-hidden">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <span>{currentTabMeta.title}</span>
              </h2>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
                {currentTabMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {activeTab === 'articles' && (
              <button 
                onClick={loadArticles}
                disabled={isLoading}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}

            {activeTab === 'journey' && (
              <button 
                onClick={() => loadUsers(true)}
                disabled={usersLoading}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={12} className={usersLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh Users</span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Admin Verified</span>
            </div>
          </div>
        </header>

        {/* Keep-Alive Dynamic Content Body (0ms tab switching, persistent background state) */}
        <div className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
            <DashboardOverview 
              user={user}
              pendingBookings={pendingBookings}
              contactedBookings={contactedBookings}
              users={users}
              articles={articles}
              subscriberCount={subscriberCount}
              pendingTestimonials={pendingTestimonials}
              draftArticlesCount={draftArticlesCount}
              surveyCount={surveyCount}
              onNavigate={setActiveTab}
            />
          </div>

          <div className={activeTab === 'bookings' ? 'block' : 'hidden'}>
            <BookingsPanel 
              showNotification={showNotification} 
              highlightRef={refFromUrl} 
            />
          </div>

          <div className={activeTab === 'journey' ? 'block' : 'hidden'}>
            <UserJourneyPanel 
              showNotification={showNotification} 
              users={users}
              loading={usersLoading}
              loadUsers={loadUsers}
              hasMore={false}
            />
          </div>

          <div className={activeTab === 'articles' ? 'block' : 'hidden'}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-200">
                <Loader className="animate-spin text-emerald-600 mb-3" size={28} />
                <p className="text-xs font-medium text-stone-600">Loading articles...</p>
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

          <div className={activeTab === 'subscribers' ? 'block' : 'hidden'}>
            <SubscribersPanel showNotification={showNotification} />
          </div>

          <div className={activeTab === 'testimonials' ? 'block' : 'hidden'}>
            <TestimonialAdmin />
          </div>

          <div className={activeTab === 'surveys' ? 'block' : 'hidden'}>
            <SurveysPanel showNotification={showNotification} />
          </div>

          <div className={activeTab === 'events' ? 'block' : 'hidden'}>
            <EventsManager showNotification={showNotification} />
          </div>

        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
