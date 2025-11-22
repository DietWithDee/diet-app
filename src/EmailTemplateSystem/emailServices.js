// emailService.js
import { getAllEmails } from '../firebaseUtils';
import { createEmailTemplate } from './emailTemplate';

// Email service configuration
const EMAIL_SERVICE_CONFIG = {
  apiEndpoint: 'https://api.emailjs.com/api/v1.0/email/send',
  serviceId: 'service_6dvxkid',
  templateId: 'template_u0bmden',
  publicKey: 'T7o7fFGosrfDNbf16',
  fromEmail: 'dietwdee@gmail.com',
  fromName: 'Nana Ama from Diet with Dee'
};

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

// -------- Send via EmailJS ----------
const sendEmailViaEmailJS = async (toEmail, subject, htmlContent) => {
  try {
    const templateParams = {
      to_email: toEmail,
      from_name: EMAIL_SERVICE_CONFIG.fromName,
      from_email: EMAIL_SERVICE_CONFIG.fromEmail,
      subject: subject,
      html_content: htmlContent,
      message_html: htmlContent   // <-- MUST match placeholder in EmailJS template
    };

    const response = await fetch(EMAIL_SERVICE_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: 
      { 'Content-Type': 'application/json',
        'Accept': 'application/json'  // Ensure we get JSON response
       },
      body: JSON.stringify({
        service_id: EMAIL_SERVICE_CONFIG.serviceId,
        template_id: EMAIL_SERVICE_CONFIG.templateId,
        user_id: EMAIL_SERVICE_CONFIG.publicKey,
        template_params: templateParams
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email via EmailJS:', error);
    return false;
  }
};

// -------- Optional webhook path (unchanged) ----------
const sendEmailViaWebhook = async (toEmail, subject, htmlContent) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: toEmail,
        from: EMAIL_SERVICE_CONFIG.fromEmail,
        fromName: EMAIL_SERVICE_CONFIG.fromName,
        subject: subject,
        html: htmlContent
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email via webhook:', error);
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
      // Mark as sent so we don’t retry needlessly for this article
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
            const ok = await sendEmailViaEmailJS(email, subject, emailContent);
            // const ok = await sendEmailViaWebhook(email, subject, emailContent); // alt
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

    // If at least one succeeded, mark idempotency so future calls won’t resend
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

// -------- Test helper (unchanged) ----------
export const sendTestNewsletter = async () => {
  const testEmail = 'test@example.com';
  const testTitle = 'Sample Article Title';
  const testImageUrl = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061';
  const testArticleId = 'test-article-id';

  const emailContent = createEmailTemplate(testTitle, testImageUrl, testArticleId);
  const subject = `Test: New Article from Nana Ama Dwamena: ${testTitle}`;

  try {
    const success = await sendEmailViaEmailJS(testEmail, subject, emailContent);
    return { success, message: success ? 'Test email sent successfully!' : 'Failed to send test email' };
  } catch (error) {
    return { success: false, message: `Error sending test email: ${error.message}` };
  }
};
