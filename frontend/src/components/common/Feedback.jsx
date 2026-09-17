import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const Alert = ({ type = 'error', children, onClose }) => {
  const styles = {
    error: 'border-red-100 bg-red-50 text-red-700',
    success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    info: 'border-blue-100 bg-blue-50 text-blue-700',
  };
  const Icon = type === 'success' ? CheckCircle2 : type === 'info' ? Info : AlertCircle;
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-xs ${styles[type]}`}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
      {onClose && <button onClick={onClose} className="opacity-60 hover:opacity-100"><X size={14} /></button>}
    </div>
  );
};

export const LoadingBlock = ({ text = 'Loading data...' }) => (
  <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="text-center">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      <p className="mt-3 text-xs text-slate-400">{text}</p>
    </div>
  </div>
);

export const EmptyBlock = ({ title = 'No records found', text = 'There is nothing to display yet.' }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400"><Info size={20} /></div>
    <h3 className="mt-4 text-sm font-bold text-slate-700">{title}</h3>
    <p className="mt-1 text-xs text-slate-400">{text}</p>
  </div>
);
