import { getWarehouses, getLocations } from "@/actions/settings";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const [whRes, locRes] = await Promise.all([
    getWarehouses(),
    getLocations(),
  ]);

  const warehouses = whRes.success && whRes.warehouses ? whRes.warehouses : [];
  const locations = locRes.success && locRes.locations ? locRes.locations : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SettingsClient warehouses={warehouses} locations={locations} />
    </div>
  );
}
