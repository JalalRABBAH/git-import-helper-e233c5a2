import { type ReactNode } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number | string
  icon: ReactNode
  iconBg?: string
  iconColor?: string
  color?: "blue" | "green" | "amber" | "red" | "purple" | "gold"
  trend?: number
  trendLabel?: string
  suffix?: string
  prefix?: string
  decimals?: number
}

const colorMap: Record<string, { iconBg: string; iconColor: string }> = {
  blue:   { iconBg: "rgba(58,124,199,0.12)",  iconColor: "#3A7CC7" },
  green:  { iconBg: "rgba(46,139,87,0.12)",   iconColor: "#2E8B57" },
  amber:  { iconBg: "rgba(232,148,58,0.12)",  iconColor: "#E8943A" },
  red:    { iconBg: "rgba(199,62,62,0.12)",   iconColor: "#C73E3E" },
  purple: { iconBg: "rgba(124,92,201,0.12)",  iconColor: "#7C5CC9" },
  gold:   { iconBg: "rgba(201,150,59,0.12)",  iconColor: "#C9963B" },
}

export default function StatCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  color,
  trend,
  trendLabel,
  suffix = "",
  prefix = "",
  decimals,
}: StatCardProps) {
  const resolvedColor = color ? colorMap[color] : null
  const finalIconBg = iconBg ?? resolvedColor?.iconBg ?? "rgba(58,124,199,0.12)"
  const finalIconColor = iconColor ?? resolvedColor?.iconColor ?? "#3A7CC7"
  const formattedValue =
    typeof value === "number"
      ? decimals !== undefined
        ? `${prefix}${value.toFixed(decimals)}${suffix}`
        : `${prefix}${formatNumber(value)}${suffix}`
      : `${prefix}${value}${suffix}`

  const trendPositive = trend !== undefined ? trend >= 0 : undefined

  return (
    <div className="bg-white dark:bg-bg-dark-card rounded-xl card-shadow p-5 h-[120px] flex flex-col justify-between transition-all duration-200 hover:translate-y-[-2px] hover:card-shadow-hover">
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: finalIconBg }}
        >
          <span style={{ color: finalIconColor }}>{icon}</span>
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trendPositive ? "text-status-compliant" : "text-status-critical"
            )}
          >
            {trendPositive ? (
              <TrendingUp size={14} />
            ) : trend === 0 ? (
              <Minus size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{Math.abs(trend).toFixed(1)}%</span>
            {trendLabel && (
              <span className="text-text-muted font-normal ml-1">{trendLabel}</span>
            )}
          </div>
        )}
      </div>

      <div>
        <p className="font-jetbrains-mono text-2xl font-bold text-text-primary dark:text-text-dark-primary tracking-tight">
          {formattedValue}
        </p>
        <p className="text-xs text-text-muted mt-0.5">{title}</p>
      </div>
    </div>
  )
}
