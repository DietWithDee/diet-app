const createEmailTemplate = (title, coverImage, articleId) => {
  return `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>New Article from Diet with Dee</title>
        <style>
            :root {
                color-scheme: light dark;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background-color: #f0fdf4;
                padding: 20px 0;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
            }
            
            .header {
                background-color: #ffffff;
                padding: 40px 20px 30px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .header-accent {
                display: block;
                width: 100%;
                height: 4px;
                background-color: #fb923c;
            }
            
            .logo-img {
                width: 160px;
                max-width: 80%;
                margin: 0 auto 20px;
                display: block;
            }
            
            .subtitle {
                font-size: 18px;
                font-weight: 700;
                color: #16a34a;
                letter-spacing: 0.5px;
            }
            
            .content {
                padding: 50px 40px;
                background-color: #ffffff;
            }
            
            .greeting {
                font-size: 24px;
                font-weight: 700;
                color: #16a34a;
                margin-bottom: 25px;
                text-align: left;
            }
            
            .message {
                font-size: 17px;
                color: #374151;
                margin-bottom: 35px;
                line-height: 1.8;
                text-align: left;
                max-width: 480px;
                margin-left: 0;
                margin-right: auto;
            }
            
            .article-preview {
                border: none;
                border-radius: 20px;
                overflow: hidden;
                margin-bottom: 35px;
                background-color: #fff7ed;
                box-shadow: 0 10px 25px rgba(253, 186, 116, 0.2);
            }
            
            .article-image {
                width: 100%;
                height: 240px;
                object-fit: cover;
                display: block;
            }
            
            .article-content {
                padding: 30px;
                background-color: #ffffff;
            }
            
            .article-title {
                font-size: 22px;
                font-weight: 800;
                color: #1f2937;
                margin-bottom: 20px;
                line-height: 1.4;
                text-align: center;
            }
            
            .cta-button {
                display: inline-block;
                background-color: #f97316;
                color: #ffffff;
                text-decoration: none;
                font-weight: 700;
                font-size: 16px;
                padding: 18px 36px;
                border-radius: 12px;
                box-shadow: 0 8px 20px rgba(249, 115, 22, 0.35);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                width: 100%;
                text-align: center;
                margin: 0 auto;
            }
            
            .cta-button:hover {
                background-color: #ea580c;
            }
            
            .divider {
                height: 2px;
                background-color: #fdba74;
                margin: 40px auto;
                border-radius: 1px;
                max-width: 200px;
            }
            
            .footer {
                background-color: #f8fafc;
                padding: 40px 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            
            .footer-text {
                color: #64748b;
                font-size: 15px;
                margin-bottom: 18px;
                font-weight: 500;
            }
            
            .footer-text strong {
                color: #334155;
                font-weight: 700;
                font-size: 16px;
            }
            
            .unsubscribe {
                color: #94a3b8;
                font-size: 13px;
                text-decoration: none;
                padding: 8px 16px;
                border-radius: 20px;
                background-color: #f1f5f9;
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header-accent"></div>
            <div class="header">
                <img src="https://dietwithdee.org/LOGO.png" alt="DietWithDee Logo" class="logo-img" width="120" height="auto" />
                <div class="subtitle">New Article from Nana Ama Dwamena</div>
            </div>
            
            <div class="content">
                <div class="greeting">Hi there,</div>
                
                <div class="message">
                    I just published a new article on Diet With Dee, and I think you’ll find it helpful.<br><br>
                    Every week I share practical nutrition tips that make healthy living easier — not complicated.<br><br>
                    If you’re trying to improve your energy, manage your weight, or simply eat better, this one is for you.
                </div>
                
                
                <div class="article-preview" style="margin-bottom: 40px;">
                    ${coverImage ? `<img src="${coverImage}" alt="${title}" class="article-image" />` : ''}
                    <div class="article-content">
                        <h2 class="article-title">${title}</h2>
                        <a href="https://dietwithdee.org/blog/${articleId}?utm_source=newsletter&utm_medium=email&utm_campaign=${encodeURIComponent(title.substring(0, 30))}" 
                           class="cta-button">
                            READ THE ARTICLE →
                        </a>
                    </div>
                </div>
                
                <div class="message">
                    If you want more personalized guidance, I also offer:<br><br>
                    <ul style="padding-left: 20px; margin-bottom: 25px; margin-top: 0;">
                        <li style="margin-bottom: 8px;">One-on-one diet consultations</li>
                        <li style="margin-bottom: 8px;">Customized meal plans</li>
                        <li style="margin-bottom: 8px;">Specialized programs for weight loss, diabetes management, and heart health</li>
                    </ul>
                    
                    <a href="https://dietwithdee.org/services?utm_source=newsletter&utm_medium=email&utm_campaign=services_upsell" 
                       class="cta-button" style="background-color: #16a34a; box-shadow: 0 8px 20px rgba(22, 163, 74, 0.35);">
                        Explore Nutrition Plans →
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-text">
                    <strong>Diet With Dee</strong><br>
                    Accra, Ghana
                </div>
                <div class="footer-text">
                    Helping you build healthier habits for life.
                </div>
                <div class="footer-text" style="margin-top: 20px;">
                    You’re receiving this email because you subscribed to the Diet With Dee newsletter.<br><br>
                    <a href="https://dietwithdee.org/unsubscribe" class="unsubscribe">Unsubscribe</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

const createWelcomeTemplate = (name) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Diet With Dee</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  line-height: 1.6;
                  color: #1f2937;
                  background-color: #f0fdf4;
                  padding: 20px 0;
                  margin: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 24px;
                  overflow: hidden;
                  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                  border: 1px solid #e5e7eb;
              }
              .header {
                  background-color: #ffffff;
                  padding: 40px 20px;
                  text-align: center;
              }
              .header h1 {
                  color: #16a34a;
                  margin: 20px 0 0;
                  font-size: 28px;
              }
              .content {
                  padding: 40px;
              }
              .footer {
                  background-color: #f8fafc;
                  padding: 30px;
                  text-align: center;
                  font-size: 14px;
                  color: #64748b;
                  border-top: 1px solid #e2e8f0;
              }
              .button {
                  display: inline-block;
                  background-color: #f97316;
                  color: #ffffff;
                  text-decoration: none;
                  font-weight: 700;
                  padding: 16px 32px;
                  border-radius: 12px;
                  margin-top: 20px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
              }
              .logo {
                  width: 160px;
                  max-width: 80%;
                  margin: 0 auto;
                  display: block;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://dietwithdee.org/LOGO.png" alt="DietWithDee Logo" class="logo" />
                  <h1>Welcome to the Family! 🌿</h1>
              </div>
              <div class="content">
                  <p>Hi ${name || 'there'},</p>
                  <p>I'm so glad you've decided to join the <strong>Diet With Dee</strong> community! You've taken a wonderful step toward a more nourished and balanced lifestyle.</p>
                  <p>Here’s what you can expect from our newsletter:</p>
                  <ul>
                      <li>Healthy recipes that actually taste good.</li>
                      <li>Practical nutrition tips you can use every day.</li>
                      <li>Updates on new blog posts and wellness insights.</li>
                      <li>Priority access to my nutrition programs.</li>
                  </ul>
                  <p>While you wait for the first update, why not explore some of our latest articles?</p>
                  <div style="text-align: center;">
                      <a href="https://dietwithdee.org/blog?utm_source=welcome_email&utm_medium=email&utm_campaign=welcome_cta" class="button">Explore the Blog</a>
                  </div>
                  <div style="margin-top: 30px; background-color: #f0fdf4; padding: 20px; border-radius: 12px; border: 1px solid #dcfce7; text-align: center;">
                      <p style="margin-bottom: 5px; font-weight: 700; color: #16a34a;">I'd love to hear from you!</p>
                      <p style="margin: 0; font-size: 15px;">Reply to this email and let me know: <strong>What is your biggest health or nutrition goal right now?</strong><br>(I read and reply to every message!)</p>
                  </div>
                  <p style="margin-top: 30px;">To your health,<br><strong>Nana Ama Dwamena</strong><br>Founder, Diet With Dee</p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Diet With Dee. All rights reserved.</p>
                  <p>Accra, Ghana</p>
                  <p>Helping you build healthier habits for life.</p>
                  <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                    No longer want to hear from us? <a href="https://dietwithdee.org/unsubscribe" style="color: #64748b; text-decoration: underline;">Unsubscribe here</a>
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;
};

const createSurveyVoucherTemplate = ({ email, selectedPlan, discountCode }) => {
    let planTitle = "Back to Basics";
    let planSubtitle = "A 5-Day Healthy Eating Reset";
    let paystackDirectUrl = "https://paystack.com/buy/back-to-basics";
    let normalPrice = "₵349";
    let discountPrice = "₵279.20";
    let code = discountCode || "HEALTHY20";

    const planKey = (selectedPlan || "").toLowerCase();

    if (planKey === "weight-loss" || planKey === "snatched-nourished") {
        planTitle = "Snatched & Nourished";
        planSubtitle = "Gentle Weight Loss Guide with Familiar Ghanaian Meals";
        paystackDirectUrl = "https://paystack.com/buy/snatched-and-nourished";
        normalPrice = "₵249";
        discountPrice = "₵199.20";
        code = discountCode || "SNATCHED20";
    } else if (planKey === "diabetes" || planKey === "blood-sugar-balance") {
        planTitle = "Blood Sugar Balance";
        planSubtitle = "A Type 2 Diabetes & Pre-Diabetes Friendly Guide";
        paystackDirectUrl = "https://paystack.com/buy/blood-sugar-balance-plan";
        normalPrice = "₵299";
        discountPrice = "₵239.20";
        code = discountCode || "SUGAR20";
    } else if (planKey === "hypertension" || planKey === "pressure-no-dey-catch-me") {
        planTitle = "Pressure No Dey Catch Me";
        planSubtitle = "A Hypertension-Friendly Plan & Heart-Smart Habits";
        paystackDirectUrl = "https://paystack.com/buy/pressure-no-dey";
        normalPrice = "₵299";
        discountPrice = "₵239.20";
        code = discountCode || "PRESSURE20";
    } else if (planKey === "weight-gain") {
        planTitle = "The Weight Gain";
        planSubtitle = "Wahala-Free High-Calorie Meal Plan";
        paystackDirectUrl = "https://paystack.com/buy/the-weight-gain";
        normalPrice = "₵249";
        discountPrice = "₵199.20";
        code = discountCode || "WEIGHT20";
    } else {
        // default / healthy-eating
        planTitle = "Back to Basics";
        planSubtitle = "A 5-Day Healthy Eating Reset";
        paystackDirectUrl = "https://paystack.com/buy/back-to-basics";
        normalPrice = "₵349";
        discountPrice = "₵279.20";
        code = discountCode || "HEALTHY20";
    }

    const whatsappUrl = `https://wa.me/233592330870?text=${encodeURIComponent(
        `Hello Dee, I just completed your survey and got discount code ${code}! I'd like to ask about booking a 1-on-1 consultation.`
    )}`;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your 20% Discount Voucher for ${planTitle} — Diet With Dee</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  line-height: 1.6;
                  color: #1f2937;
                  background-color: #f8faf9;
                  padding: 24px 12px;
                  margin: 0;
              }
              .container {
                  max-width: 560px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 20px;
                  overflow: hidden;
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                  border: 1px solid #e5e7eb;
              }
              .header {
                  background-color: #ffffff;
                  padding: 32px 24px 16px;
                  text-align: center;
              }
              .logo {
                  width: 140px;
                  max-width: 75%;
                  margin: 0 auto;
                  display: block;
              }
              .badge {
                  display: inline-block;
                  background-color: #ecfdf5;
                  color: #065f46;
                  font-size: 11px;
                  font-weight: 800;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  padding: 6px 14px;
                  border-radius: 9999px;
                  border: 1px solid #a7f3d0;
                  margin-top: 14px;
              }
              .content {
                  padding: 20px 28px 32px;
              }
              .ticket-card {
                  background: #fbfdfc;
                  border: 1px solid #d1fae5;
                  border-radius: 16px;
                  padding: 22px;
                  margin: 22px 0;
                  text-align: center;
                  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.04);
              }
              .code-pill {
                  font-family: 'Courier New', Courier, monospace;
                  font-size: 26px;
                  font-weight: 900;
                  letter-spacing: 3px;
                  color: #064e3b;
                  background: #ffffff;
                  padding: 10px 22px;
                  border-radius: 10px;
                  display: inline-block;
                  border: 2px dashed #059669;
                  margin: 10px 0 6px;
              }
              .btn-primary {
                  display: block;
                  background-color: #059669;
                  background: linear-gradient(135deg, #059669 0%, #047857 100%);
                  color: #ffffff !important;
                  text-decoration: none;
                  font-weight: 800;
                  font-size: 15px;
                  padding: 16px 22px;
                  border-radius: 12px;
                  text-align: center;
                  margin-top: 18px;
                  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.25);
              }
              .steps-box {
                  background-color: #f9fafb;
                  border: 1px solid #e5e7eb;
                  border-radius: 12px;
                  padding: 16px 18px;
                  margin-top: 20px;
                  text-align: left;
                  font-size: 13px;
                  color: #374151;
                  line-height: 1.5;
              }
              .footer {
                  background-color: #f9fafb;
                  padding: 22px;
                  text-align: center;
                  font-size: 12px;
                  color: #6b7280;
                  border-top: 1px solid #f3f4f6;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://dietwithdee.org/LOGO.png" alt="DietWithDee Logo" class="logo" />
                  <div class="badge">🎁 20% DISCOUNT VOUCHER</div>
                  <h1 style="color: #111827; font-size: 22px; font-weight: 800; margin: 14px 0 4px;">Your 20% Discount is Ready!</h1>
              </div>

              <div class="content">
                  <p style="font-size: 14px; color: #4b5563; margin: 0 0 14px;">
                      Hi there,
                  </p>
                  <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 18px;">
                      Thank you so much for taking a moment to complete our community survey. As a token of our appreciation, here is your exclusive <strong>20% discount voucher</strong> for <strong>${planTitle}</strong>!
                  </p>

                  <!-- Unified Ticket Card -->
                  <div class="ticket-card">
                      <div style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
                          Your Selected Plan
                      </div>
                      <h2 style="font-size: 20px; font-weight: 800; color: #111827; margin: 2px 0 4px;">
                          ${planTitle}
                      </h2>
                      <p style="font-size: 12px; color: #6b7280; margin: 0 0 12px;">
                          ${planSubtitle}
                      </p>

                      <div style="margin: 10px 0 14px;">
                          <span style="text-decoration: line-through; color: #9ca3af; font-size: 14px; margin-right: 6px;">${normalPrice}</span>
                          <span style="color: #047857; font-weight: 900; font-size: 24px;">${discountPrice}</span>
                          <span style="background-color: #ecfdf5; color: #065f46; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; margin-left: 6px; border: 1px solid #a7f3d0;">
                              SAVE 20%
                          </span>
                      </div>

                      <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px;">
                          Your Coupon Code
                      </div>
                      <div class="code-pill">${code}</div>

                      <!-- Clean on-brand CTA button directly to Paystack -->
                      <a href="${paystackDirectUrl}" class="btn-primary">
                          Open Paystack & Claim 20% Off →
                      </a>
                  </div>

                  <!-- Simple 3-step Instructions -->
                  <div class="steps-box">
                      <div style="font-weight: 800; font-size: 13px; margin-bottom: 8px; color: #111827;">
                          📋 How to apply your 20% code on Paystack:
                      </div>
                      <ol style="margin: 0; padding-left: 18px; color: #4b5563; font-size: 13px;">
                          <li style="margin-bottom: 6px;">
                              Click the <strong>green button above</strong> to open your Paystack checkout page.
                          </li>
                          <li style="margin-bottom: 6px;">
                              Tap <strong style="color: #059669; text-decoration: underline;">"Have a discount code?"</strong> right below the price.
                          </li>
                          <li style="margin-bottom: 6px;">
                              Type or paste: <strong style="font-family: monospace; color: #064e3b; background: #ecfdf5; padding: 1px 6px; border-radius: 4px; border: 1px solid #a7f3d0;">${code}</strong> and tap <strong>Apply</strong>.
                          </li>
                          <li style="margin-bottom: 0;">
                              The price drops to <strong>${discountPrice}</strong>. Pay securely via Mobile Money (MTN / Telecel) or Bank Card!
                          </li>
                      </ol>
                  </div>

                  <!-- WhatsApp consultation -->
                  <div style="margin-top: 24px; text-align: center;">
                      <p style="font-size: 13px; color: #6b7280; margin: 0 0 10px;">
                          Have a question or want to chat with Dee first?
                      </p>
                      <a href="${whatsappUrl}" style="display: inline-block; background-color: #25D366; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 13px; padding: 10px 18px; border-radius: 10px;">
                          💬 Chat on WhatsApp (+233 59 233 0870)
                      </a>
                  </div>

                  <p style="margin-top: 28px; font-size: 13px; color: #6b7280;">
                      To your wellness,<br>
                      <strong>Nana Ama Dwamena</strong><br>
                      <span style="color: #9ca3af; font-size: 12px;">Founder & Dietitian, Diet With Dee</span>
                  </p>
              </div>

              <div class="footer">
                  <p style="margin: 0 0 4px;">&copy; ${new Date().getFullYear()} Diet With Dee. All rights reserved.</p>
                  <p style="margin: 0 0 6px;">Accra, Ghana • Practical nutrition for everyday healthy living.</p>
                  <p style="margin: 12px 0 0; font-size: 11px;">
                      You received this email because you submitted the DietWithDee survey.<br>
                      <a href="https://dietwithdee.org/unsubscribe" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;
};

module.exports = { createEmailTemplate, createWelcomeTemplate, createSurveyVoucherTemplate };
