export type ProjectCard = {
  title: string;
  description: string;
  tags?: string[];
};

export type ExperienceItem = {
  role: string;
  org: string;
  period: string;
  summary?: string;
};

export type Section =
  | { kind: 'about'; body: string }
  | { kind: 'pillars'; items: { title: string; body: string }[] }
  | { kind: 'projects'; label?: string; items: ProjectCard[] }
  | { kind: 'cases'; label?: string; items: ProjectCard[] }
  | { kind: 'writing'; label?: string; items: ProjectCard[] }
  | { kind: 'research'; label?: string; items: ProjectCard[] }
  | { kind: 'experience'; label?: string; items: ExperienceItem[] }
  | { kind: 'skills'; label?: string; groups: { title?: string; items: string[] }[] }
  | { kind: 'exploring'; label?: string; items: string[] };

export type Profile = {
  slug: string;
  category:
    | 'general'
    | 'tech-weak'
    | 'business'
    | 'tech-mid'
    | 'marketing'
    | 'science'
    | 'alumni';
  categoryLabel: string;
  name: string;
  school: string;
  targetRole: string;
  context: string;
  whyItWorks: string;
  site: {
    url: string;
    tagline: string;
    summary: string;
    availability: string;
    accent: {
      base: string;
      tint: string;
      soft: string;
      ring: string;
    };
    sections: Section[];
  };
};

export const profiles: Profile[] = [
  {
    slug: 'marcus-l',
    category: 'general',
    categoryLabel: 'Undecided · Social Sciences',
    name: 'Marcus L.',
    school: 'McMaster · Social Sciences · 2nd Year',
    targetRole: 'Open to Internships',
    context:
      '2nd-year student with retail and warehouse experience — still figuring out his direction, but ready to put in the work.',
    whyItWorks:
      'Turns a thin resume into a confident first impression. "No direction" becomes "open and adaptable," and transferable skills from service jobs finally get somewhere to live.',
    site: {
      url: 'marcus-lee.ca',
      tagline: 'Reliable. Curious. Ready to contribute.',
      summary:
        'Social Sciences student at McMaster, open to summer internships in HR, policy, or operations.',
      availability: 'Open to summer internships · Hamilton',
      accent: {
        base: '#b45309',
        tint: '#f59e0b',
        soft: '#fef3c7',
        ring: '#fde68a',
      },
      sections: [
        {
          kind: 'about',
          body: "I'm a Social Sciences student at McMaster exploring careers in HR, policy, and community programs. The last two years I've balanced classes with shifts at a busy restaurant and a warehouse floor — which taught me how to stay calm under pressure, work with people from every background, and show up even when it's hard.",
        },
        {
          kind: 'pillars',
          items: [
            {
              title: 'Communication',
              body: 'Two years serving the dinner rush taught me how to read a room and move fast without losing my manners.',
            },
            {
              title: 'Reliability',
              body: 'Warehouse night shifts. On time, every shift, for 14 months straight.',
            },
            {
              title: 'Fast learner',
              body: "New POS, new routes, new coworkers — I pick up process quickly and don't need to be told twice.",
            },
          ],
        },
        {
          kind: 'exploring',
          label: 'Currently exploring',
          items: ['Human Resources', 'Public Policy', 'Community Programs', 'Operations'],
        },
      ],
    },
  },
  {
    slug: 'jordan-s',
    category: 'tech-weak',
    categoryLabel: 'Early-stage CS',
    name: 'Jordan S.',
    school: 'York · Computer Science · 2nd Year',
    targetRole: 'Software Engineering Intern',
    context:
      'Second-year CS student with retail background and one beginner project. Wants to look serious without overpromising.',
    whyItWorks:
      'Frames a beginner project as thoughtful and growth-focused. Same experience — but packaged so a recruiter can skim it in five seconds and actually want to reply.',
    site: {
      url: 'jordan-codes.ca',
      tagline: 'CS student. Building small things well.',
      summary:
        "Second-year CS at York. Learning by building — one small project at a time.",
      availability: 'Looking for Summer 2026 internships',
      accent: {
        base: '#4338ca',
        tint: '#6366f1',
        soft: '#eef2ff',
        ring: '#c7d2fe',
      },
      sections: [
        {
          kind: 'about',
          body: "Second-year Computer Science student at York. I learn best by building, even when the build is small. Outside of class I've worked retail at Best Buy and counselled summer camps — both of which taught me more about communication than any textbook.",
        },
        {
          kind: 'projects',
          label: 'Selected work',
          items: [
            {
              title: 'Simple To-Do',
              description:
                'A clean, distraction-free task app I built to learn React state. No accounts, no bloat — just add, check, delete. What I learned: component structure, controlled inputs, useState.',
              tags: ['React', 'JavaScript', 'CSS'],
            },
          ],
        },
        {
          kind: 'skills',
          label: 'Currently learning',
          groups: [
            { items: ['Data Structures', 'Git & GitHub', 'JavaScript', 'Python basics'] },
          ],
        },
      ],
    },
  },
  {
    slug: 'priya-k',
    category: 'business',
    categoryLabel: 'Commerce · Mid',
    name: 'Priya K.',
    school: 'TMU · Commerce · 3rd Year',
    targetRole: 'Business Analyst Intern',
    context:
      'Commerce student with admin experience and a solid class project — but nothing that stands out from 200 other applicants.',
    whyItWorks:
      'A generic resume line becomes a real, readable case study. Admin work reads as operations experience. Suddenly she looks like someone who has done business work — not just studied it.',
    site: {
      url: 'priyakapoor.work',
      tagline: 'Commerce student turning data into decisions.',
      summary:
        'Third-year Commerce student at TMU, focused on operations, analytics, and clear decision-making.',
      availability: 'Open to Business Analyst roles · Toronto',
      accent: {
        base: '#6d28d9',
        tint: '#8b5cf6',
        soft: '#f5f3ff',
        ring: '#ddd6fe',
      },
      sections: [
        {
          kind: 'about',
          body: "Third-year Commerce student at TMU. I'm drawn to the operations side of business — where messy data turns into cleaner decisions. Outside of class I've supported a retail team at Walmart and run the front office of a small company as an admin assistant.",
        },
        {
          kind: 'cases',
          label: 'Featured case study',
          items: [
            {
              title: 'Sales Data Analysis — margin drivers for a retail chain',
              description:
                'Cleaned 12 months of store-level sales data and built a pivot dashboard to surface the three product categories driving most of the margin. Helped the team reprioritize shelf space for the next quarter.',
              tags: ['Excel', 'PivotTables', 'PowerPoint'],
            },
          ],
        },
        {
          kind: 'skills',
          label: 'Toolbox',
          groups: [
            { title: 'Strong', items: ['Excel', 'PowerPoint', 'Data cleaning'] },
            { title: 'Learning', items: ['SQL', 'Power BI', 'Python for analysts'] },
          ],
        },
      ],
    },
  },
  {
    slug: 'alex-m',
    category: 'tech-mid',
    categoryLabel: 'CS · Mid',
    name: 'Alex M.',
    school: 'Western · Computer Science · 3rd Year',
    targetRole: 'Software Engineering Intern',
    context:
      'CS student with two real projects and real internship potential — but his projects were buried in a resume bullet list.',
    whyItWorks:
      'Projects go from three-word resume bullets to product cards. Recruiters instantly see what he built, how it works, and what stack he used — the signals they actually look for.',
    site: {
      url: 'alexmoreno.dev',
      tagline: 'CS @ Western. Building clean, useful apps.',
      summary:
        'Third-year Computer Science student at Western. Focused on frontend + full-stack internships.',
      availability: 'Available for Summer 2026 · Remote or Toronto',
      accent: {
        base: '#1d4ed8',
        tint: '#3b82f6',
        soft: '#eff6ff',
        ring: '#bfdbfe',
      },
      sections: [
        {
          kind: 'about',
          body: 'Third-year CS student at Western. I like building small, sharp products — the kind you actually want to use. I spent last year on IT Support for the faculty and still pull shifts at Tim Hortons on weekends.',
        },
        {
          kind: 'projects',
          label: 'Selected projects',
          items: [
            {
              title: 'Course Planner',
              description:
                'A web app that helps Western students map out their degree across semesters. Drag-and-drop terms, conflict detection, credit counter.',
              tags: ['React', 'TypeScript', 'Tailwind'],
            },
            {
              title: 'Weather',
              description:
                'A minimal weather dashboard with location search, hourly and 7-day forecast, and a single-keystroke city switch.',
              tags: ['JavaScript', 'OpenWeather API'],
            },
          ],
        },
        {
          kind: 'skills',
          label: 'Toolbox',
          groups: [
            { title: 'Comfortable', items: ['React', 'TypeScript', 'Python', 'Git'] },
            { title: 'Learning', items: ['Node.js', 'PostgreSQL', 'System design'] },
          ],
        },
      ],
    },
  },
  {
    slug: 'daniel-r',
    category: 'marketing',
    categoryLabel: 'Marketing · Strong',
    name: 'Daniel R.',
    school: 'UofT · Marketing · 3rd Year',
    targetRole: 'Product Marketing Intern',
    context:
      'Strong work across a Shopify internship, a SaaS startup, a newsletter, and a case study — all scattered across LinkedIn, Notion, and Substack.',
    whyItWorks:
      'Pulls scattered work — internships, newsletter, case study — into one place a hiring manager can read in 30 seconds. Makes a talented student feel like a full professional.',
    site: {
      url: 'danielreyes.com',
      tagline: 'Product marketer learning in public.',
      summary:
        'Third-year Marketing student at UofT. Product marketing, growth, and positioning for early-stage software.',
      availability: 'Open to Summer 2026 PMM roles',
      accent: {
        base: '#be123c',
        tint: '#f43f5e',
        soft: '#fff1f2',
        ring: '#fecdd3',
      },
      sections: [
        {
          kind: 'about',
          body: "Third-year Marketing student at UofT, focused on how early-stage software finds its first real audience. I write a weekly newsletter unpacking real product launches, and I work with founders on positioning, copy, and launch plans.",
        },
        {
          kind: 'experience',
          label: 'Selected work',
          items: [
            {
              role: 'Growth Intern',
              org: 'Shopify',
              period: 'Summer 2025',
              summary:
                'Supported the merchant-growth team on lifecycle experiments and landing-page copy tests.',
            },
            {
              role: 'Marketing Associate',
              org: 'Seed-stage SaaS startup',
              period: '2024 — Present',
              summary:
                'Owned newsletter, docs rewrites, and two product-launch campaigns end-to-end.',
            },
          ],
        },
        {
          kind: 'cases',
          label: 'Selected case study',
          items: [
            {
              title: 'How a B2B SaaS launch grew MQLs 3x in 8 weeks',
              description:
                'Repositioning → landing page → lifecycle sequence → paid retargeting. A walkthrough of the full playbook, including what worked and what didn\'t.',
              tags: ['Positioning', 'Lifecycle', 'Paid'],
            },
          ],
        },
        {
          kind: 'writing',
          label: 'Writing',
          items: [
            {
              title: 'The Go-to-Market Notebook',
              description:
                'A weekly newsletter unpacking real product launches — what they said, what they changed, and what happened next.',
              tags: ['Newsletter', 'Weekly'],
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'emily-c',
    category: 'science',
    categoryLabel: 'Life Sciences · Strong',
    name: 'Emily C.',
    school: 'UofT · Life Sciences · 3rd Year',
    targetRole: 'Research Assistant · Med School Applicant',
    context:
      'Solid research foundation at a major hospital and a real literature review — but her resume reads like a wall of academic text.',
    whyItWorks:
      'A dense academic block becomes a clean research portfolio. Her literature review gets its own readable page. Program directors and PIs get exactly what they need, fast.',
    site: {
      url: 'emilychen.science',
      tagline: 'Life Sciences @ UofT. Interested in translational research.',
      summary:
        "Third-year Life Sciences student at UofT, working at a UHN lab on gene-expression profiling in cancer tissue.",
      availability: 'Applying to MD/PhD programs · 2027 cycle',
      accent: {
        base: '#047857',
        tint: '#10b981',
        soft: '#ecfdf5',
        ring: '#a7f3d0',
      },
      sections: [
        {
          kind: 'about',
          body: "Third-year Life Sciences student at the University of Toronto. My interests sit at the translational edge — moving molecular tools out of the lab and into clinical decisions. I currently work as a research assistant at a UHN lab.",
        },
        {
          kind: 'research',
          label: 'Research',
          items: [
            {
              title: 'Research Assistant · University Health Network',
              description:
                'Gene-expression profiling in breast-cancer tissue samples. Sample prep, qPCR, and downstream analysis. Currently supporting a longitudinal dataset of 80+ patients.',
              tags: ['PCR / qPCR', 'Western Blot', 'Cell culture'],
            },
          ],
        },
        {
          kind: 'writing',
          label: 'Writing',
          items: [
            {
              title: 'PCR-based diagnostic methods for early-stage cancers',
              description:
                'A literature review covering the last decade of PCR-based early-detection methods, their sensitivity trade-offs, and where the field is heading.',
              tags: ['Literature Review', '2025'],
            },
          ],
        },
        {
          kind: 'skills',
          label: 'Lab toolkit',
          groups: [
            { title: 'Wet lab', items: ['PCR / qPCR', 'Western blot', 'Cell culture', 'Microscopy'] },
            { title: 'Dry lab', items: ['R', 'GraphPad Prism', 'ImageJ'] },
          ],
        },
      ],
    },
  },
  {
    slug: 'michael-t',
    category: 'alumni',
    categoryLabel: 'Recent Graduate · Accounting',
    name: 'Michael T.',
    school: 'York · Accounting · Graduated 2025',
    targetRole: 'Junior Accountant · CPA Candidate',
    context:
      'Recent grad job-searching in a crowded field. AP clerk + CPA intern experience — but on paper it blends right in with every other new grad resume.',
    whyItWorks:
      'In a stack of near-identical accounting resumes, this is the one a recruiter actually clicks. Same experience — but structured, scannable, and impossible to confuse with anyone else.',
    site: {
      url: 'michaeltran.ca',
      tagline: 'Junior Accountant · CPA candidate.',
      summary:
        'Recent York Accounting grad, CPA candidate with two years of real AP and audit-support experience.',
      availability: 'Open to Junior Accountant roles · Toronto',
      accent: {
        base: '#334155',
        tint: '#64748b',
        soft: '#f8fafc',
        ring: '#cbd5e1',
      },
      sections: [
        {
          kind: 'about',
          body: "Recent York Accounting graduate. CPA candidate. I've spent the last two years doing real finance work — AP processing at a mid-size private company and a summer as a CPA intern supporting audit and advisory engagements.",
        },
        {
          kind: 'experience',
          label: 'Experience',
          items: [
            {
              role: 'CPA Intern',
              org: 'Mid-size accounting firm',
              period: 'Summer 2025',
              summary:
                'Supported audit and advisory engagements across three private clients. Reconciliations, working-paper prep, and closing-schedule review.',
            },
            {
              role: 'Accounts Payable Clerk',
              org: 'Private company · Toronto',
              period: '2023 – 2024',
              summary:
                'Owned the full AP cycle for ~400 invoices/month. Rebuilt the approval workflow and cut month-end close by 2 days.',
            },
          ],
        },
        {
          kind: 'cases',
          label: 'Selected analysis',
          items: [
            {
              title: 'Three-year margin review for a specialty retailer',
              description:
                'Built a monthly P&L rebuild and margin-decomposition model to identify where gross margin actually came from — and where it had quietly eroded.',
              tags: ['Excel', 'Financial modeling', 'Margin analysis'],
            },
          ],
        },
        {
          kind: 'skills',
          label: 'Toolbox',
          groups: [
            { title: 'Software', items: ['Excel (advanced)', 'QuickBooks', 'Sage', 'Xero'] },
            { title: 'Technical', items: ['Financial modeling', 'Reconciliations', 'Working papers'] },
          ],
        },
      ],
    },
  },
];

export function getProfile(slug: string): Profile | undefined {
  return profiles.find((p) => p.slug === slug);
}

export const LANDING_SLUGS = ['marcus-l', 'priya-k', 'daniel-r'];

export const FULL_ORDER = [
  'marcus-l',
  'jordan-s',
  'priya-k',
  'alex-m',
  'daniel-r',
  'emily-c',
  'michael-t',
];
