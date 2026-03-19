const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentUpdated, onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { Resend } = require("resend");
const { createEmailTemplate, createWelcomeTemplate } = require("./emailTemplate");

admin.initializeApp();
const db = admin.firestore();

// Set global options to max instances to avoid cold start issues if desired
setGlobalOptions({ maxInstances: 10 });

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

    // Check if status transitioned to 'published'
    // 1. If it was created as 'published' (beforeData is null)
    // 2. If it was updated from something else to 'published' (beforeData is not null)
    const wasPublished = beforeData ? beforeData.status === "published" : false;
    const isNowPublished = afterData.status === "published";

    if (wasPublished || !isNowPublished) {
      return; // Skip if it was already published or if it's not published now
    }

    // Double check if there's a title and if we already sent the newsletter
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
      // Setup Resend
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY is not set.");
      }
      const resend = new Resend(resendApiKey);

      // Fetch all unique subscriber emails
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

      // Prepare Email Template
      const subject = `New from Diet With Dee: ${afterData.title}`;
      const coverImage = afterData.coverImage || "";
      const emailContent = createEmailTemplate(afterData.title, coverImage, articleId);

      // Batch send via Resend
      let sentCount = 0;
      let failCount = 0;

      // Resend allows up to 10 emails per second and batched sends of up to 100 per request
      const batchSize = 50;
      for (let i = 0; i < subscriberEmails.length; i += batchSize) {
        const batchEmails = subscriberEmails.slice(i, i + batchSize);
        
        const batchedPayloads = batchEmails.map(email => ({
             from: 'Diet With Dee <newsletter@dietwithdee.org>',
             to: [email],
             subject: subject,
             html: emailContent
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

      console.log(`Newsletter sending task complete! Attempted: ${subscriberEmails.length}, Successful: ${sentCount}, Failed: ${failCount}`);

      if (sentCount > 0) {
          await db.collection("articles").doc(articleId).update({
              newsletterSent: true
          });
      }
    } catch (error) {
      console.error("Error in onArticlePublished email logic:", error);
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
                html: welcomeContent
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
