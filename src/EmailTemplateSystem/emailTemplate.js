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
                color: #1f2937;
                background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
                padding: 20px 0;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
            }
            
            .header {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                padding: 40px 20px 30px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #fdba74, #fb923c);
                border-radius: 0 0 2px 2px;
            }
            
            .logo-img {
                width: 160px;
                max-width: 80%;
                margin: 0 auto 20px;
                display: block;
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
                transition: transform 0.3s ease;
            }
            
            .logo-img:hover {
                transform: scale(1.05);
            }
            
            .subtitle {
                font-size: 18px;
                font-weight: 700;
                color: #16a34a;
                letter-spacing: 0.5px;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
            
            .content {
                padding: 50px 40px;
                background: linear-gradient(180deg, #ffffff 0%, #fefefe 100%);
            }
            
            .greeting {
                font-size: 24px;
                font-weight: 700;
                background: linear-gradient(135deg, #16a34a, #15803d);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
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
                margin-bottom: 35px;
            }
            
            .article-preview {
                border: none;
                border-radius: 20px;
                overflow: hidden;
                margin-bottom: 35px;
                background: linear-gradient(145deg, #fff7ed, #fffaf5);
                box-shadow: 0 15px 30px rgba(253, 186, 116, 0.25);
                transform: translateY(0);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
            }
            
            .article-image {
                width: 100%;
                height: 240px;
                object-fit: cover;
                display: block;
                transition: transform 0.4s ease;
            }
            
            .article-content {
                padding: 30px;
                background: linear-gradient(145deg, #ffffff, #fafafa);
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
                background: linear-gradient(135deg, #fdba74 0%, #fb923c 50%, #f97316 100%);
                color: white;
                text-decoration: none;
                font-weight: 700;
                font-size: 16px;
                padding: 18px 36px;
                border-radius: 12px;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 8px 25px rgba(253, 186, 116, 0.5);
                position: relative;
                overflow: hidden;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                width: 100%;
                text-align: center;
                margin: 0 auto;
            }
            
            .cta-button:hover {
                background: linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%);
                box-shadow: 0 15px 40px rgba(251, 146, 60, 0.55);
                transform: translateY(-3px);
            }
            
            .divider {
                height: 2px;
                background: linear-gradient(90deg, transparent, #fdba74, transparent);
                margin: 40px 0;
                border-radius: 1px;
            }
            
            .footer {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                padding: 40px 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
                position: relative;
            }
            
            .footer::before {
                content: '';
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 100px;
                height: 3px;
                background: linear-gradient(90deg, #fdba74, #fb923c);
                border-radius: 0 0 10px 10px;
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
                background: rgba(148, 163, 184, 0.1);
                transition: all 0.3s ease;
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
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
                            Vist Website →
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
