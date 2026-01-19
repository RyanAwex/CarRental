import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar,
  Fuel,
  Cog,
  Package,
  ArrowLeft,
  SlidersHorizontal,
  Car,
} from "lucide-react";
import Header from "../components/index/Header";
import Footer from "../components/index/Footer";
import { useDataStore } from "../store/dataStore";
import { useCartStore } from "../store/carStore";
import { useAuthStore } from "../store/authStore";
import { getPrice } from "../store/days";
import supabase from "../config/supabase-client";
import { PICKUP_LOCATIONS } from "../store/locations";

export default function Fleet() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { cars, carsLoading, carsError, getSection } = useDataStore();
  const { cart } = useCartStore();
  const { addToCart } = useCartStore();
  const { session, isScrolled } = useAuthStore();

  // Search/filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedFuelType, setSelectedFuelType] = useState("");
  const [selectedTransmission, setSelectedTransmission] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  // Date/location states from URL params
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Bookings for availability check
  const [bookings, setBookings] = useState([]);

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  const toSafeDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === "string") {
      if (value.includes("T")) return new Date(value);
      return new Date(`${value}T12:00:00`);
    }
    return new Date(value);
  };

  const resolveLocationFromParam = (value) => {
    if (!value) return null;
    const match = PICKUP_LOCATIONS.find((l) => l.id === value);
    if (match) return match;

    // Legacy params (airport/train/port)
    if (value === "airport" || value === "train" || value === "port") {
      return PICKUP_LOCATIONS.find((l) => l.type === value) || null;
    }

    return null;
  };

  // Parse URL search params on mount
  useEffect(() => {
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");
    const location = searchParams.get("location");

    if (start) setStartDate(toSafeDate(start));
    if (end) setEndDate(toSafeDate(end));
    if (location) setSelectedLocation(resolveLocationFromParam(location));
  }, [searchParams]);

  // Fetch bookings for availability check
  useEffect(() => {
    const fetchBookings = async () => {
      if (!startDate || !endDate) return;

      try {
        const { data, error } = await supabase
          .from("car_availability")
          .select("car_id, start_date, end_date, return_date, status")
          .in("status", ["pending", "confirmed", "active"]);

        if (error) throw error;
        setBookings(data || []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };

    fetchBookings();
  }, [startDate, endDate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && dropdownRefs.current[openDropdown]) {
        if (!dropdownRefs.current[openDropdown].contains(event.target)) {
          setOpenDropdown(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const makes = [...new Set(cars.map((c) => c.make))].sort();
    // Only get models for the selected make
    const modelsForMake = selectedMake
      ? [
          ...new Set(
            cars.filter((c) => c.make === selectedMake).map((c) => c.model)
          ),
        ].sort()
      : [];
    const fuelTypes = [...new Set(cars.map((c) => c.fuel_type))].sort();
    const transmissions = [...new Set(cars.map((c) => c.transmission))].sort();
    const prices = cars.map((c) => getPrice(c));
    const maxPrice = Math.max(...prices, 10000);

    return { makes, models: modelsForMake, fuelTypes, transmissions, maxPrice };
  }, [cars, selectedMake]);

  // Check if a car is available for the selected dates
  const isCarAvailable = useCallback(
    (carId) => {
      if (!startDate || !endDate) return true;

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      return !bookings.some((booking) => {
        if (booking.car_id !== carId) return false;

        const bookingStart = toSafeDate(booking.start_date);
        bookingStart.setHours(0, 0, 0, 0);
        // Use return_date for blocking (includes free days), fall back to end_date
        const bookingEnd = toSafeDate(booking.return_date || booking.end_date);
        bookingEnd.setHours(23, 59, 59, 999);

        // Check for date overlap
        return start <= bookingEnd && end >= bookingStart;
      });
    },
    [startDate, endDate, bookings]
  );

  // Filter cars based on all criteria
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        car.make.toLowerCase().includes(searchLower) ||
        car.model.toLowerCase().includes(searchLower) ||
        car.category?.toLowerCase().includes(searchLower);

      // Make filter
      const matchesMake = !selectedMake || car.make === selectedMake;

      // Model filter
      const matchesModel = !selectedModel || car.model === selectedModel;

      // Fuel type filter
      const matchesFuel =
        !selectedFuelType || car.fuel_type === selectedFuelType;

      // Transmission filter
      const matchesTransmission =
        !selectedTransmission || car.transmission === selectedTransmission;

      // Price filter
      const carPrice = getPrice(car);
      const matchesPrice =
        carPrice >= priceRange[0] && carPrice <= priceRange[1];

      return (
        matchesSearch &&
        matchesMake &&
        matchesModel &&
        matchesFuel &&
        matchesTransmission &&
        matchesPrice
      );
    });
  }, [
    cars,
    searchTerm,
    selectedMake,
    selectedModel,
    selectedFuelType,
    selectedTransmission,
    priceRange,
  ]);

  // Filter out unavailable cars when dates are selected
  const availableCars = useMemo(() => {
    if (!startDate || !endDate) return filteredCars;

    // Only show cars that are available for the selected dates
    return filteredCars.filter((car) => {
      const available = isCarAvailable(car.id);
      const statusAvailable = car.status === "Available";
      return available && statusAvailable;
    });
  }, [filteredCars, startDate, endDate, isCarAvailable]);

  const handleRent = (car) => {
    // Add car to cart with selected dates and location
    const cartData = {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      location: selectedLocation,
    };

    addToCart(car, cartData);
    navigate("/configuring");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMake("");
    setSelectedModel("");
    setSelectedFuelType("");
    setSelectedTransmission("");
    setPriceRange([0, filterOptions.maxPrice]);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedMake ||
    selectedModel ||
    selectedFuelType ||
    selectedTransmission ||
    priceRange[0] > 0 ||
    priceRange[1] < filterOptions.maxPrice;

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Dropdown component
  const FilterDropdown = ({ id, value, options, onChange, placeholder }) => (
    <div className="relative" ref={(el) => (dropdownRefs.current[id] = el)}>
      <button
        onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
        className="w-full h-11 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-white/10 px-4 text-sm text-left outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer flex items-center justify-between hover:border-gray-400 dark:hover:border-white/20"
      >
        <span
          className={
            value
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-slate-400"
          }
        >
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 dark:text-slate-400 transition-transform ${
            openDropdown === id ? "rotate-180" : ""
          }`}
        />
      </button>

      {openDropdown === id && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
          <button
            onClick={() => {
              onChange("");
              setOpenDropdown(null);
            }}
            className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-600/20 ${
              !value
                ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-600/30 dark:text-indigo-300"
                : "text-gray-900 dark:text-white"
            }`}
          >
            All
          </button>
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setOpenDropdown(null);
              }}
              className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-600/20 ${
                value === option
                  ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-600/30 dark:text-indigo-300"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header
        cartCount={cart ? 1 : 0}
        isScrolled={isScrolled}
        session={session}
      />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Our{" "}
                  <span className="text-indigo-600 dark:text-indigo-500">
                    Fleet
                  </span>
                </h1>
                <p className="text-gray-500 dark:text-slate-400">
                  {availableCars.length} vehicles available
                  {startDate && endDate && (
                    <span className="text-indigo-400 ml-2">
                      • {formatDate(startDate)} → {formatDate(endDate)}
                    </span>
                  )}
                  {selectedLocation && (
                    <span className="text-indigo-600 dark:text-indigo-400 ml-3">
                      {selectedLocation.Icon && (
                        <selectedLocation.Icon
                          size={16}
                          className="inline-block align-text-center mr-1 text-indigo-500 dark:text-indigo-300"
                        />
                      )}
                      {selectedLocation.name}
                    </span>
                  )}
                </p>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  showFilters || hasActiveFilters
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-white/10 text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-white/20"
                }`}
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    Active
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by make, model, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 mb-8 animate-in slide-in-from-top-2  shadow-md dark:shadow-none">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Filter
                    size={20}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  Filter Options
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Make Filter */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-2 block">
                    Make
                  </label>
                  <FilterDropdown
                    id="make"
                    value={selectedMake}
                    options={filterOptions.makes}
                    onChange={(value) => {
                      setSelectedMake(value);
                      setSelectedModel(""); // Clear model when make changes
                    }}
                    placeholder="All Makes"
                  />
                </div>

                {/* Model Filter - Only show when a make is selected */}
                {selectedMake && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-2 block">
                      Model
                    </label>
                    <FilterDropdown
                      id="model"
                      value={selectedModel}
                      options={filterOptions.models}
                      onChange={setSelectedModel}
                      placeholder="All Models"
                    />
                  </div>
                )}

                {/* Fuel Type Filter */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-2 block">
                    Fuel Type
                  </label>
                  <FilterDropdown
                    id="fuel"
                    value={selectedFuelType}
                    options={filterOptions.fuelTypes}
                    onChange={setSelectedFuelType}
                    placeholder="All Fuel Types"
                  />
                </div>

                {/* Transmission Filter */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-2 block">
                    Transmission
                  </label>
                  <FilterDropdown
                    id="transmission"
                    value={selectedTransmission}
                    options={filterOptions.transmissions}
                    onChange={setSelectedTransmission}
                    placeholder="All Transmissions"
                  />
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-2 block">
                    Max Price: {priceRange[1]} MAD/day
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={filterOptions.maxPrice}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([0, parseInt(e.target.value)])
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500 mt-1">
                    <span>0 MAD</span>
                    <span>{filterOptions.maxPrice} MAD</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {carsLoading && (
              <div className="col-span-full text-center text-indigo-400 text-lg py-40">
                Loading cars...
              </div>
            )}

            {carsError && (
              <div className="col-span-full text-center text-red-500 text-lg py-8">
                Error: {carsError.message || carsError.toString()}
              </div>
            )}

            {!carsLoading && !carsError && availableCars.length === 0 && (
              <div className="col-span-full text-center py-16">
                <Car
                  size={48}
                  className="mx-auto text-gray-400 dark:text-slate-600 mb-4"
                />
                <p className="text-gray-500 dark:text-slate-400 text-lg mb-2">
                  {startDate && endDate
                    ? "No cars available for selected dates"
                    : "No cars found"}
                </p>
                <p className="text-gray-400 dark:text-slate-500 text-sm">
                  {startDate && endDate
                    ? "Try different dates or adjust your filters"
                    : "Try adjusting your filters or search term"}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {!carsLoading &&
              !carsError &&
              availableCars.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-white/5 hover:border-indigo-500/40 transition-all hover:-translate-y-1 group shadow-lg dark:shadow-2xl"
                >
                  {/* Image Section */}
                  <div className="h-52 overflow-hidden relative">
                    <img
                      src={c.image_urls?.[0] || "placeholder-car.jpg"}
                      alt={`${c.make} ${c.model}`}
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform "
                    />
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 bg-indigo-600 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black text-white shadow-lg">
                      {c.category}
                    </div>
                    {/* Transmission Badge */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                      {c.transmission}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {c.make} {c.model}
                      </h3>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                        {getPrice(c)}{" "}
                        <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                          MAD
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-500 dark:text-slate-400 text-sm flex gap-1 items-center">
                        <Calendar
                          size={14}
                          className="text-indigo-500/60 dark:text-indigo-400/60"
                        />
                        {c.year}
                      </p>
                      <span className="text-gray-400 dark:text-slate-500 text-xs font-medium">
                        per day
                      </span>
                    </div>

                    {/* Car Specs Grid */}
                    <div className="grid grid-cols-2 gap-3 my-5 border-y border-gray-200 dark:border-white/5 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300 text-sm">
                        <span className="opacity-50 text-indigo-600 dark:text-indigo-400">
                          <Fuel size={16} />
                        </span>{" "}
                        {c.fuel_type}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300 text-sm">
                        <span className="opacity-50 text-indigo-600 dark:text-indigo-400">
                          <Cog size={16} />
                        </span>{" "}
                        {c.transmission === "Automatic" ? "Auto" : "Manual"}
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-gray-600 dark:text-slate-300 text-sm">
                        <span className="opacity-50 text-indigo-600 dark:text-indigo-400">
                          <Package size={16} />
                        </span>{" "}
                        {c.kits || "Standard Kit"}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRent(c)}
                      className="w-full py-3 rounded-2xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 cursor-pointer"
                    >
                      Book now
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>

      <Footer appData={getSection("footer")} />
    </div>
  );
}
