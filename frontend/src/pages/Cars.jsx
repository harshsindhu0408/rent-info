import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Plus, Edit2, Trash2, Search, Car as CarIcon, X, ChevronRight, Fuel, Users, Activity, Link, Image as ImageIcon } from "lucide-react";
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

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

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
      setEditingCar(res.data);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-400">Loading your fleet...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-indigo-600 mb-1">Inventory</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Fleet Management
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base max-w-lg leading-relaxed">
            Manage your vehicles, track expenses, and monitor their current status.
          </p>
        </div>
        <div className="flex gap-3">
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
            className="group flex items-center justify-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-full hover:bg-gray-50 hover:text-gray-900 transition-all border border-gray-200 shadow-sm font-medium text-sm flex-1 md:flex-none"
          >
            <Link size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            Share Fleet
          </button>
          <button
            onClick={() => openModal()}
            className="group flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg font-medium text-sm flex-1 md:flex-none"
          >
            <Plus size={16} className="text-gray-300 group-hover:text-white transition-colors" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-2 flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by brand, model, or plate number..."
            className="w-full pl-11 pr-10 py-3 bg-transparent border-none focus:ring-0 outline-none text-sm font-medium placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2 p-1 overflow-x-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full whitespace-nowrap">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-xs font-semibold text-emerald-700">
              {cars.filter(c => c.status === "Available").length} Available
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full whitespace-nowrap">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-amber-700">
              {cars.filter(c => c.status === "Rented").length} Rented
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full whitespace-nowrap">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-xs font-semibold text-gray-600">
              {cars.filter(c => c.status === "Maintenance").length} Service
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredCars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCars.map((car) => (
            <div
              key={car._id}
              onClick={() => openDetails(car)}
              className="group bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
            >
              {/* Image / Header area */}
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                {car.images && car.images.length > 0 ? (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/${car.images[0]}`}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <CarIcon size={40} className="text-gray-300" />
                  </div>
                )}
                
                {/* Status Badge Over Image */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-md border ${
                    car.status === "Available" ? "bg-emerald-500/90 text-white border-emerald-400/50" :
                    car.status === "Rented" ? "bg-amber-500/90 text-white border-amber-400/50" :
                    "bg-gray-800/90 text-white border-gray-600/50"
                  }`}>
                    {car.status}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 truncate">{car.brand}</p>
                    <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{car.model}</h3>
                  </div>
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-mono font-medium shrink-0">
                    {car.plateNumber}
                  </span>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-3 mb-5 text-xs font-medium text-gray-500">
                  {car.fuelType && (
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <Fuel size={12} className="text-gray-400" />
                      {car.fuelType}
                    </span>
                  )}
                  {car.seatingCapacity && (
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <Users size={12} className="text-gray-400" />
                      {car.seatingCapacity}
                    </span>
                  )}
                </div>

                <div className="mt-auto">
                  {/* Rates */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100/50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Hourly</p>
                      <p className="text-sm font-bold text-gray-900">₹{car.hourlyRate?.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100/50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Daily</p>
                      <p className="text-sm font-bold text-gray-900">₹{car.dailyRate?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                      <Activity size={12} />
                      ₹{totalExpenses(car).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openModal(car); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(car._id); }}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CarIcon size={32} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchTerm ? "No vehicles found" : "Your fleet is empty"}
          </h3>
          <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
            {searchTerm
              ? "Try adjusting your search terms to find what you're looking for."
              : "Start building your fleet by adding your first vehicle to the inventory."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => openModal()}
              className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-black transition shadow-lg font-medium text-sm"
            >
              <Plus size={16} />
              Add Your First Vehicle
            </button>
          )}
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCar ? "Edit Vehicle" : "Add New Vehicle"}
                </h2>
                <p className="text-xs font-medium text-gray-500 mt-1">Provide the details for this asset</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              <form id="carForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Brand</label>
                    <input
                      type="text" required placeholder="e.g. Toyota"
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all text-sm font-medium"
                      value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Model</label>
                    <input
                      type="text" required placeholder="e.g. Camry"
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all text-sm font-medium"
                      value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Plate Number</label>
                  <input
                    type="text" required placeholder="e.g. MH 01 AB 1234"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all text-sm uppercase font-mono tracking-widest font-bold text-gray-900"
                    value={formData.plateNumber} onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Hourly Rate (₹)</label>
                    <input
                      type="number" required placeholder="100"
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all text-sm font-medium"
                      value={formData.hourlyRate} onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Daily Rate (₹)</label>
                    <input
                      type="number" required placeholder="1000"
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all text-sm font-medium"
                      value={formData.dailyRate} onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Last Serviced (Km)</label>
                    <input
                      type="number" placeholder="5000"
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all text-sm font-medium"
                      value={formData.lastServicedKm} onChange={(e) => setFormData({ ...formData, lastServicedKm: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Status</label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all text-sm font-medium appearance-none"
                      value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Available">Available</option>
                      <option value="Rented">Rented</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Vehicle Images</label>

                  {editingCar?.images?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Current Images</p>
                      <div className="grid grid-cols-4 gap-3">
                        {editingCar.images.map((img, idx) => (
                          <div key={idx} className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                            <img src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/${img}`} alt="Car" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => handleImageDelete(img)} className="absolute top-1.5 right-1.5 bg-rose-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-rose-600">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors text-center cursor-pointer group">
                    <input type="file" multiple accept="image/*,.heic,.heif" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-indigo-500">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                        <ImageIcon size={18} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide">Click to add photos</span>
                    </div>
                  </div>

                  {previewUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative group aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 border-indigo-200">
                          <img src={url} alt="Preview" className="w-full h-full object-cover opacity-80" />
                          <button type="button" onClick={() => removeSelectedFile(idx)} className="absolute top-1.5 right-1.5 bg-gray-900 text-white p-1.5 rounded-full hover:bg-black transition shadow-lg">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-gray-50 bg-gray-50/50">
              <button type="submit" form="carForm" className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition shadow-lg shadow-gray-200 text-sm">
                {editingCar ? "Save Changes" : "Add Vehicle to Fleet"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Cars;
