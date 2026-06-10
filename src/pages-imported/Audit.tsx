// @ts-nocheck
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardCheck, CheckCircle, XCircle, AlertTriangle, Clock,
  ShieldCheck, Users, Package, Receipt, FileText, TrendingUp
} from 'lucide-react';
import ComplianceGauge from '@/components/imported/ComplianceGauge';

const complianceScore = 87;
const totalPoints = 150;

const categoryScores = [
  { category: 'Gouvernance & Légale', score: 28, max: 30, color: 'bg-success-500' },
  { category: 'Stocks & Inventaire', score: 22, max: 25, color: 'bg-success-500' },
  { category: 'Traçabilité & Ventes', score: 18, max: 25, color: 'bg-warning-500' },
  { category: 'Sécurité & Alertes', score: 12, max: 25, color: 'bg-danger-500' },
  { category: 'Rapportage', score: 7, max: 25, color: 'bg-warning-500' },
  { category: 'Documentation', score: 15, max: 20, color: 'bg-success-500' },
];

const checklistData: Record<string, { item: string; status: 'ok' | 'warning' | 'ko' | 'na' }[]> = {
  'Importateur': [
    { item: 'Licence d\'importation valide', status: 'ok' },
    { item: 'Attestation de conformité des produits', status: 'ok' },
    { item: 'Registre des fournisseurs à jour', status: 'ok' },
    { item: 'Procédure de vérification VIN', status: 'ok' },
    { item: 'Contrat d\'assurance transport', status: 'warning' },
    { item: 'Attestation fiscale à jour', status: 'ok' },
    { item: 'Registre des douanes', status: 'ok' },
  ],
  'Distributeur': [
    { item: 'Contrat de distribution signé', status: 'ok' },
    { item: 'Attestation de fournisseur', status: 'ok' },
    { item: 'Registre des ventes par détaillant', status: 'warning' },
    { item: 'Stock minimum de sécurité', status: 'ok' },
    { item: 'Procédure de retour produit', status: 'ko' },
    { item: 'Attestation CNSS', status: 'ok' },
  ],
  'Détaillant': [
    { item: 'Registre de commerce valide', status: 'ok' },
    { item: 'Attestation de fournisseur', status: 'warning' },
    { item: 'Registre des ventes aux clients', status: 'warning' },
    { item: 'Fiches clients complètes (CNIB)', status: 'ok' },
    { item: 'Procédure de contrôle anti-fraude', status: 'ko' },
    { item: 'Affichage obligatoire (prix)', status: 'ok' },
  ],
  'Réparateur': [
    { item: 'Attestation d\'agrément', status: 'ok' },
    { item: 'Registre des interventions', status: 'warning' },
    { item: 'Stock de pièces détachées tracé', status: 'ko' },
    { item: 'Facturation conforme OHADA', status: 'ok' },
    { item: 'Garantie interventions', status: 'warning' },
  ],
};

const correctiveActions = [
  { id: 'CA-001', title: 'Mettre à jour la procédure de contrôle VIN', priority: 'high', category: 'Sécurité', due: '15/07/2026', status: 'todo' },
  { id: 'CA-002', title: 'Former le personnel sur les alertes CNTI', priority: 'high', category: 'Sécurité', due: '20/07/2026', status: 'in-progress' },
  { id: 'CA-003', title: 'Compléter les fiches clients KYC manquantes', priority: 'medium', category: 'Traçabilité', due: '30/07/2026', status: 'todo' },
  { id: 'CA-004', title: 'Implémenter la vérification automatique des modèles interdits', priority: 'medium', category: 'Stocks', due: '10/08/2026', status: 'done' },
  { id: 'CA-005', title: 'Réviser le contrat d\'assurance transport', priority: 'low', category: 'Gouvernance', due: '31/08/2026', status: 'todo' },
];

const targetDate = new Date('2026-09-30T23:59:59');

export default function Audit() {
  const [activeChecklist, setActiveChecklist] = useState('Importateur');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div><h2 className="text-xl font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Conformité et Audit</h2><p className="text-sm text-navy-500 dark:text-dm-text-secondary mt-1">Grille de conformité 150 points - Décret 05/06/2026</p></div>
        <button className="btn-primary flex items-center gap-2"><ClipboardCheck className="w-4 h-4" /> Lancer un audit</button>
      </motion.div>

      {/* Main Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-base p-8 flex flex-col items-center justify-center">
          <ComplianceGauge percentage={Math.round((complianceScore / totalPoints) * 100)} size="lg" label={`${complianceScore} / ${totalPoints} points`} delay={300} />
          <div className="mt-4 text-center">
            <p className={`text-sm font-bold ${complianceScore >= 120 ? 'text-success-500' : complianceScore >= 80 ? 'text-warning-500' : 'text-danger-500'}`}>
              {complianceScore >= 120 ? 'CONFORME' : complianceScore >= 80 ? 'CONFORMITÉ PARTIELLE' : 'NON CONFORME - ACTION REQUISE'}
            </p>
            <p className="text-xs text-navy-500 dark:text-dm-text-secondary mt-1">Dernier audit: 15/05/2026</p>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-base p-6 lg:col-span-2">
          <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Détail par catégorie</h3>
          <div className="space-y-4">
            {categoryScores.map(cat => {
              const pct = (cat.score / cat.max) * 100;
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-navy-700 dark:text-dm-text-secondary">{cat.category}</span>
                    <span className="text-sm font-mono font-bold text-navy-900 dark:text-dm-text-primary">{cat.score}/{cat.max}</span>
                  </div>
                  <div className="h-2.5 bg-navy-100 dark:bg-dm-bg-tertiary rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.3 }} className={`h-full rounded-full ${pct >= 80 ? 'bg-success-500' : pct >= 50 ? 'bg-warning-500' : 'bg-danger-500'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Countdown */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-base p-4 flex items-center gap-4">
        <Clock className="w-6 h-6 text-terracotta-500" />
        <div><p className="text-sm font-medium text-navy-800 dark:text-dm-text-primary">Prochain audit ministériel prévu</p><p className="text-xs text-navy-500">Date limite de mise en conformité: 30/09/2026</p></div>
        <div className="ml-auto font-mono text-lg font-bold text-terracotta-500">112 jours</div>
      </motion.div>

      {/* Checklist Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-base overflow-hidden">
        <div className="flex border-b border-navy-200 dark:border-dm-border overflow-x-auto">
          {Object.keys(checklistData).map(type => (
            <button key={type} onClick={() => setActiveChecklist(type)} className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeChecklist === type ? 'border-terracotta-500 text-terracotta-500' : 'border-transparent text-navy-500 hover:text-navy-700'}`}>
              {type}
            </button>
          ))}
        </div>
        <div className="p-6">
          <h4 className="text-sm font-semibold text-navy-700 dark:text-dm-text-secondary uppercase tracking-wide mb-4">{activeChecklist} - Points de contrôle</h4>
          <div className="space-y-2">
            {checklistData[activeChecklist].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary">
                <StatusIcon status={item.status} />
                <span className="text-sm text-navy-800 dark:text-dm-text-primary flex-1">{item.item}</span>
                <StatusLabel status={item.status} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Corrective Actions Kanban */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Plan d&apos;actions correctives</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['todo', 'in-progress', 'done'] as const).map(col => (
            <div key={col} className="card-base p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${col === 'todo' ? 'bg-navy-400' : col === 'in-progress' ? 'bg-warning-500' : 'bg-success-500'}`} />
                <h4 className="text-sm font-semibold text-navy-700 dark:text-dm-text-secondary uppercase tracking-wide">{col === 'todo' ? 'À faire' : col === 'in-progress' ? 'En cours' : 'Terminé'}</h4>
                <span className="text-xs text-navy-400 ml-auto">{correctiveActions.filter(a => a.status === col).length}</span>
              </div>
              <div className="space-y-3">
                {correctiveActions.filter(a => a.status === col).map(action => (
                  <div key={action.id} className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary border border-navy-200 dark:border-dm-border hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${action.priority === 'high' ? 'bg-danger-100 text-danger-500' : action.priority === 'medium' ? 'bg-warning-100 text-warning-500' : 'bg-info-100 text-info-500'}`}>{action.priority}</span>
                      <span className="text-[10px] text-navy-400 font-mono">{action.id}</span>
                    </div>
                    <p className="text-sm font-medium text-navy-800 dark:text-dm-text-primary mb-2">{action.title}</p>
                    <div className="flex items-center justify-between text-xs text-navy-500"><span>{action.category}</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{action.due}</span></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'ok') return <CheckCircle className="w-5 h-5 text-success-500" />;
  if (status === 'warning') return <AlertTriangle className="w-5 h-5 text-warning-500" />;
  if (status === 'ko') return <XCircle className="w-5 h-5 text-danger-500" />;
  return <div className="w-5 h-5 rounded-full border-2 border-navy-300" />;
}

function StatusLabel({ status }: { status: string }) {
  if (status === 'ok') return <span className="text-xs text-success-500 font-medium">Conforme</span>;
  if (status === 'warning') return <span className="text-xs text-warning-500 font-medium">Partiel</span>;
  if (status === 'ko') return <span className="text-xs text-danger-500 font-medium">Non conforme</span>;
  return <span className="text-xs text-navy-400 font-medium">N/A</span>;
}
