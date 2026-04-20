const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentUpdated, onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { Resend } = require("resend");
const { createEmailTemplate, createWelcomeTemplate } = require("./emailTemplate");
const { createAdminBookingEmail, createClientConfirmationEmail } = require("./bookingEmailTemplates");


admin.initializeApp();
const db = admin.firestore();

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
setGlobalOptions({ maxInstances: 3 });

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

// 2. Trigger Function on Article Publish to Send Newsletters
exports.onArticlePublished = onDocumentWritten(
  { document: "articles/{articleId}", secrets: ["RESEND_API_KEY"] },
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
        console.log(`Newsletter already sent for article ${articleId}. Skipping.`);
        return;
    }

    console.log(`Article ${articleId} just transitioned to published! Preparing newsletter...`);

    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY is not set.");
      }
      const resend = new Resend(resendApiKey);

      const emailsQuery = await db.collection("emails").get();
      if (emailsQuery.empty) {
        console.log("No subscribers found. Skipping emails.");
        return;
      }

      const uniqueEmails = new Set();
      emailsQuery.forEach(doc => {
        const email = doc.data().email?.trim()?.toLowerCase();
        if (email && /^\S+@\S+\.\S+$/.test(email)) {
          uniqueEmails.add(email);
        }
      });

      const subscriberEmails = Array.from(uniqueEmails);
      console.log(`Found ${subscriberEmails.length} unique subscribers.`);

      if (subscriberEmails.length === 0) return;

      const subject = `New from Diet With Dee: ${afterData.title}`;
      const coverImage = afterData.coverImage || "";
      const emailHtml = createEmailTemplate(afterData.title, coverImage, articleId);
      const emailText = `New Article: ${afterData.title}\n\nRead more at: https://dietwithdee.org/blog/${articleId}\n\nTo unsubscribe: https://dietwithdee.org/unsubscribe`;

      let sentCount = 0;
      let failCount = 0;

      const batchSize = 50;
      for (let i = 0; i < subscriberEmails.length; i += batchSize) {
        const batchEmails = subscriberEmails.slice(i, i + batchSize);
        
        const batchedPayloads = batchEmails.map(email => ({
             from: 'Diet With Dee <newsletter@dietwithdee.org>',
             to: [email],
             reply_to: 'hello@dietwithdee.org',
             subject: subject,
             html: emailHtml.split('https://dietwithdee.org/unsubscribe').join(`https://dietwithdee.org/unsubscribe?email=${encodeURIComponent(email)}`),
             text: emailText + `?email=${encodeURIComponent(email)}`,
             headers: {
               'List-Unsubscribe': `<https://dietwithdee.org/unsubscribe?email=${encodeURIComponent(email)}>`
             }
        }));

        try {
            const { data, error } = await resend.batch.send(batchedPayloads);
            if (error) {
                console.error("Batch send error:", error);
                failCount += batchEmails.length;
            } else {
                sentCount += batchEmails.length;
            }
        } catch (err) {
            console.error("Batch send failed completely:", err);
            failCount += batchEmails.length;
        }
        
        await new Promise(r => setTimeout(r, 500));
      }

      console.log(`Newsletter task complete: ${sentCount} sent, ${failCount} failed.`);

      if (sentCount > 0) {
          await db.collection("articles").doc(articleId).update({
              newsletterSent: true
          });
      }
    } catch (error) {
      console.error("Error in newsletter distribution:", error);
    }
  }
);

// 3. Trigger Function for New Subscribers to Send Welcome Email
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
            console.warn("New subscription document lacks an email address. Skipping welcome email.");
            return;
        }

        console.log(`New subscriber detected: ${email}. Sending welcome email...`);

        try {
            const resendApiKey = process.env.RESEND_API_KEY;
            if (!resendApiKey) {
                throw new Error("RESEND_API_KEY is not set.");
            }
            const resend = new Resend(resendApiKey);

            const welcomeContent = createWelcomeTemplate();
            
            const { data: result, error } = await resend.emails.send({
                from: 'Nana Ama from Diet With Dee <hello@dietwithdee.org>',
                to: [email],
                subject: 'Welcome to Diet With Dee! 🌿',
                html: welcomeContent.split('https://dietwithdee.org/unsubscribe').join(`https://dietwithdee.org/unsubscribe?email=${encodeURIComponent(email)}`)
            });

            if (error) {
                console.error(`Error sending welcome email to ${email}:`, error);
            } else {
                console.log(`Welcome email successfully sent to ${email}. ID: ${result.id}`);
            }
        } catch (error) {
            console.error("Error in onNewSubscriber welcome email logic:", error);
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

            await emailDocRef.set({
                email: email,
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
                    paidAt: data.data.paid_at
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
        const { formData, userResults, reference, amount } = request.data;

        if (!reference || !formData?.email) {
            throw new HttpsError("invalid-argument", "Missing required booking data.");
        }
        
        // Derive actual type from amount as the source of truth
        const actualAmount = Number(amount);
        const actualType = actualAmount < 600 ? 'followup' : 'initial';

        const db = admin.firestore();
        const bookingRef = db.collection("bookings").doc(reference);

        // Idempotency check: see if this reference was already processed
        const existingDoc = await bookingRef.get();
        if (existingDoc.exists) {
            console.log(`Booking for reference ${reference} already processed.`);
            return { success: true, message: "Already processed", bookingId: reference };
        }

        // 1. Save to Firestore
        const bookingData = {
            ...formData,
            consultationType: actualType,
            amount: actualAmount,
            paystackReference: reference,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            userResults: userResults || {}
        };

        try {
            await bookingRef.set(bookingData);
            console.log(`Booking saved to Firestore: ${reference}`);
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
            await resend.emails.send({
                from: 'Diet With Dee Bookings <bookings@dietwithdee.org>',
                to: ['dietwdee@gmail.com'],
                subject: `New Booking: ${formData.name} (${actualType === 'followup' ? 'Follow-Up' : 'Initial'})`,
                html: adminHtml
            });

            // Email 2: To Client
            const clientHtml = createClientConfirmationEmail(formData.name, actualType);
            await resend.emails.send({
                from: 'Diet With Dee <hello@dietwithdee.org>',
                to: [formData.email],
                subject: 'Booking Confirmed! ✅',
                html: clientHtml
            });

            console.log(`Confirmation emails sent for ${reference}.`);
            return { success: true, bookingId: reference };

        } catch (emailError) {
            console.error("Error sending booking emails:", emailError);
            // Don't fail the whole function if emails fail, data is safely in Firestore
            return { success: true, warning: "Saved, but failed to send confirmation emails." };
        }
    }
);

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

        const db = admin.firestore();

        // 2. Delete user's logs subcollection
        const logsSnapshot = await db.collection("users").doc(uid).collection("logs").get();
        if (!logsSnapshot.empty) {
            const batch = db.batch();
            logsSnapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`Deleted ${logsSnapshot.size} logs for user ${uid}.`);
        }

        // 3. Delete user document from Firestore
        await db.collection("users").doc(uid).delete();
        console.log(`Deleted Firestore document for user ${uid}.`);

        // 4. Delete from emails collection if email is provided
        if (email) {
            await db.collection("emails").doc(email.toLowerCase()).delete();
            console.log(`Deleted email ${email} from emails collection.`);
        }

        // 5. Delete bookings? 
        // We'll leave bookings as historical financial records for now, 
        // but they could be deleted here if needed by querying by email.

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
        const db = admin.firestore();

        // 1. Delete user's logs subcollection
        const logsSnapshot = await db.collection("users").doc(uid).collection("logs").get();
        if (!logsSnapshot.empty) {
            const batch = db.batch();
            logsSnapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`Deleted ${logsSnapshot.size} logs for user ${uid}.`);
        }

        // 2. Delete user document from Firestore
        await db.collection("users").doc(uid).delete();
        console.log(`Deleted Firestore document for user ${uid}.`);

        // 3. Delete from emails collection if email is available
        if (email) {
            await db.collection("emails").doc(email.toLowerCase()).delete();
            console.log(`Deleted email ${email} from emails collection.`);
        }

        // 4. Finally, delete from Firebase Auth
        // The Admin SDK can delete users without requiring a recent login session.
        await admin.auth().deleteUser(uid);
        console.log(`Successfully deleted user ${uid} from Auth.`);

        return { success: true, message: "Account and all data deleted successfully." };
    } catch (error) {
        console.error("Error in deleteOwnAccount:", error);
        throw new HttpsError("internal", error.message || "An error occurred during account deletion.");
    }
});

// 9. Public: User unsubscription
exports.unsubscribeUser = onCall(async (request) => {
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
        return { success: true, message: "Unsubscribed successfully." };
    } catch (error) {
        console.error("Unsubscribe error:", error);
        throw new HttpsError("internal", "Failed to process unsubscription.");
    }
});
