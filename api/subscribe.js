// Vercel serverless function — POST /api/subscribe
//
// Adds an email to a Resend Audience. Requires two environment variables,
// set in the Vercel project dashboard (never committed to the repo):
//
//   RESEND_API_KEY       — from resend.com/api-keys
//   RESEND_AUDIENCE_ID    — from resend.com/audiences (create a "Waitlist" audience first)
//
// Handles both the JS fetch() path (Content-Type: application/json) used by
// index.html's progressive enhancement, and a plain HTML form POST fallback
// (Content-Type: application/x-www-form-urlencoded) for when JS is disabled.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  let email = '';
  try {
    const isJson = (req.headers['content-type'] || '').includes('application/json');
    if (isJson) {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      email = (body.email || '').trim();
    } else {
      // application/x-www-form-urlencoded fallback
      const body = typeof req.body === 'string' ? req.body : '';
      const params = new URLSearchParams(body);
      email = (params.get('email') || '').trim();
    }
  } catch (e) {
    return respond(req, res, 400, { error: 'bad_request' });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return respond(req, res, 400, { error: 'invalid_email' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.error('Missing RESEND_API_KEY or RESEND_AUDIENCE_ID env var');
    return respond(req, res, 500, { error: 'server_not_configured' });
  }

  try {
    const resendRes = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text().catch(() => '');
      console.error('Resend API error', resendRes.status, detail);
      return respond(req, res, 502, { error: 'upstream_error' });
    }

    return respond(req, res, 200, { ok: true });
  } catch (err) {
    console.error('Subscribe handler error', err);
    return respond(req, res, 500, { error: 'unexpected_error' });
  }
};

// Sends JSON to fetch() callers; redirects plain form submitters back to the
// page with a query flag the page can optionally read (no JS required for
// the submission itself to succeed — just for the inline confirmation).
function respond(req, res, status, payload) {
  const isJson = (req.headers['content-type'] || '').includes('application/json');
  if (isJson) {
    return res.status(status).json(payload);
  }
  const ok = status >= 200 && status < 300;
  res.writeHead(302, { Location: `/?subscribed=${ok ? '1' : '0'}` });
  return res.end();
}
