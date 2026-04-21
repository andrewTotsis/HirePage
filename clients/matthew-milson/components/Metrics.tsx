const stats = [
  {
    value: '$1.1M+',
    label: 'In insurance premiums influenced at RBC',
  },
  {
    value: '1,500+',
    label: 'Client territory managed',
  },
  {
    value: '15+',
    label: 'Daily outbound calls, sustained',
  },
  {
    value: '3+ yrs',
    label: 'Across BDR, inside sales & AE support',
  },
];

export default function Metrics() {
  return (
    <section className="border-y border-slate-200 bg-slate-50/70">
      <div className="container-pro grid grid-cols-2 gap-6 py-10 md:grid-cols-4 md:gap-8 md:py-14">
        {stats.map((s) => (
          <div key={s.label} className="animate-fade-up">
            <div className="metric">{s.value}</div>
            <div className="metric-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
