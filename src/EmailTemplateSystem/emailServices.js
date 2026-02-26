// emailService.js
import { getAllEmails } from '../firebaseUtils';
import { createEmailTemplate } from './emailTemplate';

// -------- Configuration ----------
// In production, this should point to your deployed Cloudflare Worker URL.
// During development, run the worker locally with `npm run dev` in workers/email-proxy/
const EMAIL_PROXY_URL = import.meta.env.VITE_EMAIL_PROXY_URL || 'https://dwd-email-proxy.godwinokro2020.workers.dev';

// -------- Runtime lock (same-tab/same-session) ----------
const sendingLocks = new Set();

// -------- Local idempotency (persists across reloads in this browser) ----------
const localKeyFor = (articleId) => `newsletter_sent_${articleId}`;
const hasLocalIdempotency = (articleId) => {
  try {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(localKeyFor(articleId)) === '1';
  } catch {
    return false;
  }
};
const setLocalIdempotency = (articleId) => {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(localKeyFor(articleId), '1');
  } catch {
    /* ignore storage errors */
  }
};

// -------- Get all subscriber emails (deduped + sanitized) ----------
export const getAllSubscriberEmails = async () => {
  try {
    const result = await getAllEmails();
    const unique = new Set();

    if (result.success && Array.isArray(result.data)) {
      for (const emailDoc of result.data) {
        const email = String(emailDoc?.email ?? '')
          .trim()
          .toLowerCase();
        if (email && /\S+@\S+\.\S+/.test(email)) {
          unique.add(email);
        }
      }
    }
    return [...unique];
  } catch (error) {
    console.error('Error fetching subscriber emails:', error);
    return [];
  }
};

// -------- Send via Resend (through Cloudflare Worker proxy) ----------
const sendEmailViaResend = async (toEmail, subject, htmlContent) => {
  try {
    const response = await fetch(EMAIL_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: toEmail,
        subject: subject,
        html: htmlContent,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`Resend error for ${toEmail}:`, result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return false;
  }
};

// -------- Main: send once per articleId (idempotent) ----------
export const sendNewArticleNewsletter = async (articleTitle, articleImageUrl, articleId) => {
  // If we already sent (in this browser), skip immediately
  if (hasLocalIdempotency(articleId)) {
    console.warn(`[Newsletter] Already sent for ${articleId} (local idempotency). Skipping.`);
    return { success: true, message: 'Already sent (local idempotency).', sent: 0, failed: 0, total: 0 };
  }

  // Prevent concurrent runs in the same runtime/tab
  if (sendingLocks.has(articleId)) {
    console.warn(`[Newsletter] Send already in progress for ${articleId}. Skipping duplicate call.`);
    return { success: true, message: 'Send in progress. Skipped duplicate call.', sent: 0, failed: 0, total: 0 };
  }
  sendingLocks.add(articleId);

  try {
    console.log('Starting newsletter send process...');

    const subscriberEmails = await getAllSubscriberEmails();
    const uniqueEmails = [...new Set(subscriberEmails.map(e => String(e).trim().toLowerCase()))];

    if (uniqueEmails.length === 0) {
      console.log('No subscribers found');
      // Mark as sent so we don't retry needlessly for this article
      setLocalIdempotency(articleId);
      return { success: true, message: 'No subscribers to notify', sent: 0, failed: 0, total: 0 };
    }

    console.log(`Unique subscribers: ${uniqueEmails.length}`);

    const emailContent = createEmailTemplate(articleTitle, articleImageUrl, articleId);
    const subject = `New Article from Nana Ama Dwamena: ${articleTitle}`;

    const batchSize = 10;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < uniqueEmails.length; i += batchSize) {
      const batch = uniqueEmails.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (email) => {
          try {
            const ok = await sendEmailViaResend(email, subject, emailContent);
            if (ok) {
              successCount++;
              console.log(`Email sent successfully to: ${email}`);
            } else {
              failureCount++;
              console.error(`Failed to send email to: ${email}`);
            }
          } catch (err) {
            failureCount++;
            console.error(`Error sending email to ${email}:`, err);
          }
        })
      );

      if (i + batchSize < uniqueEmails.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // If at least one succeeded, mark idempotency so future calls won't resend
    if (successCount > 0) {
      setLocalIdempotency(articleId);
    }

    console.log(`Newsletter send complete. Success: ${successCount}, Failures: ${failureCount}`);

    return {
      success: true,
      message: `Newsletter sent to ${successCount} subscribers`,
      sent: successCount,
      failed: failureCount,
      total: uniqueEmails.length
    };

  } catch (error) {
    console.error('Error sending newsletter:', error);
    return { success: false, error: error.message, sent: 0, failed: 0, total: 0 };
  } finally {
    sendingLocks.delete(articleId);
  }
};

// -------- Test helper ----------
export const sendTestNewsletter = async () => {
  const testEmail = 'dietwdee@gmail.com';
  const testTitle = 'Sample Article Title';
  const testImageUrl = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061';
  const testArticleId = 'test-article-id';

  const emailContent = createEmailTemplate(testTitle, testImageUrl, testArticleId);
  const subject = `Test: New Article from Nana Ama Dwamena: ${testTitle}`;

  try {
    const success = await sendEmailViaResend(testEmail, subject, emailContent);
    return { success, message: success ? 'Test email sent successfully!' : 'Failed to send test email' };
  } catch (error) {
    return { success: false, message: `Error sending test email: ${error.message}` };
  }
};
