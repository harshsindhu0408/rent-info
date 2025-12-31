import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import DatePicker from "react-datepicker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Filter,
  TrendingUp,
  TrendingDown,
  Car as CarIcon,
  Activity,
  AlertCircle,
  IndianRupee,
  BarChart3,
  X,
  Eye,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

const Reports = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState({
    rentals: [],
    meta: { totalCollected: 0, count: 0, activeCount: 0, completedCount: 0 },
  });
  const [stats, setStats] = useState({
    perCar: [],
    monthly: [],
    overall: {
      totalCollected: 0,
      count: 0,
      activeCount: 0,
      completedCount: 0,
      pendingSettlement: 0,
      totalDeductions: 0,
      totalChot: 0,
      totalGhata: 0,
    }
  });
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    carId: "",
    month: "",
    startDate: "",
    endDate: "",
    includeActive: true,
  });

  useEffect(() => {
    fetchCars();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchCars = async () => {
    try {
      const res = await api.get("/api/cars");
      setCars(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/reports/stats");
      setStats(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    try {
      const params = {};
      if (filters.carId) params.carId = filters.carId;
      if (filters.month) params.month = filters.month;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.includeActive) params.includeActive = 'true';

      const res = await api.get("/api/reports/rent", { params });
      setReportData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const clearFilters = () => {
    setFilters({ carId: "", month: "", startDate: "", endDate: "", includeActive: true });
  };

  const hasActiveFilters = filters.carId || filters.month || filters.startDate || filters.endDate;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-lg">Complete insights into your rental business</p>
        </div>
        <button
          onClick={() => { fetchStats(); fetchReportData(); }}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600 self-start sm:self-auto"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Revenue */}
        <div className="col-span-2 bg-gradient-to-br from-emerald-500 to-green-600 p-4 md:p-6 rounded-2xl md:rounded-3xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-100 mb-1 md:mb-2">
              <IndianRupee size={16} className="shrink-0" />
              <span className="text-xs md:text-sm font-medium uppercase tracking-wider">Total Revenue</span>
            </div>
            <p className="text-2xl md:text-4xl font-bold">₹{stats.overall.totalCollected?.toLocaleString() || 0}</p>
            <p className="text-emerald-200 text-xs md:text-sm mt-1 md:mt-2">
              From {stats.overall.count || 0} total rentals
            </p>
          </div>
        </div>

        {/* Total Rentals */}
        <div className="bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 mb-1 md:mb-2">
            <Activity size={14} className="shrink-0" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Rentals</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.overall.count || 0}</p>
          <p className="text-[10px] md:text-xs text-gray-500 mt-1">
            {stats.overall.activeCount} active
          </p>
        </div>

        {/* Pending */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-5 rounded-xl md:rounded-2xl border border-amber-100">
          <div className="flex items-center gap-2 text-amber-600 mb-1 md:mb-2">
            <AlertCircle size={14} className="shrink-0" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-amber-700">{stats.overall.pendingSettlement || 0}</p>
          <p className="text-[10px] md:text-xs text-amber-500 mt-1">Settlement</p>
        </div>
      </div>

      {/* Financial Adjustments */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-green-100 rounded-lg md:rounded-xl text-green-600 shrink-0">
              <TrendingUp size={16} className="md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase truncate">Chot</p>
              <p className="text-sm md:text-2xl font-bold text-green-600">+₹{(stats.overall.totalChot || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-red-100 rounded-lg md:rounded-xl text-red-600 shrink-0">
              <TrendingDown size={16} className="md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase truncate">Deductions</p>
              <p className="text-sm md:text-2xl font-bold text-red-600">-₹{(stats.overall.totalDeductions || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-purple-100 rounded-lg md:rounded-xl text-purple-600 shrink-0">
              <TrendingDown size={16} className="md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase truncate">Ghata</p>
              <p className="text-sm md:text-2xl font-bold text-purple-600">-₹{(stats.overall.totalGhata || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Revenue Trend */}
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <BarChart3 size={18} className="text-gray-400" />
            <h3 className="font-bold text-gray-900 text-sm md:text-base">Monthly Revenue</h3>
          </div>
          <div className="h-48 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...stats.monthly].reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="_id" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <ReTooltip
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Line type="monotone" dataKey="totalCollected" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Vehicle */}
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <CarIcon size={18} className="text-gray-400" />
            <h3 className="font-bold text-gray-900 text-sm md:text-base">Revenue by Vehicle</h3>
          </div>
          <div className="h-48 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.perCar} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" stroke="#9CA3AF" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                <YAxis dataKey="carModel" type="category" width={60} stroke="#4B5563" tick={{ fontSize: 10 }} />
                <ReTooltip
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  cursor={{ fill: "#F3F4F6" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="totalCollected" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Report */}
      <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <h2 className="font-bold text-gray-900 text-sm md:text-lg">Detailed Report</h2>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs md:text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Filters - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-6">
          <select
            className="px-3 py-2 md:py-3 bg-gray-50 border-0 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-xs md:text-sm"
            value={filters.carId}
            onChange={(e) => setFilters({ ...filters, carId: e.target.value })}
          >
            <option value="">All Vehicles</option>
            {cars.map((car) => (
              <option key={car._id} value={car._id}>{car.plateNumber}</option>
            ))}
          </select>

          <DatePicker
            selected={filters.month ? new Date(filters.month) : null}
            onChange={(date) => {
              const m = date ? date.toISOString().slice(0, 7) : "";
              setFilters({ ...filters, month: m, startDate: "", endDate: "" });
            }}
            dateFormat="MMM yyyy"
            showMonthYearPicker
            placeholderText="Month"
            className="w-full px-3 py-2 md:py-3 bg-gray-50 border-0 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-xs md:text-sm"
            isClearable
          />

          <DatePicker
            selected={filters.startDate ? new Date(filters.startDate) : null}
            onChange={(date) => {
              const d = date ? date.toISOString().slice(0, 10) : "";
              setFilters({ ...filters, startDate: d, month: "" });
            }}
            dateFormat="MMM d"
            placeholderText="From"
            className="w-full px-3 py-2 md:py-3 bg-gray-50 border-0 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-xs md:text-sm"
            isClearable
          />

          <DatePicker
            selected={filters.endDate ? new Date(filters.endDate) : null}
            onChange={(date) => {
              const d = date ? date.toISOString().slice(0, 10) : "";
              setFilters({ ...filters, endDate: d, month: "" });
            }}
            dateFormat="MMM d"
            placeholderText="To"
            className="w-full px-3 py-2 md:py-3 bg-gray-50 border-0 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-xs md:text-sm"
            isClearable
          />

          <label className="col-span-2 md:col-span-1 flex items-center gap-2 md:gap-3 px-3 py-2 md:py-3 bg-gray-50 rounded-lg md:rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={filters.includeActive}
              onChange={(e) => setFilters({ ...filters, includeActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs md:text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-3 md:p-4 rounded-lg md:rounded-xl border border-emerald-100">
            <p className="text-[10px] md:text-xs font-bold text-emerald-600 uppercase mb-0.5 md:mb-1">Revenue</p>
            <p className="text-sm md:text-2xl font-bold text-emerald-700">₹{(reportData.meta.totalCollected / 1000 || 0).toFixed(0)}k</p>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-200">
            <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase mb-0.5 md:mb-1">Total</p>
            <p className="text-sm md:text-2xl font-bold text-gray-900">{reportData.meta.count || 0}</p>
          </div>
          <div className="bg-emerald-50 p-3 md:p-4 rounded-lg md:rounded-xl border border-emerald-100">
            <p className="text-[10px] md:text-xs font-bold text-emerald-600 uppercase mb-0.5 md:mb-1">Active</p>
            <p className="text-sm md:text-2xl font-bold text-emerald-700">{reportData.meta.activeCount || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-200">
            <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase mb-0.5 md:mb-1">Done</p>
            <p className="text-sm md:text-2xl font-bold text-gray-700">{reportData.meta.completedCount || 0}</p>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reportData.rentals.map((rental) => (
                <tr key={rental._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-600 text-sm">{format(new Date(rental.startTime), "MMM d, yyyy")}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{rental.car?.brand} {rental.car?.model}</div>
                    <div className="text-xs text-gray-500 font-mono">{rental.car?.plateNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{rental.customer?.name || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${rental.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                      {rental.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">₹{rental.finalAmountCollected?.toLocaleString() || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => navigate(`/rentals/${rental._id}`)} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {reportData.rentals.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <BarChart3 size={32} className="mx-auto mb-3 text-gray-300" />
                    <p>No records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* List - Mobile */}
        <div className="md:hidden space-y-2">
          {reportData.rentals.map((rental) => (
            <div
              key={rental._id}
              onClick={() => navigate(`/rentals/${rental._id}`)}
              className="p-3 bg-gray-50 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 text-sm truncate">{rental.car?.brand} {rental.car?.model}</div>
                <div className="text-xs text-gray-500">{rental.customer?.name} • {format(new Date(rental.startTime), "MMM d")}</div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <div className="font-bold text-gray-900 text-sm">₹{rental.finalAmountCollected?.toLocaleString() || 0}</div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${rental.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>
                  {rental.status}
                </span>
              </div>
            </div>
          ))}
          {reportData.rentals.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              <BarChart3 size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
