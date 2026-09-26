import { getMoveHistory } from "@/actions/history";
import { HistoryClient } from "@/components/history/history-client";

export default async function HistoryPage() {
  const { success, history, error } = await getMoveHistory();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <HistoryClient initialHistory={history || []} />
      )}
    </div>
  );
}
