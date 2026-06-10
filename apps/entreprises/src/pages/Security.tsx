import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Ban, AlertTriangle, FileText, Send, X, CheckCircle,
  Clock, TrendingUp, Users, Eye, Lock
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const blacklistData = [
  { id: 'BLK-001', cnib: 'B7654321', nom: 'Karim Touré', motif: 'Documents falsifiés', dateAjout: '15/04/2026', ajoutePar: 'Système', statut: 'active' as const },
  { id: 'BLK-002', cnib: 'B8765432', nom: 'Adama Ouattara', motif: 'Fraude fiscale', dateAjout: '22/03/2026', ajoutePar: 'Ministère', statut: 'active' as const },
  { id: 'BLK-003', cnib: 'B9876543', nom: 'Moussa Sorgho', motif: 'Contrefaçon de VIN', dateAjout: '10/02/2026', ajoutePar: 'CNTI', statut: 'resolved' as const },
  { id: 'BLK-004', cnib: 'B0987654', nom: 'Awa Sankara', motif: 'Tentative de vente illégale', dateAjout: '05/01/2026', ajoutePar: 'Système', statut: 'active' as const },
  { id: 'BLK-005', cnib: 'B1098765', nom: 'Blaise Compaoré', motif: 'Non-respect des obligations de rapportage', dateAjout: '18/12/2025', ajoutePar: 'Ministère', statut: 'resolved' as const },
];

const suspiciousTransactions = [
  {
    id: 'ALT-001', type: 'Paiement suspect', severity: 'high' as const,
    description: 'Transaction de 3 500 000 FCFA en espèces sans pièce d\'identité vérifiée',
    date: '05/06/2026', montant: '3 500 000', vendeur: 'Ibrahim Bamba', client: 'Inconnu',
    riskScore: 92, status: 'open' as const
  },
  {
    id: 'ALT-002', type: 'Volume anormal', severity: 'medium' as const,
    description: 'Achat de 5 véhicules par un seul client en 48h sans justificatif professionnel',
    date: '03/06/2026', montant: '4 750 000', vendeur: 'Fatima Sanou', client: 'Youssouf Sawadogo',
    riskScore: 67, status: 'investigating' as const
  },
  {
    id: 'ALT-003', type: 'Horaire inhabituel', severity: 'medium' as const,
    description: 'Enregistrement de vente à 23h42 sans supervison du gérant',
    date: '01/06/2026', montant: '950 000', vendeur: 'Jean Zongo', client: 'Amadou Ouedraogo',
    riskScore: 54, status: 'resolved' as const
  },
];

const seizureTimeline = [
  { date: '15/05/2026', event: 'Signalement CNTI reçu', type: 'alert' },
  { date: '16/05/2026', event: 'Vérification sur place par les services compétents', type: 'info' },
  { date: '18/05/2026', event: 'Saisie de 12 véhicules non conformes', type: 'danger' },
  { date: '20/05/2026', event: 'Notification formelle envoyée au propriétaire', type: 'warning' },
  { date: '25/05/2026', event: 'Mise en conformité validée', type: 'success' },
];

export default function Security() {
  const [showCntiModal, setShowCntiModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<typeof suspiciousTransactions[0] | null>(null);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div><h2 className="text-xl font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Sécurité et Alertes</h2><p className="text-sm text-navy-500 dark:text-dm-text-secondary mt-1">Liste noire, transactions suspectes et signalement CNTI</p></div>
        <button onClick={() => setShowCntiModal(true)} className="btn-primary flex items-center gap-2"><Send className="w-4 h-4" /> Signaler CNTI</button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card-base p-5 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center"><Ban className="w-5 h-5 text-danger-500" /></div><div><p className="text-2xl font-dm-sans font-extrabold text-navy-900 dark:text-dm-text-primary">{blacklistData.filter(b => b.statut === 'active').length}</p><p className="text-xs text-navy-500">Blacklistés actifs</p></div></div>
        <div className="card-base p-5 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-warning-500" /></div><div><p className="text-2xl font-dm-sans font-extrabold text-navy-900 dark:text-dm-text-primary">{suspiciousTransactions.filter(s => s.status === 'open').length}</p><p className="text-xs text-navy-500">Alertes ouvertes</p></div></div>
        <div className="card-base p-5 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-info-100 flex items-center justify-center"><Eye className="w-5 h-5 text-info-500" /></div><div><p className="text-2xl font-dm-sans font-extrabold text-navy-900 dark:text-dm-text-primary">{suspiciousTransactions.filter(s => s.status === 'investigating').length}</p><p className="text-xs text-navy-500">En investigation</p></div></div>
        <div className="card-base p-5 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-success-500" /></div><div><p className="text-2xl font-dm-sans font-extrabold text-navy-900 dark:text-dm-text-primary">{suspiciousTransactions.filter(s => s.status === 'resolved').length}</p><p className="text-xs text-navy-500">Résolues ce mois</p></div></div>
      </div>

      {/* Suspicious Transaction Cards */}
      <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Alertes de transactions suspectes</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suspiciousTransactions.map((alert, i) => (
          <motion.div key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className={`card-base p-5 border-l-4 ${alert.severity === 'high' ? 'border-l-danger-500' : 'border-l-warning-500'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-navy-400">{alert.id}</span>
              <StatusBadge status={alert.severity === 'high' ? 'danger' : 'warning'} label={alert.severity === 'high' ? 'CRITIQUE' : 'MOYEN'} />
            </div>
            <h4 className="text-sm font-bold text-navy-900 dark:text-dm-text-primary mb-2">{alert.type}</h4>
            <p className="text-xs text-navy-600 dark:text-dm-text-secondary mb-4 leading-relaxed">{alert.description}</p>
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs"><span className="text-navy-500">Montant</span><span className="font-mono font-bold text-navy-900 dark:text-dm-text-primary">{alert.montant} FCFA</span></div>
              <div className="flex justify-between text-xs"><span className="text-navy-500">Vendeur</span><span className="text-navy-800 dark:text-dm-text-primary">{alert.vendeur}</span></div>
              <div className="flex justify-between text-xs"><span className="text-navy-500">Date</span><span className="text-navy-800 dark:text-dm-text-primary">{alert.date}</span></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${alert.riskScore >= 80 ? 'bg-danger-500' : alert.riskScore >= 60 ? 'bg-warning-500' : 'bg-info-500'}`}>{alert.riskScore}</div>
                <span className="text-[10px] text-navy-500">Score risque</span>
              </div>
              <button onClick={() => setSelectedAlert(alert)} className="text-terracotta-500 text-xs font-medium hover:text-terracotta-600">Détails</button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Blacklist Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-base overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-200 dark:border-dm-border"><h3 className="text-base font-dm-sans font-bold">Liste noire</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header"><th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">CNIB</th><th className="px-4 py-3 text-left">Nom</th><th className="px-4 py-3 text-left">Motif</th><th className="px-4 py-3 text-left">Date ajout</th><th className="px-4 py-3 text-left">Source</th><th className="px-4 py-3 text-left">Statut</th></tr></thead>
            <tbody>
              {blacklistData.map(b => (
                <tr key={b.id} className={`table-row ${b.statut === 'active' ? 'bg-danger-50/30 dark:bg-danger-500/5' : ''}`}>
                  <td className="px-4 py-3.5 text-sm font-mono text-navy-800 dark:text-dm-text-primary">{b.id}</td>
                  <td className="px-4 py-3.5 text-sm font-mono">{b.cnib}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-navy-900 dark:text-dm-text-primary">{b.nom}</td>
                  <td className="px-4 py-3.5 text-sm text-navy-600 dark:text-dm-text-secondary">{b.motif}</td>
                  <td className="px-4 py-3.5 text-sm text-navy-600 dark:text-dm-text-secondary">{b.dateAjout}</td>
                  <td className="px-4 py-3.5 text-sm text-navy-600 dark:text-dm-text-secondary">{b.ajoutePar}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={b.statut === 'active' ? 'danger' : 'success'} label={b.statut === 'active' ? 'Actif' : 'Résolu'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Seizure Timeline */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card-base p-6">
        <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Chronologie - Dernière saisie</h3>
        <div className="relative pl-6 border-l-2 border-navy-200 dark:border-dm-border space-y-6">
          {seizureTimeline.map((event, i) => (
            <div key={i} className="relative">
              <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${event.type === 'success' ? 'bg-success-500 border-success-500' : event.type === 'danger' ? 'bg-danger-500 border-danger-500' : event.type === 'warning' ? 'bg-warning-500 border-warning-500' : 'bg-info-500 border-info-500'}`} />
              <p className="text-xs text-navy-500 font-mono mb-0.5">{event.date}</p>
              <p className="text-sm text-navy-800 dark:text-dm-text-primary">{event.event}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CNTI Modal */}
      <AnimatePresence>
        {showCntiModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCntiModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-dm-bg-secondary rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-dm-sans font-bold">Signalement CNTI</h3><button onClick={() => setShowCntiModal(false)} className="w-8 h-8 rounded-lg hover:bg-navy-100 flex items-center justify-center"><X className="w-4 h-4" /></button></div>
              <div className="space-y-4">
                <div><label className="text-xs font-medium text-navy-700 mb-1 block">Type d&apos;incident</label><select className="input-base w-full"><option>Transaction suspecte</option><option>Document falsifié</option><option>Véhicule volé</option><option>Non-respect réglementaire</option><option>Fraude fiscale</option></select></div>
                <div><label className="text-xs font-medium text-navy-700 mb-1 block">CNIB du suspect (si connu)</label><input className="input-base w-full font-mono" placeholder="B1234567" /></div>
                <div><label className="text-xs font-medium text-navy-700 mb-1 block">Description</label><textarea className="input-base w-full min-h-[100px] resize-y" placeholder="Décrivez l'incident..." /></div>
                <div><label className="text-xs font-medium text-navy-700 mb-1 block">Pièces jointes</label><div className="border-2 border-dashed border-navy-300 dark:border-dm-border rounded-xl p-4 text-center"><FileText className="w-6 h-6 mx-auto text-navy-400 mb-1" /><p className="text-xs text-navy-500">Glissez vos fichiers ici ou cliquez pour parcourir</p></div></div>
              </div>
              <div className="flex gap-3 mt-6"><button onClick={() => setShowCntiModal(false)} className="btn-secondary flex-1">Annuler</button><button onClick={() => setShowCntiModal(false)} className="btn-primary flex-1 flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Envoyer au CNTI</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAlert(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-dm-bg-secondary rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-dm-sans font-bold">Détail de l&apos;alerte</h3><button onClick={() => setSelectedAlert(null)} className="w-8 h-8 rounded-lg hover:bg-navy-100 flex items-center justify-center"><X className="w-4 h-4" /></button></div>
              <div className="space-y-4">
                <div className="flex items-center gap-3"><div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${selectedAlert.riskScore >= 80 ? 'bg-danger-500' : selectedAlert.riskScore >= 60 ? 'bg-warning-500' : 'bg-info-500'}`}>{selectedAlert.riskScore}</div><div><p className="text-sm font-bold text-navy-900 dark:text-dm-text-primary">{selectedAlert.type}</p><p className="text-xs text-navy-500">{selectedAlert.id}</p></div></div>
                <div className="p-4 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary space-y-2"><div className="flex justify-between text-sm"><span className="text-navy-500">Montant</span><span className="font-mono font-bold">{selectedAlert.montant} FCFA</span></div><div className="flex justify-between text-sm"><span className="text-navy-500">Vendeur</span><span>{selectedAlert.vendeur}</span></div><div className="flex justify-between text-sm"><span className="text-navy-500">Client</span><span>{selectedAlert.client}</span></div><div className="flex justify-between text-sm"><span className="text-navy-500">Date</span><span>{selectedAlert.date}</span></div></div>
                <p className="text-sm text-navy-700 dark:text-dm-text-secondary">{selectedAlert.description}</p>
              </div>
              <div className="flex gap-3 mt-6"><button onClick={() => setSelectedAlert(null)} className="btn-secondary flex-1">Fermer</button><button className="btn-primary flex-1 flex items-center justify-center gap-2"><Lock className="w-4 h-4" /> Bloquer</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
