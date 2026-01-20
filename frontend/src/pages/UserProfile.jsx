import {
  Edit,
  Trash2,
  MapPin,
  Calendar,
  CreditCard,
  Car,
  CheckCircle,
  Clock,
  LogOut,
  User,
  Mail,
  Loader2,
  XCircle,
  Play,
  Check,
  FileText,
  ExternalLink,
  Gift,
} from "lucide-react";

// Status configuration for display
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
    Icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
    Icon: Check,
  },
  active: {
    label: "Active",
    color: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",
    Icon: Play,
  },
  completed: {
    label: "Completed",
    color: "bg-green-500/10 text-green-400 border border-green-500/30",
    Icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-500/10 text-red-400 border border-red-500/30",
    Icon: XCircle,
  },
};
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase-client";
import SharedHeader from "../components/shared/SharedHeader";
import { useAuthStore } from "../store/authStore";
import { useReviewsStore } from "../store/reviewsStore";

function UserProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { addReview, canReviewRental } = useReviewsStore();
  const [rentHistory, setRentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rentalId: null,
    rating: 5,
    comment: "",
    showForm: false,
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("no-scrollbar");
    document.body.classList.add("no-scrollbar");
    return () => {
      document.documentElement.classList.remove("no-scrollbar");
      document.body.classList.remove("no-scrollbar");
    };
  }, []);

  // Transform rental data helper
  const transformRental = (rental) => ({
    id: rental.id,
    make: rental.car_make,
    model: rental.car_model,
    image: rental.car_image,
    transmission: rental.car_transmission,
    totalPrice: rental.total_price,
    dailyPrice: rental.daily_price,
    isFinished: rental.status === "completed",
    status: rental.status,
    paymentMethod: rental.payment_method,
    startDate: new Date(rental.start_date).toLocaleDateString("en-GB"),
    endDate: new Date(rental.end_date).toLocaleDateString("en-GB"),
    returnDate: rental.return_date
      ? new Date(rental.return_date).toLocaleDateString("en-GB")
      : new Date(rental.end_date).toLocaleDateString("en-GB"),
    days: rental.rental_days,
    freeDays: rental.free_days || 0,
    pickupLocation: rental.pickup_location,
    idDocumentUrl: rental.id_document_url,
    drivingLicenseUrl: rental.driving_license_url,
    passportUrl: rental.passport_url,
  });

  // Fetch user's rental history from Supabase
  const fetchRentals = async () => {
    try {
      const { data, error } = await supabase
        .from("rentals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRentHistory(data.map(transformRental));
      setError(null);
    } catch (err) {
      console.error("Error fetching rentals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's rental history from Supabase with auto-refresh
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchRentals();

    // Refetch when window regains focus
    const handleFocus = () => {
      fetchRentals();
    };

    window.addEventListener("focus", handleFocus);

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchRentals, 5000);

    // Cleanup
    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [user?.id]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.rentalId || !reviewForm.comment.trim()) return;

    setSubmittingReview(true);
    try {
      const result = await addReview({
        user_id: user.id,
        rental_id: reviewForm.rentalId,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });

      if (result.success) {
        setReviewForm({
          rentalId: null,
          rating: 5,
          comment: "",
          showForm: false,
        });
        // Refresh rental history to update the UI
        fetchRentals();
      } else {
        alert(`Error submitting review: ${result.error}`);
      }
    } catch (error) {
      alert(`Error submitting review: ${error.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const openReviewForm = async (rentalId) => {
    const checkResult = await canReviewRental(user.id, rentalId);
    if (!checkResult.canReview) {
      alert(checkResult.reason);
      return;
    }
    setReviewForm({
      rentalId,
      rating: 5,
      comment: "",
      showForm: true,
    });
  };

  const closeReviewForm = () => {
    setReviewForm({ rentalId: null, rating: 5, comment: "", showForm: false });
  };

  // Calculate stats from real data
  const totalRentals = rentHistory.length;
  const activeRentals = rentHistory.filter(
    (r) => r.status === "active" || r.status === "confirmed",
  ).length;
  const completedRentals = rentHistory.filter(
    (r) => r.status === "completed",
  ).length;
  const totalSpent = rentHistory.reduce(
    (acc, r) => acc + Number(r.totalPrice),
    0,
  );

  return (
    <div className="w-full min-h-screen bg-white dark:bg-slate-950">
      <SharedHeader
        title="My Profile"
        showBackButton
        backTo="/"
        showNav={false}
      />

      <div className="max-w-3xl mx-auto px-4 py-8 pt-24">
        {/* User Info Card */}
        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-gray-200 dark:border-white/10 mb-8 shadow-md dark:shadow-none">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Welcome back!
                </h2>
                <p className="text-gray-500 dark:text-slate-400 flex items-center gap-2 text-sm">
                  <Mail
                    size={14}
                    className="text-indigo-500 dark:text-indigo-400"
                  />
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-all text-sm font-medium"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalRentals}
              </p>
              <p className="text-gray-500 dark:text-slate-500 text-xs">
                Total Rentals
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {activeRentals}
              </p>
              <p className="text-gray-500 dark:text-slate-500 text-xs">
                Active
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {completedRentals}
              </p>
              <p className="text-gray-500 dark:text-slate-500 text-xs">
                Completed
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalSpent}
              </p>
              <p className="text-gray-500 dark:text-slate-500 text-xs">
                Total Spent (MAD)
              </p>
            </div>
          </div>
        </div>

        {/* Rental History */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Car size={20} className="text-indigo-500 dark:text-indigo-400" />
            Rental History
          </h3>

          {loading ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-slate-800/30 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
              <Loader2
                size={32}
                className="mx-auto text-indigo-500 dark:text-indigo-400 animate-spin mb-4"
              />
              <p className="text-gray-500 dark:text-slate-400">
                Loading your rental history...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-500/20">
              <p className="text-red-600 dark:text-red-400">
                Error loading rentals: {error}
              </p>
            </div>
          ) : rentHistory.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-slate-800/30 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
              <Car
                size={48}
                className="mx-auto text-gray-400 dark:text-slate-600 mb-4"
              />
              <p className="text-gray-500 dark:text-slate-400">
                No rental history yet
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all"
              >
                Browse Cars
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {rentHistory.map((rental) => (
                <div
                  key={rental.id}
                  className={`p-4 sm:p-5 bg-white dark:bg-slate-800/50 backdrop-blur rounded-2xl border transition-all shadow-sm dark:shadow-none ${
                    rental.isFinished
                      ? "border-gray-200 dark:border-white/10"
                      : "border-indigo-300 dark:border-indigo-500/30 shadow-md dark:shadow-[0_0_15px_rgba(79,70,229,0.1)]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Car Image */}
                    <div className="w-full sm:w-40 h-28 sm:h-24 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={rental.image}
                        alt={`${rental.make} ${rental.model}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                          <h4 className="text-gray-900 dark:text-white font-bold text-base sm:text-lg">
                            {rental.make} {rental.model}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300 text-xs rounded-lg">
                              {rental.transmission}
                            </span>
                            {(() => {
                              const config =
                                STATUS_CONFIG[rental.status] ||
                                STATUS_CONFIG.pending;
                              const StatusIcon = config.Icon;
                              return (
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-lg flex items-center gap-1 ${config.color}`}
                                >
                                  <StatusIcon size={12} />
                                  {config.label}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {rental.totalPrice}{" "}
                            <span className="text-gray-500 dark:text-slate-400 text-sm font-normal">
                              MAD
                            </span>
                          </p>
                          <p className="text-gray-500 dark:text-slate-500 text-xs">
                            {rental.dailyPrice} MAD × {rental.days} days
                            {rental.freeDays > 0 && (
                              <span className="text-green-600 dark:text-green-400 ml-1">
                                +{rental.freeDays} free
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Trip Info Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                          <Calendar
                            size={14}
                            className="text-indigo-500 dark:text-indigo-400 shrink-0"
                          />
                          <span className="truncate">
                            {rental.startDate} - {rental.returnDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                          <MapPin
                            size={14}
                            className="text-indigo-500 dark:text-indigo-400 shrink-0"
                          />
                          <span className="truncate">
                            {rental.pickupLocation}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                          <CreditCard
                            size={14}
                            className="text-indigo-500 dark:text-indigo-400 shrink-0"
                          />
                          <span>{rental.paymentMethod}</span>
                        </div>
                      </div>

                      {/* Documents Section */}
                      {(rental.idDocumentUrl ||
                        rental.drivingLicenseUrl ||
                        rental.passportUrl) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                          <p className="text-gray-500 dark:text-slate-400 text-xs uppercase mb-2 flex items-center gap-1">
                            <FileText size={12} /> Documents
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {rental.idDocumentUrl && (
                              <a
                                href={rental.idDocumentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 dark:bg-slate-700/50 dark:text-slate-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                              >
                                ID Card <ExternalLink size={10} />
                              </a>
                            )}
                            {rental.drivingLicenseUrl && (
                              <a
                                href={rental.drivingLicenseUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 dark:bg-slate-700/50 dark:text-slate-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                              >
                                License <ExternalLink size={10} />
                              </a>
                            )}
                            {rental.passportUrl && (
                              <a
                                href={rental.passportUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 dark:bg-slate-700/50 dark:text-slate-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                              >
                                Passport <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Review Button for Completed Rentals */}
                      {rental.isFinished && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                          <button
                            onClick={() => openReviewForm(rental.id)}
                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Write a Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Form Modal */}
        {reviewForm.showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Write a Review
              </h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setReviewForm((prev) => ({ ...prev, rating: star }))
                        }
                        className="text-2xl focus:outline-none"
                      >
                        {star <= reviewForm.rating ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    placeholder="Share your experience with this rental..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeReviewForm}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview || !reviewForm.comment.trim()}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
