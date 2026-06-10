import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt, TrendingUp, TrendingDown, AlertTriangle, FileText,
  Download, X, Plus, Printer, Calculator
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import StatusBadge from '@/components/imported/StatusBadge';

const priceData = [
  { month: 'Jan', prixAchat: 785, prixVente: 950, marge: 165 },
  { month: 'Fév', prixAchat: 790, prixVente: 960, marge: 170 },
  { month: 'Mar', prixAchat: 800, prixVente: 975, marge: 175 },
  { month: 'Avr', prixAchat: 810, prixVente: 980, marge: 170 },
  { month: 'Mai', prixAchat: 820, prixVente: 990, marge: 170 },
  { month: 'Juin', prixAchat: 835, prixVente: 1000, marge: 165 },
];

const transactionData = [
  { id: 'V-2026-001', date: '05/06/2026', client: 'Amadou Ouedraogo', cnib: 'B1234567', vehicule: 'TVS HLX 125', vin: 'MLBXB10EXKW000001', prix: '950 000', tva: '171 000', total: '1 121 000', marge: '165 000', statut: 'success' as const },
  { id: 'V-2026-002', date: '04/06/2026', client: 'Jean Zongo', cnib: 'B5678901', vehicule: 'Yamaha YBR 125', vin: 'MLBXB10EXKW000006', prix: '1 400 000', tva: '252 000', total: '1 652 000', marge: '250 000', statut: 'success' as const },
  { id: 'V-2026-003', date: '03/06/2026', client: 'Fatima Kaboré', cnib: 'B2345678', vehicule: 'TVS HLX 150', vin: 'MLBXB10EXKW000002', prix: '1 100 000', tva: '198 000', total: '1 298 000', marge: '205 000', statut: 'success' as const },
  { id: 'V-2026-004', date: '02/06/2026', client: 'Mariama Sanou', cnib: 'B4567890', vehicule: 'Bajaj Boxer 125', vin: 'MLBXB10EXKW000004', prix: '820 000', tva: '147 600', total: '967 600', marge: '170 000', statut: 'warning' as const },
  { id: 'V-2026-005', date: '01/06/2026', client: 'Abdoulaye Compaoré', cnib: 'B7890123', vehicule: 'TVS Apache 160', vin: 'MLBXB10EXKW000007', prix: '1 650 000', tva: '297 000', total: '1 947 000', marge: '300 000', statut: 'success' as const },
  { id: 'V-2026-006', date: '30/05/2026', client: 'Youssouf Sawadogo', cnib: 'B9012345', vehicule: 'Suzuki GD 110', vin: 'MLBXB10EXKW000008', prix: '1 050 000', tva: '189 000', total: '1 239 000', marge: '200 000', statut: 'success' as const },
  { id: 'V-2026-007', date: '28/05/2026', client: 'Salamata Drabo', cnib: 'B8901234', vehicule: 'Bajaj Boxer 150', vin: 'MLBXB10EXKW000003', prix: '890 000', tva: '160 200', total: '1 050 200', marge: '170 000', statut: 'danger' as const },
  { id: 'V-2026-008', date: '25/05/2026', client: 'Hassane Barry', cnib: 'B0123456', vehicule: 'TVS Star City+', vin: 'MLBXB10EXKW000010', prix: '850 000', tva: '153 000', total: '1 003 000', marge: '155 000', statut: 'success' as const },
];

const marginAlerts = [
  { id: 1, message: 'Marge sur Bajaj Boxer 150 inférieure à 20%', current: '18.5%', target: '20%', severity: 'warning' as const },
  { id: 2, message: 'Écart de prix détecté sur TVS HLX 125 entre fournisseurs', current: '+12%', target: '<5%', severity: 'danger' as const },
];

export default function Commercial() {
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<typeof transactionData[0] | null>(null);

  const openInvoice = (t: typeof transactionData[0]) => { setInvoiceData(t); setShowInvoice(true); };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div><h2 className="text-xl font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Gestion Commerciale</h2><p className="text-sm text-navy-500 dark:text-dm-text-secondary mt-1">Suivi des prix, marges et facturation OHADA</p></div>
        <button className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Nouvelle transaction</button>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card-base p-5"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center"><Receipt className="w-5 h-5 text-success-500" /></div><div><p className="text-2xl font-dm-sans font-extrabold text-navy-900 dark:text-dm-text-primary">8 174 800</p><p className="text-xs text-navy-500">CA du trimestre (FCFA)</p></div></div></div>
        <div className="card-base p-5"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-terracotta-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-terracotta-500" /></div><div><p className="text-2xl font-dm-sans font-extrabold text-navy-900 dark:text-dm-text-primary">1 615 000</p><p className="text-xs text-navy-500">Marge totale (FCFA)</p></div></div></div>
        <div className="card-base p-5"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-info-100 flex items-center justify-center"><Calculator className="w-5 h-5 text-info-500" /></div><div><p className="text-2xl font-dm-sans font-extrabold text-navy-900 dark:text-dm-text-primary">19.8%</p><p className="text-xs text-navy-500">Taux de marge moyen</p></div></div></div>
        <div className="card-base p-5"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-warning-500" /></div><div><p className="text-2xl font-dm-sans font-extrabold text-navy-900 dark:text-dm-text-primary">2</p><p className="text-xs text-navy-500">Alertes de marge</p></div></div></div>
      </div>

      {/* Margin Alerts */}
      {marginAlerts.map(a => (
        <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded-xl border flex items-center gap-3 ${a.severity === 'danger' ? 'bg-danger-50 dark:bg-danger-500/10 border-danger-500/20' : 'bg-warning-50 dark:bg-warning-500/10 border-warning-500/20'}`}>
          <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${a.severity === 'danger' ? 'text-danger-500' : 'text-warning-500'}`} />
          <div className="flex-1"><p className={`text-sm font-medium ${a.severity === 'danger' ? 'text-danger-500' : 'text-warning-500'}`}>{a.message}</p><p className="text-xs text-navy-500 dark:text-dm-text-secondary">Actuel: {a.current} | Cible: {a.target}</p></div>
        </motion.div>
      ))}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-base p-6">
          <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Évolution Prix Achat vs Vente (TVS HLX 125)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs><linearGradient id="pa" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#B85C38" stopOpacity={0.3} /><stop offset="95%" stopColor="#B85C38" stopOpacity={0} /></linearGradient><linearGradient id="pv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} /><stop offset="95%" stopColor="#2563EB" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" /><XAxis dataKey="month" stroke="#94A3B8" fontSize={12} /><YAxis stroke="#94A3B8" fontSize={12} /><Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Area type="monotone" dataKey="prixAchat" stroke="#B85C38" strokeWidth={2} fill="url(#pa)" name="Prix achat" /><Area type="monotone" dataKey="prixVente" stroke="#2563EB" strokeWidth={2} fill="url(#pv)" name="Prix vente" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-base p-6">
          <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Marge par mois (FCFA)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" /><XAxis dataKey="month" stroke="#94A3B8" fontSize={12} /><YAxis stroke="#94A3B8" fontSize={12} /><Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="marge" fill="#B85C38" radius={[4, 4, 0, 0]} name="Marge (KFCFA)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Transactions Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-base overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-200 dark:border-dm-border flex items-center justify-between"><h3 className="text-base font-dm-sans font-bold">Transactions récentes</h3><button className="btn-ghost text-sm flex items-center gap-2"><Download className="w-4 h-4" /> Exporter</button></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header"><th className="px-4 py-3 text-left">N° Facture</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Client</th><th className="px-4 py-3 text-left">Véhicule</th><th className="px-4 py-3 text-left">Prix HT</th><th className="px-4 py-3 text-left">TVA 18%</th><th className="px-4 py-3 text-left">Total TTC</th><th className="px-4 py-3 text-left">Marge</th><th className="px-4 py-3 text-left">Statut</th><th className="px-4 py-3"></th></tr></thead>
            <tbody>
              {transactionData.map(t => (
                <tr key={t.id} className="table-row">
                  <td className="px-4 py-3.5 text-sm font-mono text-navy-800 dark:text-dm-text-primary">{t.id}</td>
                  <td className="px-4 py-3.5 text-sm text-navy-600 dark:text-dm-text-secondary">{t.date}</td>
                  <td className="px-4 py-3.5 text-sm text-navy-800 dark:text-dm-text-primary">{t.client}</td>
                  <td className="px-4 py-3.5 text-sm text-navy-600 dark:text-dm-text-secondary">{t.vehicule}</td>
                  <td className="px-4 py-3.5 text-sm font-mono text-navy-800 dark:text-dm-text-primary">{t.prix}</td>
                  <td className="px-4 py-3.5 text-sm font-mono text-navy-600 dark:text-dm-text-secondary">{t.tva}</td>
                  <td className="px-4 py-3.5 text-sm font-mono font-bold text-navy-900 dark:text-dm-text-primary">{t.total}</td>
                  <td className="px-4 py-3.5 text-sm font-mono text-success-500">{t.marge}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={t.statut} label={t.statut === 'success' ? 'Payée' : t.statut === 'warning' ? 'En attente' : 'Anomalie'} /></td>
                  <td className="px-4 py-3.5"><button onClick={() => openInvoice(t)} className="text-terracotta-500 hover:text-terracotta-600 text-sm flex items-center gap-1"><FileText className="w-3 h-3" /> Facture</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Invoice Modal */}
      <AnimatePresence>
        {showInvoice && invoiceData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowInvoice(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div><h3 className="text-2xl font-dm-sans font-bold text-navy-900">FACTURE</h3><p className="text-sm font-mono text-navy-500 mt-1">{invoiceData.id}</p><p className="text-sm text-navy-500">Date: {invoiceData.date}</p></div>
                  <div className="text-right"><div className="w-12 h-12 rounded-lg bg-gradient-warm flex items-center justify-center mx-auto mb-2"><Receipt className="w-6 h-6 text-white" /></div><p className="text-xs text-navy-500">iReg Moto BF</p></div>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-6 p-4 rounded-lg bg-navy-50">
                  <div><p className="text-xs font-semibold text-navy-500 uppercase mb-1">Vendeur</p><p className="text-sm font-medium text-navy-900">Faso Moto SARL</p><p className="text-xs text-navy-500">BF-OUA-2019-A-1234</p><p className="text-xs text-navy-500">IFU: 00012345A</p><p className="text-xs text-navy-500">Ouagadougou, Burkina Faso</p></div>
                  <div><p className="text-xs font-semibold text-navy-500 uppercase mb-1">Client</p><p className="text-sm font-medium text-navy-900">{invoiceData.client}</p><p className="text-xs text-navy-500 font-mono">CNIB: {invoiceData.cnib}</p></div>
                </div>
                <table className="w-full mb-6">
                  <thead><tr className="border-b border-navy-200"><th className="text-left py-2 text-xs font-semibold text-navy-500 uppercase">Description</th><th className="text-right py-2 text-xs font-semibold text-navy-500 uppercase">Montant (FCFA)</th></tr></thead>
                  <tbody>
                    <tr className="border-b border-navy-100"><td className="py-3"><p className="text-sm font-medium text-navy-900">{invoiceData.vehicule}</p><p className="text-xs text-navy-500 font-mono">VIN: {invoiceData.vin}</p></td><td className="py-3 text-right text-sm font-mono">{invoiceData.prix}</td></tr>
                    <tr className="border-b border-navy-100"><td className="py-2 text-sm text-navy-600">TVA (18%)</td><td className="py-2 text-right text-sm font-mono text-navy-600">{invoiceData.tva}</td></tr>
                    <tr><td className="py-3 text-sm font-bold text-navy-900">TOTAL TTC</td><td className="py-3 text-right text-base font-bold font-mono text-terracotta-500">{invoiceData.total} FCFA</td></tr>
                  </tbody>
                </table>
                <div className="p-3 rounded-lg bg-success-50 border border-success-500/20 mb-6"><p className="text-xs text-success-500 font-medium">Conforme OHADA - TVA 18% appliquée - Facture électronique</p></div>
                <div className="flex gap-3"><button onClick={() => setShowInvoice(false)} className="btn-secondary flex-1 flex items-center justify-center gap-2"><X className="w-4 h-4" /> Fermer</button><button className="btn-primary flex-1 flex items-center justify-center gap-2"><Printer className="w-4 h-4" /> Imprimer</button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
