import { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]

        flex
        items-center
        justify-center

        bg-slate-950/40
        p-4

        backdrop-blur-sm

        animate-[fadeIn_0.2s_ease-out]
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >

      <div
        className={`
          w-full
          ${sizes[size] || sizes.md}

          overflow-hidden

          rounded-2xl

          border
          border-slate-200

          bg-white

          shadow-[0_25px_80px_rgba(15,23,42,0.18)]

          animate-[fadeInUp_0.25s_ease-out]
        `}
      >

        {/* Header */}
        <div
          className="
            flex
            items-start
            justify-between

            border-b
            border-slate-100

            px-5
            py-4
          "
        >

          <div>

            <h2
              className="
                text-base
                font-bold
                text-slate-800
              "
            >
              {title}
            </h2>

            {description && (
              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                {description}
              </p>
            )}

          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center

              rounded-lg

              text-slate-400

              transition-all
              duration-200

              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            <X size={17} />
          </button>

        </div>

        {/* Content */}
        <div className="max-h-[75vh] overflow-y-auto p-5">
          {children}
        </div>

      </div>

    </div>
  );
};

export default Modal;