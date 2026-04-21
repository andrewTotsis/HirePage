import Link from 'next/link';

export const FORM_URL = 'https://forms.fillout.com/t/39KHbwLLRHus';

type Props = {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  href?: string;
  ariaLabel?: string;
};

export default function CTAButton({
  children = 'Create My HirePage',
  variant = 'primary',
  className = '',
  href = FORM_URL,
  ariaLabel,
}: Props) {
  const cls = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  const isExternal = href.startsWith('http');
  const Tag: any = isExternal ? 'a' : Link;
  const extra = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <Tag
      href={href}
      className={`${cls} ${className}`}
      aria-label={ariaLabel || (typeof children === 'string' ? children : 'Create My HirePage')}
      {...extra}
    >
      <span>{children}</span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </Tag>
  );
}
