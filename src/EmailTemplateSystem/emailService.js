// emailService.js
import { getAllEmails } from '../firebaseUtils';
import { createEmailTemplate } from './emailTemplate';

// Email service configuration
const EMAIL_SERVICE_CONFIG = {
  // You'll need to replace this with your actual email service API endpoint
  // Options: EmailJS, SendGrid, Mailgun, etc.
  apiEndpoint: 'https://api.emailjs.com/api/v1.0/email/send',
  serviceId: 'service_6dvxkid',
  templateId: 'template_u0bmden',
  publicKey: 'T7o7fFGosrfDNbf16',
  fromEmail: 'nana@dietwithdee.com',
  fromName: 'Nana Ama from Diet with Dee'
};

// Get all email addresses from Firestore
export const getAllSubscriberEmails = async () => {
  try {
    const result = await getAllEmails();
    if (result.success && result.data) {
      return result.data.map(emailDoc => emailDoc.email);
    }
    return [];
  } catch (error) {
    console.error('Error fetching subscriber emails:', error);
    return [];
  }
};

// Send email using EmailJS (you can replace this with your preferred service)
const sendEmailViaEmailJS = async (toEmail, subject, htmlContent) => {
  try {
    const templateParams = {
      to_email: toEmail,
      from_name: EMAIL_SERVICE_CONFIG.fromName,
      from_email: EMAIL_SERVICE_CONFIG.fromEmail,
      subject: subject,
      html_content: htmlContent
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

// Alternative: Send email using a webhook/serverless function
const sendEmailViaWebhook = async (toEmail, subject, htmlContent) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

// Main function to send newsletter to all subscribers
export const sendNewArticleNewsletter = async (articleTitle, articleImageUrl, articleId) => {
  try {
    console.log('Starting newsletter send process...');
    
    // Get all subscriber emails
    const subscriberEmails = await getAllSubscriberEmails();
    
    if (subscriberEmails.length === 0) {
      console.log('No subscribers found');
      return { success: true, message: 'No subscribers to notify', sent: 0 };
    }

    console.log(`Found ${subscriberEmails.length} subscribers`);

    // Create email template
    const emailContent = createEmailTemplate(articleTitle, articleImageUrl, articleId);
    const subject = `New Article from Nana Ama Dwamena: ${articleTitle}`;

    // Send emails (in batches to avoid rate limiting)
    const batchSize = 10;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < subscriberEmails.length; i += batchSize) {
      const batch = subscriberEmails.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (email) => {
        try {
          // Choose your email service method:
          // Method 1: EmailJS (client-side)
          const success = await sendEmailViaEmailJS(email, subject, emailContent);
          
          // Method 2: Webhook/Serverless function (recommended for production)
          // const success = await sendEmailViaWebhook(email, subject, emailContent);
          
          if (success) {
            successCount++;
            console.log(`Email sent successfully to: ${email}`);
          } else {
            failureCount++;
            console.error(`Failed to send email to: ${email}`);
          }
        } catch (error) {
          failureCount++;
          console.error(`Error sending email to ${email}:`, error);
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < subscriberEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Newsletter send complete. Success: ${successCount}, Failures: ${failureCount}`);

    return {
      success: true,
      message: `Newsletter sent to ${successCount} subscribers`,
      sent: successCount,
      failed: failureCount,
      total: subscriberEmails.length
    };

  } catch (error) {
    console.error('Error sending newsletter:', error);
    return {
      success: false,
      error: error.message,
      sent: 0,
      failed: 0
    };
  }
};

// Test function to send a sample email
export const sendTestNewsletter = async () => {
  const testEmail = 'test@example.com'; // Replace with your test email
  const testTitle = 'Sample Article Title';
  const testImageUrl = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061';
  const testArticleId = 'test-article-id';

  const emailContent = createEmailTemplate(testTitle, testImageUrl, testArticleId);
  const subject = `Test: New Article from Nana Ama Dwamena: ${testTitle}`;

  try {
    const success = await sendEmailViaEmailJS(testEmail, subject, emailContent);
    return {
      success,
      message: success ? 'Test email sent successfully!' : 'Failed to send test email'
    };
  } catch (error) {
    return {
      success: false,
      message: `Error sending test email: ${error.message}`
    };
  }
};