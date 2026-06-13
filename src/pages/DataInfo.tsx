import { Button } from "@/components/ui/button";
import { StorageManager } from "@/lib/storage";
import { toast } from "@/components/ui/sonner";

const DataInfo = () => {
  const savedAt = StorageManager.getSavedAt();

  const clearData = () => {
    const confirmed = window.confirm("This will permanently remove your saved articles, notes, and containers. Continue?");
    if (!confirmed) return;

    const success = StorageManager.clear();
    if (success) {
      toast.success("Workspace data cleared");
      window.location.href = "/";
      return;
    }

    toast.error("Could not clear data");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Data storage information</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          Your workspace data is stored in your browser localStorage on this device/profile and is kept until you remove it.
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          It may also be removed if you clear browser/site data, use private/incognito mode, or the browser clears storage.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Last saved: {savedAt ? new Date(savedAt).toLocaleString() : "No saved data yet"}
        </p>

        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href="/">Back to workspace</a>
          </Button>
          <Button variant="destructive" onClick={clearData}>
            Clear saved data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataInfo;
