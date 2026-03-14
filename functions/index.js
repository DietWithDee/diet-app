const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentUpdated, onDocumentCreated } = require("firebase-functions/v2/firestore");
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
exports.onArticlePublished = onDocumentUpdated(
  { document: "articles/{articleId}", secrets: ["RESEND_API_KEY"] },
  async (event) => {
    const articleId = event.params.articleId;
    
    if (!event.data) {
        return;
    }

    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    if (!beforeData || !afterData) {
        return;
    }

    // Check if status changed from something else to 'published'
    const wasPublished = beforeData.status === "published";
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
                from: 'Diet With Dee <newsletter@dietwithdee.org>',
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
