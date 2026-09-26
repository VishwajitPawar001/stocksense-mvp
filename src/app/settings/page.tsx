import { Building2, MapPin, Plus, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Warehouse & System Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure multi-warehouse facilities, rack locations, and reordering rules.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Warehouses Section */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Warehouses</h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              1 Active
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-slate-900">Main Warehouse</span>
              <span className="font-mono text-xs text-slate-500">WH01</span>
            </div>
            <p className="text-xs text-slate-500">Primary Logistics Hub & Distribution Center</p>
          </div>

          <p className="text-xs text-slate-400">
            Assigned to <strong>Track 3 (Partner 2)</strong> for warehouse CRUD modals.
          </p>
        </div>

        {/* Locations & Racks Section */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Locations & Racks</h2>
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-800">Main Store / Shelf A</span>
              <span className="text-slate-500 font-mono">WH01-RACK-A</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-800">Production Floor</span>
              <span className="text-slate-500 font-mono">WH01-PROD-01</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Assigned to <strong>Track 3 (Partner 2)</strong> for rack location creation.
          </p>
        </div>
      </div>
    </div>
  );
}
