import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendType = "up",
  iconStyle = "blue",
}) => {
  const styles = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    violet: {
      bg: "bg-violet-50",
      text: "text-violet-600",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-600",
    },
  };

  const style = styles[iconStyle] || styles.blue;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
      {/* Decorative glow */}
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-50 opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
            {value}
          </h2>

          {description && (
            <p className="mt-2 text-[11px] text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.bg} ${style.text} transition-transform duration-300 group-hover:scale-110`}
        >
          {Icon && <Icon size={21} />}
        </div>
      </div>

      {trend && (
        <div className="relative mt-4 flex items-center gap-1.5">
          <span
            className={`flex items-center gap-0.5 text-[11px] font-bold ${
              trendType === "up"
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {trendType === "up" ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}

            {trend}
          </span>

          <span className="text-[10px] text-slate-400">
            from last period
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;