import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Car,
  Calendar,
  IndianRupee,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  MoreHorizontal,
  ChevronRight
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    rentedCars: 0,
    activeRentals: 0,
    completedRentals: 0,
    pendingSettlements: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
  });
  const [recentRentals, setRecentRentals] = useState([]);
  const [topCars, setTopCars] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsRes, rentalsRes, statsRes] = await Promise.all([
          api.get("/api/cars"),
          api.get("/api/rentals/all"),
          api.get("/api/reports/stats"),
        ]);

        const cars = carsRes.data;
        const rentals = rentalsRes.data;
        const reportStats = statsRes.data;

        const totalCars = cars.length;
        const availableCars = cars.filter(
          (c) => c.status === "Available"
        ).length;
        const rentedCars = cars.filter((c) => c.status === "Rented").length;

        const activeRentals = rentals.filter(
          (r) => r.status === "Active"
        ).length;
        const completedRentals = rentals.filter(
          (r) => r.status === "Completed"
        ).length;
        const pendingSettlements = rentals.filter((r) => !r.isSettled).length;

        const totalRevenue = rentals.reduce(
          (sum, r) => sum + (r.finalAmountCollected || 0),
          0
        );

        const now = new Date();
        const thisMonthStart = startOfMonth(now);
        const thisMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subDays(thisMonthStart, 1));
        const lastMonthEnd = endOfMonth(subDays(thisMonthStart, 1));

        const thisMonthRevenue = rentals
          .filter((r) => {
            if (!r.endTime) return false;
            const date = new Date(r.endTime);
            return date >= thisMonthStart && date <= thisMonthEnd;
          })
          .reduce((sum, r) => sum + (r.finalAmountCollected || 0), 0);

        const lastMonthRevenue = rentals
          .filter((r) => {
            if (!r.endTime) return false;
            const date = new Date(r.endTime);
            return date >= lastMonthStart && date <= lastMonthEnd;
          })
          .reduce((sum, r) => sum + (r.finalAmountCollected || 0), 0);

        setStats({
          totalCars,
          availableCars,
          rentedCars,
          activeRentals,
          completedRentals,
          pendingSettlements,
          totalRevenue,
          thisMonthRevenue,
          lastMonthRevenue,
        });

        setRecentRentals(rentals.slice(0, 5));
        setTopCars(reportStats.perCar?.slice(0, 5) || []);
        setMonthlyData(reportStats.monthly?.slice(0, 6).reverse() || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const revenueChange =
    stats.lastMonthRevenue > 0
      ? ((stats.thisMonthRevenue - stats.lastMonthRevenue) /
          stats.lastMonthRevenue) *
        100
      : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-400">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-indigo-600 mb-1">Overview</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base max-w-lg leading-relaxed">
            Here's what's happening with your fleet today, {format(new Date(), "MMMM do, yyyy")}.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/cars"
            className="group flex items-center justify-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-full hover:bg-gray-50 hover:text-gray-900 transition-all border border-gray-200 shadow-sm font-medium text-sm flex-1 md:flex-none"
          >
            <Car size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            Add Vehicle
          </Link>
          <Link
            to="/rentals"
            className="group flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg font-medium text-sm flex-1 md:flex-none"
          >
            <Plus size={16} className="text-gray-300 group-hover:text-white transition-colors" />
            New Rental
          </Link>
        </div>
      </div>

      {/* Primary Metrics (Sleek White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full">All Time</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">₹{stats.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar size={20} strokeWidth={2.5} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${revenueChange >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {revenueChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(revenueChange).toFixed(1)}%
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">This Month</p>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">₹{stats.thisMonthRevenue.toLocaleString()}</h3>
          </div>
        </div>

        {/* Active Rentals */}
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-2 mr-1"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Active Rentals</p>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{stats.activeRentals}</h3>
          </div>
        </div>

        {/* Action Needed */}
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle size={20} strokeWidth={2.5} />
            </div>
            {stats.pendingSettlements > 0 && (
               <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full">Requires Attention</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Pending Settlements</p>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{stats.pendingSettlements}</h3>
          </div>
        </div>
      </div>

      {/* Secondary Metrics / Fleet Status */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-50">
          <div className="p-4 flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Total Fleet</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalCars}</p>
          </div>
          <div className="p-4 flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Available</p>
            <p className="text-2xl font-semibold text-emerald-600">{stats.availableCars}</p>
          </div>
          <div className="p-4 flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">On Rent</p>
            <p className="text-2xl font-semibold text-amber-500">{stats.rentedCars}</p>
          </div>
          <div className="p-4 flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Completed</p>
            <p className="text-2xl font-semibold text-indigo-600">{stats.completedRentals}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Revenue Chart */}
          {monthlyData.length > 0 && (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
                  <p className="text-sm text-gray-500 mt-1">Last 6 months performance</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                  <TrendingUp size={20} />
                </div>
              </div>
              
              <div className="flex items-end justify-between gap-3 h-48 md:h-56 mt-6">
                {monthlyData.map((month, i) => {
                  const maxRevenue = Math.max(...monthlyData.map((m) => m.totalCollected));
                  const height = maxRevenue > 0 ? (month.totalCollected / maxRevenue) * 100 : 0;
                  const isLast = i === monthlyData.length - 1;
                  
                  return (
                    <div key={month._id} className="relative group flex-1 flex flex-col items-center">
                      {/* Tooltip */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg pointer-events-none whitespace-nowrap z-10">
                        ₹{month.totalCollected.toLocaleString()}
                      </div>
                      
                      {/* Bar */}
                      <div className="w-full flex justify-center h-full items-end">
                        <div
                          className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 group-hover:opacity-90 ${
                            isLast ? 'bg-indigo-600' : 'bg-indigo-100'
                          }`}
                          style={{ height: `${Math.max(height, 4)}%` }}
                        ></div>
                      </div>
                      
                      <div className="mt-3 text-center">
                        <p className={`text-xs font-medium ${isLast ? 'text-indigo-600' : 'text-gray-500'}`}>
                          {month._id}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Activity List */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Recent Rentals</h2>
                <p className="text-xs text-gray-500 mt-1">Latest fleet activity</p>
              </div>
              <Link
                to="/rentals"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors"
              >
                View all
              </Link>
            </div>

            <div className="divide-y divide-gray-50">
              {recentRentals.map((rental) => (
                <div
                  key={rental._id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/rentals/${rental._id}`)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                      <Car size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                        {rental.car?.brand} {rental.car?.model}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 truncate">{rental.customer?.name}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-xs text-gray-400">{format(new Date(rental.startTime), "MMM do")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 pl-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        ₹{rental.finalAmountCollected?.toLocaleString() || 0}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                          rental.status === "Active"
                            ? "bg-amber-50 text-amber-600"
                            : rental.isSettled
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {rental.status === "Active" ? "Active" : rental.isSettled ? "Settled" : "Unsettled"}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
              {recentRentals.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car size={24} className="text-gray-300" />
                  </div>
                  <p className="text-gray-900 font-medium">No rentals found</p>
                  <p className="text-sm text-gray-500 mt-1">When you create rentals, they will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Narrower) */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* Top Cars */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 bg-white">
              <h2 className="text-lg font-bold text-gray-900">Top Performers</h2>
              <p className="text-xs text-gray-500 mt-1">Vehicles generating most revenue</p>
            </div>

            <div className="p-4 space-y-1">
              {topCars.map((car, index) => (
                <div
                  key={car._id}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      index === 0
                        ? "bg-amber-100 text-amber-700"
                        : index === 1
                        ? "bg-slate-100 text-slate-700"
                        : index === 2
                        ? "bg-orange-50 text-orange-700"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {car.carBrand} {car.carModel}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {car.count} trips
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">
                      ₹{(car.totalCollected / 1000).toFixed(1)}k
                    </p>
                  </div>
                </div>
              ))}
              {topCars.length === 0 && (
                <div className="py-8 text-center text-gray-500 text-sm">
                  <p>Not enough data yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Quick Shortcuts</h2>
            <div className="space-y-3">
              <Link to="/rentals" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">Manage Rentals</p>
                  <p className="text-xs text-gray-500">View calendar & bookings</p>
                </div>
              </Link>
              
              <Link to="/cars" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Car size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">Fleet Inventory</p>
                  <p className="text-xs text-gray-500">Update vehicle details</p>
                </div>
              </Link>
              
              <Link to="/reports" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrendingUp size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">Analytics</p>
                  <p className="text-xs text-gray-500">Detailed financial reports</p>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
