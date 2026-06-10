import { useState } from "react"
import {
  Search,
  Filter,
  FileCheck,
  Clock,
  XCircle,
  CheckCircle,
  PauseCircle,
  ChevronRight,
  Eye,
  Download,
  Stamp,
  Shield,
  Building2,
  User,
  Calendar,
  FileText,
} from "lucide-react"
import StatusBadge from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"

interface Agreement {
  id: string
  enterprise: string
  responsible: string
  type: string
  submittedDate: string
  status: "pending" | "review" | "approved" | "rejected" | "suspended"
  step: number
  region: string
  capital: number
  employees: number
}

const agreements: Agreement[] = [
  { id: "AGR-2026-0142", enterprise: "Faso Moto SARL", responsible: "Amadou Kaboré", type: "Renouvellement", submittedDate: "2026-05-28", status: "approved", step: 5, region: "Centre", capital: 25000000, employees: 42 },
  { id: "AGR-2026-0141", enterprise: "Burkina Wheels SA", responsible: "Marie Ouedraogo", type: "Nouvelle", submittedDate: "2026-05-25", status: "review", step: 3, region: "Hauts-Bassins", capital: 50000000, employees: 68 },
  { id: "AGR-2026-0140", enterprise: "Sahel Motos Distribution", responsible: "Issouf Traoré", type: "Modification", submittedDate: "2026-05-22", status: "pending", step: 2, region: "Centre-Nord", capital: 15000000, employees: 18 },
  { id: "AGR-2026-0139", enterprise: "Ouaga Moto Import", responsible: "Jean Baptiste", type: "Nouvelle", submittedDate: "2026-05-20", status: "review", step: 3, region: "Centre", capital: 75000000, employees: 95 },
  { id: "AGR-2026-0138", enterprise: "Bobo Moto Plus", responsible: "Abdoulaye Sanou", type: "Renouvellement", submittedDate: "2026-05-18", status: "approved", step: 5, region: "Hauts-Bassins", capital: 35000000, employees: 55 },
  { id: "AGR-2026-0137", enterprise: "Koudouglou Motos", responsible: "Fatima Bationo", type: "Nouvelle", submittedDate: "2026-05-15", status: "rejected", step: 4, region: "Cascades", capital: 8000000, employees: 12 },
  { id: "AGR-2026-0136", enterprise: "Moto Express BF", responsible: "Kofi Mensah", type: "Modification", submittedDate: "2026-05-12", status: "review", step: 3, region: "Est", capital: 20000000, employees: 28 },
  { id: "AGR-2026-0135", enterprise: "Nord Moto Services", responsible: "Hamidou Yaméogo", type: "Nouvelle", submittedDate: "2026-05-10", status: "pending", step: 1, region: "Nord", capital: 12000000, employees: 15 },
  { id: "AGR-2026-0134", enterprise: "Ouest Riders SARL", responsible: "Aïssata Koné", type: "Renouvellement", submittedDate: "2026-05-08", status: "approved", step: 5, region: "Boucle du Mouhoun", capital: 18000000, employees: 22 },
  { id: "AGR-2026-0133", enterprise: "Centre Sud Motos", responsible: "Blaise Compaoré", type: "Nouvelle", submittedDate: "2026-05-05", status: "review", step: 2, region: "Centre-Sud", capital: 22000000, employees: 31 },
  { id: "AGR-2026-0132", enterprise: "Plateau Moto Hub", responsible: "Sylvie Ilboudo", type: "Modification", submittedDate: "2026-05-03", status: "suspended", step: 3, region: "Plateau-Central", capital: 30000000, employees: 45 },
  { id: "AGR-2026-0131", enterprise: "Sud-Ouest Moto Park", responsible: "Gilles Bamba", type: "Nouvelle", submittedDate: "2026-04-30", status: "pending", step: 1, region: "Sud-Ouest", capital: 14000000, employees: 19 },
  { id: "AGR-2026-0130", enterprise: "Moto Royal SA", responsible: "Claire Zongo", type: "Renouvellement", submittedDate: "2026-04-28", status: "approved", step: 5, region: "Centre", capital: 60000000, employees: 78 },
  { id: "AGR-2026-0129", enterprise: "Bassins Moto Pro", responsible: "Sékou Diabaté", type: "Nouvelle", submittedDate: "2026-04-25", status: "review", step: 3, region: "Hauts-Bassins", capital: 42000000, employees: 52 },
  { id: "AGR-2026-0128", enterprise: "Dori Moto Services", responsible: "Mahamadi Sawadogo", type: "Modification", submittedDate: "2026-04-22", status: "pending", step: 2, region: "Sahel", capital: 10000000, employees: 14 },
  { id: "AGR-2026-0127", enterprise: "Ziniaré Moto Plus", responsible: "Aminata Sankara", type: "Nouvelle", submittedDate: "2026-04-20", status: "approved", step: 5, region: "Plateau-Central", capital: 16000000, employees: 20 },
  { id: "AGR-2026-0126", enterprise: "Kaya Moto Express", responsible: "Oumarou Zoromé", type: "Renouvellement", submittedDate: "2026-04-18", status: "review", step: 4, region: "Centre-Nord", capital: 13000000, employees: 17 },
  { id: "AGR-2026-0125", enterprise: "Tenkodogo Moto Land", responsible: "Lassina Zerbo", type: "Nouvelle", submittedDate: "2026-04-15", status: "pending", step: 1, region: "Centre-Est", capital: 11000000, employees: 16 },
  { id: "AGR-2026-0124", enterprise: "Fada Moto Import", responsible: "Souleymane Maïga", type: "Modification", submittedDate: "2026-04-12", status: "suspended", step: 3, region: "Est", capital: 25000000, employees: 33 },
  { id: "AGR-2026-0123", enterprise: "Gorom-Gorom Moto", responsible: "Hassan Barry", type: "Nouvelle", submittedDate: "2026-04-10", status: "pending", step: 2, region: "Sahel", capital: 9000000, employees: 11 },
  { id: "AGR-2026-0122", enterprise: "Banfora Moto Center", responsible: "Awa Touré", type: "Renouvellement", submittedDate: "2026-04-08", status: "approved", step: 5, region: "Cascades", capital: 20000000, employees: 26 },
  { id: "AGR-2026-0121", enterprise: "Manga Moto Hub", responsible: "Norbert Kambou", type: "Nouvelle", submittedDate: "2026-04-05", status: "rejected", step: 2, region: "Centre-Sud", capital: 7000000, employees: 9 },
  { id: "AGR-2026-0120", enterprise: "Koudougou Moto Park", responsible: "François Lompo", type: "Modification", submittedDate: "2026-04-02", status: "review", step: 3, region: "Centre-Ouest", capital: 28000000, employees: 38 },
  { id: "AGR-2026-0119", enterprise: "Dédougou Moto Pro", responsible: "Aminata Ouedraogo", type: "Nouvelle", submittedDate: "2026-03-28", status: "pending", step: 1, region: "Boucle du Mouhoun", capital: 15000000, employees: 21 },
]

const statusConfig = {
  pending: { label: "En attente", variant: "warning" as const, icon: Clock },
  review: { label: "En révision", variant: "info" as const, icon: FileCheck },
  approved: { label: "Approuvé", variant: "compliant" as const, icon: CheckCircle },
  rejected: { label: "Rejeté", variant: "critical" as const, icon: XCircle },
  suspended: { label: "Suspendu", variant: "critical" as const, icon: PauseCircle },
}

const steps = [
  "Dépôt dossier",
  "Vérification administrative",
  "Étude technique",
  "Décision",
  "Délivrance",
]

export default function Agreements() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null)
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)

  const filtered = agreements.filter((a) => {
    const matchesSearch =
      search === "" ||
      a.enterprise.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.responsible.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: agreements.length,
    pending: agreements.filter((a) => a.status === "pending").length,
    review: agreements.filter((a) => a.status === "review").length,
    approved: agreements.filter((a) => a.status === "approved").length,
    rejected: agreements.filter((a) => a.status === "rejected").length,
    suspended: agreements.filter((a) => a.status === "suspended").length,
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="font-playfair-display text-3xl font-bold text-text-primary">
          Gestion des Agréments
        </h1>
        <p className="text-text-muted mt-1">
          Suivi des demandes d'agrément des entreprises du secteur
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total, color: "bg-institutional-navy" },
          { label: "En attente", value: stats.pending, color: "bg-status-warning" },
          { label: "En révision", value: stats.review, color: "bg-status-info" },
          { label: "Approuvés", value: stats.approved, color: "bg-status-compliant" },
          { label: "Rejetés", value: stats.rejected, color: "bg-status-critical" },
          { label: "Suspendus", value: stats.suspended, color: "bg-gray-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg card-shadow p-3 flex items-center gap-3">
            <div className={cn("w-3 h-3 rounded-full shrink-0", s.color)} />
            <div>
              <p className="font-jetbrains-mono text-lg font-bold leading-tight">{s.value}</p>
              <p className="text-[11px] text-text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une entreprise, un ID..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border-default bg-white text-sm focus:border-gold-accent focus:ring-2 focus:ring-gold-accent/15 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          {["all", "pending", "review", "approved", "rejected", "suspended"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-medium transition-all",
                statusFilter === s
                  ? "bg-gold-accent text-white"
                  : "bg-white border border-border-default text-text-secondary hover:bg-bg-elevated"
              )}
            >
              {s === "all" ? "Tous" : statusConfig[s as keyof typeof statusConfig]?.label || s}
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
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Type</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Région</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Soumis le</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Workflow</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Statut</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((agr) => {
                const config = statusConfig[agr.status]
                return (
                  <tr
                    key={agr.id}
                    className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-jetbrains-mono text-xs text-text-muted">{agr.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{agr.enterprise}</p>
                        <p className="text-xs text-text-muted">{agr.responsible}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{agr.type}</td>
                    <td className="py-3 px-4">{agr.region}</td>
                    <td className="py-3 px-4">{formatDate(agr.submittedDate)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {steps.map((_, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "w-4 h-1.5 rounded-full",
                              idx < agr.step ? "bg-gold-accent" : "bg-bg-elevated"
                            )}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge variant={config.variant}>{config.label}</StatusBadge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setSelectedAgreement(agr)}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => { setSelectedAgreement(agr); setShowDecisionModal(true) }}
                        >
                          <FileCheck size={14} />
                        </Button>
                        {agr.status === "approved" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => { setSelectedAgreement(agr); setShowCertificate(true) }}
                          >
                            <Download size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAgreement && !showDecisionModal && !showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedAgreement(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair-display text-xl font-semibold">{selectedAgreement.enterprise}</h3>
              <button onClick={() => setSelectedAgreement(null)}><XCircle size={20} className="text-text-muted" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-bg-elevated rounded-lg">
                  <p className="text-xs text-text-muted">ID Demande</p>
                  <p className="font-jetbrains-mono text-sm font-medium">{selectedAgreement.id}</p>
                </div>
                <div className="p-3 bg-bg-elevated rounded-lg">
                  <p className="text-xs text-text-muted">Type</p>
                  <p className="text-sm font-medium">{selectedAgreement.type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-bg-elevated rounded-lg flex items-center gap-2">
                  <User size={16} className="text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Responsable</p>
                    <p className="text-sm font-medium">{selectedAgreement.responsible}</p>
                  </div>
                </div>
                <div className="p-3 bg-bg-elevated rounded-lg flex items-center gap-2">
                  <Building2 size={16} className="text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Région</p>
                    <p className="text-sm font-medium">{selectedAgreement.region}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-bg-elevated rounded-lg">
                  <p className="text-xs text-text-muted">Capital social</p>
                  <p className="font-jetbrains-mono text-sm font-medium">{selectedAgreement.capital.toLocaleString()} FCFA</p>
                </div>
                <div className="p-3 bg-bg-elevated rounded-lg">
                  <p className="text-xs text-text-muted">Employés</p>
                  <p className="font-jetbrains-mono text-sm font-medium">{selectedAgreement.employees}</p>
                </div>
              </div>
              <div className="p-3 bg-bg-elevated rounded-lg">
                <p className="text-xs text-text-muted mb-2">Workflow ({selectedAgreement.step}/{steps.length})</p>
                <div className="flex items-center gap-1.5">
                  {steps.map((step, idx) => (
                    <div key={step} className="flex-1 text-center">
                      <div className={cn("h-2 rounded-full mb-1", idx < selectedAgreement.step ? "bg-gold-accent" : "bg-border-subtle")} />
                      <p className={cn("text-[10px]", idx < selectedAgreement.step ? "text-gold-accent font-medium" : "text-text-muted")}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="flex-1" onClick={() => { setShowDecisionModal(true) }}>
                <FileCheck size={16} className="mr-2" /> Décision
              </Button>
              {selectedAgreement.status === "approved" && (
                <Button variant="outline" className="flex-1" onClick={() => setShowCertificate(true)}>
                  <Download size={16} className="mr-2" /> Certificat
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {showDecisionModal && selectedAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDecisionModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-playfair-display text-xl font-semibold mb-2">Décision — {selectedAgreement.id}</h3>
            <p className="text-sm text-text-muted mb-4">{selectedAgreement.enterprise}</p>
            <div className="space-y-2 mb-4">
              <Button variant="compliant" className="w-full justify-start gap-3 bg-status-compliant hover:bg-green-700 text-white">
                <CheckCircle size={18} /> Approuver la demande
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 text-status-warning hover:bg-status-warning-bg border-status-warning">
                <PauseCircle size={18} /> Suspendre pour complément
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 text-status-critical hover:bg-status-critical-bg border-status-critical">
                <XCircle size={18} /> Rejeter la demande
              </Button>
            </div>
            <textarea
              placeholder="Commentaire de décision (optionnel)..."
              className="w-full h-20 p-3 rounded-lg border border-border-default text-sm resize-none focus:border-gold-accent outline-none"
            />
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDecisionModal(false)}>Annuler</Button>
              <Button className="flex-1">Confirmer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Preview */}
      {showCertificate && selectedAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCertificate(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 p-8 animate-fade-up border-[3px]"
            style={{
              borderImage: "linear-gradient(135deg, #C73E3E, #C9963B, #2E8B57) 1",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bf-badge-gradient flex items-center justify-center">
                  <Shield size={32} className="text-white" />
                </div>
              </div>
              <p className="text-xs uppercase tracking-widest text-text-muted">République du Burkina Faso</p>
              <h2 className="font-playfair-display text-2xl font-bold mt-1 mb-0.5">Ministère du Commerce</h2>
              <p className="text-sm text-gold-accent font-medium">iReg Moto BF — Agrément officiel</p>
              <div className="my-6 border-t border-b border-gold-accent/30 py-4">
                <p className="text-xs uppercase tracking-wider text-text-muted mb-1">Certificat d'agrément n°</p>
                <p className="font-jetbrains-mono text-2xl font-bold text-institutional-navy">{selectedAgreement.id}</p>
              </div>
              <p className="text-sm mb-4">
                Est officiellement agréée au titre de la réglementation des deux-roues motorisés :
              </p>
              <p className="font-playfair-display text-xl font-bold text-institutional-navy mb-4">
                {selectedAgreement.enterprise}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div className="p-2 bg-bg-elevated rounded">
                  <p className="text-xs text-text-muted">Région</p>
                  <p className="font-medium">{selectedAgreement.region}</p>
                </div>
                <div className="p-2 bg-bg-elevated rounded">
                  <p className="text-xs text-text-muted">Capital</p>
                  <p className="font-medium">{selectedAgreement.capital.toLocaleString()} FCFA</p>
                </div>
              </div>
              <p className="text-xs text-text-muted">
                Délivré le {formatDate(new Date().toISOString())} — Valable 12 mois
              </p>
              <div className="flex justify-center gap-8 mt-4">
                <div className="text-center">
                  <Stamp size={32} className="text-gold-accent mx-auto mb-1" />
                  <p className="text-[10px] text-text-muted">Tampon officiel</p>
                </div>
                <div className="text-center">
                  <FileText size={32} className="text-gold-accent mx-auto mb-1" />
                  <p className="text-[10px] text-text-muted">Signature</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setShowCertificate(false)}>
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
