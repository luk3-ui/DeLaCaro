interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onClear: () => void;
  onBackspace: () => void;
}

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export default function NumericKeypad({ onDigit, onClear, onBackspace }: NumericKeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onDigit(key)}
          className="flex h-12 items-center justify-center rounded-2xl bg-[#f5f7ff] font-[family-name:var(--font-inter)] text-lg font-bold text-[#1e2939] transition-colors active:bg-[#e8edff] sm:h-12 sm:hover:bg-[#e8edff]"
        >
          {key}
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="flex h-12 items-center justify-center rounded-2xl bg-[#fef2f2] font-[family-name:var(--font-inter)] text-lg font-bold text-[#ff6467] transition-colors hover:bg-[#fee2e2]"
      >
        C
      </button>
      <button
        type="button"
        onClick={() => onDigit('0')}
        className="flex h-12 items-center justify-center rounded-2xl bg-[#f5f7ff] font-[family-name:var(--font-inter)] text-lg font-bold text-[#1e2939] transition-colors hover:bg-[#e8edff]"
      >
        0
      </button>
      <button
        type="button"
        onClick={onBackspace}
        className="flex h-12 items-center justify-center rounded-2xl bg-[#f3f4f6] font-[family-name:var(--font-inter)] text-lg font-bold text-[#6a7282] transition-colors hover:bg-[#e5e7eb]"
        aria-label="Borrar"
      >
        ⌫
      </button>
    </div>
  );
}
