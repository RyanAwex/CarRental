import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/carStore";
import { useAuthStore } from "../store/authStore";
import supabase from "../config/supabase-client";
import { uploadAndVerifyDocument } from "../utils/documentVerification";
import {
  Upload,
  CreditCard,
  User,
  CheckCircle,
  Car,
  Shield,
  Calendar,
  Banknote,
  Mail,
  Gift,
  AlertTriangle,
} from "lucide-react";
import SharedHeader from "../components/shared/SharedHeader";

// Format date string (YYYY-MM-DD) to readable format
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T12:00:00"); // Add noon time to avoid timezone issues
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function Checkout() {
  const { cart, data, removeFromCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add("no-scrollbar");
    document.body.classList.add("no-scrollbar");
    return () => {
      document.documentElement.classList.remove("no-scrollbar");
      document.body.classList.remove("no-scrollbar");
    };
  }, []);

  // Personal Info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Card Details (only for card payment)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  // PayPal (only for paypal)
  const [paypalEmail, setPaypalEmail] = useState("");

  // Document Uploads
  const [idDocument, setIdDocument] = useState(null);
  const [drivingLicense, setDrivingLicense] = useState(null);
  const [passport, setPassport] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect if no cart or data
  if (!cart || !data) {
    return (
      <>
        <SharedHeader showBackButton backTo="/" showNav={false} />
        <div className="w-full h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-gray-900 dark:text-white">
          <div className="p-6 rounded-full bg-gray-100 dark:bg-slate-800 mb-6">
            <Car size={48} className="text-gray-400 dark:text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4">No booking to complete</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6 text-center max-w-md">
            Please select a car and configure your trip first.
          </p>
          <Link
            to="/"
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-full text-sm font-bold transition-all text-white"
          >
            Browse Cars
          </Link>
        </div>
      </>
    );
  }

  const handleFileChange = (setter) => (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert("File size must be less than 5MB. Please choose a smaller file.");
        return;
      }
      setter(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!fullName || !email || !phone || !address || !city) {
      alert("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    if (!idDocument || !drivingLicense) {
      alert("Please upload your ID and Driving License");
      setIsSubmitting(false);
      return;
    }

    if (
      data.paymentMethod === "card" &&
      (!cardNumber || !cardExpiry || !cardCvc || !cardName)
    ) {
      alert("Please fill in all card details");
      setIsSubmitting(false);
      return;
    }

    if (data.paymentMethod === "paypal" && !paypalEmail) {
      alert("Please enter your PayPal email");
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload documents to Supabase Storage (no verification)
      const uploadDocument = async (file, docType) => {
        if (!file) return null;
        const result = await uploadAndVerifyDocument(file, user.id, docType);
        return result.url;
      };

      // Upload all documents
      const [idUrl, licenseUrl, passportUrl] = await Promise.all([
        uploadDocument(idDocument, "id"),
        uploadDocument(drivingLicense, "license"),
        uploadDocument(passport, "passport"),
      ]);

      // Calculate actual return date (end_date + free_days)
      const calculateReturnDate = () => {
        if (!data.freeDays || data.freeDays === 0) return data.endDate;
        const endDate = new Date(`${data.endDate}T12:00:00`);
        endDate.setDate(endDate.getDate() + data.freeDays);
        const year = endDate.getFullYear();
        const month = String(endDate.getMonth() + 1).padStart(2, "0");
        const day = String(endDate.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // Save rental to Supabase with document URLs
      const { error } = await supabase
        .from("rentals")
        .insert({
          user_id: user?.id,
          car_id: cart.id,
          car_make: cart.make,
          car_model: cart.model,
          car_image: cart.image_urls?.[0] || null,
          car_transmission: cart.transmission || "Automatic",
          start_date: data.startDate,
          end_date: data.endDate,
          return_date: calculateReturnDate(),
          rental_days: data.rentalDays,
          free_days: data.freeDays || 0,
          daily_price: data.dailyPrice,
          total_price: data.totalPrice,
          payment_method: data.paymentMethod,
          pickup_location:
            data.pickupLocationName || data.location?.name || city,
          insurance_name: data.insurance?.name || null,
          insurance_price_per_day: data.insurance?.pricePerDay || null,
          insurance_total: data.insurance?.totalCost || null,
          status: "pending",
          id_document_url: idUrl,
          driving_license_url: licenseUrl,
          passport_url: passportUrl,
        })
        .select()
        .single();

      if (error) throw error;

      setIsSuccess(true);
      // Clear cart after successful order
      setTimeout(() => {
        removeFromCart();
        navigate("/profile");
      }, 7000);
    } catch (err) {
      console.error("Error creating rental:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-gray-900 dark:text-white">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl" />
          <CheckCircle size={80} className="text-green-500 relative" />
        </div>
        <h2 className="text-3xl font-bold mt-8 mb-4">Booking Confirmed!</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-2">
          Your {cart.make} {cart.model} has been reserved and{" "}
          <span className="text-gray-900 dark:text-white">
            our team will contact you shortly
          </span>
          .
        </p>
        <p className="text-gray-500 dark:text-slate-400 mb-4">
          Your invoice PDF has been downloaded automatically.
        </p>
        <p className="text-gray-500 dark:text-slate-400 mb-4">
          {formatDisplayDate(data.startDate)} to{" "}
          {formatDisplayDate(
            data.freeDays > 0
              ? (() => {
                  const endDate = new Date(`${data.endDate}T12:00:00`);
                  endDate.setDate(endDate.getDate() + data.freeDays);
                  return `${endDate.getFullYear()}-${String(
                    endDate.getMonth() + 1,
                  ).padStart(2, "0")}-${String(endDate.getDate()).padStart(
                    2,
                    "0",
                  )}`;
                })()
              : data.endDate,
          )}{" "}
          ({data.rentalDays} days
          {data.freeDays > 0 && (
            <span className="text-green-500 dark:text-green-400">
              {" "}
              + {data.freeDays} free
            </span>
          )}
          )
        </p>
        {data.insurance && (
          <p className="text-indigo-600 dark:text-indigo-300 mb-4 flex items-center justify-center gap-2">
            <Shield size={16} />
            {data.insurance.name} Insurance Included
          </p>
        )}
        <p className="text-indigo-600 dark:text-indigo-400 text-2xl font-bold mb-6">
          Total: {data.totalPrice} MAD
        </p>
        <div className="flex items-center gap-2 text-gray-400 dark:text-slate-500 text-sm">
          <Shield size={16} />
          Redirecting to home...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white dark:bg-slate-950">
      <SharedHeader
        title="Complete Booking"
        subtitle={`${cart.make} ${cart.model}`}
        showBackButton
        backTo="/configuring"
        showNav={false}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
            {/* Personal Information */}
            <div className="p-5 bg-gray-50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User
                  size={18}
                  className="text-indigo-600 dark:text-indigo-400"
                />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 dark:text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-gray-100 dark:bg-slate-700/50 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 dark:text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-gray-100 dark:bg-slate-700/50 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 dark:text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+212 600 000 000"
                    className="w-full bg-gray-100 dark:bg-slate-700/50 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 dark:text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Casablanca"
                    className="w-full bg-gray-100 dark:bg-slate-700/50 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-500 dark:text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street, Apt 4B"
                    className="w-full bg-gray-100 dark:bg-slate-700/50 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 dark:text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="20000"
                    className="w-full bg-gray-100 dark:bg-slate-700/50 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Details - Card */}
            {data.paymentMethod === "card" && (
              <div className="p-5 bg-gray-50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard
                    size={18}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  Card Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-gray-500 dark:text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full bg-gray-100 dark:bg-slate-700/50 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-500 dark:text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                      Name on Card *
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="JOHN DOE"
                      className="w-full bg-gray-100 dark:bg-slate-700/50 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 dark:text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full bg-gray-100 dark:bg-slate-700/50 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 dark:text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                      CVC *
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="w-full bg-gray-100 dark:bg-slate-700/50 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details - PayPal */}
            {data.paymentMethod === "paypal" && (
              <div className="p-5 bg-gray-50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Mail
                    size={18}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  PayPal Information
                </h3>
                <div>
                  <label className="block text-gray-500 dark:text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    PayPal Email *
                  </label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="your-paypal@email.com"
                    className="w-full bg-gray-100 dark:bg-slate-700/50 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <p className="text-gray-400 dark:text-slate-500 text-sm mt-3">
                  You will receive a PayPal invoice to complete the payment.
                </p>
              </div>
            )}

            {/* Cash Payment Info */}
            {data.paymentMethod === "cash" && (
              <div className="p-5 bg-gray-50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Banknote
                    size={18}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  Cash Payment
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                  Payment will be collected upon vehicle pickup. Please bring
                  the exact amount in cash.
                </p>
                <div className="mt-4 p-3 bg-indigo-100 dark:bg-indigo-600/20 rounded-xl border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between">
                  <span className="text-indigo-600 dark:text-indigo-300 text-sm">
                    Amount due at pickup
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {data.totalPrice} MAD
                  </span>
                </div>
              </div>
            )}

            {/* Document Uploads */}
            <div className="p-5 bg-gray-50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Upload
                  size={18}
                  className="text-indigo-600 dark:text-indigo-400"
                />
                Required Documents
              </h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
                Please upload clear photos or scans of your documents.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* ID Document */}
                <div>
                  <label className="block text-gray-500 dark:text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    ID Card / CIN *
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-28 bg-gray-100 dark:bg-slate-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-indigo-500 cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange(setIdDocument)}
                      className="hidden"
                    />
                    {idDocument ? (
                      <div className="text-center">
                        <CheckCircle
                          size={20}
                          className="text-green-500 mx-auto mb-1"
                        />
                        <span className="text-green-500 dark:text-green-400 text-xs">
                          {idDocument.name.slice(0, 12)}...
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload
                          size={20}
                          className="text-gray-400 dark:text-slate-500 mx-auto mb-1"
                        />
                        <span className="text-gray-400 dark:text-slate-500 text-xs">
                          Upload ID
                        </span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Driving License */}
                <div>
                  <label className="block text-gray-500 dark:text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    Driving License *
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-28 bg-gray-100 dark:bg-slate-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-indigo-500 cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange(setDrivingLicense)}
                      className="hidden"
                    />
                    {drivingLicense ? (
                      <div className="text-center">
                        <CheckCircle
                          size={20}
                          className="text-green-500 mx-auto mb-1"
                        />
                        <span className="text-green-500 dark:text-green-400 text-xs">
                          {drivingLicense.name.slice(0, 12)}...
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload
                          size={20}
                          className="text-gray-400 dark:text-slate-500 mx-auto mb-1"
                        />
                        <span className="text-gray-400 dark:text-slate-500 text-xs">
                          Upload License
                        </span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Passport (Optional) */}
                <div>
                  <label className="block text-gray-500 dark:text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    Passport (Optional)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-28 bg-gray-100 dark:bg-slate-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-indigo-500 cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange(setPassport)}
                      className="hidden"
                    />
                    {passport ? (
                      <div className="text-center">
                        <CheckCircle
                          size={20}
                          className="text-green-500 mx-auto mb-1"
                        />
                        <span className="text-green-500 dark:text-green-400 text-xs">
                          {passport.name.slice(0, 12)}...
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload
                          size={20}
                          className="text-gray-400 dark:text-slate-500 mx-auto mb-1"
                        />
                        <span className="text-gray-400 dark:text-slate-500 text-xs">
                          Upload Passport
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button - Mobile */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`lg:hidden w-full py-4 rounded-xl font-bold text-base transition-all ${
                isSubmitting
                  ? "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
              }`}
            >
              {isSubmitting
                ? "Processing..."
                : `Confirm Booking - ${data.totalPrice} MAD`}
            </button>
          </form>

          {/* Right Column - Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-5 bg-gray-50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-gray-200 dark:border-white/10 shadow-md dark:shadow-none">
              {/* Car Preview */}
              <div className="mb-4">
                <img
                  src={cart.image_urls?.[0] || "placeholder-car.jpg"}
                  alt={`${cart.make} ${cart.model}`}
                  className="w-full h-32 object-contain rounded-xl"
                />
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {cart.make} {cart.model}
              </h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
                {cart.year} • {cart.category}
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar size={14} /> Dates
                  </span>
                  <span className="text-gray-900 dark:text-white text-right">
                    {formatDisplayDate(data.startDate)}
                    <br />
                    <span className="text-gray-400 dark:text-slate-500">
                      to
                    </span>{" "}
                    {formatDisplayDate(data.endDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">
                    Duration
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {data.rentalDays} {data.rentalDays === 1 ? "day" : "days"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">
                    Daily Rate
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {data.dailyPrice} MAD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">
                    Payment
                  </span>
                  <span className="text-gray-900 dark:text-white capitalize">
                    {data.paymentMethod}
                  </span>
                </div>

                {/* Insurance Info */}
                {data.insurance && (
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                    <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm mb-1">
                      <Shield size={16} />
                      <span>{data.insurance.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-300/70">
                        {data.insurance.pricePerDay} MAD × {data.rentalDays}{" "}
                        days
                      </span>
                      <span className="text-indigo-400 font-medium">
                        +{data.insurance.totalCost} MAD
                      </span>
                    </div>
                  </div>
                )}

                {/* Free Days Bonus */}
                {data.freeDays > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div className="flex items-center gap-2 text-green-400 font-medium text-sm mb-1">
                      <Gift size={16} />
                      <span>
                        {data.freeDays} Free Day{data.freeDays > 1 ? "s" : ""}{" "}
                        Applied!
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-300/70">You Save</span>
                      <span className="text-green-400 font-medium">
                        {data.discountAmount} MAD
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-300/70">Return Date</span>
                      <span className="text-green-400 font-medium">
                        {formatDisplayDate(
                          (() => {
                            const endDate = new Date(
                              `${data.endDate}T12:00:00`,
                            );
                            endDate.setDate(endDate.getDate() + data.freeDays);
                            return `${endDate.getFullYear()}-${String(
                              endDate.getMonth() + 1,
                            ).padStart(2, "0")}-${String(
                              endDate.getDate(),
                            ).padStart(2, "0")}`;
                          })(),
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <hr className="border-gray-200 dark:border-white/10" />
                <div className="flex justify-between text-base font-bold pt-1">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {data.totalPrice} MAD
                  </span>
                </div>
              </div>

              {/* Submit Button - Desktop */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`hidden lg:block w-full mt-6 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  isSubmitting
                    ? "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                }`}
              >
                {isSubmitting ? "Processing..." : "Confirm Booking"}
              </button>

              <p className="text-gray-400 dark:text-slate-500 text-center text-xs mt-4 hidden lg:block">
                By confirming, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
