import {
  CheckCircle,
  MapPin,
  Search,
  Calendar,
  ChevronDown,
  X,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PICKUP_LOCATIONS } from "../../store/locations";

function Hero({ appData }) {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [popup, setPopup] = useState(null);

  // Show popup for 2 seconds
  const showPopup = (type, message) => {
    setPopup({ type, message });
    setTimeout(() => setPopup(null), 2500);
  };

  const locationRef = useRef(null);
  const datePickerRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsLocationOpen(false);
      }
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!appData) return <div className="h-screen bg-slate-900 animate-pulse" />;

  const { title, subtitle, buttonText, imageUrl } = appData;

  const lastSpaceIndex = title.lastIndexOf(" ");
  const firstPart = title.substring(0, lastSpaceIndex);
  const lastPart = title.substring(lastSpaceIndex + 1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDateForParam = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Generate calendar days
  const generateCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const calendarDays = generateCalendarDays(currentYear, currentMonth);
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

  return (
    <section
      id="home"
      className="relative pt-32 pb-32 lg:pt-24 lg:pb-8 lg:h-screen lg:min-h-175 flex items-center justify-center"
    >
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-600/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300/10 dark:bg-purple-600/10 rounded-full blur-[100px] -z-10" />

      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="w-full min-w-0">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300 text-xs font-bold mb-6 tracking-wide uppercase">
              <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2 animate-pulse"></span>
              Premium Collection {new Date().getFullYear()}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
              {firstPart}{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
                {lastPart}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
              {subtitle}
            </p>

            {/* Search / Booking Bar */}
            <div className="relative z-20 bg-white border border-gray-200 shadow-xl dark:bg-[#0b1020]/80 dark:border-white/10 dark:shadow-2xl backdrop-blur-xl p-4 sm:p-5 rounded-2xl w-full max-w-2xl transform hover:scale-[1.01] transition-transform">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3 items-end min-w-0">
                {/* Pickup Location */}
                <div className="col-span-1 relative min-w-0" ref={locationRef}>
                  <label className="text-[10px] text-gray-500 dark:text-slate-400 font-bold tracking-wider mb-1.5 flex items-center gap-1">
                    <MapPin
                      size={12}
                      className="text-indigo-600 dark:text-indigo-400"
                    />{" "}
                    PICKUP LOCATION
                  </label>
                  <button
                    onClick={() => setIsLocationOpen(!isLocationOpen)}
                    className="w-full h-11 rounded-xl bg-gray-50 border border-gray-300 dark:bg-[#0f1530] dark:border-white/10 px-3 text-sm text-left outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span
                      className={`overflow-hidden truncate mr-2 ${
                        selectedLocation
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-slate-500"
                      }`}
                    >
                      {selectedLocation ? (
                        <span className="flex items-center gap-2">
                          {selectedLocation.Icon && (
                            <selectedLocation.Icon
                              size={16}
                              className="text-indigo-300 shrink-0"
                            />
                          )}
                          <span className="truncate">
                            {selectedLocation.name}
                          </span>
                        </span>
                      ) : (
                        "Select location"
                      )}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 dark:text-slate-400 transition-transform ${
                        isLocationOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Location Dropdown */}
                  {isLocationOpen && (
                    <div className="fixed sm:absolute top-1/2 sm:top-full left-1/2 sm:left-0 -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 mt-0 sm:mt-2 bg-white border border-gray-200 dark:bg-[#0f1530] dark:border-white/10 rounded-xl shadow-2xl z-100 overflow-y-auto max-h-80 w-[85vw] sm:w-72 md:w-80 animate-in fade-in slide-in-from-top-2 ">
                      {PICKUP_LOCATIONS.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => {
                            setSelectedLocation(location);
                            setIsLocationOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-600/20 ${
                            selectedLocation?.id === location.id
                              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-600/30 dark:text-indigo-300"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {location.Icon && (
                            <location.Icon
                              size={16}
                              className="text-indigo-300 shrink-0"
                            />
                          )}
                          <span>{location.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Range Picker */}
                <div
                  className="col-span-1 relative min-w-0"
                  ref={datePickerRef}
                >
                  <label className="text-[10px] text-gray-500 dark:text-slate-400 font-bold tracking-wider mb-1.5 flex items-center gap-1">
                    <Calendar
                      size={12}
                      className="text-indigo-600 dark:text-indigo-400"
                    />{" "}
                    RENTAL DATES
                  </label>
                  <button
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="w-full h-11 rounded-xl bg-gray-50 border border-gray-300 dark:bg-[#0f1530] dark:border-white/10 px-3 text-sm text-left outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span
                      className={`overflow-hidden truncate mr-2 ${
                        startDate
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-slate-500"
                      }`}
                    >
                      {startDate ? (
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <span>{formatDate(startDate)}</span>
                          <span className="text-gray-400 dark:text-slate-400">
                            →
                          </span>
                          <span>
                            {endDate ? formatDate(endDate) : "Select end"}
                          </span>
                        </span>
                      ) : (
                        "Select dates"
                      )}
                    </span>
                    <div className="flex items-center gap-1">
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
                  {isDatePickerOpen && (
                    <div className="fixed sm:absolute top-1/2 sm:top-full left-1/2 sm:left-0 -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 mt-0 sm:mt-2 bg-white border border-gray-200 dark:bg-[#0f1530] dark:border-white/10 rounded-xl shadow-2xl z-100 p-4 min-w-70 animate-in fade-in slide-in-from-top-2 ">
                      {/* Month Navigation */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => navigateMonth("prev")}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
                        >
                          <ChevronDown size={18} className="rotate-90" />
                        </button>
                        <span className="text-gray-900 dark:text-white font-semibold">
                          {monthNames[currentMonth]} {currentYear}
                        </span>
                        <button
                          onClick={() => navigateMonth("next")}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
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
                          )
                        )}
                      </div>

                      {/* Calendar Days */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((date, index) => {
                          const isPast = date && date < today;
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
                              onClick={() => handleDateClick(date)}
                              disabled={!date || isPast}
                              className={`
                                h-9 w-9 rounded-lg text-sm font-medium transition-all
                                ${!date ? "invisible" : ""}
                                ${
                                  isPast
                                    ? "text-gray-300 dark:text-slate-600 cursor-not-allowed"
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
                                  !isStart &&
                                  !isEnd &&
                                  !inRange &&
                                  date
                                    ? "text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10"
                                    : ""
                                }
                              `}
                            >
                              {date?.getDate()}
                            </button>
                          );
                        })}
                      </div>

                      {/* Helper Text */}
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/10 text-xs text-gray-500 dark:text-slate-400 text-center">
                        {selectingEnd && startDate
                          ? "Select end date"
                          : "Select start date"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <div className="col-span-2 md:col-span-1 lg:col-span-2">
                  <label className="text-[10px] text-transparent font-bold tracking-wider mb-1.5 hidden md:flex lg:hidden">
                    SEARCH
                  </label>
                  <button
                    onClick={() => {
                      // Validate inputs
                      if (!selectedLocation) {
                        showPopup("warning", "Please select a pickup location");
                        return;
                      }
                      if (!startDate || !endDate) {
                        showPopup("warning", "Please select rental dates");
                        return;
                      }

                      const params = new URLSearchParams();
                      params.set("startDate", formatDateForParam(startDate));
                      params.set("endDate", formatDateForParam(endDate));
                      params.set("location", selectedLocation.id);
                      navigate(`/fleet?${params.toString()}`);
                    }}
                    className="w-full h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-none dark:shadow-none font-bold text-white cursor-pointer"
                  >
                    <Search size={18} className="text-white" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group w-full max-w-md lg:max-w-none mx-auto">
            <div className="absolute -inset-1 mx-auto bg-linear-to-r from-indigo-500 to-purple-600 rounded-3xl lg:rounded-4xl blur opacity-25 group-hover:opacity-50 transition 0 -z-10"></div>
            <img
              src={imageUrl}
              alt="Hero Car"
              className="relative w-full mx-auto rounded-3xl lg:rounded-4xl shadow-2xl border border-white/10 transform transition-transform hover:scale-[1.01] aspect-video object-center object-cover"
            />
            {/* Floating Card */}
            <div className="absolute -bottom-4 -left-2 sm:-bottom-6 sm:-left-6 bg-white/90 border border-gray-200 dark:bg-slate-900/90 dark:border-white/10 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-green-500/20 p-1.5 sm:p-2 rounded-full text-green-500 dark:text-green-400">
                  <CheckCircle size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-bold text-xs sm:text-sm">
                    Available Now
                  </p>
                  <p className="text-gray-500 dark:text-slate-400 text-[10px] sm:text-xs">
                    {buttonText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup - Fixed position for better visibility */}
      {popup && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-bold text-sm shadow-2xl transition-all ${
            popup.type === "warning"
              ? "bg-amber-500 text-black"
              : "bg-red-500 text-white"
          }`}
        >
          {popup.message}
        </div>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-400">
        <ChevronDown className="mx-auto" />
      </div>
    </section>
  );
}

export default Hero;
