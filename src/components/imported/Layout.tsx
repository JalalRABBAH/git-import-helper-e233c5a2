import { useState, useEffect } from "react";
import { Outlet, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  const pathname = useLocation({ select: (s) => s.pathname });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ireg-dark-mode");
      if (stored !== null) return stored === "true";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("ireg-dark-mode", String(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-navy-50 dark:bg-dm-bg-primary transition-colors duration-300">
        <Sidebar />
        <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
          <Topbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <main className="flex-1 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.05 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
