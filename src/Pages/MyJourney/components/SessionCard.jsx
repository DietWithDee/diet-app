import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  MessageCircle,
  ChevronDown,
  FileText,
  ExternalLink,
  ArrowRight,
  Activity
} from 'lucide-react';
import {
  getSessionMeta,
  formatDisplayDate,
  formatScheduledDate,
  getStatusBadge,
  buildWhatsAppLink,
  safePortalUrl
} from '../../../utils/carePortal';

const SessionCard = ({ booking, isFeatured = false, onBookFollowUp, onUpdateAssessment }) => {
  const [expanded, setExpanded] = useState(isFeatured);
  const meta = getSessionMeta(booking);
  const statusPill = getStatusBadge(booking.status, booking.scheduledDate);

  const isCompleted = booking.status === 'completed';
  const isScheduled = Boolean(booking.scheduledDate) || booking.status === 'contacted' || isCompleted;
  const careUrl = safePortalUrl(booking.carePlanUrl);
  const hasCareDeliverable = Boolean(booking.clientCareNote || careUrl);
  const res = booking.userResults || {};
  const hasMetrics = Boolean(res.bmi || res.dailyCalories || res.weight || res.goal);
  const scheduledText = formatScheduledDate(booking.scheduledDate);

  return (
    <div
      className={`rounded-2xl border bg-white transition-all ${
        isFeatured
          ? 'border-emerald-200/90 shadow-sm'
          : 'border-stone-200/90 shadow-2xs hover:border-stone-300'
      }`}
    >
      {/* Header Row */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full text-left p-5 flex items-start justify-between gap-4 cursor-pointer bg-transparent border-none"
      >
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusPill.classes}`}>
              {statusPill.label}
            </span>
            {booking.isOntrack && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                OnTrack Care
              </span>
            )}
            <span className="text-xs text-stone-500 font-medium">
              {formatDisplayDate(booking.createdAt) || 'Booked'}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-serif-cormorant font-semibold text-stone-900 leading-snug">
            {meta.title}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600">{meta.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {booking.amount != null && (
            <span className="text-sm sm:text-base font-bold text-stone-900">
              GH₵ {booking.amount}
            </span>
          )}
          <div
            className={`w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center transition-transform ${
              expanded ? 'rotate-180 bg-stone-100 text-stone-800' : 'bg-white text-stone-500'
            }`}
          >
            <ChevronDown size={16} />
          </div>
        </div>
      </button>

      {/* Compact Scheduled Summary Strip (even when collapsed) */}
      {!expanded && scheduledText && !isCompleted && (
        <div className="px-5 pb-4 -mt-1 flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <Calendar size={14} className="text-emerald-600 shrink-0" />
          <span>
            {scheduledText} · {booking.scheduledTime || 'Time TBD'} (GMT)
          </span>
        </div>
      )}

      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-stone-100 space-y-5">
          {/* 3-Step Session Progress Stepper */}
          {booking.status !== 'cancelled' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
              {/* Step 1: Payment Confirmed */}
              <div className="rounded-xl p-3 border bg-emerald-50/60 border-emerald-200/80">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>1. Payment Confirmed</span>
                </div>
                <p className="text-[11px] text-emerald-800/90 mt-1 pl-5">
                  Ref: <span className="font-mono">{booking.paystackReference}</span>
                </p>
              </div>

              {/* Step 2: Scheduling */}
              <div
                className={`rounded-xl p-3 border ${
                  scheduledText || isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200/80'
                    : isScheduled
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-stone-50 border-stone-200/80'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  {scheduledText || isCompleted ? (
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  ) : (
                    <Clock size={15} className="text-[#e07312] shrink-0" />
                  )}
                  <span>2. Session Time</span>
                </div>
                <p className="text-[11px] text-stone-700 mt-1 pl-5 leading-relaxed">
                  {scheduledText
                    ? `${scheduledText}${booking.scheduledTime ? ` at ${booking.scheduledTime} (GMT)` : ''}`
                    : booking.status === 'contacted'
                    ? 'Dee has reached out to finalize your time on WhatsApp.'
                    : 'Dee will message you on WhatsApp within 24h to confirm your slot.'}
                </p>
              </div>

              {/* Step 3: Session Completed */}
              <div
                className={`rounded-xl p-3 border ${
                  isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200/80'
                    : 'bg-stone-50 border-stone-200/80 opacity-85'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <CheckCircle2
                    size={15}
                    className={isCompleted ? 'text-emerald-600 shrink-0' : 'text-stone-400 shrink-0'}
                  />
                  <span>3. Consultation</span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1 pl-5">
                  {isCompleted
                    ? 'Session completed with Nana Ama Dwamena.'
                    : 'Summary & follow-up recommendations appear here after your call.'}
                </p>
              </div>
            </div>
          )}

          {/* Client Care Notes / Resource Link from Dee */}
          {hasCareDeliverable && (
            <div className="rounded-2xl bg-[#F4F7F4] border border-emerald-200/80 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
                <FileText size={14} className="text-emerald-700" />
                <span>Care Summary &amp; Resources from Dee</span>
              </div>
              {booking.clientCareNote && (
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
                  {booking.clientCareNote}
                </p>
              )}
              {careUrl && (
                <a
                  href={careUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Open Meal Plan / Guide</span>
                </a>
              )}
            </div>
          )}

          {/* Attached Health Metrics & Booking Note */}
          {(hasMetrics || booking.message) && (
            <div className="rounded-2xl bg-stone-50/80 border border-stone-200/70 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                <Activity size={13} className="text-emerald-700" />
                <span>Submitted Clinical Context</span>
              </div>
              {hasMetrics && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {res.bmi && (
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 font-semibold text-stone-800">
                      BMI {res.bmi}{res.bmiCategory ? ` (${res.bmiCategory})` : ''}
                    </span>
                  )}
                  {res.dailyCalories && (
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 font-semibold text-stone-800">
                      {res.dailyCalories} kcal/day
                    </span>
                  )}
                  {res.weight && (
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 font-semibold text-stone-800">
                      {res.weight} kg
                    </span>
                  )}
                  {res.goal && (
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 font-semibold text-stone-800 capitalize">
                      {res.goal}
                    </span>
                  )}
                </div>
              )}
              {booking.message && (
                <p className="text-xs text-stone-600 leading-relaxed">
                  <span className="font-semibold text-stone-700">Your note: </span>
                  {booking.message}
                </p>
              )}
            </div>
          )}

          {/* Session Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            {isCompleted ? (
              <button
                type="button"
                onClick={() => onBookFollowUp(meta.followUpPath)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#F6841F] hover:bg-[#e07312] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border-none"
              >
                <span>{meta.followUpLabel}</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <a
                href={buildWhatsAppLink(booking, meta)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#1F4E36] hover:bg-[#173c29] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Dee</span>
              </a>
            )}

            <button
              type="button"
              onClick={onUpdateAssessment}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{isCompleted ? 'Re-take KnowYourBody' : 'Update Assessment Before Call'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionCard;
