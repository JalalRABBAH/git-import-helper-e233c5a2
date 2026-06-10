import { useState } from "react"
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  ChevronRight,
  Download,
  BarChart3,
  Calendar,
  Building2,
} from "lucide-react"
import StatusBadge from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface QuarterlyReport {
  id: string
  enterprise: string
  quarter: string
  year: number
  submittedDate: string | null
  status: "submitted" | "late" | "missing" | "under_review" | "validated" | "rejected"
  region: string
  sales: number | null
  revenue: number | null
  anomalies: number
}

const reports: QuarterlyReport[] = [
  { id: "RPT-2026-Q2-001", enterprise: "Faso Moto SARL", quarter: "Q2", year: 2026, submittedDate: "2026-06-03", status: "validated", region: "Centre", sales: 3840, revenue: 576000000, anomalies: 0 },
  { id: "RPT-2026-Q2-002", enterprise: "Burkina Wheels SA", quarter: "Q2", year: 2026, submittedDate: "2026-06-04", status: "validated", region: "Hauts-Bassins", sales: 2950, revenue: 442500000, anomalies: 1 },
  { id: "RPT-2026-Q2-003", enterprise: "Sahel Motos Distribution", quarter: "Q2", year: 2026, submittedDate: "2026-06-05", status: "under_review", region: "Centre-Nord", sales: 820, revenue: 123000000, anomalies: 3 },
  { id: "RPT-2026-Q2-004", enterprise: "Ouaga Moto Import", quarter: "Q2", year: 2026, submittedDate: "2026-06-02", status: "validated", region: "Centre", sales: 4120, revenue: 618000000, anomalies: 0 },
  { id: "RPT-2026-Q2-005", enterprise: "Bobo Moto Plus", quarter: "Q2", year: 2026, submittedDate: "2026-06-04", status: "validated", region: "Hauts-Bassins", sales: 2180, revenue: 327000000, anomalies: 1 },
  { id: "RPT-2026-Q2-006", enterprise: "Koudouglou Motos", quarter: "Q2", year: 2026, submittedDate: "2026-06-05", status: "rejected", region: "Cascades", sales: 450, revenue: 67500000, anomalies: 5 },
  { id: "RPT-2026-Q2-007", enterprise: "Moto Express BF", quarter: "Q2", year: 2026, submittedDate: "2026-06-01", status: "validated", region: "Est", sales: 1120, revenue: 168000000, anomalies: 0 },
  { id: "RPT-2026-Q2-008", enterprise: "Nord Moto Services", quarter: "Q2", year: 2026, submittedDate: null, status: "missing", region: "Nord", sales: null, revenue: null, anomalies: 0 },
  { id: "RPT-2026-Q2-009", enterprise: "Ouest Riders SARL", quarter: "Q2", year: 2026, submittedDate: "2026-06-03", status: "validated", region: "Boucle du Mouhoun", sales: 980, revenue: 147000000, anomalies: 0 },
  { id: "RPT-2026-Q2-010", enterprise: "Centre Sud Motos", quarter: "Q2", year: 2026, submittedDate: "2026-06-04", status: "under_review", region: "Centre-Sud", sales: 720, revenue: 108000000, anomalies: 2 },
  { id: "RPT-2026-Q2-011", enterprise: "Plateau Moto Hub", quarter: "Q2", year: 2026, submittedDate: "2026-05-30", status: "late", region: "Plateau-Central", sales: 890, revenue: 133500000, anomalies: 1 },
  { id: "RPT-2026-Q2-012", enterprise: "Sud-Ouest Moto Park", quarter: "Q2", year: 2026, submittedDate: "2026-06-02", status: "validated", region: "Sud-Ouest", sales: 560, revenue: 84000000, anomalies: 0 },
  { id: "RPT-2026-Q2-013", enterprise: "Moto Royal SA", quarter: "Q2", year: 2026, submittedDate: "2026-06-03", status: "validated", region: "Centre", sales: 3240, revenue: 486000000, anomalies: 0 },
  { id: "RPT-2026-Q2-014", enterprise: "Bassins Moto Pro", quarter: "Q2", year: 2026, submittedDate: "2026-06-05", status: "under_review", region: "Hauts-Bassins", sales: 1890, revenue: 283500000, anomalies: 2 },
  { id: "RPT-2026-Q2-015", enterprise: "Dori Moto Services", quarter: "Q2", year: 2026, submittedDate: null, status: "missing", region: "Sahel", sales: null, revenue: null, anomalies: 0 },
  { id: "RPT-2026-Q2-016", enterprise: "Ziniaré Moto Plus", quarter: "Q2", year: 2026, submittedDate: "2026-06-04", status: "validated", region: "Plateau-Central", sales: 640, revenue: 96000000, anomalies: 0 },
  { id: "RPT-2026-Q2-017", enterprise: "Kaya Moto Express", quarter: "Q2", year: 2026, submittedDate: "2026-06-01", status: "late", region: "Centre-Nord", sales: 580, revenue: 87000000, anomalies: 1 },
  { id: "RPT-2026-Q2-018", enterprise: "Tenkodogo Moto Land", quarter: "Q2", year: 2026, submittedDate: "2026-06-03", status: "validated", region: "Centre-Est", sales: 490, revenue: 73500000, anomalies: 0 },
  { id: "RPT-2026-Q2-019", enterprise: "Fada Moto Import", quarter: "Q2", year: 2026, submittedDate: "2026-05-28", status: "late", region: "Est", sales: 720, revenue: 108000000, anomalies: 2 },
  { id: "RPT-2026-Q2-020", enterprise: "Gorom-Gorom Moto", quarter: "Q2", year: 2026, submittedDate: null, status: "missing", region: "Sahel", sales: null, revenue: null, anomalies: 0 },
  { id: "RPT-2026-Q2-021", enterprise: "Banfora Moto Center", quarter: "Q2", year: 2026, submittedDate: "2026-06-04", status: "validated", region: "Cascades", sales: 830, revenue: 124500000, anomalies: 0 },
  { id: "RPT-2026-Q2-022", enterprise: "Manga Moto Hub", quarter: "Q2", year: 2026, submittedDate: "2026-06-05", status: "under_review", region: "Centre-Sud", sales: 380, revenue: 57000000, anomalies: 1 },
  { id: "RPT-2026-Q2-023", enterprise: "Koudougou Moto Park", quarter: "Q2", year: 2026, submittedDate: "2026-06-02", status: "validated", region: "Centre-Ouest", sales: 1450, revenue: 217500000, anomalies: 0 },
  { id: "RPT-2026-Q2-024", enterprise: "Dédougou Moto Pro", quarter: "Q2", year: 2026, submittedDate: null, status: "missing", region: "Boucle du Mouhoun", sales: null, revenue: null, anomalies: 0 },
  { id: "RPT-2026-Q2-025", enterprise: "Koupéla Moto Express", quarter: "Q2", year: 2026, submittedDate: "2026-06-05", status: "late", region: "Centre-Est", sales: 320, revenue: 48000000, anomalies: 1 },
  { id: "RPT-2026-Q2-026", enterprise: "Réo Moto Services", quarter: "Q2", year: 2026, submittedDate: "2026-06-03", status: "validated", region: "Centre-Ouest", sales: 410, revenue: 61500000, anomalies: 0 },
  { id: "RPT-2026-Q2-027", enterprise: "Yako Moto Plus", quarter: "Q2", year: 2026, submittedDate: "2026-06-04", status: "under_review", region: "Nord", sales: 290, revenue: 43500000, anomalies: 1 },
  { id: "RPT-2026-Q2-028", enterprise: "Gourcy Moto Land", quarter: "Q2", year: 2026, submittedDate: "2026-06-01", status: "validated", region: "Nord", sales: 510, revenue: 76500000, anomalies: 0 },
]

const statusConfig = {
  submitted: { label: "Soumis", variant: "info" as const },
  late: { label: "En retard", variant: "warning" as const },
  missing: { label: "Manquant", variant: "critical" as const },
  under_review: { label: "En révision", variant: "info" as const },
  validated: { label: "Validé", variant: "compliant" as const },
  rejected: { label: "Rejeté", variant: "critical" as const },
}

const donutData = [
  { name: "Validés", value: 13, color: "#2E8B57" },
  { name: "En révision", value: 5, color: "#3A7CC7" },
  { name: "En retard", value: 4, color: "#E8943A" },
  { name: "Manquants", value: 4, color: "#C73E3E" },
  { name: "Rejetés", value: 1, color: "#7C5CC9" },
]

export default function QuarterlyReports() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedReport, setSelectedReport] = useState<QuarterlyReport | null>(null)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showEscalation, setShowEscalation] = useState(false)

  const filtered = reports.filter((r) => {
    const matchesSearch = search === "" || r.enterprise.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const submitted = reports.filter((r) => r.status !== "missing").length
  const coverage = Math.round((submitted / reports.length) * 100)
  const lateCount = reports.filter((r) => r.status === "late").length
  const missingCount = reports.filter((r) => r.status === "missing").length

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-playfair-display text-3xl font-bold">Rapports Trimestriels</h1>
        <p className="text-text-muted mt-1">Suivi des soumissions Q2 2026 — {reports.length} entreprises</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl card-shadow p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Couverture de soumission</p>
          <div className="flex items-end gap-2">
            <span className="font-jetbrains-mono text-4xl font-bold text-gold-accent">{coverage}%</span>
            <span className="text-sm text-text-muted mb-1">{submitted}/{reports.length}</span>
          </div>
          <Progress value={coverage} className="h-2 mt-2" />
        </div>
        <div className="bg-white rounded-xl card-shadow p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">En retard</p>
          <span className="font-jetbrains-mono text-4xl font-bold text-status-warning">{lateCount}</span>
          <p className="text-xs text-text-muted mt-1">Rapports non soumis à temps</p>
        </div>
        <div className="bg-white rounded-xl card-shadow p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Manquants</p>
          <span className="font-jetbrains-mono text-4xl font-bold text-status-critical">{missingCount}</span>
          <p className="text-xs text-text-muted mt-1">Non soumis — Escalade requise</p>
        </div>
        <div className="bg-white rounded-xl card-shadow p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Validés</p>
          <span className="font-jetbrains-mono text-4xl font-bold text-status-compliant">
            {reports.filter((r) => r.status === "validated").length}
          </span>
          <p className="text-xs text-text-muted mt-1">Rapports approuvés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <div className="bg-white rounded-xl card-shadow p-5">
          <h3 className="font-playfair-display text-lg font-semibold mb-4">Répartition des statuts</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-1 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-text-muted">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Late Reports Escalation */}
        <div className="lg:col-span-2 bg-white rounded-xl card-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-playfair-display text-lg font-semibold flex items-center gap-2">
              <AlertTriangle size={20} className="text-status-warning" />
              Rapports en retard — Escalade
            </h3>
            <Button variant="outline" size="sm" onClick={() => setShowEscalation(!showEscalation)}>
              {showEscalation ? "Masquer" : "Voir détails"}
            </Button>
          </div>
          <div className="space-y-2">
            {reports
              .filter((r) => r.status === "late" || r.status === "missing")
              .map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 bg-bg-elevated rounded-lg hover:bg-status-warning-bg/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge variant={r.status === "missing" ? "critical" : "warning"}>
                      {statusConfig[r.status].label}
                    </StatusBadge>
                    <div>
                      <p className="text-sm font-medium">{r.enterprise}</p>
                      <p className="text-xs text-text-muted">{r.id} — {r.region}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon-sm">
                      <AlertTriangle size={14} className="text-status-warning" />
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <Download size={14} />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
          {showEscalation && (
            <div className="mt-4 p-4 bg-status-critical-bg rounded-lg border border-status-critical/20">
              <h4 className="text-sm font-semibold text-status-critical mb-2">Procédure d'escalade</h4>
              <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                <li>Notification automatique à l'entreprise (J+3 après échéance)</li>
                <li>Mise en demeure écrite (J+7)</li>
                <li>Convocation inspection inopinée (J+15)</li>
                <li>Procédure de retrait d'agrément (J+30)</li>
              </ol>
              <Button variant="destructive" size="sm" className="mt-3">
                <AlertTriangle size={14} className="mr-2" /> Déclencher l'escalade
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une entreprise..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border-default bg-white text-sm focus:border-gold-accent outline-none"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "validated", "under_review", "late", "missing", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-medium transition-all",
                statusFilter === s ? "bg-gold-accent text-white" : "bg-white border border-border-default text-text-secondary hover:bg-bg-elevated"
              )}
            >
              {s === "all" ? "Tous" : s === "under_review" ? "En révision" : s === "validated" ? "Validés" : statusConfig[s as keyof typeof statusConfig]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">ID</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Entreprise</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Trimestre</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Date soumission</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Ventes décl.</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Anomalies</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Statut</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/50 transition-colors"
                  onClick={() => setSelectedReport(r)}
                >
                  <td className="py-3 px-4 font-jetbrains-mono text-xs text-text-muted">{r.id}</td>
                  <td className="py-3 px-4 font-medium">{r.enterprise}</td>
                  <td className="py-3 px-4">{r.quarter} {r.year}</td>
                  <td className="py-3 px-4">{r.submittedDate || "—"}</td>
                  <td className="py-3 px-4 font-jetbrains-mono">{r.sales?.toLocaleString() || "—"}</td>
                  <td className="py-3 px-4">
                    {r.anomalies > 0 ? (
                      <span className="text-status-critical font-jetbrains-mono font-medium">{r.anomalies}</span>
                    ) : (
                      <span className="text-status-compliant">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge variant={statusConfig[r.status].variant}>{statusConfig[r.status].label}</StatusBadge>
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm"><BarChart3 size={14} /></Button>
                      {r.status === "under_review" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => { e.stopPropagation(); setSelectedReport(r); setShowRejectionModal(true) }}
                        >
                          <XCircle size={14} className="text-status-critical" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedReport && !showRejectionModal && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedReport(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-playfair-display text-xl font-semibold">{selectedReport.enterprise}</h3>
              <button onClick={() => setSelectedReport(null)}><XCircle size={20} className="text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-bg-elevated rounded-lg">
                <p className="text-xs text-text-muted mb-1">ID Rapport</p>
                <p className="font-jetbrains-mono text-lg font-bold">{selectedReport.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-bg-elevated rounded-lg">
                  <Calendar size={16} className="text-text-muted mb-1" />
                  <p className="text-xs text-text-muted">Période</p>
                  <p className="font-medium">{selectedReport.quarter} {selectedReport.year}</p>
                </div>
                <div className="p-3 bg-bg-elevated rounded-lg">
                  <Building2 size={16} className="text-text-muted mb-1" />
                  <p className="text-xs text-text-muted">Région</p>
                  <p className="font-medium">{selectedReport.region}</p>
                </div>
              </div>
              {selectedReport.sales && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-bg-elevated rounded-lg">
                    <p className="text-xs text-text-muted">Ventes déclarées</p>
                    <p className="font-jetbrains-mono text-lg font-bold">{selectedReport.sales.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-bg-elevated rounded-lg">
                    <p className="text-xs text-text-muted">Revenus (FCFA)</p>
                    <p className="font-jetbrains-mono text-lg font-bold">{(selectedReport.revenue! / 1000000).toFixed(1)}M</p>
                  </div>
                </div>
              )}
              <div className="p-3 bg-bg-elevated rounded-lg">
                <p className="text-xs text-text-muted mb-1">Anomalies détectées</p>
                <p className={cn("font-jetbrains-mono font-bold", selectedReport.anomalies > 0 ? "text-status-critical" : "text-status-compliant")}>
                  {selectedReport.anomalies}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="flex-1"><CheckCircle size={16} className="mr-2" /> Valider</Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowRejectionModal(true)}>
                  <XCircle size={16} className="mr-2" /> Rejeter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowRejectionModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-playfair-display text-xl font-semibold mb-2">Motif de rejet</h3>
            <p className="text-sm text-text-muted mb-4">{selectedReport.id} — {selectedReport.enterprise}</p>
            <div className="space-y-2 mb-4">
              {["Données incomplètes", "Anomalies non résolues", "Hors délai sans justification", "Non-conformité réglementaire"].map((reason) => (
                <label key={reason} className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg-elevated cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">{reason}</span>
                </label>
              ))}
            </div>
            <textarea
              placeholder="Commentaire détaillé..."
              className="w-full h-20 p-3 rounded-lg border border-border-default text-sm resize-none focus:border-gold-accent outline-none mb-4"
            />
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setShowRejectionModal(false)}>Annuler</Button>
              <Button variant="destructive" className="flex-1">Confirmer le rejet</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
