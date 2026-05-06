import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { DatePicker, MonthPicker } from "../components/common";
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-indigo-600 mb-1">Analytics</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Reports</h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Complete financial and operational insights</p>
        </div>
        <button
          onClick={() => { fetchStats(); fetchReportData(); }}
          className="p-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm text-gray-400 self-start md:self-auto"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Revenue */}
        <div className="col-span-2 bg-gray-900 p-6 md:p-8 rounded-[24px] shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <IndianRupee size={14} className="text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Total Revenue</span>
            </div>
            <p className="text-4xl md:text-5xl font-extrabold tracking-tight mt-4">₹{stats.overall.totalCollected?.toLocaleString() || 0}</p>
            <p className="text-gray-400 text-sm mt-4 font-medium">
              Across <span className="text-white font-bold">{stats.overall.count || 0}</span> total rentals
            </p>
          </div>
        </div>

        {/* Total Rentals */}
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-center">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Activity size={14} className="shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Rentals</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{stats.overall.count || 0}</p>
          <p className="text-xs font-bold text-emerald-600 mt-2">
            {stats.overall.activeCount} currently active
          </p>
        </div>

        {/* Pending */}
        <div className="bg-amber-50 p-6 rounded-[24px] border border-amber-100/50 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-amber-600/70 mb-2">
            <AlertCircle size={14} className="shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Pending Settlement</span>
          </div>
          <p className="text-3xl font-extrabold text-amber-700">{stats.overall.pendingSettlement || 0}</p>
          <p className="text-xs font-bold text-amber-600 mt-2">Requires attention</p>
        </div>
      </div>

      {/* Financial Adjustments */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">Chot Received</p>
            <p className="text-xl font-bold text-emerald-600">+₹{(stats.overall.totalChot || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 shrink-0">
            <TrendingDown size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">Total Deductions</p>
            <p className="text-xl font-bold text-rose-600">-₹{(stats.overall.totalDeductions || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 shrink-0">
            <TrendingDown size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">Ghata (Loss)</p>
            <p className="text-xl font-bold text-purple-600">-₹{(stats.overall.totalGhata || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 size={16} />
            </div>
            <h3 className="font-bold text-gray-900">Revenue Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...stats.monthly].reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="_id" stroke="#9CA3AF" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 10, fontWeight: 600 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <ReTooltip
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: "16px", border: "1px solid #f3f4f6", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="totalCollected" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Vehicle */}
        <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CarIcon size={16} />
            </div>
            <h3 className="font-bold text-gray-900">Asset Performance</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.perCar} layout="vertical" barSize={12}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" stroke="#9CA3AF" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="carModel" type="category" width={80} stroke="#4B5563" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <ReTooltip
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  cursor={{ fill: "#f9fafb" }}
                  contentStyle={{ borderRadius: "16px", border: "1px solid #f3f4f6", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontWeight: 600 }}
                />
                <Bar dataKey="totalCollected" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Report */}
      <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
              <Filter size={18} />
            </div>
            <h2 className="font-bold text-gray-900 text-xl">Data Explorer</h2>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors">
              <X size={12} /> Clear Filters
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[150px]">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Vehicle</label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-gray-700 text-sm appearance-none"
              value={filters.carId}
              onChange={(e) => setFilters({ ...filters, carId: e.target.value })}
            >
              <option value="">All Fleet</option>
              {cars.map((car) => (
                <option key={car._id} value={car._id}>{car.plateNumber}</option>
              ))}
            </select>
          </div>

          <div className="w-[140px]">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Month</label>
            <MonthPicker
              selected={filters.month ? new Date(filters.month) : null}
              onChange={(date) => {
                const m = date ? date.toISOString().slice(0, 7) : "";
                setFilters({ ...filters, month: m, startDate: "", endDate: "" });
              }}
              placeholder="Select..."
              isClearable
            />
          </div>

          <div className="w-[140px]">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Start</label>
            <DatePicker
              selected={filters.startDate ? new Date(filters.startDate) : null}
              onChange={(date) => {
                const d = date ? date.toISOString().slice(0, 10) : "";
                setFilters({ ...filters, startDate: d, month: "" });
              }}
              placeholder="From Date"
              isClearable
            />
          </div>

          <div className="w-[140px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">End</label>
            <DatePicker
              selected={filters.endDate ? new Date(filters.endDate) : null}
              onChange={(date) => {
                const d = date ? date.toISOString().slice(0, 10) : "";
                setFilters({ ...filters, endDate: d, month: "" });
              }}
              placeholder="To Date"
              minDate={filters.startDate ? new Date(filters.startDate) : null}
              isClearable
            />
          </div>

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors border border-transparent">
              <input
                type="checkbox"
                checked={filters.includeActive}
                onChange={(e) => setFilters({ ...filters, includeActive: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="text-xs font-bold text-gray-700">Include Active</span>
            </label>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
            <p className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-widest mb-1">Period Revenue</p>
            <p className="text-2xl font-extrabold text-indigo-700">₹{(reportData.meta.totalCollected / 1000 || 0).toFixed(0)}k</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Found</p>
            <p className="text-2xl font-extrabold text-gray-900">{reportData.meta.count || 0}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100/50">
            <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Active Now</p>
            <p className="text-2xl font-extrabold text-emerald-700">{reportData.meta.activeCount || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Completed</p>
            <p className="text-2xl font-extrabold text-gray-900">{reportData.meta.completedCount || 0}</p>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Date</th>
                <th className="px-6 py-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Vehicle</th>
                <th className="px-6 py-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Customer</th>
                <th className="px-6 py-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reportData.rentals.map((rental) => (
                <tr key={rental._id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 text-gray-500 font-medium text-sm">{format(new Date(rental.startTime), "MMM d, yyyy")}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{rental.car?.brand} {rental.car?.model}</div>
                    <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-0.5">{rental.car?.plateNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium text-sm">{rental.customer?.name || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${rental.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-600"}`}>
                      {rental.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-gray-900">₹{rental.finalAmountCollected?.toLocaleString() || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => navigate(`/rentals/${rental._id}`)} className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {reportData.rentals.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Filter size={24} className="text-gray-300" />
                    </div>
                    <p className="font-bold text-gray-900 mb-1">No data available</p>
                    <p className="text-sm">Try adjusting your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
