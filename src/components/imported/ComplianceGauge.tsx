import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ComplianceGaugeProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showLabel?: boolean;
  delay?: number;
}

const sizeMap = {
  sm: { w: 48, stroke: 5, font: 'text-sm' },
  md: { w: 80, stroke: 8, font: 'text-xl' },
  lg: { w: 120, stroke: 10, font: 'text-3xl' },
};

export default function ComplianceGauge({ percentage, size = 'md', label, showLabel = true, delay = 0 }: ComplianceGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const { w, stroke, font } = sizeMap[size];
  const radius = (w - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  const color = percentage >= 80 ? '#2D8A4E' : percentage >= 50 ? '#D4941A' : '#C0392B';

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        start = Math.round(eased * percentage);
        setAnimatedValue(start);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: w, height: w }}>
        <svg width={w} height={w} className="transform -rotate-90">
          <circle
            cx={w / 2} cy={w / 2} r={radius}
            fill="none" stroke="#E2E8F0" strokeWidth={stroke}
            className="dark:stroke-dm-border"
          />
          <motion.circle
            cx={w / 2} cy={w / 2} r={radius}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, delay: delay / 1000, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-dm-sans font-extrabold ${font} text-navy-900 dark:text-dm-text-primary`}>
            {animatedValue}%
          </span>
        </div>
      </div>
      {showLabel && label && (
        <span className="text-xs text-navy-500 dark:text-dm-text-secondary mt-2 font-medium uppercase tracking-wide">{label}</span>
      )}
    </div>
  );
}
