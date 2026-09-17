import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Package,
  Wrench,
} from "lucide-react";

const AssetStatusCard = ({
  title,
  value,
  description,
  type = "total",
}) => {
  const config = {
    total: {
      icon: Package,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },

    available: {
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },

    maintenance: {
      icon: Wrench,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },

    outOfService: {
      icon: AlertCircle,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
    },

    retired: {
      icon: Clock3,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-500",
    },

    operational: {
      icon: Activity,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
  };

  const current = config[type] || config.total;
  const Icon = current.icon;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-50 transition-transform duration-500 group-hover:scale-150" />

      <div className="relative">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${current.iconBg} ${current.iconColor} transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon size={20} />
        </div>

        <p className="mt-4 text-[11px] font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold text-[#09284d]">
          {value}
        </p>

        {description && (
          <p className="mt-1 text-[9px] text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default AssetStatusCard;