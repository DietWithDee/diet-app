import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load RESEND_API_KEY from .env or functions/.env if not already set
function loadEnvFile(envPath) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^['"](.*)['"]$/, "$1");
      }
    }
  }
}

loadEnvFile(path.join(__dirname, "../.env"));
loadEnvFile(path.join(__dirname, "../functions/.env"));

// Load template generators from functions
const { 
  createEmailTemplate, 
  createWelcomeTemplate, 
  createSurveyVoucherTemplate 
} = require("../functions/emailTemplate.js");

const { 
  createAdminBookingEmail, 
  createClientConfirmationEmail 
} = require("../functions/bookingEmailTemplates.js");

const { 
  createAdminTestimonialEmail 
} = require("../functions/testimonialEmailTemplate.js");

// Sample mock data for each flow
const mockData = {
  survey: {
    weightLoss: {
      email: "test.respondent@example.com",
      selectedPlan: "weight-loss",
      discountCode: "SNATCHED20"
    },
    diabetes: {
      email: "test.respondent@example.com",
      selectedPlan: "diabetes",
      discountCode: "SUGAR20"
    },
    hypertension: {
      email: "test.respondent@example.com",
      selectedPlan: "hypertension",
      discountCode: "PRESSURE20"
    },
    weightGain: {
      email: "test.respondent@example.com",
      selectedPlan: "weight-gain",
      discountCode: "WEIGHT20"
    },
    healthyEating: {
      email: "test.respondent@example.com",
      selectedPlan: "healthy-habits",
      discountCode: "HEALTHY20"
    }
  },
  welcome: {
    name: "Akosua Mensah"
  },
  newsletter: {
    title: "5 Simple Ghanaian Swaps for Lower Blood Pressure",
    coverImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
    articleId: "sample-article-slug"
  },
  bookingClient: {
    name: "Kofi Owusu",
    consultationType: "initial",
    bookingData: {
      amount: 600,
      email: "kofi@example.com",
      phone: "+233 24 123 4567"
    }
  },
  bookingAdmin: {
    name: "Kofi Owusu",
    email: "kofi@example.com",
    phone: "+233 24 123 4567",
    consultationType: "initial",
    amount: 600,
    paystackReference: "T_TEST_123456",
    userResults: {
      bmi: "27.4",
      primaryGoal: "Lose weight & get toned",
      activityLevel: "Moderately active"
    }
  },
  testimonialAdmin: {
    name: "Ama Serwaa",
    email: "ama@example.com",
    phone: "+233 50 987 6543",
    plan: "Snatched & Nourished (Weight Loss)",
    story: "Lost 6kg in 6 weeks without starving or giving up plantain! Dee is amazing.",
    rating: 5,
    location: "Kumasi, Ghana"
  }
};

const flows = [
  {
    id: "survey-voucher-weight-loss",
    name: "Survey 20% Voucher (Weight Loss Plan)",
    from: "Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>",
    subject: "Your 20% Discount Voucher for Snatched & Nourished — Diet With Dee",
    generateHtml: () => createSurveyVoucherTemplate(mockData.survey.weightLoss)
  },
  {
    id: "survey-voucher-diabetes",
    name: "Survey 20% Voucher (Blood Sugar / Diabetes Plan)",
    from: "Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>",
    subject: "Your 20% Discount Voucher for Blood Sugar Balance — Diet With Dee",
    generateHtml: () => createSurveyVoucherTemplate(mockData.survey.diabetes)
  },
  {
    id: "survey-voucher-hypertension",
    name: "Survey 20% Voucher (Hypertension Plan)",
    from: "Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>",
    subject: "Your 20% Discount Voucher for Pressure No Dey Catch Me — Diet With Dee",
    generateHtml: () => createSurveyVoucherTemplate(mockData.survey.hypertension)
  },
  {
    id: "survey-voucher-weight-gain",
    name: "Survey 20% Voucher (The Weight Gain Plan)",
    from: "Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>",
    subject: "Your 20% Discount Voucher for The Weight Gain Plan — Diet With Dee",
    generateHtml: () => createSurveyVoucherTemplate(mockData.survey.weightGain)
  },
  {
    id: "survey-voucher-default",
    name: "Survey 20% Voucher (Healthy Habits / Back to Basics)",
    from: "Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>",
    subject: "Your 20% Discount Voucher for Back to Basics — Diet With Dee",
    generateHtml: () => createSurveyVoucherTemplate(mockData.survey.healthyEating)
  },
  {
    id: "welcome-email",
    name: "New Subscriber Welcome Email",
    from: "Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>",
    subject: "Welcome to Diet With Dee! 🌿",
    generateHtml: () => createWelcomeTemplate(mockData.welcome.name)
  },
  {
    id: "newsletter-published",
    name: "Article Published Newsletter",
    from: "Diet With Dee <newsletter@mail.dietwithdee.org>",
    subject: `New from Diet With Dee: ${mockData.newsletter.title}`,
    generateHtml: () => createEmailTemplate(mockData.newsletter.title, mockData.newsletter.coverImage, mockData.newsletter.articleId).replace("Hi there,", "Hi Akosua,")
  },
  {
    id: "booking-client-confirmation",
    name: "Booking Client Confirmation Email",
    from: "Diet With Dee <hello@mail.dietwithdee.org>",
    subject: "Booking Confirmed! ✅",
    generateHtml: () => createClientConfirmationEmail(mockData.bookingClient.name, mockData.bookingClient.consultationType, mockData.bookingClient.bookingData)
  },
  {
    id: "booking-admin-notification",
    name: "Booking Admin Notification Email",
    from: "Diet With Dee Bookings <bookings@mail.dietwithdee.org>",
    subject: `New Booking: ${mockData.bookingAdmin.name} (Initial)`,
    generateHtml: () => createAdminBookingEmail(mockData.bookingAdmin)
  },
  {
    id: "testimonial-admin-notification",
    name: "Testimonial Admin Notification Email",
    from: "Diet With Dee Testimonials <testimonials@mail.dietwithdee.org>",
    subject: `New Success Story: ${mockData.testimonialAdmin.name} (${mockData.testimonialAdmin.plan})`,
    generateHtml: () => createAdminTestimonialEmail(mockData.testimonialAdmin)
  }
];

// Helper to save all previews to disk
function generatePreviews() {
  const outputDir = path.join(__dirname, "../temp-email-previews");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n🎨 Generating HTML Previews in: ${outputDir}`);
  const previewLinks = [];

  for (const flow of flows) {
    const html = flow.generateHtml();
    const filePath = path.join(outputDir, `${flow.id}.html`);
    fs.writeFileSync(filePath, html, "utf-8");
    previewLinks.push({ name: flow.name, file: filePath });
    console.log(`  ✓ Generated: ${flow.id}.html (${flow.name})`);
  }

  // Create an index.html preview hub
  const indexHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Diet With Dee — Email Templates Preview Hub</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px 20px; }
        .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        h1 { color: #16a34a; margin-top: 0; }
        p { color: #64748b; line-height: 1.5; }
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 12px; }
        a { display: block; padding: 16px 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; color: #15803d; text-decoration: none; font-weight: 600; transition: all 0.2s; }
        a:hover { background: #dcfce7; transform: translateX(4px); }
        .tag { font-size: 11px; text-transform: uppercase; background: #16a34a; color: #fff; padding: 3px 8px; border-radius: 6px; margin-left: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Diet With Dee — Email Previews</h1>
        <p>Click any template below to view the rendered responsive email HTML:</p>
        <ul>
          ${previewLinks.map(p => `<li><a href="./${path.basename(p.file)}" target="_blank">${p.name} <span class="tag">Preview</span></a></li>`).join("\n")}
        </ul>
      </div>
    </body>
    </html>
  `;
  fs.writeFileSync(path.join(outputDir, "index.html"), indexHtml, "utf-8");
  console.log(`\n✨ Preview Hub ready at: file://${path.join(outputDir, "index.html").replace(/\\/g, "/")}\n`);
}

// Live send helper using Resend
async function sendLiveEmails(targetEmail, selectedFlowId = null) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("\n❌ RESEND_API_KEY is not set in environment.");
    console.log("   Set it via: $env:RESEND_API_KEY = 're_your_api_key' or run 'resend login --key re_...'");
    process.exit(1);
  }

  // Dynamically import Resend from functions/node_modules
  const { Resend } = require("../functions/node_modules/resend");
  const resend = new Resend(apiKey);

  const targets = selectedFlowId 
    ? flows.filter(f => f.id === selectedFlowId || f.id.includes(selectedFlowId))
    : flows;

  if (targets.length === 0) {
    console.error(`\n❌ No flow found matching: "${selectedFlowId}"`);
    console.log("Available flows:", flows.map(f => f.id).join(", "));
    process.exit(1);
  }

  console.log(`\n🚀 Sending ${targets.length} test email(s) to: ${targetEmail}`);

  for (const flow of targets) {
    console.log(`\n📨 Dispatching: ${flow.name}...`);
    try {
      const html = flow.generateHtml();
      const { data, error } = await resend.emails.send({
        from: flow.from,
        to: [targetEmail],
        subject: `[TEST] ${flow.subject}`,
        html: html
      });

      if (error) {
        console.error(`  ❌ Failed:`, error.message || error);
      } else {
        console.log(`  ✅ Successfully sent! ID: ${data.id}`);
      }
    } catch (err) {
      console.error(`  ❌ Error sending ${flow.name}:`, err.message || err);
    }
    // Small delay between calls
    await new Promise(r => setTimeout(r, 600));
  }
}

// CLI args parsing
const args = process.argv.slice(2);
const isPreview = args.includes("--preview") || args.length === 0;
const sendFlagIndex = args.indexOf("--send");
const targetEmail = sendFlagIndex !== -1 ? args[sendFlagIndex + 1] : null;
const flowFlagIndex = args.indexOf("--flow");
const targetFlow = flowFlagIndex !== -1 ? args[flowFlagIndex + 1] : null;

async function main() {
  if (isPreview) {
    generatePreviews();
  }

  if (targetEmail) {
    await sendLiveEmails(targetEmail, targetFlow);
  } else if (!isPreview) {
    console.log(`
Usage:
  # 1. Generate local HTML previews of all email templates:
  node scripts/test-email-flows.mjs --preview

  # 2. Live send all email flows to a test email address:
  node scripts/test-email-flows.mjs --send delivered@resend.dev

  # 3. Live send only survey voucher email:
  node scripts/test-email-flows.mjs --send your-email@gmail.com --flow survey-voucher-weight-loss
    `);
  }
}

main().catch(err => {
  console.error("Execution error:", err);
  process.exit(1);
});
