import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { X, Car as CarIcon, User, Calendar, IndianRupee, CheckCircle } from "lucide-react";

const RentalFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    cars,
    editMode,
    initialData,
}) => {
    const [formData, setFormData] = useState({
        carId: "",
        startTime: new Date(),
        endTime: null,
        deductionAmount: 0,
        deductionReason: "",
        chot: 0,
        advance: 0,
        ghataAmount: 0,
        ghataReason: "",
        manualTotalRent: "",
        isSettled: false,
        customerName: "",
        customerPhone: "",
        customerOccupation: "Student",
    });

    const [estimatedRent, setEstimatedRent] = useState(0);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                carId: "",
                startTime: new Date(),
                endTime: null,
                deductionAmount: 0,
                deductionReason: "",
                chot: 0,
                advance: 0,
                ghataAmount: 0,
                ghataReason: "",
                manualTotalRent: "",
                isSettled: false,
                customerName: "",
                customerPhone: "",
                customerOccupation: "Student",
            });
        }
    }, [initialData, isOpen]);

    useEffect(() => {
        if (formData.carId && formData.startTime && formData.endTime) {
            const selectedCar = cars.find((c) => c._id === formData.carId);
            if (selectedCar) {
                const start = new Date(formData.startTime);
                const end = new Date(formData.endTime);

                if (end > start) {
                    const durationMs = end - start;
                    const durationHours = durationMs / (1000 * 60 * 60);

                    let total = 0;
                    if (durationHours < 24) {
                        total = Math.ceil(durationHours) * selectedCar.hourlyRate;
                    } else {
                        const days = Math.floor(durationHours / 24);
                        const remainingHours = Math.ceil(durationHours % 24);
                        total = days * selectedCar.dailyRate + remainingHours * selectedCar.hourlyRate;
                    }
                    setEstimatedRent(total);

                    if (!editMode && formData.manualTotalRent === "") {
                        setFormData((prev) => ({ ...prev, manualTotalRent: total }));
                    }
                }
            }
        } else {
            setEstimatedRent(0);
        }
    }, [formData.carId, formData.startTime, formData.endTime, cars, editMode, formData.manualTotalRent]);

    const displayTotal =
        !formData.endTime && !editMode
            ? Number(formData.advance) || 0
            : Math.max(
                0,
                (Number(formData.manualTotalRent) || estimatedRent) -
                (Number(formData.deductionAmount) || 0) +
                (Number(formData.chot) || 0) -
                (Number(formData.ghataAmount) || 0)
            );

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md transition-all">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-100">
                {/* Header */}
                <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-xl z-10">
                    <div>
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                            {editMode ? "Edit Rental" : "New Rental"}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                            {editMode ? "Update rental details" : "Fill in details to start"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-all shrink-0"
                    >
                        <X size={20} className="sm:w-[22px] sm:h-[22px]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5 sm:space-y-8">
                    {/* Vehicle Selection */}
                    <section className="space-y-2 sm:space-y-4">
                        <div className="flex items-center gap-2 text-gray-400">
                            <CarIcon size={14} className="sm:w-4 sm:h-4" />
                            <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Vehicle</h3>
                        </div>
                        <select
                            className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-50 rounded-xl sm:rounded-2xl border-0 font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                            value={formData.carId}
                            onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
                            disabled={editMode}
                            required
                        >
                            <option value="">Select a vehicle...</option>
                            {cars.map((car) => (
                                <option
                                    key={car._id}
                                    value={car._id}
                                    disabled={car.status !== "Available" && car._id !== formData.carId}
                                >
                                    {car.brand} {car.model} — {car.plateNumber}
                                    {car.status !== "Available" && car._id !== formData.carId ? ` (${car.status})` : ""}
                                </option>
                            ))}
                        </select>
                    </section>

                    {/* Date & Time */}
                    <section className="space-y-2 sm:space-y-4">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Calendar size={14} className="sm:w-4 sm:h-4" />
                            <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Schedule</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Start</label>
                                <DatePicker
                                    selected={formData.startTime}
                                    onChange={(date) => setFormData({ ...formData, startTime: date })}
                                    showTimeSelect
                                    dateFormat="MMM d, yyyy — h:mm aa"
                                    timeIntervals={15}
                                    className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-gray-50 rounded-xl font-medium text-sm sm:text-base"
                                    placeholderText="Start time"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                                    End <span className="text-[10px] sm:text-xs text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <DatePicker
                                    selected={formData.endTime}
                                    onChange={(date) => setFormData({ ...formData, endTime: date })}
                                    showTimeSelect
                                    dateFormat="MMM d, yyyy — h:mm aa"
                                    timeIntervals={15}
                                    minDate={formData.startTime}
                                    className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-gray-50 rounded-xl font-medium text-sm sm:text-base"
                                    placeholderText="When returned"
                                    isClearable
                                />
                            </div>
                        </div>
                    </section>

                    {/* Customer Details */}
                    <section className="space-y-2 sm:space-y-4">
                        <div className="flex items-center gap-2 text-gray-400">
                            <User size={14} className="sm:w-4 sm:h-4" />
                            <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Customer</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <input
                                type="text"
                                required
                                placeholder="Customer Name"
                                className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-gray-50 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 border-0 transition-all text-sm sm:text-base"
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            />
                            <input
                                type="tel"
                                required
                                placeholder="Phone Number"
                                className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-gray-50 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 border-0 transition-all text-sm sm:text-base"
                                value={formData.customerPhone}
                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Occupation"
                                className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-gray-50 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 border-0 transition-all sm:col-span-2 text-sm sm:text-base"
                                value={formData.customerOccupation}
                                onChange={(e) => setFormData({ ...formData, customerOccupation: e.target.value })}
                            />
                        </div>
                    </section>

                    {/* Advance Collection */}
                    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-600 mb-2 sm:mb-3">
                            <IndianRupee size={14} className="sm:w-4 sm:h-4" />
                            <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Advance</h3>
                        </div>
                        <input
                            type="number"
                            placeholder="Enter advance amount"
                            className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-white rounded-xl font-bold text-base sm:text-lg focus:ring-2 focus:ring-blue-500 border border-blue-200 transition-all"
                            value={formData.advance}
                            onChange={(e) => setFormData({ ...formData, advance: e.target.value })}
                        />
                        <p className="text-[10px] sm:text-xs text-blue-500 mt-1.5 sm:mt-2">Collect when handing over keys</p>
                    </section>

                    {/* Settlement Section */}
                    {(formData.endTime || editMode) && (
                        <section className="space-y-4 sm:space-y-6 border-t border-gray-100 pt-4 sm:pt-6">
                            <div className="flex items-center gap-2 text-gray-400">
                                <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                                <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Settlement</h3>
                            </div>

                            {/* Base Rent & Override */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                                <div>
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">Calculated</p>
                                    <p className="text-xl sm:text-3xl font-bold text-gray-900">
                                        ₹{estimatedRent?.toLocaleString() || "—"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1 block">Final</label>
                                    <input
                                        type="number"
                                        placeholder={estimatedRent || "Override"}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-lg sm:rounded-xl font-bold text-lg sm:text-xl focus:ring-2 focus:ring-blue-500 border border-gray-200 transition-all"
                                        value={formData.manualTotalRent}
                                        onChange={(e) => setFormData({ ...formData, manualTotalRent: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Adjustments */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 block">Deduction</label>
                                    <input
                                        type="number"
                                        placeholder="₹"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500 border-0 text-sm sm:text-base"
                                        value={formData.deductionAmount}
                                        onChange={(e) => setFormData({ ...formData, deductionAmount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 block">Reason</label>
                                    <input
                                        type="text"
                                        placeholder="Deduction reason"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500 border-0 text-sm sm:text-base"
                                        value={formData.deductionReason}
                                        onChange={(e) => setFormData({ ...formData, deductionReason: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 block">Chot (Extra)</label>
                                    <input
                                        type="number"
                                        placeholder="₹"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 border-0 text-sm sm:text-base"
                                        value={formData.chot}
                                        onChange={(e) => setFormData({ ...formData, chot: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 block">Ghata (Loss)</label>
                                    <input
                                        type="number"
                                        placeholder="₹"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 border-0 text-sm sm:text-base"
                                        value={formData.ghataAmount}
                                        onChange={(e) => setFormData({ ...formData, ghataAmount: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] sm:text-xs font-semibold text-purple-500 mb-1 block">Loss Reason</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Fuel shortage, damage..."
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 border border-purple-100 text-sm sm:text-base"
                                        value={formData.ghataReason}
                                        onChange={(e) => setFormData({ ...formData, ghataReason: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Settled */}
                            <label className="flex items-center gap-3 bg-gray-50 px-3 sm:px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={formData.isSettled}
                                    onChange={(e) => setFormData({ ...formData, isSettled: e.target.checked })}
                                />
                                <span className="font-semibold text-gray-700 text-sm sm:text-base">Mark as Settled</span>
                            </label>
                        </section>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg hover:from-gray-800 hover:to-gray-700 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2 sm:gap-3"
                    >
                        <span>{editMode ? "Update" : "Create"}</span>
                        <span className="bg-white/10 px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-sm sm:text-base">
                            ₹{displayTotal.toLocaleString()}
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RentalFormModal;
