import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'blue' | 'purple' | 'red' | 'green';

const variants: Record<Variant, string> = {
  blue: 'bg-gradient-to-br from-[#5b6bf5] to-[#818cf8] shadow-[0_8px_12px_rgba(79,70,229,0.35)]',
  purple: 'bg-gradient-to-br from-[#7c6ff7] to-[#a78bfa] shadow-[0_8px_12px_rgba(124,111,247,0.35)]',
  red: 'bg-[#ef4444] shadow-[0_8px_12px_rgba(239,68,68,0.35)]',
  green: 'bg-[#16a34a] shadow-[0_8px_12px_rgba(22,163,74,0.35)]',
};

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
}

export default function GradientButton({
  children,
  variant = 'blue',
  fullWidth = true,
  className = '',
  disabled,
  ...props
}: GradientButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`rounded-2xl px-4 py-4 font-[family-name:var(--font-inter)] text-sm font-bold tracking-[0.15em] text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
