import { Contact } from './outreach-storage';
import { fullName } from './outreach';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

export function isAIConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

const SYSTEM_PROMPT = `You write personalized cold-email openers for Andrew at HirePage (https://hirepage.app), a service that builds professional personal websites for students, graduates, and job seekers.

Write a SINGLE 1-2 sentence opener that earns the reader's attention by referencing something specific about THEM — their company, their role, their LinkedIn profile, or recent context. The opener should feel hand-written, not templated.

Hard rules:
- Do NOT mention HirePage, my product, or any pitch. The opener exists to earn the next sentence — that comes after
- Do NOT use clichés ("I came across your profile", "I noticed you", "love what you're doing", "hope you're well")
- Do NOT start with "Hi {name}" — that's added separately
- Do NOT add quotation marks, signatures, or commentary
- Keep it under 220 characters
- One paragraph, no line breaks
- Sound like a thoughtful human who actually read their LinkedIn

Output ONLY the opener line — nothing else.`;

export type IntroInput = {
  contact: Contact;
  extraContext?: string; // pasted LinkedIn About / headline / recent posts
};

export async function generateIntro({ contact, extraContext }: IntroInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const facts: string[] = [];
  const name = fullName(contact);
  if (name) facts.push(`Name: ${name}`);
  if (contact.title) facts.push(`Role: ${contact.title}`);
  if (contact.company) facts.push(`Company: ${contact.company}`);
  if (contact.linkedin) facts.push(`LinkedIn: ${contact.linkedin}`);
  if (contact.tags?.length) facts.push(`Tags: ${contact.tags.join(', ')}`);
  const userPrompt =
    facts.join('\n') +
    (extraContext ? `\n\nAdditional context (pasted from their profile or research):\n${extraContext.slice(0, 4000)}` : '');

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic ${res.status}: ${text.slice(0, 240)}`);
  }
  const j = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  const out = (j.content ?? [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text ?? '')
    .join('')
    .trim();
  // Strip surrounding quotes if any
  return out.replace(/^["'""]+|["'""]+$/g, '').trim();
}
