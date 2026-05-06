import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Clock,
  Car as CarIcon,
  Phone,
  User,
  AlertCircle,
  CheckCircle,
  IndianRupee,
  Briefcase,
  TrendingDown,
  TrendingUp,
  Edit2,
  Wallet,
  Timer,
  ArrowUpRight,
  Hash,
} from "lucide-react";
import { toast } from "react-hot-toast";

const RentalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const res = await api.get(`/api/rentals/${id}`);
        if (res.data.success) {
          setRental(res.data.data);
        } else {
          toast.error("Failed to load rental details");
        }
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load rental details");
        setLoading(false);
      }
    };
    fetchRental();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-400">Loading rental details...</p>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="bg-white p-12 rounded-[32px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CarIcon size={32} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Rental Not Found</h2>
          <p className="text-gray-500 mb-8 text-sm">The rental you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/rentals")}
            className="px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-black transition font-medium text-sm w-full"
          >
            Go Back to Rentals
          </button>
        </div>
      </div>
    );
  }

  const formatDateShort = (dateString) => {
    if (!dateString) return "Ongoing";
    return format(new Date(dateString), "MMM d, h:mm a");
  };

  const getDuration = () => {
    if (!rental.endTime) {
      return formatDistanceToNow(new Date(rental.startTime), { addSuffix: false });
    }
    const days = rental.durationDays || 0;
    const hours = rental.remainingHours || Math.ceil((rental.durationHours || 0) % 24);
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${Math.ceil(rental.durationHours || 0)}h`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Floating Header */}
      <div className="sticky top-4 z-30 px-2 pointer-events-none">
        <div className="pointer-events-auto bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full p-2 flex items-center justify-between">
          <div className="flex items-center gap-3 pl-2">
            <button onClick={() => navigate("/rentals")}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${rental.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                {rental.status}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${rental.isSettled ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                {rental.isSettled ? "Settled" : "Pending"}
              </span>
            </div>
          </div>
          <div className="flex items-center pr-1">
             <button
              onClick={() => navigate(`/rentals`)}
              className="px-5 py-2 rounded-full text-xs font-bold bg-gray-900 text-white shadow-md hover:bg-black transition flex items-center gap-2"
            >
              <Edit2 size={12} /> Edit Rental
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 px-2 items-start mt-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Car Card */}
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <CarIcon size={120} />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 md:mb-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    {rental.car?.brand} {rental.car?.model}
                  </h2>
                  <div className="flex items-center gap-2 md:gap-3 mt-4 flex-wrap">
                    <span className="bg-gray-100 text-gray-900 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border border-gray-200">
                      <Hash size={12} className="text-gray-400" />
                      {rental.car?.plateNumber}
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center self-start">
                  <CarIcon size={24} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Daily Rate</div>
                  <div className="text-lg md:text-xl font-bold text-gray-900">₹{rental.car?.dailyRate?.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hourly Rate</div>
                  <div className="text-lg md:text-xl font-bold text-gray-900">₹{rental.car?.hourlyRate?.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8">
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                <Timer size={14} />
              </div>
              Rental Timeline
            </h3>

            <div className="relative ml-4">
              <div className="absolute left-0 top-3 bottom-3 w-px bg-gray-200"></div>

              {/* Start */}
              <div className="relative flex gap-6 mb-8">
                <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 z-10 shrink-0 -ml-4 border-4 border-white">
                  <ArrowUpRight size={14} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Picked Up</div>
                  <div className="text-lg font-bold text-gray-900">{formatDateShort(rental.startTime)}</div>
                  {rental.status === "Active" && (
                    <div className="text-xs text-gray-500 font-medium mt-1">
                      {formatDistanceToNow(new Date(rental.startTime), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>

              {/* End */}
              <div className="relative flex gap-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 -ml-4 border-4 border-white ${rental.endTime ? "bg-gray-100 text-gray-500" : "bg-amber-50 text-amber-500 animate-pulse"}`}>
                  <CheckCircle size={14} />
                </div>
                <div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${rental.endTime ? "text-gray-400" : "text-amber-500"}`}>
                    {rental.endTime ? "Returned" : "Ongoing"}
                  </div>
                  <div className={`text-lg font-bold ${!rental.endTime ? "text-amber-600" : "text-gray-900"}`}>
                    {rental.endTime ? formatDateShort(rental.endTime) : "In Progress..."}
                  </div>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Clock size={16} className="text-gray-500" />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Duration</span>
              </div>
              <span className="text-2xl font-extrabold text-gray-900">{getDuration()}</span>
            </div>
          </div>

          {/* Customer Card - Mobile Only */}
          <div className="lg:hidden bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 p-6">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={12} /> Customer
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                {rental.customer?.name?.[0] || "C"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-bold text-gray-900 truncate">{rental.customer?.name || "Unknown"}</div>
                <div className="text-xs font-bold text-gray-400 tracking-wide mt-1 uppercase">
                  {rental.customer?.occupation || "Student"}
                </div>
              </div>
            </div>
            <a href={`tel:${rental.customer?.phone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-sm font-bold text-gray-700">
              <Phone size={14} className="text-gray-400" /> Call {rental.customer?.phone || "N/A"}
            </a>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* Financial Summary */}
          <div className="bg-gray-900 rounded-[24px] shadow-xl p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <IndianRupee size={10} />
                </div>
                Financial Summary
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-400">Base Rent</span>
                  <span className="font-bold text-white">₹{rental.totalRent?.toLocaleString() || 0}</span>
                </div>

                {rental.advance > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-indigo-300">
                      <Wallet size={14} /> Advance
                    </span>
                    <span className="font-bold text-indigo-100">₹{rental.advance.toLocaleString()}</span>
                  </div>
                )}

                {rental.chot > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-emerald-400">
                      <TrendingUp size={14} /> Chot Received
                    </span>
                    <span className="font-bold text-emerald-100">+₹{rental.chot.toLocaleString()}</span>
                  </div>
                )}

                {rental.deductions?.amount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-rose-400">
                      <TrendingDown size={14} /> Deduction
                    </span>
                    <span className="font-bold text-rose-100">-₹{rental.deductions.amount.toLocaleString()}</span>
                  </div>
                )}

                {rental.ghata?.amount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-purple-400">
                      <TrendingDown size={14} /> Ghata (Loss)
                    </span>
                    <span className="font-bold text-purple-100">-₹{rental.ghata.amount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Collected</span>
                  <span className="text-4xl font-extrabold tracking-tight">
                    ₹{rental.finalAmountCollected?.toLocaleString() || 0}
                  </span>
                </div>
                
                <div className={`text-center py-3 rounded-xl text-xs font-bold uppercase tracking-widest ${rental.isSettled ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                  {rental.isSettled ? "✓ Fully Settled" : "⏳ Pending Settlement"}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Card - Desktop Only */}
          <div className="hidden lg:block bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <User size={12} /> Customer
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-2xl shrink-0">
                {rental.customer?.name?.[0] || "C"}
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{rental.customer?.name || "Unknown"}</div>
                <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-1">
                  {rental.customer?.occupation || "Student"}
                </div>
              </div>
            </div>
            <a href={`tel:${rental.customer?.phone}`} className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-sm font-bold text-gray-700">
              <Phone size={14} className="text-gray-400" /> Call {rental.customer?.phone || "N/A"}
            </a>
          </div>

          {/* Notes */}
          {(rental.deductions?.reason || rental.ghata?.reason) && (
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle size={12} /> Incident Notes
              </h3>
              <div className="space-y-4">
                {rental.deductions?.reason && (
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100/50">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-2">Deduction Details</span>
                    <p className="text-gray-700 text-sm font-medium leading-relaxed">{rental.deductions.reason}</p>
                  </div>
                )}
                {rental.ghata?.reason && (
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100/50">
                    <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block mb-2">Ghata Details</span>
                    <p className="text-gray-700 text-sm font-medium leading-relaxed">{rental.ghata.reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Metadata */}
          <div className="flex justify-between items-center px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Logged {rental.createdAt ? format(new Date(rental.createdAt), "MMM d, yyyy") : "—"}</span>
            <span>Upd {rental.updatedAt ? format(new Date(rental.updatedAt), "MMM d, yyyy") : "—"}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RentalDetail;
