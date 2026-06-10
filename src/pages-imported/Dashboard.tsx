// @ts-nocheck
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, Users, Package, Receipt, TrendingUp,
  Clock, Zap, FileText, ClipboardCheck, ArrowRight, Bell, CheckCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '@/components/imported/StatCard';
import ComplianceGauge from '@/components/imported/ComplianceGauge';
import StatusBadge from '@/components/imported/StatusBadge';

const salesData = [
  { month: 'Jan', ventes: 145, objectif: 150 },
  { month: 'Fév', ventes: 132, objectif: 150 },
  { month: 'Mar', ventes: 168, objectif: 160 },
  { month: 'Avr', ventes: 189, objectif: 170 },
  { month: 'Mai', ventes: 201, objectif: 180 },
  { month: 'Juin', ventes: 175, objectif: 190 },
];

const recentAlerts = [
  { id: 1, type: 'warning' as const, message: 'Rappel: Rapportage T2 2026 à soumettre avant le 15/07/2026', date: '08/06/2026' },
  { id: 2, type: 'danger' as const, message: '3 transactions suspectes nécessitent votre attention', date: '07/06/2026' },
  { id: 3, type: 'info' as const, message: 'Nouveaux modèles interdits publiés par le Ministère', date: '05/06/2026' },
  { id: 4, type: 'success' as const, message: 'Audit interne du mois de mai validé - Score 87%', date: '03/06/2026' },
];

const activities = [
  { id: 1, user: 'Amadou Kaboré', action: 'a validé le rapportage T1 2026', time: 'Il y a 2 heures', icon: CheckCircle, color: 'text-success-500' },
  { id: 2, user: 'Fatima Sanou', action: 'a enregistré 5 nouveaux véhicules', time: 'Il y a 4 heures', icon: Package, color: 'text-info-500' },
  { id: 3, user: 'Ibrahim Bamba', action: 'a complété une vente - Client: Jean Zongo', time: 'Il y a 6 heures', icon: Receipt, color: 'text-terracotta-500' },
  { id: 4, user: 'Mariama Ouédraogo', action: 'a signalé un problème de conformité', time: 'Il y a 8 heures', icon: AlertTriangle, color: 'text-warning-500' },
  { id: 5, user: 'Système', action: 'Mise à jour des listes de modèles interdits', time: 'Il y a 12 heures', icon: Bell, color: 'text-navy-500' },
];

const modules = [
  { title: 'Acteurs Économiques', desc: '24 acteurs enregistrés', icon: Users, color: 'bg-info-100 text-info-500', path: '/actors' },
  { title: 'Stocks et Inventaire', desc: '156 véhicules en stock', icon: Package, color: 'bg-warning-100 text-warning-500', path: '/inventory' },
  { title: 'Rapportage', desc: 'T2 2026 en cours', icon: FileText, color: 'bg-success-100 text-success-500', path: '/reporting' },
  { title: 'Conformité', desc: 'Score: 87/150', icon: ClipboardCheck, color: 'bg-terracotta-100 text-terracotta-500', path: '/audit' },
];

function CountdownTimer() {
  const targetDate = new Date('2026-07-15T23:59:59');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) { setExpired(true); clearInterval(interval); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (expired) return <span className="text-danger-500 font-bold animate-pulse-soft">DÉLAI EXPIRÉ</span>;

  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-2 font-mono text-xl font-bold text-terracotta-500">
      <div className="text-center"><div>{pad(timeLeft.days)}</div><div className="text-[10px] text-navy-500 font-medium uppercase">Jours</div></div>
      <span className="text-navy-300">:</span>
      <div className="text-center"><div>{pad(timeLeft.hours)}</div><div className="text-[10px] text-navy-500 font-medium uppercase">Heures</div></div>
      <span className="text-navy-300">:</span>
      <div className="text-center"><div>{pad(timeLeft.minutes)}</div><div className="text-[10px] text-navy-500 font-medium uppercase">Min</div></div>
      <span className="text-navy-300">:</span>
      <div className="text-center"><div>{pad(timeLeft.seconds)}</div><div className="text-[10px] text-navy-500 font-medium uppercase">Sec</div></div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-navy p-8 text-white"
      >
        <div className="relative z-10">
          <h2 className="text-2xl font-dm-sans font-bold mb-2">Bonjour, Amadou Kaboré</h2>
          <p className="text-navy-300 max-w-xl">Bienvenue sur iReg Moto BF. Voici un aperçu de votre conformité réglementaire et de vos activités.</p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
          <ShieldCheck className="w-24 h-24 text-white/5" />
        </div>
      </motion.div>

      {/* Top Row: Gauge + Countdown + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card-base p-6 flex flex-col items-center justify-center"
        >
          <h3 className="text-sm font-semibold text-navy-700 dark:text-dm-text-secondary mb-4 uppercase tracking-wide">Conformité Globale</h3>
          <ComplianceGauge percentage={87} size="lg" label="Score 2026" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="card-base p-6 flex flex-col items-center justify-center"
        >
          <h3 className="text-sm font-semibold text-navy-700 dark:text-dm-text-secondary mb-4 uppercase tracking-wide">Compte à Rebours - Rapportage T2</h3>
          <CountdownTimer />
          <p className="text-xs text-navy-500 dark:text-dm-text-secondary mt-3 text-center">Date limite: 15/07/2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card-base p-6"
        >
          <h3 className="text-sm font-semibold text-navy-700 dark:text-dm-text-secondary mb-4 uppercase tracking-wide">Actions Rapides</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary hover:bg-navy-100 dark:hover:bg-dm-border transition-colors text-left">
              <FileText className="w-5 h-5 text-terracotta-500" />
              <div>
                <p className="text-sm font-medium text-navy-800 dark:text-dm-text-primary">Soumettre le rapportage T2</p>
                <p className="text-xs text-navy-500 dark:text-dm-text-secondary">7 étapes restantes</p>
              </div>
              <ArrowRight className="w-4 h-4 text-navy-400 ml-auto" />
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary hover:bg-navy-100 dark:hover:bg-dm-border transition-colors text-left">
              <Package className="w-5 h-5 text-info-500" />
              <div>
                <p className="text-sm font-medium text-navy-800 dark:text-dm-text-primary">Enregistrer un nouveau véhicule</p>
                <p className="text-xs text-navy-500 dark:text-dm-text-secondary">Scan QR ou saisie manuelle</p>
              </div>
              <ArrowRight className="w-4 h-4 text-navy-400 ml-auto" />
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary hover:bg-navy-100 dark:hover:bg-dm-border transition-colors text-left">
              <Receipt className="w-5 h-5 text-success-500" />
              <div>
                <p className="text-sm font-medium text-navy-800 dark:text-dm-text-primary">Nouvelle vente</p>
                <p className="text-xs text-navy-500 dark:text-dm-text-secondary">Assistant 4 étapes</p>
              </div>
              <ArrowRight className="w-4 h-4 text-navy-400 ml-auto" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Package} iconBg="bg-info-100" iconColor="text-info-500" value="156" label="Véhicules en stock" trend={12} delay={0} />
        <StatCard icon={Users} iconBg="bg-success-100" iconColor="text-success-500" value="1,247" label="Clients enregistrés" trend={8} delay={1} />
        <StatCard icon={Receipt} iconBg="bg-terracotta-100" iconColor="text-terracotta-500" value="892" label="Ventes ce trimestre" trend={-3} delay={2} />
        <StatCard icon={ShieldCheck} iconBg="bg-warning-100" iconColor="text-warning-500" value="87%" label="Score de conformité" trend={5} delay={3} />
      </div>

      {/* Charts + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="card-base p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Évolution des Ventes</h3>
              <p className="text-xs text-navy-500 dark:text-dm-text-secondary mt-1">Janvier - Juin 2026</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-terracotta-500" />
                <span className="text-navy-600 dark:text-dm-text-secondary">Ventes réelles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-navy-300" />
                <span className="text-navy-600 dark:text-dm-text-secondary">Objectif</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B85C38" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#B85C38" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="ventes" stroke="#B85C38" strokeWidth={2} fill="url(#colorVentes)" name="Ventes" />
                <Area type="monotone" dataKey="objectif" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Objectif" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="card-base p-6"
        >
          <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Alertes Récentes</h3>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary">
                <StatusBadge status={alert.type} label="" showIcon className="flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-navy-800 dark:text-dm-text-primary leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] text-navy-500 dark:text-dm-text-secondary mt-1">{alert.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity + Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="card-base p-6"
        >
          <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Activité Récente</h3>
          <div className="space-y-4">
            {activities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy-100 dark:bg-dm-bg-tertiary flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-4 h-4 ${act.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-navy-800 dark:text-dm-text-primary">
                      <span className="font-semibold">{act.user}</span> {act.action}
                    </p>
                    <p className="text-xs text-navy-500 dark:text-dm-text-secondary mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {act.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="card-base p-6"
        >
          <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Accès Rapide Modules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modules.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.a
                  key={mod.title}
                  href={mod.path}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-navy-50 dark:bg-dm-bg-tertiary hover:bg-navy-100 dark:hover:bg-dm-border transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-lg ${mod.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-800 dark:text-dm-text-primary truncate">{mod.title}</p>
                    <p className="text-xs text-navy-500 dark:text-dm-text-secondary">{mod.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-navy-400 group-hover:text-terracotta-500 transition-colors ml-auto flex-shrink-0" />
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
