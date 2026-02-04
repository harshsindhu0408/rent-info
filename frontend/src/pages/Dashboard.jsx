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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-lg">
            Welcome back! Here's your fleet overview for{" "}
            {format(new Date(), "MMMM yyyy")}
          </p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Link
            to="/cars"
            className="flex items-center justify-center gap-2 bg-white text-gray-700 px-3 md:px-5 py-2.5 md:py-3 rounded-xl hover:bg-gray-50 transition border border-gray-200 font-medium text-sm md:text-base flex-1 md:flex-none"
          >
            <Car size={16} className="shrink-0" />
            <span className="hidden sm:inline">Add Car</span>
            <span className="sm:hidden">Car</span>
          </Link>
          <Link
            to="/rentals"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-3 md:px-5 py-2.5 md:py-3 rounded-xl hover:from-gray-800 hover:to-gray-700 transition shadow-lg font-medium text-sm md:text-base flex-1 md:flex-none"
          >
            <Plus size={16} className="shrink-0" />
            <span className="hidden sm:inline">New Rental</span>
            <span className="sm:hidden">Rental</span>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 md:p-6 rounded-2xl md:rounded-3xl text-white relative overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
          <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-100 mb-2">
              <IndianRupee size={16} className="shrink-0" />
              <span className="text-xs md:text-sm font-medium uppercase tracking-wider">
                Total Revenue
              </span>
            </div>
            <p className="text-2xl md:text-4xl font-bold mb-1">
              ₹{stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-emerald-100 text-xs md:text-sm opacity-80">
              Lifetime Earnings
            </p>
          </div>
        </div>

        {/* Monthly Revenue Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 md:p-6 rounded-2xl md:rounded-3xl text-white relative overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
          <div className="absolute bottom-0 left-0 w-24 md:w-32 h-24 md:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-100 mb-2">
              <Calendar size={16} className="shrink-0" />
              <span className="text-xs md:text-sm font-medium uppercase tracking-wider">
                This Month
              </span>
            </div>
            <p className="text-2xl md:text-4xl font-bold mb-2">
              ₹{stats.thisMonthRevenue.toLocaleString()}
            </p>

            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-2 py-1 rounded-lg w-fit">
              {revenueChange >= 0 ? (
                <ArrowUpRight size={14} className="text-emerald-200 shrink-0" />
              ) : (
                <ArrowDownRight size={14} className="text-red-200 shrink-0" />
              )}
              <span className="text-xs font-medium">
                {revenueChange >= 0 ? "+" : ""}
                {revenueChange.toFixed(1)}% vs last month
              </span>
            </div>
          </div>
        </div>

        {/* Active Rentals */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-amber-100 shadow-sm hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 md:p-3 bg-amber-500 rounded-lg md:rounded-xl text-white shadow-amber-200">
              <Activity size={18} className="md:w-[22px] md:h-[22px]" />
            </div>
            <span className="text-amber-600 text-xs font-bold uppercase tracking-wider">
              Live
            </span>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-amber-700">
            {stats.activeRentals}
          </p>
          <p className="text-amber-600 text-xs md:text-sm font-medium mt-1">
            Active Rentals
          </p>
        </div>

        {/* Pending Settlements */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 md:p-3 bg-rose-500 rounded-lg md:rounded-xl text-white shadow-rose-200">
              <AlertCircle size={18} className="md:w-[22px] md:h-[22px]" />
            </div>
            <span className="text-rose-600 text-xs font-bold uppercase tracking-wider">
              Action
            </span>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-rose-700">
            {stats.pendingSettlements}
          </p>
          <p className="text-rose-600 text-xs md:text-sm font-medium mt-1">
            Pending Settlements
          </p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg text-blue-600">
              <Car size={16} className="md:w-[18px] md:h-[18px]" />
            </div>
            <span className="text-gray-500 text-xs md:text-sm font-medium">
              Fleet
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            {stats.totalCars}
          </p>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="p-1.5 md:p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <CheckCircle size={16} className="md:w-[18px] md:h-[18px]" />
            </div>
            <span className="text-gray-500 text-xs md:text-sm font-medium">
              Available
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-emerald-600">
            {stats.availableCars}
          </p>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="p-1.5 md:p-2 bg-orange-100 rounded-lg text-orange-600">
              <Clock size={16} className="md:w-[18px] md:h-[18px]" />
            </div>
            <span className="text-gray-500 text-xs md:text-sm font-medium">
              On Rent
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-orange-600">
            {stats.rentedCars}
          </p>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="p-1.5 md:p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Zap size={16} className="md:w-[18px] md:h-[18px]" />
            </div>
            <span className="text-gray-500 text-xs md:text-sm font-medium">
              Completed
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            {stats.completedRentals}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Rentals */}
        <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              Recent Rentals
            </h2>
            <Link
              to="/rentals"
              className="text-blue-600 text-xs md:text-sm font-medium hover:text-blue-700 flex items-center gap-1"
            >
              View All{" "}
              <ArrowUpRight size={12} className="md:w-[14px] md:h-[14px]" />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {recentRentals.map((rental) => (
              <div
                key={rental._id}
                className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-gray-50/50 transition cursor-pointer"
                onClick={() => navigate(`/rentals/${rental._id}`)}
              >
                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                  <div className="p-2 md:p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg md:rounded-xl text-blue-600 shrink-0">
                    <Car size={16} className="md:w-[20px] md:h-[20px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
                      {rental.car?.brand} {rental.car?.model}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 truncate">
                      {rental.customer?.name} •{" "}
                      {format(new Date(rental.startTime), "MMM d")}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="font-bold text-gray-900 text-sm md:text-base">
                    ₹{rental.finalAmountCollected?.toLocaleString() || 0}
                  </p>
                  <span
                    className={`inline-flex items-center px-1.5 md:px-2 py-0.5 rounded-lg text-[10px] md:text-xs font-medium ${
                      rental.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : rental.isSettled
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {rental.status === "Active"
                      ? "Active"
                      : rental.isSettled
                      ? "Settled"
                      : "Pending"}
                  </span>
                </div>
              </div>
            ))}
            {recentRentals.length === 0 && (
              <div className="px-6 py-8 md:py-12 text-center text-gray-500">
                <Car
                  size={32}
                  className="mx-auto mb-3 text-gray-300 md:w-[40px] md:h-[40px]"
                />
                <p className="text-sm md:text-base">
                  No rentals yet. Create your first rental!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Cars */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              Top Cars by Revenue
            </h2>
          </div>

          <div className="p-3 md:p-4 space-y-2 md:space-y-3">
            {topCars.map((car, index) => (
              <div
                key={car._id}
                className="flex items-center gap-3 md:gap-4 p-2.5 md:p-3 bg-gray-50 rounded-lg md:rounded-xl hover:bg-gray-100 transition"
              >
                <div
                  className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-bold text-xs md:text-sm shrink-0 ${
                    index === 0
                      ? "bg-amber-400 text-amber-900"
                      : index === 1
                      ? "bg-gray-300 text-gray-700"
                      : index === 2
                      ? "bg-orange-400 text-orange-900"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm md:text-base truncate">
                    {car.carBrand} {car.carModel}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500">
                    {car.count} rentals
                  </p>
                </div>
                <p className="font-bold text-gray-900 text-sm md:text-base shrink-0">
                  ₹{car.totalCollected?.toLocaleString()}
                </p>
              </div>
            ))}
            {topCars.length === 0 && (
              <div className="py-6 md:py-8 text-center text-gray-500 text-sm">
                <p>No data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6">
            Monthly Revenue Trend
          </h2>
          <div className="flex items-end justify-between gap-2 md:gap-4 h-36 md:h-48 overflow-x-auto">
            {monthlyData.map((month) => {
              const maxRevenue = Math.max(
                ...monthlyData.map((m) => m.totalCollected)
              );
              const height =
                maxRevenue > 0 ? (month.totalCollected / maxRevenue) * 100 : 0;
              return (
                <div
                  key={month._id}
                  className="flex-1 min-w-[40px] md:min-w-[60px] flex flex-col items-center"
                >
                  <div
                    className="w-full max-w-[40px] md:max-w-[60px] bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  ></div>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-2 font-medium">
                    {month._id}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-400">
                    ₹{(month.totalCollected / 1000).toFixed(0)}k
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Link
          to="/rentals"
          className="p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl border border-blue-100 hover:shadow-lg transition group"
        >
          <Calendar
            size={20}
            className="text-blue-600 mb-2 md:mb-3 group-hover:scale-110 transition md:w-[24px] md:h-[24px]"
          />
          <p className="font-bold text-gray-900 text-sm md:text-base">
            Manage Rentals
          </p>
          <p className="text-xs md:text-sm text-gray-500 mt-1 hidden sm:block">
            View and edit all rentals
          </p>
        </Link>
        <Link
          to="/cars"
          className="p-4 md:p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl md:rounded-2xl border border-emerald-100 hover:shadow-lg transition group"
        >
          <Car
            size={20}
            className="text-emerald-600 mb-2 md:mb-3 group-hover:scale-110 transition md:w-[24px] md:h-[24px]"
          />
          <p className="font-bold text-gray-900 text-sm md:text-base">Fleet</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1 hidden sm:block">
            Add or update vehicles
          </p>
        </Link>
        <Link
          to="/reports"
          className="p-4 md:p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl md:rounded-2xl border border-violet-100 hover:shadow-lg transition group"
        >
          <TrendingUp
            size={20}
            className="text-violet-600 mb-2 md:mb-3 group-hover:scale-110 transition md:w-[24px] md:h-[24px]"
          />
          <p className="font-bold text-gray-900 text-sm md:text-base">
            Reports
          </p>
          <p className="text-xs md:text-sm text-gray-500 mt-1 hidden sm:block">
            Analytics and insights
          </p>
        </Link>
        <div
          onClick={() => navigate("/rentals")}
          className="p-4 md:p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl md:rounded-2xl text-white cursor-pointer hover:shadow-xl transition group"
        >
          <Plus
            size={20}
            className="mb-2 md:mb-3 group-hover:scale-110 transition md:w-[24px] md:h-[24px]"
          />
          <p className="font-bold text-sm md:text-base">Create Rental</p>
          <p className="text-xs md:text-sm text-gray-300 mt-1 hidden sm:block">
            Start a new booking
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
