import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-text-muted bg-white border-border-default flex field-sizing-content min-h-20 w-full rounded-lg border px-4 py-3 text-sm text-text-primary shadow-xs transition-all outline-none resize-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-accent-primary focus:bg-bg-surface focus:shadow-[0_0_0_3px_var(--color-accent-muted)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
