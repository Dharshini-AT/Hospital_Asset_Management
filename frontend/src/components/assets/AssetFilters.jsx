import {
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const AssetFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  category,
  setCategory,
  type,
  setType,
  onReset,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        
        {/* SEARCH */}
        <div className="relative w-full xl:max-w-md">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search asset ID, name, serial number..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {/* FILTER LABEL */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <SlidersHorizontal size={15} />

          Filters
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="UNDER_MAINTENANCE">
              Under Maintenance
            </option>
            <option value="OUT_OF_SERVICE">
              Out of Service
            </option>
            <option value="RETIRED">Retired</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="">All Categories</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Life Support">Life Support</option>
            <option value="Diagnostic">Diagnostic</option>
            <option value="Surgical">Surgical</option>
            <option value="Therapeutic">Therapeutic</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Imaging">Imaging</option>
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="">All Types</option>
            <option value="Infusion Pump">Infusion Pump</option>
            <option value="Ventilator">Ventilator</option>
            <option value="Patient Monitor">
              Patient Monitor
            </option>
            <option value="ECG Machine">ECG Machine</option>
            <option value="Defibrillator">Defibrillator</option>
            <option value="Pulse Oximeter">
              Pulse Oximeter
            </option>
            <option value="Ultrasound Machine">
              Ultrasound Machine
            </option>
            <option value="X-Ray Machine">
              X-Ray Machine
            </option>
          </select>

          <button
            type="button"
            onClick={onReset}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <RotateCcw size={14} />

            Reset
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-[10px] text-slate-400">
        <Filter size={13} />

        Search and filter hospital assets by their current information.
      </div>
    </div>
  );
};

export default AssetFilters;