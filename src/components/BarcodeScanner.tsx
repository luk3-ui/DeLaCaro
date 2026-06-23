import { useRef, useEffect } from 'react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  disabled?: boolean;
}

export default function BarcodeScanner({ onScan, disabled }: BarcodeScannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value.trim();
      if (value) {
        onScan(value);
        e.currentTarget.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        onKeyDown={handleKeyDown}
        placeholder="Escanear o buscar..."
        className="w-full rounded-2xl border-2 border-[#c7d2fe] bg-white px-4 py-3.5 pr-3 text-base text-pos-ink placeholder:text-pos-muted focus:border-[#818cf8] focus:outline-none focus:ring-2 focus:ring-[#e0e7ff] disabled:cursor-not-allowed disabled:bg-[#f5f7ff] sm:py-4 sm:pr-20 sm:text-lg"
        autoComplete="off"
      />
      <div className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 text-sm text-pos-muted sm:block">
        Enter ↵
      </div>
    </div>
  );
}
