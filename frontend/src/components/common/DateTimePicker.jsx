import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    ChevronLeft,
    ChevronRight,
    X,
    Check
} from "lucide-react";

// Lightweight date manipulation helpers
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TIME_SLOTS = (() => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
            const hour = h % 12 || 12;
            const ampm = h < 12 ? "AM" : "PM";
            const minute = m.toString().padStart(2, "0");
            slots.push({
                label: `${hour}:${minute} ${ampm}`,
                hour: h,
                minute: m
            });
        }
    }
    return slots;
})();

const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = MONTHS[d.getMonth()].slice(0, 3);
    const day = d.getDate();
    const year = d.getFullYear();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    const minuteStr = minutes.toString().padStart(2, "0");
    return `${month} ${day}, ${year} — ${hour12}:${minuteStr} ${ampm}`;
};

const DateTimePicker = ({
    selected,
    onChange,
    placeholder = "Select date & time",
    minDate = null,
    isClearable = false,
    required = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState("date"); // "date" | "time"
    const [viewDate, setViewDate] = useState(() => {
        const d = selected ? new Date(selected) : new Date();
        return { year: d.getFullYear(), month: d.getMonth() };
    });
    const [selectedDate, setSelectedDate] = useState(selected ? new Date(selected) : null);
    const [selectedTime, setSelectedTime] = useState(() => {
        if (selected) {
            const d = new Date(selected);
            return { hour: d.getHours(), minute: d.getMinutes() };
        }
        return { hour: 10, minute: 0 };
    });

    const containerRef = useRef(null);
    const timeListRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Scroll to selected time when time picker opens
    useEffect(() => {
        if (step === "time" && timeListRef.current) {
            const index = TIME_SLOTS.findIndex(
                t => t.hour === selectedTime.hour && t.minute === selectedTime.minute
            );
            if (index !== -1) {
                const itemHeight = 44;
                timeListRef.current.scrollTop = Math.max(0, index * itemHeight - 100);
            }
        }
    }, [step, selectedTime]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const { year, month } = viewDate;
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Previous month days
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

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                currentMonth: true,
                date: new Date(year, month, i)
            });
        }

        // Next month days
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const remaining = 42 - days.length; // 6 rows * 7 days

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

        setSelectedDate(dayObj.date);
        setStep("time");
    }, [minDate]);

    const handleTimeSelect = useCallback((timeSlot) => {
        setSelectedTime({ hour: timeSlot.hour, minute: timeSlot.minute });

        if (selectedDate) {
            const finalDate = new Date(selectedDate);
            finalDate.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
            onChange(finalDate);
            setIsOpen(false);
            setStep("date");
        }
    }, [selectedDate, onChange]);

    const handleClear = useCallback((e) => {
        e.stopPropagation();
        onChange(null);
        setSelectedDate(null);
        setStep("date");
    }, [onChange]);

    const isToday = useCallback((date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }, []);

    const isSelected = useCallback((date) => {
        if (!selectedDate) return false;
        return date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();
    }, [selectedDate]);

    const isDisabled = useCallback((date) => {
        if (!minDate) return false;
        const minD = new Date(minDate);
        minD.setHours(0, 0, 0, 0);
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d < minD;
    }, [minDate]);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Input Field */}
            <div
                onClick={() => setIsOpen(true)}
                className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-gray-50 rounded-xl font-medium text-sm sm:text-base cursor-pointer flex items-center justify-between gap-2 hover:bg-gray-100 transition-colors border-2 border-transparent focus-within:border-blue-500"
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <CalendarIcon size={16} className="text-gray-400 shrink-0" />
                    <span className={`truncate ${selected ? "text-gray-900" : "text-gray-400"}`}>
                        {selected ? formatDate(selected) : placeholder}
                    </span>
                </div>
                {isClearable && selected && (
                    <button
                        onClick={handleClear}
                        className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition shrink-0"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-2 left-0 right-0 sm:left-auto sm:right-auto sm:w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${step === "date"
                                    ? "bg-gray-900 text-white"
                                    : "bg-white text-gray-600 border border-gray-200"
                                }`}>
                                <CalendarIcon size={12} />
                                <span>Date</span>
                                {selectedDate && step === "time" && <Check size={10} className="text-green-400" />}
                            </div>
                            <ChevronRight size={14} className="text-gray-300" />
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${step === "time"
                                    ? "bg-gray-900 text-white"
                                    : "bg-white text-gray-400 border border-gray-200"
                                }`}>
                                <Clock size={12} />
                                <span>Time</span>
                            </div>
                        </div>
                        <button
                            onClick={() => { setIsOpen(false); setStep("date"); }}
                            className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Date Picker */}
                    {step === "date" && (
                        <div className="p-3">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <h3 className="font-bold text-gray-900">
                                    {MONTHS[viewDate.month]} {viewDate.year}
                                </h3>
                                <button
                                    onClick={handleNextMonth}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Day Names */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {DAYS.map(day => (
                                    <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
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
                        aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
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

                            {/* Quick Actions */}
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        const today = new Date();
                                        setViewDate({ year: today.getFullYear(), month: today.getMonth() });
                                        setSelectedDate(today);
                                        setStep("time");
                                    }}
                                    className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => {
                                        const tomorrow = new Date();
                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                        setViewDate({ year: tomorrow.getFullYear(), month: tomorrow.getMonth() });
                                        setSelectedDate(tomorrow);
                                        setStep("time");
                                    }}
                                    className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                >
                                    Tomorrow
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Time Picker */}
                    {step === "time" && (
                        <div className="p-3">
                            {/* Back to Date */}
                            <button
                                onClick={() => setStep("date")}
                                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mb-3 hover:text-blue-700 transition"
                            >
                                <ChevronLeft size={14} />
                                <span>Change Date</span>
                                <span className="text-gray-500 ml-1">
                                    ({selectedDate && `${MONTHS[selectedDate.getMonth()].slice(0, 3)} ${selectedDate.getDate()}`})
                                </span>
                            </button>

                            {/* Time Grid */}
                            <div
                                ref={timeListRef}
                                className="max-h-[240px] overflow-y-auto scrollbar-thin pr-1"
                            >
                                <div className="grid grid-cols-3 gap-1.5">
                                    {TIME_SLOTS.map((slot, idx) => {
                                        const isSelectedTime = slot.hour === selectedTime.hour && slot.minute === selectedTime.minute;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleTimeSelect(slot)}
                                                className={`
                          py-2.5 px-2 rounded-lg text-sm font-medium transition-all
                          ${isSelectedTime
                                                        ? "bg-gray-900 text-white"
                                                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                                    }
                        `}
                                            >
                                                {slot.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DateTimePicker;
