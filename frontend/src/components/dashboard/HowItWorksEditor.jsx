// HowItWorksEditor.jsx
import React, { useState, useEffect } from "react";
import { Save, List, Plus, Trash2, LayoutGrid } from "lucide-react";
import supabase from "../../config/supabase-client";

export default function HowItWorksEditor() {
  const [content, setContent] = useState({
    title: "",
    subtitle: "",
    steps: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", "how_it_works")
        .single();
      if (data) setContent(data.content);
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    await supabase
      .from("site_content")
      .upsert([{ section_key: "how_it_works", content }], {
        onConflict: ["section_key"],
      });
    alert("Section updated!");
  };

  const addStep = () => {
    setContent({
      ...content,
      steps: [
        ...content.steps,
        {
          title: "New Step",
          desc: "",
          icon: ICON_OPTIONS[0],
        },
      ],
    });
  };

  const removeStep = (index) => {
    const newSteps = content.steps.filter((_, i) => i !== index);
    setContent({ ...content, steps: newSteps });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...content.steps];
    newSteps[index][field] = value;
    setContent({ ...content, steps: newSteps });
  };

  const ICON_OPTIONS = [
    "Location",
    "Calendar",
    "Wallet",
    "Check",
    "Clock",
    "Car",
  ];

  if (loading)
    return (
      <div className="w-full flex items-center justify-center">Loading...</div>
    );

  return (
    <div className="bg-gray-100 dark:bg-[#1e293b] p-6 rounded-3xl border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white max-w-3xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <List /> How It Works Section
      </h2>

      {/* Main Headers */}
      <div className="grid gap-4 mb-6">
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
            Section Title
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
            Subtitle
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
            value={content.subtitle}
            onChange={(e) =>
              setContent({ ...content, subtitle: e.target.value })
            }
          />
        </div>
      </div>

      {/* Dynamic Steps List */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase block">
          Steps
        </label>
        {content.steps.map((step, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-600 flex gap-4 items-start"
          >
            <span className="bg-gray-200 dark:bg-slate-700 w-8 h-8 flex items-center justify-center rounded-full font-bold text-gray-500 dark:text-slate-400 shrink-0">
              {index + 1}
            </span>
            <div className="flex-1 space-y-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                  Icon
                </label>
                <div className="flex items-center gap-2">
                  <LayoutGrid
                    size={16}
                    className="text-indigo-500 dark:text-indigo-400"
                  />
                  <select
                    className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded p-2 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500 w-full"
                    value={step.icon}
                    onChange={(e) => updateStep(index, "icon", e.target.value)}
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <input
                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded p-2 text-sm outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                placeholder="Step Title"
                value={step.title}
                onChange={(e) => updateStep(index, "title", e.target.value)}
              />
              <textarea
                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded p-2 text-sm outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                rows="2"
                placeholder="Description"
                value={step.desc}
                onChange={(e) => updateStep(index, "desc", e.target.value)}
              />
            </div>
            <button
              onClick={() => removeStep(index)}
              className="text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 p-2"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button
          onClick={addStep}
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 rounded-xl hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Step
        </button>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-6"
      >
        <Save size={20} /> Save Changes
      </button>
    </div>
  );
}
