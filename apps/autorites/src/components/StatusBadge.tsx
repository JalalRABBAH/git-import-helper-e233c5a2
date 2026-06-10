import { cn } from "@/lib/utils"

type StatusVariant = "compliant" | "success" | "warning" | "critical" | "danger" | "info" | "gold" | "neutral" | "default"

interface StatusBadgeProps {
  variant?: StatusVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

const variantMap: Record<StatusVariant, { bg: string; text: string; dotColor: string }> = {
  compliant: {
    bg: "bg-status-compliant-bg",
    text: "text-status-compliant",
    dotColor: "bg-status-compliant",
  },
  success: {
    bg: "bg-status-compliant-bg",
    text: "text-status-compliant",
    dotColor: "bg-status-compliant",
  },
  warning: {
    bg: "bg-status-warning-bg",
    text: "text-status-warning",
    dotColor: "bg-status-warning",
  },
  critical: {
    bg: "bg-status-critical-bg",
    text: "text-status-critical",
    dotColor: "bg-status-critical",
  },
  danger: {
    bg: "bg-status-critical-bg",
    text: "text-status-critical",
    dotColor: "bg-status-critical",
  },
  info: {
    bg: "bg-status-info-bg",
    text: "text-status-info",
    dotColor: "bg-status-info",
  },
  gold: {
    bg: "bg-gold-accent-10",
    text: "text-gold-accent",
    dotColor: "bg-gold-accent",
  },
  neutral: {
    bg: "bg-bg-elevated",
    text: "text-text-muted",
    dotColor: "bg-text-muted",
  },
  default: {
    bg: "bg-bg-elevated",
    text: "text-text-secondary",
    dotColor: "bg-text-muted",
  },
}

export default function StatusBadge({
  variant = "default",
  children,
  className,
  dot = true,
}: StatusBadgeProps) {
  const styles = variantMap[variant]

  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-3 rounded-full text-xs font-semibold",
        styles.bg,
        styles.text,
        className
      )}
    >
      {dot && (
        <span
          className={cn("w-2 h-2 rounded-full mr-1.5 shrink-0", styles.dotColor)}
        />
      )}
      {children}
    </span>
  )
}
