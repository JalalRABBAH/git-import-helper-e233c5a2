import { useState } from "react"
import {
  Ban,
  MapPin,
  UserX,
  History,
  Globe,
  Search,
  Wifi,
  WifiOff,
  Shield,
} from "lucide-react"
import StatusBadge from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import BurkinaMap from "@/components/BurkinaMap"
import { cn } from "@/lib/utils"

type TabId = "models" | "zones" | "persons" | "history" | "api"

const bannedModels = [
  { id: "MOD-2026-0015", brand: "TVS", model: "Apache RTR 310", reason: "Non-conformite emission EURO 4", date: "01/06/2026", category: "Emission", status: "active" },
  { id: "MOD-2026-0014", brand: "Bajaj", model: "Pulsar NS400Z", reason: "Absence homologation CNTI", date: "28/05/2026", category: "Homologation", status: "active" },
  { id: "MOD-2026-0013", brand: "Yamaha", model: "YZF-R1M", reason: "Cylindree > 1000cc non autorisee", date: "25/05/2026", category: "Cylindree", status: "active" },
  { id: "MOD-2026-0012", brand: "Honda", model: "CBR1000RR-R", reason: "Cylindree > 1000cc non autorisee", date: "25/05/2026", category: "Cylindree", status: "active" },
  { id: "MOD-2026-0011", brand: "Generic", model: "Retro 125 (contrefacon)", reason: "Contrefacon certifiee", date: "20/05/2026", category: "Contrefacon", status: "active" },
  { id: "MOD-2026-0010", brand: "KTM", model: "1290 Super Duke R", reason: "Cylindree > 1000cc non autorisee", date: "18/05/2026", category: "Cylindree", status: "active" },
  { id: "MOD-2026-0009", brand: "Apsonic", model: "AP200-XX (non homologue)", reason: "Absence certificat conformite", date: "15/05/2026", category: "Homologation", status: "active" },
  { id: "MOD-2026-0008", brand: "Suzuki", model: "Hayabusa GSX1300R", reason: "Vitesse max > 300km/h interdite", date: "10/05/2026", category: "Performance", status: "active" },
  { id: "MOD-2026-0007", brand: "Ducati", model: "Panigale V4", reason: "Cylindree > 1000cc non autorisee", date: "05/05/2026", category: "Cylindree", status: "lifted" },
  { id: "MOD-2026-0006", brand: "Royal Enfield", model: "Himalayan 452", reason: "Non-conformite freinage", date: "28/04/2026", category: "Securite", status: "active" },
  { id: "MOD-2026-0005", brand: "BMW", model: "S1000RR", reason: "Cylindree > 1000cc non autorisee", date: "20/04/2026", category: "Cylindree", status: "active" },
  { id: "MOD-2026-0004", brand: "Hero", model: "Xtreme 200S (lot defectueux)", reason: "Defaut moteur lot #4521", date: "15/04/2026", category: "Defectuosite", status: "active" },
  { id: "MOD-2026-0003", brand: "Kawasaki", model: "Ninja ZX-10R", reason: "Cylindree > 1000cc non autorisee", date: "10/04/2026", category: "Cylindree", status: "active" },
  { id: "MOD-2026-0002", brand: "TVS", model: "iQube (batterie defectueuse)", reason: "Risque incendie batterie", date: "01/04/2026", category: "Securite", status: "lifted" },
  { id: "MOD-2026-0001", brand: "Harley-Davidson", model: "Sportster S", reason: "Importation non autorisee", date: "15/03/2026", category: "Import", status: "active" },
]

const restrictedZones = [
  { name: "Zone securisee du Palais", type: "permanent", center: "Ouagadougou", radius: "2 km", reason: "Securite presidentielle" },
  { name: "Zone militaire de Kamboinsin", type: "permanent", center: "Ouagadougou", radius: "5 km", reason: "Base militaire" },
  { name: "Zone frontaliere Mali", type: "temporary", center: "Djibo", radius: "20 km", reason: "Etat d'urgence", expiry: "30/09/2026" },
  { name: "Zone frontaliere Niger", type: "temporary", center: "Dori", radius: "15 km", reason: "Etat d'urgence", expiry: "30/09/2026" },
  { name: "Parc national du W", type: "permanent", center: "Tansarga", radius: "10 km", reason: "Protection environnementale" },
  { name: "Aeroport international", type: "permanent", center: "Ouagadougou", radius: "3 km", reason: "Securite aeroportuaire" },
  { name: "Zone industrielle SIAO", type: "temporary", center: "Bobo-Dioulasso", radius: "1 km", reason: "Travaux", expiry: "31/12/2026" },
]

const bannedPersons = [
  { id: "PER-2026-0008", name: "Abdoulaye K.", reason: "Fraude fiscale repetee", date: "15/05/2026", expiry: "15/05/2028", type: "Entrepreneur" },
  { id: "PER-2026-0007", name: "Mariam S.", reason: "Contrefacon de documents", date: "01/05/2026", expiry: "01/05/2027", type: "Importateur" },
  { id: "PER-2026-0006", name: "Sebastien L.", reason: "Importation illegale", date: "20/04/2026", expiry: "20/04/2029", type: "Negociant" },
  { id: "PER-2026-0005", name: "Issouf T.", reason: "Blanchiment d'argent", date: "10/04/2026", expiry: "10/04/2028", type: "Commercant" },
  { id: "PER-2026-0004", name: "Claire Z.", reason: "Faux agrement", date: "25/03/2026", expiry: "25/03/2027", type: "Consultant" },
  { id: "PER-2026-0003", name: "Kader B.", reason: "Trafic de pieces detachees", date: "15/03/2026", expiry: "15/03/2028", type: "Mecanicien" },
  { id: "PER-2026-0002", name: "Fatou K.", reason: "Evasion fiscale", date: "01/03/2026", expiry: "01/03/2027", type: "Commercant" },
  { id: "PER-2026-0001", name: "Jean-Paul M.", reason: "Corruption d'agents", date: "15/02/2026", expiry: "15/02/2029", type: "Importateur" },
]

const historyTimeline = [
  { date: "01/06/2026", event: "Arrete d'interdiction TVS Apache RTR 310", type: "ban", actor: "Min. Commerce" },
  { date: "28/05/2026", event: "Interdiction Bajaj Pulsar NS400Z", type: "ban", actor: "Min. Commerce" },
  { date: "25/05/2026", event: "Interdiction cylindrees >1000cc - 4 modeles", type: "ban", actor: "CNTI" },
  { date: "20/05/2026", event: "Levee interdiction TVS iQube (correction batterie)", type: "lift", actor: "Min. Commerce" },
  { date: "15/05/2026", event: "Personne interdite - Abdoulaye K.", type: "ban_person", actor: "Tribunal" },
  { date: "10/05/2026", event: "Extension zone frontaliere Mali (+5km)", type: "zone_update", actor: "Min. Securite" },
  { date: "01/04/2026", event: "Interdiction temporaire TVS iQube", type: "ban", actor: "CNTI" },
  { date: "15/03/2026", event: "Interdiction Harley-Davidson Sportster S", type: "ban", actor: "Douanes" },
  { date: "01/03/2026", event: "Mise a jour API interdictions v2.3", type: "api", actor: "DSI" },
  { date: "15/02/2026", event: "Personne interdite - Jean-Paul M.", type: "ban_person", actor: "Tribunal" },
]

const apiStatus = [
  { name: "API Interdictions", status: "online", uptime: "99.97%", lastCheck: "Il y a 30s", version: "v2.3.1" },
  { name: "API Modeles", status: "online", uptime: "99.95%", lastCheck: "Il y a 45s", version: "v2.3.1" },
  { name: "API Zones", status: "online", uptime: "99.98%", lastCheck: "Il y a 15s", version: "v2.3.1" },
  { name: "API Personnes", status: "degraded", uptime: "98.50%", lastCheck: "Il y a 2min", version: "v2.3.0" },
  { name: "Sync CNTI", status: "online", uptime: "99.90%", lastCheck: "Il y a 1min", version: "v1.8.2" },
  { name: "Sync Douanes", status: "online", uptime: "99.92%", lastCheck: "Il y a 3min", version: "v1.7.5" },
]

export default function Prohibitions() {
  const [activeTab, setActiveTab] = useState<TabId>("models")
  const [searchTerm, setSearchTerm] = useState("")

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "models", label: "Modeles interdits", icon: <Ban size={16} /> },
    { id: "zones", label: "Zones restreintes", icon: <MapPin size={16} /> },
    { id: "persons", label: "Personnes interdites", icon: <UserX size={16} /> },
    { id: "history", label: "Historique", icon: <History size={16} /> },
    { id: "api", label: "API & Sync", icon: <Globe size={16} /> },
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-playfair-display text-3xl font-bold">Gestion des Interdictions</h1>
        <p className="text-text-muted mt-1">Modeles, zones et personnes interdits - synchronisation inter-agences</p>
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
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "models" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un modele..."
                    className="w-full h-9 pl-8 pr-4 rounded-lg border border-border-default text-sm focus:border-gold-accent outline-none"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-bg-elevated">
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Marque</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Modele</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Motif</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Categorie</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bannedModels
                      .filter((m) => searchTerm === "" || m.model.toLowerCase().includes(searchTerm.toLowerCase()) || m.brand.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((m) => (
                      <tr key={m.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/50 transition-colors">
                        <td className="py-3 px-4 font-jetbrains-mono text-xs text-text-muted">{m.id}</td>
                        <td className="py-3 px-4 font-medium">{m.brand}</td>
                        <td className="py-3 px-4">{m.model}</td>
                        <td className="py-3 px-4 text-xs max-w-[200px]">{m.reason}</td>
                        <td className="py-3 px-4"><StatusBadge variant="info" className="text-[10px] h-5 px-2">{m.category}</StatusBadge></td>
                        <td className="py-3 px-4">{m.date}</td>
                        <td className="py-3 px-4"><StatusBadge variant={m.status === "active" ? "critical" : "compliant"}>{m.status === "active" ? "Actif" : "Leve"}</StatusBadge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "zones" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-playfair-display text-lg font-semibold mb-3">Zones restreintes</h3>
                {restrictedZones.map((zone, idx) => (
                  <div key={idx} className="p-4 border border-border-subtle rounded-lg hover:border-gold-accent/30 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{zone.name}</p>
                      <StatusBadge variant={zone.type === "permanent" ? "critical" : "warning"} className="text-[10px] h-5 px-2">
                        {zone.type === "permanent" ? "Permanent" : "Temporaire"}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-text-muted mb-2">{zone.reason}</p>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {zone.center}</span>
                      <span>Rayon: {zone.radius}</span>
                      {zone.expiry && <span>Expire: {zone.expiry}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-playfair-display text-lg font-semibold mb-3">Vue cartographique</h3>
                <div className="bg-white rounded-xl border border-border-subtle p-4">
                  <BurkinaMap className="h-[400px]" />
                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-status-critical" />
                      <span className="text-text-muted">Permanent</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-status-warning" />
                      <span className="text-text-muted">Temporaire</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "persons" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-elevated">
                    <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Nom</th>
                    <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Motif</th>
                    <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Expiration</th>
                  </tr>
                </thead>
                <tbody>
                  {bannedPersons.map((p) => (
                    <tr key={p.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/50 transition-colors">
                      <td className="py-3 px-4 font-jetbrains-mono text-xs text-text-muted">{p.id}</td>
                      <td className="py-3 px-4 font-medium">{p.name}</td>
                      <td className="py-3 px-4">{p.type}</td>
                      <td className="py-3 px-4 text-xs">{p.reason}</td>
                      <td className="py-3 px-4">{p.date}</td>
                      <td className="py-3 px-4 font-jetbrains-mono text-xs">{p.expiry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-0">
              <h3 className="font-playfair-display text-lg font-semibold mb-4">Historique des decisions</h3>
              <div className="relative pl-6 border-l-2 border-border-subtle space-y-6">
                {historyTimeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className={cn(
                      "absolute -left-[29px] w-4 h-4 rounded-full border-2",
                      item.type === "ban" ? "bg-status-critical border-status-critical" :
                      item.type === "lift" ? "bg-status-compliant border-status-compliant" :
                      item.type === "ban_person" ? "bg-status-warning border-status-warning" :
                      "bg-status-info border-status-info"
                    )} />
                    <div className="p-4 bg-bg-elevated rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-jetbrains-mono text-xs text-text-muted">{item.date}</span>
                        <StatusBadge variant={item.type === "ban" ? "critical" : item.type === "lift" ? "compliant" : "info"} className="text-[10px] h-5 px-2">
                          {item.type === "ban" ? "Interdiction" : item.type === "lift" ? "Levee" : item.type === "ban_person" ? "Personne" : "API"}
                        </StatusBadge>
                        <span className="text-xs text-text-muted">{item.actor}</span>
                      </div>
                      <p className="text-sm font-medium">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-4">
              <h3 className="font-playfair-display text-lg font-semibold mb-3">Etat des services API</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apiStatus.map((api) => (
                  <div key={api.name} className={cn("p-4 rounded-lg border", api.status === "online" ? "border-status-compliant/20 bg-status-compliant-bg" : "border-status-warning/20 bg-status-warning-bg")}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{api.name}</p>
                      {api.status === "online" ? <Wifi size={16} className="text-status-compliant" /> : <WifiOff size={16} className="text-status-warning" />}
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Uptime</span>
                        <span className="font-jetbrains-mono font-medium">{api.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Derniere verif.</span>
                        <span>{api.lastCheck}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Version</span>
                        <span className="font-jetbrains-mono">{api.version}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-bg-elevated rounded-lg">
                <h4 className="text-sm font-medium mb-2">Statistiques de synchronisation</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="font-jetbrains-mono text-2xl font-bold text-status-compliant">2.4M</p>
                    <p className="text-xs text-text-muted">Requetes/jour</p>
                  </div>
                  <div>
                    <p className="font-jetbrains-mono text-2xl font-bold text-status-info">142ms</p>
                    <p className="text-xs text-text-muted">Latence moyenne</p>
                  </div>
                  <div>
                    <p className="font-jetbrains-mono text-2xl font-bold text-chart-gold">99.92%</p>
                    <p className="text-xs text-text-muted">Disponibilite</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
