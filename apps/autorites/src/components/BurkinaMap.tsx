import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/utils"

interface RegionData {
  name: string
  value: number
  label: string
}

interface BurkinaMapProps {
  regionData?: RegionData[]
  className?: string
  onRegionClick?: (region: string) => void
}

const defaultRegionData: RegionData[] = [
  { name: "Boucle du Mouhoun", value: 8450, label: "8,450 ventes" },
  { name: "Cascades", value: 5230, label: "5,230 ventes" },
  { name: "Centre", value: 42380, label: "42,380 ventes" },
  { name: "Centre-Est", value: 7890, label: "7,890 ventes" },
  { name: "Centre-Nord", value: 6750, label: "6,750 ventes" },
  { name: "Centre-Ouest", value: 11240, label: "11,240 ventes" },
  { name: "Centre-Sud", value: 6340, label: "6,340 ventes" },
  { name: "Est", value: 9870, label: "9,870 ventes" },
  { name: "Hauts-Bassins", value: 28560, label: "28,560 ventes" },
  { name: "Nord", value: 7890, label: "7,890 ventes" },
  { name: "Plateau-Central", value: 9230, label: "9,230 ventes" },
  { name: "Sahel", value: 4560, label: "4,560 ventes" },
  { name: "Sud-Ouest", value: 5357, label: "5,357 ventes" },
]

function getHeatColor(value: number, min: number, max: number): string {
  const ratio = (value - min) / (max - min)
  if (ratio < 0.2) return "#E8F0FE"
  if (ratio < 0.4) return "#B8D4F0"
  if (ratio < 0.6) return "#7BAFD4"
  if (ratio < 0.8) return "#4A8BC2"
  return "#1B4F8F"
}

export default function BurkinaMap({
  regionData = defaultRegionData,
  className,
  onRegionClick,
}: BurkinaMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const values = regionData.map((r) => r.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY })
  }, [])

  const regionMap: Record<string, string> = {
    "Boucle du Mouhoun": "boucle-mouhoun",
    Cascades: "cascades",
    Centre: "centre",
    "Centre-Est": "centre-est",
    "Centre-Nord": "centre-nord",
    "Centre-Ouest": "centre-ouest",
    "Centre-Sud": "centre-sud",
    Est: "est",
    "Hauts-Bassins": "hauts-bassins",
    Nord: "nord",
    "Plateau-Central": "plateau-central",
    Sahel: "sahel",
    "Sud-Ouest": "sud-ouest",
  }

  const getRegionColor = (name: string) => {
    const data = regionData.find((r) => r.name === name)
    if (!data) return "#E8F0FE"
    return getHeatColor(data.value, minVal, maxVal)
  }

  return (
    <div className={cn("relative", className)} onMouseMove={handleMouseMove}>
      <svg
        viewBox="0 0 600 700"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sahel — Nord */}
        <path
          d="M200,30 L320,25 L400,40 L420,100 L380,150 L300,140 L200,120 L180,80 Z"
          fill={getRegionColor("Sahel")}
          stroke="#1B2838"
          strokeWidth={hoveredRegion === "Sahel" ? 2.5 : 1.5}
          className="cursor-pointer transition-all duration-200"
          onMouseEnter={() => setHoveredRegion("Sahel")}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick?.("Sahel")}
          style={hoveredRegion === "Sahel" ? { filter: "url(#glow)" } : undefined}
        />
        <text x="290" y="90" textAnchor="middle" className="text-[10px] font-semibold fill-institutional-navy pointer-events-none">
          SAHEL
        </text>

        {/* Nord */}
        <path
          d="M420,40 L500,35 L540,80 L520,150 L450,160 L420,100 Z"
          fill={getRegionColor("Nord")}
          stroke="#1B2838"
          strokeWidth={hoveredRegion === "Nord" ? 2.5 : 1.5}
          className="cursor-pointer transition-all duration-200"
          onMouseEnter={() => setHoveredRegion("Nord")}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick?.("Nord")}
        />
        <text x="485" y="100" textAnchor="middle" className="text-[10px] font-semibold fill-institutional-navy pointer-events-none">
          NORD
        </text>

        {/* Centre-Nord */}
        <path
          d="M300,140 L380,150 L420,100 L450,160 L420,220 L320,230 L280,190 Z"
          fill={getRegionColor("Centre-Nord")}
          stroke="#1B2838"
          strokeWidth={hoveredRegion === "Centre-Nord" ? 2.5 : 1.5}
          className="cursor-pointer transition-all duration-200"
          onMouseEnter={() => setHoveredRegion("Centre-Nord")}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick?.("Centre-Nord")}
        />
        <text x="360" y="175" textAnchor="middle" className="text-[10px] font-semibold fill-institutional-navy pointer-events-none">
          CENTRE-NORD
        </text>

        {/* Boucle du Mouhoun */}
        <path
          d="M50,120 L180,80 L200,120 L180,180 L120,220 L60,200 L30,160 Z"
          fill={getRegionColor("Boucle du Mouhoun")}
          stroke="#1B2838"
          strokeWidth={hoveredRegion === "Boucle du Mouhoun" ? 2.5 : 1.5}
          className="cursor-pointer transition-all duration-200"
          onMouseEnter={() => setHoveredRegion("Boucle du Mouhoun")}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick?.("Boucle du Mouhoun")}
        />
        <text x="115" y="155" textAnchor="middle" className="text-[9px] font-semibold fill-institutional-navy pointer-events-none">
          BOUCLE DU MOUHOUN
        </text>

        {/* Cascades */}
        <path
          d="M60,200 L120,220 L140,280 L100,340 L40,310 L30,250 Z"
          fill={getRegionColor("Cascades")}
          stroke="#1B2838"
          strokeWidth={hoveredRegion === "Cascades" ? 2.5 : 1.5}
          className="cursor-pointer transition-all duration-200"
          onMouseEnter={() => setHoveredRegion("Cascades")}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick?.("Cascades")}
        />
        <text x="90" y="280" textAnchor="middle" className="text-[10px] font-semibold fill-institutional-navy pointer-events-none">
          CASCADES
        </text>

        {/* Hauts-Bassins */}
        <path
          d="M120,220 L180,180 L220,240 L200,320 L140,340 L100,340 L140,280 Z"
          fill={getRegionColor("Hauts-Bassins")}
          stroke="#1B2838"
          strokeWidth={hoveredRegion === "Hauts-Bassins" ? 2.5 : 1.5}
          className="cursor-pointer transition-all duration-200"
          onMouseEnter={() => setHoveredRegion("Hauts-Bassins")}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick?.("Hauts-Bassins")}
        />
        <text x="160" y="280" textAnchor="middle" className="text-[9px] font-semibold fill-institutional-navy pointer-events-none">
          HAUTS-BASSINS
        </text>

        {/* Centre-Ouest */}
        <path
          d="M180,180 L200,120 L280,190 L320,230 L300,300 L220,320 L180,260 Z"
          fill={getRegionColor("Centre-Ouest")}
          stroke="#1B2838"
          strokeWidth={hoveredRegion === "Centre-Ouest" ? 2.5 : 1.5}
          className="cursor-pointer transition-all duration-200"
          onMouseEnter={() => setHoveredRegion("Centre-Ouest")}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick?.("Centre-Ouest")}
        />
        <text x="250" y="235" textAnchor="middle" className="text-[9px] font-semibold fill-institutional-navy pointer-events-none">
          CENTRE-OUEST
        </text>

        {/* Centre */}
        <path
          d="M320,230 L420,220 L440,280 L400,340 L320,350 L300,300 Z"
          fill={getRegionColor("Centre")}
          stroke="#1B2838"
          strokeWidth={hoveredRegion === "Centre" ? 3 : 2}
          className="cursor-pointer transition-all duration-200"
          onMouseEnter={() => setHoveredRegion("Centre")}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick?.("Centre")}
        />
        {/* Star for capital */}
        <circle cx="370" cy="285" r="5" fill="#C9963B" stroke="#1B2838" strokeWidth={1} />
        <text x="370" y="280" textAnchor="middle" className="text-[8px] font-bold fill-institutional-navy pointer-events-none">
          OUAGA
        </text>
        <text x="370" y="305" textAnchor="middle" className="text-[10px] font-bold fill-institutional-navy pointer-events-none">
          CENTRE
        </text>

        {/* Plateau-Central */}
        <path
          d="M420,220 L450,160 L500,180 L520,260 L460,290 L440,280 Z"
          fill={getRegionColor("Plateau-Central")}
          stroke="#1B2838"
          strokeWidth={hoveredRegion === "Plateau-Central" ? 2.5 : 1.5}
          className="cursor-pointer transition-all duration-200"
          onMouseEnter={() => setHoveredRegion("Plateau-Central")}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick?.("Plateau-Central")}
        />
        <text x="475" y="230" textAnchor="middle" className="text-[9px] font-semibold fill-institutional-navy pointer-events-none">
          PLATEAU-CENTRAL
        </text>

        {/* Centre-Est */}
        <path
          d="M440,280 L460,290 L520,260 L540,330 L480,360 L420,340 L400,340 Z"
          fill={getRegionColor("Centre-Est")}
          stroke="#1B2838"
          strokeWidth={hoveredRegion === "Centre-Est" ? 2.5 : 1.5}
          className="cursor-pointer transition-all duration-200"
          onMouseEnter={() => setHoveredRegion("Centre-Est")}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick?.("Centre-Est")}
        />
        <text x="480" y="320" textAnchor="middle" className="text-[9px] font-semibold fill-institutional-navy pointer-events-none">
          CENTRE-EST
        </text>

        {/* Centre-Sud */}
        <path
          d="M300,300 L320,350 L300,420 L240,440 L200,400 L220,320 Z"
          fill={getRegionColor("Centre-Sud")}
          stroke="#1B2838"
          strokeWidth={hoveredRegion === "Centre-Sud" ? 2.5 : 1.5}
          className="cursor-pointer transition-all duration-200"
          onMouseEnter={() => setHoveredRegion("Centre-Sud")}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick?.("Centre-Sud")}
        />
        <text x="270" y="370" textAnchor="middle" className="text-[9px] font-semibold fill-institutional-navy pointer-events-none">
          CENTRE-SUD
        </text>

        {/* Est */}
        <path
          d="M420,340 L480,360 L540,330 L560,400 L500,440 L440,420 Z"
          fill={getRegionColor("Est")}
          stroke="#1B2838"
          strokeWidth={hoveredRegion === "Est" ? 2.5 : 1.5}
          className="cursor-pointer transition-all duration-200"
          onMouseEnter={() => setHoveredRegion("Est")}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick?.("Est")}
        />
        <text x="500" y="390" textAnchor="middle" className="text-[10px] font-semibold fill-institutional-navy pointer-events-none">
          EST
        </text>

        {/* Sud-Ouest */}
        <path
          d="M100,340 L200,320 L220,400 L180,480 L100,460 L60,400 Z"
          fill={getRegionColor("Sud-Ouest")}
          stroke="#1B2838"
          strokeWidth={hoveredRegion === "Sud-Ouest" ? 2.5 : 1.5}
          className="cursor-pointer transition-all duration-200"
          onMouseEnter={() => setHoveredRegion("Sud-Ouest")}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick?.("Sud-Ouest")}
        />
        <text x="150" y="400" textAnchor="middle" className="text-[9px] font-semibold fill-institutional-navy pointer-events-none">
          SUD-OUEST
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredRegion && (
        <div
          className="fixed pointer-events-none z-50 bg-institutional-navy text-white px-3 py-2 rounded-lg shadow-xl text-sm"
          style={{
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 12,
          }}
        >
          <p className="font-semibold">{hoveredRegion}</p>
          <p className="text-xs text-gold-accent">
            {regionData.find((r) => r.name === hoveredRegion)?.label || ""}
          </p>
        </div>
      )}
    </div>
  )
}
