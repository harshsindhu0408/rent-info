import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Car as CarIcon,
  Phone,
  User,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Briefcase,
  MapPin,
  TrendingDown,
  TrendingUp,
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
        setRental(res.data);
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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800">Rental Not Found</h2>
        <Link
          to="/rentals"
          className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-black transition"
        >
          Go Back
        </Link>
      </div>
    );
  }

  // Helpers
  const formatDate = (dateString) => {
    if (!dateString) return "Ongoing";
    return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
  };

  const getDuration = (start, end) => {
    if (!end) return "Ongoing";
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = endTime - startTime;
    const hours = diff / (1000 * 60 * 60);

    const days = Math.floor(hours / 24);
    const remainingHours = Math.ceil(hours % 24);

    if (days > 0) {
      return `${days} Day${days > 1 ? "s" : ""} ${remainingHours} Hour${
        remainingHours > 1 ? "s" : ""
      }`;
    }
    return `${Math.ceil(hours)} Hours`;
  };

  const netTotal = rental.finalAmountCollected || 0;
  const isLoss = netTotal < 0; // Should not happen with current logic but good to handle

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 font-sans">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate("/rentals")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition font-medium"
        >
          <ArrowLeft size={20} />
          Back to Rentals
        </button>
        <div className="flex gap-3">
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase ${
              rental.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {rental.status}
          </span>
          {rental.isSettled ? (
            <span className="px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase bg-blue-100 text-blue-700">
              Settled
            </span>
          ) : (
            <span className="px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase bg-orange-100 text-orange-700">
              Pending
            </span>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Info Column */}
        <div className="md:col-span-2 space-y-8">
          {/* Car Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {rental.car.brand} {rental.car.model}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
                    {rental.car.plateNumber}
                  </span>
                  <span>•</span>
                  <span>{rental.car.color}</span>
                </div>
              </div>
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <CarIcon size={32} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-50">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Daily Rate
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  ₹{rental.car.dailyRate}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Hourly Rate
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  ₹{rental.car.hourlyRate}
                </div>
              </div>
            </div>
          </div>

          {/* Time & Duration */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-gray-400" /> Rental Duration
            </h3>
            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-gray-100">
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-7 h-7 bg-green-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm font-semibold text-gray-500 mb-1">
                  Picked Up
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatDate(rental.startTime)}
                </div>
              </div>

              <div className="relative pl-10">
                <div
                  className={`absolute left-0 top-1 w-7 h-7 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                    rental.endTime
                      ? "bg-gray-100 text-gray-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      rental.endTime ? "bg-gray-500" : "bg-orange-500"
                    }`}
                  ></div>
                </div>
                <div className="text-sm font-semibold text-gray-500 mb-1">
                  Returned
                </div>
                <div
                  className={`text-lg font-bold ${
                    !rental.endTime ? "text-orange-500" : "text-gray-900"
                  }`}
                >
                  {formatDate(rental.endTime)}
                </div>
              </div>
            </div>

            {rental.endTime && (
              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <span className="text-gray-500 font-medium">
                  Total Duration
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {getDuration(rental.startTime, rental.endTime)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Financials Card - The "Fantastic" Part */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <DollarSign size={120} />
            </div>

            <div className="relative z-10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                Financial Summary
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-gray-300">
                  <span>Base Rent</span>
                  <span className="font-semibold text-white">
                    ₹{rental.totalRent?.toLocaleString() || 0}
                  </span>
                </div>
                {rental.deductions?.amount > 0 && (
                  <div className="flex justify-between items-center text-red-300">
                    <span className="flex items-center gap-1">
                      <TrendingDown size={14} /> Deductions
                    </span>
                    <span className="font-semibold">
                      -₹{rental.deductions.amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {rental.chot > 0 && (
                  <div className="flex justify-between items-center text-orange-300">
                    <span className="flex items-center gap-1">
                      <TrendingDown size={14} /> Discount (Chot)
                    </span>
                    <span className="font-semibold">
                      -₹{rental.chot.toLocaleString()}
                    </span>
                  </div>
                )}
                {rental.ghata?.amount > 0 && (
                  <div className="flex justify-between items-center text-purple-300">
                    <span className="flex items-center gap-1">
                      <TrendingDown size={14} /> Loss (Ghata)
                    </span>
                    <span className="font-semibold">
                      -₹{rental.ghata.amount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-700">
                <div className="flex justify-between items-end">
                  <span className="text-gray-400 text-sm font-medium">
                    Net Collection
                  </span>
                  <span className="text-4xl font-bold tracking-tight text-green-400">
                    ₹{netTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-end mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded bg-gray-700 ${
                      rental.isSettled ? "text-green-300" : "text-orange-300"
                    }`}
                  >
                    {rental.isSettled ? "Fully Paid" : "Payment Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <User size={16} /> Customer Details
            </h3>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl">
                {rental.customer?.name?.[0] || "C"}
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {rental.customer?.name || "Unknown"}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Briefcase size={12} />{" "}
                  {rental.customer?.occupation || "Student"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <a
                href={`tel:${rental.customer?.phone}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition text-gray-700"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Phone size={18} className="text-gray-900" />
                </div>
                <span className="font-semibold">
                  {rental.customer?.phone || "N/A"}
                </span>
              </a>
            </div>
          </div>

          {/* Additional Notes / Reasons */}
          {(rental.deductions?.reason || rental.ghata?.reason) && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle size={16} /> Notes
              </h3>
              <div className="space-y-4">
                {rental.deductions?.reason && (
                  <div>
                    <span className="text-xs font-semibold text-red-500 uppercase">
                      Deduction Reason
                    </span>
                    <p className="text-gray-700 mt-1 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                      {rental.deductions.reason}
                    </p>
                  </div>
                )}
                {rental.ghata?.reason && (
                  <div>
                    <span className="text-xs font-semibold text-purple-500 uppercase">
                      Loss Reason
                    </span>
                    <p className="text-gray-700 mt-1 text-sm bg-purple-50 p-3 rounded-xl border border-purple-100">
                      {rental.ghata.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalDetail;
