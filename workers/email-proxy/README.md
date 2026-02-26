# Email Proxy — Cloudflare Worker

A lightweight serverless proxy that securely relays email requests from the DietWithDee frontend to the Resend API.

## Setup & Deploy

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- A [Cloudflare account](https://cloudflare.com) (free)

### 1. Install dependencies

```bash
cd workers/email-proxy
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

This opens a browser window — authorize Wrangler to access your Cloudflare account.

### 3. Set your Resend API key as a secret

```bash
npm run secret:set
```

When prompted, paste your Resend API key. This is stored securely in Cloudflare — **never in your code**.

### 4. Deploy

```bash
npm run deploy
```

After deploying, Wrangler will output your Worker URL, e.g.:
```
https://dwd-email-proxy.YOUR_SUBDOMAIN.workers.dev
```

### 5. Update your frontend

Add the Worker URL to your `.env` file in the main project root:

```
VITE_EMAIL_PROXY_URL=https://dwd-email-proxy.YOUR_SUBDOMAIN.workers.dev
```

Also add it to your **GitHub repository secrets** as part of the `ENV_FILE` secret so it's available during CI builds.

### 6. Verify your domain in Resend

In the [Resend dashboard](https://resend.com/domains), add `dietwithdee.org` and follow their instructions to add SPF and DKIM DNS records in Hostinger. This ensures emails are sent from `noreply@dietwithdee.org` and don't land in spam.

## Local Development

```bash
npm run dev
```

This starts the Worker locally (usually on `http://localhost:8787`). Set `VITE_EMAIL_PROXY_URL=http://localhost:8787` in your `.env` for local testing.
