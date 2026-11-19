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
  surveyCount = 0,
  onNavigate
}) => {
  // Compute basic live metrics from users
  const { activeLast24h, avgBmi } = useMemo(() => {
    if (!users.length) return { activeLast24h: 0, avgBmi: 'N/A' };
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
  }, [users]);

  const cards = [
    {
      id: 'bookings',
      title: 'Consultations',
      metric: pendingBookings > 0 ? `${pendingBookings} Pending` : 'Up to date',
      detail: pendingBookings > 0 
        ? `${pendingBookings} new inquiry awaiting outreach` 
        : `${contactedBookings} contacted appointments`,
      badge: pendingBookings > 0 ? `${pendingBookings} New` : 'All Clear',
      badgeColor: pendingBookings > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Calendar,
      iconBg: 'bg-rose-50 text-rose-600',
      actionText: 'Manage Bookings'
    },
    {
      id: 'journey',
      title: 'Client Journeys',
      metric: `${users.length} Clients`,
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
      metric: `${articles.length} Published`,
      detail: 'Nutrition education & dietary guides',
      badge: 'Content',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: FileText,
      iconBg: 'bg-blue-50 text-blue-600',
      actionText: 'Manage Guides'
    },
    {
      id: 'subscribers',
      title: 'Email Subscribers',
      metric: `${subscriberCount} Readers`,
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
      metric: pendingTestimonials > 0 ? `${pendingTestimonials} Pending` : 'All Approved',
      detail: 'Client transformation stories & reviews',
      badge: pendingTestimonials > 0 ? 'Action Needed' : 'Published',
      badgeColor: pendingTestimonials > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-stone-50 text-stone-600 border-stone-200',
      icon: MessageSquare,
      iconBg: 'bg-amber-50 text-amber-600',
      actionText: 'Review Stories'
    },
    {
      id: 'surveys',
      title: 'Surveys & Feedback',
      metric: `${surveyCount} Responses`,
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

      {/* Priority Action Alert for Pending Bookings */}
      {pendingBookings > 0 && (
        <div 
          onClick={() => onNavigate('bookings')}
          className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-rose-100/70 transition-all shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-rose-950">
                {pendingBookings} New Consultation {pendingBookings === 1 ? 'Booking' : 'Bookings'} Awaiting Outreach
              </p>
              <p className="text-[11px] text-rose-700 font-medium">
                Tap to inspect client health snapshot, BMI, and open direct WhatsApp chat.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-rose-700 flex-shrink-0">
            <span className="hidden sm:inline">Review Now</span>
            <ArrowRight size={14} />
          </div>
        </div>
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
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-stone-500">{card.title}</p>
                  <p className="text-lg sm:text-xl font-bold text-stone-900 mt-0.5">{card.metric}</p>
                  <p className="text-[11px] text-stone-500 font-normal mt-1 line-clamp-2">{card.detail}</p>
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
