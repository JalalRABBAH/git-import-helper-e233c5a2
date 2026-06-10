import { useState } from "react"
import {
  AlertTriangle,
  Shield,
  Search,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  User,
  FileText,
  Car,
  ArrowRight,
  ShieldAlert,
  BadgeCheck,
  Gavel,
} from "lucide-react"
import StatusBadge from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const alerts = [
  { id: "ALT-2026-0100", title: "Déclaration suspecte — volumes incohérents", entity: "Faso Moto SARL", riskScore: 87, date: "05/06/2026", source: "ML Engine", assignee: "Insp. Kaboré" },
  { id: "ALT-2026-0099", title: "Faux certificat de conformité détecté", entity: "Koudouglou Motos", riskScore: 94, date: "04/06/2026", source: "CNTI", assignee: "Insp. Ouedraogo" },
  { id: "ALT-2026-0098", title: "Évasion fiscale présumée — TVA", entity: "Burkina Wheels SA", riskScore: 72, date: "04/06/2026", source: "Douanes", assignee: "Non assigné" },
  { id: "ALT-2026-0097", title: "Modèle interdit importé illégalement", entity: "Sahel Motos Distribution", riskScore: 91, date: "03/06/2026", source: "Douanes", assignee: "Insp. Ilboudo" },
  { id: "ALT-2026-0096", title: "Double facturation détectée", entity: "Ouaga Moto Import", riskScore: 68, date: "02/06/2026", source: "ML Engine", assignee: "Insp. Sawadogo" },
  { id: "ALT-2026-0095", title: "Paiement suspect — montant non déclaré", entity: "Bobo Moto Plus", riskScore: 76, date: "01/06/2026", source: "Police", assignee: "Non assigné" },
  { id: "ALT-2026-0094", title: "Contrefaçon de marque suspectée", entity: "Nord Moto Services", riskScore: 83, date: "31/05/2026", source: "CNTI", assignee: "Insp. Kambou" },
  { id: "ALT-2026-0093", title: "Déclaration GPS falsifiée", entity: "Moto Express BF", riskScore: 89, date: "30/05/2026", source: "ML Engine", assignee: "Insp. Yaméogo" },
  { id: "ALT-2026-0092", title: "Non-déclaration de ventes au comptant", entity: "Plateau Moto Hub", riskScore: 65, date: "29/05/2026", source: "Inspection", assignee: "Insp. Compaoré" },
  { id: "ALT-2026-0091", title: "Import parallèle suspecté", entity: "Ouest Riders SARL", riskScore: 78, date: "28/05/2026", source: "Douanes", assignee: "Non assigné" },
  { id: "ALT-2026-0090", title: "Manipulation de numéros de série", entity: "Centre Sud Motos", riskScore: 96, date: "27/05/2026", source: "CNTI", assignee: "Insp. Kaboré" },
  { id: "ALT-2026-0089", title: "Faux agrément présenté", entity: "Inconnu — Ouagadougou", riskScore: 99, date: "26/05/2026", source: "Police", assignee: "Insp. Ouedraogo" },
  { id: "ALT-2026-0088", title: "Blanchiment suspect via ventes fictives", entity: "Moto Royal SA", riskScore: 81, date: "25/05/2026", source: "ML Engine", assignee: "Non assigné" },
  { id: "ALT-2026-0087", title: "Sous-déclaration massive CA", entity: "Kaya Moto Express", riskScore: 74, date: "24/05/2026", source: "Douanes", assignee: "Insp. Ilboudo" },
  { id: "ALT-2026-0086", title: "Collusion entre vendeurs — fixation prix", entity: "Gourcy Moto Land", riskScore: 70, date: "23/05/2026", source: "Inspection", assignee: "Insp. Sawadogo" },
  { id: "ALT-2026-0085", title: "Engins volés remis en circulation", entity: "Fada Moto Import", riskScore: 93, date: "22/05/2026", source: "Police", assignee: "Insp. Kaboré" },
]

const investigations = {
  new: [
    { id: "INV-2026-0025", title: "Faux agrément — investigation", entity: "Inconnu", date: "05/06/2026", priority: "high" },
    { id: "INV-2026-0024", title: "Manipulation numéros série", entity: "Centre Sud Motos", date: "04/06/2026", priority: "high" },
    { id: "INV-2026-0023", title: "Import illégal modèles interdits", entity: "Sahel Motos", date: "03/06/2026", priority: "high" },
    { id: "INV-2026-0022", title: "Faux certificat conformité", entity: "Koudouglou Motos", date: "02/06/2026", priority: "medium" },
    { id: "INV-2026-0021", title: "Volumes déclaration suspects", entity: "Faso Moto SARL", date: "01/06/2026", priority: "medium" },
    { id: "INV-2026-0020", title: "Déclaration GPS falsifiée", entity: "Moto Express BF", date: "30/05/2026", priority: "medium" },
  ],
  inProgress: [
    { id: "INV-2026-0015", title: "Engins volés remis en circulation", entity: "Fada Moto Import", date: "25/05/2026", priority: "high", progress: 65 },
    { id: "INV-2026-0014", title: "Blanchiment suspect", entity: "Moto Royal SA", date: "23/05/2026", priority: "high", progress: 42 },
    { id: "INV-2026-0013", title: "Import parallèle", entity: "Ouest Riders SARL", date: "20/05/2026", priority: "medium", progress: 78 },
    { id: "INV-2026-0012", title: "Contrefaçon de marque", entity: "Nord Moto Services", date: "18/05/2026", priority: "medium", progress: 55 },
    { id: "INV-2026-0011", title: "Double facturation", entity: "Ouaga Moto Import", date: "15/05/2026", priority: "low", progress: 30 },
  ],
  closed: [
    { id: "INV-2026-0008", title: "Évasion fiscale confirmée", entity: "Bobo Moto Plus", date: "10/05/2026", result: "condamnation", amount: 45000000 },
    { id: "INV-2026-0007", title: "Faux documents administratifs", entity: "Banfora Moto Center", date: "05/05/2026", result: "amende", amount: 12000000 },
    { id: "INV-2026-0006", title: "Non-conformité technique grave", entity: "Manga Moto Hub", date: "28/04/2026", result: "suspension", amount: 0 },
  ],
}

const seizures = [
  { id: "SAI-2026-0042", vehicle: "TVS Apache RTR 200", vin: "MB8B45B12K1001234", date: "05/06/2026", reason: "Numéro de série falsifié", location: "Ouagadougou", status: "custody" },
  { id: "SAI-2026-0041", vehicle: "Bajaj Pulsar NS200", vin: "MD2D78B34L2005678", date: "04/06/2026", reason: "Modèle interdit importé", location: "Bobo-Dioulasso", status: "custody" },
  { id: "SAI-2026-0040", vehicle: "Yamaha MT-07", vin: "JYARM28E8KA001234", date: "03/06/2026", reason: "Faux certificat conformité", location: "Koudougou", status: "released" },
  { id: "SAI-2026-0039", vehicle: "Honda CB Hornet", vin: "MLHJC75B8K5009876", date: "02/06/2026", reason: "Véhicule volé", location: "Ouagadougou", status: "custody" },
  { id: "SAI-2026-0038", vehicle: "KTM Duke 390", vin: "VBKJPJ403HM678901", date: "01/06/2026", reason: "Import illégal", location: "Bobo-Dioulasso", status: "destroyed" },
  { id: "SAI-2026-0037", vehicle: "Apsonic AP150-18", vin: "L5YTCJPB0K1003456", date: "30/05/2026", reason: "Non-homologué CNTI", location: "Kaya", status: "custody" },
  { id: "SAI-2026-0036", vehicle: "Hero Splendor Plus", vin: "MBLB45B12K1007890", date: "28/05/2026", reason: "Contrefaçon", location: "Fada N'Gourma", status: "custody" },
  { id: "SAI-2026-0035", vehicle: "TVS Ntorq 125", vin: "MB8B78B34L2001234", date: "25/05/2026", reason: "Faux documents", location: "Ouagadougou", status: "released" },
]

const agencies = [
  { name: "CNTI", fullName: "Centre National de Traitement des Informations", role: "Analyse données & signaux", status: "connected", lastSync: "Il y a 5 min" },
  { name: "Police Nationale", fullName: "Police Nationale du Burkina Faso", role: "Enquêtes & interpellations", status: "connected", lastSync: "Il y a 12 min" },
  { name: "Douanes", fullName: "Direction Générale des Douanes", role: "Contrôle importations", status: "connected", lastSync: "Il y a 8 min" },
  { name: "Min. Commerce", fullName: "Ministère du Commerce", role: "Régulation & sanctions", status: "connected", lastSync: "En direct" },
]

type TabId = "alerts" | "investigations" | "seizures"

export default function Fraud() {
  const [activeTab, setActiveTab] = useState<TabId>("alerts")
  const [searchTerm, setSearchTerm] = useState("")

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "alerts", label: "Alertes", count: alerts.length },
    { id: "investigations", label: "Investigations", count: investigations.new.length + investigations.inProgress.length + investigations.closed.length },
    { id: "seizures", label: "Saisies", count: seizures.length },
  ]

  const getRiskColor = (score: number) => {
    if (score >= 90) return "bg-status-critical"
    if (score >= 75) return "bg-status-warning"
    return "bg-status-info"
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-playfair-display text-3xl font-bold">Lutte contre la Fraude</h1>
        <p className="text-text-muted mt-1">Détection, investigation et répression des fraudes du secteur</p>
      </div>

      {/* Agency Coordination */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {agencies.map((agency) => (
          <div key={agency.name} className="bg-white rounded-xl card-shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-status-compliant animate-pulse" />
              <span className="text-xs text-status-compliant font-medium">{agency.status === "connected" ? "Connecté" : "Déconnecté"}</span>
            </div>
            <p className="font-playfair-display font-semibold text-sm">{agency.name}</p>
            <p className="text-xs text-text-muted">{agency.fullName}</p>
            <p className="text-xs text-text-muted mt-1">{agency.role}</p>
            <p className="text-[10px] text-text-muted mt-2">Dernière sync: {agency.lastSync}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="flex border-b border-border-subtle px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "h-11 px-4 text-sm font-medium transition-all border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-gold-accent text-gold-accent"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              )}
            >
              {tab.label}
              <span className={cn("ml-1.5 text-xs px-1.5 py-0.5 rounded-full", activeTab === tab.id ? "bg-gold-accent-10 text-gold-accent" : "bg-bg-elevated text-text-muted")}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Alerts Tab */}
          {activeTab === "alerts" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher une alerte..."
                    className="w-full h-9 pl-8 pr-4 rounded-lg border border-border-default text-sm focus:border-gold-accent outline-none"
                  />
                </div>
              </div>
              {alerts
                .filter((a) => searchTerm === "" || a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.entity.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border-subtle hover:border-gold-accent/30 transition-all"
                >
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-jetbrains-mono font-bold text-sm shrink-0", getRiskColor(alert.riskScore))}>
                    {alert.riskScore}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-jetbrains-mono text-xs text-text-muted">{alert.id}</span>
                      <StatusBadge variant={alert.riskScore >= 90 ? "critical" : alert.riskScore >= 75 ? "warning" : "info"} className="text-[10px] h-5 px-2">
                        {alert.source}
                      </StatusBadge>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{alert.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{alert.entity}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Clock size={12} /> {alert.date}</span>
                      <span className="flex items-center gap-1"><User size={12} /> {alert.assignee}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm"><ChevronRight size={16} /></Button>
                </div>
              ))}
            </div>
          )}

          {/* Investigations Tab — Kanban */}
          {activeTab === "investigations" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* New */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-status-info" />
                    Nouvelles
                  </h4>
                  <span className="text-xs text-text-muted">{investigations.new.length}</span>
                </div>
                <div className="space-y-2">
                  {investigations.new.map((inv) => (
                    <div key={inv.id} className="p-3 bg-bg-elevated rounded-lg border border-border-subtle hover:border-status-info/40 transition-all cursor-pointer">
                      <span className="font-jetbrains-mono text-[10px] text-text-muted">{inv.id}</span>
                      <p className="text-sm font-medium mt-1">{inv.title}</p>
                      <p className="text-xs text-text-muted">{inv.entity}</p>
                      <div className="flex items-center justify-between mt-2">
                        <StatusBadge variant={inv.priority === "high" ? "critical" : "warning"} className="text-[10px] h-5 px-2">
                          {inv.priority}
                        </StatusBadge>
                        <span className="text-[10px] text-text-muted">{inv.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* In Progress */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-status-warning" />
                    En cours
                  </h4>
                  <span className="text-xs text-text-muted">{investigations.inProgress.length}</span>
                </div>
                <div className="space-y-2">
                  {investigations.inProgress.map((inv) => (
                    <div key={inv.id} className="p-3 bg-bg-elevated rounded-lg border border-border-subtle hover:border-status-warning/40 transition-all cursor-pointer">
                      <span className="font-jetbrains-mono text-[10px] text-text-muted">{inv.id}</span>
                      <p className="text-sm font-medium mt-1">{inv.title}</p>
                      <p className="text-xs text-text-muted">{inv.entity}</p>
                      <div className="mt-2">
                        <div className="h-1.5 bg-white rounded-full overflow-hidden">
                          <div className="h-full bg-status-warning rounded-full" style={{ width: `${inv.progress}%` }} />
                        </div>
                        <p className="text-[10px] text-text-muted mt-1 text-right">{inv.progress}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Closed */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-status-compliant" />
                    Clôturées
                  </h4>
                  <span className="text-xs text-text-muted">{investigations.closed.length}</span>
                </div>
                <div className="space-y-2">
                  {investigations.closed.map((inv) => (
                    <div key={inv.id} className="p-3 bg-status-compliant-bg rounded-lg border border-status-compliant/20">
                      <span className="font-jetbrains-mono text-[10px] text-text-muted">{inv.id}</span>
                      <p className="text-sm font-medium mt-1">{inv.title}</p>
                      <p className="text-xs text-text-muted">{inv.entity}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge variant={inv.result === "condamnation" ? "critical" : inv.result === "amende" ? "warning" : "info"} className="text-[10px] h-5 px-2">
                          {inv.result}
                        </StatusBadge>
                        {inv.amount > 0 && (
                          <span className="text-xs font-jetbrains-mono">{inv.amount.toLocaleString()} FCFA</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Seizures Tab */}
          {activeTab === "seizures" && (
            <div className="space-y-4">
              {/* Custody Timeline */}
              <div className="flex items-center gap-4 p-4 bg-bg-elevated rounded-lg">
                <div className="flex-1 text-center">
                  <p className="text-xs text-text-muted">Saisies actives</p>
                  <p className="font-jetbrains-mono text-2xl font-bold text-status-warning">{seizures.filter((s) => s.status === "custody").length}</p>
                </div>
                <ArrowRight size={16} className="text-text-muted" />
                <div className="flex-1 text-center">
                  <p className="text-xs text-text-muted">Restitués</p>
                  <p className="font-jetbrains-mono text-2xl font-bold text-status-compliant">{seizures.filter((s) => s.status === "released").length}</p>
                </div>
                <ArrowRight size={16} className="text-text-muted" />
                <div className="flex-1 text-center">
                  <p className="text-xs text-text-muted">Détruits</p>
                  <p className="font-jetbrains-mono text-2xl font-bold text-status-critical">{seizures.filter((s) => s.status === "destroyed").length}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-bg-elevated">
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Véhicule</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">N° VIN</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Motif</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Lieu</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seizures.map((s) => (
                      <tr key={s.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/50 transition-colors">
                        <td className="py-3 px-4 font-jetbrains-mono text-xs text-text-muted">{s.id}</td>
                        <td className="py-3 px-4 font-medium">{s.vehicle}</td>
                        <td className="py-3 px-4 font-jetbrains-mono text-xs">{s.vin}</td>
                        <td className="py-3 px-4">{s.date}</td>
                        <td className="py-3 px-4 text-xs">{s.reason}</td>
                        <td className="py-3 px-4 text-xs">{s.location}</td>
                        <td className="py-3 px-4">
                          <StatusBadge
                            variant={s.status === "custody" ? "warning" : s.status === "released" ? "compliant" : "critical"}
                          >
                            {s.status === "custody" ? "Garde" : s.status === "released" ? "Restitué" : "Détruit"}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
