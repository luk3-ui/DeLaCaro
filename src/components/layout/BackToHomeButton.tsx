import { Link } from 'react-router-dom';

export default function BackToHomeButton() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 rounded-[12px] bg-white px-3 py-2 text-xs font-bold text-pos-ink shadow-[0_2px_4px_rgba(45,43,107,0.1)] transition-colors active:bg-[#fafafa] sm:rounded-[14px] sm:px-4 sm:py-2.5 sm:text-sm"
    >
      <span aria-hidden className="text-lg leading-none text-[#5b6bf5]">
        ←
      </span>
      Menú principal
    </Link>
  );
}
