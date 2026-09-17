import { createPortal } from "react-dom";
import { AlertTriangle, Trash2 } from "lucide-react";
import Button from "./Button";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) => {
  if (!isOpen) {
    return null;
  }

  const isDanger = variant === "danger";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm transition-all"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative my-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            isDanger ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
          }`}
        >
          {isDanger ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
        </div>

        {/* Text */}
        <h2 className="mt-4 text-base font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;