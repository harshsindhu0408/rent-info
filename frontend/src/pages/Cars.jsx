import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Plus, Edit2, Trash2, Search, Car as CarIcon, X, ChevronRight, Fuel, Users, Activity, Link } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Cars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCar, setEditingCar] = useState(null);
  const { user } = useAuth();
  const userId = user?._id;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    plateNumber: "",
    hourlyRate: "",
    dailyRate: "",
    status: "Available",
    lastServicedKm: "",
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

    // Create FormData object
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    // Append images
    if (selectedFiles.length > 0) {
      selectedFiles.forEach(file => {
        data.append('images', file);
      });
    }

    try {
      if (editingCar) {
        const res = await api.patch(`/api/cars/${editingCar._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setCars(cars.map((c) => (c._id === editingCar._id ? res.data : c)));
        toast.success("Car updated successfully");
      } else {
        const res = await api.post("/api/cars", data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setCars([...cars, res.data]);
        toast.success("Car added successfully");
      }
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Operation failed");
    }
  };

  const handleImageDelete = async (imagePath) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const res = await api.delete(`/api/cars/${editingCar._id}/images`, {
        data: { imagePath }
      });
      // Update editingCar to reflect removed image
      setEditingCar(res.data);
      // Also update the car in the main list
      setCars(cars.map((c) => (c._id === editingCar._id ? res.data : c)));
      toast.success("Image deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete image");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);

    // Generate previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
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
        lastServicedKm: car.lastServicedKm || "",
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
        lastServicedKm: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCar(null);
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const openDetails = (car) => {
    navigate(`/cars/${car._id}`);
  };

  const filteredCars = cars.filter(
    (car) =>
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = (car) => car.maintenanceHistory?.reduce((sum, item) => sum + item.amount, 0) || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          <p className="text-gray-500 font-medium text-sm">Loading fleet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 md:p-6 lg:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight">Fleet Management</h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              {cars.length} vehicle{cars.length !== 1 ? "s" : ""} in your inventory
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                if (userId) {
                  const url = `${window.location.origin}/gallery/user/${userId}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Public fleet link copied!");
                } else {
                  toast.error("User ID not found, try re-logging in");
                }
              }}
              className="flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-200 px-5 py-3 rounded-xl hover:bg-gray-50 transition shadow-sm font-medium text-sm md:text-base flex-1 md:flex-none"
            >
              <Link size={18} />
              Share Fleet
            </button>
            <button
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl hover:bg-black transition shadow-lg font-medium text-sm md:text-base flex-1 md:flex-none"
            >
              <Plus size={18} />
              Add Vehicle
            </button>
          </div>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by brand, model, or plate number..."
                className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-200 focus:bg-white outline-none transition text-sm md:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-full text-gray-400"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-1">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 whitespace-nowrap">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs md:text-sm font-medium text-emerald-700">
                  {cars.filter(c => c.status === "Available").length} Available
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 whitespace-nowrap">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-xs md:text-sm font-medium text-amber-700">
                  {cars.filter(c => c.status === "Rented").length} Rented
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl border border-gray-200 whitespace-nowrap">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-xs md:text-sm font-medium text-gray-600">
                  {cars.filter(c => c.status === "Maintenance").length} Service
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredCars.map((car) => (
              <div
                key={car._id}
                onClick={() => openDetails(car)}
                className="group bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 cursor-pointer"
              >
                {/* Card Header with Color Accent */}
                <div className="relative h-3 bg-gradient-to-r from-gray-800 to-gray-900">
                  <div className={`absolute right-4 -bottom-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg ${car.status === "Available" ? "bg-emerald-500 text-white" :
                    car.status === "Rented" ? "bg-amber-500 text-white" :
                      "bg-gray-500 text-white"
                    }`}>
                    {car.status}
                  </div>
                </div>

                <div className="p-5 md:p-6 pt-6 md:pt-7">
                  {/* Car Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{car.brand}</p>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{car.model}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-gray-900 text-white px-2 py-0.5 rounded text-[10px] md:text-xs font-mono font-medium">
                          {car.plateNumber}
                        </span>
                        {car.year && (
                          <span className="text-xs text-gray-400">{car.year}</span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition shrink-0">
                      <CarIcon size={22} className="text-gray-600" />
                    </div>
                  </div>

                  {/* Quick Info Row */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                    {car.fuelType && (
                      <span className="flex items-center gap-1">
                        <Fuel size={12} />
                        {car.fuelType}
                      </span>
                    )}
                    {car.seatingCapacity && (
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {car.seatingCapacity} seats
                      </span>
                    )}
                    {car.color && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        {car.color}
                      </span>
                    )}
                  </div>

                  {/* Rates */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hourly</p>
                      <p className="text-lg font-bold text-gray-900">₹{car.hourlyRate?.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Daily</p>
                      <p className="text-lg font-bold text-gray-900">₹{car.dailyRate?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Activity size={12} />
                      <span>₹{totalExpenses(car).toLocaleString()} spent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openModal(car); }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(car._id); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight size={16} className="text-gray-300 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-12 md:p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CarIcon size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {searchTerm ? "No vehicles found" : "No vehicles yet"}
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Add your first vehicle to start managing your fleet"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-black transition font-medium text-sm"
              >
                <Plus size={16} />
                Add Your First Vehicle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-hidden bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  {editingCar ? "Edit Vehicle" : "Add New Vehicle"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Fill in the details below</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Maruti"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-300 focus:bg-white outline-none transition text-sm"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Swift"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-300 focus:bg-white outline-none transition text-sm"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Plate Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., PB 10 AB 1234"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-300 focus:bg-white outline-none transition text-sm uppercase font-mono"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-300 focus:bg-white outline-none transition text-sm"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Daily Rate (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="1000"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-300 focus:bg-white outline-none transition text-sm"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Last Serviced Km</label>
                  <input
                    type="number"
                    placeholder="e.g., 5000"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-300 focus:bg-white outline-none transition text-sm"
                    value={formData.lastServicedKm}
                    onChange={(e) => setFormData({ ...formData, lastServicedKm: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-300 focus:bg-white outline-none transition text-sm"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Images</label>

                {/* Existing Images */}
                {editingCar && editingCar.images && editingCar.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Current Images</p>
                    <div className="grid grid-cols-4 gap-2">
                      {editingCar.images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/${img}`}
                            alt="Car"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleImageDelete(img)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Input */}
                <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-gray-400 transition text-center cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Plus size={24} />
                    <span className="text-xs">Click to upload images</span>
                  </div>
                </div>

                {/* Selected Previews */}
                {previewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(idx)}
                          className="absolute top-1 right-1 bg-gray-900 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full mb-10 bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-black transition shadow-lg text-sm"
                >
                  {editingCar ? "Update Vehicle" : "Add Vehicle"}
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
