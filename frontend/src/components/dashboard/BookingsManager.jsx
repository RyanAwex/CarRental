import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Edit,
  X,
  Check,
  Clock,
  Car,
  Calendar,
  User,
  CreditCard,
  MapPin,
  Loader2,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  FileText,
  ExternalLink,
  Image,
  Upload,
  Trash2,
  Gift,
} from "lucide-react";
import supabase from "../../config/supabase-client";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    icon: Check,
  },
  active: {
    label: "Active",
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    icon: Play,
  },
  completed: {
    label: "Completed",
    color: "bg-green-500/10 text-green-400 border-green-500/30",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-500/10 text-red-400 border-red-500/30",
    icon: XCircle,
  },
};

export default function BookingsManager() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null); // Track which doc is being uploaded

  // Fetch all bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("rentals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Update booking status
  const updateStatus = async (bookingId, newStatus) => {
    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from("rentals")
        .update({ status: newStatus })
        .eq("id", bookingId)
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      // Check if update actually happened
      if (!data || data.length === 0) {
        throw new Error("No rows updated - check RLS policies");
      }

      console.log("Status updated successfully:", data);

      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Delete booking
  const deleteBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const { error } = await supabase
        .from("rentals")
        .delete()
        .eq("id", bookingId);

      if (error) throw error;

      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      setIsModalOpen(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error("Error deleting booking:", err);
      alert("Failed to delete booking");
    }
  };

  // Upload/Replace document
  const handleDocumentUpload = async (file, docType, bookingId, userId) => {
    if (!file) return;

    setUploadingDoc(docType);
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}_${docType}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("rental-documents")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("rental-documents")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Determine which column to update
      const columnMap = {
        id_document: "id_document_url",
        driving_license: "driving_license_url",
        passport: "passport_url",
      };

      // Update rental record
      const { error: updateError } = await supabase
        .from("rentals")
        .update({ [columnMap[docType]]: publicUrl })
        .eq("id", bookingId);

      if (updateError) throw updateError;

      // Update local state
      const updatedBooking = {
        ...selectedBooking,
        [columnMap[docType]]: publicUrl,
      };
      setSelectedBooking(updatedBooking);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );

      alert("Document uploaded successfully!");
    } catch (err) {
      console.error("Error uploading document:", err);
      alert("Failed to upload document: " + err.message);
    } finally {
      setUploadingDoc(null);
    }
  };

  // Delete document
  const handleDocumentDelete = async (docType, bookingId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    setUploadingDoc(docType);
    try {
      const columnMap = {
        id_document: "id_document_url",
        driving_license: "driving_license_url",
        passport: "passport_url",
      };

      // Update rental record to remove URL
      const { error } = await supabase
        .from("rentals")
        .update({ [columnMap[docType]]: null })
        .eq("id", bookingId);

      if (error) throw error;

      // Update local state
      const updatedBooking = {
        ...selectedBooking,
        [columnMap[docType]]: null,
      };
      setSelectedBooking(updatedBooking);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Failed to delete document");
    } finally {
      setUploadingDoc(null);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.car_make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.car_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.pickup_location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    active: bookings.filter((b) => b.status === "active").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    revenue: bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((acc, b) => acc + Number(b.total_price || 0), 0),
  };

  const openModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-2" />
        <p className="text-red-400">Error loading bookings: {error}</p>
        <button
          onClick={fetchBookings}
          className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 lg:gap-4">
        <div className="bg-gray-100 dark:bg-slate-800/50 rounded-xl p-3 lg:p-4 border border-gray-200 dark:border-white/5">
          <p className="text-gray-500 dark:text-slate-400 text-[10px] lg:text-xs uppercase mb-1">
            Total
          </p>
          <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
        </div>
        <div className="bg-yellow-500/10 rounded-xl p-3 lg:p-4 border border-yellow-500/20">
          <p className="text-yellow-400 text-[10px] lg:text-xs uppercase mb-1">
            Pending
          </p>
          <p className="text-xl lg:text-2xl font-bold text-yellow-400">
            {stats.pending}
          </p>
        </div>
        <div className="bg-blue-500/10 rounded-xl p-3 lg:p-4 border border-blue-500/20">
          <p className="text-blue-400 text-[10px] lg:text-xs uppercase mb-1">
            Confirmed
          </p>
          <p className="text-xl lg:text-2xl font-bold text-blue-400">
            {stats.confirmed}
          </p>
        </div>
        <div className="bg-indigo-500/10 rounded-xl p-3 lg:p-4 border border-indigo-500/20">
          <p className="text-indigo-400 text-[10px] lg:text-xs uppercase mb-1">
            Active
          </p>
          <p className="text-xl lg:text-2xl font-bold text-indigo-400">
            {stats.active}
          </p>
        </div>
        <div className="bg-green-500/10 rounded-xl p-3 lg:p-4 border border-green-500/20">
          <p className="text-green-400 text-[10px] lg:text-xs uppercase mb-1">
            Completed
          </p>
          <p className="text-xl lg:text-2xl font-bold text-green-400">
            {stats.completed}
          </p>
        </div>
        <div className="bg-red-500/10 rounded-xl p-3 lg:p-4 border border-red-500/20">
          <p className="text-red-400 text-[10px] lg:text-xs uppercase mb-1">
            Cancelled
          </p>
          <p className="text-xl lg:text-2xl font-bold text-red-400">
            {stats.cancelled}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-emerald-500/10 rounded-xl p-3 lg:p-4 border border-emerald-500/20">
          <p className="text-emerald-400 text-[10px] lg:text-xs uppercase mb-1">
            Revenue
          </p>
          <p className="text-lg lg:text-xl font-bold text-emerald-400">
            {stats.revenue.toLocaleString()}{" "}
            <span className="text-xs">MAD</span>
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by car, location, user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2.5 lg:py-3 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Bookings Card View - Always show cards, click to open details */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredBookings.length === 0 ? (
          <div className="col-span-full bg-gray-100 dark:bg-slate-800/50 rounded-xl p-8 text-center text-gray-500 dark:text-slate-500">
            No bookings found
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const StatusIcon = STATUS_CONFIG[booking.status]?.icon || Clock;
            return (
              <div
                key={booking.id}
                onClick={() => openModal(booking)}
                className="bg-gray-100 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-white/5 hover:border-indigo-500/30 hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
              >
                <div className="flex gap-3">
                  {booking.car_image ? (
                    <img
                      src={booking.car_image}
                      alt=""
                      className="w-20 h-14 rounded-lg object-contain shrink-0 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-20 h-14 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                      <Car
                        size={20}
                        className="text-gray-400 dark:text-slate-500"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium text-sm text-wrap truncate">
                          {booking.car_make} {booking.car_model}
                        </p>
                        <p className="text-gray-500 dark:text-slate-500 text-xs">
                          {booking.car_transmission}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-lg border shrink-0 ${
                          STATUS_CONFIG[booking.status]?.color || ""
                        }`}
                      >
                        <StatusIcon size={10} />
                        {STATUS_CONFIG[booking.status]?.label || booking.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/5 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500 dark:text-slate-500">Dates</p>
                    <p className="text-gray-700 dark:text-slate-300">
                      {new Date(booking.start_date).toLocaleDateString("en-GB")}{" "}
                      -{" "}
                      {new Date(
                        booking.return_date || booking.end_date
                      ).toLocaleDateString("en-GB")}
                      {booking.free_days > 0 && (
                        <span className="text-green-400 ml-1 text-[10px]">
                          (+{booking.free_days} free)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 dark:text-slate-500">Total</p>
                    <p className="text-gray-900 dark:text-white font-bold">
                      {booking.total_price} MAD
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-gray-200 dark:border-white/10 w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-white/10 z-10">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Booking Details
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                  ID: {selectedBooking.id.slice(0, 8)}...
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Car Info */}
              <div className="flex gap-3 sm:gap-4">
                {selectedBooking.car_image ? (
                  <img
                    src={selectedBooking.car_image}
                    alt=""
                    className="w-24 h-18 sm:w-32 sm:h-24 rounded-xl object-contain shrink-0"
                  />
                ) : (
                  <div className="w-24 h-18 sm:w-32 sm:h-24 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                    <Car
                      size={28}
                      className="text-gray-400 dark:text-slate-600"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                    {selectedBooking.car_make} {selectedBooking.car_model}
                  </h4>
                  <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm">
                    {selectedBooking.car_transmission}
                  </p>
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg sm:text-xl mt-1 sm:mt-2">
                    {selectedBooking.total_price} MAD
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-100 dark:bg-slate-800/50 p-3 sm:p-4 rounded-xl">
                  <p className="text-gray-500 dark:text-slate-400 text-[10px] sm:text-xs uppercase mb-1 flex items-center gap-1">
                    <Calendar size={12} /> Dates
                  </p>
                  <p className="text-gray-900 dark:text-white text-sm sm:text-base">
                    {new Date(selectedBooking.start_date).toLocaleDateString(
                      "en-GB"
                    )}{" "}
                    -{" "}
                    {new Date(
                      selectedBooking.return_date || selectedBooking.end_date
                    ).toLocaleDateString("en-GB")}
                  </p>
                  <p className="text-gray-500 dark:text-slate-500 text-xs sm:text-sm">
                    {selectedBooking.rental_days} days
                    {selectedBooking.free_days > 0 && (
                      <span className="text-green-400 ml-1 inline-flex items-center gap-1">
                        <Gift size={10} /> +{selectedBooking.free_days} free
                      </span>
                    )}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-slate-800/50 p-3 sm:p-4 rounded-xl">
                  <p className="text-gray-500 dark:text-slate-400 text-[10px] sm:text-xs uppercase mb-1 flex items-center gap-1">
                    <MapPin size={12} /> Location
                  </p>
                  <p className="text-gray-900 dark:text-white text-sm sm:text-base">
                    {selectedBooking.pickup_location || "Not specified"}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-slate-800/50 p-3 sm:p-4 rounded-xl">
                  <p className="text-gray-500 dark:text-slate-400 text-[10px] sm:text-xs uppercase mb-1 flex items-center gap-1">
                    <CreditCard size={12} /> Payment
                  </p>
                  <p className="text-gray-900 dark:text-white text-sm sm:text-base capitalize">
                    {selectedBooking.payment_method}
                  </p>
                  <p className="text-gray-500 dark:text-slate-500 text-xs sm:text-sm">
                    {selectedBooking.daily_price} MAD/day
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-slate-800/50 p-3 sm:p-4 rounded-xl">
                  <p className="text-gray-500 dark:text-slate-400 text-[10px] sm:text-xs uppercase mb-1 flex items-center gap-1">
                    <User size={12} /> User ID
                  </p>
                  <p className="text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                    {selectedBooking.user_id}
                  </p>
                </div>
              </div>

              {/* User Documents - Full Width Layout */}
              <div className="space-y-3">
                <p className="text-gray-500 dark:text-slate-400 text-[10px] sm:text-xs uppercase flex items-center gap-1 font-bold">
                  <FileText size={12} /> User Documents
                </p>

                {/* Document Cards - Each takes full width */}
                <div className="space-y-3">
                  {/* ID Card */}
                  <div className="bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <Image
                          size={20}
                          className="text-indigo-600 dark:text-indigo-400"
                        />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          ID Card / CIN
                        </p>
                        <p
                          className={`text-sm ${
                            selectedBooking.id_document_url
                              ? "text-green-500 dark:text-green-400"
                              : "text-gray-500 dark:text-slate-500"
                          }`}
                        >
                          {selectedBooking.id_document_url
                            ? "✓ Document uploaded"
                            : "Not uploaded yet"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:shrink-0">
                      {selectedBooking.id_document_url && (
                        <>
                          <a
                            href={selectedBooking.id_document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500/20 text-indigo-400 text-sm rounded-xl hover:bg-indigo-500/30 transition-all font-medium"
                          >
                            <ExternalLink size={16} /> View
                          </a>
                          <button
                            onClick={() =>
                              handleDocumentDelete(
                                "id_document",
                                selectedBooking.id
                              )
                            }
                            disabled={uploadingDoc === "id_document"}
                            className="px-3 py-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      <label
                        className={`${
                          selectedBooking.id_document_url
                            ? ""
                            : "flex-1 sm:flex-none"
                        } flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-all cursor-pointer font-medium ${
                          uploadingDoc === "id_document"
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        {uploadingDoc === "id_document" ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                        {selectedBooking.id_document_url ? "Replace" : "Upload"}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(
                              e.target.files[0],
                              "id_document",
                              selectedBooking.id,
                              selectedBooking.user_id
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {/* Driving License */}
                  <div className="bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
                        <Image
                          size={20}
                          className="text-green-600 dark:text-green-400"
                        />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          Driving License
                        </p>
                        <p
                          className={`text-sm ${
                            selectedBooking.driving_license_url
                              ? "text-green-500 dark:text-green-400"
                              : "text-gray-500 dark:text-slate-500"
                          }`}
                        >
                          {selectedBooking.driving_license_url
                            ? "✓ Document uploaded"
                            : "Not uploaded yet"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:shrink-0">
                      {selectedBooking.driving_license_url && (
                        <>
                          <a
                            href={selectedBooking.driving_license_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/20 text-green-400 text-sm rounded-xl hover:bg-green-500/30 transition-all font-medium"
                          >
                            <ExternalLink size={16} /> View
                          </a>
                          <button
                            onClick={() =>
                              handleDocumentDelete(
                                "driving_license",
                                selectedBooking.id
                              )
                            }
                            disabled={uploadingDoc === "driving_license"}
                            className="px-3 py-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      <label
                        className={`${
                          selectedBooking.driving_license_url
                            ? ""
                            : "flex-1 sm:flex-none"
                        } flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-all cursor-pointer font-medium ${
                          uploadingDoc === "driving_license"
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        {uploadingDoc === "driving_license" ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                        {selectedBooking.driving_license_url
                          ? "Replace"
                          : "Upload"}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(
                              e.target.files[0],
                              "driving_license",
                              selectedBooking.id,
                              selectedBooking.user_id
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {/* Passport */}
                  <div className="bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Image
                          size={20}
                          className="text-purple-600 dark:text-purple-400"
                        />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          Passport
                        </p>
                        <p
                          className={`text-sm ${
                            selectedBooking.passport_url
                              ? "text-green-500 dark:text-green-400"
                              : "text-gray-500 dark:text-slate-500"
                          }`}
                        >
                          {selectedBooking.passport_url
                            ? "✓ Document uploaded"
                            : "Not uploaded yet"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:shrink-0">
                      {selectedBooking.passport_url && (
                        <>
                          <a
                            href={selectedBooking.passport_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/20 text-purple-400 text-sm rounded-xl hover:bg-purple-500/30 transition-all font-medium"
                          >
                            <ExternalLink size={16} /> View
                          </a>
                          <button
                            onClick={() =>
                              handleDocumentDelete(
                                "passport",
                                selectedBooking.id
                              )
                            }
                            disabled={uploadingDoc === "passport"}
                            className="px-3 py-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      <label
                        className={`${
                          selectedBooking.passport_url
                            ? ""
                            : "flex-1 sm:flex-none"
                        } flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-all cursor-pointer font-medium ${
                          uploadingDoc === "passport"
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        {uploadingDoc === "passport" ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                        {selectedBooking.passport_url ? "Replace" : "Upload"}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(
                              e.target.files[0],
                              "passport",
                              selectedBooking.id,
                              selectedBooking.user_id
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-[10px] sm:text-xs uppercase mb-2 sm:mb-3">
                  Update Status
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const Icon = config.icon;
                    const isActive = selectedBooking.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedBooking.id, status)}
                        disabled={updating || isActive}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-xs whitespace-nowrap ${
                          isActive
                            ? config.color + " font-bold"
                            : "border-gray-300 dark:border-white/10 text-gray-500 dark:text-slate-400 hover:border-gray-400 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white"
                        } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Icon size={14} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-gray-500 dark:text-slate-500 text-[10px] sm:text-xs">
                <p>
                  Created:{" "}
                  {new Date(selectedBooking.created_at).toLocaleString()}
                </p>
                <p>
                  Updated:{" "}
                  {new Date(selectedBooking.updated_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-900 flex justify-between items-center p-4 sm:p-6 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={() => deleteBooking(selectedBooking.id)}
                className="px-3 sm:px-4 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-all text-xs sm:text-sm font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all text-xs sm:text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
