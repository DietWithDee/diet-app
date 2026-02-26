/**
 * Cloudflare Worker — Email proxy for Resend
 *
 * Accepts POST requests from the frontend, validates them,
 * and forwards the email to Resend's API using a secret key.
 *
 * Environment variables (set via `wrangler secret put`):
 *   RESEND_API_KEY  — your Resend API key
 *
 * Environment variables (set in wrangler.toml):
 *   ALLOWED_ORIGIN  — e.g. "https://dietwithdee.org"
 *   FROM_EMAIL      — e.g. "noreply@dietwithdee.org"
 *   FROM_NAME       — e.g. "Nana Ama from Diet with Dee"
 */

const RESEND_API = 'https://api.resend.com/emails';

function corsHeaders(origin, allowedOrigin) {
  // Allow localhost for development, and the production origin
  const isAllowed =
    origin === allowedOrigin ||
    origin?.startsWith('http://localhost:') ||
    origin?.startsWith('http://127.0.0.1:');

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN);

    // Handle CORS pre-flight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return Response.json(
        { error: 'Method not allowed' },
        { status: 405, headers }
      );
    }

    try {
      const body = await request.json();
      const { to, subject, html } = body;

      // Validate required fields
      if (!to || !subject || !html) {
        return Response.json(
          { error: 'Missing required fields: to, subject, html' },
          { status: 400, headers }
        );
      }

      // Validate email format (basic)
      if (typeof to !== 'string' || !/\S+@\S+\.\S+/.test(to)) {
        return Response.json(
          { error: 'Invalid email address' },
          { status: 400, headers }
        );
      }

      // Send via Resend
      const resendResponse = await fetch(RESEND_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
          to: [to],
          subject,
          html,
        }),
      });

      const result = await resendResponse.json();

      if (!resendResponse.ok) {
        console.error('Resend API error:', result);
        return Response.json(
          { error: result.message || 'Failed to send email' },
          { status: resendResponse.status, headers }
        );
      }

      return Response.json(
        { success: true, id: result.id },
        { status: 200, headers }
      );

    } catch (err) {
      console.error('Worker error:', err);
      return Response.json(
        { error: 'Internal server error' },
        { status: 500, headers }
      );
    }
  },
};
