import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Bike,
  Users,
  DollarSign,
  Building2,
  MapPin,
  Award,
  Download,
  Share2,
  Printer,
  ChevronRight,
} from "lucide-react"
import StatCard from "@/components/StatCard"
import StatusBadge from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
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
  LineChart,
  Line,
} from "recharts"
import { cn } from "@/lib/utils"
import { formatNumber, formatCurrency } from "@/lib/utils"

const monthlySalesData = [
  { month: "Juil. 24", sales: 10420, target: 10000 },
  { month: "Août", sales: 11250, target: 10500 },
  { month: "Sept.", sales: 10890, target: 10200 },
  { month: "Oct.", sales: 12560, target: 11000 },
  { month: "Nov.", sales: 13100, target: 11500 },
  { month: "Déc.", sales: 14200, target: 12000 },
  { month: "Janv. 25", sales: 13800, target: 12500 },
  { month: "Févr.", sales: 12900, target: 12000 },
  { month: "Mars", sales: 14500, target: 13000 },
  { month: "Avr.", sales: 15200, target: 13500 },
  { month: "Mai", sales: 14800, target: 14000 },
  { month: "Juin", sales: 15647, target: 14500 },
]

const byRegionData = [
  { region: "Centre", sales: 42380, enterprises: 48 },
  { region: "Hauts-Bassins", sales: 28560, enterprises: 32 },
  { region: "Centre-Ouest", sales: 11240, enterprises: 18 },
  { region: "Est", sales: 9870, enterprises: 15 },
  { region: "Plateau-Central", sales: 9230, enterprises: 12 },
  { region: "Boucle du Mouhoun", sales: 8450, enterprises: 11 },
  { region: "Centre-Est", sales: 7890, enterprises: 10 },
  { region: "Nord", sales: 7890, enterprises: 9 },
  { region: "Cascades", sales: 5230, enterprises: 8 },
  { region: "Sud-Ouest", sales: 5357, enterprises: 7 },
  { region: "Centre-Sud", sales: 6340, enterprises: 6 },
  { region: "Centre-Nord", sales: 6750, enterprises: 6 },
  { region: "Sahel", sales: 4560, enterprises: 4 },
]

const byBrandData = [
  { name: "TVS", share: 28.4, sales: 44516, color: "#C9963B" },
  { name: "Bajaj", share: 22.1, sales: 34641, color: "#3A7CC7" },
  { name: "Yamaha", share: 15.3, sales: 23982, color: "#2E8B57" },
  { name: "Honda", share: 12.7, sales: 19907, color: "#7C5CC9" },
  { name: "KTM", share: 8.2, sales: 12853, color: "#E8943A" },
  { name: "Hero", share: 6.8, sales: 10659, color: "#C73E3E" },
  { name: "Apsonic", share: 3.5, sales: 5486, color: "#2D9CDB" },
  { name: "Autres", share: 3.0, sales: 4703, color: "#8899AA" },
]

const byTypeData = [
  { name: "Moto standard", value: 52, color: "#3A7CC7" },
  { name: "Moto sport", value: 18, color: "#C9963B" },
  { name: "Scooter", value: 15, color: "#2E8B57" },
  { name: "Électrique", value: 8, color: "#7C5CC9" },
  { name: "Tricycle", value: 5, color: "#E8943A" },
  { name: "Autre", value: 2, color: "#8899AA" },
]

const cylinderData = [
  { range: "50-100cc", count: 15620, color: "#2E8B57" },
  { range: "100-125cc", count: 42380, color: "#3A7CC7" },
  { range: "125-150cc", count: 38450, color: "#C9963B" },
  { range: "150-200cc", count: 28970, color: "#7C5CC9" },
  { range: "200-250cc", count: 15230, color: "#E8943A" },
  { range: "250-400cc", count: 9870, color: "#2D9CDB" },
  { range: "400cc+", count: 4227, color: "#C73E3E" },
]

const complianceTrend = [
  { quarter: "Q3 2024", rate: 72 },
  { quarter: "Q4 2024", rate: 80 },
  { quarter: "Q1 2025", rate: 85 },
  { quarter: "Q2 2025", rate: 87 },
]

export default function NationalReports() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-playfair-display text-3xl font-bold">Rapport National 2025</h1>
          <p className="text-text-muted mt-1">Statistiques annuelles du secteur des deux-roues motorisés — Burkina Faso</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-text-muted">
            <BarChart3 size={16} className="text-gold-accent" />
            <span>Période : Juillet 2024 — Juin 2025</span>
            <span className="text-border-default">|</span>
            <span>Publié le 05/06/2026</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Printer size={14} className="mr-1" /> Imprimer</Button>
          <Button variant="outline" size="sm"><Download size={14} className="mr-1" /> PDF</Button>
          <Button variant="outline" size="sm"><Share2 size={14} className="mr-1" /> Partager</Button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ventes totales"
          value={156747}
          suffix=""
          icon={<Bike size={24} />}
          iconBg="rgba(58,124,199,0.12)"
          iconColor="#3A7CC7"
          trend={8.7}
          trendLabel="vs 2024"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={28.4}
          suffix="Mds FCFA"
          icon={<DollarSign size={24} />}
          iconBg="rgba(201,150,59,0.12)"
          iconColor="#C9963B"
          trend={12.3}
          trendLabel="vs 2024"
          decimals={1}
        />
        <StatCard
          title="Emplois directs"
          value={12450}
          suffix=""
          icon={<Users size={24} />}
          iconBg="rgba(46,139,87,0.12)"
          iconColor="#2E8B57"
          trend={5.2}
          trendLabel="vs 2024"
        />
        <StatCard
          title="Recettes fiscales"
          value={2.8}
          suffix="Mds FCFA"
          icon={<Building2 size={24} />}
          iconBg="rgba(124,92,201,0.12)"
          iconColor="#7C5CC9"
          trend={15.8}
          trendLabel="vs 2024"
          decimals={1}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales */}
        <div className="bg-white rounded-xl card-shadow p-5">
          <h3 className="font-playfair-display text-lg font-semibold mb-4">Ventes mensuelles (Juil. 2024 — Juin 2025)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F4" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="sales" fill="#3A7CC7" radius={[4, 4, 0, 0]} name="Ventes réelles" />
              <Bar dataKey="target" fill="#DDE3E8" radius={[4, 4, 0, 0]} name="Objectif" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Region */}
        <div className="bg-white rounded-xl card-shadow p-5">
          <h3 className="font-playfair-display text-lg font-semibold mb-4">Ventes par région</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byRegionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F4" />
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="region" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="sales" fill="#C9963B" radius={[0, 4, 4, 0]} name="Ventes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Brand */}
        <div className="bg-white rounded-xl card-shadow p-5">
          <h3 className="font-playfair-display text-lg font-semibold mb-4">Répartition par marque</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byBrandData} cx="50%" cy="50%" outerRadius={80} dataKey="share" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                {byBrandData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By Type */}
        <div className="bg-white rounded-xl card-shadow p-5">
          <h3 className="font-playfair-display text-lg font-semibold mb-4">Répartition par type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                {byTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cylinder Distribution */}
        <div className="bg-white rounded-xl card-shadow p-5">
          <h3 className="font-playfair-display text-lg font-semibold mb-4">Distribution par cylindrée</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cylinderData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F4" />
              <XAxis dataKey="range" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="count" fill="#2E8B57" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Brand Leaderboard */}
      <div className="bg-white rounded-xl card-shadow p-5">
        <h3 className="font-playfair-display text-xl font-semibold mb-4 flex items-center gap-2">
          <Award size={22} className="text-gold-accent" />
          Classement des marques
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Rang</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Marque</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Parts de marché</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Ventes 2025</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Évolution</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Visuel</th>
              </tr>
            </thead>
            <tbody>
              {byBrandData.filter((b) => b.name !== "Autres").map((brand, idx) => (
                <tr key={brand.name} className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className={cn("font-jetbrains-mono font-bold", idx === 0 ? "text-gold-accent" : idx === 1 ? "text-text-secondary" : idx === 2 ? "text-chart-orange" : "text-text-muted")}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{brand.name}</td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 h-2 bg-bg-elevated rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(brand.share / 28.4) * 100}%`, background: brand.color }} />
                      </div>
                      <span className="font-jetbrains-mono font-medium">{brand.share}%</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-jetbrains-mono">{formatNumber(brand.sales)}</td>
                  <td className="text-right py-3 px-4">
                    <span className={cn("flex items-center justify-end gap-1 text-xs font-medium", idx % 3 === 0 ? "text-status-compliant" : "text-status-warning")}>
                      {idx % 3 === 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {(Math.random() * 8 + 1).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: brand.color, opacity: 0.3 }}>
                      <div className="h-full rounded-full" style={{ width: `${brand.share}%`, background: brand.color }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regional Table + Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl card-shadow p-5">
          <h3 className="font-playfair-display text-lg font-semibold mb-4">Détail par région (13 régions)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-elevated">
                  <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Région</th>
                  <th className="text-left py-3 px-4 font-medium text-text-muted uppercase text-xs">Chef-lieu</th>
                  <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Ent.</th>
                  <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Ventes</th>
                  <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">Part</th>
                  <th className="text-right py-3 px-4 font-medium text-text-muted uppercase text-xs">CA (Mds)</th>
                </tr>
              </thead>
              <tbody>
                {byRegionData.map((r) => (
                  <tr key={r.region} className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/50 transition-colors">
                    <td className="py-3 px-4 font-medium flex items-center gap-2">
                      <MapPin size={14} className="text-text-muted" /> {r.region}
                    </td>
                    <td className="py-3 px-4 text-xs text-text-muted">
                      {regions.find((rg) => rg.name === r.region)?.capital || "—"}
                    </td>
                    <td className="text-right py-3 px-4 font-jetbrains-mono">{r.enterprises}</td>
                    <td className="text-right py-3 px-4 font-jetbrains-mono">{formatNumber(r.sales)}</td>
                    <td className="text-right py-3 px-4 font-jetbrains-mono text-xs">{((r.sales / 156747) * 100).toFixed(1)}%</td>
                    <td className="text-right py-3 px-4 font-jetbrains-mono">{((r.sales * 181000) / 1000000000).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {/* Compliance Trend */}
          <div className="bg-white rounded-xl card-shadow p-5">
            <h3 className="font-playfair-display text-lg font-semibold mb-4">Tendance conformité</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={complianceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F4" />
                <XAxis dataKey="quarter" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="rate" stroke="#2E8B57" strokeWidth={2.5} dot={{ r: 4, fill: "#2E8B57" }} name="Taux %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Economic Impact */}
          <div className="bg-white rounded-xl card-shadow p-5">
            <h3 className="font-playfair-display text-lg font-semibold mb-4">Impact économique</h3>
            <div className="space-y-4">
              <div className="p-3 bg-bg-elevated rounded-lg">
                <p className="text-xs text-text-muted">Emplois directs</p>
                <p className="font-jetbrains-mono text-xl font-bold text-status-compliant">12,450</p>
                <p className="text-xs text-text-muted">+5.2% vs 2024</p>
              </div>
              <div className="p-3 bg-bg-elevated rounded-lg">
                <p className="text-xs text-text-muted">Emplois indirects</p>
                <p className="font-jetbrains-mono text-xl font-bold text-status-info">28,300</p>
                <p className="text-xs text-text-muted">+4.8% vs 2024</p>
              </div>
              <div className="p-3 bg-bg-elevated rounded-lg">
                <p className="text-xs text-text-muted">Recettes fiscales</p>
                <p className="font-jetbrains-mono text-xl font-bold text-gold-accent">2.8 Mds FCFA</p>
                <p className="text-xs text-text-muted">+15.8% vs 2024</p>
              </div>
              <div className="p-3 bg-bg-elevated rounded-lg">
                <p className="text-xs text-text-muted">Chiffre d'affaires total</p>
                <p className="font-jetbrains-mono text-xl font-bold text-chart-purple">28.4 Mds FCFA</p>
                <p className="text-xs text-text-muted">+12.3% vs 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper for capital lookup
const regions = [
  { name: "Boucle du Mouhoun", capital: "Dédougou" },
  { name: "Cascades", capital: "Banfora" },
  { name: "Centre", capital: "Ouagadougou" },
  { name: "Centre-Est", capital: "Tenkodogo" },
  { name: "Centre-Nord", capital: "Kaya" },
  { name: "Centre-Ouest", capital: "Koudougou" },
  { name: "Centre-Sud", capital: "Manga" },
  { name: "Est", capital: "Fada N'Gourma" },
  { name: "Hauts-Bassins", capital: "Bobo-Dioulasso" },
  { name: "Nord", capital: "Ouahigouya" },
  { name: "Plateau-Central", capital: "Ziniaré" },
  { name: "Sahel", capital: "Dori" },
  { name: "Sud-Ouest", capital: "Gaoua" },
]
