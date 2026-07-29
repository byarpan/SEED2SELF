import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface AdvancedDatePickerProps {
  value: string; // YYYY-MM-DD or DD/MM/YYYY
  onChange: (val: string) => void;
  editMode: boolean;
  label?: string;
}

export default function AdvancedDatePicker({ value, onChange, editMode, label = "Date" }: AdvancedDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper: Format YYYY-MM-DD to DD/MM/YYYY for input display
  const formatToDDMMYYYY = (val: string) => {
    if (!val) return "";
    if (val.includes("/")) return val; // already formatted
    const parts = val.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return val;
  };

  // Helper: Parse Date from YYYY-MM-DD or DD/MM/YYYY
  const parseStringToDate = (val: string) => {
    if (!val) return new Date(1998, 0, 15);
    if (val.includes("/")) {
      const parts = val.split("/");
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    } else if (val.includes("-")) {
      const parts = val.split("-");
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date(1998, 0, 15) : d;
  };

  const initialDate = parseStringToDate(value);
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

  useEffect(() => {
    if (value) {
      const d = parseStringToDate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowYearSelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 90 }, (_, i) => 2026 - i); // 2026 down to 1937

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    // Standardize saved format to YYYY-MM-DD
    const isoDateStr = `${viewYear}-${m}-${d}`;
    onChange(isoDateStr);
    setIsOpen(false);
  };

  const handleTodayClick = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    onChange(`${now.getFullYear()}-${m}-${d}`);
    setIsOpen(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const formattedDisplay = value ? formatToDDMMYYYY(value) : "DD/MM/YYYY";

  if (!editMode) {
    return (
      <div className="p-3.5 bg-[#141212] border border-[#2a2626] rounded-2xl font-bold text-white text-xs">
        {formattedDisplay}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* TRIGGER BUTTON MATCHING USER IMAGE 2 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#141212] hover:bg-[#1a1818] border border-[#2a2626] hover:border-[#00d26a]/40 rounded-2xl px-4 py-3 text-xs font-bold text-white transition cursor-pointer shadow-sm flex items-center justify-between"
      >
        <span>{formattedDisplay}</span>
        <Calendar className={`w-4 h-4 transition-colors ${isOpen ? "text-[#00d26a]" : "text-stone-400"}`} />
      </button>

      {/* POPOVER CALENDAR CARD MATCHING USER IMAGE 2 */}
      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 right-0 sm:right-auto sm:w-72 bg-[#181515] border border-[#2a2626] rounded-2xl p-4 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
          
          {/* HEADER: Month, Year & Navigation Arrows */}
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => setShowYearSelector(!showYearSelector)}
              className="text-sm font-extrabold text-white hover:text-[#00d26a] transition cursor-pointer flex items-center gap-1"
            >
              <span>{monthNames[viewMonth]}, {viewYear}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="text-stone-400 hover:text-white p-1 rounded-md transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="text-stone-400 hover:text-white p-1 rounded-md transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* YEAR / MONTH QUICK SELECTOR OVERLAY */}
          {showYearSelector ? (
            <div className="space-y-3 bg-[#141212] p-3 rounded-xl border border-[#2a2626]">
              <div className="flex gap-2">
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(parseInt(e.target.value))}
                  className="bg-[#181515] border border-[#2a2626] text-white rounded-lg p-2 text-xs font-bold w-1/2 focus:outline-none focus:border-[#00d26a]"
                >
                  {monthNames.map((m, idx) => (
                    <option key={idx} value={idx}>{m}</option>
                  ))}
                </select>
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(parseInt(e.target.value))}
                  className="bg-[#181515] border border-[#2a2626] text-white rounded-lg p-2 text-xs font-bold w-1/2 focus:outline-none focus:border-[#00d26a]"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowYearSelector(false)}
                className="w-full py-2 bg-[#00d26a] text-black font-extrabold text-xs rounded-lg transition cursor-pointer"
              >
                Apply Year
              </button>
            </div>
          ) : (
            <>
              {/* DAYS OF WEEK HEADER */}
              <div className="grid grid-cols-7 text-center text-[11px] font-bold text-stone-400">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* DAYS GRID */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {/* Offset blank cells */}
                {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                  <div key={`blank-${idx}`} className="h-8 w-8" />
                ))}

                {/* Day Buttons */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const mStr = String(viewMonth + 1).padStart(2, "0");
                  const dStr = String(day).padStart(2, "0");
                  const dateKey = `${viewYear}-${mStr}-${dStr}`;
                  
                  // Check if selected
                  const parsedCurrent = parseStringToDate(value);
                  const isSelected = 
                    parsedCurrent.getFullYear() === viewYear &&
                    parsedCurrent.getMonth() === viewMonth &&
                    parsedCurrent.getDate() === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`h-8 w-8 mx-auto rounded-full font-bold flex items-center justify-center transition cursor-pointer ${
                        isSelected
                          ? "bg-[#00d26a] text-stone-950 font-black shadow-md scale-105"
                          : "text-stone-200 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* FOOTER BAR: "Today" and "Close" */}
              <div className="pt-2 border-t border-[#2a2626] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleTodayClick}
                  className="text-[#00d26a] hover:underline font-bold transition cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-stone-400 hover:text-white font-medium transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}
