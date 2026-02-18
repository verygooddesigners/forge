"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-text-primary",
        nav: "flex items-center gap-1",
        button_previous:
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-border-subtle hover:bg-bg-hover transition-colors absolute left-1",
        button_next:
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-border-subtle hover:bg-bg-hover transition-colors absolute right-1",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-text-tertiary rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent-muted",
        day_button: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 inline-flex items-center justify-center rounded-md text-sm transition-colors hover:bg-bg-hover focus:outline-none focus:ring-2 focus:ring-accent-primary",
        selected: "bg-accent-primary text-white hover:bg-accent-hover focus:bg-accent-primary rounded-md",
        today: "bg-bg-surface text-text-primary font-semibold rounded-md",
        outside: "text-text-muted opacity-50 aria-selected:bg-accent-muted/50 aria-selected:text-text-muted aria-selected:opacity-30",
        disabled: "text-text-muted opacity-50",
        range_middle: "aria-selected:bg-accent-muted aria-selected:text-accent-primary",
        range_start: "rounded-l-md",
        range_end: "rounded-r-md",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
