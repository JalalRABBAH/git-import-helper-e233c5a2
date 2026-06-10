import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Users,
  Receipt,
  FileText,
  ClipboardCheck,
  ShieldAlert,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Bike,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Tableau de Bord", path: "/dashboard" },
  { icon: Package, label: "Stocks et Inventaire", path: "/inventory" },
  { icon: Users, label: "Clientèle", path: "/customers" },
  { icon: Receipt, label: "Gestion Commerciale", path: "/commercial" },
  { icon: FileText, label: "Rapportage Trimestriel", path: "/reporting" },
  { icon: ClipboardCheck, label: "Conformité et Audit", path: "/audit" },
  { icon: ShieldAlert, label: "Sécurité et Alertes", path: "/security" },
  { icon: Settings, label: "Paramètres", path: "/settings" },
  { icon: HelpCircle, label: "Aide et Support", path: "/help" },
] as const;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useLocation({ select: (s) => s.pathname });

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen bg-navy-900 z-50 flex flex-col overflow-hidden"
    >
      <div className="h-16 flex items-center px-4 border-b border-navy-700/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-warm flex items-center justify-center shrink-0">
            <Bike className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: 0.15 }}
                className="flex items-baseline gap-1 overflow-hidden"
              >
                <span className="text-lg font-dm-sans font-bold text-white whitespace-nowrap">iReg</span>
                <span className="text-lg font-dm-sans font-bold text-gold-400 whitespace-nowrap">Moto BF</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative ${
                isActive
                  ? "bg-navy-800 text-terracotta-500"
                  : "text-navy-400 hover:text-navy-100 hover:bg-navy-800"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-terracotta-500 rounded-r-full"
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon className="w-5 h-5 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, delay: 0.1 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-navy-700/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-navy-400 hover:text-navy-100 hover:bg-navy-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium"
              >
                Réduire
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <div className="mt-2 flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-warm flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">AK</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">Amadou Kaboré</p>
                <p className="text-xs text-navy-400 truncate">Administrateur</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
