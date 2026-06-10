import { useState } from "react"
import {
  Users,
  Shield,
  Sliders,
  Calculator,
  MapPin,
  ClipboardList,
  Database,
  Search,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  RotateCcw,
  UserCheck,
  UserX,
  Lock,
  Eye,
} from "lucide-react"
import StatusBadge from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TabId = "users" | "rules" | "thresholds" | "fiscal" | "geography" | "audit" | "backups"

const users = [
  { id: "USR-001", name: "Amadou Kaboré", email: "a.kabore@commerce.gov.bf", role: "Inspecteur", region: "Centre", status: "active", lastLogin: "05/06/2026 08:32" },
  { id: "USR-002", name: "Marie Ouedraogo", email: "m.ouedraogo@commerce.gov.bf", role: "Inspecteur", region: "Hauts-Bassins", status: "active", lastLogin: "05/06/2026 09:15" },
  { id: "USR-003", name: "Issouf Traoré", email: "i.traore@cnti.bf", role: "Analyste CNTI", region: "National", status: "active", lastLogin: "04/06/2026 16:45" },
  { id: "USR-004", name: "Jean Baptiste", email: "j.baptiste@commerce.gov.bf", role: "Contrôleur", region: "Centre", status: "active", lastLogin: "05/06/2026 07:50" },
  { id: "USR-005", name: "Abdoulaye Sanou", email: "a.sanou@commerce.gov.bf", role: "Inspecteur", region: "Hauts-Bassins", status: "active", lastLogin: "04/06/2026 14:20" },
  { id: "USR-006", name: "Fatima Bationo", email: "f.bationo@commerce.gov.bf", role: "Contrôleur", region: "Cascades", status: "inactive", lastLogin: "01/06/2026 11:00" },
  { id: "USR-007", name: "Kofi Mensah", email: "k.mensah@commerce.gov.bf", role: "Inspecteur", region: "Est", status: "active", lastLogin: "05/06/2026 08:10" },
  { id: "USR-008", name: "Hamidou Yaméogo", email: "h.yameogo@commerce.gov.bf", role: "Inspecteur", region: "Nord", status: "active", lastLogin: "04/06/2026 17:30" },
  { id: "USR-009", name: "Aïssata Koné", email: "a.kone@commerce.gov.bf", role: "Contrôleur", region: "Boucle du Mouhoun", status: "active", lastLogin: "05/06/2026 09:00" },
  { id: "USR-010", name: "Blaise Compaoré", email: "b.compaore@commerce.gov.bf", role: "Inspecteur", region: "Centre-Sud", status: "active", lastLogin: "04/06/2026 15:45" },
  { id: "USR-011", name: "Sylvie Ilboudo", email: "s.ilboudo@commerce.gov.bf", role: "Admin", region: "National", status: "active", lastLogin: "05/06/2026 07:00" },
  { id: "USR-012", name: "Gilles Bamba", email: "g.bamba@commerce.gov.bf", role: "Contrôleur", region: "Sud-Ouest", status: "inactive", lastLogin: "28/05/2026 10:20" },
  { id: "USR-013", name: "Claire Zongo", email: "c.zongo@commerce.gov.bf", role: "Inspecteur", region: "Centre", status: "active", lastLogin: "05/06/2026 08:45" },
  { id: "USR-014", name: "Sékou Diabaté", email: "s.diabate@commerce.gov.bf", role: "Contrôleur", region: "Hauts-Bassins", status: "active", lastLogin: "04/06/2026 16:00" },
  { id: "USR-015", name: "Mahamadi Sawadogo", email: "m.sawadogo@commerce.gov.bf", role: "Inspecteur", region: "Sahel", status: "active", lastLogin: "05/06/2026 07:30" },
  { id: "USR-016", name: "Aminata Sankara", email: "a.sankara@commerce.gov.bf", role: "Contrôleur", region: "Plateau-Central", status: "active", lastLogin: "04/06/2026 14:50" },
  { id: "USR-017", name: "Oumarou Zoromé", email: "o.zorome@commerce.gov.bf", role: "Inspecteur", region: "Centre-Nord", status: "active", lastLogin: "05/06/2026 09:20" },
  { id: "USR-018", name: "Lassina Zerbo", email: "l.zerbo@commerce.gov.bf", role: "Contrôleur", region: "Centre-Est", status: "inactive", lastLogin: "02/06/2026 11:30" },
  { id: "USR-019", name: "Souleymane Maïga", email: "s.maiga@commerce.gov.bf", role: "Inspecteur", region: "Est", status: "active", lastLogin: "04/06/2026 17:00" },
  { id: "USR-020", name: "Hassan Barry", email: "h.barry@douanes.gov.bf", role: "Agent Douanes", region: "Sahel", status: "active", lastLogin: "05/06/2026 08:00" },
  { id: "USR-021", name: "Awa Touré", email: "a.toure@commerce.gov.bf", role: "Contrôleur", region: "Cascades", status: "active", lastLogin: "05/06/2026 09:10" },
  { id: "USR-022", name: "Norbert Kambou", email: "n.kambou@police.gov.bf", role: "Agent Police", region: "Centre-Sud", status: "active", lastLogin: "04/06/2026 15:30" },
  { id: "USR-023", name: "François Lompo", email: "f.lompo@commerce.gov.bf", role: "Inspecteur", region: "Centre-Ouest", status: "active", lastLogin: "05/06/2026 08:20" },
  { id: "USR-024", name: "Aminata Ouedraogo", email: "a.ouedraogo@commerce.gov.bf", role: "Admin", region: "National", status: "active", lastLogin: "05/06/2026 07:15" },
]

const complianceRules = Array.from({ length: 156 }, (_, i) => ({
  id: `REG-${String(i + 1).padStart(4, "0")}`,
  category: ["Administratif", "Technique", "Fiscal", "Commercial", "Sécurité", "Rapports"][i % 6],
  description: `Règle de conformité #${i + 1} — ${["Vérification document", "Contrôle technique", "Calcul taxe", "Vérification prix", "Inspection sécurité", "Délai rapport"][i % 6]}`,
  severity: ["critique", "majeure", "mineure"][i % 3],
  active: i < 148,
  lastUpdated: `${String((i % 30) + 1).padStart(2, "0")}/05/2026`,
}))

const thresholds = [
  { id: "TH-001", name: "Seuil alerte volume ventes", value: 300, unit: "ventes/jour", min: 100, max: 1000, description: "Déclenche une alerte si le volume de ventes dépasse ce seuil pour une entreprise" },
  { id: "TH-002", name: "Seuil retard rapport trimestriel", value: 15, unit: "jours", min: 5, max: 45, description: "Nombre de jours de tolérance avant escalation" },
  { id: "TH-003", name: "Seuil conformité minimale", value: 70, unit: "%", min: 50, max: 95, description: "Score minimum pour maintenir l'agrément" },
  { id: "TH-004", name: "Seuil anomalie ML", value: 85, unit: "% confiance", min: 60, max: 99, description: "Confiance minimale pour générer une alerte ML" },
  { id: "TH-005", name: "Seuil fréquence déclaration", value: 5, unit: "déclarations/heure", min: 1, max: 20, description: "Nombre max de déclarations autorisées par heure" },
  { id: "TH-006", name: "Seuil prix anormal", value: 30, unit: "% écart", min: 10, max: 60, description: "Écart de prix maximum par rapport au barème" },
]

const auditLogs = [
  { id: "LOG-2026-01000", action: "Connexion", user: "Amadou Kaboré", target: "Système", timestamp: "05/06/2026 08:32:15", result: "success" },
  { id: "LOG-2026-00999", action: "Validation rapport", user: "Sylvie Ilboudo", target: "RPT-2026-Q2-001", timestamp: "05/06/2026 08:30:42", result: "success" },
  { id: "LOG-2026-00998", action: "Modification seuil", user: "Aminata Ouedraogo", target: "TH-003", timestamp: "05/06/2026 08:15:10", result: "success" },
  { id: "LOG-2026-00997", action: "Export données", user: "Issouf Traoré", target: "Rapport national 2025", timestamp: "05/06/2026 07:58:33", result: "success" },
  { id: "LOG-2026-00996", action: "Tentative connexion", user: "Inconnu", target: "Système", timestamp: "05/06/2026 07:45:22", result: "failure" },
  { id: "LOG-2026-00995", action: "Création utilisateur", user: "Aminata Ouedraogo", target: "USR-025", timestamp: "04/06/2026 17:20:05", result: "success" },
  { id: "LOG-2026-00994", action: "Suppression règle", user: "Sylvie Ilboudo", target: "REG-0156", timestamp: "04/06/2026 16:45:18", result: "success" },
  { id: "LOG-2026-00993", action: "Modification rôle", user: "Aminata Ouedraogo", target: "USR-012", timestamp: "04/06/2026 15:30:00", result: "success" },
]

const regions = [
  { name: "Boucle du Mouhoun", capital: "Dédougou", prefectures: 6, enterprises: 11, population: 1890000, coverage: 82 },
  { name: "Cascades", capital: "Banfora", prefectures: 2, enterprises: 8, population: 812000, coverage: 91 },
  { name: "Centre", capital: "Ouagadougou", prefectures: 1, enterprises: 48, population: 2913000, coverage: 96 },
  { name: "Centre-Est", capital: "Tenkodogo", prefectures: 3, enterprises: 10, population: 781000, coverage: 85 },
  { name: "Centre-Nord", capital: "Kaya", prefectures: 3, enterprises: 6, population: 1382000, coverage: 78 },
  { name: "Centre-Ouest", capital: "Koudougou", prefectures: 4, enterprises: 18, population: 1684000, coverage: 90 },
  { name: "Centre-Sud", capital: "Manga", prefectures: 3, enterprises: 6, population: 719000, coverage: 88 },
  { name: "Est", capital: "Fada N'Gourma", prefectures: 5, enterprises: 15, population: 1672000, coverage: 79 },
  { name: "Hauts-Bassins", capital: "Bobo-Dioulasso", prefectures: 3, enterprises: 32, population: 2766000, coverage: 94 },
  { name: "Nord", capital: "Ouahigouya", prefectures: 4, enterprises: 9, population: 1621000, coverage: 76 },
  { name: "Plateau-Central", capital: "Ziniaré", prefectures: 3, enterprises: 12, population: 977000, coverage: 87 },
  { name: "Sahel", capital: "Dori", prefectures: 5, enterprises: 4, population: 1181000, coverage: 71 },
  { name: "Sud-Ouest", capital: "Gaoua", prefectures: 4, enterprises: 7, population: 874000, coverage: 84 },
]

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabId>("users")
  const [searchTerm, setSearchTerm] = useState("")
  const [thresholdValues, setThresholdValues] = useState<Record<string, number>>(
    Object.fromEntries(thresholds.map((t) => [t.id, t.value]))
  )

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "users", label: "Utilisateurs", icon: <Users size={16} />, count: users.length },
    { id: "rules", label: "Règles", icon: <Shield size={16} />, count: complianceRules.length },
    { id: "thresholds", label: "Seuils", icon: <Sliders size={16} />, count: thresholds.length },
    { id: "fiscal", label: "Fiscal", icon: <Calculator size={16} /> },
    { id: "geography", label: "Géographie", icon: <MapPin size={16} />, count: regions.length },
    { id: "audit", label: "Audit", icon: <ClipboardList size={16} />, count: auditLogs.length },
    { id: "backups", label: "Sauvegardes", icon: <Database size={16} /> },
  ]

  const filteredUsers = users.filter((u) =>
    searchTerm === "" || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-playfair-display text-3xl font-bold">Administration</h1>
        <p className="text-text-muted mt-1">Gestion utilisateurs, règles, paramètres système</p>
      </div>

      <div className="bg-white rounded-xl card-shadow">
        <div className="flex border-b border-border-subtle px-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "h-11 px-4 text-sm font-medium transition-all border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap",
                activeTab === tab.id
                  ? "border-gold-accent text-gold-accent"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count && <span className="text-xs px-1.5 py-0.5 rounded-full bg-bg-elevated">{tab.count}</span>}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative max-w-sm flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un utilisateur..."
                    className="w-full h-9 pl-8 pr-4 rounded-lg border border-border-default text-sm focus:border-gold-accent outline-none"
                  />
                </div>
                <Button size="sm"><Plus size={14} className="mr-1" /> Ajouter</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-bg-elevated">
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Nom</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Rôle</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Région</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Statut</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Dernière connexion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/50 transition-colors">
                        <td className="py-3 px-4 font-jetbrains-mono text-xs text-text-muted">{u.id}</td>
                        <td className="py-3 px-4 font-medium">{u.name}</td>
                        <td className="py-3 px-4 text-xs">{u.email}</td>
                        <td className="py-3 px-4"><StatusBadge variant="info" className="text-[10px] h-5 px-2">{u.role}</StatusBadge></td>
                        <td className="py-3 px-4">{u.region}</td>
                        <td className="py-3 px-4"><StatusBadge variant={u.status === "active" ? "compliant" : "warning"}>{u.status === "active" ? "Actif" : "Inactif"}</StatusBadge></td>
                        <td className="py-3 px-4 text-xs">{u.lastLogin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative max-w-sm flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Rechercher une règle..."
                    className="w-full h-9 pl-8 pr-4 rounded-lg border border-border-default text-sm focus:border-gold-accent outline-none"
                  />
                </div>
                <Button size="sm"><Plus size={14} className="mr-1" /> Ajouter</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                {complianceRules.slice(0, 24).map((r) => (
                  <div key={r.id} className="p-3 border border-border-subtle rounded-lg hover:border-gold-accent/30 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-jetbrains-mono text-xs text-text-muted">{r.id}</span>
                      <StatusBadge
                        variant={r.severity === "critique" ? "critical" : r.severity === "majeure" ? "warning" : "info"}
                        className="text-[9px] h-4 px-1.5"
                      >
                        {r.severity}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-text-muted">{r.category}</p>
                    <p className="text-sm mt-1">{r.description}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", r.active ? "bg-status-compliant" : "bg-status-critical")} />
                      <span className="text-[10px] text-text-muted">{r.active ? "Actif" : "Inactif"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "thresholds" && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="font-playfair-display text-lg font-semibold">Seuils d'alerte</h3>
              {thresholds.map((t) => (
                <div key={t.id} className="p-4 border border-border-subtle rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-text-muted">{t.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-jetbrains-mono text-lg font-bold text-gold-accent">
                        {thresholdValues[t.id]}
                      </span>
                      <span className="text-xs text-text-muted">{t.unit}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={t.min}
                    max={t.max}
                    value={thresholdValues[t.id]}
                    onChange={(e) => setThresholdValues((prev) => ({ ...prev, [t.id]: Number(e.target.value) }))}
                    className="w-full accent-gold-accent"
                  />
                  <div className="flex justify-between text-xs text-text-muted mt-1">
                    <span>{t.min} {t.unit}</span>
                    <span>{t.max} {t.unit}</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button><Save size={16} className="mr-2" /> Sauvegarder</Button>
                <Button variant="outline"><RotateCcw size={16} className="mr-2" /> Réinitialiser</Button>
              </div>
            </div>
          )}

          {activeTab === "fiscal" && (
            <div className="space-y-4">
              <h3 className="font-playfair-display text-lg font-semibold">Configuration fiscale OHADA</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "TVA standard", value: "18%", description: "Taxe sur la valeur ajoutée" },
                  { label: "Taxe enregistrement", value: "2%", description: "Droit d'enregistrement vente 2RM" },
                  { label: "Taxe régisse", value: "5,000 FCFA", description: "Par engin immatriculé" },
                  { label: "Redevance OHADA", value: "0.5% CA", description: "Contribution syndicale" },
                  { label: "Taxe apprentissage", value: "0.5% masse salariale", description: "Formation professionnelle" },
                  { label: "Impôt sociétés (IS)", value: "25-30%", description: "Barème progressif" },
                  { label: "Patente", value: "Variable", description: "Selon le chiffre d'affaires" },
                  { label: "Taxe locale", value: "Commune", description: "Déterminée par la commune" },
                  { label: "Droits de douane 2RM", value: "10-25%", description: "Selon cylindrée et origine" },
                ].map((tax) => (
                  <div key={tax.label} className="p-4 bg-bg-elevated rounded-lg">
                    <p className="text-xs text-text-muted">{tax.description}</p>
                    <p className="font-medium text-sm mt-1">{tax.label}</p>
                    <p className="font-jetbrains-mono text-lg font-bold text-gold-accent">{tax.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "geography" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-elevated">
                    <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Région</th>
                    <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Chef-lieu</th>
                    <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Préfectures</th>
                    <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Entreprises</th>
                    <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Population</th>
                    <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Couverture</th>
                  </tr>
                </thead>
                <tbody>
                  {regions.map((r) => (
                    <tr key={r.name} className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{r.name}</td>
                      <td className="py-3 px-4">{r.capital}</td>
                      <td className="text-right py-3 px-4 font-jetbrains-mono">{r.prefectures}</td>
                      <td className="text-right py-3 px-4 font-jetbrains-mono">{r.enterprises}</td>
                      <td className="text-right py-3 px-4 font-jetbrains-mono">{r.population.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-bg-elevated rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", r.coverage >= 90 ? "bg-status-compliant" : r.coverage >= 80 ? "bg-status-warning" : "bg-status-critical")} style={{ width: `${r.coverage}%` }} />
                          </div>
                          <span className="font-jetbrains-mono text-xs">{r.coverage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-bg-elevated">
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Action</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Utilisateur</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Cible</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Timestamp</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Résultat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/50 transition-colors">
                        <td className="py-3 px-4 font-jetbrains-mono text-xs text-text-muted">{log.id}</td>
                        <td className="py-3 px-4">{log.action}</td>
                        <td className="py-3 px-4 font-medium">{log.user}</td>
                        <td className="py-3 px-4 font-jetbrains-mono text-xs">{log.target}</td>
                        <td className="py-3 px-4 text-xs">{log.timestamp}</td>
                        <td className="py-3 px-4">
                          <StatusBadge variant={log.result === "success" ? "compliant" : "critical"} className="text-[10px] h-5 px-2">
                            {log.result === "success" ? "Succès" : "Échec"}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "backups" && (
            <div className="space-y-4">
              <h3 className="font-playfair-display text-lg font-semibold">Sauvegardes système</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Base de données principale", date: "05/06/2026 03:00", size: "2.4 GB", status: "success" },
                  { name: "Fichiers joints", date: "05/06/2026 03:15", size: "8.7 GB", status: "success" },
                  { name: "Configuration système", date: "05/06/2026 02:45", size: "12 MB", status: "success" },
                  { name: "Logs applicatifs", date: "04/06/2026 23:59", size: "450 MB", status: "success" },
                  { name: "Base CNTI (sync)", date: "04/06/2026 22:00", size: "1.1 GB", status: "success" },
                  { name: "Export national 2025", date: "01/06/2026 08:00", size: "156 MB", status: "success" },
                ].map((b, idx) => (
                  <div key={idx} className="p-4 bg-bg-elevated rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{b.name}</p>
                      <StatusBadge variant={b.status === "success" ? "compliant" : "critical"} className="text-[10px] h-5 px-2">
                        {b.status === "success" ? "OK" : "Erreur"}
                      </StatusBadge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Clock size={12} /> {b.date}</span>
                      <span className="font-jetbrains-mono">{b.size}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1 text-xs h-8">Restaurer</Button>
                      <Button variant="ghost" size="sm" className="h-8"><Download size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4"><Database size={16} className="mr-2" /> Lancer une sauvegarde manuelle</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
