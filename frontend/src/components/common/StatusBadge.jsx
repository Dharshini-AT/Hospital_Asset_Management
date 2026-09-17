const statusStyles = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },

  ASSIGNED: {
    label: "Assigned",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
    dot: "bg-blue-500",
  },

  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-violet-50 text-violet-700 ring-violet-200",
    dot: "bg-violet-500",
  },

  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },

  AVAILABLE: {
    label: "Available",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },

  UNDER_MAINTENANCE: {
    label: "Under Maintenance",
    className: "bg-orange-50 text-orange-700 ring-orange-200",
    dot: "bg-orange-500",
  },

  OUT_OF_SERVICE: {
    label: "Out of Service",
    className: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },

  ACTIVE: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },

  BUSY: {
    label: "Busy",
    className: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },
};

const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toUpperCase();

  const config = statusStyles[normalizedStatus] || {
    label: status || "Unknown",
    className: "bg-slate-50 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;