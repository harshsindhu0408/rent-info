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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterSettled, filterCarId, sortBy, sortOrder]);

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
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-indigo-600 mb-1">Operations</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Rentals</h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Manage your fleet rentals and track revenue</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchRentals(); fetchStats(); }}
            className="p-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm text-gray-400 shrink-0"
            title="Refresh"
          >
            <RefreshCw size={18} className={`${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openModalNew}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-black transition shadow-md hover:shadow-lg font-medium text-sm flex-1 md:flex-none"
          >
            <Plus size={16} className="text-gray-300" />
            <span className="hidden sm:inline">Create Rental</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><CarIcon size={64}/></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
          <p className="text-3xl font-extrabold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-[24px] border border-emerald-100/50 flex flex-col justify-center">
          <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Active</p>
          <p className="text-3xl font-extrabold text-emerald-700">{stats.active}</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-[24px] border border-amber-100/50 flex flex-col justify-center">
          <p className="text-xs font-bold text-amber-600/70 uppercase tracking-widest mb-1">Pending</p>
          <p className="text-3xl font-extrabold text-amber-700">{stats.pending}</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-[24px] border border-indigo-100/50 flex flex-col justify-center">
          <p className="text-xs font-bold text-indigo-600/70 uppercase tracking-widest mb-1">Revenue</p>
          <p className="text-3xl font-extrabold text-indigo-700">₹{(stats.totalRevenue / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-3 md:p-4 transition-all">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search customers, vehicles..."
              className="w-full pl-11 pr-10 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all text-sm shrink-0 ${showFilters || hasActiveFilters
                ? "bg-indigo-50 text-indigo-600"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                {[debouncedSearch, filterStatus, filterSettled, filterCarId].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 md:grid-cols-5 gap-4 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Status</label>
              <select className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl font-medium text-gray-700 text-sm focus:ring-4 focus:ring-indigo-50 outline-none appearance-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Settlement</label>
              <select className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl font-medium text-gray-700 text-sm focus:ring-4 focus:ring-indigo-50 outline-none appearance-none" value={filterSettled} onChange={(e) => setFilterSettled(e.target.value)}>
                <option value="">All</option>
                <option value="true">Settled</option>
                <option value="false">Pending</option>
              </select>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Vehicle</label>
              <select className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl font-medium text-gray-700 text-sm focus:ring-4 focus:ring-indigo-50 outline-none appearance-none" value={filterCarId} onChange={(e) => setFilterCarId(e.target.value)}>
                <option value="">All Vehicles</option>
                {cars.map((car) => <option key={car._id} value={car._id}>{car.plateNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Sort By</label>
              <select className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl font-medium text-gray-700 text-sm focus:ring-4 focus:ring-indigo-50 outline-none appearance-none" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="createdAt">Created</option>
                <option value="startTime">Start Date</option>
                <option value="finalAmountCollected">Amount</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Order</label>
              <button onClick={toggleSortOrder} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-100 transition text-sm">
                {sortOrder === "desc" ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
              </button>
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
            <div className="flex flex-wrap gap-2">
              {debouncedSearch && (
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-indigo-100">
                  Search: {debouncedSearch}
                  <button onClick={() => setSearchQuery("")}><X size={12} className="hover:text-indigo-900" /></button>
                </span>
              )}
              {filterStatus && (
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-indigo-100">
                  {filterStatus}
                  <button onClick={() => setFilterStatus("")}><X size={12} className="hover:text-indigo-900" /></button>
                </span>
              )}
              {filterSettled && (
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-indigo-100">
                  {filterSettled === "true" ? "Settled" : "Pending"}
                  <button onClick={() => setFilterSettled("")}><X size={12} className="hover:text-indigo-900" /></button>
                </span>
              )}
            </div>
            <button onClick={clearFilters} className="text-xs text-rose-500 font-bold hover:text-rose-600 transition-colors">
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
        <span>Showing {rentals.length} of {pagination.totalItems} rentals</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Vehicle</th>
                <th className="px-6 py-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Customer</th>
                <th className="px-6 py-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Details</th>
                <th className="px-6 py-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-400 font-medium text-sm">Loading records...</p>
                    </div>
                  </td>
                </tr>
              ) : rentals.length > 0 ? (
                rentals.map((rental) => <RentalRow key={rental._id} rental={rental} onEdit={openModalEdit} onDelete={handleDelete} />)
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CarIcon size={32} className="text-gray-300" />
                    </div>
                    <p className="text-gray-900 font-bold text-lg mb-1">No rentals found</p>
                    <p className="text-gray-500 text-sm">Adjust filters or create a new rental.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-gray-50">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            </div>
          ) : rentals.length > 0 ? (
            rentals.map((rental) => <RentalRow key={rental._id} rental={rental} onEdit={openModalEdit} onDelete={handleDelete} />)
          ) : (
             <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CarIcon size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-bold text-sm">No rentals found</p>
            </div>
          )}
        </div>
      </div>

      {!loading && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
        />
      )}

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
