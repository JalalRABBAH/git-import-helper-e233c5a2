import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Search, Bell, Sun, Moon, ChevronDown } from "lucide-react";

const routeNames: Record<string, string> = {
  "/dashboard": "Tableau de Bord",
  "/inventory": "Stocks et Inventaire",
  "/customers": "Clientèle et Traçabilité",
  "/commercial": "Gestion Commerciale",
  "/reporting": "Rapportage Trimestriel",
  "/audit": "Conformité et Audit",
  "/security": "Sécurité et Alertes",
  "/settings": "Paramètres",
  "/help": "Aide et Support",
};

interface TopbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Topbar({ darkMode, toggleDarkMode }: TopbarProps) {
  const pathname = useLocation({ select: (s) => s.pathname });
  const [searchValue, setSearchValue] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const pageTitle = routeNames[pathname] || "iReg Moto BF";

  return (
    <header className="h-16 bg-white dark:bg-dm-bg-secondary border-b border-navy-200 dark:border-dm-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <nav className="text-xs text-navy-500 dark:text-dm-text-secondary flex items-center gap-1.5">
          <span>iReg Moto BF</span>
          <span>/</span>
          <span className="text-navy-700 dark:text-dm-text-primary font-medium">{pageTitle}</span>
        </nav>
        <h1 className="text-lg font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary leading-tight">
          {pageTitle}
        </h1>
      </div>

      <div className="hidden md:flex items-center">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-navy-300 dark:border-dm-border bg-white dark:bg-dm-bg-tertiary text-sm text-navy-900 dark:text-dm-text-primary focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 outline-hidden transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="hidden lg:flex items-center gap-1.5 h-10 px-3 rounded-lg border border-navy-300 dark:border-dm-border text-sm text-navy-700 dark:text-dm-text-secondary hover:bg-navy-50 dark:hover:bg-dm-bg-tertiary transition-colors">
          <span className="text-base">🇧🇫</span>
          <span className="font-medium">FR</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-10 h-10 rounded-lg border border-navy-300 dark:border-dm-border flex items-center justify-center text-navy-600 dark:text-dm-text-secondary hover:bg-navy-50 dark:hover:bg-dm-bg-tertiary transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-dm-bg-secondary rounded-xl shadow-lg border border-navy-200 dark:border-dm-border p-4 z-50">
              <h3 className="text-sm font-semibold text-navy-900 dark:text-dm-text-primary mb-2">
                Notifications
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-warning-50 dark:bg-dm-bg-tertiary">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-warning-500 shrink-0" />
                  <p className="text-xs text-navy-700 dark:text-dm-text-secondary">
                    Rappel: Rapportage T2 2026 à soumettre avant le 15/07/2026
                  </p>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-danger-50 dark:bg-dm-bg-tertiary">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-danger-500 shrink-0" />
                  <p className="text-xs text-navy-700 dark:text-dm-text-secondary">
                    Alerte: 3 transactions suspectes détectées ce mois
                  </p>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-info-50 dark:bg-dm-bg-tertiary">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-info-500 shrink-0" />
                  <p className="text-xs text-navy-700 dark:text-dm-text-secondary">
                    Mise à jour: Nouveaux modèles interdits publiés par le Ministère
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-lg border border-navy-300 dark:border-dm-border flex items-center justify-center text-navy-600 dark:text-dm-text-secondary hover:bg-navy-50 dark:hover:bg-dm-bg-tertiary transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-warm flex items-center justify-center cursor-pointer">
          <span className="text-sm font-bold text-white">AK</span>
        </div>
      </div>
    </header>
  );
}
