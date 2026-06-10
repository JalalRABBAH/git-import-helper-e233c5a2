import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-institutional-navy text-white",
        secondary: "border-transparent bg-bg-elevated text-text-secondary",
        outline: "text-foreground border-border-default",
        success: "border-transparent bg-status-compliant-bg text-status-compliant",
        warning: "border-transparent bg-status-warning-bg text-status-warning",
        critical: "border-transparent bg-status-critical-bg text-status-critical",
        info: "border-transparent bg-status-info-bg text-status-info",
        gold: "border-transparent bg-gold-accent-10 text-gold-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
