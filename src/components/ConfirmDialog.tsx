interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  danger = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-pos-ink">{title}</h3>
        <p className="mt-2 text-pos-muted">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-[#e5e7eb] py-3 font-medium text-pos-ink hover:bg-[#f9fafb]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-2xl py-3 font-medium text-white ${
              danger
                ? 'bg-[#ef4444] hover:bg-[#dc2626]'
                : 'bg-gradient-to-br from-[#5b6bf5] to-[#818cf8] hover:opacity-95'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
