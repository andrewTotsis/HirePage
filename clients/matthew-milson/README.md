# Matthew Milson — Personal HirePage

Standalone personal website for Matthew Milson (BDR role search), built by HirePage.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Inter

## Local development

```bash
cd clients/matthew-milson
npm install
npm run dev    # http://localhost:3000
```

Production build check:

```bash
npm run build
npm run start
```

## Deploying to Vercel (recommended)

This is an **independent project** inside the HirePage monorepo — it deploys to its own Vercel project, separate from the main `hirepage.app` site.

### One-time setup

1. Log in to the Vercel dashboard.
2. Click **Add New → Project** and import `andrewTotsis/HirePage`.
3. In the project settings, set:
   - **Project Name:** `matthew-milson-hirepage` (final URL: `matthew-milson-hirepage.vercel.app`)
   - **Framework Preset:** Next.js
   - **Root Directory:** `clients/matthew-milson`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
4. Deploy.

### CLI alternative

```bash
cd clients/matthew-milson
npx vercel --prod
# When prompted, set Root Directory to the current folder and project name to matthew-milson-hirepage
```

### Custom domain

If Matthew wants `matthewmilson.com` (or similar):
1. Add the domain in Vercel → Project → Settings → Domains.
2. Point the DNS records Vercel displays.
3. Update `siteUrl` in [app/layout.tsx](app/layout.tsx), [app/sitemap.ts](app/sitemap.ts), and [app/robots.ts](app/robots.ts) to the final URL.

## File structure

```
clients/matthew-milson/
├── app/
│   ├── layout.tsx        SEO metadata, Inter font, Person JSON-LD
│   ├── page.tsx          Section composition
│   ├── globals.css       Tailwind + utilities (container-pro, section, card, btn)
│   ├── robots.ts         robots.txt
│   └── sitemap.ts        sitemap.xml
├── components/
│   ├── Nav.tsx           Sticky scroll-aware nav + mobile menu
│   ├── Hero.tsx          Headline, value prop, CTAs, contact row
│   ├── Metrics.tsx       4 key stats bar
│   ├── Experience.tsx    Timeline — 4 roles with rewritten achievement bullets
│   ├── Education.tsx     Centennial + Ivey cert
│   ├── Skills.tsx        4 skill groups
│   ├── About.tsx         Narrative + at-a-glance panel
│   ├── Contact.tsx       Email / phone / LinkedIn CTAs
│   └── Footer.tsx
└── public/               Static assets (add favicon, og image here)
```

## Content & brand rules

- **Primary CTA target:** personal contact (email / LinkedIn) — not the Tally form. This is a client-facing personal site, not the HirePage marketing page.
- **Target role:** Business Development Representative (BDR / SDR).
- **Accent palette:** light blue (`#3b82f6` / `#1d4ed8`), slate greys, white.
- All experience bullets are rewritten from the resume PDF using action verbs + metrics.

## Recruiter-conversion recommendations (next)

1. **OG image** — add a branded `public/og.png` (1200×630) with Matthew's name, title, and key metrics. Currently falls back to the site URL preview.
2. **Favicon** — drop `favicon.ico` / `icon.png` into `app/` or `public/`.
3. **Loom video intro** (60-sec pitch) — embed near the hero; proven to boost recruiter replies.
4. **PDF download button** — link to a hosted copy of the polished resume once the visual version is finalized.
5. **Analytics** — add Vercel Analytics (`@vercel/analytics`) to see recruiter traffic.
6. **Testimonials / references** — one or two short quotes from managers at RBC or GTA Search would substantially lift credibility.
