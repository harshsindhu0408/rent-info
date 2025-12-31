import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          <p className="text-gray-500 font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm text-center max-w-md w-full">
          <CarIcon size={40} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Rental Not Found</h2>
          <p className="text-gray-500 mb-6 text-sm md:text-base">The rental you're looking for doesn't exist.</p>
          <Link
            to="/rentals"
            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition font-medium inline-block text-sm md:text-base"
          >
            Go Back to Rentals
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Ongoing";
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 md:p-6 lg:p-10">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-4 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
          <button
            onClick={() => navigate("/rentals")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition font-medium group text-sm md:text-base"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="flex gap-2 flex-wrap">
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase ${rental.status === "Active"
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}
            >
              {rental.status}
            </span>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase ${rental.isSettled
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-amber-100 text-amber-700 border border-amber-200"
                }`}
            >
              {rental.isSettled ? "✓ Settled" : "Pending"}
            </span>
            <button
              onClick={() => navigate(`/rentals`)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center gap-1"
            >
              <Edit2 size={12} /> Edit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Car Card */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 md:mb-6">
                <div>
                  <h2 className="text-xl md:text-3xl font-bold text-gray-900">
                    {rental.car?.brand} {rental.car?.model}
                  </h2>
                  <div className="flex items-center gap-2 md:gap-3 mt-2 md:mt-3 flex-wrap">
                    <span className="bg-gray-900 text-white px-2.5 py-1 rounded-lg text-xs md:text-sm font-mono font-bold flex items-center gap-1">
                      <Hash size={10} />
                      {rental.car?.plateNumber}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold uppercase ${rental.car?.status === "Available"
                        ? "bg-emerald-100 text-emerald-700"
                        : rental.car?.status === "Rented"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                      {rental.car?.status}
                    </span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-blue-200 self-start">
                  <CarIcon size={24} className="md:w-8 md:h-8" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 pt-4 md:pt-6 border-t border-gray-100">
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
                  <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1">Daily</div>
                  <div className="text-lg md:text-xl font-bold text-gray-900">₹{rental.car?.dailyRate?.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
                  <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1">Hourly</div>
                  <div className="text-lg md:text-xl font-bold text-gray-900">₹{rental.car?.hourlyRate?.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8">
            <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <Timer size={18} className="text-gray-400" />
              Timeline
            </h3>

            <div className="relative">
              <div className="absolute left-4 md:left-5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-emerald-400 to-gray-200"></div>

              {/* Start */}
              <div className="relative flex gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200 z-10 shrink-0">
                  <ArrowUpRight size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-0.5 md:mb-1">Picked Up</div>
                  <div className="text-sm md:text-lg font-bold text-gray-900">{formatDateShort(rental.startTime)}</div>
                  {rental.status === "Active" && (
                    <div className="text-xs text-gray-500 mt-0.5 md:mt-1">
                      {formatDistanceToNow(new Date(rental.startTime), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>

              {/* End */}
              <div className="relative flex gap-4 md:gap-6">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center z-10 shrink-0 ${rental.endTime
                    ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-200"
                    : "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200 animate-pulse"
                  }`}>
                  <CheckCircle size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1 ${rental.endTime ? "text-gray-500" : "text-amber-600"}`}>
                    {rental.endTime ? "Returned" : "Ongoing"}
                  </div>
                  <div className={`text-sm md:text-lg font-bold ${!rental.endTime ? "text-amber-600" : "text-gray-900"}`}>
                    {rental.endTime ? formatDateShort(rental.endTime) : "In Progress..."}
                  </div>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-100 flex items-center justify-between bg-gray-50 -mx-5 md:-mx-8 -mb-5 md:-mb-8 px-5 md:px-8 py-4 md:py-6 rounded-b-2xl md:rounded-b-3xl">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm">
                  <Clock size={16} className="text-gray-600 md:w-5 md:h-5" />
                </div>
                <span className="text-gray-600 font-medium text-sm md:text-base">Duration</span>
              </div>
              <span className="text-xl md:text-2xl font-bold text-gray-900">{getDuration()}</span>
            </div>
          </div>

          {/* Customer Card - Mobile Only */}
          <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={12} /> Customer
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200 shrink-0">
                {rental.customer?.name?.[0] || "C"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-gray-900 truncate">{rental.customer?.name || "Unknown"}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Briefcase size={10} />
                  {rental.customer?.occupation || "Student"}
                </div>
              </div>
            </div>

            <a
              href={`tel:${rental.customer?.phone}`}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl hover:from-emerald-100 hover:to-green-100 transition border border-emerald-100"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                <Phone size={16} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Call Now</div>
                <div className="font-bold text-gray-900 text-sm">{rental.customer?.phone || "N/A"}</div>
              </div>
            </a>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Financial Summary */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl md:rounded-3xl shadow-xl p-5 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
              <h3 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
                <IndianRupee size={12} /> Financial
              </h3>

              <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Base Rent</span>
                  <span className="font-bold text-white">₹{rental.totalRent?.toLocaleString() || 0}</span>
                </div>

                {rental.advance > 0 && (
                  <div className="flex justify-between items-center text-sm text-blue-300">
                    <span className="flex items-center gap-1"><Wallet size={12} /> Advance</span>
                    <span className="font-semibold">₹{rental.advance.toLocaleString()}</span>
                  </div>
                )}

                {rental.chot > 0 && (
                  <div className="flex justify-between items-center text-sm text-emerald-300">
                    <span className="flex items-center gap-1"><TrendingUp size={12} /> Chot</span>
                    <span className="font-semibold">+₹{rental.chot.toLocaleString()}</span>
                  </div>
                )}

                {rental.deductions?.amount > 0 && (
                  <div className="flex justify-between items-center text-sm text-red-300">
                    <span className="flex items-center gap-1"><TrendingDown size={12} /> Deduction</span>
                    <span className="font-semibold">-₹{rental.deductions.amount.toLocaleString()}</span>
                  </div>
                )}

                {rental.ghata?.amount > 0 && (
                  <div className="flex justify-between items-center text-sm text-purple-300">
                    <span className="flex items-center gap-1"><TrendingDown size={12} /> Ghata</span>
                    <span className="font-semibold">-₹{rental.ghata.amount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 md:pt-6 border-t border-gray-700 space-y-3 md:space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-gray-400 text-xs md:text-sm">Total</span>
                  <span className="text-2xl md:text-4xl font-bold text-emerald-400">
                    ₹{rental.finalAmountCollected?.toLocaleString() || 0}
                  </span>
                </div>

                {rental.advance > 0 && (
                  <div className="flex justify-between items-center bg-gray-800/50 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl">
                    <span className="text-gray-400 text-xs md:text-sm">Remaining</span>
                    <span className="text-base md:text-lg font-bold text-amber-400">
                      ₹{rental.remainingAmount?.toLocaleString() || 0}
                    </span>
                  </div>
                )}

                <div className="flex justify-center">
                  <span className={`text-[10px] md:text-xs px-3 md:px-4 py-1.5 md:py-2 rounded-full ${rental.isSettled
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                    {rental.isSettled ? "✓ Fully Paid" : "⏳ Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Card - Desktop Only */}
          <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <User size={14} /> Customer
            </h3>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 shrink-0">
                {rental.customer?.name?.[0] || "C"}
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{rental.customer?.name || "Unknown"}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Briefcase size={12} />
                  {rental.customer?.occupation || "Student"}
                </div>
              </div>
            </div>

            <a
              href={`tel:${rental.customer?.phone}`}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl hover:from-emerald-100 hover:to-green-100 transition border border-emerald-100"
            >
              <div className="p-3 bg-white rounded-xl shadow-sm shrink-0">
                <Phone size={20} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Call Now</div>
                <div className="font-bold text-gray-900">{rental.customer?.phone || "N/A"}</div>
              </div>
            </a>
          </div>

          {/* Notes */}
          {(rental.deductions?.reason || rental.ghata?.reason) && (
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8">
              <h3 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                <AlertCircle size={12} /> Notes
              </h3>
              <div className="space-y-3">
                {rental.deductions?.reason && (
                  <div className="p-3 md:p-4 bg-red-50 rounded-lg md:rounded-xl border border-red-100">
                    <span className="text-[10px] md:text-xs font-bold text-red-500 uppercase block mb-1">Deduction</span>
                    <p className="text-gray-700 text-xs md:text-sm">{rental.deductions.reason}</p>
                  </div>
                )}
                {rental.ghata?.reason && (
                  <div className="p-3 md:p-4 bg-purple-50 rounded-lg md:rounded-xl border border-purple-100">
                    <span className="text-[10px] md:text-xs font-bold text-purple-500 uppercase block mb-1">Loss</span>
                    <p className="text-gray-700 text-xs md:text-sm">{rental.ghata.reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-xs text-gray-400">
            <div className="flex justify-between mb-1">
              <span>Created</span>
              <span>{rental.createdAt ? format(new Date(rental.createdAt), "MMM d, yyyy") : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span>Updated</span>
              <span>{rental.updatedAt ? format(new Date(rental.updatedAt), "MMM d, yyyy") : "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalDetail;
