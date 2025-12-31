import { useState, useEffect } from "react";
import api from "../api/axios";
import { Plus, Edit2, Trash2, Search, Car as CarIcon, X } from "lucide-react";
import { toast } from "react-hot-toast";

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCar, setEditingCar] = useState(null);

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    plateNumber: "",
    hourlyRate: "",
    dailyRate: "",
    status: "Available",
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await api.get("/api/cars");
      setCars(res.data);
    } catch (error) {
      toast.error("Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;
    try {
      await api.delete(`/api/cars/${id}`);
      setCars(cars.filter((c) => c._id !== id));
      toast.success("Car deleted successfully");
    } catch (error) {
      toast.error("Failed to delete car");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCar) {
        const res = await api.patch(`/api/cars/${editingCar._id}`, formData);
        setCars(cars.map((c) => (c._id === editingCar._id ? res.data : c)));
        toast.success("Car updated successfully");
      } else {
        const res = await api.post("/api/cars", formData);
        setCars([...cars, res.data]);
        toast.success("Car added successfully");
      }
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Operation failed");
    }
  };

  const openModal = (car = null) => {
    if (car) {
      setEditingCar(car);
      setFormData({
        brand: car.brand,
        model: car.model,
        plateNumber: car.plateNumber,
        hourlyRate: car.hourlyRate,
        dailyRate: car.dailyRate,
        status: car.status,
      });
    } else {
      setEditingCar(null);
      setFormData({
        brand: "",
        model: "",
        plateNumber: "",
        hourlyRate: "",
        dailyRate: "",
        status: "Available",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCar(null);
  };

  const filteredCars = cars.filter(
    (car) =>
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight">Fleet Management</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Manage your vehicle inventory</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl hover:from-gray-800 hover:to-gray-700 transition shadow-lg font-medium text-sm md:text-base w-full sm:w-auto"
        >
          <Plus size={18} className="shrink-0" />
          <span>Add New Car</span>
        </button>
      </div>

      {/* Search & Cars Grid */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-3 md:p-4">
        {/* Search */}
        <div className="relative mb-4 md:mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by brand, model, or plate..."
            className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-gray-50 border-none rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm md:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCars.map((car) => (
            <div
              key={car._id}
              className="group bg-white border border-gray-100 rounded-xl md:rounded-2xl p-4 md:p-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              {/* Action Buttons - Always visible on mobile */}
              <div className="absolute top-3 md:top-5 right-3 md:right-5 flex space-x-1.5 md:space-x-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(car)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  <Edit2 size={14} className="md:w-4 md:h-4" />
                </button>
                <button
                  onClick={() => handleDelete(car._id)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition"
                >
                  <Trash2 size={14} className="md:w-4 md:h-4" />
                </button>
              </div>

              {/* Car Info */}
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                  <CarIcon size={20} className="md:w-6 md:h-6" />
                </div>
                <div className="min-w-0 flex-1 pr-16 sm:pr-0">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">
                    {car.plateNumber}
                  </p>
                </div>
              </div>

              {/* Rates */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="bg-gray-50 p-2.5 md:p-3 rounded-lg md:rounded-xl">
                  <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Hourly</p>
                  <p className="font-semibold text-gray-900 text-sm md:text-base">₹{car.hourlyRate}</p>
                </div>
                <div className="bg-gray-50 p-2.5 md:p-3 rounded-lg md:rounded-xl">
                  <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Daily</p>
                  <p className="font-semibold text-gray-900 text-sm md:text-base">₹{car.dailyRate}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center pt-3 md:pt-4 border-t border-gray-50">
                <span
                  className={`px-2.5 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium ${car.status === "Available"
                      ? "bg-green-100 text-green-700"
                      : car.status === "Rented"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}
                >
                  {car.status}
                </span>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredCars.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="bg-gray-100 p-4 rounded-full mx-auto mb-4 w-fit">
                <CarIcon size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No cars found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm ? "Try a different search" : "Add your first car"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 md:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                {editingCar ? "Edit Car" : "Add New Car"}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm md:text-base"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm md:text-base"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Plate Number</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm md:text-base uppercase"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm md:text-base"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Daily Rate (₹)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm md:text-base"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm md:text-base"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="pt-2 md:pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold py-3 md:py-3.5 rounded-xl md:rounded-2xl hover:from-gray-800 hover:to-gray-700 transition shadow-lg text-sm md:text-base"
                >
                  {editingCar ? "Update Car" : "Save Car"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cars;
