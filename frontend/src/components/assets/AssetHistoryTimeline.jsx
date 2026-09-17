import {
  CheckCircle2,
  Clock3,
  Wrench,
} from "lucide-react";

const AssetHistoryTimeline = ({ history = [] }) => {
  if (!history.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          <Clock3 size={21} />
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-600">
          No maintenance history
        </p>

        <p className="mt-1 text-[10px] text-slate-400">
          Maintenance records will appear here after completed service.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-sm font-bold text-[#09284d]">
          Maintenance History
        </h2>

        <p className="mt-1 text-[10px] text-slate-400">
          Permanent service records for this asset
        </p>
      </div>

      <div className="relative">
        <div className="absolute bottom-4 left-[15px] top-4 w-px bg-slate-200" />

        <div className="space-y-7">
          {history.map((item, index) => (
            <div
              key={item.historyId || index}
              className="relative flex gap-4"
            >
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white shadow-sm">
                <CheckCircle2 size={13} />
              </div>

              <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#09284d]">
                      {item.maintenanceType ||
                        "Maintenance Service"}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {item.maintenanceDate
                        ? new Date(
                            item.maintenanceDate
                          ).toLocaleDateString("en-IN")
                        : "Date unavailable"}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-600">
                    Completed
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <HistoryItem
                    label="Issue"
                    value={item.issueDescription}
                  />

                  <HistoryItem
                    label="Diagnosis"
                    value={item.diagnosis}
                  />

                  <HistoryItem
                    label="Work Performed"
                    value={item.workPerformed}
                  />

                  <HistoryItem
                    label="Technician"
                    value={item.technicianId?.name || item.technicianId?.userId || item.technicianId}
                  />

                  <HistoryItem
                    label="Downtime"
                    value={
                      item.downtime !== undefined &&
                      item.downtime !== null
                        ? `${item.downtime} hours`
                        : "—"
                    }
                  />

                  <HistoryItem
                    label="Maintenance Cost"
                    value={
                      item.maintenanceCost !== undefined &&
                      item.maintenanceCost !== null
                        ? `₹${Number(
                            item.maintenanceCost
                          ).toLocaleString("en-IN")}`
                        : "—"
                    }
                  />
                </div>

                {item.remarks && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                      Remarks
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-slate-600">
                      {item.remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HistoryItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-[9px] font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-1 line-clamp-2 text-[10px] font-medium text-slate-600">
        {value || "—"}
      </p>
    </div>
  );
};

export default AssetHistoryTimeline;