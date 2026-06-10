import { useState } from "react"
import {
  Activity,
  AlertTriangle,
  Brain,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Filter,
} from "lucide-react"
import StatusBadge from "@/components/StatusBadge"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
} from "recharts"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/utils"

const heatmapData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  anomalies: Math.floor(Math.random() * 8) + (i % 7 === 5 || i % 7 === 6 ? 1 : 3),
  transactions: Math.floor(Math.random() * 500) + 200,
}))

const anomalyTypeData = [
  { name: "Volume", value: 28, color: "#C73E3E" },
  { name: "Fréquence", value: 22, color: "#E8943A" },
  { name: "Géographique", value: 18, color: "#3A7CC7" },
  { name: "Prix", value: 15, color: "#7C5CC9" },
  { name: "Retard", value: 12, color: "#2E8B57" },
  { name: "Autre", value: 5, color: "#8899AA" },
]

const mlAnomalies = [
  { id: "ML-2026-0042", type: "Volume", entity: "Faso Moto SARL", confidence: 97, severity: "critical", description: "Pic de déclarations 4.2× supérieur à la moyenne. Problème potentiel de double-comptage.", date: "05/06/2026" },
  { id: "ML-2026-0041", type: "Fréquence", entity: "Burkina Wheels SA", confidence: 94, severity: "warning", description: "3 déclarations en 2 heures depuis le même IP. Pattern suspect de batch-processing.", date: "04/06/2026" },
  { id: "ML-2026-0040", type: "Géographique", entity: "Sahel Motos Distribution", confidence: 91, severity: "critical", description: "Déclaration depuis coordonnées GPS en dehors du périmètre d'agrément autorisé.", date: "04/06/2026" },
  { id: "ML-2026-0039", type: "Prix", entity: "Koudouglou Motos", confidence: 89, severity: "warning", description: "Prix moyen déclaré 52% sous le marché régional. Risque de sous-facturation.", date: "03/06/2026" },
]

const compliancePredictions = [
  { month: "Juil. 2026", predicted: 89, lower: 84, upper: 94 },
  { month: "Août", predicted: 90, lower: 85, upper: 95 },
  { month: "Sept.", predicted: 91, lower: 86, upper: 95 },
  { month: "Oct.", predicted: 91, lower: 86, upper: 96 },
  { month: "Nov.", predicted: 92, lower: 87, upper: 96 },
  { month: "Déc.", predicted: 93, lower: 88, upper: 97 },
]

const radarData = [
  { subject: "Admin.", TVS: 92, Bajaj: 88, Yamaha: 85, Honda: 90, fullMark: 100 },
  { subject: "Fiscal", TVS: 87, Bajaj: 82, Yamaha: 90, Honda: 86, fullMark: 100 },
  { subject: "Technique", TVS: 90, Bajaj: 85, Yamaha: 88, Honda: 87, fullMark: 100 },
  { subject: "Commercial", TVS: 85, Bajaj: 90, Yamaha: 82, Honda: 88, fullMark: 100 },
  { subject: "Sécurité", TVS: 88, Bajaj: 86, Yamaha: 84, Honda: 92, fullMark: 100 },
  { subject: "Rapports", TVS: 91, Bajaj: 87, Yamaha: 86, Honda: 89, fullMark: 100 },
]

const predictiveAlerts = [
  { id: 1, message: "Risque de non-conformité — Sahel Motos (prédiction 78%)", date: "Prévu dans 15 jours", severity: "warning" as const },
  { id: 2, message: "Retard rapport trimestriel probable — 3 entreprises", date: "Prévu dans 7 jours", severity: "info" as const },
  { id: 3, message: "Pic de ventes attendu — surveillance renforçée", date: "Prévu dans 30 jours", severity: "info" as const },
  { id: 4, message: "Tendance frauduleuse détectée — secteur Nord", date: "En cours d'analyse", severity: "critical" as const },
]

export default function Analytics() {
  const [timeFilter, setTimeFilter] = useState("30d")

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair-display text-3xl font-bold">Analyse et Détection</h1>
          <p className="text-text-muted mt-1">Détection d'anomalies par machine learning — prédictions et analyses</p>
        </div>
        <div className="flex items-center gap-2">
          {["7j", "30j", "3m", "1an"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeFilter(t)}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-medium transition-all",
                timeFilter === t ? "bg-gold-accent text-white" : "bg-white border border-border-default text-text-secondary hover:bg-bg-elevated"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ML Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl card-shadow p-5">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={18} className="text-chart-purple" />
            <span className="text-sm text-text-muted">Anomalies ML (30j)</span>
          </div>
          <p className="font-jetbrains-mono text-3xl font-bold text-text-primary">47</p>
          <div className="flex items-center gap-1 text-xs text-status-critical mt-1">
            <TrendingUp size={12} /> +12% vs période précédente
          </div>
        </div>
        <div className="bg-white rounded-xl card-shadow p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-status-critical" />
            <span className="text-sm text-text-muted">Critiques</span>
          </div>
          <p className="font-jetbrains-mono text-3xl font-bold text-status-critical">8</p>
          <div className="flex items-center gap-1 text-xs text-status-compliant mt-1">
            <TrendingDown size={12} /> -3 vs mois dernier
          </div>
        </div>
        <div className="bg-white rounded-xl card-shadow p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={18} className="text-status-compliant" />
            <span className="text-sm text-text-muted">Précision modèle</span>
          </div>
          <p className="font-jetbrains-mono text-3xl font-bold text-status-compliant">94.2%</p>
          <div className="flex items-center gap-1 text-xs text-status-compliant mt-1">
            <TrendingUp size={12} /> +1.8% ce mois
          </div>
        </div>
        <div className="bg-white rounded-xl card-shadow p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={18} className="text-chart-gold" />
            <span className="text-sm text-text-muted">Traitements/jour</span>
          </div>
          <p className="font-jetbrains-mono text-3xl font-bold text-chart-gold">2,847</p>
          <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
            Transactions analysées
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Heatmap */}
        <div className="bg-white rounded-xl card-shadow p-5">
          <h3 className="font-playfair-display text-lg font-semibold mb-4">Heatmap transactions (Juin 2026)</h3>
          <div className="grid grid-cols-6 gap-1.5">
            {heatmapData.map((d) => (
              <div
                key={d.day}
                className="aspect-square rounded-md flex items-center justify-center text-xs font-medium cursor-pointer transition-all hover:scale-110"
                style={{
                  background: d.anomalies >= 6 ? "#C73E3E" : d.anomalies >= 4 ? "#E8943A" : d.anomalies >= 2 ? "#3A7CC7" : "#2E8B57",
                  color: d.anomalies >= 4 ? "white" : "white",
                }}
                title={`Jour ${d.day}: ${d.anomalies} anomalies, ${d.transactions} transactions`}
              >
                {d.day}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs">
            <span className="text-text-muted">Faible</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-[#2E8B57]" />
              <div className="w-4 h-4 rounded bg-[#3A7CC7]" />
              <div className="w-4 h-4 rounded bg-[#E8943A]" />
              <div className="w-4 h-4 rounded bg-[#C73E3E]" />
            </div>
            <span className="text-text-muted">Élevé</span>
          </div>
        </div>

        {/* Anomaly Type Distribution */}
        <div className="bg-white rounded-xl card-shadow p-5">
          <h3 className="font-playfair-display text-lg font-semibold mb-4">Types d'anomalies</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={anomalyTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                {anomalyTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2">
            {anomalyTypeData.map((d) => (
              <div key={d.name} className="flex items-center gap-1 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-text-muted">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Alerts */}
        <div className="bg-white rounded-xl card-shadow p-5">
          <h3 className="font-playfair-display text-lg font-semibold mb-4">Alertes prédictives</h3>
          <div className="space-y-3">
            {predictiveAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-bg-elevated">
                <AlertTriangle size={16} className={cn("shrink-0 mt-0.5", alert.severity === "critical" ? "text-status-critical" : alert.severity === "warning" ? "text-status-warning" : "text-status-info")} />
                <div>
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-text-muted mt-1">{alert.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ML Anomaly Cards */}
      <div className="bg-white rounded-xl card-shadow p-5">
        <h3 className="font-playfair-display text-xl font-semibold mb-4 flex items-center gap-2">
          <Brain size={22} className="text-chart-purple" />
          Anomalies détectées par ML
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mlAnomalies.map((anomaly) => (
            <div key={anomaly.id} className="p-4 rounded-lg border border-border-subtle hover:border-gold-accent/40 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-jetbrains-mono text-xs text-text-muted">{anomaly.id}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge variant={anomaly.severity === "critical" ? "critical" : "warning"} className="text-[10px] h-5 px-2">
                      {anomaly.type}
                    </StatusBadge>
                    <span className="text-xs text-text-muted">{anomaly.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-jetbrains-mono font-bold text-sm",
                    anomaly.confidence >= 95 ? "bg-status-critical-bg text-status-critical" : anomaly.confidence >= 90 ? "bg-status-warning-bg text-status-warning" : "bg-status-info-bg text-status-info"
                  )}>
                    {anomaly.confidence}%
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-text-primary mb-1">{anomaly.entity}</p>
              <p className="text-xs text-text-muted">{anomaly.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", anomaly.confidence >= 95 ? "bg-status-critical" : anomaly.confidence >= 90 ? "bg-status-warning" : "bg-status-info")} style={{ width: `${anomaly.confidence}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictive Compliance */}
        <div className="bg-white rounded-xl card-shadow p-5">
          <h3 className="font-playfair-display text-lg font-semibold mb-4">Prédiction conformité (H2 2026)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={compliancePredictions}>
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9963B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9963B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3A7CC7" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3A7CC7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F4" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[75, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip />
              <Area type="monotone" dataKey="upper" stroke="#3A7CC7" strokeWidth={1} strokeDasharray="5 5" fill="url(#colorRange)" name="Borne sup." />
              <Area type="monotone" dataKey="lower" stroke="#3A7CC7" strokeWidth={1} strokeDasharray="5 5" fill="none" name="Borne inf." />
              <Area type="monotone" dataKey="predicted" stroke="#C9963B" strokeWidth={2.5} fill="url(#colorPredicted)" name="Prédiction" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Comparison Radar */}
        <div className="bg-white rounded-xl card-shadow p-5">
          <h3 className="font-playfair-display text-lg font-semibold mb-4">Comparaison sectorielle</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#EDF1F4" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[60, 100]} tick={{ fontSize: 10 }} />
              <Radar name="TVS" dataKey="TVS" stroke="#C9963B" fill="#C9963B" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Bajaj" dataKey="Bajaj" stroke="#3A7CC7" fill="#3A7CC7" fillOpacity={0.1} strokeWidth={2} />
              <Radar name="Yamaha" dataKey="Yamaha" stroke="#2E8B57" fill="#2E8B57" fillOpacity={0.1} strokeWidth={2} />
              <Radar name="Honda" dataKey="Honda" stroke="#7C5CC9" fill="#7C5CC9" fillOpacity={0.1} strokeWidth={2} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {["TVS", "Bajaj", "Yamaha", "Honda"].map((brand, idx) => {
              const colors = ["#C9963B", "#3A7CC7", "#2E8B57", "#7C5CC9"]
              return (
                <div key={brand} className="flex items-center gap-1 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: colors[idx] }} />
                  <span className="text-text-muted">{brand}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
