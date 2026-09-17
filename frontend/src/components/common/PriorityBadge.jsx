const priorityStyles = {
  LOW: {
    label: "Low",
    className: "bg-slate-50 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  },

  MEDIUM: {
    label: "Medium",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
    dot: "bg-blue-500",
  },

  HIGH: {
    label: "High",
    className: "bg-orange-50 text-orange-700 ring-orange-200",
    dot: "bg-orange-500",
  },

  CRITICAL: {
    label: "Critical",
    className: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },
};

const PriorityBadge = ({ priority }) => {
  const normalized = priority?.toUpperCase();

  const config =
    priorityStyles[normalized] || {
      label: priority || "Unknown",
      className: "bg-slate-50 text-slate-600 ring-slate-200",
      dot: "bg-slate-400",
    };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5

        rounded-full
        px-2.5
        py-1

        text-[10px]
        font-bold

        ring-1
        ring-inset

        ${config.className}
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${config.dot}
        `}
      />

      {config.label}
    </span>
  );
};

export default PriorityBadge;