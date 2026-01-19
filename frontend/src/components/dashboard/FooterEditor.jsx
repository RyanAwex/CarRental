import { Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import supabase from "../../config/supabase-client";

export default function FooterEditor() {
  const [content, setContent] = useState({
    description: "",
    address: "",
    phone: "",
    email: "",
    facebook: "",
    twitter: "",
    instagram: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", "footer")
        .single();
      if (data) setContent(data.content);
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    await supabase
      .from("site_content")
      .upsert([{ section_key: "footer", content }], {
        onConflict: ["section_key"],
      });
    alert("Footer updated!");
  };

  if (loading)
    return (
      <div className="w-full flex items-center justify-center">Loading...</div>
    );

  return (
    <div className="bg-gray-100 dark:bg-[#1e293b] p-6 rounded-3xl border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white max-w-3xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6">Footer & Contact</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
            Company Description
          </label>
          <textarea
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
            rows="3"
            value={content.description}
            onChange={(e) =>
              setContent({ ...content, description: e.target.value })
            }
          />
        </div>

        {/* Contact Details */}
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
            Address
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
            value={content.address}
            onChange={(e) =>
              setContent({ ...content, address: e.target.value })
            }
            placeholder="123 Main Street, City"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
            Phone Number
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
            value={content.phone}
            onChange={(e) => setContent({ ...content, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
            Email Address
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
            value={content.email}
            onChange={(e) => setContent({ ...content, email: e.target.value })}
          />
        </div>

        {/* Social Media */}
        <div className="md:col-span-2 border-t border-gray-200 dark:border-slate-700 pt-4 mt-2">
          <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-4">
            Social Media Links
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-24 text-gray-500 dark:text-slate-500 text-sm">
                Facebook
              </span>
              <input
                className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-2 text-sm outline-none text-gray-900 dark:text-white"
                value={content.facebook}
                onChange={(e) =>
                  setContent({ ...content, facebook: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-gray-500 dark:text-slate-500 text-sm">
                Instagram
              </span>
              <input
                className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-2 text-sm outline-none text-gray-900 dark:text-white"
                value={content.instagram}
                onChange={(e) =>
                  setContent({ ...content, instagram: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-gray-500 dark:text-slate-500 text-sm">
                Twitter
              </span>
              <input
                className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-2 text-sm outline-none text-gray-900 dark:text-white"
                value={content.twitter}
                onChange={(e) =>
                  setContent({ ...content, twitter: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-6"
      >
        <Save size={20} /> Save Footer
      </button>
    </div>
  );
}
