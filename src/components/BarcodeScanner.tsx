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
        placeholder="Escanear o buscar producto..."
        className="w-full px-4 py-4 text-lg border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        autoComplete="off"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
        Enter ↵
      </div>
    </div>
  );
}
