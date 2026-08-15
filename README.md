# TotWorth — landing page (Brief 3)

Single-file static landing page + waitlist capture, built to the spec in
`02-Sonnet-Brief-Pack-v2.md`, Brief 3.

## What's here

```
index.html        the entire page — hero, three problems, channel-neutral
                   statement, product visual mockup, founder note, waitlist
                   form (top and bottom), footer. All content is plain HTML —
                   zero client-side rendering dependency.
robots.txt         AI crawler allow/disallow policy, documented inline.
llms.txt           minimal entity summary for LLM consumption.
favicon.svg        logo mark.
og-image.png       1200×630 social share image (generated, branded — not a
                   product screenshot, since there's no product yet).
api/subscribe.js   Vercel serverless function — POSTs new emails to a
                   Resend Audience.
```

## Three headline options (Brief 3 asked for this explicitly)

**A — "What's your baby gear actually worth?"** *(the one shipped in index.html)*
Direct question, unambiguous about what the product does, works regardless
of which item a visitor is thinking about. Tradeoff: the safest option is
also the least distinctive — it won't stop a scroll on its own.

**B — "Your stroller is worth more than you think — for now."**
Matches the brief's own guidance that specific beats aspirational ("$340
today, $260 by Christmas" language). More memorable, creates urgency from
the depreciation clock. Tradeoff: commits to "stroller" as the example,
which won't land the same for a visitor thinking about a crib or car seat —
and it takes half a beat longer to parse as "this is a valuation tool."

**C — "Know what to sell, when to sell it, and what's worth keeping."**
Most literal preview of the actual product mechanic (the sell-now-vs-hold
signal). Tradeoff: reads more like a feature list than a hook — weakest as
a scroll-stopper for waitlist traffic coming from Reddit/social, which is
where the 200-signup gate has to come from.

**Why A shipped, not B:** A is the hero headline; B's concreteness was kept
by using the exact "$340 today / $260 by December" language inside the
product-visual mockup instead, where a specific example is expected and
clearly labeled illustrative — so you get A's broad applicability as the
first thing a visitor reads, and B's concreteness where it belongs. Swap
the `<h1>` text in `index.html` if you want to test B or C instead — it's
one line, no other markup depends on it.

## Deploying to Vercel

1. Push this folder to a Git repo, then import it in Vercel (or run
   `vercel` from inside this folder with the Vercel CLI).
2. In the Vercel project's Environment Variables, set:
   - `RESEND_API_KEY` — from resend.com/api-keys
   - `RESEND_AUDIENCE_ID` — create a "Waitlist" audience in Resend first,
     then copy its ID
3. Deploy. Vercel will serve `index.html` at `/`, `robots.txt` and
   `llms.txt` at their root paths automatically (static files), and
   `api/subscribe.js` as a serverless function at `/api/subscribe`.

## Still needs your input before this is fully done

- **`sameAs` in the JSON-LD is intentionally empty** (in the `<head>` of
  `index.html`). Fill it in with real profile URLs (LinkedIn, X, etc.) as
  you create them — I didn't want to guess or invent placeholder links,
  since a wrong URL actively hurts entity resolution more than an empty
  array does.
- **Founder note copy** draws only on what's confirmed in the project memory
  (design-systems/design-org background, solo founder). If there's a more
  personal reason you want up there, swap the paragraph in the "Why I'm
  building this" section — I didn't invent a personal anecdote to fill the
  space.
- **`hello@totworth.com`** is used as the contact address in the footer and
  the form's error state — confirm that inbox exists before this goes live,
  or swap it.

## Verification done so far

**Server-rendered content — confirmed.** Ran a local server and `curl`'d the
page with each retrieval-bot user-agent from the robots.txt allowlist
(`OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`,
`PerplexityBot`) plus a plain no-JS user agent. The hero headline, the
channel-neutral statement, and the mockup's `$340` figure all came back in
every response — confirming there's no client-side-only content. This is a
stronger guarantee for this page than it would be for a framework-rendered
one, since there's no hydration step at all.

**Lighthouse — run locally, not on production.** Using headless Chromium
against the local static server: **Performance 99, Accessibility 100, Best
Practices 100, SEO 100** — all clear of the 95+ bar. Caveat, stated plainly:
this is localhost with no real network latency or CDN, so it's a strong
signal but not a substitute for running Lighthouse against the live
`totworth.com` URL once deployed — production numbers can differ.

**Color contrast — computed, not eyeballed.** Every text/background pairing
on the page was run through the WCAG contrast formula; the lowest ratio on
the page is 7.82:1, which clears AA (4.5:1) with room to spare and clears
AAA (7:1) too.

**Not yet verified — needs Brief 5, or needs the live deploy:**
- Whether Vercel's bot protection or Cloudflare's AI-crawler blocking
  (enabled by default on some plans) silently overrides this robots.txt —
  Brief 5 covers auditing that, and it has to happen against the real
  deployment, not this local copy.
- Real AI-bot traffic hitting the page — that requires a log drain against
  production, also Brief 5.
- This `robots.txt` is a static file, which is fine for a single-file
  landing page, but Brief 5 (when the Next.js scaffold exists) should turn
  it into a version-controlled *route* as originally specified, so it can't
  silently drift from what's actually deployed.
