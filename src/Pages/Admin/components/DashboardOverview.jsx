import React, { useMemo } from 'react';
import { 
  Calendar, 
  Users, 
  FileText, 
  Mail, 
  MessageSquare, 
  ClipboardList, 
  Ticket, 
  ArrowRight, 
  Activity, 
  Clock, 
  Sparkles, 
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const DashboardOverview = ({ 
  user,
  pendingBookings = 0,
  contactedBookings = 0,
  users = [],
  articles = [],
  subscriberCount = 0,
  pendingTestimonials = 0,
  draftArticlesCount,
  surveyCount = 0,
  cachedDashboard,
  isLoading = false,
  onNavigate
}) => {
  // Check if initial data is still loading on an unprimed session (no cache)
  const isUnprimedLoading = isLoading && !cachedDashboard;

  // Derived counts with seamless cache hydration (prevents flash of 0s on refresh)
  const displayUsersCount = users.length > 0 ? users.length : (cachedDashboard?.usersCount ?? 0);
  const displayArticlesCount = articles.length > 0 ? articles.length : (cachedDashboard?.articlesCount ?? 0);
  const displaySubscribers = subscriberCount > 0 ? subscriberCount : (cachedDashboard?.subscriberCount ?? 0);
  const displaySurveys = surveyCount > 0 ? surveyCount : (cachedDashboard?.surveyCount ?? 0);
  const displayContacted = contactedBookings > 0 ? contactedBookings : (cachedDashboard?.contactedBookings ?? 0);
  const displayPending = pendingBookings > 0 ? pendingBookings : (cachedDashboard?.pendingBookings ?? 0);
  const displayPendingTestimonials = pendingTestimonials > 0 ? pendingTestimonials : (cachedDashboard?.pendingTestimonials ?? 0);

  // Compute draft vs published counts
  const draftCount = useMemo(() => {
    if (typeof draftArticlesCount === 'number' && draftArticlesCount >= 0) {
      return draftArticlesCount;
    }
    if (articles.length > 0) {
      return articles.filter(a => a.status === 'draft').length;
    }
    return cachedDashboard?.draftCount ?? cachedDashboard?.draftArticlesCount ?? 0;
  }, [draftArticlesCount, articles, cachedDashboard]);

  const publishedCount = useMemo(() => {
    if (articles.length > 0) {
      return articles.filter(a => a.status === 'published' || (!a.status && a.status !== 'draft')).length;
    }
    return cachedDashboard?.publishedCount ?? cachedDashboard?.publishedArticlesCount ?? 0;
  }, [articles, cachedDashboard]);

  // Compute intelligent alerts (using live or cached counts to prevent layout shift)
  const alerts = useMemo(() => {
    const list = [];

    // 1. Pending Bookings Alert
    if (displayPending > 0) {
      list.push({
        id: 'pending-bookings',
        tab: 'bookings',
        count: displayPending,
        title: `${displayPending} New Consultation ${displayPending === 1 ? 'Booking' : 'Bookings'} Awaiting Outreach`,
        description: 'New client inquiry paid and awaiting initial consultation coordination.',
        badge: `${displayPending} New`,
        badgeStyle: 'bg-rose-100 text-rose-800 border-rose-300',
        cardStyle: 'bg-gradient-to-r from-rose-50/95 via-rose-50/50 to-white border-rose-200 hover:border-rose-300 hover:bg-rose-100/50',
        icon: Calendar,
        iconBg: 'bg-rose-600 text-white shadow-rose-200',
        titleColor: 'text-rose-950',
        descColor: 'text-rose-700',
        actionColor: 'text-rose-700 group-hover:text-rose-900',
        actionText: 'Review Bookings'
      });
    }

    // 2. Draft Articles Alert
    if (draftCount > 0) {
      list.push({
        id: 'draft-articles',
        tab: 'articles',
        count: draftCount,
        title: `${draftCount} Article ${draftCount === 1 ? 'Draft' : 'Drafts'} Ready for Review`,
        description: 'Unpublished nutrition guides or wellness posts in draft status awaiting publication.',
        badge: `${draftCount} Draft${draftCount === 1 ? '' : 's'}`,
        badgeStyle: 'bg-amber-100 text-amber-800 border-amber-300',
        cardStyle: 'bg-gradient-to-r from-amber-50/95 via-amber-50/50 to-white border-amber-200 hover:border-amber-300 hover:bg-amber-100/50',
        icon: FileText,
        iconBg: 'bg-amber-600 text-white shadow-amber-200',
        titleColor: 'text-amber-950',
        descColor: 'text-amber-800',
        actionColor: 'text-amber-800 group-hover:text-amber-950',
        actionText: 'Open Articles'
      });
    }

    // 3. Pending Testimonials Alert
    if (displayPendingTestimonials > 0) {
      list.push({
        id: 'pending-testimonials',
        tab: 'testimonials',
        count: displayPendingTestimonials,
        title: `${displayPendingTestimonials} Client ${displayPendingTestimonials === 1 ? 'Testimonial' : 'Testimonials'} Pending Approval`,
        description: 'New transformation story submitted by a client awaiting your moderation.',
        badge: `${displayPendingTestimonials} Pending`,
        badgeStyle: 'bg-purple-100 text-purple-800 border-purple-300',
        cardStyle: 'bg-gradient-to-r from-purple-50/95 via-purple-50/50 to-white border-purple-200 hover:border-purple-300 hover:bg-purple-100/50',
        icon: MessageSquare,
        iconBg: 'bg-purple-600 text-white shadow-purple-200',
        titleColor: 'text-purple-950',
        descColor: 'text-purple-800',
        actionColor: 'text-purple-800 group-hover:text-purple-950',
        actionText: 'Moderate Reviews'
      });
    }

    return list;
  }, [displayPending, draftCount, displayPendingTestimonials]);

  const totalAlertsCount = useMemo(() => {
    return alerts.reduce((acc, a) => acc + (a.count || 1), 0);
  }, [alerts]);

  // Compute live metrics from users with fallback to cache
  const { activeLast24h, avgBmi } = useMemo(() => {
    if (!users.length) {
      return { 
        activeLast24h: cachedDashboard?.activeLast24h ?? 0, 
        avgBmi: cachedDashboard?.avgBmi ?? 'N/A' 
      };
    }
    const now = new Date();
    let active24h = 0;
    let totalBmi = 0;
    let bmiCount = 0;

    users.forEach(u => {
      const updated = u.updatedAt?.toDate ? u.updatedAt.toDate() : (u.updatedAt ? new Date(u.updatedAt) : null);
      if (updated && (now - updated) < (24 * 60 * 60 * 1000)) {
        active24h++;
      }
      const bmiVal = u.bmi ? parseFloat(u.bmi) : (u.weight && u.height ? u.weight / Math.pow(u.height / 100, 2) : null);
      if (bmiVal && !isNaN(bmiVal)) {
        totalBmi += bmiVal;
        bmiCount++;
      }
    });

    return {
      activeLast24h: active24h,
      avgBmi: bmiCount > 0 ? (totalBmi / bmiCount).toFixed(1) : 'N/A'
    };
  }, [users, cachedDashboard]);

  const cards = [
    {
      id: 'bookings',
      title: 'Consultations',
      metric: displayPending > 0 ? `${displayPending} Pending` : 'Up to date',
      detail: displayPending > 0 
        ? `${displayPending} new inquiry awaiting outreach` 
        : `${displayContacted} contacted appointments`,
      badge: displayPending > 0 ? `${displayPending} New` : 'All Clear',
      badgeColor: displayPending > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Calendar,
      iconBg: 'bg-rose-50 text-rose-600',
      actionText: 'Manage Bookings'
    },
    {
      id: 'journey',
      title: 'Client Journeys',
      metric: `${displayUsersCount} Clients`,
      detail: `${activeLast24h} active today · ${avgBmi} avg BMI`,
      badge: 'Database',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Users,
      iconBg: 'bg-emerald-50 text-emerald-600',
      actionText: 'View Profiles'
    },
    {
      id: 'articles',
      title: 'Articles & Blog',
      metric: `${publishedCount} Published`,
      detail: draftCount > 0 
        ? `${draftCount} in draft · Nutrition guides & education`
        : 'Nutrition education & dietary guides',
      badge: draftCount > 0 ? `${draftCount} Draft${draftCount === 1 ? '' : 's'}` : 'Content',
      badgeColor: draftCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200',
      icon: FileText,
      iconBg: draftCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600',
      actionText: 'Manage Guides'
    },
    {
      id: 'subscribers',
      title: 'Email Subscribers',
      metric: `${displaySubscribers} Readers`,
      detail: 'Active community newsletter reach',
      badge: 'Audience',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Mail,
      iconBg: 'bg-purple-50 text-purple-600',
      actionText: 'View List'
    },
    {
      id: 'testimonials',
      title: 'Testimonials',
      metric: displayPendingTestimonials > 0 ? `${displayPendingTestimonials} Pending` : 'All Approved',
      detail: 'Client transformation stories & reviews',
      badge: displayPendingTestimonials > 0 ? 'Action Needed' : 'Published',
      badgeColor: displayPendingTestimonials > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-stone-50 text-stone-600 border-stone-200',
      icon: MessageSquare,
      iconBg: 'bg-amber-50 text-amber-600',
      actionText: 'Review Stories'
    },
    {
      id: 'surveys',
      title: 'Surveys & Feedback',
      metric: `${displaySurveys} Responses`,
      detail: 'Visitor pain points & dietary goals',
      badge: 'Insights',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: ClipboardList,
      iconBg: 'bg-teal-50 text-teal-600',
      actionText: 'Explore Feedback'
    },
    {
      id: 'events',
      title: 'Events Manager',
      metric: 'Workshops',
      detail: 'Community webinars & group sessions',
      badge: 'Public',
      badgeColor: 'bg-stone-50 text-stone-600 border-stone-200',
      icon: Ticket,
      iconBg: 'bg-stone-100 text-stone-600',
      actionText: 'Organize Events'
    }
  ];

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Clinical Admin Portal</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
            Welcome back, {user?.displayName ? user.displayName.split(' ')[0] : 'Nana Ama'}
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Monitor client inquiries, health journeys, and clinical publishing from your central dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => onNavigate('bookings')}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <Calendar size={14} />
            <span>Consultations</span>
          </button>
          <button
            onClick={() => onNavigate('journey')}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Users size={14} />
            <span>Client Journeys</span>
          </button>
        </div>
      </div>

      {/* Intelligent Actionable Alerts Feed (Hidden when 0 alerts) */}
      {alerts.length > 0 && (
        <section aria-label="Actionable alerts" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Action Required ({totalAlertsCount})
              </h3>
            </div>
            <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">
              Tap any alert to resolve immediately
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {alerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div 
                  key={alert.id}
                  onClick={() => onNavigate(alert.tab)}
                  className={`group p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-md ${alert.cardStyle}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 sm:w-10 h-9 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${alert.iconBg}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-xs sm:text-sm font-bold truncate ${alert.titleColor}`}>
                          {alert.title}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${alert.badgeStyle}`}>
                          {alert.badge}
                        </span>
                      </div>
                      <p className={`text-[11px] font-medium mt-0.5 truncate ${alert.descColor}`}>
                        {alert.description}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-bold flex-shrink-0 group-hover:translate-x-1 transition-transform ${alert.actionColor}`}>
                    <span className="hidden sm:inline">{alert.actionText}</span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Interactive Stats Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Overview & Quick Access
          </h3>
          <span className="text-[11px] text-stone-400 font-medium">Tap any card to view details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                      <Icon size={18} />
                    </div>
                    {isUnprimedLoading ? (
                      <span className="inline-block h-4 w-12 bg-stone-100 animate-pulse rounded-full"></span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-stone-500">{card.title}</p>
                  {isUnprimedLoading ? (
                    <div className="h-6 w-16 bg-stone-100 animate-pulse rounded-md my-1"></div>
                  ) : (
                    <p className="text-lg sm:text-xl font-bold text-stone-900 mt-0.5">{card.metric}</p>
                  )}
                  {isUnprimedLoading ? (
                    <div className="h-3.5 w-32 bg-stone-100 animate-pulse rounded-md mt-1.5"></div>
                  ) : (
                    <p className="text-[11px] text-stone-500 font-normal mt-1 line-clamp-2">{card.detail}</p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span>{card.actionText}</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default DashboardOverview;
