type Props = {
  className?: string;
  variant?: 'dark' | 'light';
  showWordmark?: boolean;
};

export default function Logo({ className = '', variant = 'dark', showWordmark = true }: Props) {
  const fg = variant === 'dark' ? '#0a0a0b' : '#ffffff';
  const subtle = variant === 'dark' ? 'rgba(10,10,11,0.55)' : 'rgba(255,255,255,0.7)';
  return (
    <div className={`flex items-center gap-2.5 ${className}`} aria-label="HirePage logo">
      <svg
        width="32"
        height="32"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="60" height="60" rx="14" fill={fg} />
        <rect
          x="2.5"
          y="2.5"
          width="59"
          height="59"
          rx="13.5"
          stroke={variant === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}
        />
        {/* H */}
        <rect x="16" y="18" width="4.5" height="28" rx="1.2" fill={variant === 'dark' ? '#ffffff' : '#0a0a0b'} />
        <rect x="28" y="18" width="4.5" height="28" rx="1.2" fill={variant === 'dark' ? '#ffffff' : '#0a0a0b'} />
        <rect x="20" y="30" width="8.5" height="4" rx="1" fill={variant === 'dark' ? '#ffffff' : '#0a0a0b'} />
        {/* P */}
        <rect x="38" y="18" width="4.5" height="28" rx="1.2" fill={variant === 'dark' ? '#ffffff' : '#0a0a0b'} />
        <path
          d="M42.5 18h6a5.5 5.5 0 0 1 0 11h-6V18Z"
          fill={variant === 'dark' ? '#ffffff' : '#0a0a0b'}
        />
        <circle cx="48.5" cy="23.5" r="2.2" fill={fg} />
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
