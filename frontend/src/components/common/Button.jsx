import {
  Loader2,
  Plus,
  Save,
  Search,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const variants = {
  primary: `
    bg-blue-600
    text-white
    shadow-lg
    shadow-blue-600/20
    hover:bg-blue-700
    hover:shadow-blue-600/30
  `,

  secondary: `
    bg-slate-100
    text-slate-700
    hover:bg-slate-200
  `,

  outline: `
    border
    border-slate-200
    bg-white
    text-slate-700
    hover:border-blue-300
    hover:bg-blue-50
    hover:text-blue-600
  `,

  danger: `
    bg-red-600
    text-white
    shadow-lg
    shadow-red-600/20
    hover:bg-red-700
  `,

  success: `
    bg-emerald-600
    text-white
    shadow-lg
    shadow-emerald-600/20
    hover:bg-emerald-700
  `,

  ghost: `
    text-slate-600
    hover:bg-slate-100
    hover:text-blue-600
  `,
};

const sizes = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

const iconMap = {
  add: Plus,
  save: Save,
  search: Search,
  next: ArrowRight,
  refresh: RefreshCw,
};

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  onClick,
}) => {
  const Icon = typeof icon === 'function' ? icon : iconMap[icon];

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        font-semibold

        transition-all
        duration-200

        active:scale-[0.98]

        disabled:cursor-not-allowed
        disabled:opacity-60

        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}

        ${fullWidth ? "w-full" : ""}

        ${className}
      `}
    >
      {loading ? (
        <Loader2
          size={16}
          className="animate-spin"
        />
      ) : (
        Icon && <Icon size={16} />
      )}

      {loading ? "Please wait..." : children}
    </button>
  );
};

export default Button;