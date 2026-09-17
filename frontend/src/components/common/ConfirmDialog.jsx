import {
  AlertTriangle,
  Trash2,
  CheckCircle2,
} from "lucide-react";

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

  return (
    <div
      className="
        fixed
        inset-0
        z-[110]

        flex
        items-center
        justify-center

        bg-slate-950/40

        p-4

        backdrop-blur-sm
      "
    >

      <div
        className="
          w-full
          max-w-md

          overflow-hidden

          rounded-2xl

          border
          border-slate-200

          bg-white

          shadow-[0_25px_80px_rgba(15,23,42,0.18)]

          animate-[fadeInUp_0.25s_ease-out]
        "
      >

        <div className="p-6">

          {/* Icon */}
          <div
            className={`
              flex
              h-12
              w-12
              items-center
              justify-center

              rounded-xl

              ${
                isDanger
                  ? "bg-red-50 text-red-600"
                  : "bg-blue-50 text-blue-600"
              }
            `}
          >
            {isDanger ? (
              <Trash2 size={22} />
            ) : (
              <AlertTriangle size={22} />
            )}
          </div>


          {/* Text */}
          <h2
            className="
              mt-4
              text-base
              font-bold
              text-slate-800
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            {message}
          </p>


          {/* Actions */}
          <div
            className="
              mt-6
              flex
              justify-end
              gap-3
            "
          >

            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </Button>

            <Button
              variant={variant}
              onClick={onConfirm}
              loading={loading}
            >
              {confirmText}
            </Button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ConfirmDialog;