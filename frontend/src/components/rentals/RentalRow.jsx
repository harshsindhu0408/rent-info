import { useNavigate } from "react-router-dom";
import { Phone, Car as CarIcon, Eye, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";

const RentalRow = ({ rental, onEdit, onDelete }) => {
    const navigate = useNavigate();

    // Mobile card view
    const MobileCard = () => (
        <div className="lg:hidden p-4 border-b border-gray-100 hover:bg-gray-50/50 transition">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-xl shrink-0">
                        <CarIcon size={18} />
                    </div>
                    <div className="min-w-0">
                        <div
                            className="font-bold text-gray-900 cursor-pointer hover:text-blue-600"
                            onClick={() => navigate(`/rentals/${rental._id}`)}
                        >
                            {rental.car?.brand} {rental.car?.model}
                        </div>
                        <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded w-fit mt-1">
                            {rental.car?.plateNumber}
                        </div>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-gray-900">
                        ₹{rental.finalAmountCollected?.toLocaleString() || 0}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-600">{rental.customer?.name}</span>
                <span className="text-gray-300">•</span>
                <a href={`tel:${rental.customer?.phone}`} className="flex items-center gap-1 text-sm text-blue-600">
                    <Phone size={12} />
                    <span>{rental.customer?.phone}</span>
                </a>
            </div>

            <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-500">
                    <span className="font-medium">{format(new Date(rental.startTime), "MMM d, h:mm a")}</span>
                    <span className="mx-2">→</span>
                    <span className={`font-medium ${!rental.endTime ? "text-amber-600" : ""}`}>
                        {rental.endTime ? format(new Date(rental.endTime), "MMM d, h:mm a") : "Ongoing"}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                    <span
                        className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${rental.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                            }`}
                    >
                        {rental.status}
                    </span>
                    <span
                        className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${rental.isSettled
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                            }`}
                    >
                        {rental.isSettled ? "Settled" : "Pending"}
                    </span>
                    {rental.advance > 0 && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg font-medium">
                            ₹{rental.advance} adv
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => navigate(`/rentals/${rental._id}`)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(rental)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(rental._id)}
                        className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 transition"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    // Desktop table row
    const DesktopRow = () => (
        <tr className="hidden lg:table-row hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group">
            {/* Car Info */}
            <td
                className="px-6 py-5 align-top cursor-pointer"
                onClick={() => navigate(`/rentals/${rental._id}`)}
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-2xl group-hover:scale-105 transition-transform duration-200 shadow-sm shrink-0">
                        <CarIcon size={22} />
                    </div>
                    <div className="min-w-0">
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {rental.car?.brand} {rental.car?.model}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1 bg-gray-100 px-2 py-1 rounded-lg w-fit">
                            {rental.car?.plateNumber}
                        </div>
                    </div>
                </div>
            </td>

            {/* Customer Info */}
            <td className="px-6 py-5 align-top">
                <div className="font-semibold text-gray-900">{rental.customer?.name}</div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                    <Phone size={12} className="shrink-0" />
                    <span className="truncate">{rental.customer?.phone}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1 bg-gray-50 px-2 py-0.5 rounded w-fit">
                    {rental.customer?.occupation}
                </div>
            </td>

            {/* Details */}
            <td className="px-6 py-5 align-top">
                <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                        <span className="w-14 text-xs font-bold text-gray-400 uppercase shrink-0">Start</span>
                        <span className="font-medium">
                            {format(new Date(rental.startTime), "MMM d, h:mm a")}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <span className="w-14 text-xs font-bold text-gray-400 uppercase shrink-0">End</span>
                        <span className={`font-medium ${!rental.endTime ? "text-amber-500" : ""}`}>
                            {rental.endTime
                                ? format(new Date(rental.endTime), "MMM d, h:mm a")
                                : "Ongoing..."}
                        </span>
                    </div>
                    <div className="pt-2 flex flex-wrap gap-2">
                        <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${rental.status === "Active"
                                ? "bg-gradient-to-r from-emerald-100 to-green-50 text-emerald-700 border border-emerald-200"
                                : "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 border border-gray-200"
                                }`}
                        >
                            {rental.status}
                        </span>
                        <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${rental.isSettled
                                ? "bg-gradient-to-r from-blue-100 to-indigo-50 text-blue-700 border border-blue-200"
                                : "bg-gradient-to-r from-amber-100 to-orange-50 text-amber-700 border border-amber-200"
                                }`}
                        >
                            {rental.isSettled ? "✓ Settled" : "Pending"}
                        </span>
                    </div>
                </div>
            </td>

            {/* Financials */}
            <td className="px-6 py-5 text-right align-top">
                <div className="text-xl font-bold text-gray-900">
                    ₹{rental.finalAmountCollected?.toLocaleString() || 0}
                </div>
                <div className="flex flex-col items-end gap-1 mt-2">
                    {rental.advance > 0 && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg font-medium">
                            ₹{rental.advance} advance
                        </span>
                    )}
                    {rental.deductions?.amount > 0 && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-lg font-medium">
                            -₹{rental.deductions.amount} ded.
                        </span>
                    )}
                    {rental.chot > 0 && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-lg font-medium">
                            +₹{rental.chot} chot
                        </span>
                    )}
                    {rental.ghata?.amount > 0 && (
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg font-medium">
                            -₹{rental.ghata.amount} loss
                        </span>
                    )}
                </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate(`/rentals/${rental._id}`)}
                        className="p-2.5 bg-gray-50 hover:bg-blue-500 rounded-xl text-gray-500 hover:text-white transition-all duration-200 border border-gray-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-200"
                        title="View Details"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(rental)}
                        className="p-2.5 bg-gray-50 hover:bg-gray-900 rounded-xl text-gray-600 hover:text-white transition-all duration-200 border border-gray-200 hover:border-gray-900 hover:shadow-lg hover:shadow-gray-200"
                        title="Edit Rental"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(rental._id)}
                        className="p-2.5 bg-gray-50 hover:bg-red-500 rounded-xl text-gray-400 hover:text-white transition-all duration-200 border border-gray-200 hover:border-red-500 hover:shadow-lg hover:shadow-red-200"
                        title="Delete Rental"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <>
            <MobileCard />
            <DesktopRow />
        </>
    );
};

export default RentalRow;
