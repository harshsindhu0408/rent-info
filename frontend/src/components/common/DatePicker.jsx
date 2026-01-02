import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    X
} from "lucide-react";

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const formatDate = (date, format = "short") => {
    if (!date) return "";
    const d = new Date(date);
    const month = MONTHS[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();

    if (format === "short") {
        return `${month.slice(0, 3)} ${day}`;
    }
    return `${month.slice(0, 3)} ${day}, ${year}`;
};

const DatePicker = ({
    selected,
    onChange,
    placeholder = "Select date",
    minDate = null,
    maxDate = null,
    isClearable = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        const d = selected ? new Date(selected) : new Date();
        return { year: d.getFullYear(), month: d.getMonth() };
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

    const calendarDays = useMemo(() => {
        const { year, month } = viewDate;
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const prevDaysInMonth = getDaysInMonth(prevYear, prevMonth);

        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                day: prevDaysInMonth - i,
                currentMonth: false,
                date: new Date(prevYear, prevMonth, prevDaysInMonth - i)
            });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                currentMonth: true,
                date: new Date(year, month, i)
            });
        }

        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const remaining = 42 - days.length;

        for (let i = 1; i <= remaining; i++) {
            days.push({
                day: i,
                currentMonth: false,
                date: new Date(nextYear, nextMonth, i)
            });
        }

        return days;
    }, [viewDate]);

    const handlePrevMonth = useCallback(() => {
        setViewDate(prev => {
            if (prev.month === 0) {
                return { year: prev.year - 1, month: 11 };
            }
            return { year: prev.year, month: prev.month - 1 };
        });
    }, []);

    const handleNextMonth = useCallback(() => {
        setViewDate(prev => {
            if (prev.month === 11) {
                return { year: prev.year + 1, month: 0 };
            }
            return { year: prev.year, month: prev.month + 1 };
        });
    }, []);

    const handleDateSelect = useCallback((dayObj) => {
        if (!dayObj.currentMonth) return;

        if (minDate) {
            const minD = new Date(minDate);
            minD.setHours(0, 0, 0, 0);
            const selectedD = new Date(dayObj.date);
            selectedD.setHours(0, 0, 0, 0);
            if (selectedD < minD) return;
        }

        if (maxDate) {
            const maxD = new Date(maxDate);
            maxD.setHours(23, 59, 59, 999);
            if (dayObj.date > maxD) return;
        }

        onChange(dayObj.date);
        setIsOpen(false);
    }, [minDate, maxDate, onChange]);

    const handleClear = useCallback((e) => {
        e.stopPropagation();
        onChange(null);
    }, [onChange]);

    const isToday = useCallback((date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }, []);

    const isSelected = useCallback((date) => {
        if (!selected) return false;
        const sel = new Date(selected);
        return date.getDate() === sel.getDate() &&
            date.getMonth() === sel.getMonth() &&
            date.getFullYear() === sel.getFullYear();
    }, [selected]);

    const isDisabled = useCallback((date) => {
        if (minDate) {
            const minD = new Date(minDate);
            minD.setHours(0, 0, 0, 0);
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            if (d < minD) return true;
        }
        if (maxDate) {
            const maxD = new Date(maxDate);
            maxD.setHours(23, 59, 59, 999);
            if (date > maxD) return true;
        }
        return false;
    }, [minDate, maxDate]);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div
                onClick={() => setIsOpen(true)}
                className="w-full px-3 py-2 md:py-3 bg-gray-50 rounded-lg md:rounded-xl font-medium text-xs md:text-sm cursor-pointer flex items-center justify-between gap-2 hover:bg-gray-100 transition-colors border-2 border-transparent focus-within:border-blue-500"
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <CalendarIcon size={14} className="text-gray-400 shrink-0" />
                    <span className={`truncate ${selected ? "text-gray-900" : "text-gray-400"}`}>
                        {selected ? formatDate(selected) : placeholder}
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
                <div className="absolute z-50 mt-1 left-0 right-0 sm:left-auto sm:right-auto sm:w-[280px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn">
                    <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <h3 className="font-bold text-gray-900 text-sm">
                                {MONTHS[viewDate.month].slice(0, 3)} {viewDate.year}
                            </h3>
                            <button
                                onClick={handleNextMonth}
                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-0.5 mb-1">
                            {DAYS.map(day => (
                                <div key={day} className="text-center text-[9px] font-bold text-gray-400 uppercase py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-0.5">
                            {calendarDays.map((dayObj, idx) => {
                                const disabled = !dayObj.currentMonth || isDisabled(dayObj.date);
                                const today = isToday(dayObj.date);
                                const sel = isSelected(dayObj.date);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => !disabled && handleDateSelect(dayObj)}
                                        disabled={disabled}
                                        className={`
                      aspect-square flex items-center justify-center rounded-md text-xs font-medium transition-all
                      ${disabled
                                                ? "text-gray-300 cursor-not-allowed"
                                                : "hover:bg-gray-100 cursor-pointer"
                                            }
                      ${sel
                                                ? "bg-gray-900 text-white hover:bg-gray-800"
                                                : ""
                                            }
                      ${today && !sel
                                                ? "bg-blue-50 text-blue-600 font-bold"
                                                : ""
                                            }
                      ${!dayObj.currentMonth
                                                ? "opacity-30"
                                                : ""
                                            }
                    `}
                                    >
                                        {dayObj.day}
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

export default DatePicker;
