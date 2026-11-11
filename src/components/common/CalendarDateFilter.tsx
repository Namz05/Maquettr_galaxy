import React, { useState, useRef, useEffect } from 'react';
import {
  IconCalendar,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconX,
  IconClock
} from '@tabler/icons-react';

export interface CalendarDateFilterProps {
  value: string; // format YYYY-MM-DD (e.g. '2026-11-10')
  onChange: (date: string) => void;
  label?: string;
  allowClear?: boolean;
  clearLabel?: string;
  activeDates?: string[]; // List of YYYY-MM-DD that have recorded data
  align?: 'left' | 'right';
  className?: string;
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const WEEK_DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

// System reference date for Hotel Galaxy
export const HOTEL_TODAY = '2026-11-10';

export const formatFrenchDateShort = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatFrenchDateFull = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  const formatted = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const CalendarDateFilter: React.FC<CalendarDateFilterProps> = ({
  value,
  onChange,
  label,
  allowClear = false,
  clearLabel = 'Toutes les dates',
  activeDates = [],
  align = 'right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize view year & month based on current value or HOTEL_TODAY
  const baseDate = value || HOTEL_TODAY;
  const [initYear, initMonth] = baseDate.split('-').map(Number);
  const [viewYear, setViewYear] = useState<number>(initYear || 2026);
  const [viewMonth, setViewMonth] = useState<number>((initMonth ? initMonth - 1 : 10)); // 0-indexed

  // Keep view in sync when value changes from outside
  useEffect(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      if (y && m) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate calendar days
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday ... 6 = Saturday
    const day = new Date(year, month, 1).getDay();
    // Convert to Monday = 0, Sunday = 6
    return (day + 6) % 7;
  };

  const daysInCurrentMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayIndex = getFirstDayOfWeek(viewYear, viewMonth);
  const daysInPrevMonth = getDaysInMonth(
    viewMonth === 0 ? viewYear - 1 : viewYear,
    viewMonth === 0 ? 11 : viewMonth - 1
  );

  // Calendar cells
  const calendarCells: Array<{
    dayNumber: number;
    dateString: string;
    isCurrentMonth: boolean;
    isSelected: boolean;
    isToday: boolean;
    hasActivity: boolean;
  }> = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevM = viewMonth === 0 ? 12 : viewMonth;
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
    const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: dayNum,
      dateString: dateStr,
      isCurrentMonth: false,
      isSelected: value === dateStr,
      isToday: dateStr === HOTEL_TODAY,
      hasActivity: activeDates.includes(dateStr)
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: d,
      dateString: dateStr,
      isCurrentMonth: true,
      isSelected: value === dateStr,
      isToday: dateStr === HOTEL_TODAY,
      hasActivity: activeDates.includes(dateStr)
    });
  }

  // Next month leading days (fill remaining of 35 or 42 cells)
  const totalSlots = calendarCells.length <= 35 ? 35 : 42;
  const remaining = totalSlots - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextM = viewMonth === 11 ? 1 : viewMonth + 2;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: d,
      dateString: dateStr,
      isCurrentMonth: false,
      isSelected: value === dateStr,
      isToday: dateStr === HOTEL_TODAY,
      hasActivity: activeDates.includes(dateStr)
    });
  }

  // Quick preset dates around Nov 2026
  const presetShortcuts = [
    { label: '10 Nov', date: '2026-11-10' },
    { label: '09 Nov', date: '2026-11-09' },
    { label: '08 Nov', date: '2026-11-08' },
    { label: '07 Nov', date: '2026-11-07' },
    { label: '06 Nov', date: '2026-11-06' },
    { label: '05 Nov', date: '2026-11-05' }
  ];

  const handleSelectDate = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const isTodayActive = value === HOTEL_TODAY;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
          isOpen
            ? 'bg-[#4C97DB]/10 border-[#4C97DB] text-[#4C97DB] shadow-xs ring-2 ring-[#4C97DB]/15'
            : value
            ? 'bg-white border-[#E5EAF1] text-[#263445] hover:border-[#4C97DB]/50 shadow-xs'
            : 'bg-[#F5F8FC] border-[#E5EAF1] text-[#718096] hover:text-[#263445]'
        }`}
        title="Sélectionner une date précise"
      >
        <div className="w-5 h-5 rounded-md bg-[#4C97DB]/10 text-[#4C97DB] flex items-center justify-center shrink-0">
          <IconCalendar stroke={1.75} className="w-3.5 h-3.5" />
        </div>

        <div className="flex items-center gap-1.5 text-left">
          {label && <span className="text-[#718096] font-normal">{label}:</span>}
          <span className="font-semibold text-[#263445]">
            {value ? (
              <span>{formatFrenchDateShort(value)}</span>
            ) : (
              clearLabel
            )}
          </span>
        </div>

        <IconChevronDown
          stroke={1.75}
          className={`w-3.5 h-3.5 text-[#718096] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#4C97DB]' : ''
          }`}
        />
      </button>

      {/* Calendar Popover */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 z-50 w-80 bg-white rounded-2xl border border-[#E5EAF1] shadow-xl p-4 transition-all duration-150 animate-in fade-in zoom-in-95 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Popover Header: Month & Year Selectors */}
          <div className="flex items-center justify-between gap-1 pb-3 mb-3 border-b border-[#E5EAF1]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#718096] hover:bg-[#F5F8FC] hover:text-[#263445] transition-colors"
              title="Mois précédent"
            >
              <IconChevronLeft stroke={1.75} className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month Dropdown */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-[#F5F8FC] text-xs font-bold text-[#263445] px-2 py-1 rounded-lg border border-[#E5EAF1] focus:outline-none focus:ring-1 focus:ring-[#4C97DB] cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Year Dropdown */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-[#F5F8FC] text-xs font-bold text-[#263445] px-2 py-1 rounded-lg border border-[#E5EAF1] focus:outline-none focus:ring-1 focus:ring-[#4C97DB] cursor-pointer font-mono"
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#718096] hover:bg-[#F5F8FC] hover:text-[#263445] transition-colors"
              title="Mois suivant"
            >
              <IconChevronRight stroke={1.75} className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets Bar */}
          <div className="mb-3">
            <p className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <IconClock stroke={1.75} className="w-3 h-3 text-[#4C97DB]" />
              Accès rapide aux journées actives
            </p>
            <div className="flex flex-wrap gap-1">
              {presetShortcuts.map((ps) => {
                const isSelected = value === ps.date;
                return (
                  <button
                    key={ps.date}
                    type="button"
                    onClick={() => handleSelectDate(ps.date)}
                    className={`text-[11px] px-2 py-1 rounded-lg font-medium transition-all ${
                      isSelected
                        ? 'bg-[#4C97DB] text-white font-semibold shadow-xs'
                        : 'bg-[#F5F8FC] text-[#263445] hover:bg-[#E5EAF1]'
                    }`}
                  >
                    {ps.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEK_DAYS.map((day) => (
              <span
                key={day}
                className="text-[11px] font-semibold text-[#718096] py-1 select-none"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, index) => {
              const isSelected = cell.isSelected;
              const isToday = cell.isToday;
              const isCurrent = cell.isCurrentMonth;
              const hasData = cell.hasActivity;

              return (
                <button
                  key={`${cell.dateString}-${index}`}
                  type="button"
                  onClick={() => handleSelectDate(cell.dateString)}
                  className={`h-8 rounded-lg relative flex flex-col items-center justify-center text-xs transition-all font-mono ${
                    isSelected
                      ? 'bg-[#4C97DB] text-white font-bold shadow-xs'
                      : isToday
                      ? 'bg-[#4C97DB]/15 text-[#4C97DB] font-bold border border-[#4C97DB]/40'
                      : isCurrent
                      ? 'text-[#263445] hover:bg-[#F5F8FC]'
                      : 'text-[#CBD5E1] hover:bg-[#F8FAFC]'
                  }`}
                  title={`${cell.dateString}${hasData ? ' (Activité enregistrée)' : ''}`}
                >
                  <span className="leading-none">{cell.dayNumber}</span>
                  {/* Activity Indicator Dot */}
                  {hasData && (
                    <span
                      className={`w-1 h-1 rounded-full absolute bottom-1 ${
                        isSelected ? 'bg-white' : 'bg-emerald-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend & Clear Footer */}
          <div className="mt-3 pt-3 border-t border-[#E5EAF1] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-[#718096]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Activité</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4C97DB]" />
                <span>Aujourd'hui</span>
              </span>
            </div>

            {allowClear && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-[#4C97DB] font-semibold hover:underline"
              >
                {clearLabel}
              </button>
            )}

            {!allowClear && (
              <button
                type="button"
                onClick={() => handleSelectDate(HOTEL_TODAY)}
                className="text-[#4C97DB] font-semibold hover:underline"
              >
                Aujourd'hui
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
