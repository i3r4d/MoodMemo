
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DateRangePickerProps {
  value: { start: Date; end: Date } | null;
  onChange: (range: { start: Date; end: Date } | null) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempRange, setTempRange] = React.useState<{ start: Date; end: Date | null }>({
    start: value?.start || new Date(),
    end: value?.end || null,
  });

  const handleSelect = (date: Date) => {
    if (!tempRange.start || tempRange.end) {
      // Start new selection
      setTempRange({ start: date, end: null });
    } else if (date < tempRange.start) {
      // Selected date is before start date, swap them
      setTempRange({ start: date, end: tempRange.start });
    } else {
      // Complete the range
      const newRange = { start: tempRange.start, end: date };
      setTempRange(newRange);
      onChange({ start: newRange.start, end: newRange.end });
      setIsOpen(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  const displayText = value
    ? `${formatDate(value.start)} - ${formatDate(value.end)}`
    : 'Select date range';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("w-full justify-start text-left font-normal", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{
            from: tempRange.start,
            to: tempRange.end || undefined,
          }}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              onChange({ start: range.from, end: range.to });
              setIsOpen(false);
            }
          }}
          initialFocus
        />
        <div className="flex items-center justify-between p-2 border-t">
          <Button 
            variant="ghost" 
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            size="sm"
          >
            Clear
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {
              const last30Days = new Date();
              last30Days.setDate(last30Days.getDate() - 30);
              onChange({ 
                start: last30Days, 
                end: new Date() 
              });
              setIsOpen(false);
            }}
            size="sm"
          >
            Last 30 Days
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
