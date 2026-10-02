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
          <title>Your 20% Discount Voucher for ${planTitle}</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
                  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
                  border: 1px solid #e5e7eb;
              }
              .header {
                  background-color: #ffffff;
                  padding: 35px 25px 20px;
                  text-align: center;
              }
              .logo {
                  width: 150px;
                  max-width: 80%;
                  margin: 0 auto;
                  display: block;
              }
              .badge {
                  display: inline-block;
                  background-color: #dbeafe;
                  color: #1d4ed8;
                  font-size: 12px;
                  font-weight: 800;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  padding: 6px 14px;
                  border-radius: 9999px;
                  border: 1px solid #bfdbfe;
                  margin-top: 15px;
              }
              .content {
                  padding: 25px 35px 35px;
              }
              .voucher-box {
                  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                  border: 2px dashed #2563eb;
                  border-radius: 16px;
                  padding: 24px;
                  text-align: center;
                  margin: 25px 0;
              }
              .voucher-code {
                  font-family: 'Courier New', Courier, monospace;
                  font-size: 30px;
                  font-weight: 900;
                  letter-spacing: 4px;
                  color: #1e40af;
                  background: #ffffff;
                  padding: 10px 24px;
                  border-radius: 12px;
                  display: inline-block;
                  border: 2px solid #93c5fd;
                  margin: 10px 0;
                  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
              }
              .plan-card {
                  background-color: #ffffff;
                  border: 1px solid #e2e8f0;
                  border-radius: 16px;
                  padding: 24px;
                  margin: 25px 0;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
              }
              .blue-button {
                  display: block;
                  background-color: #2563eb;
                  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                  color: #ffffff !important;
                  text-decoration: none;
                  font-weight: 800;
                  font-size: 16px;
                  padding: 18px 24px;
                  border-radius: 12px;
                  text-align: center;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin-top: 18px;
                  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
              }
              .cta-whatsapp {
                  display: block;
                  background-color: #25D366;
                  color: #ffffff !important;
                  text-decoration: none;
                  font-weight: 700;
                  font-size: 14px;
                  padding: 14px 20px;
                  border-radius: 12px;
                  text-align: center;
                  margin-top: 12px;
              }
              .footer {
                  background-color: #f8fafc;
                  padding: 25px;
                  text-align: center;
                  font-size: 13px;
                  color: #64748b;
                  border-top: 1px solid #e2e8f0;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://dietwithdee.org/LOGO.png" alt="DietWithDee Logo" class="logo" />
                  <div class="badge">🎁 20% DISCOUNT VOUCHER</div>
                  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin: 15px 0 5px;">Your 20% Discount is Ready!</h1>
              </div>

              <div class="content">
                  <p style="font-size: 15px; color: #374151; margin-bottom: 16px;">
                      Hi there,
                  </p>
                  <p style="font-size: 15px; color: #374151; line-height: 1.6;">
                      Thank you so much for taking the time to share your feedback in our community survey. Here is your exclusive <strong>20% discount code</strong> for <strong>${planTitle}</strong>!
                  </p>

                  <!-- 20% Voucher Box -->
                  <div class="voucher-box">
                      <div style="font-size: 12px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 1.5px;">
                          Your 20% Coupon Code
                      </div>
                      <div class="voucher-code">${code}</div>
                      <div style="font-size: 13px; color: #1e3a8a; font-weight: 600;">
                          Valid for 20% off your purchase of ${planTitle}
                      </div>
                  </div>

                  <!-- Selected Plan Card with Blue Button -->
                  <div class="plan-card">
                      <div style="font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                          Selected Meal Plan
                      </div>
                      <h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 4px 0 6px;">
                          ${planTitle}
                      </h2>
                      <p style="font-size: 13px; color: #64748b; margin: 0 0 14px;">
                          ${planSubtitle}
                      </p>

                      <div style="margin: 14px 0; font-size: 16px;">
                          <span style="text-decoration: line-through; color: #94a3b8; font-weight: 600; margin-right: 8px;">${normalPrice}</span>
                          <span style="color: #1e40af; font-weight: 900; font-size: 24px;">${discountPrice}</span>
                          <span style="background-color: #dbeafe; color: #1d4ed8; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; margin-left: 8px;">
                              SAVE 20%
                          </span>
                      </div>

                      <!-- Blue Button directly linked to Paystack -->
                      <a href="${paystackDirectUrl}" class="blue-button">
                          CLAIM 20% OFF ON PAYSTACK →
                      </a>
                  </div>

                  <!-- Clear Paystack Checkout Instructions -->
                  <div style="background-color: #f0f7ff; border: 1px solid #bfdbfe; border-left: 5px solid #2563eb; padding: 18px 20px; border-radius: 12px; margin-top: 25px; text-align: left; font-size: 14px; color: #1e3a8a; line-height: 1.6;">
                      <div style="font-weight: 800; font-size: 15px; margin-bottom: 10px; color: #1e40af;">
                          📋 Clear Instructions: How to apply your code on Paystack
                      </div>
                      <ol style="margin: 0; padding-left: 20px; color: #1e3a8a;">
                          <li style="margin-bottom: 8px;">
                              Click the <strong>blue button above</strong> to open your Paystack payment page.
                          </li>
                          <li style="margin-bottom: 8px;">
                              Right below the price summary, click <strong style="color: #2563eb; text-decoration: underline;">"Have a discount code?"</strong>.
                          </li>
                          <li style="margin-bottom: 8px;">
                              Type or paste your code: <strong style="font-family: monospace; font-size: 16px; color: #1e40af; background: #ffffff; padding: 2px 8px; border-radius: 6px; border: 1px solid #93c5fd;">${code}</strong> and tap Apply.
                          </li>
                          <li style="margin-bottom: 0;">
                              Your price will automatically reduce to <strong>${discountPrice}</strong>. Pay conveniently using MTN Mobile Money, Telecel Cash, or Bank Card to receive your complete plan!
                          </li>
                      </ol>
                  </div>

                  <!-- WhatsApp 1-on-1 Consultation CTA -->
                  <div style="margin-top: 30px; text-align: center;">
                      <p style="font-size: 14px; color: #475569; margin-bottom: 8px;">
                          Have questions or want a 1-on-1 private consultation with Dee?
                      </p>
                      <a href="${whatsappUrl}" class="cta-whatsapp">
                          💬 Chat with Dee on WhatsApp
                      </a>
                  </div>

                  <p style="margin-top: 32px; font-size: 14px; color: #475569;">
                      To your wellness,<br>
                      <strong>Nana Ama Dwamena</strong><br>
                      <span style="color: #64748b; font-size: 13px;">Founder & Dietitian, Diet With Dee</span>
                  </p>
              </div>

              <div class="footer">
                  <p style="margin: 0 0 6px;">&copy; ${new Date().getFullYear()} Diet With Dee. All rights reserved.</p>
                  <p style="margin: 0 0 6px;">Accra, Ghana • Helping you build healthier habits for life.</p>
                  <p style="margin: 16px 0 0; font-size: 11px; opacity: 0.8;">
                      You received this email because you submitted the DietWithDee survey.<br>
                      <a href="https://dietwithdee.org/unsubscribe" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;
};

module.exports = { createEmailTemplate, createWelcomeTemplate, createSurveyVoucherTemplate };


