import React, { useState, useEffect } from "react";
import {
  Gift,
  Shield,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Check,
  Edit,
  X,
} from "lucide-react";
import supabase from "../../config/supabase-client";

// Free Days Tiers Section
function FreeDaysTiersSection() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
        tier.id === id ? { ...tier, [field]: parseInt(value) || 0 } : tier,
      ),
    );
  };

  const removeTier = async (id) => {
    const tier = tiers.find((t) => t.id === id);

    if (tier?.isNew) {
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
      for (const tier of tiers) {
        if (tier.min_days < 1)
          throw new Error("Minimum days must be at least 1");
        if (tier.free_days < 1) throw new Error("Free days must be at least 1");
      }

      const minDaysSet = new Set(tiers.map((t) => t.min_days));
      if (minDaysSet.size !== tiers.length) {
        throw new Error("Each tier must have a unique minimum days value");
      }

      const newTiers = tiers.filter((t) => t.isNew);
      const existingTiers = tiers.filter((t) => !t.isNew);

      for (const tier of existingTiers) {
        const { error } = await supabase
          .from("free_days_tiers")
          .update({ min_days: tier.min_days, free_days: tier.free_days })
          .eq("id", tier.id);
        if (error) throw error;
      }

      if (newTiers.length > 0) {
        // eslint-disable-next-line no-unused-vars
        const toInsert = newTiers.map(({ isNew, id, ...rest }) => rest);
        const { error } = await supabase
          .from("free_days_tiers")
          .insert(toInsert);
        if (error) throw error;
      }

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
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-400 shrink-0" size={18} />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
          <Check className="text-green-400 shrink-0" size={18} />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-gray-500 dark:text-slate-400 text-sm">
          {tiers.length} tier{tiers.length !== 1 ? "s" : ""} configured
        </span>
        <button
          onClick={addTier}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all"
        >
          <Plus size={14} />
          Add Tier
        </button>
      </div>

      {tiers.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-slate-500">
          No tiers configured. Add a tier to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-white/5"
            >
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 dark:text-slate-500 uppercase">
                    Min Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={tier.min_days}
                    onChange={(e) =>
                      updateTier(tier.id, "min_days", e.target.value)
                    }
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 dark:text-slate-500 uppercase">
                    Free Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={tier.free_days}
                    onChange={(e) =>
                      updateTier(tier.id, "free_days", e.target.value)
                    }
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
              <button
                onClick={() => removeTier(tier.id)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tiers.length > 0 && (
        <button
          onClick={saveTiers}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-400 dark:disabled:bg-slate-600 text-white rounded-xl font-medium transition-all"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving..." : "Save Free Days Tiers"}
        </button>
      )}
    </div>
  );
}

// Insurance Options Section
function InsuranceOptionsSection() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("insurance_options")
        .select("*")
        .order("price_per_day", { ascending: true });

      if (error) throw error;
      setOptions(data || []);
    } catch (err) {
      console.error("Error fetching insurance options:", err);
      setError("Failed to load insurance options. Make sure the table exists.");
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    const newOption = {
      id: `temp-${Date.now()}`,
      name: "New Insurance",
      description: "Description of coverage",
      price_per_day: 50,
      isNew: true,
    };
    setOptions([...options, newOption]);
  };

  const updateOption = (id, field, value) => {
    setOptions(
      options.map((opt) =>
        opt.id === id
          ? {
              ...opt,
              [field]: field === "price_per_day" ? parseInt(value) || 0 : value,
            }
          : opt,
      ),
    );
  };

  const removeOption = async (id) => {
    const option = options.find((o) => o.id === id);

    if (option?.isNew) {
      setOptions(options.filter((o) => o.id !== id));
      return;
    }

    if (!confirm("Are you sure you want to delete this insurance option?"))
      return;

    try {
      const { error } = await supabase
        .from("insurance_options")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setOptions(options.filter((o) => o.id !== id));
      setSuccess("Insurance option deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting option:", err);
      setError("Failed to delete insurance option");
      setTimeout(() => setError(null), 3000);
    }
  };

  const saveOptions = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      for (const opt of options) {
        if (!opt.name.trim()) throw new Error("Insurance name is required");
        if (opt.price_per_day < 0)
          throw new Error("Price must be 0 or greater");
      }

      const newOptions = options.filter((o) => o.isNew);
      const existingOptions = options.filter((o) => !o.isNew);

      for (const opt of existingOptions) {
        const { error } = await supabase
          .from("insurance_options")
          .update({
            name: opt.name,
            description: opt.description,
            price_per_day: opt.price_per_day,
          })
          .eq("id", opt.id);
        if (error) throw error;
      }

      if (newOptions.length > 0) {
        // eslint-disable-next-line no-unused-vars
        const toInsert = newOptions.map(({ isNew, id, ...rest }) => rest);
        const { error } = await supabase
          .from("insurance_options")
          .insert(toInsert);
        if (error) throw error;
      }

      await fetchOptions();
      setSuccess("Insurance options saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving options:", err);
      setError(err.message || "Failed to save insurance options");
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-400 shrink-0" size={18} />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
          <Check className="text-green-400 shrink-0" size={18} />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-gray-500 dark:text-slate-400 text-sm">
          {options.length} option{options.length !== 1 ? "s" : ""} available
        </span>
        <button
          onClick={addOption}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all"
        >
          <Plus size={14} />
          Add Insurance
        </button>
      </div>

      {options.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-slate-500">
          No insurance options configured. Add an option to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((opt) => (
            <div
              key={opt.id}
              className="p-4 bg-gray-100 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-white/5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-500 dark:text-slate-500 uppercase">
                      Name
                    </label>
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) =>
                        updateOption(opt.id, "name", e.target.value)
                      }
                      placeholder="e.g., Basic, Premium, Full Coverage"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 dark:text-slate-500 uppercase">
                      Description
                    </label>
                    <input
                      type="text"
                      value={opt.description || ""}
                      onChange={(e) =>
                        updateOption(opt.id, "description", e.target.value)
                      }
                      placeholder="Coverage details..."
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 dark:text-slate-500 uppercase">
                      Price per Day (MAD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={opt.price_per_day}
                      onChange={(e) =>
                        updateOption(opt.id, "price_per_day", e.target.value)
                      }
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeOption(opt.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {options.length > 0 && (
        <button
          onClick={saveOptions}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-400 dark:disabled:bg-slate-600 text-white rounded-xl font-medium transition-all"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving..." : "Save Insurance Options"}
        </button>
      )}
    </div>
  );
}

// Main Promotions Editor Component
export default function PromotionsEditor() {
  const [activeTab, setActiveTab] = useState("freedays");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-600/20 rounded-xl">
            <Gift size={24} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Promotions & Add-ons
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              Configure free days promotions and insurance add-ons for your
              rental services.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab("freedays")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
            activeTab === "freedays"
              ? "bg-indigo-600 text-white shadow-lg"
              : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5"
          }`}
        >
          <Gift size={18} />
          Free Days Promo
        </button>
        <button
          onClick={() => setActiveTab("insurance")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
            activeTab === "insurance"
              ? "bg-indigo-600 text-white shadow-lg"
              : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5"
          }`}
        >
          <Shield size={18} />
          Insurance Add-ons
        </button>
      </div>

      {/* Content */}
      <div className="bg-gray-100 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
        {activeTab === "freedays" ? (
          <FreeDaysTiersSection />
        ) : (
          <InsuranceOptionsSection />
        )}
      </div>
    </div>
  );
}
