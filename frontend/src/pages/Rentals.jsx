import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Plus,
  Calendar,
  Clock,
  IndianRupee,
  X,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Phone,
  Briefcase,
  User,
  Car as CarIcon,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

const Rentals = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterChot, setFilterChot] = useState("all");

  // Edit Mode State
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    carId: "",
    startTime: "",
    endTime: "",
    deductionAmount: 0,
    deductionReason: "",
    chot: 0,
    ghataAmount: 0,
    ghataReason: "",
    manualTotalRent: "",
    isSettled: false,
    customerName: "",
    customerPhone: "",
    customerOccupation: "Student",
    status: "Active",
  });

  const [estimatedRent, setEstimatedRent] = useState(0);

  useEffect(() => {
    fetchRentalsAndCars();
  }, []);

  const fetchRentalsAndCars = async () => {
    try {
      const [rentalsRes, carsRes] = await Promise.all([
        api.get("/api/rentals"),
        api.get("/api/cars"),
      ]);
      setRentals(rentalsRes.data);
      setCars(carsRes.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load data");
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      const res = await api.get("/api/cars");
      setCars(res.data);
    } catch (error) {
      console.error("Failed to fetch cars");
    }
  };

  // Calculate rent dynamically
  useEffect(() => {
    if (formData.carId && formData.startTime && formData.endTime) {
      const selectedCar = cars.find((c) => c._id === formData.carId);
      if (selectedCar) {
        const start = new Date(formData.startTime);
        const end = new Date(formData.endTime);

        if (end > start) {
          const durationMs = end - start;
          const durationHours = durationMs / (1000 * 60 * 60);

          let total = 0;
          if (durationHours < 24) {
            total = Math.ceil(durationHours) * selectedCar.hourlyRate;
          } else {
            const days = Math.floor(durationHours / 24);
            const removingHours = Math.ceil(durationHours % 24);
            total =
              days * selectedCar.dailyRate +
              removingHours * selectedCar.hourlyRate;
          }
          setEstimatedRent(total);

          // Auto-fill manual rent if creating new or if not set overrides
          if (!editMode && formData.manualTotalRent === "") {
            setFormData((prev) => ({ ...prev, manualTotalRent: total }));
          }
        }
      }
    } else {
      setEstimatedRent(0);
    }
  }, [formData.carId, formData.startTime, formData.endTime, cars]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && editingId) {
        const res = await api.put(`/api/rentals/${editingId}`, formData);
        setRentals(rentals.map((r) => (r._id === editingId ? res.data : r)));
        toast.success("Rental updated successfully");
      } else {
        const res = await api.post("/api/rentals", formData);
        setRentals([res.data, ...rentals]);
        toast.success("Rental created successfully");
      }
      closeModal();
      fetchRentalsAndCars();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rental?")) return;
    try {
      await api.delete(`/api/rentals/${id}`);
      setRentals(rentals.filter((r) => r._id !== id));
      toast.success("Rental deleted");
      fetchRentalsAndCars();
    } catch (error) {
      toast.error("Failed to delete rental");
    }
  };

  // Helper to convert UTC ISO string to Local ISO string (YYYY-MM-DDThh:mm)
  // for datetime-local input
  const toLocalISOString = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  };

  const openModalNew = () => {
    setEditMode(false);
    setEditingId(null);
    setFormData({
      carId: "",
      startTime: toLocalISOString(new Date().toISOString()), // Default to now
      endTime: "",
      deductionAmount: 0,
      deductionReason: "",
      chot: 0,
      ghataAmount: 0,
      ghataReason: "",
      manualTotalRent: "",
      isSettled: false,
      customerName: "",
      customerPhone: "",
      customerOccupation: "Student",
      status: "Active",
    });
    setEstimatedRent(0);
    fetchCars();
    setIsModalOpen(true);
  };

  const openModalEdit = (rental) => {
    setEditMode(true);
    setEditingId(rental._id);
    setFormData({
      carId: rental.car._id,
      startTime: rental.startTime ? toLocalISOString(rental.startTime) : "",
      endTime: rental.endTime ? toLocalISOString(rental.endTime) : "",
      deductionAmount: rental.deductions?.amount || 0,
      deductionReason: rental.deductions?.reason || "",
      chot: rental.chot || 0,
      ghataAmount: rental.ghata?.amount || 0,
      ghataReason: rental.ghata?.reason || "",
      manualTotalRent: rental.totalRent || 0,
      isSettled: rental.isSettled || false,
      customerName: rental.customer?.name || "",
      customerPhone: rental.customer?.phone || "",
      customerOccupation: rental.customer?.occupation || "Student",
      status: rental.status || "Active",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setEditingId(null);
  };

  const filteredRentals = rentals.filter((rental) => {
    if (filterChot === "with") return rental.chot && rental.chot > 0;
    if (filterChot === "without") return !rental.chot || rental.chot === 0;
    return true;
  });

  if (loading) return <div>Loading...</div>;

  const currentTotal = Math.max(
    0,
    (Number(formData.manualTotalRent) || estimatedRent) -
      (Number(formData.deductionAmount) || 0) -
      (Number(formData.chot) || 0) -
      (Number(formData.ghataAmount) || 0)
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Rentals
          </h1>
          <p className="text-gray-500 mt-1">Manage your fleet rentals</p>
        </div>
        <div className="flex gap-4">
          <select
            className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium text-gray-700 shadow-sm"
            value={filterChot}
            onChange={(e) => setFilterChot(e.target.value)}
          >
            <option value="all">All Rentals</option>
            <option value="with">With Chot</option>
            <option value="without">Without Chot</option>
          </select>
          <button
            onClick={openModalNew}
            className="flex items-center space-x-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-200 font-medium"
          >
            <Plus size={18} />
            <span>Create Rental</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Car
                </th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">
                  Financials
                </th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRentals.map((rental) => (
                <tr key={rental._id} className="hover:bg-gray-50/80 transition">
                  <td
                    className="px-6 py-5 align-top group cursor-pointer"
                    onClick={() => navigate(`/rentals/${rental._id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition">
                        <CarIcon size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition">
                          {rental.car?.brand} {rental.car?.model}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5 bg-gray-100 px-1.5 py-0.5 rounded w-fit">
                          {rental.car?.plateNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <div className="font-semibold text-gray-900">
                      {rental.customer?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      <Phone size={12} className="inline mr-1" />
                      {rental.customer?.phone}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {rental.customer?.occupation}
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-[60px] text-xs font-semibold text-gray-400 uppercase">
                          Start
                        </span>
                        <span>
                          {format(new Date(rental.startTime), "MMM d, HH:mm")}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-[60px] text-xs font-semibold text-gray-400 uppercase">
                          End
                        </span>
                        <span
                          className={!rental.endTime ? "text-orange-500" : ""}
                        >
                          {rental.endTime
                            ? format(new Date(rental.endTime), "MMM d, HH:mm")
                            : "Ongoing"}
                        </span>
                      </div>
                      <div className="pt-1 flex gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                            rental.status === "Active"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {rental.status}
                        </span>
                        {rental.isSettled ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            Settled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-right align-top">
                    {rental.finalAmountCollected !== undefined && (
                      <>
                        <div className="text-lg font-bold text-gray-900">
                          ₹{rental.finalAmountCollected.toLocaleString()}
                        </div>
                        <div className="flex flex-col items-end gap-0.5 mt-1">
                          {rental.deductions?.amount > 0 && (
                            <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                              -₹{rental.deductions.amount} Ded.
                            </span>
                          )}
                          {rental.chot > 0 && (
                            <span className="text-xs text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                              -₹{rental.chot} Chot
                            </span>
                          )}
                          {rental.ghata?.amount > 0 && (
                            <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                              -₹{rental.ghata.amount} Lost
                            </span>
                          )}
                        </div>
                      </>
                    )}
                    {/* Show something if total is 0 and active */}
                    {rental.finalAmountCollected === 0 &&
                      rental.status === "Active" && (
                        <span className="text-gray-400 italic text-sm">
                          Will be calculated..
                        </span>
                      )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/rentals/${rental._id}`)}
                        className="p-2 bg-gray-50 hover:bg-blue-50 rounded-lg text-gray-500 hover:text-blue-500 transition border border-gray-200 hover:border-blue-200"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openModalEdit(rental)}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition border border-gray-200"
                        title="Edit Rental"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(rental._id)}
                        className="p-2 bg-gray-50 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition border border-gray-200 hover:border-red-200"
                        title="Delete Rental"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rentals.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <CarIcon size={32} className="text-gray-300" />
                      </div>
                      No rentals found. Create one to get started.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Friendly Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-lg z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editMode ? "Edit Rental Details" : "New Rental"}
                </h2>
                <p className="text-sm text-gray-500">
                  {editMode
                    ? "Update information & settle amounts"
                    : "Fill in the details to start a rental"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">
              {/* Section 1: Core Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Rental Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vehicle
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition font-medium text-gray-900"
                      value={formData.carId}
                      onChange={(e) =>
                        setFormData({ ...formData, carId: e.target.value })
                      }
                      disabled={editMode}
                      required
                    >
                      <option value="">Select a Car...</option>
                      {cars.map((car) => (
                        <option
                          key={car._id}
                          value={car._id}
                          disabled={
                            car.status !== "Available" &&
                            car._id !== formData.carId
                          }
                        >
                          {car.brand} {car.model} ({car.plateNumber})
                          {car.status !== "Available" &&
                          car._id !== formData.carId
                            ? ` - ${car.status}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition text-gray-900"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex justify-between">
                      <span>End Time</span>
                      <span className="text-xs font-normal text-gray-400">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition text-gray-900"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Customer */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-t border-gray-100 pt-6">
                  Customer Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Kumar"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition text-gray-900"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="98765..."
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition text-gray-900"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Occupation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Student"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition text-gray-900"
                      value={formData.customerOccupation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerOccupation: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Adjustments (Shown if End Time present or Edit Mode) */}
              {(formData.endTime || editMode) && (
                <div className="space-y-4 animation-in slide-in-from-top-4 duration-300">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-t border-gray-100 pt-6">
                    Settlement & Adjustments
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Base Rent
                        </label>
                        <div className="text-2xl font-bold text-gray-900">
                          {estimatedRent > 0
                            ? `₹${estimatedRent.toLocaleString()}`
                            : "-"}
                        </div>
                        <div className="text-xs text-gray-400">Calculated</div>
                      </div>
                      <div className="text-right">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Override Base Rent?
                        </label>
                        <input
                          type="number"
                          placeholder="Override"
                          className="w-32 px-3 py-2 bg-white border border-gray-200 rounded-lg text-right font-semibold focus:ring-2 focus:ring-primary-500 outline-none"
                          value={formData.manualTotalRent}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              manualTotalRent: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Deductions */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Deduction (₹)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        value={formData.deductionAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deductionAmount: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Reason
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. scratches"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        value={formData.deductionReason}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deductionReason: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Chot */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Chot (₹)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        value={formData.chot}
                        onChange={(e) =>
                          setFormData({ ...formData, chot: e.target.value })
                        }
                      />
                    </div>
                    <div>{/* Spacer */}</div>

                    {/* Ghata */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Ghata / Loss (₹)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        value={formData.ghataAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ghataAmount: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Loss Reason
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. damage repair"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        value={formData.ghataReason}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ghataReason: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status & Final Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      checked={formData.isSettled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isSettled: e.target.checked,
                        })
                      }
                    />
                    <span className="font-medium text-gray-700">Settled</span>
                  </label>

                  {editMode && (
                    <select
                      className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition shadow-xl shadow-gray-200 flex items-center justify-center gap-3"
              >
                <span>{editMode ? "Update Rental" : "Create Rental"}</span>
                {(formData.endTime || editMode) && (
                  <span className="bg-gray-800 px-3 py-1 rounded-lg text-sm">
                    ₹{currentTotal.toLocaleString()}
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rentals;
