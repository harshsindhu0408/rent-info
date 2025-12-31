import { useState, useEffect } from "react";
import api from "../api/axios";
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
  Legend,
} from "recharts";
import { Filter, Calendar as CalIcon, Download } from "lucide-react";

const Reports = () => {
  const [reportData, setReportData] = useState({
    rentals: [],
    meta: { totalCollected: 0, count: 0 },
  });
  const [stats, setStats] = useState({ perCar: [], monthly: [] });
  const [cars, setCars] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    carId: "",
    month: "",
    startDate: "",
    endDate: "",
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
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReportData = async () => {
    try {
      const params = {};
      if (filters.carId) params.carId = filters.carId;
      if (filters.month) params.month = filters.month;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await api.get("/api/reports/rent", { params });
      setReportData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics & Reports
          </h1>
          <p className="text-gray-500">
            Insights into your business performance
          </p>
        </div>
      </div>

      {/* Top Level Stats from Aggregation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6">
            Revenue Trend (Monthly)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthly}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis dataKey="_id" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <ReTooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="totalCollected"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6">Revenue by Car</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.perCar} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  type="number"
                  stroke="#9CA3AF"
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <YAxis
                  dataKey="carModel"
                  type="category"
                  width={100}
                  stroke="#4B5563"
                  tick={{ fontSize: 12 }}
                />
                <ReTooltip
                  cursor={{ fill: "#F3F4F6" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="totalCollected"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-6">
          <Filter size={20} className="text-primary-600" />
          <h2 className="text-lg font-bold text-gray-900">Detailed Report</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <select
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            value={filters.carId}
            onChange={(e) => setFilters({ ...filters, carId: e.target.value })}
          >
            <option value="">All Cars</option>
            {cars.map((car) => (
              <option key={car._id} value={car._id}>
                {car.brand} {car.model}
              </option>
            ))}
          </select>

          <input
            type="month"
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
          />

          <input
            type="date"
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            placeholder="Start Date"
          />

          <input
            type="date"
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            placeholder="End Date"
          />
        </div>

        <div className="bg-primary-50 rounded-xl p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-900 mb-1">
              Total Rent Collected (Filtered)
            </p>
            <h3 className="text-3xl font-bold text-primary-700">
              ₹{reportData.meta.totalCollected.toLocaleString()}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-primary-900 mb-1">
              Total Rentals
            </p>
            <h3 className="text-2xl font-bold text-primary-700">
              {reportData.meta.count}
            </h3>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Car</th>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reportData.rentals.map((rental) => (
                <tr key={rental._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(rental.startTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {rental.car?.brand} {rental.car?.model}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {rental.user?.name}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    ₹{rental.finalAmountCollected.toLocaleString()}
                  </td>
                </tr>
              ))}
              {reportData.rentals.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No records found for the selected filters.
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
