import {
  CheckCircle,
  Edit,
  Plus,
  Save,
  X,
  Upload,
  Trash2,
  Image,
  Loader2,
} from "lucide-react";
import React, { useState } from "react";
import supabase from "../../../config/supabase-client";

function DetailedModal({
  currentCar,
  setIsModalOpen,
  handleSave,
  setCurrentCar,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Get the current image URL (first from array or string)
  const getCurrentImageUrl = () => {
    if (
      Array.isArray(currentCar.image_urls) &&
      currentCar.image_urls.length > 0
    ) {
      return currentCar.image_urls[0];
    }
    if (
      typeof currentCar.image_urls === "string" &&
      currentCar.image_urls.trim()
    ) {
      return currentCar.image_urls.split(",")[0].trim();
    }
    return null;
  };

  const currentImageUrl = getCurrentImageUrl();

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Delete old image if exists
      if (currentImageUrl) {
        await deleteImageFromStorage(currentImageUrl);
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("cars-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("cars-images")
        .getPublicUrl(fileName);

      // Update car with new image URL
      setCurrentCar({
        ...currentCar,
        image_urls: [urlData.publicUrl],
      });
    } catch (err) {
      console.error("Error uploading image:", err);
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Delete image from storage
  const deleteImageFromStorage = async (imageUrl) => {
    try {
      // Extract filename from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split("/");
      const fileName = pathParts[pathParts.length - 1];

      if (fileName) {
        await supabase.storage.from("cars-images").remove([fileName]);
      }
    } catch (err) {
      console.error("Error deleting old image:", err);
    }
  };

  // Handle image delete
  const handleImageDelete = async () => {
    if (!currentImageUrl) return;

    if (!confirm("Are you sure you want to delete this image?")) return;

    setUploading(true);
    try {
      await deleteImageFromStorage(currentImageUrl);
      setCurrentCar({
        ...currentCar,
        image_urls: [],
      });
    } catch (err) {
      console.error("Error deleting image:", err);
      setUploadError("Failed to delete image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-[#1e293b] w-full sm:max-w-3xl rounded-t-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="sticky top-0 p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-[#0f172a] z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {currentCar.id ? (
              <Edit size={18} className="text-indigo-500" />
            ) : (
              <Plus size={18} className="text-indigo-500" />
            )}
            {currentCar.id ? "Edit Vehicle" : "Add Vehicle"}
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="text-gray-500 dark:text-slate-400" size={20} />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <form
            id="carForm"
            onSubmit={handleSave}
            className="space-y-6 sm:space-y-8"
          >
            {/* Section 1: Core Details */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 sm:mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">
                Vehicle Identity
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-bold ml-1">
                    Make
                  </label>
                  <input
                    required
                    className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. BMW"
                    value={currentCar.make}
                    onChange={(e) =>
                      setCurrentCar({ ...currentCar, make: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-bold ml-1">
                    Model
                  </label>
                  <input
                    required
                    className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. X5"
                    value={currentCar.model}
                    onChange={(e) =>
                      setCurrentCar({
                        ...currentCar,
                        model: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-bold ml-1">
                    Year
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-gray-900 dark:text-white text-sm focus:border-indigo-500 outline-none"
                    value={currentCar.year}
                    onChange={(e) =>
                      setCurrentCar({ ...currentCar, year: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-bold ml-1">
                    License Plate
                  </label>
                  <input
                    required
                    className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-gray-900 dark:text-white text-sm focus:border-indigo-500 outline-none"
                    placeholder="12345-A-1"
                    value={currentCar.license_plate}
                    onChange={(e) =>
                      setCurrentCar({
                        ...currentCar,
                        license_plate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Specs (ENUMs) */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 sm:mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">
                Technical Specs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-bold ml-1">
                    Transmission
                  </label>
                  <select
                    className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-gray-900 dark:text-white text-sm focus:border-indigo-500 outline-none"
                    value={currentCar.transmission}
                    onChange={(e) =>
                      setCurrentCar({
                        ...currentCar,
                        transmission: e.target.value,
                      })
                    }
                  >
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-bold ml-1">
                    Fuel Type
                  </label>
                  <select
                    className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-gray-900 dark:text-white text-sm focus:border-indigo-500 outline-none"
                    value={currentCar.fuel_type}
                    onChange={(e) =>
                      setCurrentCar({
                        ...currentCar,
                        fuel_type: e.target.value,
                      })
                    }
                  >
                    <option>Diesel</option>
                    <option>Gasoline</option>
                    <option>Electric</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-bold ml-1">
                    Category
                  </label>
                  <select
                    className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-gray-900 dark:text-white text-sm focus:border-indigo-500 outline-none"
                    value={currentCar.category}
                    onChange={(e) =>
                      setCurrentCar({
                        ...currentCar,
                        category: e.target.value,
                      })
                    }
                  >
                    <option>Economy</option>
                    <option>Luxury</option>
                    <option>Family</option>
                    <option>SUV</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Pricing & Kits */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 sm:mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">
                Pricing & Kits
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-bold ml-1">
                    Base Price (MAD)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-gray-900 dark:text-white text-sm focus:border-indigo-500 outline-none"
                    value={currentCar.base_price_per_day}
                    onChange={(e) =>
                      setCurrentCar({
                        ...currentCar,
                        base_price_per_day: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-bold ml-1">
                    Weekend Price
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-gray-900 dark:text-white text-sm focus:border-indigo-500 outline-none"
                    value={currentCar.weekend_price_per_day}
                    onChange={(e) =>
                      setCurrentCar({
                        ...currentCar,
                        weekend_price_per_day: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-bold ml-1">
                    Kits
                  </label>
                  <input
                    className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-gray-900 dark:text-white text-sm focus:border-indigo-500 outline-none"
                    placeholder="e.g. GPS, Child Seat, Roof Rack"
                    value={currentCar.kits || ""}
                    onChange={(e) =>
                      setCurrentCar({
                        ...currentCar,
                        kits: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-bold ml-1">
                    Status
                  </label>
                  <select
                    className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-gray-900 dark:text-white text-sm focus:border-indigo-500 outline-none"
                    value={currentCar.status}
                    onChange={(e) =>
                      setCurrentCar({
                        ...currentCar,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Car Image */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 sm:mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">
                Car Image
              </h3>

              {/* Image Preview */}
              {currentImageUrl ? (
                <div className="relative group">
                  <img
                    src={currentImageUrl}
                    alt="Car preview"
                    className="w-full h-48 sm:h-64 object-contain rounded-xl border border-gray-200 dark:border-slate-600"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                    <label className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer transition-colors">
                      <Upload size={20} className="text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleImageDelete}
                      disabled={uploading}
                      className="p-3 bg-red-600 hover:bg-red-500 rounded-xl transition-colors"
                    >
                      <Trash2 size={20} className="text-white" />
                    </button>
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/80 rounded-xl flex items-center justify-center">
                      <Loader2
                        size={32}
                        className="text-indigo-400 animate-spin"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all ${
                    uploading ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {uploading ? (
                    <Loader2
                      size={32}
                      className="text-indigo-500 dark:text-indigo-400 animate-spin"
                    />
                  ) : (
                    <>
                      <Image
                        size={40}
                        className="text-gray-400 dark:text-slate-500 mb-3"
                      />
                      <span className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                        Click to upload car image
                      </span>
                      <span className="text-xs text-gray-400 dark:text-slate-500">
                        PNG, JPG up to 5MB
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}

              {/* Upload Error */}
              {uploadError && (
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <X size={14} />
                  {uploadError}
                </p>
              )}

              {/* Or use URL */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white dark:bg-[#1e293b] text-gray-500 dark:text-slate-500">
                    or paste URL
                  </span>
                </div>
              </div>

              <input
                className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-gray-900 dark:text-white text-sm focus:border-indigo-500 outline-none"
                placeholder="https://example.com/car-image.jpg"
                value={
                  typeof currentCar.image_urls === "string"
                    ? currentCar.image_urls
                    : Array.isArray(currentCar.image_urls)
                      ? currentCar.image_urls.join(", ")
                      : ""
                }
                onChange={(e) =>
                  setCurrentCar({
                    ...currentCar,
                    image_urls: e.target.value,
                  })
                }
              />
              <p className="text-[10px] text-gray-500 dark:text-slate-500 ml-1">
                Upload an image or paste a direct URL to your image.
              </p>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 p-4 sm:p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#0f172a] flex justify-end gap-2 sm:gap-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 font-bold transition-all text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="carForm"
            className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 text-sm"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailedModal;
