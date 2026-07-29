import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface AdvancedGenderPickerProps {
  value: string;
  onChange: (val: string) => void;
  editMode: boolean;
}

export default function AdvancedGenderPicker({ value, onChange, editMode }: AdvancedGenderPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options = ["Male", "Female", "Other"];

  // Normalize initial value or default to "Male"
  const currentValue = options.find((o) => o.toLowerCase() === (value || "").toLowerCase()) || "Male";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!editMode) {
    return (
      <div className="p-3.5 bg-[#141212] border border-[#2a2626] rounded-2xl font-bold text-white text-xs">
        {currentValue}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#141212] hover:bg-[#1a1818] border border-[#2a2626] hover:border-[#00d26a]/40 rounded-2xl px-4 py-3 text-xs font-bold text-white flex items-center justify-between transition cursor-pointer shadow-sm"
      >
        <span>{currentValue}</span>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#00d26a]" : ""}`} />
      </button>

      {/* DROPDOWN MENU MATCHING USER IMAGE 1 */}
      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 right-0 bg-[#181515] border border-[#2a2626] rounded-2xl p-2 shadow-2xl space-y-1.5 animate-in fade-in zoom-in-95">
          {options.map((opt) => {
            const isSelected = currentValue.toLowerCase() === opt.toLowerCase();
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  isSelected
                    ? "bg-[#0e2a1d] text-[#00d26a] border border-[#00d26a]/30"
                    : "text-stone-200 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
