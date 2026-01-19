import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "placeholder:text-text-muted bg-white border-border-default h-10 w-full min-w-0 rounded-lg border px-4 py-3 text-sm text-text-primary shadow-xs transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-accent-primary focus:bg-bg-surface focus:shadow-[0_0_0_3px_var(--color-accent-muted)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
