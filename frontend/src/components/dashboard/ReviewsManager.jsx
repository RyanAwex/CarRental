import React, { useEffect, useState } from "react";
import {
  Star,
  Trash2,
  Edit,
  User,
  MessageSquare,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useReviewsStore } from "../../store/reviewsStore";

function ReviewsManager() {
  const {
    reviews,
    reviewsLoading,
    reviewsError,
    fetchReviews,
    deleteReview,
    updateReview,
  } = useReviewsStore();

  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: "" });
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setDeletingId(reviewId);
    try {
      const result = await deleteReview(reviewId);
      if (!result.success) {
        alert(`Error deleting review: ${result.error}`);
      }
    } catch (error) {
      alert(`Error deleting review: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review.id);
    setEditForm({ rating: review.rating, comment: review.comment });
  };

  const handleUpdate = async () => {
    if (!editForm.comment.trim()) return;

    setUpdatingId(editingReview);
    try {
      const result = await updateReview(editingReview, {
        rating: editForm.rating,
        comment: editForm.comment.trim(),
      });

      if (result.success) {
        setEditingReview(null);
        setEditForm({ rating: 5, comment: "" });
      } else {
        alert(`Error updating review: ${result.error}`);
      }
    } catch (error) {
      alert(`Error updating review: ${error.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setEditForm({ rating: 5, comment: "" });
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onChange && onChange(i + 1)}
        className={`${
          interactive ? "cursor-pointer hover:scale-110" : ""
        } transition-transform`}
      >
        <Star
          size={interactive ? 24 : 16}
          className={`${
            i < rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300 dark:text-gray-600"
          }`}
        />
      </button>
    ));
  };

  if (reviewsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600 dark:text-slate-400">
          Loading reviews...
        </span>
      </div>
    );
  }

  if (reviewsError) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <p className="text-red-600 dark:text-red-400">
          Error loading reviews: {reviewsError}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reviews Management
          </h2>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Manage customer reviews and feedback
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {reviews.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-slate-400 ml-2">
              Total Reviews
            </span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700">
          <MessageSquare
            size={48}
            className="mx-auto text-gray-400 dark:text-slate-600 mb-4"
          />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-600 dark:text-slate-400">
            Reviews will appear here once customers start sharing their
            experiences.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-linear-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {review.user?.email?.charAt(0).toUpperCase() || (
                        <User size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {review.user?.email?.split("@")[0] || "Anonymous"}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                        <Calendar size={14} />
                        {new Date(review.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  {editingReview === review.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Rating
                        </label>
                        <div className="flex gap-1">
                          {renderStars(editForm.rating, true, (rating) =>
                            setEditForm((prev) => ({ ...prev, rating }))
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Comment
                        </label>
                        <textarea
                          value={editForm.comment}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              comment: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                          rows={4}
                          placeholder="Review comment..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdate}
                          disabled={
                            updatingId === review.id || !editForm.comment.trim()
                          }
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                        >
                          {updatingId === review.id && (
                            <Loader2 size={16} className="animate-spin" />
                          )}
                          Update Review
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1 mb-3">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-600 dark:text-slate-400">
                          ({review.rating}/5)
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                        "{review.comment}"
                      </p>
                    </>
                  )}
                </div>

                {/* Actions */}
                {editingReview !== review.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                      title="Edit review"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete review"
                    >
                      {deletingId === review.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewsManager;
