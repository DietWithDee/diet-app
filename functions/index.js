const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentUpdated, onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { Resend } = require("resend");
const { enqueueCampaign, processMailQueue, recordTransactionalSent } = require("./mailEngine");
const { createEmailTemplate, createWelcomeTemplate, createSurveyVoucherTemplate, createEventBroadcastTemplate, createKnowYourBodyResultsEmail } = require("./emailTemplate");
const { createAdminBookingEmail, createClientConfirmationEmail, createAdminInquiryEmail, createClientInquiryEmail } = require("./bookingEmailTemplates");
const { createAdminTestimonialEmail } = require("./testimonialEmailTemplate");
const {
    sanitizePortalBooking,
    sanitizePortalInquiry,
    sanitizePortalAssessment,
    mergeDocsById,
    verifyBookingLinkEligibility,
    buildKnowYourBodyLogDocId
} = require("./portalUtils");


admin.initializeApp();
const db = admin.firestore();

// Resend Audience ID (General audience)
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || "2e22a159-d193-46a0-8e66-f35b62b1d8bb";

// Admin Authorization Whitelist
const ADMIN_EMAILS = [
  'nanaamadwamena4@gmail.com',
  'princetetteh963@gmail.com',
  'godwinokro2020@gmail.com'
];

const isAuthorizedAdmin = (auth) => {
  if (!auth || !auth.token) return false;
  // Hybrid check: Success if they have the claim OR if their email is in the whitelist
  return auth.token.admin === true || ADMIN_EMAILS.includes(auth.token.email || "");
};

// Admin: Promote or demote a user (Admin only)
exports.setAdminStatus = onCall(async (request) => {
  if (!isAuthorizedAdmin(request.auth)) {
    throw new HttpsError("permission-denied", "Only authorized admins can manage roles.");
  }

  const { uid, admin: isAdminStatus } = request.data;
  if (!uid) {
    throw new HttpsError("invalid-argument", "The function must be called with a user UID.");
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: !!isAdminStatus });
    console.log(`Admin Status for user ${uid} set to ${!!isAdminStatus} by ${request.auth.token.email}`);
    return { success: true, message: `Admin status for ${uid} updated to ${!!isAdminStatus}` };
  } catch (error) {
    console.error("Error setting admin status:", error);
    throw new HttpsError("internal", error.message);
  }
});

// Set global options to max instances to avoid cold start issues if desired
setGlobalOptions({ maxInstances: 4 });

// 1. Scheduled Function to Publish Articles
exports.publishScheduledArticles = onSchedule("every 10 minutes", async (event) => {
  const now = admin.firestore.Timestamp.now();
  console.log(`Running scheduled check at ${now.toDate().toISOString()}`);

  try {
    const scheduledArticlesQuery = await db.collection("articles")
      .where("status", "==", "scheduled")
      .where("scheduledPublishDate", "<=", now)
      .get();

    if (scheduledArticlesQuery.empty) {
      console.log("No scheduled articles to publish.");
      return;
    }

    const batch = db.batch();
    let count = 0;

    scheduledArticlesQuery.forEach((doc) => {
      console.log(`Publishing article ${doc.id}`);
      batch.update(doc.ref, { 
        status: "published",
        updatedAt: now
      });
      count++;
    });

    await batch.commit();
    console.log(`Successfully published ${count} scheduled articles.`);
  } catch (error) {
    console.error("Error publishing scheduled articles:", error);
  }
});

// 2. Trigger Function on Article Publish to Enqueue and Send Newsletters
exports.onArticlePublished = onDocumentWritten(
  { 
    document: "articles/{articleId}", 
    secrets: ["RESEND_API_KEY"],
    memory: "512MiB",
    timeoutSeconds: 300
  },
  async (event) => {
    const articleId = event.params.articleId;
    
    if (!event.data) {
        return;
    }

    const beforeData = event.data.before ? event.data.before.data() : null;
    const afterData = event.data.after ? event.data.after.data() : null;

    if (!afterData) {
        return; // Document was deleted
    }

    const wasPublished = beforeData ? beforeData.status === "published" : false;
    const isNowPublished = afterData.status === "published";

    if (wasPublished || !isNowPublished) {
      return; // Skip if it was already published or if it's not published now
    }

    if (!afterData.title) {
        console.warn(`Article ${articleId} lacks a title. Skipping newsletter.`);
        return;
    }
    
    if (afterData.newsletterSent) {
        console.log(`Newsletter already handled for article ${articleId}. Skipping.`);
        return;
    }

    console.log(`Article ${articleId} just transitioned to published! Preparing newsletter broadcast...`);

    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY is not set.");
      }
      const resend = new Resend(resendApiKey);

      // Prevent duplicate sends: mark article as in_progress atomically
      const articleRef = db.collection('articles').doc(articleId);
      const nowTs = admin.firestore.Timestamp.now();
      try {
          await db.runTransaction(async (tx) => {
              const docSnap = await tx.get(articleRef);
              if (!docSnap.exists) throw new Error('Article not found');
              const data = docSnap.data() || {};
              if (data.newsletterSent === true || data.newsletterSent === 'queued' || data.newsletterSent === 'in_progress') {
                  throw new Error('Newsletter already sent or in progress');
              }
              tx.update(articleRef, { newsletterSent: 'in_progress', newsletterStartedAt: nowTs });
          });
      } catch (err) {
          console.log('Aborting newsletter: ', err.message);
          return;
      }

      const subject = `New from Diet With Dee: ${afterData.title}`;
      const coverImage = afterData.coverImage || "";
      const emailHtmlTemplate = createEmailTemplate(afterData.title, coverImage, articleId)
          .replace('Hi there,', 'Hi {{{FIRST_NAME|there}}},')
          .replace(/https:\/\/dietwithdee\.org\/unsubscribe/g, '{{{RESEND_UNSUBSCRIBE_URL}}}');
      const emailText = `New Article: ${afterData.title}\n\nRead more at: https://dietwithdee.org/blog/${articleId}\n\nTo unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`;

      console.log(`[onArticlePublished] Creating broadcast to audience ${RESEND_AUDIENCE_ID}...`);
      const { data: broadcast, error: broadcastError } = await resend.broadcasts.create({
          audienceId: RESEND_AUDIENCE_ID,
          from: 'Diet With Dee <newsletter@mail.dietwithdee.org>',
          replyTo: 'hello@dietwithdee.org',
          subject: subject,
          html: emailHtmlTemplate,
          text: emailText
      });

      if (broadcastError) {
          console.error("[onArticlePublished] Broadcast creation failed:", broadcastError);
          await articleRef.update({ newsletterSent: false, lastNewsletterError: broadcastError.message });
          return;
      }

      console.log(`[onArticlePublished] Dispatching broadcast ${broadcast.id}...`);
      const { data: sendResult, error: sendError } = await resend.broadcasts.send(broadcast.id);
      if (sendError) {
          console.error("[onArticlePublished] Broadcast send failed:", sendError);
          await articleRef.update({ newsletterSent: false, lastNewsletterError: sendError.message });
          return;
      }

      console.log(`[onArticlePublished] Broadcast ${broadcast.id} dispatched successfully to audience.`);

      await articleRef.update({
          newsletterSent: true,
          newsletterSentAt: admin.firestore.Timestamp.now(),
          resendBroadcastId: broadcast.id
      });

    } catch (error) {
      console.error("Error in newsletter distribution:", error);
    }
  }
);

// 2.05 Trigger Function on Event Creation/Publish to Enqueue and Send Newsletter Broadcast
exports.onEventPublished = onDocumentWritten(
  { 
    document: "events/{eventId}", 
    secrets: ["RESEND_API_KEY"],
    memory: "512MiB",
    timeoutSeconds: 300
  },
  async (event) => {
    const eventId = event.params.eventId;
    
    if (!event.data) {
        return;
    }

    const afterData = event.data.after ? event.data.after.data() : null;

    if (!afterData) {
        return; // Document was deleted
    }

    // Only broadcast if explicitly marked to broadcast as newsletter
    if (!afterData.broadcastNewsletter) {
        return;
    }

    if (!afterData.title) {
        console.warn(`Event ${eventId} lacks a title. Skipping event newsletter.`);
        return;
    }
    
    if (afterData.newsletterSent) {
        console.log(`Newsletter already handled for event ${eventId}. Skipping.`);
        return;
    }

    console.log(`Event ${eventId} marked for newsletter broadcast! Preparing broadcast...`);

    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY is not set.");
      }
      const resend = new Resend(resendApiKey);

      // Prevent duplicate sends: mark event as in_progress atomically
      const eventRef = db.collection('events').doc(eventId);
      const nowTs = admin.firestore.Timestamp.now();
      try {
          await db.runTransaction(async (tx) => {
              const docSnap = await tx.get(eventRef);
              if (!docSnap.exists) throw new Error('Event not found');
              const data = docSnap.data() || {};
              if (data.newsletterSent === true || data.newsletterSent === 'queued' || data.newsletterSent === 'in_progress') {
                  throw new Error('Newsletter already sent or in progress');
              }
              tx.update(eventRef, { newsletterSent: 'in_progress', newsletterStartedAt: nowTs });
          });
      } catch (err) {
          console.log('Aborting event newsletter: ', err.message);
          return;
      }

      const subject = `Upcoming Community Event: ${afterData.title}`;
      const emailHtmlTemplate = createEventBroadcastTemplate(afterData)
          .replace('Hi there,', 'Hi {{{FIRST_NAME|there}}},')
          .replace(/https:\/\/dietwithdee\.org\/unsubscribe/g, '{{{RESEND_UNSUBSCRIBE_URL}}}');
      const emailText = `Upcoming Event: ${afterData.title}\nDate: ${afterData.date || 'Upcoming'}\nLocation: ${afterData.location || 'Online'}\n${afterData.eventLink ? `Link: ${afterData.eventLink}\n` : ''}\nTo unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`;

      console.log(`[onEventPublished] Creating broadcast to audience ${RESEND_AUDIENCE_ID}...`);
      const { data: broadcast, error: broadcastError } = await resend.broadcasts.create({
          audienceId: RESEND_AUDIENCE_ID,
          from: 'Diet With Dee <newsletter@mail.dietwithdee.org>',
          replyTo: 'hello@dietwithdee.org',
          subject: subject,
          html: emailHtmlTemplate,
          text: emailText
      });

      if (broadcastError) {
          console.error("[onEventPublished] Broadcast creation failed:", broadcastError);
          await eventRef.update({ newsletterSent: false, lastNewsletterError: broadcastError.message });
          return;
      }

      console.log(`[onEventPublished] Dispatching broadcast ${broadcast.id}...`);
      const { data: sendResult, error: sendError } = await resend.broadcasts.send(broadcast.id);
      if (sendError) {
          console.error("[onEventPublished] Broadcast send failed:", sendError);
          await eventRef.update({ newsletterSent: false, lastNewsletterError: sendError.message });
          return;
      }

      console.log(`[onEventPublished] Event broadcast ${broadcast.id} dispatched successfully to audience.`);

      await eventRef.update({
          newsletterSent: true,
          newsletterSentAt: admin.firestore.Timestamp.now(),
          resendBroadcastId: broadcast.id
      });

    } catch (error) {
      console.error("Error in event newsletter distribution:", error);
    }
  }
);

// 2.1. Scheduled Function to Process Mail Queue (runs every 1 hour)
exports.processMailQueueSchedule = onSchedule(
  {
    schedule: "every 1 hours",
    secrets: ["RESEND_API_KEY"],
    memory: "512MiB",
    timeoutSeconds: 300
  },
  async (event) => {
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.warn("[processMailQueueSchedule] RESEND_API_KEY is missing. Skipping.");
        return;
      }
      const resend = new Resend(resendApiKey);
      const result = await processMailQueue(db, resend);
      console.log(`[processMailQueueSchedule] Cycle finished: ${result.processed} sent, remaining quota today: ${result.remainingQuota}`);
    } catch (error) {
      console.error("[processMailQueueSchedule] Error:", error);
    }
  }
);

// 3. Trigger Function for New Subscribers to Send Welcome Email & Sync to Resend Audience
exports.onNewSubscriber = onDocumentCreated(
    { document: "emails/{emailId}", secrets: ["RESEND_API_KEY"] },
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) {
            console.log("No snapshot data found for new subscriber.");
            return;
        }

        const data = snapshot.data();
        const email = data.email?.trim()?.toLowerCase();

        if (!email) {
            console.warn("New subscription document lacks an email address. Skipping.");
            return;
        }

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.warn("[onNewSubscriber] RESEND_API_KEY is missing. Skipping email and audience sync.");
            return;
        }
        const resend = new Resend(resendApiKey);

        // 1. Sync Contact to Resend Audience so they receive future Broadcasts
        try {
            const rawName = (data.name || "").trim();
            const nameParts = rawName ? rawName.split(/\s+/) : [];
            const firstName = nameParts[0] || undefined;
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

            const { data: contactData, error: contactError } = await resend.contacts.create({
                audienceId: RESEND_AUDIENCE_ID,
                email: email,
                firstName: firstName,
                lastName: lastName,
                unsubscribed: false
            });

            if (contactError) {
                console.log(`[onNewSubscriber] Resend contact sync for ${email}: ${contactError.message}`);
            } else {
                console.log(`[onNewSubscriber] Successfully synced ${email} to Resend Audience (${contactData?.id})`);
            }
        } catch (contactErr) {
            console.warn(`[onNewSubscriber] Error syncing contact ${email} to Resend:`, contactErr.message);
        }

        // 2. Send Welcome Email (Transactional) if not originated from survey or skipped when another summary email handles it
        if (data.source === "survey" || data.skipWelcomeEmail === true) {
            console.log(`Subscriber ${email} skipping generic welcome email (handled by dedicated flow email).`);
            return;
        }

        console.log(`New subscriber detected: ${email} (source: ${data.source || 'default'}). Sending welcome email...`);

        try {
            const emailContent = createWelcomeTemplate(data.name);
            
            const { data: result, error } = await resend.emails.send({
                from: 'Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>',
                to: [email],
                subject: "Welcome to Diet With Dee! 🌿",
                html: emailContent.split('https://dietwithdee.org/unsubscribe').join(`https://dietwithdee.org/unsubscribe?email=${encodeURIComponent(email)}`)
            });

            if (error) {
                console.error(`Error sending email to ${email}:`, error);
            } else {
                console.log(`Email successfully sent to ${email}. ID: ${result.id}`);
                await recordTransactionalSent(db, 1);
            }
        } catch (error) {
            console.error("Error in onNewSubscriber email logic:", error);
        }
    }
);

// 3.1. Dedicated Trigger on surveys/{surveyId} for 100% Reliable Delivery
exports.onNewSurveySubmission = onDocumentCreated(
    { document: "surveys/{surveyId}", secrets: ["RESEND_API_KEY"] },
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) return;

        const data = snapshot.data();
        const email = data.email?.trim()?.toLowerCase();

        if (!email) {
            console.warn("Survey submission document lacks an email address. Skipping voucher email.");
            return;
        }

        if (data.voucherEmailSent) {
            console.log(`[onNewSurveySubmission] Voucher already sent for survey ${event.params?.surveyId}. Skipping.`);
            return;
        }

        const selectedPlan = data.selectedPlan || data.answers?.selected_plan || data.answers?.goal;
        const discountCode = data.discountCode || "HEALTHY20";

        console.log(`[onNewSurveySubmission] Detected survey submission from: ${email} for plan ${selectedPlan} (${discountCode}). Dispatching 20% voucher email...`);

        try {
            const resendApiKey = process.env.RESEND_API_KEY;
            if (!resendApiKey) {
                throw new Error("RESEND_API_KEY is not set.");
            }
            const resend = new Resend(resendApiKey);

            // Sync survey respondent into Resend Audience
            try {
                await resend.contacts.create({
                    audienceId: RESEND_AUDIENCE_ID,
                    email: email,
                    unsubscribed: false
                });
                console.log(`[onNewSurveySubmission] Synced ${email} to Resend Audience.`);
            } catch (syncErr) {
                console.warn(`[onNewSurveySubmission] Resend audience sync notice for ${email}:`, syncErr.message);
            }

            const emailContent = createSurveyVoucherTemplate({
                email,
                selectedPlan,
                discountCode
            });

            const { data: result, error } = await resend.emails.send({
                from: 'Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>',
                to: [email],
                subject: `Your 20% Discount Voucher for DietWithDee is Here! 🎁`,
                html: emailContent.split('https://dietwithdee.org/unsubscribe').join(`https://dietwithdee.org/unsubscribe?email=${encodeURIComponent(email)}`)
            });

            if (error) {
                console.error(`[onNewSurveySubmission] Error sending voucher to ${email}:`, error);
            } else {
                console.log(`[onNewSurveySubmission] Voucher successfully sent to ${email}. ID: ${result.id}`);
                await recordTransactionalSent(db, 1);
                try {
                    await snapshot.ref.update({
                        voucherEmailSent: true,
                        voucherEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
                        voucherMessageId: result.id
                    });
                } catch (updateErr) {
                    console.warn(`[onNewSurveySubmission] Non-blocking doc update warning:`, updateErr.message);
                }
            }
        } catch (error) {
            console.error("[onNewSurveySubmission] Error sending survey voucher email:", error);
        }
    }
);

// 3.2. Callable function to directly send the survey voucher (instant client dispatch)
exports.sendSurveyDiscountEmail = onCall(
    { secrets: ["RESEND_API_KEY"] },
    async (request) => {
        const { email, selectedPlan, discountCode } = request.data || {};
        const cleanEmail = email?.trim()?.toLowerCase();

        if (!cleanEmail) {
            throw new HttpsError("invalid-argument", "Valid email address is required.");
        }

        console.log(`[sendSurveyDiscountEmail] Callable invoked for ${cleanEmail}, plan: ${selectedPlan}, code: ${discountCode}`);

        try {
            // Check if voucher was already dispatched by the onNewSurveySubmission trigger
            const recentSurveySnap = await admin.firestore().collection("surveys")
                .where("email", "==", cleanEmail)
                .limit(1)
                .get();
            if (!recentSurveySnap.empty && recentSurveySnap.docs[0].data()?.voucherEmailSent) {
                console.log(`[sendSurveyDiscountEmail] Voucher already sent via onNewSurveySubmission trigger for ${cleanEmail}. Skipping duplicate.`);
                return { success: true, message: "Already dispatched via trigger" };
            }

            const resendApiKey = process.env.RESEND_API_KEY;
            if (!resendApiKey) {
                throw new Error("RESEND_API_KEY is not set.");
            }
            const resend = new Resend(resendApiKey);

            // Sync survey respondent into Resend Audience
            try {
                await resend.contacts.create({
                    audienceId: RESEND_AUDIENCE_ID,
                    email: cleanEmail,
                    unsubscribed: false
                });
                console.log(`[sendSurveyDiscountEmail] Synced ${cleanEmail} to Resend Audience.`);
            } catch (syncErr) {
                console.warn(`[sendSurveyDiscountEmail] Resend audience sync notice for ${cleanEmail}:`, syncErr.message);
            }

            const emailContent = createSurveyVoucherTemplate({
                email: cleanEmail,
                selectedPlan,
                discountCode: discountCode || "HEALTHY20"
            });

            const { data: result, error } = await resend.emails.send({
                from: 'Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>',
                to: [cleanEmail],
                subject: `Your 20% Discount Voucher for DietWithDee is Here! 🎁`,
                html: emailContent.split('https://dietwithdee.org/unsubscribe').join(`https://dietwithdee.org/unsubscribe?email=${encodeURIComponent(cleanEmail)}`)
            });

            if (error) {
                console.error(`[sendSurveyDiscountEmail] Resend error for ${cleanEmail}:`, error);
                return { success: false, error: error.message };
            }

            console.log(`[sendSurveyDiscountEmail] Successfully sent to ${cleanEmail}. ID: ${result.id}`);
            return { success: true, messageId: result.id };
        } catch (error) {
            console.error("[sendSurveyDiscountEmail] Error executing callable:", error);
            throw new HttpsError("internal", error.message);
        }
    }
);

// 3.5. Trigger Function for New Testimonials to Send Admin Notification Email
exports.onNewTestimonial = onDocumentCreated(
    { document: "testimonials/{testimonialId}", secrets: ["RESEND_API_KEY"] },
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) {
            console.log("No snapshot data found for new testimonial.");
            return;
        }

        const data = snapshot.data();
        const email = data.email?.trim()?.toLowerCase();
        const name = data.name || "A client";

        console.log(`New testimonial submitted by ${name} (${email || 'no email'}). Sending admin notification...`);

        try {
            const resendApiKey = process.env.RESEND_API_KEY;
            if (!resendApiKey) {
                throw new Error("RESEND_API_KEY is not set.");
            }
            const resend = new Resend(resendApiKey);

            const adminHtml = createAdminTestimonialEmail(data);
            
            const { data: result, error } = await resend.emails.send({
                from: 'Diet With Dee Testimonials <testimonials@mail.dietwithdee.org>',
                to: ['dietwdee@gmail.com'],
                subject: `New Success Story: ${name} (${data.plan || 'N/A'})`,
                html: adminHtml
            });

            if (error) {
                console.error(`Error sending testimonial notification email:`, error);
            } else {
                console.log(`Testimonial notification email successfully sent. ID: ${result.id}`);
            }
        } catch (error) {
            console.error("Error in onNewTestimonial admin notification logic:", error);
        }
    }
);

// 4. Trigger Function on New User Creation to Add to Email List
exports.onUserCreated = onDocumentCreated(
    { document: "users/{userId}" },
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) {
            console.log("No snapshot data found for new user.");
            return;
        }

        const data = snapshot.data();
        const email = data.email?.trim()?.toLowerCase();

        if (!email) {
            console.warn(`New user profile ${event.params.userId} lacks an email address.`);
            return;
        }

        console.log(`New user detected: ${email} (${event.params.userId}). Adding to emails list...`);

        try {
            const db = admin.firestore();
            const emailDocRef = db.collection("emails").doc(email);
            
            // Check if already exists to avoid unnecessary writes
            const emailDoc = await emailDocRef.get();
            if (emailDoc.exists) {
                console.log(`Email ${email} is already in the subscriber list.`);
                return;
            }

            const name = data.displayName || data.name || "";
            await emailDocRef.set({
                email: email,
                name: name,
                createdAt: admin.firestore.Timestamp.now(),
                source: "registration"
            });

            console.log(`Successfully added ${email} to the emails collection via user registration.`);
            // This write will trigger onNewSubscriber to send the welcome email automatically.
        } catch (error) {
            console.error(`Error adding user ${email} to emails collection:`, error);
        }
    }
);

// Allowed callback origins for Paystack redirect
const resolveCallbackUrl = (origin) => {
    const fallback = "https://dietwithdee.org/paymentSuccess";
    if (!origin || typeof origin !== "string") return fallback;
    try {
        const parsed = new URL(origin);
        const host = parsed.hostname.toLowerCase();
        const isAllowedProd = parsed.protocol === "https:" && (host === "dietwithdee.org" || host === "www.dietwithdee.org");
        const isAllowedLocal = (parsed.protocol === "http:" || parsed.protocol === "https:") && (host === "localhost" || host === "127.0.0.1");
        if (isAllowedProd || isAllowedLocal) {
            return `${parsed.origin}/paymentSuccess`;
        }
    } catch {
        // Invalid origin string falls back to production callback
    }
    return fallback;
};

const CONSULTATION_TIER_PRICING = {
    initial: { amountPesewas: 80000, consultationType: "initial", isOntrack: false },
    followup: { amountPesewas: 40000, consultationType: "followup", isOntrack: false },
    ontrack_initial: { amountPesewas: 60000, consultationType: "initial", isOntrack: true },
    ontrack_followup: { amountPesewas: 30000, consultationType: "followup", isOntrack: true }
};

// 4.9. Initialize Paystack Checkout directly so clients don't fill a second form on Paystack
exports.initializePaystackTransaction = onCall(
    { secrets: ["PAYSTACK_SECRET_KEY"] },
    async (request) => {
        const { tier = "initial", formData = {}, userResults = {}, callbackOrigin } = request.data || {};
        const tierConfig = CONSULTATION_TIER_PRICING[tier];
        if (!tierConfig) {
            throw new HttpsError("invalid-argument", "Invalid consultation tier specified.");
        }

        const cleanName = typeof formData.name === "string" ? formData.name.trim() : "";
        const cleanEmail = typeof formData.email === "string" ? formData.email.trim().toLowerCase() : "";
        const cleanPhone = typeof formData.phone === "string" ? formData.phone.trim() : "";

        if (!cleanName || !cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail) || !cleanPhone) {
            throw new HttpsError("invalid-argument", "Valid name, email, and phone number are required.");
        }

        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey) {
            throw new HttpsError("internal", "Paystack secret key is not configured.");
        }

        const compactResults = {
            bmi: userResults?.bmi ?? null,
            bmiCategory: userResults?.bmiCategory || null,
            dailyCalories: userResults?.dailyCalories ?? null,
            goal: userResults?.goal || null,
            dietaryRestrictions: userResults?.dietaryRestrictions || null,
            weight: userResults?.weight ?? null,
            height: userResults?.height ?? null,
            activityLevel: userResults?.activityLevel || null,
            healthConditions: userResults?.healthConditions || null,
            dislikes: userResults?.dislikes || null,
            macros: userResults?.macros || null
        };

        const sanitizedFormData = {
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            message: typeof formData.message === "string" ? formData.message.trim() : "",
            scheduledDate: typeof formData.scheduledDate === "string" ? formData.scheduledDate : "",
            scheduledTime: typeof formData.scheduledTime === "string" ? formData.scheduledTime : "",
            consultationType: tierConfig.consultationType,
            ...(tierConfig.isOntrack ? { isOntrack: true, source: "ontrack" } : { source: "contact_us" })
        };

        const callbackUrl = resolveCallbackUrl(callbackOrigin);

        try {
            const response = await fetch("https://api.paystack.co/transaction/initialize", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: cleanEmail,
                    amount: tierConfig.amountPesewas,
                    currency: "GHS",
                    callback_url: callbackUrl,
                    metadata: {
                        consultationType: tierConfig.consultationType,
                        isOntrack: tierConfig.isOntrack,
                        formData: sanitizedFormData,
                        userResults: compactResults,
                        custom_fields: [
                            { display_name: "Client Name", variable_name: "client_name", value: cleanName },
                            { display_name: "WhatsApp / Phone", variable_name: "client_phone", value: cleanPhone },
                            { display_name: "Consultation Tier", variable_name: "consultation_tier", value: tier }
                        ]
                    }
                })
            });

            if (!response.ok) {
                const errText = await response.text().catch(() => "");
                console.error(`Paystack initialize HTTP ${response.status}:`, errText);
                throw new HttpsError("unavailable", "Unable to start Paystack checkout right now. Please try again.");
            }

            const data = await response.json();
            if (!data.status || !data.data?.authorization_url || !data.data?.reference) {
                console.error("Paystack initialize rejected:", data);
                throw new HttpsError("internal", data.message || "Failed to initialize payment.");
            }

            const reference = data.data.reference;
            try {
                await db.collection("pendingBookings").doc(reference).set({
                    reference,
                    tier,
                    expectedAmountPesewas: tierConfig.amountPesewas,
                    formData: sanitizedFormData,
                    userResults: compactResults,
                    uid: request.auth?.uid || null,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            } catch (pendingErr) {
                console.warn(`Non-blocking warning saving pendingBookings/${reference}:`, pendingErr.message);
            }

            console.log(`Initialized Paystack checkout ${reference} for ${cleanEmail} (${tier})`);
            return {
                success: true,
                authorizationUrl: data.data.authorization_url,
                reference
            };
        } catch (error) {
            if (error instanceof HttpsError) throw error;
            console.error("Error initializing Paystack transaction:", error);
            throw new HttpsError("unavailable", "Could not connect to Paystack. Please try again.");
        }
    }
);

// 5. Securely Verify Paystack Transaction
exports.verifyPaystackTransaction = onCall(
    { secrets: ["PAYSTACK_SECRET_KEY"] },
    async (request) => {
        const reference = request.data.reference;

        if (!reference) {
            throw new HttpsError("invalid-argument", "The function must be called with a transaction reference.");
        }

        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey) {
            throw new HttpsError("internal", "Paystack secret key is not configured.");
        }

        console.log(`Verifying transaction: ${reference}`);

        try {
            const response = await fetch(
                `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Handle HTTP-level errors before attempting to parse JSON
            if (!response.ok) {
                if (response.status >= 500) {
                    console.error(`Paystack server error: ${response.status} for reference ${reference}`);
                    throw new HttpsError(
                        "unavailable",
                        "Paystack is temporarily unavailable. Please wait a few minutes and try again."
                    );
                }
                if (response.status === 404) {
                    return { success: false, message: "Transaction not found. Please ensure payment was completed." };
                }
                if (response.status === 401) {
                    console.error("Paystack authentication failed — check secret key configuration.");
                    throw new HttpsError("internal", "Payment verification is misconfigured. Please contact support.");
                }
                // Any other 4xx
                return { success: false, message: "Payment verification could not be completed. Please contact support." };
            }

            const data = await response.json();

            if (data.status && data.data.status === 'success') {
                console.log(`Transaction ${reference} verified successfully for ${data.data.customer.email}`);
                return {
                    success: true,
                    amount: data.data.amount,
                    customerEmail: data.data.customer.email,
                    channel: data.data.channel,
                    paidAt: data.data.paid_at,
                    metadata: data.data.metadata || null
                };
            } else {
                console.warn(`Transaction verification failed for ${reference}: ${data.message}`);
                return {
                    success: false,
                    message: data.message || "Verification failed."
                };
            }
        } catch (error) {
            // Re-throw HttpsErrors as-is (they carry specific user-facing messages)
            if (error instanceof HttpsError) throw error;

            // Network-level failure (DNS, timeout, connection refused)
            console.error(`Network error verifying transaction ${reference}:`, error);
            throw new HttpsError(
                "unavailable",
                "Could not reach Paystack to verify your payment. Please check your connection and try again."
            );
        }
    }
);

// 6. Process Booking after Paystack Verification
exports.processBooking = onCall(
    { secrets: ["RESEND_API_KEY"] },
    async (request) => {
        const { formData: rawFormData = {}, userResults: rawUserResults = {}, reference, amount } = request.data || {};

        if (!reference) {
            throw new HttpsError("invalid-argument", "Missing transaction reference.");
        }

        const db = admin.firestore();
        const bookingRef = db.collection("bookings").doc(reference);

        // Idempotency check: see if this reference was already processed
        const existingDoc = await bookingRef.get();
        if (existingDoc.exists) {
            console.log(`Booking for reference ${reference} already processed.`);
            return { success: true, message: "Already processed", bookingId: reference };
        }

        // Recover server-saved pending booking data if client storage was cleared across browsers
        let pendingSnapData = null;
        try {
            const pendingSnap = await db.collection("pendingBookings").doc(reference).get();
            if (pendingSnap.exists) {
                pendingSnapData = pendingSnap.data();
            }
        } catch (pendingReadErr) {
            console.warn(`Non-blocking warning reading pendingBookings/${reference}:`, pendingReadErr.message);
        }

        const formData = {
            ...(pendingSnapData?.formData || {}),
            ...(rawFormData || {})
        };
        const userResults = {
            ...(pendingSnapData?.userResults || {}),
            ...(rawUserResults || {})
        };

        if (!formData?.email) {
            throw new HttpsError("invalid-argument", "Missing required booking email.");
        }
        
        // Check if booking originated from OnTrack
        const isOntrack = !!(formData?.isOntrack || formData?.source === 'ontrack' || formData?.source === 'ontrack_diabetes');

        // Derive actual type from amount as the source of truth
        const actualAmount = Number(amount);
        let actualType = 'initial';
        if (actualAmount < 500) {
            actualType = 'followup';
        } else if (actualAmount >= 500 && actualAmount < 700 && !isOntrack && !formData?.isFathersDayBooking) {
            actualType = 'fathersday';
        }

        // 1. Save to Firestore
        // Enrich userResults from Firestore if account exists and data is incomplete
        let enrichedResults = { ...(userResults || {}) };
        const cleanEmail = formData.email ? formData.email.trim().toLowerCase() : "";

        if (cleanEmail) {
            try {
                const userSnap = await db.collection("users")
                    .where("email", "==", cleanEmail)
                    .limit(1)
                    .get();

                if (!userSnap.empty) {
                    const userDoc = userSnap.docs[0];
                    const profileData = userDoc.data() || {};
                    const uid = userDoc.id;

                    console.log(`Enriching booking for ${cleanEmail} from registered user profile (${uid})`);

                    let latestWeight = profileData.weight || null;
                    let latestHeight = profileData.height || null;
                    let latestGoal = profileData.goal || null;
                    let latestBmi = profileData.bmi || null;

                    // Query latest saved assessment (or legacy log) for up-to-date metrics
                    try {
                        const assessmentsSnap = await db.collection("users")
                            .doc(uid)
                            .collection("assessments")
                            .orderBy("createdAt", "desc")
                            .limit(1)
                            .get();

                        if (!assessmentsSnap.empty) {
                            const latestAssessment = assessmentsSnap.docs[0].data();
                            if (latestAssessment.weight) latestWeight = latestAssessment.weight;
                            if (latestAssessment.height) latestHeight = latestAssessment.height;
                            if (latestAssessment.goal) latestGoal = latestAssessment.goal;
                            if (latestAssessment.bmi) latestBmi = latestAssessment.bmi;
                        } else {
                            const logsSnap = await db.collection("users")
                                .doc(uid)
                                .collection("logs")
                                .orderBy("loggedAt", "desc")
                                .limit(1)
                                .get();

                            if (!logsSnap.empty) {
                                const latestLog = logsSnap.docs[0].data();
                                if (latestLog.weight) latestWeight = latestLog.weight;
                                if (latestLog.height) latestHeight = latestLog.height;
                                if (latestLog.goal) latestGoal = latestLog.goal;
                            }
                        }
                    } catch (historyErr) {
                        console.warn("Could not query user assessment/log history for enrichment:", historyErr);
                    }

                    // Compute BMI if missing or zero
                    if ((!latestBmi || latestBmi === 0 || latestBmi === "N/A") && latestWeight && latestHeight) {
                        const hM = Number(latestHeight) / 100;
                        latestBmi = Math.round((Number(latestWeight) / (hM * hM)) * 10) / 10;
                    }

                    // Compute daily calories if missing
                    let calculatedCalories = enrichedResults.dailyCalories;
                    if ((!calculatedCalories || calculatedCalories === 0) && latestWeight && latestHeight) {
                        const w = Number(latestWeight);
                        const h = Number(latestHeight);
                        const age = Number(profileData.age) || 25;
                        const genderFactor = profileData.gender === "male" ? 5 : -161;
                        const bmr = 10 * w + 6.25 * h - 5 * age + genderFactor;
                        const activityMultipliers = { sedentary: 1.15, light: 1.325, moderate: 1.475, active: 1.6 };
                        const tdee = bmr * (activityMultipliers[profileData.activityLevel] || 1.15);
                        let goalCals = tdee;
                        if (latestGoal === "lose") goalCals = tdee - 300;
                        else if (latestGoal === "gain") goalCals = tdee + 300;
                        calculatedCalories = Math.round(goalCals);
                    }

                    const goalMap = {
                        lose: "Weight Loss",
                        gain: "Muscle Gain",
                        maintain: "Weight Maintenance"
                    };
                    const cleanGoal = goalMap[latestGoal] || latestGoal || profileData.goal || enrichedResults.goal || "Not specified";

                    enrichedResults = {
                        ...enrichedResults,
                        weight: latestWeight || enrichedResults.weight || null,
                        height: latestHeight || enrichedResults.height || null,
                        bmi: (latestBmi && latestBmi !== 0) ? latestBmi : (enrichedResults.bmi && enrichedResults.bmi !== 0 ? enrichedResults.bmi : null),
                        dailyCalories: (calculatedCalories && calculatedCalories !== 0) ? calculatedCalories : null,
                        goal: cleanGoal,
                        gender: profileData.gender || enrichedResults.gender || null,
                        age: profileData.age || enrichedResults.age || null,
                        activityLevel: profileData.activityLevel || enrichedResults.activityLevel || null,
                        dietaryRestrictions: profileData.dietaryRestrictions || enrichedResults.dietaryRestrictions || "None",
                        healthConditions: profileData.healthConditions || enrichedResults.healthConditions || null,
                        dislikes: profileData.dislikes || enrichedResults.dislikes || null,
                        hasAccount: true,
                        userId: uid
                    };
                }
            } catch (userQueryErr) {
                console.warn("Failed to check users collection for booking enrichment:", userQueryErr);
            }
        }

        // Clean up zero values
        if (enrichedResults.bmi === 0) enrichedResults.bmi = null;
        if (enrichedResults.dailyCalories === 0) enrichedResults.dailyCalories = null;

        const clientDisplayName = formData.name || (formData.email ? formData.email.split("@")[0] : "Client");
        const resolvedUid = request.auth?.uid || pendingSnapData?.uid || enrichedResults?.userId || null;
        const bookingData = {
            ...formData,
            email: cleanEmail || formData.email,
            emailLower: cleanEmail || null,
            ...(resolvedUid ? { userId: resolvedUid } : {}),
            name: clientDisplayName,
            consultationType: actualType,
            amount: actualAmount,
            paystackReference: reference,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            userResults: enrichedResults,
            ...(isOntrack ? { isOntrack: true, source: formData?.source || 'ontrack' } : {})
        };

        try {
            await bookingRef.set(bookingData);
            console.log(`Booking saved to Firestore: ${reference}`);
            if (pendingSnapData) {
                await db.collection("pendingBookings").doc(reference).delete().catch(() => {});
            }
        } catch (error) {
            console.error("Error saving booking:", error);
            throw new HttpsError("internal", "Failed to save booking. Please contact support.");
        }

        // 2. Send Emails via Resend
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.error("RESEND_API_KEY is missing. Skipping emails.");
            return { success: true, warning: "Saved, but emails not sent." };
        }
        
        const resend = new Resend(resendApiKey);

        try {
            // Email 1: To Admin
            const adminHtml = createAdminBookingEmail(bookingData);
            const isFathersDay = !isOntrack && (!!bookingData.isFathersDayBooking || actualType === 'fathersday');
            const adminSubject = isFathersDay
                ? `New Father's Day Gift: ${bookingData.buyerName || clientDisplayName} for ${bookingData.fatherName || 'N/A'}`
                : isOntrack
                    ? `New OnTrack Booking: ${clientDisplayName} (${actualType === 'followup' ? 'Follow-Up - ₵300' : 'Initial - ₵600'})`
                    : `New Booking: ${clientDisplayName} (${actualType === 'followup' ? 'Follow-Up' : 'Initial'})`;

            await resend.emails.send({
                from: 'Diet With Dee Bookings <bookings@mail.dietwithdee.org>',
                to: ['dietwdee@gmail.com'],
                subject: adminSubject,
                html: adminHtml
            });

            // Email 2: To Client
            const clientHtml = createClientConfirmationEmail(clientDisplayName, actualType, bookingData);
            const clientSubject = isFathersDay 
                ? "Father's Day Gift Confirmed! 🎁" 
                : isOntrack 
                    ? "Your OnTrack Consultation is Confirmed! ✅" 
                    : "Booking Confirmed! ✅";
            await resend.emails.send({
                from: 'Diet With Dee <hello@mail.dietwithdee.org>',
                to: [formData.email],
                subject: clientSubject,
                html: clientHtml
            });

            console.log(`Confirmation emails sent for ${reference}.`);
            await recordTransactionalSent(db, 2);
            return { success: true, bookingId: reference };

        } catch (emailError) {
            console.error("Error sending booking emails:", emailError);
            // Don't fail the whole function if emails fail, data is safely in Firestore
            return { success: true, warning: "Saved, but failed to send confirmation emails." };
        }
    }
);

const deleteSubcollectionDocs = async (firestoreDb, uid, subcollectionName) => {
    const snap = await firestoreDb.collection("users").doc(uid).collection(subcollectionName).get();
    if (snap.empty) return 0;
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += 400) {
        const batch = firestoreDb.batch();
        docs.slice(i, i + 400).forEach((docSnap) => batch.delete(docSnap.ref));
        await batch.commit();
    }
    return docs.length;
};

const purgeUserFirestoreData = async (firestoreDb, uid, email) => {
    const deletedAssessments = await deleteSubcollectionDocs(firestoreDb, uid, "assessments");
    if (deletedAssessments > 0) {
        console.log(`Deleted ${deletedAssessments} assessments for user ${uid}.`);
    }

    const deletedLogs = await deleteSubcollectionDocs(firestoreDb, uid, "logs");
    if (deletedLogs > 0) {
        console.log(`Deleted ${deletedLogs} legacy logs for user ${uid}.`);
    }

    await firestoreDb.collection("users").doc(uid).delete();
    console.log(`Deleted Firestore document for user ${uid}.`);

    if (email) {
        await firestoreDb.collection("emails").doc(email.toLowerCase()).delete();
        console.log(`Deleted email ${email} from emails collection.`);
    }
};

// 7. Admin: Delete User Account and Data
exports.adminDeleteUser = onCall(async (request) => {
    // 1. Check authorization
    if (!isAuthorizedAdmin(request.auth)) {
        throw new HttpsError("permission-denied", "Only authorized admins can delete users.");
    }

    const { uid, email } = request.data;
    if (!uid) {
        throw new HttpsError("invalid-argument", "The function must be called with a user UID.");
    }

    console.log(`Admin ${request.auth.token.email} is deleting user ${uid} (${email || 'no email'})`);

    try {
        // 1. Delete from Firebase Auth
        try {
            await admin.auth().deleteUser(uid);
            console.log(`Successfully deleted user ${uid} from Auth.`);
        } catch (authError) {
            // If user doesn't exist in Auth, we still want to clean up Firestore
            if (authError.code === 'auth/user-not-found') {
                console.warn(`User ${uid} not found in Auth, proceeding with Firestore cleanup.`);
            } else {
                console.error(`Error deleting user ${uid} from Auth:`, authError);
                throw authError;
            }
        }

        // 2. Delete assessments, legacy logs, user profile, and newsletter record
        await purgeUserFirestoreData(admin.firestore(), uid, email);

        // 3. Leave bookings as historical financial records

        return { success: true, message: `User ${uid} and associated data deleted successfully.` };
    } catch (error) {
        console.error("Error in adminDeleteUser:", error);
        throw new HttpsError("internal", error.message || "An error occurred during deletion.");
    }
});

// 8. Public: User self-deletion of account and data
exports.deleteOwnAccount = onCall(async (request) => {
    // 1. Check authentication
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be signed in to delete your account.");
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email;

    console.log(`User ${uid} (${email || 'no email'}) is deleting their own account.`);

    try {
        // 1. Delete assessments, legacy logs, user profile, and email record
        await purgeUserFirestoreData(admin.firestore(), uid, email);

        // 2. Delete from Firebase Auth
        await admin.auth().deleteUser(uid);
        console.log(`Successfully deleted user ${uid} from Auth.`);

        return { success: true, message: "Account and all data deleted successfully." };
    } catch (error) {
        console.error("Error in deleteOwnAccount:", error);
        throw new HttpsError("internal", error.message || "An error occurred during account deletion.");
    }
});

// 9. Public: User unsubscription
exports.unsubscribeUser = onCall(
    { secrets: ["RESEND_API_KEY"] },
    async (request) => {
    // We allow unauthenticated unsubscription because users click links from their email clients
    // where they are almost never signed into the web app.
    
    const email = request.data.email?.trim()?.toLowerCase();
    
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        throw new HttpsError("invalid-argument", "Valid email address is required.");
    }

    try {
        const db = admin.firestore();
        console.log(`Unsubscribing email: ${email}`);
        await db.collection("emails").doc(email).delete();

        // Also remove from Resend Audience
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
            try {
                const resend = new Resend(resendApiKey);
                await resend.contacts.remove({
                    audienceId: RESEND_AUDIENCE_ID,
                    email: email
                });
                console.log(`[unsubscribeUser] Successfully removed ${email} from Resend Audience.`);
            } catch (resendErr) {
                console.warn(`[unsubscribeUser] Resend contact removal notice for ${email}:`, resendErr.message);
            }
        }

        return { success: true, message: "Unsubscribed successfully." };
    } catch (error) {
        console.error("Unsubscribe error:", error);
        throw new HttpsError("internal", "Failed to process unsubscription.");
    }
});

// 10. Admin: Send bulk custom emails to subscribers
exports.sendBulkCustomEmails = onCall(
    { 
      secrets: ["RESEND_API_KEY"],
      memory: "512MiB",
      timeoutSeconds: 300
    },
    async (request) => {
        // Check authorization
        if (!isAuthorizedAdmin(request.auth)) {
            throw new HttpsError("permission-denied", "Only authorized admins can send bulk emails.");
        }

        const { recipients, subject, htmlContent, textContent } = request.data;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            throw new HttpsError("invalid-argument", "At least one recipient email is required.");
        }

        if (!subject || !subject.trim()) {
            throw new HttpsError("invalid-argument", "Email subject is required.");
        }

        if (!htmlContent || !htmlContent.trim()) {
            throw new HttpsError("invalid-argument", "Email content is required.");
        }

        console.log(`Admin ${request.auth.token.email} is sending bulk email to ${recipients.length} subscribers`);

        try {
            const resendApiKey = process.env.RESEND_API_KEY;
            if (!resendApiKey) {
                throw new HttpsError("internal", "Email service is not configured.");
            }

            const resend = new Resend(resendApiKey);

            // Clean and validate email addresses
            const validEmails = recipients.filter(email => {
                const trimmed = email?.trim()?.toLowerCase();
                return trimmed && /^\S+@\S+\.\S+$/.test(trimmed);
            }).map(email => email.trim().toLowerCase());

            if (validEmails.length === 0) {
                throw new HttpsError("invalid-argument", "No valid email addresses provided.");
            }

            // If sending to a large recipient list (e.g. all subscribers), use Resend Broadcast (0 transactional quota)
            if (validEmails.length >= 50) {
                console.log(`[sendBulkCustomEmails] Dispatching Broadcast to audience ${RESEND_AUDIENCE_ID}...`);
                const formattedHtml = htmlContent.trim() + 
                    '\n\n<div style="text-align: center; margin-top: 40px; font-size: 12px; color: #999;"><p><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #16a34a; text-decoration: none;">Unsubscribe</a></p></div>';
                const formattedText = (textContent || htmlContent.replace(/<[^>]*>/g, '')).trim() + 
                    '\n\n---\nUnsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}';

                const { data: broadcast, error: broadcastError } = await resend.broadcasts.create({
                    audienceId: RESEND_AUDIENCE_ID,
                    from: 'Diet With Dee <hello@mail.dietwithdee.org>',
                    replyTo: 'hello@dietwithdee.org',
                    subject: subject.trim(),
                    html: formattedHtml,
                    text: formattedText
                });

                if (broadcastError) {
                    throw new HttpsError("internal", `Broadcast creation failed: ${broadcastError.message}`);
                }

                const { error: sendError } = await resend.broadcasts.send(broadcast.id);
                if (sendError) {
                    throw new HttpsError("internal", `Broadcast send failed: ${sendError.message}`);
                }

                console.log(`[sendBulkCustomEmails] Broadcast ${broadcast.id} dispatched successfully!`);
                return {
                    success: true,
                    sentCount: validEmails.length,
                    message: `Broadcast successfully sent to ${validEmails.length} subscribers instantly via Resend Broadcasts!`
                };
            }

            // For smaller custom target lists (< 50), send immediately in batches
            const payloads = validEmails.map(email => ({
                from: 'Diet With Dee <hello@mail.dietwithdee.org>',
                to: [email],
                reply_to: 'hello@dietwithdee.org',
                subject: subject.trim(),
                html: htmlContent.trim() + '\n\n<div style="text-align: center; margin-top: 40px; font-size: 12px; color: #999;"><p><a href="https://dietwithdee.org/unsubscribe?email=' + encodeURIComponent(email) + '" style="color: #16a34a; text-decoration: none;">Unsubscribe</a></p></div>',
                text: (textContent || htmlContent.replace(/<[^>]*>/g, '')).trim() + '\n\n---\nUnsubscribe: https://dietwithdee.org/unsubscribe?email=' + encodeURIComponent(email),
                headers: {
                    'List-Unsubscribe': `<https://dietwithdee.org/unsubscribe?email=${encodeURIComponent(email)}>`
                }
            }));

            const { data: batchResult, error: batchError } = await resend.batch.send(payloads);
            if (batchError) {
                throw new HttpsError("internal", `Failed to send batch emails: ${batchError.message}`);
            }

            return {
                success: true,
                sentCount: validEmails.length,
                message: `Successfully sent email to ${validEmails.length} recipient(s).`
            };
        } catch (error) {
            console.error("Error in sendBulkCustomEmails:", error);
            if (error instanceof HttpsError) throw error;
            throw new HttpsError("internal", error.message || "Failed to send emails");
        }
    }
);

// 11. Public: Submit Tier 03 Custom & Specialist Care Inquiry (saves to Firestore + sends Resend emails)
exports.submitBespokeInquiry = onCall(
    { secrets: ["RESEND_API_KEY"] },
    async (request) => {
        const { name, email, phone, message, inquiryTopic } = request.data || {};
        const cleanName = typeof name === "string" ? name.trim() : "";
        const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        const cleanPhone = typeof phone === "string" ? phone.trim() : "";
        const cleanMessage = typeof message === "string" ? message.trim() : "";
        const cleanTopic = typeof inquiryTopic === "string" && inquiryTopic.trim()
            ? inquiryTopic.trim()
            : "Custom & Specialist Care";

        if (!cleanName || !cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail) || !cleanPhone || !cleanMessage) {
            throw new HttpsError("invalid-argument", "Please provide your name, valid email, phone number, and care notes.");
        }

        const inquiryDoc = {
            name: cleanName,
            email: cleanEmail,
            emailLower: cleanEmail,
            ...(request.auth?.uid ? { userId: request.auth.uid } : {}),
            phone: cleanPhone,
            message: cleanMessage,
            inquiryTopic: cleanTopic,
            status: "new",
            source: "contact_us_tier_03",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        let savedId = null;
        try {
            const docRef = await db.collection("inquiries").add(inquiryDoc);
            savedId = docRef.id;
            console.log(`Bespoke inquiry saved: ${savedId} (${cleanEmail})`);
        } catch (err) {
            console.error("Error saving bespoke inquiry:", err);
            throw new HttpsError("internal", "Could not save your inquiry. Please try again or reach us on WhatsApp.");
        }

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.warn("RESEND_API_KEY missing; inquiry saved without email notification.");
            return { success: true, inquiryId: savedId, warning: "Saved, email notifications unavailable." };
        }

        try {
            const resend = new Resend(resendApiKey);
            await resend.emails.send({
                from: "Diet With Dee Inquiries <bookings@mail.dietwithdee.org>",
                to: ["dietwdee@gmail.com"],
                reply_to: cleanEmail,
                subject: `New Bespoke Care Inquiry: ${cleanName} (${cleanTopic})`,
                html: createAdminInquiryEmail(inquiryDoc)
            });

            await resend.emails.send({
                from: "Diet With Dee <hello@mail.dietwithdee.org>",
                to: [cleanEmail],
                subject: "We received your Diet With Dee care inquiry",
                html: createClientInquiryEmail(cleanName, cleanTopic)
            });

            await recordTransactionalSent(db, 2);
            return { success: true, inquiryId: savedId };
        } catch (emailErr) {
            console.error("Error sending inquiry emails:", emailErr);
            return { success: true, inquiryId: savedId, warning: "Saved, but email confirmation failed." };
        }
    }
);

// 12. Authenticated Client Care Portal: Fetch matched consultations & custom care inquiries
exports.getMyCarePortal = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "Please sign in to view your sessions.");
    }

    const uid = request.auth.uid;
    const rawEmail = typeof request.auth.token.email === "string" ? request.auth.token.email.trim() : "";
    const cleanEmail = rawEmail.toLowerCase();
    const emailVerified = !!request.auth.token.email_verified;

    try {
        const firestoreDb = admin.firestore();
        const bookingQueries = [
            firestoreDb.collection("bookings").where("userId", "==", uid).get()
        ];
        const inquiryQueries = [
            firestoreDb.collection("inquiries").where("userId", "==", uid).get()
        ];
        const assessmentLogQueries = [
            firestoreDb.collection("knowYourBodyLogs").where("uid", "==", uid).get()
        ];

        if (emailVerified && cleanEmail) {
            bookingQueries.push(
                firestoreDb.collection("bookings").where("emailLower", "==", cleanEmail).get(),
                firestoreDb.collection("bookings").where("email", "==", cleanEmail).get()
            );
            inquiryQueries.push(
                firestoreDb.collection("inquiries").where("emailLower", "==", cleanEmail).get(),
                firestoreDb.collection("inquiries").where("email", "==", cleanEmail).get()
            );
            assessmentLogQueries.push(
                firestoreDb.collection("knowYourBodyLogs").where("emailLower", "==", cleanEmail).get()
            );
            if (rawEmail && rawEmail !== cleanEmail) {
                bookingQueries.push(
                    firestoreDb.collection("bookings").where("email", "==", rawEmail).get()
                );
                inquiryQueries.push(
                    firestoreDb.collection("inquiries").where("email", "==", rawEmail).get()
                );
            }
        }

        // Also fetch any bookings explicitly linked by Paystack reference on users/{uid}
        const userDoc = await firestoreDb.collection("users").doc(uid).get();
        const linkedRefs = Array.isArray(userDoc.data()?.linkedBookingRefs)
            ? userDoc.data().linkedBookingRefs.filter((r) => typeof r === "string" && r.trim())
            : [];

        linkedRefs.forEach((ref) => {
            bookingQueries.push(firestoreDb.collection("bookings").doc(ref.trim()).get());
        });

        const [bookingSnaps, inquirySnaps, assessmentLogSnaps] = await Promise.all([
            Promise.all(bookingQueries),
            Promise.all(inquiryQueries),
            Promise.all(assessmentLogQueries)
        ]);

        return {
            success: true,
            bookings: mergeDocsById(bookingSnaps, sanitizePortalBooking),
            inquiries: mergeDocsById(inquirySnaps, sanitizePortalInquiry),
            emailAssessments: mergeDocsById(assessmentLogSnaps, sanitizePortalAssessment)
        };
    } catch (error) {
        console.error(`Error loading My Care Portal for ${uid}:`, error);
        throw new HttpsError("internal", "Unable to load your consultation history right now.");
    }
});

// 13. Authenticated Client Care Portal: Link a paid booking made with another email using Reference + Phone last 4
exports.linkBookingByReference = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "Please sign in first.");
    }

    const uid = request.auth.uid;
    const rawEmail = typeof request.auth.token.email === "string" ? request.auth.token.email.trim() : "";
    const cleanEmail = rawEmail.toLowerCase();
    const emailVerified = !!request.auth.token.email_verified;

    const cleanRef = typeof request.data?.reference === "string" ? request.data.reference.trim() : "";
    const cleanPhoneLast4 = typeof request.data?.phoneLast4 === "string"
        ? request.data.phoneLast4.replace(/\D/g, "").slice(-4)
        : "";

    if (!cleanRef || cleanPhoneLast4.length !== 4) {
        throw new HttpsError(
            "invalid-argument",
            "Enter both your Paystack reference and the last 4 digits of the phone number used when booking."
        );
    }

    try {
        const firestoreDb = admin.firestore();
        let bookingDoc = await firestoreDb.collection("bookings").doc(cleanRef).get();
        if (!bookingDoc.exists) {
            const fallbackQuery = await firestoreDb
                .collection("bookings")
                .where("paystackReference", "==", cleanRef)
                .limit(1)
                .get();
            if (!fallbackQuery.empty) {
                bookingDoc = fallbackQuery.docs[0];
            }
        }

        if (!bookingDoc.exists) {
            return { success: false, message: "No confirmed booking matches that reference code." };
        }

        const data = bookingDoc.data() || {};
        const linkCheck = verifyBookingLinkEligibility({
            bookingData: data,
            uid,
            cleanEmail,
            emailVerified,
            phoneLast4: cleanPhoneLast4
        });

        if (!linkCheck.ok) {
            return { success: false, message: linkCheck.message };
        }

        await bookingDoc.ref.update({
            userId: uid,
            updatedAt: new Date().toISOString()
        });

        await firestoreDb.collection("users").doc(uid).set({
            ...(cleanEmail ? { email: cleanEmail } : {}),
            linkedBookingRefs: admin.firestore.FieldValue.arrayUnion(bookingDoc.id),
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return {
            success: true,
            booking: sanitizePortalBooking(bookingDoc)
        };
    } catch (error) {
        console.error(`Error linking booking ${cleanRef} for ${uid}:`, error);
        throw new HttpsError("internal", "Could not link booking right now. Please try again.");
    }
});

// 14. KnowYourBody Calculator: Persist assessment lead/log, enrich subscriber profile, and email summary via Resend
exports.recordKnowYourBodyCheck = onCall(
    { secrets: ["RESEND_API_KEY"] },
    async (request) => {
        const { email, snapshot } = request.data || {};
        const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
            throw new HttpsError("invalid-argument", "Valid email address is required.");
        }

        const bmiVal = Number(snapshot?.bmi);
        if (!snapshot || !Number.isFinite(bmiVal) || bmiVal <= 0) {
            throw new HttpsError("invalid-argument", "Valid assessment snapshot is required.");
        }

        const firestoreDb = admin.firestore();
        const uid = request.auth?.uid || null;
        const nowIso = new Date().toISOString();
        const logDocId = buildKnowYourBodyLogDocId(cleanEmail, snapshot.savedAt);
        const logRef = firestoreDb.collection("knowYourBodyLogs").doc(logDocId);

        const existingSnap = await logRef.get();
        if (existingSnap.exists) {
            return {
                success: true,
                alreadyRecorded: true,
                resultsEmailSent: !!existingSnap.data()?.resultsEmailSent
            };
        }

        const sanitizedLog = {
            email: cleanEmail,
            emailLower: cleanEmail,
            uid,
            isRegisteredUser: !!uid,
            bmi: bmiVal,
            bmiCategory: snapshot.bmiCategory || null,
            bmr: snapshot.bmr ? Number(snapshot.bmr) : null,
            dailyCalories: snapshot.dailyCalories ? Number(snapshot.dailyCalories) : null,
            macros: snapshot.macros || null,
            weight: snapshot.weight ? Number(snapshot.weight) : null,
            height: snapshot.height ? Number(snapshot.height) : null,
            targetWeight: snapshot.targetWeight ? Number(snapshot.targetWeight) : null,
            age: snapshot.age ? parseInt(snapshot.age, 10) : null,
            gender: snapshot.gender || null,
            goal: snapshot.goal || null,
            activityLevel: snapshot.activityLevel || null,
            sleepHours: snapshot.sleepHours || null,
            dietaryRestrictions: snapshot.dietaryRestrictions || "None",
            healthConditions: snapshot.healthConditions || "",
            dislikes: snapshot.dislikes || "",
            unitsUsed: snapshot.unitsUsed || "metric",
            clientSavedAt: snapshot.savedAt || null,
            source: "knowyourbody",
            resultsEmailSent: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAtIso: nowIso
        };

        await logRef.set(sanitizedLog);

        // Enrich or subscribe email doc cleanly for SubscribersPanel & segmentation
        try {
            const emailRef = firestoreDb.collection("emails").doc(cleanEmail);
            const emailDoc = await emailRef.get();
            const metadataUpdate = {
                hasKnowYourBodyCheck: true,
                lastKnowYourBodyAt: nowIso,
                lastGoal: sanitizedLog.goal,
                lastBmi: sanitizedLog.bmi,
                lastBmiCategory: sanitizedLog.bmiCategory,
                lastDailyCalories: sanitizedLog.dailyCalories,
                lastHealthConditions: sanitizedLog.healthConditions || null,
                knowYourBodyCount: admin.firestore.FieldValue.increment(1),
                sources: admin.firestore.FieldValue.arrayUnion("knowyourbody"),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            if (emailDoc.exists) {
                await emailRef.set(metadataUpdate, { merge: true });
            } else {
                await emailRef.set({
                    email: cleanEmail,
                    source: "knowyourbody",
                    skipWelcomeEmail: true,
                    createdAt: admin.firestore.Timestamp.now(),
                    ...metadataUpdate
                });
            }
        } catch (emailDocErr) {
            console.warn(`Non-blocking error enriching emails/${cleanEmail}:`, emailDocErr.message);
        }

        // Send personalized KnowYourBody results email via Resend
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.warn("RESEND_API_KEY missing; recorded KnowYourBody check without emailing summary.");
            return { success: true, logId: logDocId, resultsEmailSent: false };
        }

        try {
            const resend = new Resend(resendApiKey);
            const htmlContent = createKnowYourBodyResultsEmail({
                email: cleanEmail,
                snapshot: sanitizedLog
            });

            const { error: sendError } = await resend.emails.send({
                from: "Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>",
                to: [cleanEmail],
                subject: `Your KnowYourBody Results: ${sanitizedLog.dailyCalories || ""} kcal/day & BMI ${sanitizedLog.bmi}`.trim(),
                html: htmlContent,
                headers: {
                    "List-Unsubscribe": `<https://dietwithdee.org/unsubscribe?email=${encodeURIComponent(cleanEmail)}>`
                }
            });

            if (sendError) {
                console.error(`Failed to send KnowYourBody summary email to ${cleanEmail}:`, sendError);
                return { success: true, logId: logDocId, resultsEmailSent: false };
            }

            await logRef.update({ resultsEmailSent: true });
            await recordTransactionalSent(firestoreDb, 1);
            return { success: true, logId: logDocId, resultsEmailSent: true };
        } catch (emailErr) {
            console.error(`Error dispatching KnowYourBody summary email to ${cleanEmail}:`, emailErr);
            return { success: true, logId: logDocId, resultsEmailSent: false };
        }
    }
);
