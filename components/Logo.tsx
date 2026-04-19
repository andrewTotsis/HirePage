type Props = {
  className?: string;
  variant?: 'dark' | 'light';
  showWordmark?: boolean;
  size?: number;
};

export default function Logo({
  className = '',
  variant = 'dark',
  showWordmark = true,
  size = 30,
}: Props) {
  const id = variant === 'dark' ? 'hp-grad-dark' : 'hp-grad-light';
  const fg = variant === 'dark' ? '#0a0a0b' : '#ffffff';
  const subtle = variant === 'dark' ? 'rgba(10,10,11,0.55)' : 'rgba(255,255,255,0.7)';

  return (
    <div className={`flex items-center gap-2.5 ${className}`} aria-label="HirePage logo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={id} x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1f2330" />
            <stop offset="1" stopColor="#07070a" />
          </linearGradient>
          <radialGradient id={`${id}-sheen`} cx="32" cy="0" r="40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-glow`} cx="50" cy="52" r="8" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#22c55e" stopOpacity="0.45" />
            <stop offset="1" stopColor="#22c55e" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="64" height="64" rx="14" fill={`url(#${id})`} />
        <rect x="0" y="0" width="64" height="64" rx="14" fill={`url(#${id}-sheen)`} />
        <rect
          x="0.5"
          y="0.5"
          width="63"
          height="63"
          rx="13.5"
          stroke="rgba(255,255,255,0.10)"
        />

        <text
          x="32"
          y="42"
          textAnchor="middle"
          fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
          fontWeight="700"
          fontSize="26"
          letterSpacing="-1"
          fill="#ffffff"
        >
          HP
        </text>

        {/* status dot */}
        <circle cx="50" cy="52" r="8" fill={`url(#${id}-glow)`} />
        <circle cx="50" cy="52" r="3.2" fill="#22c55e" />
        <circle cx="48.8" cy="50.9" r="0.9" fill="#ffffff" opacity="0.7" />
      </svg>

      {showWordmark && (
        <span
          className="text-[17px] font-semibold tracking-tight"
          style={{ color: fg, letterSpacing: '-0.02em' }}
        >
          Hire<span style={{ color: subtle }}>Page</span>
        </span>
      )}
    </div>
  );
}
