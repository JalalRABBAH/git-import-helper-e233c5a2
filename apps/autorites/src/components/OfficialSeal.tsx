import { cn } from "@/lib/utils"
import { Shield } from "lucide-react"

interface OfficialSealProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: { container: "w-6 h-6", icon: 12, text: "text-[8px]" },
  md: { container: "w-10 h-10", icon: 18, text: "text-[10px]" },
  lg: { container: "w-16 h-16", icon: 28, text: "text-sm" },
}

export default function OfficialSeal({ size = "md", className }: OfficialSealProps) {
  const s = sizeMap[size]

  return (
    <div
      className={cn(
        "rounded-full bf-badge-gradient flex items-center justify-center shadow-lg",
        s.container,
        className
      )}
    >
      <div className="w-[85%] h-[85%] rounded-full bg-white/95 flex items-center justify-center">
        {size === "lg" ? (
          <span className={cn("font-playfair-display font-bold text-institutional-navy", s.text)}>
            BF
          </span>
        ) : (
          <Shield size={s.icon} className="text-institutional-navy" />
        )}
      </div>
    </div>
  )
}
