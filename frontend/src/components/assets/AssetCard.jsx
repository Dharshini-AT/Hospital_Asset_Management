import {
  CalendarDays,
  ChevronRight,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge";

const AssetCard = ({ asset, onView }) => {
  return (
    <div
      onClick={() => onView(asset)}
      className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <span className="text-xs font-bold">
              {asset.assetName
                ?.split(" ")
                .map((word) => word[0])
                .join("")
                .substring(0, 2)
                .toUpperCase() || "AS"}
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-[#09284d]">
              {asset.assetName}
            </p>

            <p className="mt-1 text-[10px] font-semibold text-blue-600">
              {asset.assetId}
            </p>
          </div>
        </div>

        <ChevronRight
          size={17}
          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500"
        />
      </div>

      <div className="mt-5">
        <StatusBadge status={asset.currentStatus} />
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-slate-400" />

          <span className="text-[10px] text-slate-600">
            {asset.location || "Location not available"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-slate-400" />

          <span className="text-[10px] text-slate-600">
            Next maintenance:{" "}
            {asset.nextMaintenanceDate
              ? new Date(
                  asset.nextMaintenanceDate
                ).toLocaleDateString("en-IN")
              : "Not scheduled"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-slate-400" />

          <span className="text-[10px] text-slate-600">
            Condition:{" "}
            <span className="font-semibold capitalize">
              {asset.currentCondition || "Unknown"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;