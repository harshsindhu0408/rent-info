import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages = [];
        // On mobile, show fewer pages
        const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 2) {
                for (let i = 1; i <= Math.min(3, totalPages); i++) {
                    pages.push(i);
                }
                if (totalPages > 3) {
                    pages.push("...");
                    pages.push(totalPages);
                }
            } else if (currentPage >= totalPages - 1) {
                pages.push(1);
                pages.push("...");
                for (let i = Math.max(totalPages - 2, 1); i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push("...");
                pages.push(currentPage);
                pages.push("...");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50 border-t border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                Showing <span className="font-semibold text-gray-700">{startItem}</span> to{" "}
                <span className="font-semibold text-gray-700">{endItem}</span> of{" "}
                <span className="font-semibold text-gray-700">{totalItems}</span>
            </p>

            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg sm:rounded-xl border transition-all ${currentPage === 1
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100"
                        }`}
                >
                    <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) =>
                        page === "..." ? (
                            <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-gray-400 text-sm">
                                ...
                            </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 rounded-lg sm:rounded-xl font-medium text-sm transition-all ${currentPage === page
                                    ? "bg-gray-900 text-white shadow-lg"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 active:bg-gray-100"
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg sm:rounded-xl border transition-all ${currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100"
                        }`}
                >
                    <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
