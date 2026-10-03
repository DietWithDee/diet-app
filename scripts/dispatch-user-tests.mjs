import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const recipients = ["gokronipa@icloud.com", "godwinokro2020@gmail.com"];

const emailsToSend = [
  {
    name: "1. Survey Voucher: Snatched & Nourished (Weight Loss)",
    from: "Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>",
    subject: "Your 20% Discount Voucher for Snatched & Nourished — Diet With Dee",
    htmlFile: path.join(__dirname, "../temp-email-previews/survey-voucher-weight-loss.html")
  },
  {
    name: "2. Survey Voucher: Blood Sugar Balance (Diabetes)",
    from: "Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>",
    subject: "Your 20% Discount Voucher for Blood Sugar Balance — Diet With Dee",
    htmlFile: path.join(__dirname, "../temp-email-previews/survey-voucher-diabetes.html")
  },
  {
    name: "3. Survey Voucher: Pressure No Dey Catch Me (Hypertension)",
    from: "Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>",
    subject: "Your 20% Discount Voucher for Pressure No Dey Catch Me — Diet With Dee",
    htmlFile: path.join(__dirname, "../temp-email-previews/survey-voucher-hypertension.html")
  },
  {
    name: "4. Survey Voucher: The Weight Gain Plan",
    from: "Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>",
    subject: "Your 20% Discount Voucher for The Weight Gain Plan — Diet With Dee",
    htmlFile: path.join(__dirname, "../temp-email-previews/survey-voucher-weight-gain.html")
  },
  {
    name: "5. Survey Voucher: Back to Basics (Healthy Eating / Default)",
    from: "Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>",
    subject: "Your 20% Discount Voucher for Back to Basics — Diet With Dee",
    htmlFile: path.join(__dirname, "../temp-email-previews/survey-voucher-default.html")
  },
  {
    name: "Bonus: New Subscriber Welcome Email",
    from: "Nana Ama from Diet With Dee <hello@mail.dietwithdee.org>",
    subject: "Welcome to Diet With Dee! 🌿",
    htmlFile: path.join(__dirname, "../temp-email-previews/welcome-email.html")
  }
];

console.log(`\n📬 Dispatching emails to: ${recipients.join(" & ")}\n`);

const results = [];

async function run() {
  for (const email of emailsToSend) {
    console.log(`Sending: ${email.name}...`);
    try {
      // Construct resend CLI command
      const toArgs = recipients.map(r => `"${r}"`).join(" ");
      const cmd = `resend emails send --from "${email.from}" --to ${toArgs} --subject "${email.subject}" --html-file "${email.htmlFile}"`;
      const stdout = execSync(cmd, { encoding: "utf-8" });
      const parsed = JSON.parse(stdout.trim());
      console.log(`  ✅ Sent successfully! ID: ${parsed.id}`);
      results.push({ name: email.name, id: parsed.id, success: true });
    } catch (err) {
      console.error(`  ❌ Error:`, err.message);
      results.push({ name: email.name, error: err.message, success: false });
    }
    // Brief pause to maintain clean rate limits
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log("\n================ Dispatch Summary ================");
  console.table(results);
}

run();
