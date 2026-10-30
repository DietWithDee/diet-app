const createEmailTemplate = (title, coverImage, articleId) => {
  return `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>New Article from DietWithDee</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                color-scheme: light;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
                line-height: 1.7;
                color: #1c1917;
                background-color: #FAF9F6;
                padding: 24px 10px;
                -webkit-font-smoothing: antialiased;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                border: 1px solid #e7e5e4;
            }
            
            .header-accent {
                display: block;
                width: 100%;
                height: 5px;
                background: linear-gradient(90deg, #F6841F 0%, #166534 100%);
            }

            .header {
                background-color: #ffffff;
                padding: 36px 20px 24px;
                text-align: center;
                border-bottom: 1px solid #f5f5f4;
            }
            
            .logo-img {
                width: 120px;
                max-width: 100%;
                margin: 0 auto 10px;
                display: block;
            }

            .brand-name {
                font-family: 'Cormorant Garamond', Georgia, serif;
                font-size: 26px;
                font-weight: 700;
                color: #166534;
                letter-spacing: 0.5px;
                text-decoration: none;
                display: block;
            }
            
            .subtitle {
                font-family: 'Montserrat', Arial, sans-serif;
                font-size: 11px;
                font-weight: 600;
                color: #78716c;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                margin-top: 6px;
            }
            
            .content {
                padding: 40px 36px;
                background-color: #ffffff;
            }
            
            .greeting {
                font-family: 'Cormorant Garamond', Georgia, serif;
                font-size: 26px;
                font-weight: 700;
                color: #166534;
                margin-bottom: 20px;
                text-align: left;
                letter-spacing: -0.01em;
            }
            
            .message {
                font-family: 'Montserrat', Arial, sans-serif;
                font-size: 15px;
                color: #44403c;
                margin-bottom: 30px;
                line-height: 1.75;
                text-align: left;
            }
            
            .article-preview {
                border: 1px solid #fed7aa;
                border-radius: 20px;
                overflow: hidden;
                margin-bottom: 35px;
                background-color: #fff7ed;
                box-shadow: 0 8px 24px rgba(246, 132, 31, 0.12);
                text-align: center;
            }
            
            .article-image {
                width: 100%;
                height: 240px;
                object-fit: cover;
                display: block;
            }
            
            .article-content {
                padding: 28px 24px;
                background-color: #ffffff;
            }
            
            .article-title {
                font-family: 'Cormorant Garamond', Georgia, serif;
                font-size: 24px;
                font-weight: 700;
                color: #1c1917;
                margin-bottom: 22px;
                line-height: 1.35;
                text-align: center;
                letter-spacing: -0.01em;
            }
            
            .cta-button {
                display: inline-block;
                background-color: #F6841F;
                color: #ffffff !important;
                text-decoration: none;
                font-family: 'Montserrat', Arial, sans-serif;
                font-weight: 700;
                font-size: 13px;
                padding: 15px 36px;
                border-radius: 50px;
                box-shadow: 0 4px 14px rgba(246, 132, 31, 0.35);
                text-transform: uppercase;
                letter-spacing: 1px;
                text-align: center;
                border: 1px solid #F6841F;
            }
            
            .cta-button-secondary {
                display: inline-block;
                background-color: #166534;
                color: #ffffff !important;
                text-decoration: none;
                font-family: 'Montserrat', Arial, sans-serif;
                font-weight: 700;
                font-size: 13px;
                padding: 15px 36px;
                border-radius: 50px;
                box-shadow: 0 4px 14px rgba(22, 101, 52, 0.28);
                text-transform: uppercase;
                letter-spacing: 1px;
                text-align: center;
                border: 1px solid #166534;
            }
            
            .divider {
                height: 1px;
                background-color: #e7e5e4;
                margin: 32px 0;
            }

            .tip-box {
                background-color: #f0fdf4;
                border-left: 4px solid #166534;
                border-radius: 12px;
                padding: 18px 22px;
                margin: 24px 0;
            }

            .tip-text {
                font-family: 'Montserrat', Arial, sans-serif;
                color: #166534;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.6;
            }
            
            .footer {
                background-color: #fafaf9;
                padding: 36px 30px;
                text-align: center;
                border-top: 1px solid #f5f5f4;
            }
            
            .footer-title {
                font-family: 'Cormorant Garamond', Georgia, serif;
                font-size: 18px;
                font-weight: 700;
                color: #1c1917;
                margin-bottom: 6px;
            }

            .footer-text {
                font-family: 'Montserrat', Arial, sans-serif;
                color: #78716c;
                font-size: 13px;
                line-height: 1.6;
                margin-bottom: 16px;
            }
            
            .footer-links {
                font-family: 'Montserrat', Arial, sans-serif;
                font-size: 12px;
                margin: 16px 0;
            }

            .footer-links a {
                color: #166534;
                font-weight: 600;
                text-decoration: none;
                margin: 0 8px;
            }
            
            .unsubscribe {
                color: #78716c;
                font-size: 11px;
                text-decoration: underline;
                display: inline-block;
                margin-top: 8px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header-accent"></div>
            <div class="header">
                <a href="https://dietwithdee.org" style="text-decoration: none;">
                    <img src="https://dietwithdee.org/LOGO.png" alt="DietWithDee Logo" class="logo-img" width="120" height="auto" />
                    <span class="brand-name">DietWithDee</span>
                </a>
                <div class="subtitle">Clinical Nutrition & Wellness • Nana Ama Dwamena, RD</div>
            </div>
            
            <div class="content">
                <div class="greeting">Hi there,</div>
                
                <div class="message">
                    I just published a new article on DietWithDee, and I think you’ll find it deeply practical.<br><br>
                    Every week, I share realistic nutrition strategies tailored to familiar Ghanaian staples—making sustainable health simple, accessible, and enjoyable without deprivation.
                </div>
                
                <div class="article-preview">
                    ${coverImage ? `<img src="${coverImage}" alt="${title}" class="article-image" />` : ''}
                    <div class="article-content">
                        <h2 class="article-title">${title}</h2>
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                          <tr>
                            <td align="center" style="border-radius: 50px; background-color: #F6841F;">
                              <a href="https://dietwithdee.org/blog/${articleId}?utm_source=newsletter&utm_medium=email&utm_campaign=${encodeURIComponent(title.substring(0, 30))}" 
                                 class="cta-button">
                                  Read The Article &rarr;
                              </a>
                            </td>
                          </tr>
                        </table>
                    </div>
                </div>
                
                <div class="message">
                    If you’re looking for structured, personal guidance, we also offer:
                    <ul style="padding-left: 20px; margin: 18px 0; line-height: 1.8;">
                        <li style="margin-bottom: 6px;">1-on-1 Clinical Dietitian Consultations</li>
                        <li style="margin-bottom: 6px;">Customized Ghanaian Meal Plans</li>
                        <li style="margin-bottom: 6px;">Specialized Programs for Blood Sugar & Diabetes, Weight Loss, and Heart Health</li>
                    </ul>
                    
                    <div style="text-align: center; margin-top: 26px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                        <tr>
                          <td align="center" style="border-radius: 50px; background-color: #166534;">
                            <a href="https://dietwithdee.org/services?utm_source=newsletter&utm_medium=email&utm_campaign=services_upsell" 
                               class="cta-button-secondary">
                                Explore Nutrition Plans &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-title">DietWithDee</div>
                <div class="footer-text">
                    Helping you build healthier habits for life with authentic local meals. &bull; Accra, Ghana
                </div>
                <div class="footer-links">
                    <a href="https://dietwithdee.org/plans">Meal Plans</a> &bull;
                    <a href="https://dietwithdee.org/services">Consultations</a> &bull;
                    <a href="https://dietwithdee.org/ontrack" style="color: #F6841F;">OnTrack App</a> &bull;
                    <a href="https://dietwithdee.org/blog">Blog</a>
                </div>
                <div class="footer-text" style="font-size: 11px; margin-top: 14px;">
                    You’re receiving this email because you subscribed to the DietWithDee newsletter.<br>
                    <a href="https://dietwithdee.org/unsubscribe" class="unsubscribe">Unsubscribe from this newsletter</a>
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
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
          <title>Welcome to the DietWithDee Community</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
              body {
                  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
                  line-height: 1.7;
                  color: #1c1917;
                  background-color: #FAF9F6;
                  padding: 24px 10px;
                  margin: 0;
                  -webkit-font-smoothing: antialiased;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 24px;
                  overflow: hidden;
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                  border: 1px solid #e7e5e4;
              }
              .header-accent {
                  height: 5px;
                  background: linear-gradient(90deg, #F6841F 0%, #166534 100%);
              }
              .header {
                  background-color: #ffffff;
                  padding: 36px 20px 24px;
                  text-align: center;
                  border-bottom: 1px solid #f5f5f4;
              }
              .header h1 {
                  font-family: 'Cormorant Garamond', Georgia, serif;
                  color: #166534;
                  margin: 16px 0 0;
                  font-size: 30px;
                  font-weight: 700;
                  letter-spacing: -0.01em;
              }
              .brand-name {
                  font-family: 'Cormorant Garamond', Georgia, serif;
                  font-size: 24px;
                  font-weight: 700;
                  color: #166534;
                  letter-spacing: 0.5px;
                  display: block;
              }
              .content {
                  padding: 40px 36px;
              }
              .content p {
                  font-size: 15px;
                  color: #44403c;
                  line-height: 1.75;
                  margin-bottom: 18px;
              }
              .content ul {
                  margin: 18px 0;
                  padding-left: 22px;
                  color: #44403c;
                  font-size: 14px;
                  line-height: 1.8;
              }
              .button {
                  display: inline-block;
                  background-color: #F6841F;
                  color: #ffffff !important;
                  text-decoration: none;
                  font-family: 'Montserrat', Arial, sans-serif;
                  font-weight: 700;
                  font-size: 13px;
                  padding: 15px 36px;
                  border-radius: 50px;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  box-shadow: 0 4px 14px rgba(246, 132, 31, 0.35);
                  border: 1px solid #F6841F;
              }
              .reply-card {
                  margin: 32px 0 24px;
                  background-color: #f0fdf4;
                  padding: 22px 24px;
                  border-radius: 16px;
                  border: 1px solid #bbf7d0;
                  border-left: 4px solid #166534;
                  text-align: left;
              }
              .reply-card h4 {
                  margin: 0 0 6px;
                  font-family: 'Montserrat', Arial, sans-serif;
                  font-weight: 700;
                  font-size: 15px;
                  color: #166534;
              }
              .reply-card p {
                  margin: 0;
                  font-size: 14px;
                  color: #166534;
                  line-height: 1.6;
              }
              .footer {
                  background-color: #fafaf9;
                  padding: 30px;
                  text-align: center;
                  font-size: 12px;
                  color: #78716c;
                  border-top: 1px solid #f5f5f4;
              }
              .logo {
                  width: 120px;
                  max-width: 80%;
                  margin: 0 auto;
                  display: block;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header-accent"></div>
              <div class="header">
                  <img src="https://dietwithdee.org/LOGO.png" alt="DietWithDee Logo" class="logo" />
                  <h1>Welcome to the Family! 🌿</h1>
              </div>
              <div class="content">
                  <p>Hi ${name || 'there'},</p>
                  <p>I’m so glad you’ve decided to join the <strong>DietWithDee</strong> community! You’ve taken a wonderful step toward a more nourished, energized, and balanced lifestyle.</p>
                  <p>Here’s what you can expect in your inbox:</p>
                  <ul>
                      <li>Healthy Ghanaian recipes that actually taste mouthwatering.</li>
                      <li>Practical, sustainable nutrition tips you can use every single day.</li>
                      <li>New blog articles, wellness guides, and local meal pairing insights.</li>
                      <li>Priority access to consultations and specialized meal plans.</li>
                  </ul>
                  <p>While you wait for our next weekly edition, explore our latest wellness articles and meal blueprints:</p>
                  <div style="text-align: center; margin: 28px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                        <tr>
                          <td align="center" style="border-radius: 50px; background-color: #F6841F;">
                            <a href="https://dietwithdee.org/blog?utm_source=welcome_email&utm_medium=email&utm_campaign=welcome_cta" class="button">
                                Explore The Blog &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>
                  </div>
                  <div class="reply-card">
                      <h4>I’d love to hear from you!</h4>
                      <p>Reply directly to this email and tell me: <strong>What is your #1 health or nutrition goal right now?</strong><br>I read and reply to every message personally.</p>
                  </div>
                  <p style="margin-top: 28px; font-size: 14px; color: #44403c;">
                      To your wellness,<br>
                      <strong style="color: #1c1917; font-size: 15px;">Nana Ama Dwamena, RD</strong><br>
                      <span style="color: #78716c; font-size: 13px;">Founder & Clinical Dietitian, DietWithDee</span>
                  </p>
              </div>
              <div class="footer">
                  <p style="margin: 0 0 6px;">&copy; ${new Date().getFullYear()} DietWithDee. All rights reserved. &bull; Accra, Ghana</p>
                  <p style="margin: 0 0 14px;">Helping you build healthier habits for life.</p>
                  <p style="margin: 0; font-size: 11px;">
                    No longer want to hear from us? <a href="https://dietwithdee.org/unsubscribe" style="color: #78716c; text-decoration: underline;">Unsubscribe here</a>
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
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
          <title>Your 20% Discount Voucher for ${planTitle} — DietWithDee</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
              body {
                  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
                  line-height: 1.7;
                  color: #1c1917;
                  background-color: #FAF9F6;
                  padding: 24px 10px;
                  margin: 0;
                  -webkit-font-smoothing: antialiased;
              }
              .container {
                  max-width: 580px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 24px;
                  overflow: hidden;
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                  border: 1px solid #e7e5e4;
              }
              .header-accent {
                  height: 5px;
                  background: linear-gradient(90deg, #F6841F 0%, #166534 100%);
              }
              .header {
                  background-color: #ffffff;
                  padding: 32px 24px 18px;
                  text-align: center;
                  border-bottom: 1px solid #f5f5f4;
              }
              .logo {
                  width: 120px;
                  max-width: 75%;
                  margin: 0 auto;
                  display: block;
              }
              .badge {
                  display: inline-block;
                  background-color: #f0fdf4;
                  color: #166534;
                  font-family: 'Montserrat', Arial, sans-serif;
                  font-size: 11px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  padding: 6px 16px;
                  border-radius: 50px;
                  border: 1px solid #bbf7d0;
                  margin-top: 14px;
              }
              .content {
                  padding: 32px 30px;
              }
              .ticket-card {
                  background: #fbfdfc;
                  border: 1px solid #bbf7d0;
                  border-radius: 20px;
                  padding: 26px 20px;
                  margin: 24px 0;
                  text-align: center;
                  box-shadow: 0 4px 16px rgba(22, 101, 52, 0.06);
              }
              .code-pill {
                  font-family: 'Courier New', Courier, monospace;
                  font-size: 26px;
                  font-weight: 900;
                  letter-spacing: 3px;
                  color: #166534;
                  background: #ffffff;
                  padding: 10px 24px;
                  border-radius: 12px;
                  display: inline-block;
                  border: 2px dashed #166534;
                  margin: 12px 0 8px;
              }
              .btn-primary {
                  display: inline-block;
                  background-color: #F6841F;
                  color: #ffffff !important;
                  text-decoration: none;
                  font-family: 'Montserrat', Arial, sans-serif;
                  font-weight: 700;
                  font-size: 14px;
                  padding: 16px 36px;
                  border-radius: 50px;
                  text-align: center;
                  margin-top: 18px;
                  box-shadow: 0 4px 14px rgba(246, 132, 31, 0.35);
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  border: 1px solid #F6841F;
              }
              .steps-box {
                  background-color: #fafaf9;
                  border: 1px solid #e7e5e4;
                  border-radius: 16px;
                  padding: 18px 20px;
                  margin-top: 24px;
                  text-align: left;
                  font-size: 13px;
                  color: #44403c;
                  line-height: 1.6;
              }
              .footer {
                  background-color: #fafaf9;
                  padding: 24px;
                  text-align: center;
                  font-size: 12px;
                  color: #78716c;
                  border-top: 1px solid #f5f5f4;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header-accent"></div>
              <div class="header">
                  <img src="https://dietwithdee.org/LOGO.png" alt="DietWithDee Logo" class="logo" />
                  <div class="badge">🎁 20% DISCOUNT VOUCHER</div>
                  <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; color: #1c1917; font-size: 26px; font-weight: 700; margin: 16px 0 4px;">Your 20% Discount is Ready!</h1>
              </div>

              <div class="content">
                  <p style="font-size: 15px; color: #44403c; margin: 0 0 14px;">
                      Hi there,
                  </p>
                  <p style="font-size: 15px; color: #44403c; line-height: 1.7; margin: 0 0 20px;">
                      Thank you so much for taking a moment to complete our community survey. As our appreciation, here is your exclusive <strong>20% discount voucher</strong> for the <strong>${planTitle}</strong>!
                  </p>

                  <!-- Unified Ticket Card -->
                  <div class="ticket-card">
                      <div style="font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                          Your Selected Plan
                      </div>
                      <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 700; color: #1c1917; margin: 2px 0 4px;">
                          ${planTitle}
                      </h2>
                      <p style="font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #78716c; margin: 0 0 14px;">
                          ${planSubtitle}
                      </p>

                      <div style="margin: 12px 0 16px;">
                          <span style="text-decoration: line-through; color: #a8a29e; font-size: 15px; margin-right: 8px;">${normalPrice}</span>
                          <span style="color: #166534; font-weight: 800; font-size: 26px;">${discountPrice}</span>
                          <span style="background-color: #f0fdf4; color: #166534; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 50px; margin-left: 8px; border: 1px solid #bbf7d0;">
                              SAVE 20%
                          </span>
                      </div>

                      <div style="font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; font-weight: 700; color: #78716c; text-transform: uppercase; letter-spacing: 1px; margin-top: 10px;">
                          Your Coupon Code
                      </div>
                      <div class="code-pill">${code}</div>

                      <!-- Clean on-brand CTA pill button -->
                      <div style="text-align: center;">
                        <a href="${paystackDirectUrl}" class="btn-primary">
                            Claim 20% Off on Paystack &rarr;
                        </a>
                      </div>
                  </div>

                  <!-- Simple 3-step Instructions -->
                  <div class="steps-box">
                      <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #1c1917;">
                          📋 How to apply your 20% code on Paystack:
                      </div>
                      <ol style="margin: 0; padding-left: 18px; color: #44403c; font-size: 13px; line-height: 1.7;">
                          <li style="margin-bottom: 6px;">
                              Click the <strong>orange button above</strong> to open your Paystack checkout.
                          </li>
                          <li style="margin-bottom: 6px;">
                              Tap <strong style="color: #F6841F; text-decoration: underline;">"Have a discount code?"</strong> right below the price.
                          </li>
                          <li style="margin-bottom: 6px;">
                              Type or paste: <strong style="font-family: monospace; color: #166534; background: #f0fdf4; padding: 2px 8px; border-radius: 6px; border: 1px solid #bbf7d0;">${code}</strong> and tap <strong>Apply</strong>.
                          </li>
                          <li style="margin-bottom: 0;">
                              The price drops to <strong>${discountPrice}</strong>. Pay securely via Mobile Money (MTN / Telecel) or Bank Card!
                          </li>
                      </ol>
                  </div>

                  <!-- WhatsApp consultation -->
                  <div style="margin-top: 26px; text-align: center;">
                      <p style="font-size: 13px; color: #78716c; margin: 0 0 10px;">
                          Have a question or want to chat with Dee first?
                      </p>
                      <a href="${whatsappUrl}" style="display: inline-block; background-color: #25D366; color: #ffffff !important; text-decoration: none; font-family: 'Montserrat', Arial, sans-serif; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 50px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);">
                          💬 Chat on WhatsApp (+233 59 233 0870)
                      </a>
                  </div>

                  <p style="margin-top: 30px; font-size: 14px; color: #78716c;">
                      To your wellness,<br>
                      <strong style="color: #1c1917;">Nana Ama Dwamena, RD</strong><br>
                      <span style="color: #a8a29e; font-size: 12px;">Founder & Clinical Dietitian, DietWithDee</span>
                  </p>
              </div>

              <div class="footer">
                  <p style="margin: 0 0 4px;">&copy; ${new Date().getFullYear()} DietWithDee. All rights reserved. &bull; Accra, Ghana</p>
                  <p style="margin: 0 0 8px;">Practical nutrition for everyday healthy living.</p>
                  <p style="margin: 0; font-size: 11px;">
                      You received this email because you submitted the DietWithDee survey.<br>
                      <a href="https://dietwithdee.org/unsubscribe" style="color: #78716c; text-decoration: underline;">Unsubscribe</a>
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;
};

module.exports = { createEmailTemplate, createWelcomeTemplate, createSurveyVoucherTemplate };
