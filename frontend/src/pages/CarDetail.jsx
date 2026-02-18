import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  ArrowLeft, Car as CarIcon, Calendar, Fuel, Users, Settings, Palette,
  FileText, Shield, Plus, Edit2, Trash2, Save, X, Activity, IndianRupee,
  AlertTriangle, CheckCircle, Hash, Gauge, Image, Camera, Link, ExternalLink,
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
    if (!expiry) return "bg-gray-50 border-gray-200";
    if (isExpired(expiry)) return "bg-red-50 border-red-200";
    if (isExpiringSoon(expiry)) return "bg-amber-50 border-amber-200";
    return "bg-emerald-50 border-emerald-200";
  };

  const docTextColor = (expiry) => {
    if (!expiry) return "text-gray-500";
    if (isExpired(expiry)) return "text-red-700";
    if (isExpiringSoon(expiry)) return "text-amber-700";
    return "text-emerald-700";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          <p className="text-gray-500 text-sm font-medium">Loading vehicle...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center max-w-sm w-full border border-gray-100">
          <CarIcon size={40} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-500 mb-6 text-sm">The vehicle you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/cars")} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition font-medium text-sm">
            Back to Fleet
          </button>
        </div>
      </div>
    );
  }

  /* ─── DOCUMENT CARD HELPER ─── */
  const DocCard = ({ label, expiry, docKey, fileKey }) => (
    <div className={`rounded-xl border-2 p-4 ${docStatusColor(expiry)}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</span>
        {isExpired(expiry) && <AlertTriangle size={14} className="text-red-500" />}
        {isExpiringSoon(expiry) && !isExpired(expiry) && <AlertTriangle size={14} className="text-amber-500" />}
        {expiry && !isExpired(expiry) && !isExpiringSoon(expiry) && <CheckCircle size={14} className="text-emerald-500" />}
        {!expiry && <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />}
      </div>
      {expiry !== undefined && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Expiry</p>
          {isEditing ? (
            <input
              type="date"
              className="w-full bg-white rounded-lg px-2 py-1.5 border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none"
              value={editForm[fileKey] ? new Date(editForm[fileKey]).toISOString().split("T")[0] : ""}
              onChange={(e) => setEditForm({ ...editForm, [fileKey]: e.target.value })}
            />
          ) : (
            <p className={`text-sm font-bold ${docTextColor(expiry)}`}>{formatDate(expiry)}</p>
          )}
        </div>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-black/5">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Document</span>
        {car.documents?.[docKey] ? (
          <a href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/${car.documents[docKey]}`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline">
            View
          </a>
        ) : (
          <span className="text-xs text-gray-400 italic">Not uploaded</span>
        )}
      </div>
      {isEditing && (
        <input type="file" accept="image/*,application/pdf"
          className="mt-2 w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          onChange={(e) => handleFileChange(e, docKey)}
        />
      )}
    </div>
  );

  /* ─── SPEC FIELD HELPER ─── */
  const SpecField = ({ icon: Icon, label, field, type = "text", options, placeholder }) => (
    <div className="bg-gray-50 rounded-xl p-3 md:p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={13} className="text-gray-400" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      {isEditing ? (
        options ? (
          <select className="w-full bg-white rounded-lg px-2 py-1.5 border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none"
            value={editForm[field] || ""} onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}>
            <option value="">Select</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type={type} placeholder={placeholder}
            className="w-full bg-white rounded-lg px-2 py-1.5 border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none"
            value={editForm[field] || ""} onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
          />
        )
      ) : (
        <p className="text-sm font-semibold text-gray-900">{car[field] || "—"}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
    {/* ── Sticky Top Bar: Floating Island ── */}
    <div className="sticky top-4 z-30 px-2 sm:px-6 pointer-events-none">
      <div className="pointer-events-auto max-w-5xl mx-auto bg-white/90 backdrop-blur-2xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-2 flex items-center justify-between gap-3">
        
        <div className="flex items-center gap-3 pl-2">
          <button onClick={() => navigate("/cars")}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition">
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{car.brand}</span>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-gray-800">{car.model}</h1>
              <span className={`w-2 h-2 rounded-full ${
                car.status === "Available" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                : car.status === "Rented" ? "bg-amber-500" : "bg-gray-300"
              }`} title={car.status}></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pr-1">
          {isEditing ? (
            <>
              <button onClick={() => { setIsEditing(false); setEditForm(car); setFiles({}); }}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                <X size={16} />
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 transition flex items-center gap-2">
                <Save size={14} /> 
                <span className="hidden sm:inline">Save</span>
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100 transition flex items-center gap-2">
              <Edit2 size={14} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}
        </div>
      </div>
    </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 items-start">

          {/* ══ LEFT COLUMN (col-span-2) ══ */}
          <div className="lg:col-span-2 space-y-5 md:space-y-6">

            {/* Vehicle Identity Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-7 overflow-hidden relative">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gray-50 rounded-full border border-gray-100" />
              <div className="absolute -bottom-8 -right-2 w-20 h-20 bg-gray-50 rounded-full border border-gray-100" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="min-w-0">
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row gap-2 mb-2">
                        <input type="text" placeholder="Brand" className="w-full sm:w-32 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-gray-200 outline-none"
                          value={editForm.brand || ""} onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })} />
                        <input type="text" placeholder="Model" className="w-full sm:flex-1 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 text-xl font-bold focus:ring-2 focus:ring-gray-200 outline-none"
                          value={editForm.model || ""} onChange={(e) => setEditForm({ ...editForm, model: e.target.value })} />
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{car.brand}</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{car.model}</h2>
                      </>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="bg-gray-900 text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                        <Hash size={10} /> {car.plateNumber}
                      </span>
                      {car.year && <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">{car.year}</span>}
                      {car.color && <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">{car.color}</span>}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-900 text-white rounded-xl shrink-0">
                    <CarIcon size={22} />
                  </div>
                </div>

                {/* Rate + Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                  {[
                    { label: "Hourly Rate", field: "hourlyRate", prefix: "₹" },
                    { label: "Daily Rate", field: "dailyRate", prefix: "₹" },
                    { label: "Total Expenses", value: `₹${totalExpenses.toLocaleString("en-IN")}` },
                    { label: "Last Service", value: formatDate(car.lastServicedAt) + (car.lastServicedKm ? ` · ${car.lastServicedKm}km` : "") },
                  ].map(({ label, field, prefix, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                      {field && isEditing ? (
                        <input type="number" className="w-full text-base font-bold bg-white rounded px-2 py-1 border border-gray-200 focus:ring-2 focus:ring-gray-200 outline-none"
                          value={editForm[field] || ""} onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })} />
                      ) : (
                        <p className="text-base md:text-lg font-bold text-gray-900 truncate">
                          {field ? `${prefix}${car[field]?.toLocaleString() || "—"}` : value}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-7">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Gauge size={16} className="text-gray-400" /> Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <SpecField icon={Fuel} label="Fuel" field="fuelType" options={["Petrol","Diesel","CNG","Electric","Hybrid"]} />
                <SpecField icon={Settings} label="Transmission" field="transmission" options={["Manual","Automatic"]} />
                <SpecField icon={Users} label="Seats" field="seatingCapacity" type="number" placeholder="5" />
                <SpecField icon={Palette} label="Color" field="color" placeholder="e.g. White" />
                <SpecField icon={Calendar} label="Year" field="year" type="number" placeholder="2024" />
                <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle size={13} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                  </div>
                  {isEditing ? (
                    <select className="w-full bg-white rounded-lg px-2 py-1.5 border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none"
                      value={editForm.status || "Available"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                      <option value="Available">Available</option>
                      <option value="Rented">Rented</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  ) : (
                    <p className={`text-sm font-semibold ${car.status === "Available" ? "text-emerald-600" : car.status === "Rented" ? "text-amber-600" : "text-gray-600"}`}>
                      {car.status}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Gallery */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-7">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Image size={16} className="text-gray-400" /> Vehicle Gallery
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/gallery/${car._id}`); toast.success("Link copied!"); }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition flex items-center gap-1.5 border border-gray-200">
                    <Link size={11} /> Copy Link
                  </button>
                  <a href={`/gallery/${car._id}`} target="_blank" rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition flex items-center gap-1.5 border border-gray-200">
                    <ExternalLink size={11} /> Public View
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {car.images?.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                    <img src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/${img}`}
                      alt={`Car ${idx + 1}`} className="w-full h-full object-cover" />
                    {isEditing && (
                      <button onClick={() => handleImageDelete(img)}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && files.images?.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative group aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 border-emerald-200">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover opacity-80" />
                    <button onClick={() => removeSelectedImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-gray-900 text-white rounded-full hover:bg-black transition shadow-lg">
                      <X size={12} />
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] rounded font-bold uppercase">New</span>
                  </div>
                ))}
                {isEditing && (
                  <label className="flex flex-col items-center justify-center aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition cursor-pointer group">
                    <Camera size={20} className="text-gray-400 group-hover:text-gray-600 mb-1" />
                    <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-700">Add Photos</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
                {(!car.images || car.images.length === 0) && !isEditing && (
                  <div className="col-span-full flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Image size={28} className="text-gray-300 mb-2" />
                    <p className="text-gray-400 text-sm">No images uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-7">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={16} className="text-gray-400" /> Documents & Compliance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <DocCard label="Insurance" expiry={car.insuranceExpiry} docKey="insurance" fileKey="insuranceExpiry" />
                <DocCard label="PUC Certificate" expiry={car.pucExpiry} docKey="puc" fileKey="pucExpiry" />
                <DocCard label="Registration (RC)" docKey="rc" />
                <DocCard label="Driving Licence" docKey="drivingLicence" />
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-7">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText size={16} className="text-gray-400" /> Notes
              </h3>
              {isEditing ? (
                <textarea className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-gray-200 outline-none resize-none h-24 text-sm"
                  placeholder="Add any notes about this vehicle..."
                  value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed">{car.notes || "No notes added."}</p>
              )}
            </div>
          </div>

          {/* ══ RIGHT SIDEBAR ══ */}
          <div className="space-y-5 md:space-y-6">

            {/* Expense Summary */}
            <div className="bg-gray-900 rounded-2xl shadow-xl p-5 md:p-6 text-white overflow-hidden relative">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full" />
              <div className="relative">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <IndianRupee size={11} /> Total Expenses
                </p>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                  ₹{totalExpenses.toLocaleString("en-IN")}
                </p>
                <p className="text-gray-500 text-xs mb-4">Maintenance cost to date</p>
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Records</span>
                    <span className="font-medium">{car.maintenanceHistory?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last Service</span>
                    <span className="font-medium text-right">{formatDate(car.lastServicedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Expense Button */}
            <button onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl hover:bg-gray-50 transition font-medium text-sm shadow-sm">
              <Plus size={15} />
              {showMaintenanceForm ? "Cancel" : "Add Expense"}
            </button>

            {/* Add Expense Form */}
            {showMaintenanceForm && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">New Expense</h3>
                <form onSubmit={handleAddMaintenance} className="space-y-3">
                  {[
                    { label: "Description", field: "description", type: "text", placeholder: "e.g., Oil Change", required: true },
                    { label: "Amount (₹)", field: "amount", type: "number", placeholder: "0", required: true },
                    { label: "Date", field: "date", type: "date", required: true },
                    { label: "Odometer (km)", field: "km", type: "number", placeholder: "e.g., 5000" },
                  ].map(({ label, field, type, placeholder, required }) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                      <input type={type} required={required} placeholder={placeholder}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 outline-none transition text-sm"
                        value={maintenanceForm[field]}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, [field]: e.target.value })} />
                    </div>
                  ))}
                  <button type="submit" disabled={addingMaintenance}
                    className="w-full bg-gray-900 text-white font-semibold py-2.5 rounded-lg hover:bg-black transition text-sm disabled:opacity-50">
                    {addingMaintenance ? "Adding..." : "Add Record"}
                  </button>
                </form>
              </div>
            )}

            {/* Expense History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity size={11} /> Expense History
              </h3>
              {car.maintenanceHistory && car.maintenanceHistory.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {[...car.maintenanceHistory].reverse().map((record) => (
                    <div key={record._id} className="group flex flex-col p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-transparent hover:border-gray-200">
                      {editingExpenseId === record._id ? (
                        <form onSubmit={handleUpdateMaintenance} className="space-y-2">
                          <input type="text" required className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={expenseEditForm.description} onChange={(e) => setExpenseEditForm({ ...expenseEditForm, description: e.target.value })} />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="number" required className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                              value={expenseEditForm.amount} onChange={(e) => setExpenseEditForm({ ...expenseEditForm, amount: e.target.value })} />
                            <input type="date" required className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                              value={expenseEditForm.date} onChange={(e) => setExpenseEditForm({ ...expenseEditForm, date: e.target.value })} />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setEditingExpenseId(null)} className="text-xs px-3 py-1.5 text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
                            <button type="submit" className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Save</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm truncate">{record.description}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">{formatDate(record.date)}{record.km ? ` · ${record.km} km` : ""}</p>
                            </div>
                            <p className="font-bold text-gray-900 text-sm ml-3 shrink-0">₹{record.amount?.toLocaleString("en-IN")}</p>
                          </div>
                          <div className="flex justify-end gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditingExpense(record)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                              <Edit2 size={11} />
                            </button>
                            <button onClick={() => handleDeleteMaintenance(record._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="mx-auto text-gray-300 mb-2" size={22} />
                  <p className="text-gray-400 text-xs">No expenses recorded yet</p>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 border border-gray-100">
              <div className="flex justify-between mb-1.5">
                <span>Created</span>
                <span className="font-medium text-gray-500">{car.createdAt ? formatDate(car.createdAt) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span className="font-medium text-gray-500">{car.updatedAt ? formatDate(car.updatedAt) : "—"}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CarDetail;

