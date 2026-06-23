import type { ReactNode } from 'react';

interface PageCardProps {
  children: ReactNode;
  className?: string;
}

export default function PageCard({ children, className = '' }: PageCardProps) {
  return (
    <div
      className={`w-full max-w-lg rounded-3xl bg-white p-4 shadow-[0_4px_3px_rgba(99,102,241,0.08),0_20px_20px_rgba(99,102,241,0.15)] sm:p-7 ${className}`}
    >
      {children}
    </div>
  );
}
