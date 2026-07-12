"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export interface SearchableSelectOption {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setSearch(""); // Reset search on close
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Select Trigger */}
      <div
        className={`flex items-center justify-between w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm cursor-pointer hover:bg-accent/50 transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`truncate ${!selectedOption ? "text-muted-foreground" : "text-foreground"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-lg border border-border shadow-md overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b border-border px-3 py-2 shrink-0">
            <Search className="w-4 h-4 mr-2 opacity-50 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No options found.
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`flex items-center justify-between px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                    value === opt.value ? "bg-accent/50 font-medium text-accent-foreground" : ""
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && <Check className="w-4 h-4 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
