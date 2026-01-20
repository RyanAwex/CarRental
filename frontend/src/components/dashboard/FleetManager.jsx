import React, { useEffect, useState, useMemo } from "react";
import supabase from "../../config/supabase-client";
import SearchAndAction from "./fleetSection/SearchAndAction";
import MainData from "./fleetSection/MainData";
import DetailedModal from "./fleetSection/DetailedModal";

export default function FleetManager() {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCar, setCurrentCar] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // The Full Initial State
  const emptyCar = {
    make: "",
    model: "",
    year: 2024,
    license_plate: "",
    transmission: "Automatic",
    fuel_type: "Diesel",
    category: "Economy",
    status: "Available",
    base_price_per_day: 0,
    weekend_price_per_day: 0,
    kits: "",
    image_urls: [],
  };

  const fetchCars = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });
    setCars(data || []);
    setLoading(false);
  };

  // Fetch active bookings to determine effective car status
  const fetchBookings = async () => {
    const { data } = await supabase
      .from("rentals")
      .select("car_id, start_date, end_date, status")
      .in("status", ["confirmed", "active"]);
    setBookings(data || []);
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchCars(), fetchBookings()]);
    };
    fetchData();
  }, []);

  // Compute effective status for each car based on active bookings
  const carsWithEffectiveStatus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return cars.map((car) => {
      // Check if car has an active/confirmed booking for today
      const hasActiveBooking = bookings.some((booking) => {
        if (booking.car_id !== car.id) return false;

        const startDate = new Date(booking.start_date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(booking.end_date);
        endDate.setHours(23, 59, 59, 999);

        return today >= startDate && today <= endDate;
      });

      // If car has active booking today, show as "Rented"
      // Otherwise, use the car's actual status
      const effectiveStatus = hasActiveBooking ? "Rented" : car.status;

      return { ...car, effectiveStatus };
    });
  }, [cars, bookings]);

  const handleSave = async (e) => {
    e.preventDefault();
    const { id, effectiveStatus: _effectiveStatus, ...carData } = currentCar;

    // Handle Image Array (Simple Split for now)
    if (typeof carData.image_urls === "string") {
      carData.image_urls = carData.image_urls
        .split(",")
        .map((url) => url.trim());
    }

    const { error } = id
      ? await supabase.from("cars").update(carData).eq("id", id)
      : await supabase.from("cars").insert([carData]);

    if (!error) {
      setIsModalOpen(false);
      fetchCars();
    } else {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this car?")) {
      // Find the car to get its image URL
      const carToDelete = cars.find((c) => c.id === id);

      // Delete image from storage if exists
      if (carToDelete?.image_urls) {
        const imageUrl = Array.isArray(carToDelete.image_urls)
          ? carToDelete.image_urls[0]
          : carToDelete.image_urls;

        if (imageUrl && imageUrl.includes("cars-images")) {
          try {
            const fileName = imageUrl.split("/").pop();
            await supabase.storage.from("cars-images").remove([fileName]);
          } catch (err) {
            console.error("Error deleting image:", err);
          }
        }
      }

      await supabase.from("cars").delete().eq("id", id);
      fetchCars();
    }
  };

  const openModal = (car = emptyCar) => {
    setCurrentCar(car);
    setIsModalOpen(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  const filteredCars = carsWithEffectiveStatus.filter(
    (c) =>
      c.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.model.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      {/* Search & Action Bar */}
      <SearchAndAction setSearchTerm={setSearchTerm} openModal={openModal} />

      {/* Main Data Table */}
      <MainData
        loading={loading}
        filteredCars={filteredCars}
        openModal={openModal}
        handleDelete={handleDelete}
      />

      {/* The Full, Detailed Modal */}
      {isModalOpen && (
        <DetailedModal
          currentCar={currentCar}
          setIsModalOpen={setIsModalOpen}
          handleSave={handleSave}
          setCurrentCar={setCurrentCar}
        />
      )}
    </div>
  );
}
