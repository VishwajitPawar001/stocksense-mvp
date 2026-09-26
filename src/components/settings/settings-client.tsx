"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Plus, Trash2 } from "lucide-react";
import { deleteWarehouse, deleteLocation } from "@/actions/settings";
import { NewWarehouseModal } from "./new-warehouse-modal";
import { NewLocationModal } from "./new-location-modal";

interface Warehouse {
  id: number;
  name: string;
  short_code: string;
  address?: string;
}

interface LocationItem {
  id: number;
  location_name: string;
  warehouse_id: number;
  warehouse_name: string;
  warehouse_code: string;
}

interface SettingsClientProps {
  warehouses: Warehouse[];
  locations: LocationItem[];
}

export function SettingsClient({ warehouses, locations }: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"warehouses" | "locations">("warehouses");
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [deletingWhId, setDeletingWhId] = useState<number | null>(null);
  const [deletingLocId, setDeletingLocId] = useState<number | null>(null);

  async function handleDeleteWarehouse(id: number, name: string) {
    if (!window.confirm(`Are you sure you want to delete warehouse "${name}" and all its internal racks?`)) return;
    setDeletingWhId(id);
    await deleteWarehouse(id);
    setDeletingWhId(null);
    router.refresh();
  }

  async function handleDeleteLocation(id: number, name: string) {
    if (!window.confirm(`Are you sure you want to delete rack location "${name}"?`)) return;
    setDeletingLocId(id);
    await deleteLocation(id);
    setDeletingLocId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Warehouse & Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage multi-warehouse facilities, internal zones, racks, and shelving units
          </p>
        </div>

        {activeTab === "warehouses" ? (
          <button
            onClick={() => setIsWarehouseModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add Warehouse
          </button>
        ) : (
          <button
            onClick={() => setIsLocationModalOpen(true)}
            disabled={warehouses.length === 0}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add Location / Rack
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("warehouses")}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === "warehouses"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Warehouses ({warehouses.length})
        </button>

        <button
          onClick={() => setActiveTab("locations")}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === "locations"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Locations & Racks ({locations.length})
        </button>
      </div>

      {/* Tab 1: Warehouses */}
      {activeTab === "warehouses" && (
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Short Code</th>
                <th className="px-6 py-4">Warehouse Name</th>
                <th className="px-6 py-4">Address / Zone</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {warehouses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No warehouses configured</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "+ Add Warehouse" above to add your primary depot.
                    </p>
                  </td>
                </tr>
              ) : (
                warehouses.map((wh) => (
                  <tr key={wh.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                      {wh.short_code}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {wh.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {wh.address || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteWarehouse(wh.id, wh.name)}
                        disabled={deletingWhId === wh.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50 cursor-pointer"
                        title="Delete Warehouse"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Locations & Racks */}
      {activeTab === "locations" && (
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Warehouse</th>
                <th className="px-6 py-4">Rack / Shelf / Zone Name</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No racks or internal locations configured</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {warehouses.length === 0
                        ? "First add a warehouse in the Warehouses tab."
                        : 'Click "+ Add Location / Rack" to configure storage zones.'}
                    </p>
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded mr-2">
                        {loc.warehouse_code}
                      </span>
                      {loc.warehouse_name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-700">
                      {loc.location_name}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteLocation(loc.id, loc.location_name)}
                        disabled={deletingLocId === loc.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50 cursor-pointer"
                        title="Delete Location"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <NewWarehouseModal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <NewLocationModal
        warehouses={warehouses}
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
