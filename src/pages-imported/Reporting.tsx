import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle, XCircle, AlertTriangle, Send,
  Download, Eye, ChevronRight, ChevronLeft, ShieldCheck,
  Upload, PenTool, Clock, Printer, X, Lock
} from 'lucide-react';
import ComplianceGauge from '@/components/imported/ComplianceGauge';

const checklistItems = [
  { id: 1, label: 'Déclaration des stocks de début de trimestre', completed: true, required: true },
  { id: 2, label: 'Registre des entrées (achats/importations)', completed: true, required: true },
  { id: 3, label: 'Registre des sorties (ventes)', completed: true, required: true },
  { id: 4, label: 'Stock de clôture et inventaire physique', completed: true, required: true },
  { id: 5, label: 'Liste des acteurs économiques (mise à jour)', completed: true, required: true },
  { id: 6, label: 'Déclaration des clients et acheteurs', completed: false, required: true },
  { id: 7, label: 'Attestation de paiement des taxes et redevances', completed: false, required: false },
];

const xmlPreview = `<?xml version="1.0" encoding="UTF-8"?>
<rapport-trimestriel xmlns="http://www.ireg-moto.bf/rapport"
  trimestre="T2-2026"
  entreprise="Faso Moto SARL"
  rccm="BF-OUA-2019-A-1234"
  ifu="00012345A"
  date-soumission="2026-07-10">
  
  <stock-debut>
    <vehicules>142</vehicules>
    <valeur>111470000</valeur>
  </stock-debut>
  
  <entrees>
    <vehicules>38</vehicules>
    <valeur>29860000</valeur>
  </entrees>
  
  <sorties>
    <vehicules>24</vehicules>
    <valeur>20450000</valeur>
  </sorties>
  
  <stock-fin>
    <vehicules>156</vehicules>
    <valeur>120880000</valeur>
  </stock-fin>
  
  <acteurs>
    <importateurs>2</importateurs>
    <distributeurs>4</distributeurs>
    <detaillants>15</detaillants>
    <total>24</total>
  </acteurs>
  
</rapport-trimestriel>`;

export default function Reporting() {
  const [activeTab, setActiveTab] = useState<'checklist' | 'xml' | 'pdf'>('checklist');
  const [wizardStep, setWizardStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const completedCount = checklistItems.filter(i => i.completed).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  const startSubmission = () => setWizardStep(1);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 3000);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div><h2 className="text-xl font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Rapportage Trimestriel</h2><p className="text-sm text-navy-500 dark:text-dm-text-secondary mt-1">Trimestre 2 - Avril à Juin 2026</p></div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-warning-50 dark:bg-warning-500/10 border border-warning-500/20 flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning-500" />
            <span className="text-sm font-medium text-warning-500">Échéance: 15/07/2026</span>
          </div>
          <button onClick={startSubmission} disabled={wizardStep > 0 || submitted} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <Send className="w-4 h-4" /> Soumettre au Ministère
          </button>
        </div>
      </motion.div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-base p-6 text-center">
          <ComplianceGauge percentage={progressPercent} size="md" label="Complétion" delay={200} />
          <p className="text-xs text-navy-500 dark:text-dm-text-secondary mt-2">{completedCount} / {checklistItems.length} éléments complétés</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-base p-6">
          <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-success-500" /></div><div><p className="text-lg font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">{checklistItems.filter(i => i.completed && i.required).length}/{checklistItems.filter(i => i.required).length}</p><p className="text-xs text-navy-500">Obligatoires complétés</p></div></div>
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-info-100 flex items-center justify-center"><FileText className="w-5 h-5 text-info-500" /></div><div><p className="text-lg font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">{checklistItems.filter(i => !i.required).length}</p><p className="text-xs text-navy-500">Éléments facultatifs</p></div></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-base p-6 flex flex-col justify-center">
          {submitted ? (
            <div className="text-center"><div className="w-14 h-14 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-7 h-7 text-success-500" /></div><p className="text-sm font-bold text-success-500">Rapport soumis avec succès</p><p className="text-xs text-navy-500 mt-1">Le 10/07/2026 à 14:32</p></div>
          ) : (
            <div className="text-center"><div className="w-14 h-14 rounded-full bg-warning-100 flex items-center justify-center mx-auto mb-3"><AlertTriangle className="w-7 h-7 text-warning-500" /></div><p className="text-sm font-bold text-warning-500">{5 - completedCount} élément(s) en attente</p><p className="text-xs text-navy-500 mt-1">Soumission impossible sans validation complète</p></div>
          )}
        </motion.div>
      </div>

      {/* Submission Wizard */}
      <AnimatePresence>
        {wizardStep > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card-base p-6 border-2 border-terracotta-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Assistant de soumission au Ministère</h3>
              <button onClick={() => { if (!submitted) setWizardStep(0); }} className="w-8 h-8 rounded-lg hover:bg-navy-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center justify-center mb-8">
              {['Validation', 'Génération', 'Signature', 'Soumission'].map((label, i) => {
                const step = i + 1;
                const isActive = wizardStep === step;
                const isDone = wizardStep > step || submitted;
                return (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${isDone ? 'bg-success-500 text-white' : isActive ? 'bg-terracotta-500 text-white' : 'bg-navy-200 dark:bg-dm-border text-navy-500'}`}>
                        {isDone ? <CheckCircle className="w-5 h-5" /> : step}
                      </div>
                      <span className={`text-xs mt-1.5 font-medium ${isActive || isDone ? 'text-navy-800 dark:text-dm-text-primary' : 'text-navy-400'}`}>{label}</span>
                    </div>
                    {step < 4 && <div className={`w-16 h-0.5 mx-2 ${isDone ? 'bg-success-500' : 'bg-navy-200 dark:bg-dm-border'}`} />}
                  </div>
                );
              })}
            </div>
            {wizardStep === 1 && <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4"><h4 className="font-semibold text-navy-800 dark:text-dm-text-primary">Étape 1: Validation des données</h4><div className="space-y-2">{checklistItems.map(item => (<div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg ${item.completed ? 'bg-success-50 dark:bg-success-500/5' : 'bg-warning-50 dark:bg-warning-500/5'}`}><div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.completed ? 'bg-success-500' : 'bg-warning-500'}`}>{item.completed ? <CheckCircle className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-white" />}</div><span className="text-sm text-navy-800 dark:text-dm-text-primary flex-1">{item.label}</span>{item.required && <span className="text-[10px] bg-danger-100 text-danger-500 px-1.5 py-0.5 rounded font-medium">REQUIS</span>}</div>))}</div><button onClick={() => setWizardStep(2)} className="btn-primary w-full mt-4" disabled={completedCount < 5}>Valider et continuer</button></motion.div>}
            {wizardStep === 2 && <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4"><h4 className="font-semibold text-navy-800 dark:text-dm-text-primary">Étape 2: Génération des fichiers</h4><div className="grid grid-cols-2 gap-4"><div className="p-4 rounded-xl bg-navy-50 dark:bg-dm-bg-tertiary text-center"><FileText className="w-8 h-8 mx-auto text-info-500 mb-2" /><p className="text-sm font-medium text-navy-800 dark:text-dm-text-primary">rapport-T2-2026.xml</p><p className="text-xs text-navy-500">28.4 KB</p><button className="text-xs text-terracotta-500 mt-2 flex items-center gap-1 mx-auto"><Download className="w-3 h-3" /> Télécharger</button></div><div className="p-4 rounded-xl bg-navy-50 dark:bg-dm-bg-tertiary text-center"><FileText className="w-8 h-8 mx-auto text-danger-500 mb-2" /><p className="text-sm font-medium text-navy-800 dark:text-dm-text-primary">rapport-T2-2026.pdf</p><p className="text-xs text-navy-500">142.8 KB</p><button className="text-xs text-terracotta-500 mt-2 flex items-center gap-1 mx-auto"><Download className="w-3 h-3" /> Télécharger</button></div></div><div className="flex gap-3"><button onClick={() => setWizardStep(1)} className="btn-secondary flex-1">Précédent</button><button onClick={() => setWizardStep(3)} className="btn-primary flex-1">Continuer</button></div></motion.div>}
            {wizardStep === 3 && <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4"><h4 className="font-semibold text-navy-800 dark:text-dm-text-primary">Étape 3: Signature électronique</h4><div className="p-6 rounded-xl bg-navy-50 dark:bg-dm-bg-tertiary text-center"><Lock className="w-10 h-10 mx-auto text-navy-400 mb-3" /><p className="text-sm text-navy-700 dark:text-dm-text-secondary mb-4">Veuillez signer électroniquement pour confirmer l&apos;exactitude des informations</p><div className="p-3 rounded-lg bg-white dark:bg-dm-bg-secondary border border-navy-200 dark:border-dm-border mb-4"><p className="text-xs text-navy-500 mb-1">Signé par</p><p className="text-sm font-medium text-navy-900 dark:text-dm-text-primary">Amadou Kaboré - Administrateur</p><p className="text-xs text-navy-500">CNIB: B9876543 | Qualité: Gérant</p></div><button className="btn-primary flex items-center gap-2 mx-auto"><PenTool className="w-4 h-4" /> Signer le document</button></div><div className="flex gap-3"><button onClick={() => setWizardStep(2)} className="btn-secondary flex-1">Précédent</button><button onClick={() => setWizardStep(4)} className="btn-primary flex-1">Continuer</button></div></motion.div>}
            {wizardStep === 4 && <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4"><h4 className="font-semibold text-navy-800 dark:text-dm-text-primary">Étape 4: Soumission finale</h4><div className="p-4 rounded-xl bg-navy-50 dark:bg-dm-bg-tertiary space-y-3"><div className="flex justify-between text-sm"><span className="text-navy-500">Entreprise</span><span className="font-medium text-navy-900 dark:text-dm-text-primary">Faso Moto SARL</span></div><div className="flex justify-between text-sm"><span className="text-navy-500">Trimestre</span><span className="font-medium text-navy-900 dark:text-dm-text-primary">T2 2026 (Avr-Juin)</span></div><div className="flex justify-between text-sm"><span className="text-navy-500">Fichiers</span><span className="font-medium text-navy-900 dark:text-dm-text-primary">XML + PDF</span></div><div className="flex justify-between text-sm"><span className="text-navy-500">Signataire</span><span className="font-medium text-navy-900 dark:text-dm-text-primary">Amadou Kaboré</span></div></div>{submitting ? <div className="text-center py-4"><div className="w-8 h-8 border-2 border-terracotta-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" /><p className="text-sm text-navy-600 dark:text-dm-text-secondary">Soumission en cours...</p></div> : submitted ? <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 rounded-xl bg-success-50 border border-success-500/20 text-center"><CheckCircle className="w-10 h-10 mx-auto text-success-500 mb-2" /><p className="text-sm font-bold text-success-500">Soumission réussie!</p><p className="text-xs text-navy-500 mt-1">Numéro de suivi: RPT-2026-T2-004892</p></motion.div> : <div className="flex gap-3"><button onClick={() => setWizardStep(3)} className="btn-secondary flex-1">Précédent</button><button onClick={handleSubmit} className="btn-primary flex-1 flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Soumettre au Ministère</button></div>}</motion.div>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-navy-200 dark:border-dm-border">
        {([['checklist', 'Checklist', CheckCircle], ['xml', 'Aperçu XML', FileText], ['pdf', 'Aperçu PDF', Eye]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'border-terracotta-500 text-terracotta-500' : 'border-transparent text-navy-500 hover:text-navy-700'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'checklist' && (
          <motion.div key="checklist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card-base p-6">
            <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Checklist de rapportage trimestriel</h3>
            <div className="space-y-3">
              {checklistItems.map(item => (
                <div key={item.id} className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${item.completed ? 'bg-success-50 dark:bg-success-500/5 border border-success-500/10' : 'bg-navy-50 dark:bg-dm-bg-tertiary border border-navy-200 dark:border-dm-border'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.completed ? 'bg-success-500' : 'bg-navy-300 dark:bg-dm-border'}`}>{item.completed && <CheckCircle className="w-4 h-4 text-white" />}</div>
                  <div className="flex-1"><p className={`text-sm font-medium ${item.completed ? 'text-success-700 dark:text-success-400' : 'text-navy-800 dark:text-dm-text-primary'}`}>{item.label}</p></div>
                  {item.required && <span className="text-[10px] bg-danger-100 text-danger-500 px-2 py-1 rounded-full font-semibold">REQUIS</span>}
                  <span className={`text-xs font-medium ${item.completed ? 'text-success-500' : 'text-navy-400'}`}>{item.completed ? 'Complété' : 'En attente'}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {activeTab === 'xml' && (
          <motion.div key="xml" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card-base p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-base font-dm-sans font-bold">Aperçu XML</h3><button className="btn-ghost text-sm flex items-center gap-2"><Download className="w-4 h-4" /> Télécharger XML</button></div>
            <pre className="bg-navy-900 rounded-xl p-6 overflow-x-auto text-sm"><code className="text-navy-300 font-mono">{xmlPreview}</code></pre>
          </motion.div>
        )}
        {activeTab === 'pdf' && (
          <motion.div key="pdf" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card-base p-8">
            <div className="flex items-center justify-between mb-6"><h3 className="text-base font-dm-sans font-bold">Aperçu PDF - Rapport T2 2026</h3><div className="flex gap-2"><button className="btn-ghost text-sm flex items-center gap-2"><Eye className="w-4 h-4" /> Aperçu</button><button className="btn-primary text-sm flex items-center gap-2"><Download className="w-4 h-4" /> Télécharger</button></div></div>
            <div className="border border-navy-200 dark:border-dm-border rounded-xl p-8 bg-white dark:bg-dm-bg-tertiary">
              <div className="flex items-start justify-between mb-8">
                <div><h4 className="text-xl font-dm-sans font-bold text-navy-900">RAPPORT TRIMESTRIEL T2 2026</h4><p className="text-sm text-navy-500 mt-1">Arrêté N°2026-0003/MECV du 15 avril 2026</p></div>
                <div className="text-right"><p className="text-sm font-bold text-navy-900">Faso Moto SARL</p><p className="text-xs text-navy-500">RCCM: BF-OUA-2019-A-1234</p><p className="text-xs text-navy-500">IFU: 00012345A</p></div>
              </div>
              <table className="w-full mb-6"><thead><tr className="border-b-2 border-navy-800"><th className="text-left py-2 text-xs font-bold uppercase">Rubrique</th><th className="text-right py-2 text-xs font-bold uppercase">Quantité</th><th className="text-right py-2 text-xs font-bold uppercase">Valeur (FCFA)</th></tr></thead>
                <tbody><tr className="border-b border-navy-200"><td className="py-3 text-sm">Stock de début</td><td className="py-3 text-right text-sm font-mono">142</td><td className="py-3 text-right text-sm font-mono">111 470 000</td></tr>
                  <tr className="border-b border-navy-200"><td className="py-3 text-sm">Entrées (achats)</td><td className="py-3 text-right text-sm font-mono">38</td><td className="py-3 text-right text-sm font-mono">29 860 000</td></tr>
                  <tr className="border-b border-navy-200"><td className="py-3 text-sm">Sorties (ventes)</td><td className="py-3 text-right text-sm font-mono">24</td><td className="py-3 text-right text-sm font-mono">20 450 000</td></tr>
                  <tr className="border-b-2 border-navy-800"><td className="py-3 text-sm font-bold">Stock de clôture</td><td className="py-3 text-right text-sm font-mono font-bold">156</td><td className="py-3 text-right text-sm font-mono font-bold">120 880 000</td></tr>
                </tbody>
              </table>
              <div className="p-3 rounded-lg bg-success-50 border border-success-500/20"><p className="text-xs text-success-500 font-medium">Document conforme aux exigences du Décret N°2026-0053/MECV</p></div>
              <div className="mt-8 pt-4 border-t border-navy-200 flex justify-between"><p className="text-xs text-navy-500">Document généré le 10/07/2026</p><p className="text-xs text-navy-500">Page 1/5</p></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
