import React, { useState, useEffect } from "react";
import { Gift, Plus, Trash2, Save, AlertCircle } from "lucide-react";
import supabase from "../../config/supabase-client";

export default function FreeDaysEditor() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch existing tiers
  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("free_days_tiers")
        .select("*")
        .order("min_days", { ascending: true });

      if (error) throw error;
      setTiers(data || []);
    } catch (err) {
      console.error("Error fetching tiers:", err);
      setError("Failed to load free days tiers");
    } finally {
      setLoading(false);
    }
  };

  const addTier = () => {
    const newTier = {
      id: `temp-${Date.now()}`,
      min_days: 1,
      free_days: 1,
      isNew: true,
    };
    setTiers([...tiers, newTier]);
  };

  const updateTier = (id, field, value) => {
    setTiers(
      tiers.map((tier) =>
        tier.id === id ? { ...tier, [field]: parseInt(value) || 0 } : tier
      )
    );
  };

  const removeTier = async (id) => {
    const tier = tiers.find((t) => t.id === id);

    if (tier?.isNew) {
      // Just remove from local state if it's a new unsaved tier
      setTiers(tiers.filter((t) => t.id !== id));
      return;
    }

    if (!confirm("Are you sure you want to delete this tier?")) return;

    try {
      const { error } = await supabase
        .from("free_days_tiers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setTiers(tiers.filter((t) => t.id !== id));
      setSuccess("Tier deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting tier:", err);
      setError("Failed to delete tier");
      setTimeout(() => setError(null), 3000);
    }
  };

  const saveTiers = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate tiers
      for (const tier of tiers) {
        if (tier.min_days < 1) {
          throw new Error("Minimum days must be at least 1");
        }
        if (tier.free_days < 1) {
          throw new Error("Free days must be at least 1");
        }
      }

      // Check for duplicate min_days
      const minDaysSet = new Set(tiers.map((t) => t.min_days));
      if (minDaysSet.size !== tiers.length) {
        throw new Error("Each tier must have a unique minimum days value");
      }

      // Separate new and existing tiers
      const newTiers = tiers.filter((t) => t.isNew);
      const existingTiers = tiers.filter((t) => !t.isNew);

      // Update existing tiers
      for (const tier of existingTiers) {
        const { error } = await supabase
          .from("free_days_tiers")
          .update({
            min_days: tier.min_days,
            free_days: tier.free_days,
          })
          .eq("id", tier.id);

        if (error) throw error;
      }

      // Insert new tiers
      if (newTiers.length > 0) {
        // eslint-disable-next-line no-unused-vars
        const toInsert = newTiers.map(({ isNew, id, ...rest }) => rest);
        const { error } = await supabase
          .from("free_days_tiers")
          .insert(toInsert);

        if (error) throw error;
      }

      // Refresh data
      await fetchTiers();
      setSuccess("Free days tiers saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving tiers:", err);
      setError(err.message || "Failed to save tiers");
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-linear-to-r dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-600/20 rounded-xl">
            <Gift size={24} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Free Days Promotion
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              Configure free days rewards based on rental duration. Customers
              who rent for longer periods will automatically receive free days
              as a discount.
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-400 shrink-0" size={20} />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
          <Gift className="text-green-400 shrink-0" size={20} />
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {/* Tiers Table */}
      <div className="bg-gray-100 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Free Days Tiers
          </h4>
          <button
            onClick={addTier}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Plus size={16} />
            Add Tier
          </button>
        </div>

        {tiers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            <Gift size={48} className="mx-auto mb-4 opacity-50" />
            <p>No free days tiers configured yet.</p>
            <p className="text-sm mt-1">
              Add a tier to offer free days for longer rentals.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-white/5">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-200 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-gray-600 dark:text-slate-500 font-semibold">
              <div className="col-span-5">Minimum Rental Days</div>
              <div className="col-span-5">Free Days Reward</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>

            {/* Tier Rows */}
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-200 dark:hover:bg-white/5 transition-colors"
              >
                <div className="col-span-5">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={tier.min_days}
                      onChange={(e) =>
                        updateTier(tier.id, "min_days", e.target.value)
                      }
                      className="w-24 px-3 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none"
                    />
                    <span className="text-gray-500 dark:text-slate-400 text-sm">
                      days+
                    </span>
                  </div>
                </div>
                <div className="col-span-5">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={tier.free_days}
                      onChange={(e) =>
                        updateTier(tier.id, "free_days", e.target.value)
                      }
                      className="w-24 px-3 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none"
                    />
                    <span className="text-gray-500 dark:text-slate-400 text-sm">
                      free days
                    </span>
                  </div>
                </div>
                <div className="col-span-2 flex justify-center">
                  <button
                    onClick={() => removeTier(tier.id)}
                    className="p-2 text-gray-400 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete tier"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      {tiers.length > 0 && (
        <div className="bg-gray-100 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Preview
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tiers
              .sort((a, b) => a.min_days - b.min_days)
              .map((tier) => (
                <div
                  key={tier.id}
                  className="p-4 bg-indigo-100 dark:bg-indigo-600/10 border border-indigo-300 dark:border-indigo-500/30 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Gift
                      size={16}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                    <span className="text-indigo-600 dark:text-indigo-300 font-bold">
                      {tier.free_days} Free Day{tier.free_days > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">
                    When renting {tier.min_days}+ days
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveTiers}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            saving
              ? "bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-500 cursor-not-allowed"
              : "bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25"
          }`}
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
