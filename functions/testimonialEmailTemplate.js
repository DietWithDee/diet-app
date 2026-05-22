const createAdminTestimonialEmail = (data) => {
  const rating = Number(data.rating) || 5;
  const ratingStars = '★'.repeat(rating) + '☆'.repeat(Math.max(0, 5 - rating));
  
  // Clean plan layout mapping
  const planNames = {
    'back-to-basics': 'Back to Basics',
    'snatched-nourished': 'Snatched & Nourished',
    'blood-sugar-balance': 'Blood Sugar Balance',
    'pressure-no-dey-catch-me': 'Pressure No Dey Catch Me',
    'weight-gain': 'The Weight Gain',
    'custom-plan': 'Custom Plan'
  };
  const planLabel = planNames[data.plan] || data.plan || 'N/A';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Success Story Submitted</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f0fdf4; padding: 20px; margin: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
            .header { border-bottom: 2px solid #16a34a; padding-bottom: 15px; margin-bottom: 25px; }
            h1 { color: #16a34a; font-size: 22px; margin: 0; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 15px; font-weight: bold; color: #4b5563; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
            .data-row { display: flex; margin-bottom: 8px; }
            .label { width: 120px; font-weight: 600; color: #6b7280; }
            .value { flex: 1; color: #1f2937; }
            .rating { color: #eab308; font-size: 18px; font-weight: bold; }
            .story-content { background-color: #f9fafb; border-left: 4px solid #16a34a; padding: 15px; border-radius: 0 8px 8px 0; font-style: italic; color: #374151; margin-top: 10px; }
            .cta-button { display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 24px; border-radius: 9999px; margin-top: 20px; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; text-align: center; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Success Story Submitted! 📝✨</h1>
            </div>
            
            <div class="section">
                <div class="section-title">Client Details</div>
                <div class="data-row"><div class="label">Name:</div><div class="value">${data.name || 'N/A'}</div></div>
                <div class="data-row"><div class="label">Email:</div><div class="value"><a href="mailto:${data.email || ''}">${data.email || 'N/A'}</a></div></div>
                <div class="data-row"><div class="label">Location:</div><div class="value">${data.location || 'N/A'}</div></div>
                <div class="data-row"><div class="label">Profession:</div><div class="value">${data.profession || 'None'}</div></div>
            </div>

            <div class="section">
                <div class="section-title">Program & Rating</div>
                <div class="data-row"><div class="label">Nutrition Plan:</div><div class="value">${planLabel}</div></div>
                <div class="data-row"><div class="label">Rating Given:</div><div class="value rating">${ratingStars} (${rating}/5)</div></div>
            </div>

            <div class="section">
                <div class="section-title">Their Story</div>
                <div class="story-content">
                    "${data.content || 'No text provided.'}"
                </div>
            </div>

            <div style="text-align: center;">
                <a href="https://dietwithdee.org/admin" class="cta-button" style="color: #ffffff;">Go to Admin Dashboard to Review</a>
            </div>

            <div class="footer">
                <p>This is an automated notification from your Diet With Dee backend.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = { createAdminTestimonialEmail };
