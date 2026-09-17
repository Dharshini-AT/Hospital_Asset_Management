import {
  ChevronRight,
  MapPin,
  MoreHorizontal,
  ShieldCheck,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge";

const AssetTable = ({ assets, onView }) => {
  if (!assets || assets.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <ShieldCheck size={25} />
        </div>

        <h3 className="text-sm font-bold text-slate-700">
          No assets found
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Try changing your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* TABLE HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-[#09284d]">
            Hospital Assets
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
            Current asset information
          </p>
        </div>

        <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-600">
          {assets.length} Assets
        </span>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Asset
              </th>

              <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Category
              </th>

              <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Location
              </th>

              <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Warranty
              </th>

              <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Condition
              </th>

              <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Status
              </th>

              <th className="px-4 py-3" />
            </tr>
          </thead>

          <tbody>
            {assets.map((asset) => (
              <tr
                key={asset.assetId}
                onClick={() => onView(asset)}
                className="group cursor-pointer border-b border-slate-50 transition-all duration-200 hover:bg-blue-50/30"
              >
                {/* ASSET */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 transition-transform duration-300 group-hover:scale-105">
                      <span className="text-[11px] font-bold">
                        {asset.assetName
                          ?.split(" ")
                          .map((word) => word[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase() || "AS"}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#09284d]">
                        {asset.assetName}
                      </p>

                      <p className="mt-0.5 text-[10px] font-semibold text-blue-600">
                        {asset.assetId}
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-400">
                        {asset.manufacturer} • {asset.model}
                      </p>
                    </div>
                  </div>
                </td>

                {/* CATEGORY */}
                <td className="px-4 py-4">
                  <p className="text-[10px] font-semibold text-slate-600">
                    {asset.category || "—"}
                  </p>

                  <p className="mt-1 text-[9px] text-slate-400">
                    {asset.assetType || "—"}
                  </p>
                </td>

                {/* LOCATION */}
                <td className="px-4 py-4">
                  <div className="flex items-start gap-1.5">
                    <MapPin
                      size={12}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div>
                      <p className="text-[10px] font-medium text-slate-600">
                        {asset.location || "—"}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400">
                        {asset.department || "—"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* WARRANTY */}
                <td className="px-4 py-4">
                  <p className="text-[10px] font-medium text-slate-600">
                    {asset.warrantyEndDate
                      ? new Date(
                          asset.warrantyEndDate
                        ).toLocaleDateString("en-IN")
                      : "—"}
                  </p>

                  <p className="mt-1 text-[9px] text-slate-400">
                    Warranty end
                  </p>
                </td>

                {/* CONDITION */}
                <td className="px-4 py-4">
                  <p className="text-[10px] font-semibold capitalize text-slate-600">
                    {asset.currentCondition || "—"}
                  </p>
                </td>

                {/* STATUS */}
                <td className="px-4 py-4">
                  <StatusBadge status={asset.currentStatus} />
                </td>

                {/* ACTION */}
                <td className="px-4 py-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(asset);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                  >
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <p className="text-[9px] text-slate-400">
          Showing {assets.length} asset{assets.length !== 1 ? "s" : ""}
        </p>

        <button className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700">
          View Details
          <MoreHorizontal size={13} />
        </button>
      </div>
    </div>
  );
};

export default AssetTable;