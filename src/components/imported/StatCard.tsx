import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  trend?: number;
  delay?: number;
}

export default function StatCard({ icon: Icon, iconBg, iconColor, value, label, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: delay * 0.06, ease: [0.4, 0, 0.2, 1] }}
      className="card-base p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-xs font-medium ${trend > 0 ? 'text-success-500' : trend < 0 ? 'text-danger-500' : 'text-navy-500'}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : trend < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="font-dm-sans text-4xl font-extrabold tracking-tight text-navy-900 dark:text-dm-text-primary mb-1">
        {value}
      </div>
      <div className="text-sm text-navy-500 dark:text-dm-text-secondary">{label}</div>
    </motion.div>
  );
}
