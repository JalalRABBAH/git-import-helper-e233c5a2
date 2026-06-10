import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Building2,
  FileCheck,
  ClipboardCheck,
  Calendar,
  ShieldAlert,
  Ban,
  BookOpen,
  Settings,
  ChevronDown,
  ChevronRight,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

interface NavSection {
  title: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: "Surveillance",
    items: [
      { label: "Tableau de Bord", path: "/", icon: <LayoutDashboard size={20} /> },
      { label: "Analytiques", path: "/analytics", icon: <BarChart3 size={20} /> },
      { label: "Rapports Nationaux", path: "/national-reports", icon: <FileText size={20} /> },
    ],
  },
  {
    title: "Opérations",
    items: [
      { label: "Acteurs Économiques", path: "/actors", icon: <Building2 size={20} /> },
      { label: "Agréments", path: "/agreements", icon: <FileCheck size={20} /> },
      { label: "Inspections", path: "/inspections", icon: <ClipboardCheck size={20} /> },
      { label: "Rapports Trim.", path: "/quarterly-reports", icon: <Calendar size={20} /> },
    ],
  },
  {
    title: "Régulation",
    items: [
      { label: "Fraude", path: "/fraud", icon: <ShieldAlert size={20} /> },
      { label: "Interdictions", path: "/prohibitions", icon: <Ban size={20} /> },
      { label: "Publications", path: "/publications", icon: <BookOpen size={20} /> },
    ],
  },
  {
    title: "Système",
    items: [
      { label: "Administration", path: "/admin", icon: <Settings size={20} /> },
    ],
  },
]

export default function Sidebar() {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-[280px] bg-institutional-navy border-r border-border-dark overflow-y-auto z-30 shadow-[4px_0_24px_rgba(0,0,0,0.08)]">
      <div className="p-4">
        <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-lg bg-institutional-navy-light border border-institutional-navy-lighter">
          <div className="w-10 h-10 rounded-full bf-badge-gradient flex items-center justify-center shrink-0">
            <Shield size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-playfair-display font-semibold text-sm truncate">
              iReg Moto BF
            </p>
            <p className="text-text-dark-muted text-xs truncate">Portail Administratif</p>
          </div>
        </div>

        {sections.map((section) => {
          const isCollapsed = collapsedSections[section.title]
          return (
            <div key={section.title} className="mb-2">
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium uppercase tracking-wider text-[#5C6B7A] hover:text-text-dark-secondary transition-colors"
              >
                <span>{section.title}</span>
                {isCollapsed ? (
                  <ChevronRight size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>

              {!isCollapsed && (
                <nav className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                          isActive
                            ? "bg-gold-accent-10 text-gold-accent border-l-[3px] border-gold-accent"
                            : "text-text-dark-secondary hover:bg-white/[0.04] border-l-[3px] border-transparent"
                        )
                      }
                    >
                      <span
                        className={cn(
                          "transition-colors",
                          "text-[#8899AA] group-hover:text-text-dark-secondary"
                        )}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              )}
            </div>
          )
        })}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-dark bg-institutional-navy">
        <div className="flex items-center gap-2 text-xs text-text-dark-muted">
          <div className="w-2 h-2 rounded-full bg-status-compliant animate-pulse" />
          <span>Système opérationnel</span>
        </div>
        <p className="text-[10px] text-text-dark-muted mt-1 pl-4">v2.4.1 — Build 2026.06.05</p>
      </div>
    </aside>
  )
}
