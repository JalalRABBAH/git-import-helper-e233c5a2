import { useState } from "react"
import {
  Calendar,
  ClipboardCheck,
  Camera,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Clock,
  MapPin,
  User,
  Search,
  Filter,
} from "lucide-react"
import StatusBadge from "@/components/StatusBadge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const checklistCategories = [
  {
    id: "A",
    name: "Conformité administrative",
    items: [
      { id: "A1", text: "Agrément en cours de validité", points: 4 },
      { id: "A2", text: "Registre du commerce à jour", points: 3 },
      { id: "A3", text: "Attestation fiscale valide", points: 3 },
      { id: "A4", text: "CNSS employeurs à jour", points: 3 },
      { id: "A5", text: "Contrat d'assurance RC valide", points: 3 },
      { id: "A6", text: "Autorisation d'exploitation", points: 4 },
      { id: "A7", text: "Procuration des signataires vérifiée", points: 2 },
      { id: "A8", text: "PV d'assemblée générale (SA/SARL)", points: 2 },
      { id: "A9", text: "RIB entreprise conforme", points: 2 },
      { id: "A10", text: "Attestation sur l'honneur", points: 2 },
    ],
  },
  {
    id: "B",
    name: "Conformité technique",
    items: [
      { id: "B1", text: "Modèles homologués CNTI", points: 5 },
      { id: "B2", text: "Certificats de conformité des engins", points: 4 },
      { id: "B3", text: "Marquage CE visible et lisible", points: 3 },
      { id: "B4", text: "Cylindrées conformes à la déclaration", points: 4 },
      { id: "B5", text: "Numéros de série enregistrés", points: 4 },
      { id: "B6", text: "Manuels d'utilisation en français", points: 2 },
      { id: "B7", text: "Kit sécurité fourni (casque, gants)", points: 3 },
      { id: "B8", text: "Équipements antivol présents", points: 2 },
      { id: "B9", text: "Conformité émission CO2", points: 3 },
      { id: "B10", text: "Véhicules électriques — certification batterie", points: 4 },
    ],
  },
  {
    id: "C",
    name: "Conformité fiscale",
    items: [
      { id: "C1", text: "Déclaration TVA mensuelle à jour", points: 4 },
      { id: "C2", text: "Taxe sur la valeur ajoutée versée", points: 4 },
      { id: "C3", text: "Droit d'enregistrement payé", points: 3 },
      { id: "C4", text: "Taxe d'apprentissage", points: 2 },
      { id: "C5", text: "Contribution patronale formation", points: 2 },
      { id: "C6", text: "Impôt sur les sociétés (IS) — quitus", points: 4 },
      { id: "C7", text: "Taxes communales à jour", points: 3 },
      { id: "C8", text: "Redevance OHADA", points: 3 },
      { id: "C9", text: "Taxe de régie des engins", points: 3 },
      { id: "C10", text: "Justificatifs de paiement archivés", points: 2 },
    ],
  },
  {
    id: "D",
    name: "Conformité commerciale",
    items: [
      { id: "D1", text: "Prix affichés et conformes au barême", points: 4 },
      { id: "D2", text: "Contrats de vente conformes", points: 3 },
      { id: "D3", text: "Garanties constructeur transmises", points: 3 },
      { id: "D4", text: "Facturation électronique opérationnelle", points: 4 },
      { id: "D5", text: "Politique de retour affichée", points: 2 },
      { id: "D6", text: "Conditions générales de vente", points: 2 },
      { id: "D7", text: "Protection des données clients (loi 010-2004)", points: 3 },
      { id: "D8", text: "Service après-vente accessible", points: 3 },
      { id: "D9", text: "Pièces détachées disponibles", points: 3 },
      { id: "D10", text: "Catalogue produits à jour", points: 2 },
    ],
  },
  {
    id: "E",
    name: "Sécurité & Environnement",
    items: [
      { id: "E1", text: "Plan d'évacuation affiché", points: 3 },
      { id: "E2", text: "Extincteurs contrôlés et accessibles", points: 3 },
      { id: "E3", text: "Issue de secours dégagées", points: 3 },
      { id: "E4", text: "Stockage carburant sécurisé", points: 4 },
      { id: "E5", text: "Gestion des déchets (huiles, batteries)", points: 3 },
      { id: "E6", text: "Éclairage sécurité fonctionnel", points: 2 },
      { id: "E7", text: "Premiers secours — trousse complète", points: 2 },
      { id: "E8", text: "Formation incendie du personnel", points: 2 },
      { id: "E9", text: "Conformité accessibilité PMR", points: 2 },
      { id: "E10", text: "Suivi consommation énergétique", points: 2 },
    ],
  },
]

const mockInspections = [
  { id: "INS-2026-0150", enterprise: "Faso Moto SARL", date: "2026-06-05", status: "completed", score: 94, inspector: "Insp. Kaboré", region: "Centre", type: "Contrôle annuel" },
  { id: "INS-2026-0149", enterprise: "Burkina Wheels SA", date: "2026-06-04", status: "completed", score: 88, inspector: "Insp. Ouedraogo", region: "Hauts-Bassins", type: "Contrôle inopiné" },
  { id: "INS-2026-0148", enterprise: "Sahel Motos Distribution", date: "2026-06-03", status: "in_progress", score: 45, inspector: "Insp. Kaboré", region: "Centre-Nord", type: "Contrôle annuel" },
  { id: "INS-2026-0147", enterprise: "Ouaga Moto Import", date: "2026-06-02", status: "completed", score: 91, inspector: "Insp. Ilboudo", region: "Centre", type: "Suivi" },
  { id: "INS-2026-0146", enterprise: "Bobo Moto Plus", date: "2026-06-01", status: "completed", score: 82, inspector: "Insp. Ouedraogo", region: "Hauts-Bassins", type: "Contrôle annuel" },
  { id: "INS-2026-0145", enterprise: "Koudouglou Motos", date: "2026-05-28", status: "completed", score: 67, inspector: "Insp. Sawadogo", region: "Cascades", type: "Contrôle inopiné" },
  { id: "INS-2026-0144", enterprise: "Moto Express BF", date: "2026-05-25", status: "completed", score: 79, inspector: "Insp. Kambou", region: "Est", type: "Contrôle annuel" },
  { id: "INS-2026-0143", enterprise: "Nord Moto Services", date: "2026-05-22", status: "in_progress", score: 52, inspector: "Insp. Yaméogo", region: "Nord", type: "Contrôle annuel" },
  { id: "INS-2026-0142", enterprise: "Ouest Riders SARL", date: "2026-05-20", status: "completed", score: 95, inspector: "Insp. Compaoré", region: "Boucle du Mouhoun", type: "Suivi" },
]

const photoEvidence = [
  { id: 1, label: "Façade magasin", type: "before" },
  { id: 2, label: "Stock engins", type: "before" },
  { id: 3, label: "Espace SAV", type: "after" },
  { id: 4, label: "Extincteurs", type: "after" },
  { id: 5, label: "Registre conformité", type: "before" },
  { id: 6, label: "Point de vente", type: "after" },
]

export default function Inspections() {
  const [activeInspection, setActiveInspection] = useState<string | null>(null)
  const [checklistState, setChecklistState] = useState<Record<string, "checked" | "unchecked" | "na">>({})
  const [activeCategory, setActiveCategory] = useState("A")
  const [view, setView] = useState<"calendar" | "detail">("calendar")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const currentMonth = "Juin 2026"
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1)
  const startDay = 1

  const toggleCheck = (itemId: string) => {
    setChecklistState((prev) => {
      const curr = prev[itemId]
      if (curr === "checked") return { ...prev, [itemId]: "unchecked" }
      if (curr === "unchecked") return { ...prev, [itemId]: "checked" }
      return { ...prev, [itemId]: "checked" }
    })
  }

  const getScore = () => {
    let total = 0
    let earned = 0
    checklistCategories.forEach((cat) =>
      cat.items.forEach((item) => {
        total += item.points
        if (checklistState[item.id] === "checked") earned += item.points
      })
    )
    return total > 0 ? Math.round((earned / total) * 100) : 0
  }

  const score = getScore()

  const filteredInspections = mockInspections.filter((i) => {
    const matchesSearch = searchTerm === "" || i.enterprise.toLowerCase().includes(searchTerm.toLowerCase()) || i.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || i.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (view === "detail" && activeInspection) {
    const inspection = mockInspections.find((i) => i.id === activeInspection)
    if (!inspection) return null

    return (
      <div className="space-y-6 animate-slide-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon-sm" onClick={() => setView("calendar")}>
              <ChevronLeft size={16} />
            </Button>
            <div>
              <h1 className="font-playfair-display text-2xl font-bold">{inspection.enterprise}</h1>
              <p className="text-sm text-text-muted">{inspection.id} — {inspection.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge variant={inspection.status === "completed" ? "compliant" : "warning"}>
              {inspection.status === "completed" ? "Terminé" : "En cours"}
            </StatusBadge>
            <div className="text-right">
              <p className="text-xs text-text-muted">Score</p>
              <p className={cn("font-jetbrains-mono text-2xl font-bold", score >= 90 ? "text-status-compliant" : score >= 70 ? "text-status-warning" : "text-status-critical")}>
                {score}%
              </p>
            </div>
          </div>
        </div>

        {/* Score Bar */}
        <div className="bg-white rounded-xl card-shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Score en temps réel</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-status-compliant" />
                <span>{Object.values(checklistState).filter((v) => v === "checked").length} conformes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle size={14} className="text-status-critical" />
                <span>{Object.values(checklistState).filter((v) => v === "unchecked").length} non-conformes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertCircle size={14} className="text-text-muted" />
                <span>{50 - Object.values(checklistState).filter((v) => v !== undefined).length} à vérifier</span>
              </div>
            </div>
          </div>
          <Progress value={score} className="h-3" />
          <div className="flex justify-between mt-1 text-xs text-text-muted">
            <span>0%</span>
            <span>Seuil: 70%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checklist */}
          <div className="lg:col-span-2 bg-white rounded-xl card-shadow p-5">
            <h3 className="font-playfair-display text-lg font-semibold mb-4">Checklist d'inspection (50 points)</h3>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {checklistCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "h-8 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    activeCategory === cat.id
                      ? "bg-gold-accent text-white"
                      : "bg-bg-elevated text-text-secondary hover:bg-border-subtle"
                  )}
                >
                  {cat.id}. {cat.name}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {checklistCategories
                .find((c) => c.id === activeCategory)
                ?.items.map((item) => {
                  const state = checklistState[item.id]
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border",
                        state === "checked"
                          ? "border-status-compliant bg-status-compliant-bg"
                          : state === "unchecked"
                          ? "border-status-critical bg-status-critical-bg"
                          : "border-border-subtle hover:bg-bg-elevated"
                      )}
                    >
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0",
                          state === "checked"
                            ? "bg-status-compliant border-status-compliant"
                            : state === "unchecked"
                            ? "bg-status-critical border-status-critical"
                            : "border-border-default"
                        )}
                      >
                        {state === "checked" && <CheckCircle size={14} className="text-white" />}
                        {state === "unchecked" && <XCircle size={14} className="text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={cn("text-sm", state === "checked" ? "line-through opacity-60" : "")}>
                          {item.text}
                        </p>
                      </div>
                      <span className="text-xs font-jetbrains-mono text-text-muted shrink-0">{item.points} pts</span>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-6">
            {/* Inspector Info */}
            <div className="bg-white rounded-xl card-shadow p-5">
              <h4 className="font-medium mb-3">Inspecteur</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-institutional-navy flex items-center justify-center text-white text-sm font-semibold">
                  {inspection.inspector.split(" ")[1]?.[0] || "I"}
                </div>
                <div>
                  <p className="text-sm font-medium">{inspection.inspector}</p>
                  <p className="text-xs text-text-muted">Inspection {inspection.type.toLowerCase()}</p>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-text-muted">
                  <Calendar size={14} /> {inspection.date}
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <MapPin size={14} /> {inspection.region}
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Clock size={14} /> Début 08:30 — Durée estimée 4h
                </div>
              </div>
            </div>

            {/* Photo Evidence */}
            <div className="bg-white rounded-xl card-shadow p-5">
              <h4 className="font-medium mb-3">Preuves photographiques</h4>
              <div className="grid grid-cols-2 gap-2">
                {photoEvidence.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg bg-bg-elevated border border-border-subtle flex flex-col items-center justify-center gap-1 hover:border-gold-accent transition-colors cursor-pointer"
                  >
                    <Camera size={20} className="text-text-muted" />
                    <span className="text-[10px] text-text-muted text-center px-1">{photo.label}</span>
                    <StatusBadge variant={photo.type === "before" ? "warning" : "compliant"} className="text-[9px] h-4 px-1.5">
                      {photo.type === "before" ? "Avant" : "Après"}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </div>

            {/* Before/After Comparison */}
            <div className="bg-white rounded-xl card-shadow p-5">
              <h4 className="font-medium mb-3">Comparaison avant/après</h4>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-status-warning-bg rounded-lg text-center">
                  <p className="text-xs text-status-warning font-medium mb-1">AVANT</p>
                  <p className="text-2xl font-jetbrains-mono font-bold text-status-warning">{inspection.score - 12}%</p>
                </div>
                <div className="flex items-center">
                  <ChevronRight size={16} className="text-text-muted" />
                </div>
                <div className="flex-1 p-3 bg-status-compliant-bg rounded-lg text-center">
                  <p className="text-xs text-status-compliant font-medium mb-1">APRÈS</p>
                  <p className="text-2xl font-jetbrains-mono font-bold text-status-compliant">{inspection.score}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair-display text-3xl font-bold">Contrôle et Inspection</h1>
          <p className="text-text-muted mt-1">Planification et suivi des contrôles sur le terrain</p>
        </div>
        <Button>
          <ClipboardCheck size={16} className="mr-2" /> Nouvelle inspection
        </Button>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl card-shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-playfair-display text-lg font-semibold flex items-center gap-2">
            <Calendar size={20} className="text-gold-accent" />
            {currentMonth}
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm"><ChevronLeft size={16} /></Button>
            <Button variant="outline" size="icon-sm"><ChevronRight size={16} /></Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-text-muted py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay - 1 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {daysInMonth.map((day) => {
            const hasInspection = [5, 12, 15, 18, 22, 25, 28].includes(day)
            const isToday = day === 5
            return (
              <button
                key={day}
                onClick={() => {
                  if (hasInspection) {
                    setActiveInspection(mockInspections.find((i) => i.date.endsWith(`-0${day}`) || i.date.endsWith(`-${day}`))?.id || null)
                    setView("detail")
                  }
                }}
                className={cn(
                  "h-10 rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center relative",
                  isToday ? "bg-gold-accent text-white" : hasInspection ? "bg-status-info-bg text-status-info hover:bg-status-info/20" : "hover:bg-bg-elevated text-text-primary"
                )}
              >
                {day}
                {hasInspection && !isToday && (
                  <div className="w-1 h-1 rounded-full bg-status-info mt-0.5" />
                )}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-status-info-bg" />
            <span>Inspection programmée</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gold-accent" />
            <span>Aujourd'hui</span>
          </div>
        </div>
      </div>

      {/* Inspection History */}
      <div className="bg-white rounded-xl card-shadow p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-playfair-display text-lg font-semibold">Historique des inspections</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="h-9 pl-8 pr-4 rounded-lg border border-border-default text-sm focus:border-gold-accent outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border-default text-sm focus:border-gold-accent outline-none bg-white"
            >
              <option value="all">Tous statuts</option>
              <option value="completed">Terminé</option>
              <option value="in_progress">En cours</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">ID</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Entreprise</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Date</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Type</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Inspecteur</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Score</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Statut</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInspections.map((ins) => (
                <tr
                  key={ins.id}
                  className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/50 transition-colors"
                >
                  <td className="py-3 px-4 font-jetbrains-mono text-xs text-text-muted">{ins.id}</td>
                  <td className="py-3 px-4 font-medium">{ins.enterprise}</td>
                  <td className="py-3 px-4">{ins.date}</td>
                  <td className="py-3 px-4">{ins.type}</td>
                  <td className="py-3 px-4 flex items-center gap-1.5">
                    <User size={12} className="text-text-muted" /> {ins.inspector}
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={cn(
                      "font-jetbrains-mono font-bold",
                      ins.score >= 90 ? "text-status-compliant" : ins.score >= 70 ? "text-status-warning" : "text-status-critical"
                    )}>
                      {ins.score}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge variant={ins.status === "completed" ? "compliant" : "warning"}>
                      {ins.status === "completed" ? "Terminé" : "En cours"}
                    </StatusBadge>
                  </td>
                  <td className="text-right py-3 px-4">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => { setActiveInspection(ins.id); setView("detail") }}
                    >
                      <BarChart3 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
