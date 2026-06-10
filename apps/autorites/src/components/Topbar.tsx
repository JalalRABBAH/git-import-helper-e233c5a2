import { useState } from "react"
import { Search, Bell, Moon, Sun, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function Topbar() {
  const [isDark, setIsDark] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-institutional-navy border-b border-border-default dark:border-border-dark z-40 flex items-center px-4 lg:px-6 gap-4">
      {/* Left: Official branding */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bf-badge-gradient flex items-center justify-center">
          <span className="text-white font-playfair-display font-bold text-xs">BF</span>
        </div>
        <div className="hidden lg:block">
          <h1 className="font-playfair-display font-semibold text-base text-text-primary dark:text-text-dark-primary leading-tight">
            République du Burkina Faso
          </h1>
          <p className="text-xs text-text-muted dark:text-text-dark-muted">
            Ministère du Commerce — iReg Moto BF
          </p>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center max-w-xl mx-auto">
        <div className="relative w-full max-w-[360px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Rechercher..."
            className={cn(
              "w-full h-10 pl-10 pr-4 rounded-full bg-bg-elevated dark:bg-institutional-navy-light",
              "border border-transparent focus:border-gold-accent focus:ring-[3px] focus:ring-gold-accent/15",
              "text-sm text-text-primary dark:text-text-dark-primary placeholder:text-text-muted",
              "outline-none transition-all"
            )}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => {}}
        >
          <Bell size={20} className="text-text-secondary dark:text-text-dark-secondary" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-critical rounded-full" />
        </Button>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? (
            <Sun size={20} className="text-gold-accent" />
          ) : (
            <Moon size={20} className="text-text-secondary" />
          )}
        </Button>

        {/* User */}
        <div className="flex items-center gap-2 pl-2 border-l border-border-default dark:border-border-dark">
          <div className="w-8 h-8 rounded-full bg-institutional-navy flex items-center justify-center text-white text-xs font-semibold">
            <User size={16} />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary leading-tight">
              Admin
            </p>
            <p className="text-[11px] text-text-muted dark:text-text-dark-muted">
              Min. Commerce
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
