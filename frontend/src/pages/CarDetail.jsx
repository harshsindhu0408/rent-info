import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  ArrowLeft, Car as CarIcon, Calendar, Fuel, Users, Settings, Palette,
  FileText, Shield, Plus, Edit2, Trash2, Save, X, Activity, IndianRupee,
  AlertTriangle, CheckCircle, Hash, Gauge, Image as ImageIcon, Camera, Link, ExternalLink,
  ChevronRight
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
    description: "", amount: "", km: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [addingMaintenance, setAddingMaintenance] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseEditForm, setExpenseEditForm] = useState({ description: "", amount: "", date: "" });
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState({});

  useEffect(() => { fetchCar(); }, [id]);

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
      Object.keys(editForm).forEach((key) => {
        if (!["documents","maintenanceHistory","_id","__v","createdAt","updatedAt"].includes(key)) {
          if (editForm[key] !== null && editForm[key] !== undefined) {
            formData.append(key, editForm[key]);
          }
        }
      });
      if (files.insurance) formData.append("insurance", files.insurance);
      if (files.rc) formData.append("rc", files.rc);
      if (files.puc) formData.append("puc", files.puc);
      if (files.drivingLicence) formData.append("drivingLicence", files.drivingLicence);
      if (files.images && files.images.length > 0) {
        files.images.forEach(file => formData.append("images", file));
      }
      const res = await api.patch(`/api/cars/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCar(res.data);
      setEditForm(res.data);
      setFiles({});
      setIsEditing(false);
      toast.success("Vehicle updated successfully!");
    } catch (error) {
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

  const handleImageUpload = (e) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setFiles((prev) => ({
        ...prev,
        images: prev.images ? [...prev.images, ...newImages] : newImages
      }));
    }
  };

  const removeSelectedImage = (index) => {
    setFiles(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleImageDelete = async (imagePath) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const res = await api.delete(`/api/cars/${id}/images`, { data: { imagePath } });
      setCar(res.data);
      setEditForm(res.data);
      toast.success("Image deleted");
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    setAddingMaintenance(true);
    try {
      const res = await api.post(`/api/cars/${id}/maintenance`, maintenanceForm);
      setCar(res.data);
      setMaintenanceForm({ description: "", amount: "", km: "", date: new Date().toISOString().split("T")[0] });
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
      const res = await api.patch(`/api/cars/${id}/maintenance/${editingExpenseId}`, expenseEditForm);
      setCar(res.data);
      setEditingExpenseId(null);
      toast.success("Expense updated successfully");
    } catch (error) {
      toast.error("Failed to update expense");
    }
  };

  const handleDeleteMaintenance = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
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
      date: record.date ? new Date(record.date).toISOString().split("T")[0] : "",
    });
  };

  const totalExpenses = car?.maintenanceHistory?.reduce((sum, item) => sum + item.amount, 0) || 0;

  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const isExpiringSoon = (date) => {
    if (!date) return false;
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return diff <= 30 && diff > 0;
  };

  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const docStatusColor = (expiry) => {
    if (!expiry) return "bg-gray-50 border-gray-100";
    if (isExpired(expiry)) return "bg-rose-50 border-rose-100";
    if (isExpiringSoon(expiry)) return "bg-amber-50 border-amber-100";
    return "bg-emerald-50 border-emerald-100";
  };

  const docTextColor = (expiry) => {
    if (!expiry) return "text-gray-500";
    if (isExpired(expiry)) return "text-rose-700";
    if (isExpiringSoon(expiry)) return "text-amber-700";
    return "text-emerald-700";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-400">Loading vehicle profile...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="bg-white p-12 rounded-[32px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CarIcon size={32} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-500 mb-8 text-sm">The asset you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate("/cars")} className="px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-black transition font-medium text-sm w-full">
            Return to Fleet
          </button>
        </div>
      </div>
    );
  }

  /* ─── DOCUMENT CARD HELPER ─── */
  const DocCard = ({ label, expiry, docKey, fileKey }) => (
    <div className={`rounded-2xl border p-5 transition-all ${docStatusColor(expiry)}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">{label}</span>
        {isExpired(expiry) && <AlertTriangle size={16} className="text-rose-500" />}
        {isExpiringSoon(expiry) && !isExpired(expiry) && <AlertTriangle size={16} className="text-amber-500" />}
        {expiry && !isExpired(expiry) && !isExpiringSoon(expiry) && <CheckCircle size={16} className="text-emerald-500" />}
        {!expiry && <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />}
      </div>
      {expiry !== undefined && (
        <div className="mb-4">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Expiry</p>
          {isEditing ? (
            <input
              type="date"
              className="w-full bg-white rounded-lg px-3 py-2 border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none"
              value={editForm[fileKey] ? new Date(editForm[fileKey]).toISOString().split("T")[0] : ""}
              onChange={(e) => setEditForm({ ...editForm, [fileKey]: e.target.value })}
            />
          ) : (
            <p className={`text-sm font-bold ${docTextColor(expiry)}`}>{formatDate(expiry)}</p>
          )}
        </div>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-black/5">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">File</span>
        {car.documents?.[docKey] ? (
          <a href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/${car.documents[docKey]}`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 group">
            View <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        ) : (
          <span className="text-xs text-gray-400 font-medium">Missing</span>
        )}
      </div>
      {isEditing && (
        <div className="mt-3 relative">
           <input type="file" accept="image/*,.heic,.heif,application/pdf"
            className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer"
            onChange={(e) => handleFileChange(e, docKey)}
          />
        </div>
      )}
    </div>
  );

  /* ─── SPEC FIELD HELPER ─── */
  const SpecField = ({ icon: Icon, label, field, type = "text", options, placeholder }) => (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shadow-sm text-gray-400">
           <Icon size={12} />
        </div>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      {isEditing ? (
        options ? (
          <select className="w-full bg-white rounded-lg px-3 py-2 border border-gray-200 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-50 outline-none"
            value={editForm[field] || ""} onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}>
            <option value="">Select</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type={type} placeholder={placeholder}
            className="w-full bg-white rounded-lg px-3 py-2 border border-gray-200 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-50 outline-none"
            value={editForm[field] || ""} onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
          />
        )
      ) : (
        <p className="text-sm font-bold text-gray-900 pl-1">{car[field] || "—"}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-8 animate-in fade-in duration-500">
      
      {/* ── Floating Nav / Control Bar ── */}
      <div className="sticky top-4 z-30 px-2 pointer-events-none">
        <div className="pointer-events-auto bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full p-2 flex items-center justify-between">
          
          <div className="flex items-center gap-3 pl-2">
            <button onClick={() => navigate("/cars")}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-gray-900">{car.brand} {car.model}</h1>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                  car.status === "Available" ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : car.status === "Rented" ? "bg-amber-50 text-amber-600 border-amber-100" 
                  : "bg-gray-50 text-gray-600 border-gray-200"
                }`}>
                {car.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-1">
            {isEditing ? (
              <>
                <button onClick={() => { setIsEditing(false); setEditForm(car); setFiles({}); }}
                  className="px-4 py-2 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition flex items-center gap-2 disabled:opacity-50">
                  <Save size={14} /> 
                  <span className="hidden sm:inline">Save Profile</span>
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)}
                className="px-5 py-2 rounded-full text-xs font-bold bg-gray-900 text-white shadow-md hover:bg-black transition flex items-center gap-2">
                <Edit2 size={12} />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 px-2 items-start mt-8">

        {/* ══ LEFT COLUMN (col-span-2) ══ */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">

          {/* Vehicle Identity Card */}
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <CarIcon size={120} />
            </div>
            <div className="relative">
              <div className="flex items-start justify-between gap-4 mb-8">
                <div className="min-w-0">
                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Brand</label>
                        <input type="text" className="w-full sm:w-40 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none"
                          value={editForm.brand || ""} onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })} />
                      </div>
                      <div className="flex-1">
                         <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Model</label>
                        <input type="text" className="w-full bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 text-lg font-bold focus:ring-4 focus:ring-indigo-50 outline-none"
                          value={editForm.model || ""} onChange={(e) => setEditForm({ ...editForm, model: e.target.value })} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">{car.brand}</p>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">{car.model}</h2>
                    </>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="bg-gray-100 text-gray-900 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border border-gray-200">
                      <Hash size={12} className="text-gray-400" /> {car.plateNumber}
                    </span>
                    {car.year && <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 text-gray-500 border border-gray-100">{car.year}</span>}
                    {car.color && <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 text-gray-500 border border-gray-100">{car.color}</span>}
                  </div>
                </div>
              </div>

              {/* Rate + Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-gray-50">
                {[
                  { label: "Hourly Rate", field: "hourlyRate", prefix: "₹" },
                  { label: "Daily Rate", field: "dailyRate", prefix: "₹" },
                  { label: "Total Cost", value: `₹${totalExpenses.toLocaleString("en-IN")}` },
                  { label: "Odometer", value: car.lastServicedKm ? `${car.lastServicedKm.toLocaleString()} km` : "N/A" },
                ].map(({ label, field, prefix, value }) => (
                  <div key={label} className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    {field && isEditing ? (
                      <input type="number" className="w-full text-base font-bold bg-white rounded-lg px-3 py-2 border border-gray-200 focus:ring-4 focus:ring-indigo-50 outline-none"
                        value={editForm[field] || ""} onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })} />
                    ) : (
                      <p className="text-lg md:text-xl font-bold text-gray-900 truncate">
                        {field ? `${prefix}${car[field]?.toLocaleString() || "—"}` : value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Gauge size={16} />
              </div>
              <h3 className="text-base font-bold text-gray-900">Specifications</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {SpecField({ icon: Fuel, label: "Fuel", field: "fuelType", options: ["Petrol","Diesel","CNG","Electric","Hybrid"] })}
              {SpecField({ icon: Settings, label: "Gear", field: "transmission", options: ["Manual","Automatic"] })}
              {SpecField({ icon: Users, label: "Seats", field: "seatingCapacity", type: "number", placeholder: "5" })}
              {SpecField({ icon: Palette, label: "Color", field: "color", placeholder: "White" })}
              {SpecField({ icon: Calendar, label: "Year", field: "year", type: "number", placeholder: "2024" })}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shadow-sm text-gray-400">
                    <CheckCircle size={12} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</span>
                </div>
                {isEditing ? (
                  <select className="w-full bg-white rounded-lg px-3 py-2 border border-gray-200 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-50 outline-none appearance-none"
                    value={editForm.status || "Available"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                ) : (
                  <p className={`text-sm font-bold pl-1 ${car.status === "Available" ? "text-emerald-600" : car.status === "Rented" ? "text-amber-600" : "text-gray-600"}`}>
                    {car.status}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Gallery */}
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ImageIcon size={16} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Media Gallery</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/gallery/${car._id}`); toast.success("Link copied!"); }}
                  className="px-3 py-2 rounded-full text-xs font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 transition flex items-center gap-1.5 border border-gray-200 shadow-sm">
                  <Link size={12} className="text-gray-400" /> Share
                </button>
                <a href={`/gallery/${car._id}`} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-2 rounded-full text-xs font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 transition flex items-center gap-1.5 border border-gray-200 shadow-sm">
                  <ExternalLink size={12} className="text-gray-400" /> View
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {car.images?.map((img, idx) => (
                <div key={idx} className="relative group aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                  <img src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/${img}`}
                    alt={`Car ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {isEditing && (
                    <button onClick={() => handleImageDelete(img)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-rose-600 hover:scale-105">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
              {isEditing && files.images?.map((file, idx) => (
                <div key={`new-${idx}`} className="relative group aspect-square bg-gray-50 rounded-2xl overflow-hidden border-2 border-indigo-200">
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover opacity-80" />
                  <button onClick={() => removeSelectedImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-gray-900 text-white rounded-full hover:bg-black transition-all shadow-lg hover:scale-105">
                    <X size={12} />
                  </button>
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-indigo-500 text-white text-[9px] rounded font-bold uppercase shadow-sm">New</span>
                </div>
              ))}
              {isEditing && (
                <label className="flex flex-col items-center justify-center aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:bg-gray-100 hover:border-indigo-400 transition cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Camera size={18} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-indigo-600">Add Photos</span>
                  <input type="file" multiple accept="image/*,.heic,.heif" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
              {(!car.images || car.images.length === 0) && !isEditing && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <ImageIcon size={20} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No media uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
               <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Shield size={16} />
              </div>
              <h3 className="text-base font-bold text-gray-900">Compliance & Papers</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DocCard({ label: "Insurance", expiry: car.insuranceExpiry, docKey: "insurance", fileKey: "insuranceExpiry" })}
              {DocCard({ label: "Emissions (PUC)", expiry: car.pucExpiry, docKey: "puc", fileKey: "pucExpiry" })}
              {DocCard({ label: "Registration (RC)", docKey: "rc" })}
              {DocCard({ label: "Licence", docKey: "drivingLicence" })}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText size={16} />
              </div>
              <h3 className="text-base font-bold text-gray-900">Internal Notes</h3>
            </div>
            {isEditing ? (
              <textarea className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-sm font-medium focus:ring-4 focus:ring-indigo-50 outline-none resize-none min-h-[120px]"
                placeholder="Add any internal notes, damages, or special instructions..."
                value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100/50 min-h-[100px]">
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{car.notes || "No internal notes have been added."}</p>
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT SIDEBAR (col-span-1) ══ */}
        <div className="space-y-6 lg:space-y-8">

          {/* Expense Summary Premium Widget */}
          <div className="bg-gray-900 rounded-[24px] shadow-xl p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <Activity size={14} />
                </div>
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Finances</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Maint. Cost</p>
              <p className="text-4xl font-extrabold text-white tracking-tight mb-8">
                ₹{totalExpenses.toLocaleString("en-IN")}
              </p>
              <div className="space-y-3 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Entries</span>
                  <span className="text-sm font-bold text-white">{car.maintenanceHistory?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last Entry</span>
                  <span className="text-sm font-bold text-white">{formatDate(car.lastServicedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Add Expense Button */}
          <button onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-900 px-5 py-3.5 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-sm shadow-sm group">
            <Plus size={16} className={`transition-transform duration-300 ${showMaintenanceForm ? 'rotate-45' : ''} text-gray-400 group-hover:text-gray-900`} />
            {showMaintenanceForm ? "Close Form" : "Log New Expense"}
          </button>

          {/* Add Expense Form */}
          {showMaintenanceForm && (
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 p-6 animate-in slide-in-from-top-4 duration-300">
              <h3 className="text-base font-bold text-gray-900 mb-5">Log Expense</h3>
              <form onSubmit={handleAddMaintenance} className="space-y-4">
                {[
                  { label: "Description", field: "description", type: "text", placeholder: "e.g., Oil Change", required: true },
                  { label: "Amount (₹)", field: "amount", type: "number", placeholder: "0", required: true },
                  { label: "Date", field: "date", type: "date", required: true },
                  { label: "Odometer (km)", field: "km", type: "number", placeholder: "e.g., 5000" },
                ].map(({ label, field, type, placeholder, required }) => (
                  <div key={field}>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
                    <input type={type} required={required} placeholder={placeholder}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all text-sm font-medium"
                      value={maintenanceForm[field]}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, [field]: e.target.value })} />
                  </div>
                ))}
                <button type="submit" disabled={addingMaintenance}
                  className="w-full mt-2 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all text-sm disabled:opacity-50 shadow-lg shadow-gray-200">
                  {addingMaintenance ? "Saving..." : "Save Record"}
                </button>
              </form>
            </div>
          )}

          {/* Expense History List */}
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-50">
              <h3 className="text-base font-bold text-gray-900">History Log</h3>
            </div>
            {car.maintenanceHistory && car.maintenanceHistory.length > 0 ? (
              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {[...car.maintenanceHistory].reverse().map((record) => (
                  <div key={record._id} className="p-5 hover:bg-gray-50/80 transition-colors group">
                    {editingExpenseId === record._id ? (
                      <form onSubmit={handleUpdateMaintenance} className="space-y-3">
                        <input type="text" required className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none"
                          value={expenseEditForm.description} onChange={(e) => setExpenseEditForm({ ...expenseEditForm, description: e.target.value })} />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" required className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none"
                            value={expenseEditForm.amount} onChange={(e) => setExpenseEditForm({ ...expenseEditForm, amount: e.target.value })} />
                          <input type="date" required className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none"
                            value={expenseEditForm.date} onChange={(e) => setExpenseEditForm({ ...expenseEditForm, date: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setEditingExpenseId(null)} className="text-xs px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg font-bold transition-colors">Cancel</button>
                          <button type="submit" className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-black font-bold transition-colors shadow-md">Save</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-bold text-gray-900 text-sm truncate pr-4">{record.description}</p>
                          <p className="font-extrabold text-gray-900 text-sm shrink-0 bg-gray-100 px-2 py-0.5 rounded-md">₹{record.amount?.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(record.date)}{record.km ? ` · ${record.km} km` : ""}</p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditingExpense(record)} className="p-1 text-gray-400 hover:text-indigo-600 transition-colors" title="Edit">
                              <Edit2 size={12} />
                            </button>
                            <button onClick={() => handleDeleteMaintenance(record._id)} className="p-1 text-gray-400 hover:text-rose-600 transition-colors" title="Delete">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity size={16} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-900">No records yet</p>
                <p className="text-xs text-gray-500 mt-1">Log expenses to track maintenance</p>
              </div>
            )}
          </div>

          {/* System Metadata */}
          <div className="flex justify-between items-center px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Added {car.createdAt ? formatDate(car.createdAt) : "—"}</span>
            <span>Upd {car.updatedAt ? formatDate(car.updatedAt) : "—"}</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CarDetail;
