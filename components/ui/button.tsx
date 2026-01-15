import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[13px] font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50",
  {
    variants: {
      variant: {
        default: "bg-accent-primary text-bg-deepest hover:bg-accent-hover hover:-translate-y-px hover:shadow-[0_4px_12px_var(--color-accent-glow)]",
        destructive: "bg-error text-white hover:bg-error/90",
        outline: "border border-border-default bg-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary hover:border-border-hover",
        secondary: "bg-ai-muted text-ai-accent border border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.25)]",
        ghost: "bg-transparent text-text-secondary border border-border-default hover:bg-bg-hover hover:text-text-primary hover:border-border-hover",
        link: "text-accent-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-[18px] py-2.5",
        sm: "h-8 rounded-md gap-1.5 px-3.5 text-xs",
        lg: "h-11 rounded-lg px-6 text-sm",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
