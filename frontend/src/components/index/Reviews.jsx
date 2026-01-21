import React, { useEffect, useRef } from "react";
import { useReviewsStore } from "../../store/reviewsStore";

function Reviews() {
  const { reviews, reviewsLoading, reviewsError, fetchReviews } =
    useReviewsStore();
  const scrollRef = useRef(null);

  const currentLanguage = localStorage.getItem("lang") || "eg";
  const isArabic = currentLanguage === "ar";
  const isFrench = currentLanguage === "fr";

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={
          i < rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
        }
      >
        ★
      </span>
    ));
  };

  if (reviewsLoading) {
    return (
      <div className="py-16 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-slate-400">
              Loading reviews...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (reviewsError) {
    return (
      <div className="py-16 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">
              Error loading reviews: {reviewsError}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-16 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Customer Reviews
            </h2>
            <p className="text-gray-500 dark:text-slate-400">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-center text-3xl font-bold mb-8">
          {isFrench
            ? "Avis des Clients"
            : !isArabic
              ? "Customer Reviews"
              : "تقييمات العملاء"}
        </h2>
        <div className="overflow-x-auto custom-scrollbar px-4">
          <div
            ref={scrollRef}
            className="flex gap-6 p-4"
            style={{ width: "max-content", scrollSnapType: "x mandatory" }}
          >
            {reviews.map((review) => {
              const name = review.user?.email?.split("@")[0] || "Anonymous";
              const image = review.user?.avatar || review.image || null;
              const text = review.comment || review.review || "";
              return (
                <div
                  key={review.id}
                  className="bg-gray-100 dark:bg-[#151925] shadow-sm rounded-lg p-6 transform hover:scale-105 transition-all duration-300 shrink-0 w-[90vw] sm:w-80 lg:w-96"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-lg">{name}</h3>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating || 0)}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-slate-300 italic">
                    "{text}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Reviews;
