// emailTemplate.js
export const createEmailTemplate = (title, imageUrl, articleId) => {
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
                text-align: center;
            }
            
            .message {
                font-size: 17px;
                color: #374151;
                margin-bottom: 35px;
                line-height: 1.8;
                text-align: center;
                max-width: 480px;
                margin-left: auto;
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

            /* ========== DARK MODE ========== */
            @media (prefers-color-scheme: dark) {
                body {
                    background-color: #1a1a2e !important;
                    color: #e0e0e0 !important;
                }

                .email-container {
                    background-color: #2d2d44 !important;
                    border-color: #3a3a52 !important;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;
                }

                .header {
                    background-color: #2d2d44 !important;
                }

                .subtitle {
                    color: #4ade80 !important;
                }

                .content {
                    background-color: #2d2d44 !important;
                }

                .greeting {
                    color: #4ade80 !important;
                }

                .message {
                    color: #c9c9d4 !important;
                }

                .article-preview {
                    background-color: #3a3a52 !important;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
                }

                .article-content {
                    background-color: #33334a !important;
                }

                .article-title {
                    color: #f0f0f0 !important;
                }

                .cta-button {
                    background-color: #f97316 !important;
                    color: #ffffff !important;
                    box-shadow: 0 8px 20px rgba(249, 115, 22, 0.25) !important;
                }

                .divider {
                    background-color: #f9731680 !important;
                }

                .footer {
                    background-color: #252540 !important;
                    border-top-color: #3a3a52 !important;
                }

                .footer-text {
                    color: #a0a0b4 !important;
                }

                .footer-text strong {
                    color: #d0d0e0 !important;
                }

                .unsubscribe {
                    color: #9090a8 !important;
                    background-color: #3a3a52 !important;
                }
            }

            /* Outlook App (Android/iOS) dark mode */
            [data-ogsc] body {
                background-color: #1a1a2e !important;
                color: #e0e0e0 !important;
            }

            [data-ogsc] .email-container {
                background-color: #2d2d44 !important;
                border-color: #3a3a52 !important;
            }

            [data-ogsc] .header {
                background-color: #2d2d44 !important;
            }

            [data-ogsc] .subtitle {
                color: #4ade80 !important;
            }

            [data-ogsc] .content {
                background-color: #2d2d44 !important;
            }

            [data-ogsc] .greeting {
                color: #4ade80 !important;
            }

            [data-ogsc] .message {
                color: #c9c9d4 !important;
            }

            [data-ogsc] .article-preview {
                background-color: #3a3a52 !important;
            }

            [data-ogsc] .article-content {
                background-color: #33334a !important;
            }

            [data-ogsc] .article-title {
                color: #f0f0f0 !important;
            }

            [data-ogsc] .cta-button {
                background-color: #f97316 !important;
                color: #ffffff !important;
            }

            [data-ogsc] .footer {
                background-color: #252540 !important;
                border-top-color: #3a3a52 !important;
            }

            [data-ogsc] .footer-text {
                color: #a0a0b4 !important;
            }

            [data-ogsc] .footer-text strong {
                color: #d0d0e0 !important;
            }

            [data-ogsc] .unsubscribe {
                color: #9090a8 !important;
                background-color: #3a3a52 !important;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Orange accent bar -->
            <div class="header-accent"></div>

            <!-- Header -->
            <div class="header">
                <img src="https://dietwithdee.org/LOGO.png" alt="DietWithDee Logo" class="logo-img" />
                <div class="subtitle">Nana Ama Dwamena</div>
            </div>
            
            <!-- Main Content -->
            <div class="content">
                <div class="greeting">Hello, Health Enthusiast! </div>
                
                <div class="message">
                    I'm excited to share my latest article with you, packed with tips and insights for a healthier life.
                </div>
                
                <div class="divider"></div>
                
                <!-- Article Preview -->
                <div class="article-preview">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="article-image" />` : ''}
                    <div class="article-content">
                        <h2 class="article-title">${title}</h2>
                        <a href="https://dietwithdee.org/blog/${articleId}" 
                           class="cta-button">
                            Visit Website →
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
