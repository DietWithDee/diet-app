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

const createWelcomeTemplate = () => {
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
                  <p>Hi there,</p>
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

module.exports = { createEmailTemplate, createWelcomeTemplate };
