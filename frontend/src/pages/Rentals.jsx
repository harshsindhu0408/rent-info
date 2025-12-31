import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Plus,
  Car as CarIcon,
  Search,
  RefreshCw,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { RentalRow, RentalFormModal } from "../components/rentals";
import { Pagination } from "../components/common";

const ITEMS_PER_PAGE = 10;

const Rentals = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSettled, setFilterSettled] = useState("");
  const [filterCarId, setFilterCarId] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: ITEMS_PER_PAGE,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    totalRevenue: 0,
  });

  // Edit Mode State
  const [editMode, setEditMode] = useState(false);
  const [editingRentalData, setEditingRentalData] = useState(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterSettled, filterCarId, sortBy, sortOrder]);

  // Fetch rentals from paginated API
  const fetchRentals = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", ITEMS_PER_PAGE);

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterStatus) params.append("status", filterStatus);
      if (filterSettled) params.append("isSettled", filterSettled);
      if (filterCarId) params.append("carId", filterCarId);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const res = await api.get(`/api/rentals?${params.toString()}`);

      if (res.data.success) {
        setRentals(res.data.data);
        setPagination(res.data.pagination);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch rentals:", error);
      toast.error("Failed to load rentals");
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterStatus, filterSettled, filterCarId, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/api/rentals/all");
      const allRentals = res.data;

      setStats({
        total: allRentals.length,
        active: allRentals.filter((r) => r.status === "Active").length,
        pending: allRentals.filter((r) => !r.isSettled).length,
        totalRevenue: allRentals.reduce((sum, r) => sum + (r.finalAmountCollected || 0), 0),
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  const fetchCars = async () => {
    try {
      const res = await api.get("/api/cars");
      setCars(res.data);
    } catch (error) {
      console.error("Failed to fetch cars");
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  useEffect(() => {
    fetchStats();
    fetchCars();
  }, [fetchStats]);

  const handleSubmit = async (formData) => {
    try {
      if (editMode && editingRentalData) {
        await api.put(`/api/rentals/${editingRentalData._id}`, formData);
        toast.success("Rental updated successfully");
      } else {
        await api.post("/api/rentals", formData);
        toast.success("Rental created successfully");
      }
      closeModal();
      fetchRentals();
      fetchStats();
      fetchCars();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rental?")) return;
    try {
      await api.delete(`/api/rentals/${id}`);
      toast.success("Rental deleted");
      fetchRentals();
      fetchStats();
      fetchCars();
    } catch (error) {
      toast.error("Failed to delete rental");
    }
  };

  const openModalNew = () => {
    setEditMode(false);
    setEditingRentalData(null);
    fetchCars();
    setIsModalOpen(true);
  };

  const openModalEdit = (rental) => {
    setEditMode(true);
    setEditingRentalData({
      _id: rental._id,
      carId: rental.car._id,
      startTime: rental.startTime ? new Date(rental.startTime) : null,
      endTime: rental.endTime ? new Date(rental.endTime) : null,
      deductionAmount: rental.deductions?.amount || 0,
      deductionReason: rental.deductions?.reason || "",
      chot: rental.chot || 0,
      advance: rental.advance || 0,
      ghataAmount: rental.ghata?.amount || 0,
      ghataReason: rental.ghata?.reason || "",
      manualTotalRent: rental.totalRent || 0,
      isSettled: rental.isSettled || false,
      customerName: rental.customer?.name || "",
      customerPhone: rental.customer?.phone || "",
      customerOccupation: rental.customer?.occupation || "Student",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setEditingRentalData(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("");
    setFilterSettled("");
    setFilterCarId("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const hasActiveFilters = debouncedSearch || filterStatus || filterSettled || filterCarId;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight">Rentals</h1>
          <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-lg">Manage your fleet rentals and track revenue</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => { fetchRentals(); fetchStats(); }}
            className="p-2.5 md:p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600 shrink-0"
            title="Refresh"
          >
            <RefreshCw size={18} className={`${loading ? "animate-spin" : ""} md:w-[20px] md:h-[20px]`} />
          </button>
          <button
            onClick={openModalNew}
            className="flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl hover:from-gray-800 hover:to-gray-700 transition-all shadow-xl shadow-gray-200 font-semibold text-sm md:text-base flex-1 md:flex-none"
          >
            <Plus size={18} className="shrink-0" />
            <span className="hidden sm:inline">Create Rental</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm font-medium text-gray-500">Total</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-emerald-100">
          <p className="text-xs md:text-sm font-medium text-emerald-600">Active</p>
          <p className="text-2xl md:text-3xl font-bold text-emerald-700 mt-1">{stats.active}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-amber-100">
          <p className="text-xs md:text-sm font-medium text-amber-600">Pending</p>
          <p className="text-2xl md:text-3xl font-bold text-amber-700 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-blue-100">
          <p className="text-xs md:text-sm font-medium text-blue-600">Revenue</p>
          <p className="text-xl md:text-3xl font-bold text-blue-700 mt-1">₹{(stats.totalRevenue / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 md:pl-12 pr-10 py-2.5 md:py-3 bg-gray-50 border-0 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm md:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border font-medium transition-all text-sm shrink-0 ${showFilters || hasActiveFilters
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {[debouncedSearch, filterStatus, filterSettled, filterCarId].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            <div>
              <label className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 md:mb-2 block">Status</label>
              <select
                className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 border-0 rounded-lg md:rounded-xl font-medium text-gray-700 text-sm focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 md:mb-2 block">Settlement</label>
              <select
                className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 border-0 rounded-lg md:rounded-xl font-medium text-gray-700 text-sm focus:ring-2 focus:ring-blue-500"
                value={filterSettled}
                onChange={(e) => setFilterSettled(e.target.value)}
              >
                <option value="">All</option>
                <option value="true">Settled</option>
                <option value="false">Pending</option>
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 md:mb-2 block">Vehicle</label>
              <select
                className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 border-0 rounded-lg md:rounded-xl font-medium text-gray-700 text-sm focus:ring-2 focus:ring-blue-500"
                value={filterCarId}
                onChange={(e) => setFilterCarId(e.target.value)}
              >
                <option value="">All Vehicles</option>
                {cars.map((car) => (
                  <option key={car._id} value={car._id}>
                    {car.plateNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 md:mb-2 block">Sort</label>
              <select
                className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 border-0 rounded-lg md:rounded-xl font-medium text-gray-700 text-sm focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Created</option>
                <option value="startTime">Start</option>
                <option value="finalAmountCollected">Amount</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 md:mb-2 block">Order</label>
              <button
                onClick={toggleSortOrder}
                className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 rounded-lg md:rounded-xl font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-100 transition text-sm"
              >
                {sortOrder === "desc" ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {debouncedSearch && (
                <span className="bg-blue-100 text-blue-700 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1">
                  "{debouncedSearch}"
                  <button onClick={() => setSearchQuery("")}><X size={12} /></button>
                </span>
              )}
              {filterStatus && (
                <span className="bg-emerald-100 text-emerald-700 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1">
                  {filterStatus}
                  <button onClick={() => setFilterStatus("")}><X size={12} /></button>
                </span>
              )}
              {filterSettled && (
                <span className="bg-amber-100 text-amber-700 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1">
                  {filterSettled === "true" ? "Settled" : "Pending"}
                  <button onClick={() => setFilterSettled("")}><X size={12} /></button>
                </span>
              )}
              {filterCarId && (
                <span className="bg-purple-100 text-purple-700 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1">
                  {cars.find(c => c._id === filterCarId)?.plateNumber}
                  <button onClick={() => setFilterCarId("")}><X size={12} /></button>
                </span>
              )}
            </div>
            <button onClick={clearFilters} className="text-xs md:text-sm text-red-600 font-medium flex items-center gap-1">
              <X size={12} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-xs md:text-sm">
        <span className="text-gray-500">
          <strong className="text-gray-700">{rentals.length}</strong> of{" "}
          <strong className="text-gray-700">{pagination.totalItems}</strong> rentals
        </span>
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table Header - Hidden on mobile */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4"></div>
                      <p className="text-gray-500">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : rentals.length > 0 ? (
                rentals.map((rental) => <RentalRow key={rental._id} rental={rental} onEdit={openModalEdit} onDelete={handleDelete} />)
              ) : (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 p-6 rounded-full mb-4">
                        <CarIcon size={40} className="text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">No rentals found</p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="lg:hidden">
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          ) : rentals.length > 0 ? (
            rentals.map((rental) => <RentalRow key={rental._id} rental={rental} onEdit={openModalEdit} onDelete={handleDelete} />)
          ) : (
            <div className="py-12 text-center">
              <div className="bg-gray-100 p-4 rounded-full mx-auto mb-4 w-fit">
                <CarIcon size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-sm">No rentals found</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
          />
        )}
      </div>

      {/* Modal */}
      <RentalFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        cars={cars}
        editMode={editMode}
        initialData={editingRentalData}
      />
    </div>
  );
};

export default Rentals;
