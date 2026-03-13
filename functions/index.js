const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { Resend } = require("resend");
const { createEmailTemplate } = require("./emailTemplate");

admin.initializeApp();
const db = admin.firestore();

// Set global options to max instances to avoid cold start issues if desired
setGlobalOptions({ maxInstances: 10 });

// 1. Scheduled Function to Publish Articles
exports.publishScheduledArticles = onSchedule("every 1 hours", async (event) => {
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
        if (email && /\\S+@\\S+\\.\\S+/.test(email)) {
          uniqueEmails.add(email);
        }
      });

      const subscriberEmails = Array.from(uniqueEmails);
      console.log(`Found ${subscriberEmails.length} unique subscribers.`);

      if (subscriberEmails.length === 0) return;

      // Prepare Email Template
      const subject = `New from Diet With Dee: ${afterData.title}`;
      const imageUrl = afterData.coverImage || "";
      const emailContent = createEmailTemplate(afterData.title, imageUrl, articleId);

      // Batch send via Resend
      let sentCount = 0;
      let failCount = 0;

      // Resend allows up to 10 emails per second and batched sends of up to 100 per request
      // Let's use batched sending for efficiency and PRIVACY (individual emails)
      
      const batchSize = 50;
      for (let i = 0; i < subscriberEmails.length; i += batchSize) {
        const batchEmails = subscriberEmails.slice(i, i + batchSize);
        
        // Map the batch of emails to individual email objects for Resend's batch API
        const batchedPayloads = batchEmails.map(email => ({
             from: 'Diet With Dee <newsletter@dietwithdee.org>',
             to: [email], // Send individually so subscribers don't see each other
             subject: subject,
             html: emailContent
        }));

        try {
            // Send the batch securely
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
        
        // Moderate delay between batches
        await new Promise(r => setTimeout(r, 500));
      }

      console.log(`Newsletter sending task complete! Attempted: ${subscriberEmails.length}, Successful: ${sentCount}, Failed: ${failCount}`);

      // Mark the article as having its newsletter sent so we don't spam if toggled
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
