#!/usr/bin/env node
/*
 * Create HirePage Stripe products + prices.
 *
 * Usage:
 *   npm install stripe
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/create-stripe-products.js
 *
 * Use a TEST key (sk_test_...) first to verify, then re-run with a LIVE key
 * (sk_live_...) when you're ready. Safe to re-run: uses lookup_keys so prices
 * are only created once per (key, mode).
 */

const Stripe = require('stripe');

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('Missing STRIPE_SECRET_KEY env var.');
  process.exit(1);
}

const stripe = new Stripe(key);
const mode = key.startsWith('sk_live_') ? 'live' : 'test';

const tiers = [
  {
    name: 'HirePage - Website',
    description: 'One-time website build.',
    prices: [
      { lookup_key: `hirepage_website_setup_${mode}`, unit_amount: 5000, recurring: null, nickname: 'Setup (one-time)' },
    ],
  },
  {
    name: 'HirePage - Website + Monthly Edits',
    description: 'Website build plus monthly edits subscription.',
    prices: [
      { lookup_key: `hirepage_monthly_setup_${mode}`, unit_amount: 5000, recurring: null, nickname: 'Setup (one-time)' },
      { lookup_key: `hirepage_monthly_edits_${mode}`, unit_amount: 500, recurring: { interval: 'month' }, nickname: 'Monthly edits' },
    ],
  },
  {
    name: 'HirePage - Website + Unlimited Edits',
    description: 'Website build plus unlimited edits subscription.',
    prices: [
      { lookup_key: `hirepage_unlimited_setup_${mode}`, unit_amount: 5000, recurring: null, nickname: 'Setup (one-time)' },
      { lookup_key: `hirepage_unlimited_edits_${mode}`, unit_amount: 1000, recurring: { interval: 'month' }, nickname: 'Unlimited edits' },
    ],
  },
];

async function findOrCreateProduct(name, description) {
  const existing = await stripe.products.search({ query: `name:'${name}'`, limit: 1 });
  if (existing.data.length > 0) return existing.data[0];
  return stripe.products.create({ name, description });
}

async function findOrCreatePrice(product, spec) {
  const existing = await stripe.prices.list({ lookup_keys: [spec.lookup_key], limit: 1 });
  if (existing.data.length > 0) return existing.data[0];
  return stripe.prices.create({
    product: product.id,
    unit_amount: spec.unit_amount,
    currency: 'usd',
    lookup_key: spec.lookup_key,
    nickname: spec.nickname,
    ...(spec.recurring ? { recurring: spec.recurring } : {}),
  });
}

(async () => {
  console.log(`\nRunning in ${mode.toUpperCase()} mode.\n`);
  const summary = [];

  for (const tier of tiers) {
    const product = await findOrCreateProduct(tier.name, tier.description);
    const priceRows = [];
    for (const spec of tier.prices) {
      const price = await findOrCreatePrice(product, spec);
      priceRows.push({
        nickname: price.nickname,
        price_id: price.id,
        lookup_key: price.lookup_key,
        amount: `$${(price.unit_amount / 100).toFixed(2)}${price.recurring ? `/${price.recurring.interval}` : ' one-time'}`,
      });
    }
    summary.push({ product: tier.name, product_id: product.id, prices: priceRows });
  }

  console.log('Done. Paste the price IDs into Fillout:\n');
  for (const tier of summary) {
    console.log(`• ${tier.product}  (${tier.product_id})`);
    for (const p of tier.prices) {
      console.log(`    - ${p.nickname}: ${p.price_id}  (${p.amount})  [lookup_key: ${p.lookup_key}]`);
    }
    console.log('');
  }
})().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
