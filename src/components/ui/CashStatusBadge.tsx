import { useCashStore } from '../../stores/cashStore';

export default function CashStatusBadge() {
  const session = useCashStore((s) => s.session);

  if (session) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#dbfce7] px-2.5 py-2 sm:px-3">
        <span className="size-2.5 shrink-0 rounded-full bg-[#05df72]" />
        <span className="font-[family-name:var(--font-inter)] text-xs font-semibold tracking-wide text-[#016630]">
          CAJA ABIERTA
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ffd7d7] px-2.5 py-2 sm:px-3">
      <span className="size-2.5 shrink-0 rounded-full bg-[#ef4444]" />
      <span className="font-[family-name:var(--font-inter)] text-xs font-semibold tracking-wide text-[#971616]">
        CAJA CERRADA
      </span>
    </div>
  );
}
