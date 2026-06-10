import { CheckCircle, AlertTriangle, XCircle, Info, Minus } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  label?: string;
  showIcon?: boolean;
  className?: string;
}

const config = {
  success: { class: 'badge-success', icon: CheckCircle },
  warning: { class: 'badge-warning', icon: AlertTriangle },
  danger: { class: 'badge-danger', icon: XCircle },
  info: { class: 'badge-info', icon: Info },
  neutral: { class: 'badge-neutral', icon: Minus },
};

const labels: Record<string, string> = {
  success: 'Conforme',
  warning: 'Partiel',
  danger: 'Non conforme',
  info: 'Info',
  neutral: 'Neutre',
};

export default function StatusBadge({ status, label, showIcon = true, className = '' }: StatusBadgeProps) {
  const { class: badgeClass, icon: Icon } = config[status];
  return (
    <span className={`${badgeClass} ${className}`}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {label || labels[status]}
    </span>
  );
}
