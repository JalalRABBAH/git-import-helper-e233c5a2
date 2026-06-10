import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Search, ChevronDown, ChevronUp, BookOpen,
  Play, Phone, Mail, FileText, ExternalLink, MessageCircle
} from 'lucide-react';

const faqData = [
  { question: 'Comment enregistrer un nouveau véhicule dans le système ?', answer: 'Accédez au module "Stocks et Inventaire", cliquez sur "Ajouter" ou utilisez le scanner QR pour saisir automatiquement le VIN. Remplissez les informations du véhicule (marque, modèle, année, cylindrée) et validez. Le système vérifie automatiquement si le modèle figure sur la liste des modèles interdits.' },
  { question: 'Quelle est la date limite pour le rapportage trimestriel ?', answer: 'Le rapportage trimestriel doit être soumis au Ministère au plus tard le 15 du mois suivant la fin du trimestre. Pour T2 2026 (avril-juin), la date limite est le 15 juillet 2026. Un compte à rebours est affiché sur le tableau de bord.' },
  { question: 'Comment fonctionne la vérification KYC des clients ?', answer: 'Lors d\'une vente, le système vérifie la validité de la CNIB du client et croise ses informations avec la liste noire CNTI. Les clients sont classés selon trois niveaux: Vérifié (vert), Incomplet (orange), ou Non vérifié (rouge). Une CNIB valide et un justificatif de domicile sont requis pour le statut "Vérifié".' },
  { question: 'Que faire si un modèle est signalé comme interdit ?', answer: 'Si un véhicule figure sur la liste des modèles interdits publiée par le Ministère, le système génère une alerte rouge automatique. Vous devez immédiatement isoler le véhicule, contacter le fournisseur, et déclarer la situation au Ministère via le formulaire CNTI dans le module Sécurité et Alertes.' },
  { question: 'Comment générer une facture conforme OHADA ?', answer: 'Dans le module "Gestion Commerciale", sélectionnez une transaction et cliquez sur "Facture". Le système génère automatiquement une facture avec TVA à 18%, les mentions légales requises, et le numéro d\'enregistrement. Vous pouvez imprimer ou exporter en PDF.' },
  { question: 'Comment ajouter un nouvel acteur économique ?', answer: 'Rendez-vous dans "Acteurs Économiques" et cliquez sur "Ajouter un acteur". L\'assistant en 3 étapes vous guidera pour saisir les informations générales, le contact, et le responsable. Le RCCM et l\'IFU sont obligatoires.' },
  { question: 'Qu\'est-ce que le score de conformité 150 points ?', answer: 'Le score de conformité évalue votre entreprise sur 150 points répartis en 6 catégories: Gouvernance (30pts), Stocks (25pts), Traçabilité (25pts), Sécurité (25pts), Rapportage (25pts), et Documentation (20pts). Un score >= 120 est requis pour être conforme au Décret 05/06/2026.' },
  { question: 'Comment signaler une transaction suspecte au CNTI ?', answer: 'Dans le module "Sécurité et Alertes", cliquez sur "Signaler CNTI". Remplissez le formulaire avec le type d\'incident, la description, et les pièces jointes. Le signalement est transmis directement au Centre National de Traitement de l\'Information.' },
  { question: 'Le mode hors-ligne fonctionne-t-il sur tous les modules ?', answer: 'Le mode hors-ligne permet d\'enregistrer des ventes, des clients et des véhicules sans connexion Internet. Les données sont stockées localement et synchronisées automatiquement dès que la connexion est rétablie. Les modules de rapportage et de signalement CNTI nécessitent une connexion.' },
  { question: 'Comment changer la langue de l\'interface ?', answer: 'Accédez à "Paramètres" > "Langue" et sélectionnez votre langue préférée. iReg Moto BF supporte le Français, le Mooré, le Dioula (Jula), et le Fula (Fulfulde). Le changement est appliqué immédiatement.' },
];

const tutorials = [
  { title: 'Premiers pas avec iReg Moto BF', duration: '5 min', icon: Play, color: 'bg-terracotta-100 text-terracotta-500' },
  { title: 'Gérer votre inventaire', duration: '8 min', icon: BookOpen, color: 'bg-info-100 text-info-500' },
  { title: 'Soumettre un rapport trimestriel', duration: '12 min', icon: FileText, color: 'bg-success-100 text-success-500' },
  { title: 'Comprendre la conformité 150 points', duration: '10 min', icon: HelpCircle, color: 'bg-warning-100 text-warning-500' },
];

export default function Help() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredFaq = faqData.filter(f => !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Aide et Support</h2>
        <p className="text-sm text-navy-500 dark:text-dm-text-secondary mt-1">Trouvez des réponses et obtenez de l&apos;aide</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-base p-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
          <input type="text" placeholder="Rechercher dans la FAQ..." value={search} onChange={e => setSearch(e.target.value)} className="input-base w-full pl-12 h-12 text-base" />
        </div>
      </motion.div>

      {/* Tutorials */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Tutoriels vidéo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tutorials.map((tut, i) => {
            const Icon = tut.icon;
            return (
              <motion.div key={tut.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }} className="card-base p-5 cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl ${tut.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-navy-900 dark:text-dm-text-primary mb-1">{tut.title}</h4>
                <p className="text-xs text-navy-500">{tut.duration}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* FAQ Accordion */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-base overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-200 dark:border-dm-border"><h3 className="text-base font-dm-sans font-bold">Questions fréquentes ({filteredFaq.length})</h3></div>
        <div className="divide-y divide-navy-100 dark:divide-dm-border">
          {filteredFaq.map((faq, i) => (
            <div key={i} className="">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-navy-50 dark:hover:bg-dm-bg-tertiary transition-colors">
                <span className="text-sm font-medium text-navy-800 dark:text-dm-text-primary pr-4">{faq.question}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-navy-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-navy-400 flex-shrink-0" />}
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-4 pb-4"><p className="text-sm text-navy-600 dark:text-dm-text-secondary leading-relaxed">{faq.answer}</p></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Contact + Regulatory Docs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card-base p-6">
          <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Contacter le support</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-navy-50 dark:bg-dm-bg-tertiary">
              <div className="w-10 h-10 rounded-lg bg-terracotta-100 flex items-center justify-center"><Phone className="w-5 h-5 text-terracotta-500" /></div>
              <div><p className="text-sm font-medium text-navy-900 dark:text-dm-text-primary">Téléphone</p><p className="text-sm text-navy-600 dark:text-dm-text-secondary">+226 25 30 00 00</p><p className="text-xs text-navy-500">Lun-Ven, 8h-17h</p></div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-navy-50 dark:bg-dm-bg-tertiary">
              <div className="w-10 h-10 rounded-lg bg-info-100 flex items-center justify-center"><Mail className="w-5 h-5 text-info-500" /></div>
              <div><p className="text-sm font-medium text-navy-900 dark:text-dm-text-primary">Email</p><p className="text-sm text-navy-600 dark:text-dm-text-secondary">support@ireg-moto.bf</p><p className="text-xs text-navy-500">Réponse sous 24h</p></div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-navy-50 dark:bg-dm-bg-tertiary">
              <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-success-500" /></div>
              <div><p className="text-sm font-medium text-navy-900 dark:text-dm-text-primary">Chat en direct</p><p className="text-sm text-navy-600 dark:text-dm-text-secondary">Disponible maintenant</p><p className="text-xs text-navy-500">Temps d&apos;attente: 2 min</p></div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-base p-6">
          <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Documents réglementaires</h3>
          <div className="space-y-3">
            {[
              { title: 'Décret N°2026-0053/MECV', desc: 'Portant création du registre national des véhicules à deux roues' },
              { title: 'Arrêté N°2026-0003/MECV', desc: 'Fixant les modalités de rapportage trimestriel' },
              { title: 'Circulaire N°2026-001/MECV', desc: 'Liste des modèles interdits à l\'importation' },
              { title: 'Loi N°005-2025/AN', desc: 'Loi sur la sécurité routière et le contrôle technique' },
            ].map(doc => (
              <div key={doc.title} className="flex items-center gap-3 p-3 rounded-xl bg-navy-50 dark:bg-dm-bg-tertiary hover:bg-navy-100 cursor-pointer group">
                <FileText className="w-5 h-5 text-navy-400 group-hover:text-terracotta-500 transition-colors" />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy-900 dark:text-dm-text-primary truncate">{doc.title}</p><p className="text-xs text-navy-500 truncate">{doc.desc}</p></div>
                <ExternalLink className="w-4 h-4 text-navy-400 group-hover:text-terracotta-500 transition-colors" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
