import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { Car, Calendar, DollarSign, TrendingUp, Plus } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCars: 0,
    activeRentals: 0,
    totalRevenue: 0,
  });
  const [recentRentals, setRecentRentals] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Cars for count
        const carsRes = await api.get("/api/cars");
        const cars = carsRes.data;
        const totalCars = cars.length;

        // Fetch Rentals for count and revenue
        const rentalsRes = await api.get("/api/rentals");
        const rentals = rentalsRes.data;

        // Assuming we can calculate total revenue from the rentals fetched, otherwise need a report endpoint.
        // Let's rely on standard logic for now or the /stats report endpoint I made.
        // Ah, I made /api/reports/stats endpoint which returns aggregated data.

        const statsRes = await api.get("/api/reports/stats");
        const monthlyStats = statsRes.data.monthly;

        // Sum total revenue from all months for simplicity or just this month
        const totalRevenue = monthlyStats.reduce(
          (acc, curr) => acc + curr.totalCollected,
          0
        );

        const activeRentals = rentals.filter(
          (r) => r.car?.status === "Rented"
        ).length; // Or check completion date.
        // Actually, status on rentalEntry is "Active" or "Completed".
        const activeRentalsCount = rentals.filter(
          (r) => r.status === "Active"
        ).length;

        setStats({
          totalCars,
          activeRentals: activeRentalsCount,
          totalRevenue,
        });

        setRecentRentals(rentals.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, prefix = "" }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">
          {prefix}
          {value.toLocaleString()}
        </h3>
      </div>
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview of your fleet and performance
          </p>
        </div>
        <Link
          to="/rentals"
          className="flex items-center space-x-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition shadow-sm font-medium"
        >
          <Plus size={18} />
          <span>New Rental</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Cars"
          value={stats.totalCars}
          icon={Car}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Rentals"
          value={stats.activeRentals}
          icon={Calendar}
          color="bg-orange-500"
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          prefix="₹"
          icon={DollarSign}
          color="bg-green-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Rentals</h2>
          <Link
            to="/rentals"
            className="text-primary-600 text-sm font-medium hover:text-primary-700"
          >
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-sm">
                <th className="pb-3 font-medium">Car</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Period</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentRentals.map((rental) => (
                <tr
                  key={rental._id}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 font-medium text-gray-900">
                    {rental.car?.brand} {rental.car?.model}
                    <span className="block text-xs text-gray-400 font-normal">
                      {rental.car?.plateNumber}
                    </span>
                  </td>
                  <td className="py-4 text-gray-600">{rental.user?.name}</td>
                  <td className="py-4 text-sm text-gray-500">
                    {new Date(rental.startTime).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rental.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {rental.status}
                    </span>
                  </td>
                  <td className="py-4 text-right font-medium text-gray-900">
                    ₹{rental.finalAmountCollected.toLocaleString()}
                  </td>
                </tr>
              ))}
              {recentRentals.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No rentals found.
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

export default Dashboard;
