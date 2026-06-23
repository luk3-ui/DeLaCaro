import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import PageCard from '../components/ui/PageCard';
import GradientButton from '../components/ui/GradientButton';
import CashStatusBadge from '../components/ui/CashStatusBadge';
import { subpageContentClass } from '../components/layout/subpageContent';
import { useCashStore } from '../stores/cashStore';
import * as cashService from '../services/cashService';
import { formatCurrency } from '../utils/format';

function SummaryRow({
  label,
  value,
  bold,
  border,
}: {
  label: string;
  value: string;
  bold?: boolean;
  border?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-3 ${border ? 'border-b border-[#f0f0f8]' : ''}`}
    >
      <span className="shrink-0 text-sm text-pos-muted sm:text-base">{label}</span>
      <span
        className={`text-right ${bold ? 'text-xl font-bold text-pos-ink sm:text-2xl' : 'font-semibold text-pos-ink'}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function CloseCashPage() {
  const navigate = useNavigate();
  const { session, closeSession, loading } = useCashStore();
  const [summary, setSummary] = useState({ total: 0, cash: 0, qr: 0, card: 0, count: 0 });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (session) {
      cashService.getSessionSummary(session.id).then(setSummary).finally(() => setLoadingSummary(false));
    } else {
      setLoadingSummary(false);
    }
  }, [session]);

  const handleClose = async () => {
    try {
      await closeSession();
      setClosed(true);
      setShowConfirm(false);
    } catch {
      // error in store
    }
  };

  if (loadingSummary) return <Loader />;

  if (!session && !closed) {
    return (
      <div className={`${subpageContentClass} max-w-lg py-12`}>
        <p className="text-center text-lg text-pos-muted">No hay caja abierta</p>
        <GradientButton fullWidth={false} className="px-8" onClick={() => navigate('/open')}>
          Abrir Caja
        </GradientButton>
      </div>
    );
  }

  if (closed) {
    return (
      <div className={`${subpageContentClass} max-w-lg py-8`}>
        <div className="text-center">
          <div className="mb-4 text-6xl text-[#05df72]">✓</div>
          <h2 className="text-2xl font-bold text-pos-ink">Caja Cerrada</h2>
          <p className="mt-2 text-pos-muted">Resumen guardado correctamente</p>
        </div>
        <PageCard>
          <SummaryRow label="Total vendido" value={formatCurrency(summary.total)} bold />
          <SummaryRow label="Operaciones" value={String(summary.count)} />
        </PageCard>
        <GradientButton onClick={() => navigate('/')}>Volver al inicio</GradientButton>
      </div>
    );
  }

  return (
    <div className={`${subpageContentClass} max-w-md sm:gap-12`}>
      <PageCard className="max-w-md">
        <SummaryRow label="Ventas" value={formatCurrency(summary.total)} bold border />
        <SummaryRow label="Efectivo" value={formatCurrency(summary.cash)} />
        <SummaryRow label="QR" value={formatCurrency(summary.qr)} />
        <SummaryRow label="Tarjeta" value={formatCurrency(summary.card)} />
        <div className="mt-2 border-t border-[#f0f0f8] pt-2">
          <SummaryRow label="Operaciones" value={String(summary.count)} bold />
        </div>
        <div className="mt-6">
          <GradientButton variant="red" onClick={() => setShowConfirm(true)} disabled={loading}>
            {loading ? 'Cerrando...' : 'CERRAR CAJA'}
          </GradientButton>
        </div>
      </PageCard>
      <CashStatusBadge />

      <ConfirmDialog
        open={showConfirm}
        title="Confirmar Cierre"
        message="¿Estás seguro de cerrar la caja? No se podrán registrar más ventas hasta abrirla de nuevo."
        onConfirm={handleClose}
        onCancel={() => setShowConfirm(false)}
        confirmLabel="Cerrar Caja"
        danger
      />
    </div>
  );
}
