import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  ArrowLeft,
  Car as CarIcon,
  Calendar,
  Fuel,
  Users,
  Settings,
  Palette,
  FileText,
  Shield,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Activity,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  Hash,
  Gauge,
} from "lucide-react";
import { toast } from "react-hot-toast";

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [maintenanceForm, setMaintenanceForm] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [addingMaintenance, setAddingMaintenance] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  // Expenses Edit State
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseEditForm, setExpenseEditForm] = useState({
    description: "",
    amount: "",
    date: "",
  });

  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState({});

  useEffect(() => {
    fetchCar();
  }, [id]);

  const fetchCar = async () => {
    try {
      const res = await api.get(`/api/cars/${id}`);
      setCar(res.data);
      setEditForm(res.data);
    } catch (error) {
      toast.error("Failed to load car details");
      navigate("/cars");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();

      // Append all text fields
      Object.keys(editForm).forEach((key) => {
        if (
          key !== "documents" &&
          key !== "maintenanceHistory" &&
          key !== "_id" &&
          key !== "__v" &&
          key !== "createdAt" &&
          key !== "updatedAt"
        ) {
          if (editForm[key] !== null && editForm[key] !== undefined) {
            formData.append(key, editForm[key]);
          }
        }
      });

      // Append files if selected
      if (files.insurance) formData.append("insurance", files.insurance);
      if (files.rc) formData.append("rc", files.rc);
      if (files.puc) formData.append("puc", files.puc);
      if (files.drivingLicence)
        formData.append("drivingLicence", files.drivingLicence);

      const res = await api.patch(`/api/cars/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCar(res.data);
      setEditForm(res.data);
      setFiles({});
      setIsEditing(false);
      toast.success("Vehicle updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Failed to update vehicle");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [type]: e.target.files[0] }));
    }
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    setAddingMaintenance(true);
    try {
      const res = await api.post(
        `/api/cars/${id}/maintenance`,
        maintenanceForm
      );
      setCar(res.data);
      setMaintenanceForm({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowMaintenanceForm(false);
      toast.success("Expense recorded successfully!");
    } catch (error) {
      toast.error("Failed to add expense record");
    } finally {
      setAddingMaintenance(false);
    }
  };

  const handleUpdateMaintenance = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(
        `/api/cars/${id}/maintenance/${editingExpenseId}`,
        expenseEditForm
      );
      setCar(res.data);
      setEditingExpenseId(null);
      toast.success("Expense updated successfully");
    } catch (error) {
      toast.error("Failed to update expense");
    }
  };

  const handleDeleteMaintenance = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this expense record?"))
      return;
    try {
      const res = await api.delete(`/api/cars/${id}/maintenance/${recordId}`);
      setCar(res.data);
      toast.success("Expense deleted successfully");
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  const startEditingExpense = (record) => {
    setEditingExpenseId(record._id);
    setExpenseEditForm({
      description: record.description,
      amount: record.amount,
      date: record.date
        ? new Date(record.date).toISOString().split("T")[0]
        : "",
    });
  };

  const totalExpenses =
    car?.maintenanceHistory?.reduce((sum, item) => sum + item.amount, 0) || 0;

  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isExpiringSoon = (date) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          <p className="text-gray-500 font-medium text-sm">
            Loading vehicle...
          </p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm text-center max-w-md w-full">
          <CarIcon size={40} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            Vehicle Not Found
          </h2>
          <p className="text-gray-500 mb-6 text-sm md:text-base">
            The vehicle you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/cars")}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition font-medium inline-block text-sm md:text-base"
          >
            Go Back to Fleet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 md:p-6 lg:p-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-4 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
          <button
            onClick={() => navigate("/cars")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition font-medium group text-sm md:text-base"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Fleet
          </button>
          <div className="flex gap-2 flex-wrap">
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase ${
                car.status === "Available"
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : car.status === "Rented"
                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {car.status}
            </span>
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm(car);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={12} /> Save
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center gap-1"
              >
                <Edit2 size={12} /> Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Vehicle Card */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 md:mb-6">
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {car.brand}
                  </p>
                  <h2 className="text-xl md:text-3xl font-bold text-gray-900">
                    {car.model}
                  </h2>
                  <div className="flex items-center gap-2 md:gap-3 mt-2 md:mt-3 flex-wrap">
                    <span className="bg-gray-900 text-white px-2.5 py-1 rounded-lg text-xs md:text-sm font-mono font-bold flex items-center gap-1">
                      <Hash size={10} />
                      {car.plateNumber}
                    </span>
                    {car.year && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-medium bg-gray-100 text-gray-600">
                        {car.year}
                      </span>
                    )}
                    {car.color && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                        <Palette size={10} /> {car.color}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gray-900 text-white rounded-xl md:rounded-2xl shadow-lg self-start">
                  <CarIcon size={24} className="md:w-8 md:h-8" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-4 md:pt-6 border-t border-gray-100">
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
                  <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1">
                    Hourly
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      className="w-full text-lg font-bold bg-white rounded px-2 py-1 border border-gray-200 focus:ring-2 focus:ring-gray-200 outline-none"
                      value={editForm.hourlyRate || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, hourlyRate: e.target.value })
                      }
                    />
                  ) : (
                    <div className="text-lg md:text-xl font-bold text-gray-900">
                      ₹{car.hourlyRate?.toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
                  <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1">
                    Daily
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      className="w-full text-lg font-bold bg-white rounded px-2 py-1 border border-gray-200 focus:ring-2 focus:ring-gray-200 outline-none"
                      value={editForm.dailyRate || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, dailyRate: e.target.value })
                      }
                    />
                  ) : (
                    <div className="text-lg md:text-xl font-bold text-gray-900">
                      ₹{car.dailyRate?.toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
                  <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1">
                    Expenses
                  </div>
                  <div className="text-lg md:text-xl font-bold text-gray-900">
                    ₹{totalExpenses.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
                  <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1">
                    Last Service
                  </div>
                  <div className="text-sm md:text-base font-bold text-gray-900 truncate">
                    {formatDate(car.lastServicedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8">
            <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <Gauge size={18} className="text-gray-400" />
              Specifications
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {/* Fuel Type */}
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Fuel size={14} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Fuel
                  </span>
                </div>
                {isEditing ? (
                  <select
                    className="w-full bg-white rounded px-2 py-1.5 border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none"
                    value={editForm.fuelType || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fuelType: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                ) : (
                  <p className="text-sm md:text-base font-semibold text-gray-900">
                    {car.fuelType || "—"}
                  </p>
                )}
              </div>

              {/* Transmission */}
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Settings size={14} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Transmission
                  </span>
                </div>
                {isEditing ? (
                  <select
                    className="w-full bg-white rounded px-2 py-1.5 border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none"
                    value={editForm.transmission || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, transmission: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                ) : (
                  <p className="text-sm md:text-base font-semibold text-gray-900">
                    {car.transmission || "—"}
                  </p>
                )}
              </div>

              {/* Seating */}
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={14} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Seats
                  </span>
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    className="w-full bg-white rounded px-2 py-1.5 border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none"
                    value={editForm.seatingCapacity || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        seatingCapacity: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="text-sm md:text-base font-semibold text-gray-900">
                    {car.seatingCapacity || 5}
                  </p>
                )}
              </div>

              {/* Color */}
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Palette size={14} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Color
                  </span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="e.g., White"
                    className="w-full bg-white rounded px-2 py-1.5 border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none"
                    value={editForm.color || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, color: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm md:text-base font-semibold text-gray-900">
                    {car.color || "—"}
                  </p>
                )}
              </div>

              {/* Year */}
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Year
                  </span>
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    placeholder="2024"
                    className="w-full bg-white rounded px-2 py-1.5 border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none"
                    value={editForm.year || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, year: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm md:text-base font-semibold text-gray-900">
                    {car.year || "—"}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={14} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </span>
                </div>
                {isEditing ? (
                  <select
                    className="w-full bg-white rounded px-2 py-1.5 border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none"
                    value={editForm.status || "Available"}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                  >
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                ) : (
                  <p
                    className={`text-sm md:text-base font-semibold ${
                      car.status === "Available"
                        ? "text-emerald-600"
                        : car.status === "Rented"
                        ? "text-amber-600"
                        : "text-gray-600"
                    }`}
                  >
                    {car.status}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8">
            <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <Shield size={18} className="text-gray-400" />
              Documents
            </h3>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Insurance */}
              <div
                className={`p-4 rounded-xl border-2 ${
                  isExpired(car.insuranceExpiry)
                    ? "bg-red-50 border-red-200"
                    : isExpiringSoon(car.insuranceExpiry)
                    ? "bg-amber-50 border-amber-200"
                    : car.insuranceExpiry
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">
                    Insurance
                  </span>
                  {isExpired(car.insuranceExpiry) && (
                    <AlertTriangle size={14} className="text-red-500" />
                  )}
                  {isExpiringSoon(car.insuranceExpiry) &&
                    !isExpired(car.insuranceExpiry) && (
                      <AlertTriangle size={14} className="text-amber-500" />
                    )}
                  {!isExpired(car.insuranceExpiry) &&
                    !isExpiringSoon(car.insuranceExpiry) &&
                    car.insuranceExpiry && (
                      <CheckCircle size={14} className="text-emerald-500" />
                    )}
                </div>
                <div className="mb-2">
                  <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-1">
                    Expiry Date
                  </div>
                  {isEditing ? (
                    <input
                      type="date"
                      className="w-full bg-white rounded px-2 py-1.5 border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none"
                      value={
                        editForm.insuranceExpiry
                          ? new Date(editForm.insuranceExpiry)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          insuranceExpiry: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p
                      className={`text-base font-bold ${
                        isExpired(car.insuranceExpiry)
                          ? "text-red-700"
                          : isExpiringSoon(car.insuranceExpiry)
                          ? "text-amber-700"
                          : car.insuranceExpiry
                          ? "text-emerald-700"
                          : "text-gray-500"
                      }`}
                    >
                      {formatDate(car.insuranceExpiry)}
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Document
                    </span>
                    {car.documents?.insurance && (
                      <a
                        href={`${
                          import.meta.env.VITE_API_BASE_URL ||
                          "http://localhost:8000"
                        }/${car.documents.insurance}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        View
                      </a>
                    )}
                  </div>
                  {isEditing && (
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="mt-2 w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      onChange={(e) => handleFileChange(e, "insurance")}
                    />
                  )}
                </div>
              </div>

              {/* PUC */}
              <div
                className={`p-4 rounded-xl border-2 ${
                  isExpired(car.pucExpiry)
                    ? "bg-red-50 border-red-200"
                    : isExpiringSoon(car.pucExpiry)
                    ? "bg-amber-50 border-amber-200"
                    : car.pucExpiry
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">PUC</span>
                  {isExpired(car.pucExpiry) && (
                    <AlertTriangle size={14} className="text-red-500" />
                  )}
                  {isExpiringSoon(car.pucExpiry) &&
                    !isExpired(car.pucExpiry) && (
                      <AlertTriangle size={14} className="text-amber-500" />
                    )}
                  {!isExpired(car.pucExpiry) &&
                    !isExpiringSoon(car.pucExpiry) &&
                    car.pucExpiry && (
                      <CheckCircle size={14} className="text-emerald-500" />
                    )}
                </div>
                <div className="mb-2">
                  <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-1">
                    Expiry Date
                  </div>
                  {isEditing ? (
                    <input
                      type="date"
                      className="w-full bg-white rounded px-2 py-1.5 border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none"
                      value={
                        editForm.pucExpiry
                          ? new Date(editForm.pucExpiry)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditForm({ ...editForm, pucExpiry: e.target.value })
                      }
                    />
                  ) : (
                    <p
                      className={`text-base font-bold ${
                        isExpired(car.pucExpiry)
                          ? "text-red-700"
                          : isExpiringSoon(car.pucExpiry)
                          ? "text-amber-700"
                          : car.pucExpiry
                          ? "text-emerald-700"
                          : "text-gray-500"
                      }`}
                    >
                      {formatDate(car.pucExpiry)}
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Document
                    </span>
                    {car.documents?.puc && (
                      <a
                        href={`${
                          import.meta.env.VITE_API_BASE_URL ||
                          "http://localhost:8000"
                        }/${car.documents.puc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        View
                      </a>
                    )}
                  </div>
                  {isEditing && (
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="mt-2 w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      onChange={(e) => handleFileChange(e, "puc")}
                    />
                  )}
                </div>
              </div>

              {/* RC */}
              <div className="p-4 rounded-xl border-2 bg-gray-50 border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">
                    Registration Certificate
                  </span>
                  {car.documents?.rc && (
                    <CheckCircle size={14} className="text-emerald-500" />
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Document
                    </span>
                    {car.documents?.rc ? (
                      <a
                        href={`${
                          import.meta.env.VITE_API_BASE_URL ||
                          "http://localhost:8000"
                        }/${car.documents.rc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Not Uploaded
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="mt-2 w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      onChange={(e) => handleFileChange(e, "rc")}
                    />
                  )}
                </div>
              </div>

              {/* Driving Licence (Owner/Default) */}
              <div className="p-4 rounded-xl border-2 bg-gray-50 border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">
                    Driving Licence
                  </span>
                  {car.documents?.drivingLicence && (
                    <CheckCircle size={14} className="text-emerald-500" />
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Document
                    </span>
                    {car.documents?.drivingLicence ? (
                      <a
                        href={`${
                          import.meta.env.VITE_API_BASE_URL ||
                          "http://localhost:8000"
                        }/${car.documents.drivingLicence}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Not Uploaded
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="mt-2 w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      onChange={(e) => handleFileChange(e, "drivingLicence")}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8">
            <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
              <FileText size={18} className="text-gray-400" />
              Notes
            </h3>
            {isEditing ? (
              <textarea
                className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-gray-200 outline-none resize-none h-24 text-sm"
                placeholder="Add any notes about this vehicle..."
                value={editForm.notes || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
                }
              />
            ) : (
              <p className="text-gray-600 text-sm leading-relaxed">
                {car.notes || "No notes added."}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Financial Summary */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl md:rounded-3xl shadow-xl p-5 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
              <h3 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
                <IndianRupee size={12} /> Expenses
              </h3>

              <div className="mb-4">
                <span className="text-3xl md:text-4xl font-bold text-white">
                  ₹{totalExpenses.toLocaleString("en-IN")}
                </span>
                <p className="text-gray-400 text-xs mt-1">
                  Total maintenance cost
                </p>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Records</span>
                  <span className="font-medium">
                    {car.maintenanceHistory?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Last Service</span>
                  <span className="font-medium">
                    {formatDate(car.lastServicedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Add Expense */}
          <button
            onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3.5 rounded-xl hover:bg-gray-50 transition font-medium text-sm"
          >
            <Plus size={16} />
            {showMaintenanceForm ? "Cancel" : "Add Expense"}
          </button>

          {/* Add Expense Form */}
          {showMaintenanceForm && (
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                New Expense
              </h3>
              <form onSubmit={handleAddMaintenance} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Oil Change"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 outline-none transition text-sm"
                    value={maintenanceForm.description}
                    onChange={(e) =>
                      setMaintenanceForm({
                        ...maintenanceForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 outline-none transition text-sm"
                    value={maintenanceForm.amount}
                    onChange={(e) =>
                      setMaintenanceForm({
                        ...maintenanceForm,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 outline-none transition text-sm"
                    value={maintenanceForm.date}
                    onChange={(e) =>
                      setMaintenanceForm({
                        ...maintenanceForm,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  type="submit"
                  disabled={addingMaintenance}
                  className="w-full bg-gray-900 text-white font-semibold py-2.5 rounded-lg hover:bg-black transition text-sm disabled:opacity-50"
                >
                  {addingMaintenance ? "Adding..." : "Add Record"}
                </button>
              </form>
            </div>
          )}

          {/* Expense History */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
            <h3 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={12} /> Expense History
            </h3>

            {car.maintenanceHistory && car.maintenanceHistory.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {[...car.maintenanceHistory].reverse().map((record) => (
                  <div
                    key={record._id}
                    className="group flex flex-col p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
                  >
                    {editingExpenseId === record._id ? (
                      <form
                        onSubmit={handleUpdateMaintenance}
                        className="space-y-3"
                      >
                        <div>
                          <input
                            type="text"
                            required
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={expenseEditForm.description}
                            onChange={(e) =>
                              setExpenseEditForm({
                                ...expenseEditForm,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            required
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={expenseEditForm.amount}
                            onChange={(e) =>
                              setExpenseEditForm({
                                ...expenseEditForm,
                                amount: e.target.value,
                              })
                            }
                          />
                          <input
                            type="date"
                            required
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={expenseEditForm.date}
                            onChange={(e) =>
                              setExpenseEditForm({
                                ...expenseEditForm,
                                date: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingExpenseId(null)}
                            className="text-xs px-3 py-1.5 text-gray-600 hover:text-gray-900 font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {record.description}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {formatDate(record.date)}
                            </p>
                          </div>
                          <p className="font-bold text-gray-900 text-sm ml-3">
                            ₹{record.amount?.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditingExpense(record)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteMaintenance(record._id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="mx-auto text-gray-300 mb-2" size={24} />
                <p className="text-gray-500 text-xs">No expenses yet</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-xs text-gray-400">
            <div className="flex justify-between mb-1">
              <span>Created</span>
              <span>{car.createdAt ? formatDate(car.createdAt) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span>Updated</span>
              <span>{car.updatedAt ? formatDate(car.updatedAt) : "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
