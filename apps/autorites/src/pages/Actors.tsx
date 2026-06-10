import { useState } from "react"
import { motion } from "framer-motion"
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  FileCheck,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  ChevronRight,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import StatCard from "@/components/StatCard"
import StatusBadge from "@/components/StatusBadge"

/* ─── Types ─── */
interface Actor {
  id: string
  name: string
  type: "Importateur" | "Distributeur" | "Assembleur" | "Détaillant"
  rccm: string
  ifu: string
  address: string
  region: string
  phone: string
  email: string
  licenseStatus: "active" | "pending" | "suspended" | "revoked" | "expired"
  complianceScore: number
  vehiclesStocked: number
  employees: number
  lastActivity: string
  agreementDate: string
  expiryDate: string
  director: string
  trend: "up" | "down" | "stable"
}

/* ─── Mock Data — 30 acteurs nationaux ─── */
const actorsData: Actor[] = [
  { id: "ACT-001", name: "Faso Moto SARL", type: "Importateur", rccm: "BF-OUA-2018-A-1234", ifu: "00012345A", address: "Avenue de l'Indépendance, Ouagadougou", region: "Centre", phone: "+226 25 30 12 34", email: "contact@fasomoto.bf", licenseStatus: "active", complianceScore: 87, vehiclesStocked: 342, employees: 28, lastActivity: "09/06/2026", agreementDate: "15/03/2018", expiryDate: "15/03/2027", director: "Amadou Ouedraogo", trend: "up" },
  { id: "ACT-002", name: "Burkina Wheels SA", type: "Assembleur", rccm: "BF-OUA-2019-B-5678", ifu: "00023456B", address: "Rue des Artisans, Zone industrielle, Ouagadougou", region: "Centre", phone: "+226 25 35 67 89", email: "info@burkinawheels.bf", licenseStatus: "active", complianceScore: 92, vehiclesStocked: 189, employees: 45, lastActivity: "08/06/2026", agreementDate: "20/06/2019", expiryDate: "20/06/2027", director: "Fatima Kaboré", trend: "up" },
  { id: "ACT-003", name: "Sahel Motos Distribution", type: "Distributeur", rccm: "BF-BOB-2020-A-9012", ifu: "00034567C", address: "Boulevard de la République, Bobo-Dioulasso", region: "Hauts-Bassins", phone: "+226 20 98 76 54", email: "sahel@motosdistribution.bf", licenseStatus: "active", complianceScore: 78, vehiclesStocked: 156, employees: 15, lastActivity: "07/06/2026", agreementDate: "10/01/2020", expiryDate: "10/01/2027", director: "Ibrahim Bamba", trend: "stable" },
  { id: "ACT-004", name: "Moto Express Burkina", type: "Détaillant", rccm: "BF-OUA-2021-A-3456", ifu: "00045678D", address: "Rue du Commerce, secteur 15, Ouagadougou", region: "Centre", phone: "+226 70 12 34 56", email: "motoexpress@yahoo.fr", licenseStatus: "active", complianceScore: 65, vehiclesStocked: 67, employees: 6, lastActivity: "05/06/2026", agreementDate: "05/04/2021", expiryDate: "05/04/2027", director: "Jean Zongo", trend: "down" },
  { id: "ACT-005", name: "Koudougou Moto Plus", type: "Détaillant", rccm: "BF-KOU-2022-A-7890", ifu: "00056789E", address: "Avenue de la Gare, Koudougou", region: "Centre-Ouest", phone: "+226 50 23 45 67", email: "koudougoumotoplus@gmail.com", licenseStatus: "pending", complianceScore: 0, vehiclesStocked: 0, employees: 2, lastActivity: "—", agreementDate: "—", expiryDate: "—", director: "Mariama Sanou", trend: "stable" },
  { id: "ACT-006", name: "Ouahigouya Motors", type: "Distributeur", rccm: "BF-OUA-2019-A-2345", ifu: "00067890F", address: "Route de Kaya, Ouahigouya", region: "Nord", phone: "+226 40 34 56 78", email: "ouahigouyamotors@bfmotors.net", licenseStatus: "active", complianceScore: 81, vehiclesStocked: 203, employees: 12, lastActivity: "09/06/2026", agreementDate: "18/09/2019", expiryDate: "18/09/2026", director: "Seydou Compaoré", trend: "up" },
  { id: "ACT-007", name: "Banfora Moto Center", type: "Détaillant", rccm: "BF-BAN-2020-A-6789", ifu: "00078901G", address: "Boulevard des Cascades, Banfora", region: "Cascades", phone: "+226 20 87 65 43", email: "banforamoto@motocenter.bf", licenseStatus: "active", complianceScore: 72, vehiclesStocked: 45, employees: 4, lastActivity: "06/06/2026", agreementDate: "22/07/2020", expiryDate: "22/07/2026", director: "Aminata Hien", trend: "stable" },
  { id: "ACT-008", name: "Eastern Moto Import", type: "Importateur", rccm: "BF-FNG-2017-A-4567", ifu: "00089012H", address: "Zone industrielle Sud, Fada N'Gourma", region: "Est", phone: "+226 60 45 67 89", email: "eastern@importmoto.bf", licenseStatus: "suspended", complianceScore: 34, vehiclesStocked: 0, employees: 8, lastActivity: "01/03/2026", agreementDate: "30/11/2017", expiryDate: "30/11/2026", director: "Blaise Sore", trend: "down" },
  { id: "ACT-009", name: "Kaya Moto Services", type: "Assembleur", rccm: "BF-KAY-2021-A-8901", ifu: "00090123I", address: "Rue du Marché, Kaya", region: "Centre-Nord", phone: "+226 50 56 78 90", email: "kaya@motoservices.bf", licenseStatus: "active", complianceScore: 88, vehiclesStocked: 112, employees: 22, lastActivity: "09/06/2026", agreementDate: "14/02/2021", expiryDate: "14/02/2027", director: "Daniel Ouedraogo", trend: "up" },
  { id: "ACT-010", name: "Manga Moto Shop", type: "Détaillant", rccm: "BF-MAN-2022-A-3456", ifu: "00101234J", address: "Route de Tenkodogo, Manga", region: "Centre-Sud", phone: "+226 70 67 89 01", email: "mangamoto@shop.bf", licenseStatus: "active", complianceScore: 59, vehiclesStocked: 28, employees: 3, lastActivity: "04/06/2026", agreementDate: "08/06/2022", expiryDate: "08/06/2027", director: "Lucie Traoré", trend: "down" },
  { id: "ACT-011", name: "Dédougou Moto Pro", type: "Distributeur", rccm: "BF-DED-2020-A-7891", ifu: "00112345K", address: "Avenue de la Libération, Dédougou", region: "Boucle du Mouhoun", phone: "+226 20 12 34 56", email: "dedougou@motopro.bf", licenseStatus: "active", complianceScore: 76, vehiclesStocked: 134, employees: 10, lastActivity: "08/06/2026", agreementDate: "25/05/2020", expiryDate: "25/05/2027", director: "Yacouba Sawadogo", trend: "stable" },
  { id: "ACT-012", name: "Gorom-Gorom Moto", type: "Détaillant", rccm: "BF-GOR-2023-A-2345", ifu: "00123456L", address: "Place du Marché, Gorom-Gorom", region: "Sahel", phone: "+226 60 78 90 12", email: "gorom@motosahel.bf", licenseStatus: "pending", complianceScore: 0, vehiclesStocked: 0, employees: 1, lastActivity: "—", agreementDate: "—", expiryDate: "—", director: "Hamidou Dicko", trend: "stable" },
  { id: "ACT-013", name: "Dori Moto Express", type: "Détaillant", rccm: "BF-DOR-2021-A-6789", ifu: "00134567M", address: "Route nationale, Dori", region: "Sahel", phone: "+226 40 89 01 23", email: "dorimotoexpress@yahoo.fr", licenseStatus: "active", complianceScore: 63, vehiclesStocked: 19, employees: 2, lastActivity: "03/06/2026", agreementDate: "12/08/2021", expiryDate: "12/08/2026", director: "Abdoulaye Sankara", trend: "down" },
  { id: "ACT-014", name: "Ziniaré Moto Plus", type: "Détaillant", rccm: "BF-ZIN-2022-A-1234", ifu: "00145678N", address: "Secteur commercial, Ziniaré", region: "Plateau-Central", phone: "+226 50 90 12 34", email: "ziniaremoto@gmail.com", licenseStatus: "active", complianceScore: 71, vehiclesStocked: 33, employees: 3, lastActivity: "07/06/2026", agreementDate: "19/10/2022", expiryDate: "19/10/2027", director: "Claire Bationo", trend: "stable" },
  { id: "ACT-015", name: "Gaoua Moto Services", type: "Assembleur", rccm: "BF-GAO-2020-A-5678", ifu: "00156789O", address: "Boulevard de la Paix, Gaoua", region: "Sud-Ouest", phone: "+226 20 45 67 89", email: "gaoua@motoservices.bf", licenseStatus: "active", complianceScore: 85, vehiclesStocked: 78, employees: 18, lastActivity: "09/06/2026", agreementDate: "03/07/2020", expiryDate: "03/07/2027", director: "Emmanuel Tarnagda", trend: "up" },
  { id: "ACT-016", name: "Tenkodogo Moto Hub", type: "Distributeur", rccm: "BF-TEN-2019-A-9012", ifu: "00167890P", address: "Rue du Commerce, Tenkodogo", region: "Centre-Est", phone: "+226 50 34 56 78", email: "tenkodogo@motohub.bf", licenseStatus: "active", complianceScore: 74, vehiclesStocked: 167, employees: 9, lastActivity: "06/06/2026", agreementDate: "27/04/2019", expiryDate: "27/04/2027", director: "Pascal Kaboré", trend: "stable" },
  { id: "ACT-017", name: "Léo Moto World", type: "Détaillant", rccm: "BF-LEO-2023-A-3456", ifu: "00178901Q", address: "Route de Koudougou, Léo", region: "Centre-Ouest", phone: "+226 70 45 67 89", email: "leo@motoworld.bf", licenseStatus: "pending", complianceScore: 0, vehiclesStocked: 0, employees: 2, lastActivity: "—", agreementDate: "—", expiryDate: "—", director: "Marie Konaté", trend: "stable" },
  { id: "ACT-018", name: "Solenzo Moto Center", type: "Détaillant", rccm: "BF-SOL-2021-A-7890", ifu: "00189012R", address: "Avenue principale, Solenzo", region: "Boucle du Mouhoun", phone: "+226 40 56 78 90", email: "solenzo@motocenter.bf", licenseStatus: "active", complianceScore: 68, vehiclesStocked: 41, employees: 3, lastActivity: "05/06/2026", agreementDate: "06/09/2021", expiryDate: "06/09/2026", director: "Benoît Ouedraogo", trend: "down" },
  { id: "ACT-019", name: "Nouna Moto Plus", type: "Détaillant", rccm: "BF-NOU-2022-A-2345", ifu: "00190123S", address: "Place centrale, Nouna", region: "Boucle du Mouhoun", phone: "+226 60 67 89 01", email: "nounamoto@gmail.com", licenseStatus: "active", complianceScore: 55, vehiclesStocked: 22, employees: 2, lastActivity: "02/06/2026", agreementDate: "15/11/2022", expiryDate: "15/11/2027", director: "Albert Tiendrébéogo", trend: "down" },
  { id: "ACT-020", name: "Réo Moto Express", type: "Détaillant", rccm: "BF-REO-2021-A-6789", ifu: "00201234T", address: "Boulevard du Commerce, Réo", region: "Centre-Ouest", phone: "+226 50 78 90 12", email: "reo@motoexpress.bf", licenseStatus: "active", complianceScore: 64, vehiclesStocked: 35, employees: 3, lastActivity: "04/06/2026", agreementDate: "21/07/2021", expiryDate: "21/07/2026", director: "Sylvie Yaméogo", trend: "stable" },
  { id: "ACT-021", name: "Koupéla Moto Hub", type: "Distributeur", rccm: "BF-KOU-2020-A-1234", ifu: "00212345U", address: "Route nationale, Koupéla", region: "Centre-Est", phone: "+226 40 89 01 23", email: "koupela@motohub.bf", licenseStatus: "active", complianceScore: 79, vehiclesStocked: 145, employees: 11, lastActivity: "08/06/2026", agreementDate: "17/03/2020", expiryDate: "17/03/2027", director: "Jacques Ilboudo", trend: "up" },
  { id: "ACT-022", name: "Kombissiri Moto", type: "Détaillant", rccm: "BF-KOM-2023-A-5678", ifu: "00223456V", address: "Secteur commercial, Kombissiri", region: "Centre-Sud", phone: "+226 70 89 01 23", email: "kombissiri@gmail.com", licenseStatus: "pending", complianceScore: 0, vehiclesStocked: 0, employees: 1, lastActivity: "—", agreementDate: "—", expiryDate: "—", director: "Awa Ouédraogo", trend: "stable" },
  { id: "ACT-023", name: "Pô Moto Services", type: "Détaillant", rccm: "BF-PO-2022-A-9012", ifu: "00234567W", address: "Rue principale, Pô", region: "Nahouri", phone: "+226 20 90 12 34", email: "po@motoservices.bf", licenseStatus: "active", complianceScore: 58, vehiclesStocked: 27, employees: 2, lastActivity: "01/06/2026", agreementDate: "09/12/2022", expiryDate: "09/12/2027", director: "Charles Bado", trend: "down" },
  { id: "ACT-024", name: "Bittou Moto Plus", type: "Assembleur", rccm: "BF-BIT-2021-A-3456", ifu: "00245678X", address: "Zone artisanale, Bittou", region: "Centre-Est", phone: "+226 50 01 23 45", email: "bittou@motoplus.bf", licenseStatus: "active", complianceScore: 90, vehiclesStocked: 95, employees: 30, lastActivity: "09/06/2026", agreementDate: "30/05/2021", expiryDate: "30/05/2027", director: "François Kafando", trend: "up" },
  { id: "ACT-025", name: "Méguet Moto Center", type: "Détaillant", rccm: "BF-MEG-2023-A-7890", ifu: "00256789Y", address: "Route de Ziniaré, Méguet", region: "Plateau-Central", phone: "+226 60 12 34 56", email: "meguet@gmail.com", licenseStatus: "pending", complianceScore: 0, vehiclesStocked: 0, employees: 1, lastActivity: "—", agreementDate: "—", expiryDate: "—", director: "Germaine Tall", trend: "stable" },
  { id: "ACT-026", name: "Gourcy Moto Pro", type: "Distributeur", rccm: "BF-GOU-2019-A-2345", ifu: "00267890Z", address: "Avenue de la République, Gourcy", region: "Nord", phone: "+226 40 23 45 67", email: "gourcy@motopro.bf", licenseStatus: "active", complianceScore: 82, vehiclesStocked: 178, employees: 14, lastActivity: "09/06/2026", agreementDate: "11/08/2019", expiryDate: "11/08/2027", director: "Adama Kaboré", trend: "up" },
  { id: "ACT-027", name: "Yako Moto Express", type: "Détaillant", rccm: "BF-YAK-2022-A-6789", ifu: "00278901AA", address: "Place du marché, Yako", region: "Nord", phone: "+226 70 34 56 78", email: "yako@motoexpress.bf", licenseStatus: "active", complianceScore: 61, vehiclesStocked: 31, employees: 3, lastActivity: "06/06/2026", agreementDate: "24/04/2022", expiryDate: "24/04/2027", director: "Sambo Lamizana", trend: "stable" },
  { id: "ACT-028", name: "Zorgho Moto Hub", type: "Détaillant", rccm: "BF-ZOR-2021-A-1234", ifu: "00289012AB", address: "Boulevard du Commerce, Zorgho", region: "Plateau-Central", phone: "+226 50 45 67 89", email: "zorgho@motohub.bf", licenseStatus: "active", complianceScore: 73, vehiclesStocked: 44, employees: 4, lastActivity: "07/06/2026", agreementDate: "02/06/2021", expiryDate: "02/06/2027", director: "Moussa Kafando", trend: "stable" },
  { id: "ACT-029", name: "Boussé Moto Plus", type: "Détaillant", rccm: "BF-BOU-2023-A-5678", ifu: "00290123AC", address: "Route nationale, Boussé", region: "Kourwéogo", phone: "+226 60 56 78 90", email: "bousse@gmail.com", licenseStatus: "pending", complianceScore: 0, vehiclesStocked: 0, employees: 2, lastActivity: "—", agreementDate: "—", expiryDate: "—", director: "Cécile Tiendrébéogo", trend: "stable" },
  { id: "ACT-030", name: "Diébougou Moto Services", type: "Assembleur", rccm: "BF-DIE-2020-A-9012", ifu: "00301234AD", address: "Zone industrielle, Diébougou", region: "Sud-Ouest", phone: "+226 20 67 89 01", email: "diebougou@motoservices.bf", licenseStatus: "active", complianceScore: 89, vehiclesStocked: 87, employees: 25, lastActivity: "09/06/2026", agreementDate: "28/02/2020", expiryDate: "28/02/2027", director: "Nathaniel Some", trend: "up" },
]

/* ─── Chart Data ─── */
const typeDistribution = [
  { name: "Importateurs", value: 4, color: "#3A7CC7" },
  { name: "Distributeurs", value: 7, color: "#C9963B" },
  { name: "Assembleurs", value: 6, color: "#2E8B57" },
  { name: "Détaillants", value: 13, color: "#7C5CC9" },
]

const regionData = [
  { region: "Centre", count: 4 },
  { region: "Centre-Est", count: 3 },
  { region: "Centre-Nord", count: 1 },
  { region: "Centre-Ouest", count: 3 },
  { region: "Centre-Sud", count: 2 },
  { region: "Boucle du Mouhoun", count: 3 },
  { region: "Hauts-Bassins", count: 1 },
  { region: "Nord", count: 3 },
  { region: "Plateau-Central", count: 3 },
  { region: "Sahel", count: 2 },
  { region: "Cascades", count: 1 },
  { region: "Est", count: 1 },
  { region: "Sud-Ouest", count: 2 },
]

/* ─── Helpers ─── */
const getLicenseVariant = (s: Actor["licenseStatus"]) => {
  switch (s) {
    case "active": return "success"
    case "pending": return "warning"
    case "suspended": return "danger"
    case "revoked": return "critical"
    case "expired": return "neutral"
    default: return "neutral"
  }
}

const getLicenseLabel = (s: Actor["licenseStatus"]) => {
  switch (s) {
    case "active": return "Actif"
    case "pending": return "En attente"
    case "suspended": return "Suspendu"
    case "revoked": return "Révoqué"
    case "expired": return "Expiré"
    default: return s
  }
}

const getTrendIcon = (t: Actor["trend"]) => {
  switch (t) {
    case "up": return <TrendingUp size={14} className="text-status-compliant" />
    case "down": return <TrendingDown size={14} className="text-status-critical" />
    default: return <Minus size={14} className="text-text-muted" />
  }
}

const getComplianceColor = (score: number) => {
  if (score >= 80) return "text-status-compliant"
  if (score >= 50) return "text-status-warning"
  if (score > 0) return "text-status-critical"
  return "text-text-muted"
}

/* ─── Component ─── */
export default function Actors() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null)

  const filtered = actorsData.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.rccm.toLowerCase().includes(search.toLowerCase()) ||
      a.director.toLowerCase().includes(search.toLowerCase()) ||
      a.region.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || a.type === typeFilter
    const matchStatus = statusFilter === "all" || a.licenseStatus === statusFilter
    const matchRegion = regionFilter === "all" || a.region === regionFilter
    return matchSearch && matchType && matchStatus && matchRegion
  })

  const activeCount = actorsData.filter((a) => a.licenseStatus === "active").length
  const pendingCount = actorsData.filter((a) => a.licenseStatus === "pending").length
  const suspendedCount = actorsData.filter((a) => a.licenseStatus === "suspended").length
  const avgCompliance = Math.round(
    actorsData.filter((a) => a.complianceScore > 0).reduce((s, a) => s + a.complianceScore, 0) /
      actorsData.filter((a) => a.complianceScore > 0).length
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-playfair-display font-bold text-text-primary">
            Acteurs Économiques
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Registre national des importateurs, distributeurs, assembleurs et détaillants de deux-roues
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-institutional-navy text-white rounded-lg hover:bg-institutional-navy-light transition-colors text-sm font-medium">
          <Download size={16} />
          Exporter
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Acteurs" value={actorsData.length.toString()} icon={<Building2 size={20} />} color="blue" />
        <StatCard label="Agréments Actifs" value={activeCount.toString()} icon={<CheckCircle2 size={20} />} color="green" />
        <StatCard label="En Attente" value={pendingCount.toString()} icon={<Clock size={20} />} color="amber" />
        <StatCard label="Suspendus" value={suspendedCount.toString()} icon={<AlertTriangle size={20} />} color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-bg-card rounded-xl border border-border-default p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Répartition par Type d'Acteur
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {typeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1B2838",
                  border: "1px solid #2D4056",
                  borderRadius: 8,
                  color: "#E8ECF0",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {typeDistribution.map((t) => (
              <div key={t.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                {t.name} ({t.value})
              </div>
            ))}
          </div>
        </div>

        <div className="bg-bg-card rounded-xl border border-border-default p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Acteurs par Région
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={regionData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDE3E8" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="region" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip
                contentStyle={{
                  background: "#1B2838",
                  border: "1px solid #2D4056",
                  borderRadius: 8,
                  color: "#E8ECF0",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="#3A7CC7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-bg-card rounded-xl border border-border-default p-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher par nom, RCCM, directeur, région..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-primary border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold-accent/30"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-bg-primary border border-border-default rounded-lg text-sm text-text-primary focus:outline-none"
        >
          <option value="all">Tous les types</option>
          <option value="Importateur">Importateurs</option>
          <option value="Distributeur">Distributeurs</option>
          <option value="Assembleur">Assembleurs</option>
          <option value="Détaillant">Détaillants</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-bg-primary border border-border-default rounded-lg text-sm text-text-primary focus:outline-none"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="pending">En attente</option>
          <option value="suspended">Suspendu</option>
          <option value="revoked">Révoqué</option>
          <option value="expired">Expiré</option>
        </select>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-3 py-2 bg-bg-primary border border-border-default rounded-lg text-sm text-text-primary focus:outline-none"
        >
          <option value="all">Toutes les régions</option>
          {Array.from(new Set(actorsData.map((a) => a.region))).sort().map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <span className="flex items-center gap-1 text-xs text-text-muted ml-auto">
          <Filter size={14} />
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-bg-card rounded-xl border border-border-default overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-bg-elevated">
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Nom / Directeur</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">RCCM / IFU</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Région</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Statut Agrément</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Conformité</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Stock</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((actor, idx) => (
                <motion.tr
                  key={actor.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02, duration: 0.25 }}
                  className="hover:bg-bg-elevated/60 transition-colors cursor-pointer"
                  onClick={() => setSelectedActor(actor)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{actor.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-text-primary">{actor.name}</div>
                    <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                      <Building2 size={10} />
                      {actor.director}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-bg-primary border border-border-default text-text-secondary">
                      {actor.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">
                    <div>{actor.rccm}</div>
                    <div className="text-text-muted/60">{actor.ifu}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-text-secondary">
                      <MapPin size={12} className="text-gold-accent" />
                      {actor.region}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={getLicenseVariant(actor.licenseStatus)}>
                      {getLicenseLabel(actor.licenseStatus)}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-bg-primary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${actor.complianceScore}%`,
                            backgroundColor:
                              actor.complianceScore >= 80
                                ? "#2E8B57"
                                : actor.complianceScore >= 50
                                  ? "#E8943A"
                                  : actor.complianceScore > 0
                                    ? "#C73E3E"
                                    : "#8899AA",
                          }}
                        />
                      </div>
                      <span className={`text-xs font-mono font-semibold ${getComplianceColor(actor.complianceScore)}`}>
                        {actor.complianceScore > 0 ? `${actor.complianceScore}%` : "—"}
                      </span>
                      {getTrendIcon(actor.trend)}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                    {actor.vehiclesStocked > 0 ? `${actor.vehiclesStocked} engins` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedActor(actor)
                      }}
                      className="p-1.5 rounded-lg hover:bg-bg-primary transition-colors text-text-muted hover:text-gold-accent"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun acteur ne correspond aux critères de recherche.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedActor && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedActor(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-bg-card rounded-xl border border-border-default shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-border-default">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-playfair-display font-bold text-text-primary">
                      {selectedActor.name}
                    </h2>
                    <StatusBadge variant={getLicenseVariant(selectedActor.licenseStatus)}>
                      {getLicenseLabel(selectedActor.licenseStatus)}
                    </StatusBadge>
                  </div>
                  <p className="text-sm text-text-muted">{selectedActor.type} — {selectedActor.id}</p>
                </div>
                <button
                  onClick={() => setSelectedActor(null)}
                  className="p-1 rounded-lg hover:bg-bg-primary text-text-muted"
                >
                  <Ban size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider">RCCM</label>
                  <p className="font-mono text-sm text-text-primary">{selectedActor.rccm}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider">IFU</label>
                  <p className="font-mono text-sm text-text-primary">{selectedActor.ifu}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider">Directeur</label>
                  <p className="text-sm text-text-primary">{selectedActor.director}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider">Employés</label>
                  <p className="text-sm text-text-primary">{selectedActor.employees}</p>
                </div>
              </div>

              <div className="border-t border-border-subtle pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <MapPin size={14} className="text-gold-accent" />
                  {selectedActor.address}, {selectedActor.region}
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Phone size={14} className="text-gold-accent" />
                  {selectedActor.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Mail size={14} className="text-gold-accent" />
                  {selectedActor.email}
                </div>
              </div>

              {selectedActor.complianceScore > 0 && (
                <div className="border-t border-border-subtle pt-4">
                  <label className="text-xs text-text-muted uppercase tracking-wider">Score de Conformité</label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-2 bg-bg-primary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${selectedActor.complianceScore}%`,
                          backgroundColor:
                            selectedActor.complianceScore >= 80
                              ? "#2E8B57"
                              : selectedActor.complianceScore >= 50
                                ? "#E8943A"
                                : "#C73E3E",
                        }}
                      />
                    </div>
                    <span className={`font-mono font-bold ${getComplianceColor(selectedActor.complianceScore)}`}>
                      {selectedActor.complianceScore}%
                    </span>
                  </div>
                </div>
              )}

              <div className="border-t border-border-subtle pt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider">Stock</label>
                  <p className="text-sm text-text-primary font-medium">{selectedActor.vehiclesStocked} engins</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider">Dernière Activité</label>
                  <p className="text-sm text-text-primary">{selectedActor.lastActivity}</p>
                </div>
                {selectedActor.agreementDate !== "—" && (
                  <>
                    <div>
                      <label className="text-xs text-text-muted uppercase tracking-wider">Date Agrément</label>
                      <p className="text-sm text-text-primary">{selectedActor.agreementDate}</p>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted uppercase tracking-wider">Expiration</label>
                      <p className="text-sm text-text-primary">{selectedActor.expiryDate}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border-default flex gap-3">
              <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-institutional-navy text-white rounded-lg hover:bg-institutional-navy-light transition-colors text-sm font-medium">
                <FileCheck size={16} />
                Voir le Dossier
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-border-default rounded-lg hover:bg-bg-elevated transition-colors text-sm font-medium text-text-secondary">
                <ClipboardCheck size={16} />
                Inspection
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
