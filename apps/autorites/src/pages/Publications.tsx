import { useState } from "react"
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileText,
  Download,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  PenLine,
  History,
  Share2,
  BarChart3,
} from "lucide-react"
import StatusBadge from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const regulatoryTexts = [
  { id: "TXT-2026-0024", title: "Arrêté 05/06/2026 — Modèles interdits de 2RM", type: "Arrêté", date: "05/06/2026", status: "active", downloads: 342, views: 1280 },
  { id: "TXT-2026-0023", title: "Directive OHADA — Taxes d'enregistrement 2RM", type: "Directive", date: "28/05/2026", status: "active", downloads: 215, views: 890 },
  { id: "TXT-2026-0022", title: "Circulaire — Procédure d'agrément 2026", type: "Circulaire", date: "20/05/2026", status: "active", downloads: 567, views: 2100 },
  { id: "TXT-2026-0021", title: "Arrêté 15/05/2026 — Zones restreintes circulation", type: "Arrêté", date: "15/05/2026", status: "active", downloads: 198, views: 720 },
  { id: "TXT-2026-0020", title: "Décret — Création du fonds de régulation 2RM", type: "Décret", date: "01/05/2026", status: "active", downloads: 432, views: 1560 },
  { id: "TXT-2026-0019", title: "Arrêté 20/04/2026 — Normes cylindrées max 1000cc", type: "Arrêté", date: "20/04/2026", status: "active", downloads: 678, views: 2340 },
  { id: "TXT-2026-0018", title: "Circulaire — Mise à jour checklist inspection", type: "Circulaire", date: "10/04/2026", status: "active", downloads: 389, views: 1120 },
  { id: "TXT-2026-0017", title: "Loi — Modification code des transports 2RM", type: "Loi", date: "28/03/2026", status: "active", downloads: 890, views: 3450 },
  { id: "TXT-2026-0016", title: "Arrêté 15/03/2026 — Taxe spécifique 2RM importés", type: "Arrêté", date: "15/03/2026", status: "active", downloads: 456, views: 1670 },
  { id: "TXT-2026-0015", title: "Directive — Certification CNTI procédure accélérée", type: "Directive", date: "01/03/2026", status: "active", downloads: 234, views: 890 },
  { id: "TXT-2026-0014", title: "Arrêté 15/02/2026 — Interdictions personnes morales", type: "Arrêté", date: "15/02/2026", status: "active", downloads: 312, views: 1200 },
  { id: "TXT-2026-0013", title: "Circulaire — Rapports trimestriels 2026", type: "Circulaire", date: "01/02/2026", status: "active", downloads: 543, views: 1890 },
  { id: "TXT-2026-0012", title: "Arrêté 15/01/2026 — Barème prix de référence", type: "Arrêté", date: "15/01/2026", status: "superseded", downloads: 678, views: 2100 },
  { id: "TXT-2026-0011", title: "Décret — Organisation concours bourses moto", type: "Décret", date: "01/01/2026", status: "active", downloads: 198, views: 780 },
  { id: "TXT-2025-0048", title: "Loi — Loi de finances 2026 (articles 2RM)", type: "Loi", date: "30/12/2025", status: "active", downloads: 1230, views: 4560 },
  { id: "TXT-2025-0047", title: "Arrêté 01/12/2025 — Liste modèles autorisés 2026", type: "Arrêté", date: "01/12/2025", status: "superseded", downloads: 890, views: 3450 },
  { id: "TXT-2025-0046", title: "Circulaire — Fin de validité agréments 2024", type: "Circulaire", date: "15/11/2025", status: "archived", downloads: 456, views: 1230 },
  { id: "TXT-2025-0045", title: "Arrêté 01/11/2025 — Homologation électriques", type: "Arrêté", date: "01/11/2025", status: "active", downloads: 567, views: 1890 },
  { id: "TXT-2025-0044", title: "Directive — Procédure contestation sanctions", type: "Directive", date: "15/10/2025", status: "active", downloads: 345, views: 1120 },
  { id: "TXT-2025-0043", title: "Arrêté 01/10/2025 — Régime fiscal 2RM électriques", type: "Arrêté", date: "01/10/2025", status: "active", downloads: 432, views: 1560 },
  { id: "TXT-2025-0042", title: "Loi — Transposition directive CEDEAO 2RM", type: "Loi", date: "15/09/2025", status: "active", downloads: 678, views: 2340 },
  { id: "TXT-2025-0041", title: "Arrêté 01/09/2025 — Normes sécurité casques", type: "Arrêté", date: "01/09/2025", status: "active", downloads: 789, views: 2670 },
  { id: "TXT-2025-0040", title: "Circulaire — Collecte données statistiques 2RM", type: "Circulaire", date: "15/08/2025", status: "archived", downloads: 234, views: 890 },
  { id: "TXT-2025-0039", title: "Décret — Création observatoire national 2RM", type: "Décret", date: "01/08/2025", status: "active", downloads: 567, views: 1980 },
]

const featuredDecree = {
  id: "TXT-2026-0024",
  title: "Arrêté 05/06/2026 — Modèles interdits de 2RM",
  date: "05/06/2026",
  minister: "Ministre du Commerce",
  articles: [
    { id: 1, title: "Objet et champ d'application", content: "Le présent arrêté fixe la liste des modèles de deux-roues motorisés interdits à l'importation, à la vente et à la circulation sur le territoire national." },
    { id: 2, title: "Définitions", content: "Au sens du présent arrêté, on entend par 'deux-roues motorisés' tout véhicule terrestre à moteur comportant deux roues, susceptible d'être mus par la seule puissance de son moteur." },
    { id: 3, title: "Critères d'interdiction", content: "Sont interdits les modèles ne répondant pas aux normes suivantes : cylindrée supérieure à 1000cc, vitesse maximale supérieure à 300 km/h, émissions CO2 dépassant 150g/km, absence d'homologation CNTI." },
    { id: 4, title: "Liste des modèles interdits", content: "La liste des modèles interdits figure en annexe I du présent arrêté. Cette liste est mise à jour trimestriellement par la Direction Générale du Commerce Intérieur." },
    { id: 5, title: "Procédure d'exception", content: "Sur décision motivée du Ministre du Commerce, une dérogation temporaire peut être accordée pour des raisons de sécurité nationale, de recherche scientifique ou d'événements sportifs." },
    { id: 6, title: "Sanctions", content: "Tout importateur ou distributeur contrevenant aux dispositions du présent arrêté est passible d'une amende de 5 000 000 à 50 000 000 FCFA et d'une peine d'emprisonnement de 6 mois à 2 ans." },
    { id: 7, title: "Confiscation et destruction", content: "Les engins interdits saisis sont confisqués au profit de l'État et font l'objet d'une destruction conformément à la procédure établie par la Direction des Douanes." },
    { id: 8, title: "Recours", content: "Les intéressés peuvent former un recours administratif auprès du Ministre du Commerce dans un délai de 30 jours à compter de la notification de l'interdiction." },
  ],
  amendmentHistory: [
    { date: "05/06/2026", change: "Publication initiale — 15 modèles interdits", actor: "Min. Commerce" },
    { date: "20/05/2026", event: "Extension — Ajout 4 modèles cylindrée >1000cc", actor: "CNTI" },
    { date: "01/04/2026", event: "Interdiction temporaire TVS iQube (batterie)", actor: "CNTI" },
    { date: "20/03/2026", event: "Abrogation — Levée interdiction Ducati Panigale V4", actor: "Min. Commerce" },
    { date: "15/03/2026", event: "Ajout — Harley-Davidson Sportster S", actor: "Douanes" },
    { date: "01/01/2026", event: "Version 2026 — Reprise à zero", actor: "Min. Commerce" },
  ],
}

const consultations = [
  { id: "CNS-2026-0003", title: "Consultation publique — Révision normes cylindrées", status: "open", deadline: "30/06/2026", responses: 45 },
  { id: "CNS-2026-0002", title: "Consultation publique — Fiscalité 2RM électriques", status: "open", deadline: "15/07/2026", responses: 28 },
  { id: "CNS-2026-0001", title: "Consultation publique — Nouvelle grille inspection", status: "closed", deadline: "15/05/2026", responses: 62 },
]

export default function Publications() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedArticles, setExpandedArticles] = useState<number[]>([1])
  const [typeFilter, setTypeFilter] = useState("all")

  const toggleArticle = (id: number) => {
    setExpandedArticles((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id])
  }

  const filteredTexts = regulatoryTexts.filter((t) => {
    const matchesSearch = searchTerm === "" || t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || t.type === typeFilter
    return matchesSearch && matchesType
  })

  const typeCounts = regulatoryTexts.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-playfair-display text-3xl font-bold">Publications Réglementaires</h1>
        <p className="text-text-muted mt-1">Textes réglementaires, arrêtés, consultations publiques</p>
      </div>

      {/* Featured Arrêté */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="bg-institutional-navy text-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} className="text-gold-accent" />
            <span className="text-gold-accent text-sm font-medium">Arrêté en vedette</span>
          </div>
          <h2 className="font-playfair-display text-xl font-bold">{featuredDecree.title}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-text-dark-secondary">
            <span className="flex items-center gap-1"><Calendar size={14} /> {featuredDecree.date}</span>
            <span className="flex items-center gap-1"><PenLine size={14} /> {featuredDecree.minister}</span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-playfair-display text-lg font-semibold mb-3">Articles ({featuredDecree.articles.length})</h3>
          <div className="space-y-2">
            {featuredDecree.articles.map((article) => (
              <div key={article.id} className="border border-border-subtle rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleArticle(article.id)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-bg-elevated transition-colors"
                >
                  <span className="font-medium text-sm">Article {article.id} — {article.title}</span>
                  {expandedArticles.includes(article.id) ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                </button>
                {expandedArticles.includes(article.id) && (
                  <div className="px-3 pb-3">
                    <p className="text-sm text-text-secondary leading-relaxed">{article.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Amendment History */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <History size={16} className="text-text-muted" />
              Historique des modifications
            </h4>
            <div className="space-y-1">
              {featuredDecree.amendmentHistory.map((a, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="font-jetbrains-mono text-text-muted w-20 shrink-0">{a.date}</span>
                  <span className="text-border-default">•</span>
                  <span>{a.change}</span>
                  <span className="text-text-muted">({a.actor})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Public Consultations */}
      <div className="bg-white rounded-xl card-shadow p-5">
        <h3 className="font-playfair-display text-lg font-semibold mb-4">Consultations publiques</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {consultations.map((c) => (
            <div key={c.id} className="p-4 border border-border-subtle rounded-lg hover:border-gold-accent/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="font-jetbrains-mono text-xs text-text-muted">{c.id}</span>
                <StatusBadge variant={c.status === "open" ? "compliant" : "info"} className="text-[10px] h-5 px-2">
                  {c.status === "open" ? "Ouverte" : "Clôturée"}
                </StatusBadge>
              </div>
              <p className="text-sm font-medium mb-2">{c.title}</p>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span className="flex items-center gap-1"><Clock size={12} /> {c.deadline}</span>
                <span className="flex items-center gap-1"><MessageSquare size={12} /> {c.responses} réponses</span>
              </div>
              {c.status === "open" && (
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Participer
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-xl card-shadow p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-playfair-display text-lg font-semibold">Textes réglementaires ({regulatoryTexts.length})</h3>
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
          </div>
        </div>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setTypeFilter("all")}
            className={cn("h-8 px-3 rounded-full text-xs font-medium transition-all whitespace-nowrap", typeFilter === "all" ? "bg-gold-accent text-white" : "bg-bg-elevated text-text-secondary hover:bg-border-subtle")}
          >
            Tous ({regulatoryTexts.length})
          </button>
          {Object.entries(typeCounts).map(([type, count]) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn("h-8 px-3 rounded-full text-xs font-medium transition-all whitespace-nowrap", typeFilter === type ? "bg-gold-accent text-white" : "bg-bg-elevated text-text-secondary hover:bg-border-subtle")}
            >
              {type} ({count})
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">ID</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Titre</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Type</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Date</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Statut</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">
                  <Eye size={14} className="inline" />
                </th>
                <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">
                  <Download size={14} className="inline" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTexts.map((t) => (
                <tr key={t.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/50 transition-colors">
                  <td className="py-3 px-4 font-jetbrains-mono text-xs text-text-muted">{t.id}</td>
                  <td className="py-3 px-4 font-medium max-w-[300px] truncate">{t.title}</td>
                  <td className="py-3 px-4"><StatusBadge variant="info" className="text-[10px] h-5 px-2">{t.type}</StatusBadge></td>
                  <td className="py-3 px-4">{t.date}</td>
                  <td className="py-3 px-4">
                    <StatusBadge
                      variant={t.status === "active" ? "compliant" : t.status === "superseded" ? "warning" : "info"}
                      className="text-[10px] h-5 px-2"
                    >
                      {t.status === "active" ? "Actif" : t.status === "superseded" ? "Abrogé" : "Archivé"}
                    </StatusBadge>
                  </td>
                  <td className="text-right py-3 px-4 font-jetbrains-mono text-xs">{t.views}</td>
                  <td className="text-right py-3 px-4 font-jetbrains-mono text-xs">{t.downloads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Distribution stats */}
        <div className="mt-4 p-4 bg-bg-elevated rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <BarChart3 size={16} className="text-text-muted" />
            Statistiques de distribution
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="font-jetbrains-mono text-xl font-bold">{regulatoryTexts.reduce((s, t) => s + t.views, 0).toLocaleString()}</p>
              <p className="text-xs text-text-muted">Vues totales</p>
            </div>
            <div>
              <p className="font-jetbrains-mono text-xl font-bold">{regulatoryTexts.reduce((s, t) => s + t.downloads, 0).toLocaleString()}</p>
              <p className="text-xs text-text-muted">Téléchargements</p>
            </div>
            <div>
              <p className="font-jetbrains-mono text-xl font-bold">{regulatoryTexts.filter((t) => t.status === "active").length}</p>
              <p className="text-xs text-text-muted">Textes actifs</p>
            </div>
            <div>
              <p className="font-jetbrains-mono text-xl font-bold">{new Set(regulatoryTexts.map((t) => t.type)).size}</p>
              <p className="text-xs text-text-muted">Types de textes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
