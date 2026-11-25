import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  toIsoString,
  sanitizePortalBooking,
  sanitizePortalInquiry,
  mergeDocsById,
  verifyBookingLinkEligibility
} = require('../functions/portalUtils.js');

import {
  calculateBodyMetrics,
  buildKnowYourBodySnapshot,
  shouldSyncGuestSnapshot,
  computeResultsFromProfile,
  GUEST_SNAPSHOT_MAX_AGE_MS
} from '../src/utils/bookingProfile.js';

import {
  getSessionMeta,
  formatDisplayDate,
  formatScheduledDate,
  getStatusBadge,
  buildWhatsAppLink,
  safePortalUrl,
  stripHtmlSnippet,
  rankArticlesForClient
} from '../src/utils/carePortal.js';

test('calculateBodyMetrics handles metric, imperial conversion, calorie floors, and invalid inputs', () => {
  const metric = calculateBodyMetrics({
    weightKg: 70,
    heightCm: 170,
    age: 30,
    gender: 'female',
    activityLevel: 'moderate',
    goal: 'lose'
  });
  assert.equal(metric.bmi, 24.2);
  assert.equal(metric.bmiCategory, 'Normal Weight');
  assert.ok(metric.tdee >= 800);

  // Imperial equivalent (68 in ~ 172.7 cm, 154 lbs ~ 69.9 kg) normalizes to metric
  const imperialSnap = buildKnowYourBodySnapshot(
    {
      weight: '154',
      height: '68',
      age: '28',
      gender: 'male',
      activityLevel: 'light',
      goal: 'maintain',
      dietaryRestrictions: 'None'
    },
    'imperial',
    1234567890
  );
  assert.equal(imperialSnap.weight, 69.9);
  assert.equal(imperialSnap.height, 172.7);
  assert.equal(imperialSnap.unitsUsed, 'imperial');
  assert.equal(imperialSnap.bmi, 23.4);

  // Zero or negative measurements fail safely without NaN
  assert.equal(calculateBodyMetrics({ weightKg: 0, heightCm: 170 }), null);
  assert.equal(calculateBodyMetrics({ weightKg: -5, heightCm: 170 }), null);
  assert.equal(buildKnowYourBodySnapshot({ weight: '', height: '170' }, 'metric'), null);
  assert.equal(computeResultsFromProfile(null), null);
});

test('shouldSyncGuestSnapshot prevents duplicate writes, expired caches, and cross-user bleed', () => {
  const now = 1_750_000_000_000;
  const freshSnap = { bmi: 23.5, savedAt: now - 5_000 };

  assert.equal(shouldSyncGuestSnapshot(freshSnap, 'uid_1', null, now), true);
  // Idempotent duplicate protection for same uid + savedAt
  assert.equal(shouldSyncGuestSnapshot(freshSnap, 'uid_1', `uid_1:${freshSnap.savedAt}`, now), false);
  // Different user signing in on shared device can sync cleanly
  assert.equal(shouldSyncGuestSnapshot(freshSnap, 'uid_2', `uid_1:${freshSnap.savedAt}`, now), true);
  // Expired guest cache (> 24h) is skipped
  const staleSnap = { bmi: 23.5, savedAt: now - GUEST_SNAPSHOT_MAX_AGE_MS - 1 };
  assert.equal(shouldSyncGuestSnapshot(staleSnap, 'uid_1', null, now), false);
  // Future-tampered timestamp beyond slack is rejected
  assert.equal(shouldSyncGuestSnapshot({ bmi: 23.5, savedAt: now + 120_000 }, 'uid_1', null, now), false);
});

test('portalUtils handles timestamp serialization, multi-query deduplication, and booking link security', () => {
  // Firestore Timestamp vs string vs malformed
  const sampleDate = new Date('2026-10-01T10:30:00.000Z');
  assert.equal(toIsoString({ toDate: () => sampleDate }), '2026-10-01T10:30:00.000Z');
  assert.equal(toIsoString('2026-10-02T08:00:00.000Z'), '2026-10-02T08:00:00.000Z');
  assert.equal(toIsoString('not-a-date'), null);
  assert.equal(toIsoString(null), null);

  // Deduplicates overlapping queries + skips nonexistent docs + sorts newest-first
  const olderDoc = {
    id: 'ref_1',
    exists: true,
    data: () => ({ name: 'Ama', consultationType: 'initial', amount: 800, createdAt: '2026-09-01T00:00:00.000Z' })
  };
  const newerDoc = {
    id: 'ref_2',
    exists: true,
    data: () => ({ name: 'Ama', consultationType: 'followup', amount: 400, createdAt: '2026-10-01T00:00:00.000Z', clientCareNote: 'Cut soda' })
  };
  const missingDoc = { id: 'deleted_ref', exists: false };

  const merged = mergeDocsById(
    [{ docs: [olderDoc, newerDoc] }, { docs: [olderDoc] }, missingDoc],
    sanitizePortalBooking
  );
  assert.equal(merged.length, 2);
  assert.equal(merged[0].id, 'ref_2');
  assert.equal(merged[0].clientCareNote, 'Cut soda');
  assert.equal(merged[1].id, 'ref_1');

  const inq = sanitizePortalInquiry({
    id: 'inq_1',
    exists: true,
    data: () => ({ inquiryTopic: 'Corporate Wellness', message: 'Team workshop', status: 'contacted' })
  });
  assert.equal(inq.inquiryTopic, 'Corporate Wellness');
  assert.equal(inq.status, 'contacted');

  // Booking link security checks
  assert.equal(
    verifyBookingLinkEligibility({
      bookingData: { userId: 'other_uid', email: 'ama@yahoo.com', phone: '0599394750' },
      uid: 'uid_1',
      cleanEmail: 'ama@gmail.com',
      emailVerified: true,
      phoneLast4: '4750'
    }).ok,
    false
  );

  // Allows link across different emails when phone last 4 matches formatted Ghana numbers
  assert.equal(
    verifyBookingLinkEligibility({
      bookingData: { email: 'ama@yahoo.com', phone: '+233 59 939 4750' },
      uid: 'uid_1',
      cleanEmail: 'ama@gmail.com',
      emailVerified: true,
      phoneLast4: '4750'
    }).ok,
    true
  );

  // Supports Father's Day buyerPhone fallback
  assert.equal(
    verifyBookingLinkEligibility({
      bookingData: { email: 'gift@yahoo.com', buyerPhone: '024-111-8899' },
      uid: 'uid_1',
      cleanEmail: 'ama@gmail.com',
      emailVerified: true,
      phoneLast4: '8899'
    }).ok,
    true
  );

  // Rejects mismatched last 4 digits when email doesn't match
  assert.equal(
    verifyBookingLinkEligibility({
      bookingData: { email: 'other@yahoo.com', phone: '0599394750' },
      uid: 'uid_1',
      cleanEmail: 'ama@gmail.com',
      emailVerified: true,
      phoneLast4: '9999'
    }).ok,
    false
  );
});

test('carePortal helpers guard URLs, format dates safely, and rank personalized articles', () => {
  // URL sanitization against XSS schemes
  assert.equal(safePortalUrl('javascript:alert(1)'), null);
  assert.equal(safePortalUrl('data:text/html,hi'), null);
  assert.equal(safePortalUrl('https://drive.google.com/plan.pdf'), 'https://drive.google.com/plan.pdf');

  // Date resilience
  assert.equal(formatDisplayDate('invalid-date'), null);
  assert.equal(formatScheduledDate('bad-date'), null);
  assert.ok(formatScheduledDate('2026-12-05')?.includes('2026'));

  // Session tier meta & status badges
  const ontrackMeta = getSessionMeta({ isOntrack: true, consultationType: 'initial' });
  assert.equal(ontrackMeta.followUpPath, '/ontrack?tier=followup');
  const fathersMeta = getSessionMeta({ isFathersDayBooking: true, fatherName: 'Kwame' });
  assert.equal(fathersMeta.subtitle, 'For Kwame');

  assert.equal(getStatusBadge('pending', null).label, 'Confirmed · Pending Time');
  assert.equal(getStatusBadge('pending', '2026-12-05').label, 'Scheduled');
  assert.equal(getStatusBadge('completed', '2026-12-05').label, 'Completed');
  assert.equal(getStatusBadge('cancelled', null).label, 'Cancelled');
  assert.ok(buildWhatsAppLink({ name: 'Ama', paystackReference: 'T99' }).includes('Ref%3A%20T99'));

  // Article HTML stripping & context ranking (excludes drafts and future scheduled posts)
  assert.equal(stripHtmlSnippet('<p>Healthy&nbsp;<strong>Ghanaian</strong> meals &amp; tips.</p>'), 'Healthy Ghanaian meals & tips.');

  const futureDate = new Date(Date.now() + 86_400_000).toISOString();
  const sampleArticles = [
    { id: '1', title: 'How to Gain Muscle Mass', status: 'published', tags: ['protein', 'gain'], content: '<p>High calorie meals</p>' },
    { id: '2', title: 'Secret Draft', status: 'draft', tags: ['diabetes'], content: 'Should never show' },
    { id: '3', title: 'Scheduled Future Post', status: 'published', scheduledPublishDate: futureDate, tags: ['diabetes'], content: 'Future' },
    { id: '4', title: 'Managing Blood Sugar with Banku & Okro', status: 'published', tags: ['diabetes', 'a1c'], content: '<p>Low glycemic Ghanaian swaps</p>' },
    { id: '5', title: 'Portion Control for Weight Loss', status: 'published', tags: ['weight loss'], content: '<p>Calorie deficit basics</p>' }
  ];

  const diabetesRanked = rankArticlesForClient(sampleArticles, { isOntrack: true, healthConditions: 'Type 2 Diabetes' }, 3);
  assert.equal(diabetesRanked.length, 3);
  assert.equal(diabetesRanked[0].id, '4');
  assert.equal(diabetesRanked[0].relevanceReason, 'For Blood Sugar Care');
  assert.ok(diabetesRanked.every((a) => a.id !== '2' && a.id !== '3'));

  const weightLossRanked = rankArticlesForClient(sampleArticles, { goal: 'lose' }, 3);
  assert.equal(weightLossRanked[0].id, '5');
  assert.equal(weightLossRanked[0].relevanceReason, 'For Weight Loss');
});
