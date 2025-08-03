// emailTemplate.js
export const createEmailTemplate = (title, imageUrl, articleId) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Article from Diet with Dee</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fdf8;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #10b981, #059669);
                padding: 30px 20px;
                text-align: center;
                color: white;
            }
            
            .logo {
                font-size: 28px;
                font-weight: 900;
                margin-bottom: 8px;
                letter-spacing: -0.5px;
            }
            
            .subtitle {
                font-size: 16px;
                opacity: 0.9;
                font-weight: 500;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .greeting {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 20px;
            }
            
            .message {
                font-size: 16px;
                color: #4b5563;
                margin-bottom: 30px;
                line-height: 1.7;
            }
            
            .article-preview {
                border: 2px solid #e5f3f0;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 30px;
                background-color: #f8fdf8;
            }
            
            .article-image {
                width: 100%;
                height: 200px;
                object-fit: cover;
                display: block;
            }
            
            .article-content {
                padding: 20px;
            }
            
            .article-title {
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 12px;
                line-height: 1.4;
            }
            
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #f97316, #ea580c);
                color: white;
                text-decoration: none;
                font-weight: 600;
                font-size: 16px;
                padding: 14px 28px;
                border-radius: 8px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
            }
            
            .cta-button:hover {
                background: linear-gradient(135deg, #ea580c, #dc2626);
                box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
                transform: translateY(-1px);
            }
            
            .footer {
                background-color: #f9fafb;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            
            .footer-text {
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 15px;
            }
            
            .unsubscribe {
                color: #9ca3af;
                font-size: 12px;
                text-decoration: none;
            }
            
            .divider {
                height: 1px;
                background: linear-gradient(90deg, transparent, #10b981, transparent);
                margin: 30px 0;
            }
            
            @media (max-width: 600px) {
                .content {
                    padding: 30px 20px;
                }
                
                .article-content {
                    padding: 15px;
                }
                
                .article-title {
                    font-size: 18px;
                }
                
                .cta-button {
                    display: block;
                    text-align: center;
                    width: 100%;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <div class="logo">DietWithDee</div>
                <div class="subtitle">Nana Ama Dwamena</div>
            </div>
            
            <!-- Main Content -->
            <div class="content">
                <div class="greeting">Hello, Health Enthusiast! 👋</div>
                
                <div class="message">
                    I'm excited to share my latest article with you! As part of our Diet with Dee community, 
                    you'll be the first to know about new insights, tips, and strategies for living your healthiest life.
                </div>
                
                <div class="divider"></div>
                
                <!-- Article Preview -->
                <div class="article-preview">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="article-image" />` : ''}
                    <div class="article-content">
                        <h2 class="article-title">${title}</h2>
                        <a href="https://dietwithdee.com/article/${articleId}" 
                           class="cta-button">
                            Continue Reading on Website →
                        </a>
                    </div>
                </div>
                
                <div class="message">
                    Don't miss out on this valuable content! Click the button above to read the full article 
                    and discover actionable tips you can implement today.
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-text">
                    <strong>Diet with Dee</strong><br>
                    Empowering you to live your healthiest life
                </div>
                <div class="footer-text">
                    You're receiving this because you subscribed to our newsletter.
                </div>
                <a href="#" class="unsubscribe">Unsubscribe</a>
            </div>
        </div>
    </body>
    </html>
  `;
};