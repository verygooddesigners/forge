'use client';

import { useState } from 'react';
import { format, subDays, startOfMonth, startOfQuarter, startOfYear } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  preset?: string;
  onPresetChange?: (preset: string) => void;
}

const PRESETS = [
  { label: 'Last 7 days', key: '7d', getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 days', key: '30d', getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'This month', key: 'month', getRange: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: 'This quarter', key: 'quarter', getRange: () => ({ from: startOfQuarter(new Date()), to: new Date() }) },
  { label: 'Year to date', key: 'ytd', getRange: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  { label: 'All time', key: 'all', getRange: () => ({ from: new Date('2024-01-01'), to: new Date() }) },
];

export function DateRangePicker({ dateRange, onDateRangeChange, preset, onPresetChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const handlePreset = (p: typeof PRESETS[number]) => {
    onDateRangeChange(p.getRange());
    onPresetChange?.(p.key);
    setOpen(false);
  };

  const displayText = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
      : format(dateRange.from, 'MMM d, yyyy')
    : 'Select date range';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal gap-2 min-w-[260px]',
            !dateRange && 'text-text-muted'
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          {/* Presets */}
          <div className="border-r border-border-subtle p-3 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary px-2 pb-2">
              Quick Select
            </div>
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => handlePreset(p)}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                  preset === p.key
                    ? 'bg-accent-muted text-accent-primary font-medium'
                    : 'hover:bg-bg-hover text-text-secondary'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                onDateRangeChange(range);
                onPresetChange?.('custom');
              }}
              numberOfMonths={2}
              defaultMonth={dateRange?.from}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
