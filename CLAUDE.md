# HirePage — Project Context

## What this is

HirePage is a real business selling **done-for-you personal websites** to students, graduates, and job seekers. A customer submits a Fillout intake form with their resume; at the end of the form they're redirected to a Stripe-hosted checkout (Payment Link) for the plan they selected. We then design and ship their custom single-page site within a few days.

This repo contains:

- the **marketing landing page** at [hirepage.app](https://hirepage.app), and
- **per-client sites** under `clients/` — one standalone Next.js project per paying customer.

## Core conversion path

- **Primary CTA text (everywhere on the marketing site):** `Create My HirePage`
- **CTA target:** `https://forms.fillout.com/t/39KHbwLLRHus` (Fillout intake form)
- Every CTA on the marketing site uses `components/CTAButton.tsx`, which exports the `FORM_URL` constant and defaults to that URL. Do not hardcode the form URL anywhere else.
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
- Build command: `npm run build` (or `npx next build`). First-load JS ~98 KB.

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
  HeroMockup.tsx    Browser-window mockup showing a sample HirePage (anonymized "Alex Parker" BDR)
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
clients/
  matthew-milson/   Standalone Next.js site for Matthew Milson (BDR). Live at matthew-milson.vercel.app.
  <future-client>/  Same pattern for every new paying customer.
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

## "Make it live" protocol — autonomous execution (IMPORTANT)

When the user says **"make it live"**, **"ship it"**, **"deploy it"**, **"push it"**, **"merge it"**, **"do it for me"**, **"go"**, **"send it"**, or any equivalent directive, execute the full chain end-to-end **without pausing to confirm intermediate steps**:

1. Commit any pending changes with a descriptive message.
2. Push the current branch to origin.
3. Open a PR against the default branch (`gh pr create --base claude/build-hirepage-landing-Gojrk`).
4. Merge the PR (`gh pr merge <num> --merge`).
5. Force a production deploy — `echo "n" | npx vercel --prod --yes` from the relevant project root (repo root for hirepage.app, or `clients/<slug>` for a client site). Vercel's git-integration auto-deploy is **not reliable** here, so always force-deploy from the CLI.
6. Verify the live site reflects the change — `curl` the URL and grep for expected content.
7. Report the live URLs back in a single summary message.

Do **not** stop between these steps to ask. Do **not** wait for approval after each step. The single directive authorizes the entire chain. Only pause if a step actually fails and needs a decision.

The same rule applies when the user has just asked for a code change and follows up with a short go-signal ("do it", "ship", "go", "make it live"). One word = the full chain.

## Deploying changes to hirepage.app

- **Vercel project:** `hire-page` (hyphenated) in team `andrewtotsis-6478's projects`.
- **Force a prod deploy:**
  ```bash
  echo "n" | npx vercel --prod --yes
  ```
  The leading `echo "n"` declines the Vercel CLI's "install the Claude plugin" prompt that otherwise blocks non-interactive runs. Without it, the CLI hangs.
- **Default branch on GitHub** is `claude/build-hirepage-landing-Gojrk` (**not `main`** — `main` does not exist on origin). Target PRs against it.
- **Production URLs:** `https://hirepage.app` (primary), `https://hirepage.vercel.app` (alias).

## Admin CRM (`/admin`)

Internal-only dashboard at `/admin` for tracking all onboarding submissions — complete AND partial. The onboarding flow POSTs progress to `/api/leads/upsert` (sendBeacon, debounced) keyed by a browser-generated UUID in localStorage, so every step of the funnel is captured as a lead record.

**Auth:** password-gated via signed httpOnly cookie. Set in Vercel:

| Env var | What | Required |
|---|---|---|
| `ADMIN_PASSWORD` | Admin login password (dev default: `hirepage-admin` — change for prod) | yes |
| `ADMIN_COOKIE_SECRET` | HMAC secret for the admin session cookie | yes (prod) |

**Storage:** Neon Postgres via the HTTP driver (`@neondatabase/serverless`). The `leads` table is self-bootstrapping — first query runs `CREATE TABLE IF NOT EXISTS` so there's no separate migration step. Set in Vercel (or use the **Neon** marketplace integration which auto-provisions it):

| Env var | What |
|---|---|
| `DATABASE_URL` (or `POSTGRES_URL`) | Neon pooled connection string (e.g. `postgres://…@…-pooler.neon.tech/neondb?sslmode=require`) |

If `DATABASE_URL` is missing, the admin boots in **demo mode** — in-memory fallback, data resets between serverless invocations, and a warning banner is shown in the dashboard.

**Files of interest:**
- `app/admin/` — login + dashboard pages
- `app/api/admin/` — auth + leads list/detail/patch
- `app/api/leads/upsert/route.ts` — public write endpoint called from onboarding
- `components/admin/` — UI (`AdminDashboard`, `TopBar`, `AnalyticsHeader`, `SegmentTabs`, `FiltersBar`, `LeadTable`, `LeadDetailPanel`)
- `lib/leads.ts` — domain (upsert, progress calc, status classification)
- `lib/storage.ts` — Neon SQL client + memory fallback (self-bootstrapping schema)
- `lib/admin-auth.ts` — password check + HMAC cookie

Dashboard polls `/api/admin/leads` every 10s for near-real-time updates; newly-arrived leads get a subtle highlight animation.

## Per-client sites (`clients/`)

Each paying HirePage customer gets a **standalone** Next.js project under `clients/<slug>/`, deployed to its own Vercel project.

- **Template:** copy `clients/matthew-milson/` as the starting point for a new client — it already has the right structure, config, SEO, and sections for a BDR/sales profile. Swap copy, assets, and color accents per-customer.
- **Vercel setup:** Root Directory = `clients/<slug>`, Project Name = `<slug>` (URL becomes `<slug>.vercel.app`). Scope = `andrewtotsis-6478's projects`.
- **Root `tsconfig.json` excludes `clients/`** so the root hirepage.app build doesn't try to compile nested client projects. Do not remove that exclude.
- **Fully independent:** each client site has its own `package.json`, `node_modules`, deployment, and Vercel project. The root repo stays the marketing site.
- **Deploy a client site:**
  ```bash
  cd clients/<slug>
  echo "n" | npx vercel --prod --yes
  ```

## Running locally

Marketing site (root):
```bash
npm install
npm run dev        # http://localhost:3000
npx next build     # production build check
```

A client site:
```bash
cd clients/<slug>
npm install
npm run dev
```

## Conventions / guardrails

- Every CTA on the marketing site must use `<CTAButton />` (or import `FORM_URL` from `CTAButton`) so the form URL is never hardcoded wrong in multiple places.
- Keep all sections on the marketing site using `.container-pro` for width and `.section` for padding.
- Root site is static-only. Do not introduce a backend, database, or auth unless explicitly requested.
- The `Logo` component is inline SVG — edit it there for visual changes, don't swap to `<img>`.
- When regenerating logo PNGs, run `python3 scripts/generate_logo.py` (requires Pillow).
- `.gitignore` excludes `logo-options/`, `generate_logo_options.py`, and `hirepage.bundle` — these are local drafts, not part of the site.
- Client sites default to their own palette (light blue / grey / white for Matthew Milson, set per-customer via their resume intake).

## Known gaps / likely next tasks

- **Examples section** on the marketing site currently shows "Coming Soon" placeholders — replace with real sample HirePages once customer consent is given.
- **Contact email** is `support@hirepage.app` everywhere user-facing (Footer, /privacy, /terms). Outreach sends from the same address via Gmail API OAuth.
- **Analytics** not wired up — consider Vercel Analytics or Plausible.
- **Dark mode** not implemented (intentionally — the site is light-mode by design).
- **`siteUrl`** in `app/layout.tsx` is `https://hirepage.vercel.app`. Swap to `https://hirepage.app` since the custom domain is live and serving.

## Important files to read first

1. `app/layout.tsx` — metadata, SEO, fonts
2. `app/page.tsx` — section order
3. `app/globals.css` — custom utilities used everywhere
4. `components/Logo.tsx` — brand mark
5. `components/CTAButton.tsx` — conversion entry point
6. `components/HeroMockup.tsx` — anonymized sample page shown on the marketing site
7. `clients/matthew-milson/` — the template pattern for per-client sites
