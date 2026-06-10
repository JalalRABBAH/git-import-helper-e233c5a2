import { useState } from "react"
import {
  Building2,
  Bike,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  MapPin,
  BarChart3,
} from "lucide-react"
import StatCard from "@/components/StatCard"
import StatusBadge from "@/components/StatusBadge"
import BurkinaMap from "@/components/BurkinaMap"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/utils"

const monthlyData = [
  { month: "Juil. 24", conformite: 72, ventes: 10420 },
  { month: "Août", conformite: 75, ventes: 11250 },
  { month: "Sept.", conformite: 74, ventes: 10890 },
  { month: "Oct.", conformite: 78, ventes: 12560 },
  { month: "Nov.", conformite: 80, ventes: 13100 },
  { month: "Déc.", conformite: 82, ventes: 14200 },
  { month: "Janv. 25", conformite: 85, ventes: 13800 },
  { month: "Févr.", conformite: 83, ventes: 12900 },
  { month: "Mars", conformite: 87, ventes: 14500 },
  { month: "Avr.", conformite: 88, ventes: 15200 },
  { month: "Mai", conformite: 90, ventes: 14800 },
  { month: "Juin", conformite: 92, ventes: 15647 },
]

const regionTableData = [
  { region: "Centre", entreprises: 48, ventes: 42380, conformite: 94, alertes: 3 },
  { region: "Hauts-Bassins", entreprises: 32, ventes: 28560, conformite: 91, alertes: 5 },
  { region: "Centre-Ouest", entreprises: 18, ventes: 11240, conformite: 87, alertes: 7 },
  { region: "Est", entreprises: 15, ventes: 9870, conformite: 84, alertes: 9 },
  { region: "Plateau-Central", entreprises: 12, ventes: 9230, conformite: 89, alertes: 4 },
  { region: "Boucle du Mouhoun", entreprises: 11, ventes: 8450, conformite: 82, alertes: 11 },
  { region: "Centre-Est", entreprises: 10, ventes: 7890, conformite: 85, alertes: 8 },
  { region: "Nord", entreprises: 9, ventes: 7890, conformite: 79, alertes: 14 },
  { region: "Cascades", entreprises: 8, ventes: 5230, conformite: 88, alertes: 5 },
  { region: "Sud-Ouest", entreprises: 7, ventes: 5357, conformite: 86, alertes: 6 },
  { region: "Centre-Sud", entreprises: 6, ventes: 6340, conformite: 90, alertes: 4 },
  { region: "Centre-Nord", entreprises: 6, ventes: 6750, conformite: 81, alertes: 12 },
  { region: "Sahel", entreprises: 4, ventes: 4560, conformite: 77, alertes: 15 },
]

const anomalyCards = [
  {
    id: "ANM-2026-0847",
    title: "Volume anormal — Faso Moto SARL",
    description: "Déclaration 3.2× supérieure à la moyenne trimestrielle. Écart détecté par ML.",
    confidence: 97,
    severity: "critical" as const,
    date: "05/06/2026",
    type: "Volume",
  },
  {
    id: "ANM-2026-0843",
    title: "Fréquence suspecte — Burkina Wheels SA",
    description: "5 déclarations en 48h pour un même point de vente. Pattern irrégulier.",
    confidence: 94,
    severity: "warning" as const,
    date: "04/06/2026",
    type: "Fréquence",
  },
  {
    id: "ANM-2026-0838",
    title: "Incohérence géographique — Sahel Motos",
    description: "Déclaration depuis une zone non couverte par l'agrément.",
    confidence: 91,
    severity: "critical" as const,
    date: "03/06/2026",
    type: "Géographie",
  },
  {
    id: "ANM-2026-0831",
    title: "Retard cumulé — Bobo Moto Plus",
    description: "3 rapports trimestriels consécutifs en retard. Score de risque élevé.",
    confidence: 88,
    severity: "warning" as const,
    date: "01/06/2026",
    type: "Retard",
  },
  {
    id: "ANM-2026-0825",
    title: "Anomalie prix — Koudouglou Motos",
    description: "Prix moyen déclaré 45% inférieur au marché. Potentiel sous-déclaration.",
    confidence: 85,
    severity: "info" as const,
    date: "30/05/2026",
    type: "Prix",
  },
]

const alerts = [
  { id: 1, message: "Non-conformité critique — Sahel Motos Distribution (Nord)", time: "Il y a 12 min", severity: "critical" as const },
  { id: 2, message: "Rapport trimestriel Q2 2026 en retard — 4 entreprises", time: "Il y a 34 min", severity: "warning" as const },
  { id: 3, message: "Suspicion fraude fiscale — CNTI signal #4821", time: "Il y a 1h", severity: "critical" as const },
  { id: 4, message: "Nouveau modèle interdit détecté en circulation", time: "Il y a 2h", severity: "warning" as const },
  { id: 5, message: "Mise à jour seuil OHADA — application 15/06", time: "Il y a 3h", severity: "info" as const },
]

const activityFeed = [
  { id: 1, action: "Inspection complétée", target: "Faso Moto SARL — Ouagadougou", user: "Insp. Kaboré", time: "Il y a 8 min", icon: CheckCircle, iconColor: "text-status-compliant" },
  { id: 2, action: "Agrément approuvé", target: "Nouvelle demande #AGR-2026-0142", user: "Direction", time: "Il y a 25 min", icon: CheckCircle, iconColor: "text-status-compliant" },
  { id: 3, action: "Alerte ML générée", target: "Anomalie #ANM-2026-0847", user: "Système", time: "Il y a 42 min", icon: AlertCircle, iconColor: "text-status-critical" },
  { id: 4, action: "Rapport trimestriel soumis", target: "Burkina Wheels SA — Q2 2026", user: "Entreprise", time: "Il y a 1h", icon: BarChart3, iconColor: "text-status-info" },
  { id: 5, action: "Contrôle en cours", target: "Bobo Moto Plus — Bobo-Dioulasso", user: "Insp. Ouedraogo", time: "Il y a 1h 30", icon: Activity, iconColor: "text-status-warning" },
  { id: 6, action: "Publication réglementaire", target: "Arrêté 05/06/2026 — Modèles interdits", user: "Secrétariat", time: "Il y a 2h", icon: CheckCircle, iconColor: "text-status-compliant" },
  { id: 7, action: "Connexion CNTI", target: "Synchronisation données douanières", user: "CNTI", time: "Il y a 3h", icon: Activity, iconColor: "text-status-info" },
  { id: 8, action: "Inspection programmée", target: "Sahel Motos — Dori", user: "Planification", time: "Il y a 4h", icon: Clock, iconColor: "text-text-muted" },
]

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair-display text-3xl font-bold text-text-primary">
            Tableau de Bord National
          </h1>
          <p className="text-text-muted mt-1">
            Vue consolidée du secteur des deux-roues motorisés — Burkina Faso
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Clock size={16} />
          <span>Dernière mise à jour : 05/06/2026 à 14:32</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard
          title="Entreprises agréées"
          value={187}
          suffix=""
          icon={<Building2 size={24} />}
          iconBg="rgba(58,124,199,0.12)"
          iconColor="#3A7CC7"
          trend={4.2}
          trendLabel="vs 2024"
        />
        <StatCard
          title="Ventes 2025 (cumul)"
          value={156747}
          suffix=""
          icon={<Bike size={24} />}
          iconBg="rgba(46,139,87,0.12)"
          iconColor="#2E8B57"
          trend={8.7}
          trendLabel="vs 2024"
        />
        <StatCard
          title="Taux de conformité"
          value={87.3}
          suffix="%"
          icon={<ShieldCheck size={24} />}
          iconBg="rgba(201,150,59,0.12)"
          iconColor="#C9963B"
          trend={12.4}
          trendLabel="vs 2024"
          decimals={1}
        />
        <StatCard
          title="Alertes actives"
          value={23}
          suffix=""
          icon={<AlertTriangle size={24} />}
          iconBg="rgba(199,62,62,0.12)"
          iconColor="#C73E3E"
          trend={-15.2}
          trendLabel="vs mois dernier"
        />
        <StatCard
          title="Croissance secteur"
          value={12.8}
          suffix="%"
          icon={<TrendingUp size={24} />}
          iconBg="rgba(124,92,201,0.12)"
          iconColor="#7C5CC9"
          trend={3.1}
          trendLabel="vs prévision"
          decimals={1}
        />
      </div>

      {/* Main content: Map + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Card */}
        <div className="lg:col-span-2 bg-white rounded-xl card-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-playfair-display text-xl font-semibold text-text-primary">
                Carte des Ventes par Région
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                {selectedRegion ? `Région sélectionnée : ${selectedRegion}` : "Cliquez sur une région pour les détails"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm" style={{ background: "#E8F0FE" }} />
                <span>Faible</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm" style={{ background: "#7BAFD4" }} />
                <span>Moyen</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm" style={{ background: "#1B4F8F" }} />
                <span>Élevé</span>
              </div>
            </div>
          </div>
          <BurkinaMap
            onRegionClick={setSelectedRegion}
            className="h-[420px]"
          />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Compliance Trend */}
          <div className="bg-white rounded-xl card-shadow p-5">
            <h3 className="font-playfair-display text-lg font-semibold text-text-primary mb-4">
              Tendance Conformité (12 mois)
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F4" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #DDE3E8",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="conformite"
                  stroke="#C9963B"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#C9963B" }}
                  activeDot={{ r: 5 }}
                  name="Conformité %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white rounded-xl card-shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair-display text-lg font-semibold text-text-primary">
                Alertes Critiques
              </h3>
              <StatusBadge variant="critical">{alerts.length} active{alerts.length > 1 ? "s" : ""}</StatusBadge>
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-bg-elevated hover:bg-status-critical-bg/30 transition-colors cursor-pointer"
                >
                  <AlertTriangle
                    size={16}
                    className={cn(
                      "shrink-0 mt-0.5",
                      alert.severity === "critical" ? "text-status-critical" : alert.severity === "warning" ? "text-status-warning" : "text-status-info"
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-text-primary leading-snug">{alert.message}</p>
                    <p className="text-xs text-text-muted mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Regional Table */}
      <div className="bg-white rounded-xl card-shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-playfair-display text-xl font-semibold text-text-primary">
            Répartition Régionale
          </h3>
          <button className="text-sm text-gold-accent hover:text-gold-accent-hover font-medium flex items-center gap-1">
            Voir tout <ChevronRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Région</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Entreprises</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Ventes 2025</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Conformité</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Alertes</th>
              </tr>
            </thead>
            <tbody>
              {regionTableData.map((row) => (
                <tr
                  key={row.region}
                  className={cn(
                    "border-b border-border-subtle last:border-0 hover:bg-bg-elevated/50 transition-colors",
                    selectedRegion === row.region && "bg-gold-accent-10"
                  )}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-text-muted" />
                      <span className="font-medium">{row.region}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-jetbrains-mono">{row.entreprises}</td>
                  <td className="text-right py-3 px-4 font-jetbrains-mono">{formatNumber(row.ventes)}</td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-bg-elevated rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            row.conformite >= 90 ? "bg-status-compliant" : row.conformite >= 80 ? "bg-status-warning" : "bg-status-critical"
                          )}
                          style={{ width: `${row.conformite}%` }}
                        />
                      </div>
                      <span className="font-jetbrains-mono text-xs">{row.conformite}%</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4">
                    <StatusBadge
                      variant={row.alertes >= 10 ? "critical" : row.alertes >= 6 ? "warning" : "compliant"}
                    >
                      {row.alertes}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom row: Anomalies + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Anomaly Cards */}
        <div className="bg-white rounded-xl card-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-playfair-display text-xl font-semibold text-text-primary">
              Détection Anomalies ML
            </h3>
            <StatusBadge variant="info">5 détections</StatusBadge>
          </div>
          <div className="space-y-3">
            {anomalyCards.map((anomaly) => (
              <div
                key={anomaly.id}
                className="p-4 rounded-lg border border-border-subtle hover:border-gold-accent/30 transition-all hover:translate-y-[-1px] hover:shadow-sm cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-jetbrains-mono text-text-muted">{anomaly.id}</span>
                    <StatusBadge
                      variant={anomaly.severity === "critical" ? "critical" : anomaly.severity === "warning" ? "warning" : "info"}
                      className="text-[10px] h-5 px-2"
                    >
                      {anomaly.type}
                    </StatusBadge>
                  </div>
                  <span className="text-xs text-text-muted">{anomaly.date}</span>
                </div>
                <p className="text-sm font-medium text-text-primary mb-1">{anomaly.title}</p>
                <p className="text-xs text-text-muted mb-3">{anomaly.description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        anomaly.confidence >= 95 ? "bg-status-critical" : anomaly.confidence >= 90 ? "bg-status-warning" : "bg-status-info"
                      )}
                      style={{ width: `${anomaly.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-jetbrains-mono font-semibold">{anomaly.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl card-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-playfair-display text-xl font-semibold text-text-primary">
              Activité en Temps Réel
            </h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-status-compliant animate-pulse" />
              <span className="text-xs text-text-muted">En direct</span>
            </div>
          </div>
          <div className="space-y-0">
            {activityFeed.map((item, idx) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 py-3",
                  idx < activityFeed.length - 1 && "border-b border-border-subtle"
                )}
              >
                <div className={cn("mt-0.5 shrink-0", item.iconColor)}>
                  <item.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{item.action}</span>
                    <span className="text-text-muted"> — </span>
                    <span>{item.target}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-muted">{item.user}</span>
                    <span className="text-[10px] text-border-default">•</span>
                    <span className="text-xs text-text-muted">{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
