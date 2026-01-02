import { useState, useEffect, useRef, useCallback } from "react";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    X
} from "lucide-react";

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const FULL_MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const MonthPicker = ({
    selected,
    onChange,
    placeholder = "Month",
    isClearable = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewYear, setViewYear] = useState(() => {
        if (selected) {
            const d = new Date(selected);
            return d.getFullYear();
        }
        return new Date().getFullYear();
    });

    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMonthSelect = useCallback((monthIndex) => {
        const date = new Date(viewYear, monthIndex, 1);
        onChange(date);
        setIsOpen(false);
    }, [viewYear, onChange]);

    const handleClear = useCallback((e) => {
        e.stopPropagation();
        onChange(null);
    }, [onChange]);

    const isSelected = useCallback((monthIndex) => {
        if (!selected) return false;
        const sel = new Date(selected);
        return sel.getMonth() === monthIndex && sel.getFullYear() === viewYear;
    }, [selected, viewYear]);

    const formatDisplay = () => {
        if (!selected) return "";
        const d = new Date(selected);
        return `${FULL_MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div
                onClick={() => setIsOpen(true)}
                className="w-full px-3 py-2 md:py-3 bg-gray-50 rounded-lg md:rounded-xl font-medium text-xs md:text-sm cursor-pointer flex items-center justify-between gap-2 hover:bg-gray-100 transition-colors border-2 border-transparent focus-within:border-blue-500"
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <CalendarIcon size={14} className="text-gray-400 shrink-0" />
                    <span className={`truncate ${selected ? "text-gray-900" : "text-gray-400"}`}>
                        {selected ? formatDisplay() : placeholder}
                    </span>
                </div>
                {isClearable && selected && (
                    <button
                        onClick={handleClear}
                        className="p-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition shrink-0"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 left-0 right-0 sm:left-auto sm:right-auto sm:w-[220px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn">
                    <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                            <button
                                onClick={() => setViewYear(prev => prev - 1)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <h3 className="font-bold text-gray-900 text-sm">
                                {viewYear}
                            </h3>
                            <button
                                onClick={() => setViewYear(prev => prev + 1)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                            {MONTHS.map((month, idx) => {
                                const sel = isSelected(idx);
                                const isCurrent = new Date().getMonth() === idx && new Date().getFullYear() === viewYear;

                                return (
                                    <button
                                        key={month}
                                        onClick={() => handleMonthSelect(idx)}
                                        className={`
                      py-2 px-1 rounded-lg text-xs font-medium transition-all
                      ${sel
                                                ? "bg-gray-900 text-white"
                                                : isCurrent
                                                    ? "bg-blue-50 text-blue-600 font-bold"
                                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                            }
                    `}
                                    >
                                        {month}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthPicker;
