const groups = [
  {
    title: 'Outbound & Prospecting',
    items: [
      'Cold Calling',
      'LinkedIn Outreach',
      'Email Sequences',
      'Multi-channel Cadences',
      'Discovery',
      'Objection Handling',
    ],
  },
  {
    title: 'Pipeline & Process',
    items: [
      'Pipeline Management',
      'Territory Planning',
      'Meeting Booking',
      'Funnel Advancement',
      'Forecasting',
    ],
  },
  {
    title: 'Tools',
    items: [
      'Salesforce',
      'HubSpot',
      'Shopify',
      'LinkedIn Sales Navigator',
      'Microsoft 365',
    ],
  },
  {
    title: 'Strengths',
    items: [
      'Relationship Building',
      'Coachability',
      'Time Management',
      'Accountability',
      'Hustle',
    ],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="section">
      <div className="container-pro">
        <div className="max-w-3xl">
          <span className="eyebrow">Skills</span>
          <h2 className="section-title mt-5">The BDR toolkit</h2>
          <p className="section-kicker">
            The playbook behind the pipeline — grounded in activity, repeatable
            process, and the tools top SDR teams actually use.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {groups.map((g) => (
            <div key={g.title} className="card card-hover h-full">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-deep">
                {g.title}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
