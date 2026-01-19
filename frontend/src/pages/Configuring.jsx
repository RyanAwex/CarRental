import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/carStore";
import { useDataStore } from "../store/dataStore";
import { PICKUP_LOCATIONS } from "../store/locations";
import {
  Trash2,
  Calendar,
  CreditCard,
  Banknote,
  Wallet,
  ChevronRight,
  Car,
  ChevronDown,
  X,
  MapPin,
  AlertCircle,
  Gift,
  Shield,
  Check,
} from "lucide-react";
import { getPrice } from "../store/days";
import SharedHeader from "../components/shared/SharedHeader";
import supabase from "../config/supabase-client";

const paymentMethods = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Credit/Debit Card", icon: CreditCard },
  { id: "paypal", label: "PayPal", icon: Wallet },
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function Configuring() {
  const {
    cart,
    data: cartData,
    removeFromCart,
    updateCartData,
  } = useCartStore();
  const navigate = useNavigate();

  // Location state
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const locationRef = useRef(null);

  // Date picker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const datePickerRef = useRef(null);

  // Payment and booking state
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Insurance state
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const { insuranceOptions, fetchInsuranceOptions } = useDataStore();

  // Fetch insurance options on mount
  useEffect(() => {
    fetchInsuranceOptions();
  }, [fetchInsuranceOptions]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toSafeDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === "string") {
      // If it's already an ISO string, let Date parse it.
      if (value.includes("T")) return new Date(value);
      // If it's a storage date (YYYY-MM-DD), add a midday time to avoid TZ shift.
      return new Date(`${value}T12:00:00`);
    }
    return new Date(value);
  };

  const resolveLocationFromCartData = (data) => {
    if (!data) return null;

    // New format
    if (data.pickupLocationId) {
      const match = PICKUP_LOCATIONS.find(
        (l) => l.id === data.pickupLocationId,
      );
      if (match) return match;
    }

    // Legacy format (object stored in cart data)
    const legacyName = data.location?.name;
    if (legacyName) {
      const match = PICKUP_LOCATIONS.find((l) => l.name === legacyName);
      if (match) return match;
    }

    const legacyId = data.location?.id;
    if (legacyId === "airport" || legacyId === "train" || legacyId === "port") {
      const match = PICKUP_LOCATIONS.find((l) => l.type === legacyId);
      if (match) return match;
    }

    return null;
  };

  // Initialize from cart data if available
  useEffect(() => {
    if (cartData) {
      if (cartData.startDate) setStartDate(toSafeDate(cartData.startDate));
      if (cartData.endDate) setEndDate(toSafeDate(cartData.endDate));

      const initialLocation = resolveLocationFromCartData(cartData);
      if (initialLocation) setSelectedLocation(initialLocation);

      if (cartData.paymentMethod) setPaymentMethod(cartData.paymentMethod);
    }
  }, [cartData]);

  // Fetch existing bookings for this car
  useEffect(() => {
    const fetchBookings = async () => {
      if (!cart?.id) return;

      setBookingsLoading(true);
      try {
        // Use car_availability view to bypass RLS restrictions
        const { data, error } = await supabase
          .from("car_availability")
          .select("start_date, end_date, return_date, status")
          .eq("car_id", cart.id);

        if (error) throw error;
        setBookings(data || []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, [cart?.id]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is inside the portal dropdowns
      const isInsideLocationPortal = event.target.closest(
        '[data-portal="location"]',
      );
      const isInsideDatePortal = event.target.closest('[data-portal="date"]');

      if (
        locationRef.current &&
        !locationRef.current.contains(event.target) &&
        !isInsideLocationPortal
      ) {
        setIsLocationOpen(false);
      }
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target) &&
        !isInsideDatePortal
      ) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("no-scrollbar");
    document.body.classList.add("no-scrollbar");
    return () => {
      document.documentElement.classList.remove("no-scrollbar");
      document.body.classList.remove("no-scrollbar");
    };
  }, []);

  // Check if selected dates overlap with existing bookings
  const checkDateConflict = useCallback(() => {
    if (!startDate || !endDate || bookings.length === 0) return null;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    for (const booking of bookings) {
      const bookingStart = toSafeDate(booking.start_date);
      bookingStart.setHours(0, 0, 0, 0);
      // Use return_date for blocking (includes free days), fall back to end_date
      const bookingEnd = toSafeDate(booking.return_date || booking.end_date);
      bookingEnd.setHours(23, 59, 59, 999);

      // Check for overlap
      if (start <= bookingEnd && end >= bookingStart) {
        return { start: bookingStart, end: bookingEnd };
      }
    }
    return null;
  }, [startDate, endDate, bookings]);

  const dateConflict = useMemo(() => checkDateConflict(), [checkDateConflict]);

  // Check if a specific date is booked
  const isDateBooked = useCallback(
    (date) => {
      if (!date || bookings.length === 0) return false;

      const checkDate = new Date(date);
      checkDate.setHours(12, 0, 0, 0);

      return bookings.some((booking) => {
        const bookingStart = toSafeDate(booking.start_date);
        bookingStart.setHours(0, 0, 0, 0);
        // Use return_date for blocking (includes free days), fall back to end_date
        const bookingEnd = toSafeDate(booking.return_date || booking.end_date);
        bookingEnd.setHours(23, 59, 59, 999);

        return checkDate >= bookingStart && checkDate <= bookingEnd;
      });
    },
    [bookings],
  );

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Generate calendar days
  const generateCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const calendarDays = generateCalendarDays(currentYear, currentMonth);

  const handleDateClick = (date) => {
    if (!date || date < today) return;

    if (!startDate || (startDate && endDate) || date < startDate) {
      setStartDate(date);
      setEndDate(null);
      setSelectingEnd(true);
    } else {
      setEndDate(date);
      setSelectingEnd(false);
      setIsDatePickerOpen(false);
    }
  };

  const isInRange = (date) => {
    if (!date || !startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectingEnd(false);
  };

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleRemove = () => {
    removeFromCart();
    navigate("/");
  };

  // Get free days calculation from store
  const { calculateFreeDays } = useDataStore();

  // Calculate rental days
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const rentalDays = calculateDays();
  const dailyPrice = cart ? getPrice(cart) : 0;
  const freeDays = calculateFreeDays(rentalDays);
  const discountAmount = freeDays * dailyPrice;

  // Calculate insurance cost
  const insuranceCost = selectedInsurance
    ? selectedInsurance.price_per_day * rentalDays
    : 0;

  // Total = rental price + insurance (free days are bonus, not subtracted)
  const totalPrice = rentalDays * dailyPrice + insuranceCost;

  // Calculate return date (end date + free days)
  const getReturnDate = () => {
    if (!endDate || freeDays === 0) return null;
    const returnDate = new Date(endDate);
    returnDate.setDate(returnDate.getDate() + freeDays);
    return returnDate;
  };
  const returnDate = getReturnDate();

  const canContinue = rentalDays > 0 && !dateConflict && selectedLocation;

  const handleContinue = () => {
    if (!selectedLocation) {
      alert("Please select a pickup location");
      return;
    }
    if (!startDate || !endDate || rentalDays <= 0) {
      alert("Please select valid rental dates");
      return;
    }
    if (dateConflict) {
      alert("Selected dates overlap with an existing booking");
      return;
    }

    // Format dates as YYYY-MM-DD to avoid timezone issues
    const formatDateForStorage = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Save configuration data to store
    updateCartData({
      startDate: formatDateForStorage(startDate),
      endDate: formatDateForStorage(endDate),
      pickupLocationId: selectedLocation.id,
      pickupLocationName: selectedLocation.name,
      rentalDays,
      paymentMethod,
      dailyPrice,
      freeDays,
      discountAmount,
      insurance: selectedInsurance
        ? {
            id: selectedInsurance.id,
            name: selectedInsurance.name,
            pricePerDay: selectedInsurance.price_per_day,
            totalCost: insuranceCost,
          }
        : null,
      totalPrice,
    });
    navigate("/checkout");
  };

  // If no car in cart, show empty state
  if (!cart) {
    return (
      <>
        <SharedHeader showBackButton backTo="/" showNav={false} />
        <div className="w-full h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-gray-900 dark:text-white">
          <div className="p-6 rounded-full bg-gray-100 dark:bg-slate-800 mb-6">
            <Car size={48} className="text-gray-400 dark:text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4">No car selected</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6 text-center max-w-md">
            Please select a car from our fleet to configure your trip.
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

  return (
    <div className="w-full min-h-screen bg-white dark:bg-slate-950">
      <SharedHeader
        title={`${cart.make} ${cart.model}`}
        subtitle="Configure your rental"
        showBackButton
        backTo="/"
        showNav={false}
      />

      <section className="w-full py-8 px-4 flex flex-col items-center gap-6 max-w-5xl mx-auto">
        {/* Car Card - Compact */}
        <div className="w-full p-4 sm:p-6 flex flex-col sm:flex-row bg-gray-50 dark:bg-slate-800/50 backdrop-blur rounded-2xl gap-4 sm:gap-6 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-none">
          <div className="w-full sm:w-48 h-32 sm:h-auto shrink-0">
            <img
              src={cart.image_urls?.[0] || "placeholder-car.jpg"}
              alt={`${cart.make} ${cart.model}`}
              className="w-full h-full rounded-xl object-contain"
            />
          </div>
          <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {cart.make} {cart.model}
              </h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm">
                {cart.year} • {cart.category} • {cart.transmission}
              </p>
              <div className="text-indigo-600 dark:text-indigo-400 text-lg font-bold mt-2">
                {dailyPrice}{" "}
                <span className="text-gray-400 dark:text-slate-500 text-sm font-normal">
                  MAD/day
                </span>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2.5 rounded-xl font-medium transition-all w-fit"
            >
              <Trash2 size={16} />
              Remove
            </button>
          </div>
        </div>

        {/* Date Conflict Warning */}
        {dateConflict && (
          <div className="w-full p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-400 font-bold">
                Car not available for selected dates
              </p>
              <p className="text-red-300/80 text-sm mt-1">
                This car is already booked from{" "}
                <span className="font-semibold">
                  {formatFullDate(dateConflict.start)}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {formatFullDate(dateConflict.end)}
                </span>
                . Please select different dates.
              </p>
            </div>
          </div>
        )}

        {/* Existing Bookings Info */}
        {bookings.length > 0 && !bookingsLoading && (
          <div className="w-full p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
            <p className="text-amber-400 font-medium text-sm mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Existing reservations for this vehicle:
            </p>
            <div className="flex flex-wrap gap-2">
              {bookings.map((booking, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-amber-500/20 text-black/50 dark:text-amber-400 rounded-lg text-xs font-medium"
                >
                  {formatFullDate(toSafeDate(booking.start_date))} to{" "}
                  {formatFullDate(toSafeDate(booking.end_date))}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Two Column Layout on Desktop */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-3 space-y-6">
            {/* Pickup Location */}
            <div className="p-5 bg-gray-50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin
                  size={18}
                  className="text-indigo-600 dark:text-indigo-400"
                />
                Pickup Location
              </h3>
              <div className="relative" ref={locationRef}>
                <button
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                  className="w-full h-12 rounded-xl bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-white/10 px-4 text-sm text-left outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer flex items-center justify-between"
                >
                  <span
                    className={
                      selectedLocation
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-slate-500"
                    }
                  >
                    {selectedLocation ? (
                      <span className="flex items-center gap-2">
                        {selectedLocation.Icon && (
                          <selectedLocation.Icon
                            size={16}
                            className="text-indigo-500 dark:text-indigo-300"
                          />
                        )}
                        <span>{selectedLocation.name}</span>
                      </span>
                    ) : (
                      "Select pickup location"
                    )}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 dark:text-slate-400 transition-transform ${
                      isLocationOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isLocationOpen &&
                  createPortal(
                    <div
                      data-portal="location"
                      className="fixed bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden"
                      style={{
                        zIndex: 9999,
                        top:
                          locationRef.current?.getBoundingClientRect().bottom +
                          8,
                        left: locationRef.current?.getBoundingClientRect().left,
                        width:
                          locationRef.current?.getBoundingClientRect().width,
                      }}
                    >
                      {PICKUP_LOCATIONS.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => {
                            setSelectedLocation(location);
                            setIsLocationOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-600/20 ${
                            selectedLocation?.id === location.id
                              ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-600/30 dark:text-indigo-300"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {location.Icon && (
                            <location.Icon
                              size={18}
                              className="text-indigo-500 dark:text-indigo-300"
                            />
                          )}
                          <span>{location.name}</span>
                        </button>
                      ))}
                    </div>,
                    document.body,
                  )}
              </div>
            </div>

            {/* Rental Duration - Hero Style */}
            <div className="p-5 bg-gray-50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar
                  size={18}
                  className="text-indigo-600 dark:text-indigo-400"
                />
                Rental Dates
              </h3>

              <div className="relative" ref={datePickerRef}>
                <button
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className="w-full h-12 rounded-xl bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-white/10 px-4 text-sm text-left outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer flex items-center justify-between"
                >
                  <span
                    className={
                      startDate
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-slate-500"
                    }
                  >
                    {startDate ? (
                      <span className="flex items-center gap-2">
                        <span>{formatDate(startDate)}</span>
                        <span className="text-gray-400 dark:text-slate-400">
                          →
                        </span>
                        <span>
                          {endDate ? formatDate(endDate) : "Select end date"}
                        </span>
                      </span>
                    ) : (
                      "Select rental dates"
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    {startDate && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearDates();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            clearDates();
                          }
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                      >
                        <X
                          size={14}
                          className="text-gray-400 dark:text-slate-400"
                        />
                      </span>
                    )}
                    <Calendar
                      size={16}
                      className="text-gray-400 dark:text-slate-400"
                    />
                  </div>
                </button>

                {/* Date Picker Dropdown */}
                {isDatePickerOpen &&
                  createPortal(
                    <div
                      data-portal="date"
                      className="fixed bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-4"
                      style={{
                        zIndex: 9999,
                        // Check if there's enough space below (350px for calendar height)
                        ...(window.innerHeight -
                          (datePickerRef.current?.getBoundingClientRect()
                            .bottom || 0) <
                        350
                          ? {
                              // Position above the button
                              bottom:
                                window.innerHeight -
                                (datePickerRef.current?.getBoundingClientRect()
                                  .top || 0) +
                                8,
                            }
                          : {
                              // Position below the button
                              top:
                                (datePickerRef.current?.getBoundingClientRect()
                                  .bottom || 0) + 8,
                            }),
                        left: Math.min(
                          Math.max(
                            16,
                            datePickerRef.current?.getBoundingClientRect()
                              .left || 0,
                          ),
                          window.innerWidth - 320,
                        ),
                        minWidth: 300,
                      }}
                    >
                      {/* Month Navigation */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => navigateMonth("prev")}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          <ChevronDown size={18} className="rotate-90" />
                        </button>
                        <span className="text-gray-900 dark:text-white font-semibold">
                          {monthNames[currentMonth]} {currentYear}
                        </span>
                        <button
                          onClick={() => navigateMonth("next")}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          <ChevronDown size={18} className="-rotate-90" />
                        </button>
                      </div>

                      {/* Weekday Headers */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                          (day) => (
                            <div
                              key={day}
                              className="text-center text-xs text-gray-400 dark:text-slate-500 font-medium py-1"
                            >
                              {day}
                            </div>
                          ),
                        )}
                      </div>

                      {/* Calendar Days */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((date, index) => {
                          const isPast = date && date < today;
                          const isBooked = isDateBooked(date);
                          const isStart =
                            date &&
                            startDate &&
                            date.toDateString() === startDate.toDateString();
                          const isEnd =
                            date &&
                            endDate &&
                            date.toDateString() === endDate.toDateString();
                          const inRange = isInRange(date);

                          return (
                            <button
                              key={index}
                              onClick={() => !isBooked && handleDateClick(date)}
                              disabled={!date || isPast || isBooked}
                              className={`
                              h-9 w-9 rounded-lg text-sm font-medium transition-all relative
                              ${!date ? "invisible" : ""}
                              ${
                                isPast
                                  ? "text-gray-300 dark:text-slate-600 cursor-not-allowed"
                                  : ""
                              }
                              ${
                                isBooked
                                  ? "text-red-400/50 cursor-not-allowed bg-red-100 dark:bg-red-500/10"
                                  : ""
                              }
                              ${isStart ? "bg-indigo-600 text-white" : ""}
                              ${isEnd ? "bg-indigo-600 text-white" : ""}
                              ${
                                inRange
                                  ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-600/30 dark:text-indigo-300"
                                  : ""
                              }
                              ${
                                !isPast &&
                                !isBooked &&
                                !isStart &&
                                !isEnd &&
                                !inRange &&
                                date
                                  ? "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                                  : ""
                              }
                            `}
                            >
                              {date?.getDate()}
                              {isBooked && date && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-400 rounded-full" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-slate-400">
                          {selectingEnd && startDate
                            ? "Select end date"
                            : "Select start date"}
                        </span>
                        <div className="flex items-center gap-2 text-red-400/70">
                          <span className="w-2 h-2 bg-red-200 dark:bg-red-500/30 rounded" />
                          <span>Booked</span>
                        </div>
                      </div>
                    </div>,
                    document.body,
                  )}
              </div>

              {rentalDays > 0 && !dateConflict && (
                <div className="mt-4 p-3 bg-indigo-100 dark:bg-indigo-600/20 rounded-xl border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between">
                  <span className="text-indigo-600 dark:text-indigo-300 text-sm">
                    Rental duration
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {rentalDays} {rentalDays === 1 ? "day" : "days"}
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="p-5 bg-gray-50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard
                  size={18}
                  className="text-indigo-600 dark:text-indigo-400"
                />
                Payment Method
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        paymentMethod === method.id
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                          : "bg-gray-100 dark:bg-slate-700/50 border-gray-300 dark:border-white/10 text-gray-600 dark:text-slate-300 hover:border-indigo-500/50"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium text-sm">
                        {method.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Insurance Add-ons */}
            {insuranceOptions.length > 0 && (
              <div className="p-5 bg-gray-50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield
                    size={18}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  Insurance Add-ons
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-normal ml-1">
                    (Optional)
                  </span>
                </h3>
                <div className="space-y-3">
                  {/* No Insurance Option */}
                  <button
                    onClick={() => setSelectedInsurance(null)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      selectedInsurance === null
                        ? "bg-gray-200 dark:bg-slate-700 border-gray-400 dark:border-slate-500 text-gray-900 dark:text-white"
                        : "bg-gray-100 dark:bg-slate-700/30 border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-500/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedInsurance === null
                            ? "border-indigo-400 bg-indigo-600"
                            : "border-gray-400 dark:border-slate-500"
                        }`}
                      >
                        {selectedInsurance === null && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                      <span className="font-medium text-sm">No Insurance</span>
                    </div>
                    <span className="text-sm font-bold">0 MAD</span>
                  </button>

                  {/* Insurance Options */}
                  {insuranceOptions.map((insurance) => (
                    <button
                      key={insurance.id}
                      onClick={() => setSelectedInsurance(insurance)}
                      className={`w-full flex items-start justify-between p-4 rounded-xl border transition-all ${
                        selectedInsurance?.id === insurance.id
                          ? "bg-indigo-100 dark:bg-indigo-600/20 border-indigo-300 dark:border-indigo-500 text-gray-900 dark:text-white"
                          : "bg-gray-100 dark:bg-slate-700/30 border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            selectedInsurance?.id === insurance.id
                              ? "border-indigo-400 bg-indigo-600"
                              : "border-gray-400 dark:border-slate-500"
                          }`}
                        >
                          {selectedInsurance?.id === insurance.id && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <div className="text-left">
                          <span className="font-medium text-sm block">
                            {insurance.name}
                          </span>
                          {insurance.description && (
                            <span className="text-xs text-gray-500 dark:text-slate-400 block mt-1">
                              {insurance.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {insurance.price_per_day} MAD
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 block">
                          /day
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Insurance Cost Preview */}
                {selectedInsurance && rentalDays > 0 && (
                  <div className="mt-4 p-3 bg-indigo-100 dark:bg-indigo-600/10 rounded-xl border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between">
                    <span className="text-indigo-600 dark:text-indigo-300 text-sm">
                      {selectedInsurance.name} × {rentalDays} days
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {insuranceCost} MAD
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-2">
            <div className="p-5 bg-gray-50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-gray-200 dark:border-white/10 sticky top-24 shadow-md dark:shadow-none">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400">
                    Pickup Location
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {selectedLocation
                      ? selectedLocation.name.split(" ")[0]
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400">
                    Dates
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {startDate && endDate
                      ? `${formatDate(startDate)} → ${formatDate(endDate)}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400">
                    Daily Rate
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {dailyPrice} MAD
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400">
                    Rental Days
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {rentalDays || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400">
                    Payment
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium capitalize">
                    {paymentMethod}
                  </span>
                </div>

                {/* Insurance Info */}
                {selectedInsurance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-slate-400">
                      Insurance
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                      {selectedInsurance.name} (+{insuranceCost} MAD)
                    </span>
                  </div>
                )}

                {/* Free Days Bonus */}
                {freeDays > 0 && rentalDays > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div className="flex items-center gap-2 text-green-400 font-medium text-sm mb-1">
                      <Gift size={16} />
                      <span>
                        {freeDays} Free Day{freeDays > 1 ? "s" : ""} Applied!
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-300/70">You Save</span>
                      <span className="text-green-400 font-medium">
                        {discountAmount} MAD
                      </span>
                    </div>
                    {returnDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-300/70">Return Date</span>
                        <span className="text-green-400 font-medium">
                          {returnDate.toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <hr className="border-gray-200 dark:border-white/10" />
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span
                    className={
                      dateConflict
                        ? "text-red-500 dark:text-red-400"
                        : "text-indigo-600 dark:text-indigo-400"
                    }
                  >
                    {rentalDays > 0 ? `${totalPrice} MAD` : "-"}
                  </span>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
                  canContinue
                    ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] cursor-pointer"
                    : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                }`}
              >
                {dateConflict ? "Dates Unavailable" : "Continue to Checkout"}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Configuring;
