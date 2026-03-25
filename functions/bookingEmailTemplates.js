const createAdminBookingEmail = (bookingData) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Notification</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9f9f9; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { border-bottom: 2px solid #16a34a; padding-bottom: 15px; margin-bottom: 25px; }
            h1 { color: #16a34a; font-size: 24px; margin: 0; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #4b5563; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
            .data-row { display: flex; margin-bottom: 8px; }
            .label { width: 120px; font-weight: 600; color: #6b7280; }
            .value { flex: 1; color: #1f2937; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Consultation Booking! 🎉</h1>
            </div>
            
            <div class="section">
                <div class="section-title">Client Details</div>
                <div class="data-row"><div class="label">Name:</div><div class="value">${bookingData.name}</div></div>
                <div class="data-row"><div class="label">Email:</div><div class="value"><a href="mailto:${bookingData.email}">${bookingData.email}</a></div></div>
                <div class="data-row"><div class="label">Phone:</div><div class="value">${bookingData.phone}</div></div>
                <div class="data-row"><div class="label">Message:</div><div class="value">${bookingData.message || 'No additional message'}</div></div>
            </div>

            <div class="section">
                <div class="section-title">Booking Info</div>
                <div class="data-row"><div class="label">Type:</div><div class="value">${bookingData.consultationType === 'followup' ? 'Follow-Up (₵400)' : 'Initial Consultation (₵800)'}</div></div>
                <div class="data-row"><div class="label">Amount Paid:</div><div class="value">GHS ${bookingData.amount}</div></div>
                <div class="data-row"><div class="label">Status:</div><div class="value">Paid & pending contact</div></div>
            </div>

            <div class="section">
                <div class="section-title">Health Snapshot</div>
                <div class="data-row"><div class="label">Goal:</div><div class="value">${bookingData.userResults?.goal || 'N/A'}</div></div>
                <div class="data-row"><div class="label">BMI:</div><div class="value">${bookingData.userResults?.bmi || 'N/A'}</div></div>
                <div class="data-row"><div class="label">Diet:</div><div class="value">${bookingData.userResults?.dietaryRestrictions || 'None'}</div></div>
                <div class="data-row"><div class="label">Daily Calories:</div><div class="value">${bookingData.userResults?.dailyCalories || 'N/A'}</div></div>
            </div>
        </div>
    </body>
    </html>
  `;
};

const createClientConfirmationEmail = (name, consultationType) => {
  const isFollowUp = consultationType === 'followup';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmed</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f0fdf4; padding: 20px 0; margin: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; text-align: center; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            img.logo { width: 140px; margin: 30px auto 20px; display: block; }
            .content { padding: 20px 40px 40px; text-align: left; }
            h1 { color: #16a34a; font-size: 24px; text-align: center; margin-top: 0; }
            p { margin-bottom: 16px; font-size: 16px; color: #374151; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e5e7eb; }
            .highlight-box { background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="https://dietwithdee.org/LOGO.png" alt="Diet With Dee" class="logo" />
            <div class="content">
                <h1>Booking Confirmed! ✅</h1>
                <p>Hi ${name},</p>
                <p>Thank you for booking your ${isFollowUp ? 'follow-up' : 'initial'} consultation with <strong>Diet With Dee</strong>! Your payment has been successfully received.</p>
                
                <div class="highlight-box">
                    <p style="margin:0; font-weight:600; color:#16a34a;">What happens next?</p>
                    <p style="margin:8px 0 0 0; font-size:15px;">My team will reach out to you directly via phone or email within the next 24 hours to schedule the exact date and time for our session.</p>
                </div>

                <p>Please note that our consultation hours are: <strong>Tuesday – Sunday, 10:00 AM – 3:00 PM</strong>.</p>
                
                <p>I'm looking forward to working with you to achieve your health goals!</p>
                
                <p>Warmly,<br><strong>Nana Ama Dwamena</strong><br>Registered Dietitian</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Diet With Dee. All rights reserved.</p>
                <p>Accra, Ghana</p>
                <p>Helping you build healthier habits for life.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = { createAdminBookingEmail, createClientConfirmationEmail };
