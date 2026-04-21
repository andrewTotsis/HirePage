# HirePage — Project Context

## What this is

HirePage is a real business selling **done-for-you personal websites** to students, graduates, and job seekers. A customer submits a Fillout intake form with their resume; at the end of the form they're redirected to a Stripe-hosted checkout (Payment Link) for the plan they selected. We then design and ship their custom single-page site within a few days.

This repo is the **marketing landing page** that converts visitors into form submissions.

## Core conversion path

- **Primary CTA text (everywhere):** `Create My HirePage`
- **CTA target:** `https://forms.fillout.com/t/39KHbwLLRHus` (Fillout intake form)
- Every CTA on the site uses `components/CTAButton.tsx`, which exports the `FORM_URL` constant and defaults to that URL. Do not hardcode the form URL anywhere else.
- Fillout form ends on a per-plan thank-you page whose "Proceed to Payment" button redirects to one of three live Stripe Payment Links (CAD, `client_reference_id` set to the submitter's email so payments can be matched back to submissions).

## Pricing (displayed on page, matches real offer)

All prices are **CAD** (target market is Canadian students — the `$` on the site is CAD, not USD).

| Plan | Price | What |
|------|-------|------|
| Basic | $50 one-time | Custom website built from resume |
| Monthly Edits | $50 + $5/mo | Website + monthly edits |
| Unlimited Edits | $50 + $10/mo | Priority + unlimited updates |

At Stripe checkout every plan shows **$50 charged today** — the subscription plans have a 30-day free trial on the recurring portion, so the first month of edits is free and $5/$10/mo starts on day 31. This keeps the perceived price anchored to $50 and matches the "first month free" framing customers see at checkout.

## Payments (live, CAD)

Customers reach checkout via three live Stripe Payment Links. Each per-plan Fillout thank-you page's "Proceed to Payment" button routes to the matching link:

| Plan | Payment Link |
|------|------|
| Basic | https://buy.stripe.com/9B6aEQeuvg6Wbj82jobjW00 |
| Monthly Edits | https://buy.stripe.com/bJefZa5XZ3kacnc0bgbjW01 |
| Unlimited Edits | https://buy.stripe.com/28E3codqrdYO0Eu5vAbjW02 |

- **Stripe account:** `acct_1TOTfW54qLQ2cDt8` (HirePage)
- Subscription plans use `subscription_data[trial_period_days]=30` on the Payment Link (not on the prices themselves), so the same $5/mo and $10/mo prices are reused cleanly.
- **Matching payments to submissions:** `client_reference_id` on every Payment Link is set to the submitter's **Email** — Fillout's free tier doesn't expose Submission ID to URL-button variables. `client_reference_id` is invisible/immutable to the customer at checkout, so email changes on the Stripe page don't break the match. Cross-reference in the Stripe dashboard → Payments → `client_reference_id` column.
- **Stripe CLI** was paired with a restricted key (expires every 90 days — re-run `stripe login`). Scopes required if the key is rotated: Products, Prices, Payment Links (all Write).

Product / price IDs (for dashboard lookups or API work — **do not recreate**):

| Product | Product ID | Prices |
|---|---|---|
| HirePage Basic | `prod_UNEoeTmx46xkd4` | `price_1TOUM854qLQ2cDt8OOM8tcYT` ($50 one-time) |
| HirePage Monthly Edits | `prod_UNEo4r37LQ3UhT` | `price_1TOUM854qLQ2cDt8AIybljft` ($50 setup) · `price_1TOUM954qLQ2cDt8SJkBDhgo` ($5/mo) |
| HirePage Unlimited Edits | `prod_UNEo2FoYmGz0Fw` | `price_1TOUMA54qLQ2cDt8QtchVYLS` ($50 setup) · `price_1TOUMA54qLQ2cDt8cGuBRdk0` ($10/mo) |

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with custom design tokens in `tailwind.config.ts` and extra utilities in `app/globals.css`
- **Inter** via `next/font/google`
- Fully static — every route prerenders at build time. No backend, no DB, no auth.
- Build command: `npm run build` (or `npx next build`). First-load JS ~96 KB.

## Repo layout

```
app/
  layout.tsx        Root layout, full SEO metadata, JSON-LD Organization
  page.tsx          Home — composes all section components
  globals.css       Tailwind + .container-pro, .section, .card, .btn-primary, .eyebrow, etc.
  privacy/page.tsx  Privacy policy
  terms/page.tsx    Terms of service
  robots.ts         Static robots.txt
  sitemap.ts        Static sitemap.xml
components/
  Navbar.tsx        Sticky, scroll-aware, mobile menu
  Hero.tsx          Headline + dual CTA + hero mockup
  HeroMockup.tsx    Fake browser window showing a sample HirePage
  Stats.tsx         4 market-insight stat cards
  WhyHirePage.tsx   8 benefit cards with mono icons
  HowItWorks.tsx    3-step process
  Examples.tsx      3 placeholder "Coming Soon" cards (Business, SWE, Marketing)
  Pricing.tsx       3 pricing cards (Monthly Edits highlighted)
  FAQ.tsx           7 expandable <details> accordions
  FinalCTA.tsx      Dark gradient card with final conversion push
  Footer.tsx        Logo + links + legal
  Logo.tsx          Inline SVG: gradient rounded tile + HP + green status dot
  CTAButton.tsx     Exports `FORM_URL` constant; primary + secondary variants
public/
  logo.png          512px — used in metadata
  logo@1024.png     High-res backup
  logo-light.png    Light-bg variant
  favicon.png
  og.png            1200×630 social card
scripts/
  generate_logo.py  Regenerates all the above PNGs. Run: `python3 scripts/generate_logo.py`
```

## Design system

- **Ink / primary dark:** `#0a0a0b`
- **Logo gradient:** `#1f2330 → #07070a`
- **Accent green (status dot):** `#22c55e`
- **Container:** `max-width: 1200px`, `padding: 0 24px` → class `container-pro`
- **Section padding:** `96px` desktop / `64px` mobile → class `section`
- **Cards:** white bg, `rgba(15,23,42,0.08)` border, hover lifts `-3px`
- **Buttons:** `.btn-primary` (black) and `.btn-secondary` (outlined white)
- **Typography:** Inter, tight letter-spacing (`-0.02em` to `-0.035em` on headlines)
- **Visual direction:** Stripe / Linear / Framer / Notion / Apple — white + black + subtle gradients, lots of spacing, confident type, premium feel. **Not hypey.**

## Copy rules

- **Hero headline:** "Stand Out. Get Noticed. Get Hired."
- **Hero subhead:** "We turn your resume into a professional personal website that helps recruiters instantly understand your value."
- **Tone:** confident, modern, trustworthy, ambitious, clean. **Avoid hype language.**
- Never change the CTA button text. Form URL can change — edit `FORM_URL` in `components/CTAButton.tsx`.

## Deployment

- **GitHub:** `andrewTotsis/HirePage`
- **Working branch:** `claude/build-hirepage-landing-Gojrk`
- **Hosting:** Vercel (Next.js auto-detected, zero config)
- **Domain:** `hirepage.app` (purchased through Vercel, auto-attached)
- **Vercel team:** `andrewtotsis-6478's projects`

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
npx next build     # production build check
```

## Conventions / guardrails

- Every CTA must use `<CTAButton />` (or import `FORM_URL` from `CTAButton`) so the form URL is never hardcoded wrong in multiple places.
- Keep all sections using `.container-pro` for width and `.section` for padding.
- Static-only. Do not introduce a backend, database, or auth unless explicitly requested.
- The `Logo` component is inline SVG — edit it there for visual changes, don't swap to `<img>`.
- When regenerating logo PNGs, run `python3 scripts/generate_logo.py` (requires Pillow).
- `.gitignore` excludes `logo-options/`, `generate_logo_options.py`, and `hirepage.bundle` — these are local drafts, not part of the site.

## Known gaps / likely next tasks

- **Examples section** currently shows "Coming Soon" placeholders — replace with real sample HirePages once they exist.
- **Contact email** `hello@hirepage.com` is a placeholder — swap to real address.
- **Analytics** not wired up — consider Vercel Analytics or Plausible.
- **Dark mode** not implemented (intentionally — the site is light-mode by design).
- **Custom domain** `hirepage.app` — once DNS is confirmed live, update `siteUrl` in `app/layout.tsx` (currently `https://hirepage.vercel.app`) and in `app/sitemap.ts` / `app/robots.ts`.

## Important files to read first

1. `app/layout.tsx` — metadata, SEO, fonts
2. `app/page.tsx` — section order
3. `app/globals.css` — custom utilities used everywhere
4. `components/Logo.tsx` — brand mark
5. `components/CTAButton.tsx` — conversion entry point
