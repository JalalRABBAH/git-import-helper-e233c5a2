// @ts-nocheck
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Users, FileText, Bell, Globe, Settings as SettingsIcon,
  Save, ShieldCheck, Upload, X, CheckCircle, Smartphone, Moon,
  ToggleLeft, ToggleRight
} from 'lucide-react';

const tabs = [
  { id: 'entreprise', label: 'Entreprise', icon: Building2 },
  { id: 'utilisateurs', label: 'Utilisateurs', icon: Users },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'langue', label: 'Langue', icon: Globe },
  { id: 'avance', label: 'Avancé', icon: SettingsIcon },
];

const usersData = [
  { id: 1, nom: 'Amadou Kaboré', email: 'amadou.kabore@fasomoto.bf', role: 'Administrateur', statut: 'active', derniereConnexion: '09/06/2026 08:32' },
  { id: 2, nom: 'Fatima Sanou', email: 'fatima.sanou@fasomoto.bf', role: 'Vendeuse', statut: 'active', derniereConnexion: '09/06/2026 09:15' },
  { id: 3, nom: 'Ibrahim Bamba', email: 'ibrahim.bamba@fasomoto.bf', role: 'Vendeur', statut: 'active', derniereConnexion: '08/06/2026 17:45' },
  { id: 4, nom: 'Jean Zongo', email: 'jean.zongo@fasomoto.bf', role: 'Comptable', statut: 'active', derniereConnexion: '09/06/2026 07:50' },
  { id: 5, nom: 'Mariama Ouédraogo', email: 'mariama.ouedraogo@fasomoto.bf', role: 'Opératrice KYC', statut: 'inactive', derniereConnexion: '05/06/2026 14:20' },
];

const languages = [
  { code: 'fr', name: 'Français', flag: '🇧🇫', active: true },
  { code: 'mos', name: 'Mooré', flag: '🇧🇫', active: false },
  { code: 'dyu', name: 'Dioula (Jula)', flag: '🇧🇫', active: false },
  { code: 'ff', name: 'Fula (Fulfulde)', flag: '🇧🇫', active: false },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('entreprise');
  const [darkMode, setDarkMode] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [selectedLang, setSelectedLang] = useState('fr');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Paramètres</h2>
        <p className="text-sm text-navy-500 dark:text-dm-text-secondary mt-1">Configuration de l&apos;application et du compte</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="card-base p-2 space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-navy-100 dark:bg-dm-bg-tertiary text-navy-900 dark:text-dm-text-primary' : 'text-navy-500 dark:text-dm-text-secondary hover:bg-navy-50 dark:hover:bg-dm-bg-tertiary'}`}>
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {/* Entreprise */}
          {activeTab === 'entreprise' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6 space-y-6">
              <div className="flex items-center gap-4 mb-4"><div className="w-16 h-16 rounded-xl bg-gradient-warm flex items-center justify-center"><Building2 className="w-8 h-8 text-white" /></div><div><h3 className="text-lg font-dm-sans font-bold">Faso Moto SARL</h3><p className="text-sm text-navy-500">BF-OUA-2019-A-1234 | IFU: 00012345A</p></div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">Raison sociale</label><input className="input-base w-full" defaultValue="Faso Moto SARL" /></div>
                <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">RCCM</label><input className="input-base w-full font-mono" defaultValue="BF-OUA-2019-A-1234" /></div>
                <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">IFU</label><input className="input-base w-full font-mono" defaultValue="00012345A" /></div>
                <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">Téléphone</label><input className="input-base w-full" defaultValue="+226 70 12 34 56" /></div>
                <div className="col-span-2"><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">Adresse</label><input className="input-base w-full" defaultValue="Avenue Kwamé Nkrumah, Secteur 15, Ouagadougou" /></div>
                <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">Email</label><input className="input-base w-full" defaultValue="contact@fasomoto.bf" /></div>
                <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">Site web</label><input className="input-base w-full" defaultValue="www.fasomoto.bf" /></div>
              </div>
              <div className="flex justify-end"><button className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Enregistrer</button></div>
            </motion.div>
          )}

          {/* Utilisateurs */}
          {activeTab === 'utilisateurs' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base overflow-hidden">
              <div className="px-6 py-4 border-b border-navy-200 dark:border-dm-border flex items-center justify-between"><h3 className="text-base font-dm-sans font-bold">Utilisateurs ({usersData.length})</h3><button className="btn-primary text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Ajouter</button></div>
              <div className="divide-y divide-navy-100 dark:divide-dm-border">
                {usersData.map(u => (
                  <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-navy-50 dark:hover:bg-dm-bg-tertiary transition-colors">
                    <div className="w-10 h-10 rounded-full bg-navy-200 dark:bg-dm-bg-tertiary flex items-center justify-center text-sm font-bold text-navy-700 dark:text-dm-text-primary">{u.nom.split(' ').map(n => n[0]).join('')}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy-900 dark:text-dm-text-primary truncate">{u.nom}</p><p className="text-xs text-navy-500 truncate">{u.email}</p></div>
                    <span className="text-xs px-2 py-1 rounded-full bg-navy-100 dark:bg-dm-bg-tertiary text-navy-600 dark:text-dm-text-secondary font-medium">{u.role}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.statut === 'active' ? 'bg-success-100 text-success-500' : 'bg-danger-100 text-danger-500'}`}>{u.statut}</span>
                    <span className="text-xs text-navy-400 hidden lg:block">{u.derniereConnexion}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Documents */}
          {activeTab === 'documents' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6 space-y-4">
              <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Documents légaux</h3>
              {['RCCM', 'Attestation fiscale', 'Attestation CNSS', 'Licence d\'exploitation', 'Assurance responsabilité civile'].map((doc, i) => (
                <div key={doc} className="flex items-center gap-4 p-4 rounded-xl bg-navy-50 dark:bg-dm-bg-tertiary">
                  <FileText className="w-6 h-6 text-navy-400" />
                  <div className="flex-1"><p className="text-sm font-medium text-navy-900 dark:text-dm-text-primary">{doc}</p><p className="text-xs text-navy-500">{['PDF', 'PDF', 'JPG', 'PDF', 'PDF'][i]} • {['156 KB', '89 KB', '245 KB', '312 KB', '178 KB'][i]}</p></div>
                  <span className="text-xs px-2 py-1 rounded-full bg-success-100 text-success-500 font-medium">À jour</span>
                  <button className="text-terracotta-500 hover:text-terracotta-600"><Upload className="w-4 h-4" /></button>
                </div>
              ))}
              <div className="border-2 border-dashed border-navy-300 dark:border-dm-border rounded-xl p-6 text-center">
                <Upload className="w-8 h-8 mx-auto text-navy-400 mb-2" />
                <p className="text-sm text-navy-600 dark:text-dm-text-secondary">Glissez un document ici ou cliquez pour parcourir</p>
                <p className="text-xs text-navy-500 mt-1">PDF, JPG, PNG (max 5 MB)</p>
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6 space-y-4">
              <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Préférences de notification</h3>
              {[
                { label: 'Notifications push', desc: 'Alertes en temps réel sur le navigateur', icon: Bell, state: pushNotif, setState: setPushNotif },
                { label: 'Notifications email', desc: 'Résumés et alertes par email', icon: Bell, state: emailNotif, setState: setEmailNotif },
                { label: 'Alertes de conformité', desc: 'Rappels de rapportage et échéances', icon: ShieldCheck, state: true, setState: () => {} },
                { label: 'Alertes de sécurité', desc: 'Transactions suspectes et blacklist', icon: ShieldCheck, state: true, setState: () => {} },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-navy-50 dark:bg-dm-bg-tertiary">
                  <div className="flex items-center gap-3"><item.icon className="w-5 h-5 text-navy-400" /><div><p className="text-sm font-medium text-navy-900 dark:text-dm-text-primary">{item.label}</p><p className="text-xs text-navy-500">{item.desc}</p></div></div>
                  <button onClick={() => item.setState(!item.state)} className={item.state ? 'text-terracotta-500' : 'text-navy-400'}>{item.state ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}</button>
                </div>
              ))}
            </motion.div>
          )}

          {/* Langue */}
          {activeTab === 'langue' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6">
              <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Langue de l&apos;interface</h3>
              <div className="space-y-2">
                {languages.map(lang => (
                  <button key={lang.code} onClick={() => setSelectedLang(lang.code)} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${selectedLang === lang.code ? 'bg-terracotta-50 dark:bg-terracotta-500/10 border border-terracotta-500' : 'bg-navy-50 dark:bg-dm-bg-tertiary border border-transparent hover:bg-navy-100'}`}>
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="flex-1 text-left"><p className="text-sm font-medium text-navy-900 dark:text-dm-text-primary">{lang.name}</p><p className="text-xs text-navy-500">{lang.code === 'fr' ? 'Langue par défaut' : 'Disponible'}</p></div>
                    {selectedLang === lang.code && <CheckCircle className="w-5 h-5 text-terracotta-500" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Avancé */}
          {activeTab === 'avance' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="card-base p-6">
                <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Mode hors-ligne</h3>
                <div className="flex items-center justify-between p-4 rounded-xl bg-navy-50 dark:bg-dm-bg-tertiary">
                  <div className="flex items-center gap-3"><Smartphone className="w-5 h-5 text-navy-400" /><div><p className="text-sm font-medium text-navy-900 dark:text-dm-text-primary">Activer le mode hors-ligne</p><p className="text-xs text-navy-500">Synchronisation automatique lors de la reconnexion</p></div></div>
                  <button onClick={() => setOfflineMode(!offlineMode)} className={offlineMode ? 'text-terracotta-500' : 'text-navy-400'}>{offlineMode ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}</button>
                </div>
              </div>
              <div className="card-base p-6">
                <h3 className="text-base font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary mb-4">Apparence</h3>
                <div className="flex items-center justify-between p-4 rounded-xl bg-navy-50 dark:bg-dm-bg-tertiary">
                  <div className="flex items-center gap-3"><Moon className="w-5 h-5 text-navy-400" /><div><p className="text-sm font-medium text-navy-900 dark:text-dm-text-primary">Mode sombre</p><p className="text-xs text-navy-500">Basculer entre le thème clair et sombre</p></div></div>
                  <button onClick={() => setDarkMode(!darkMode)} className={darkMode ? 'text-terracotta-500' : 'text-navy-400'}>{darkMode ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}</button>
                </div>
              </div>
              <div className="card-base p-6">
                <h3 className="text-base font-dm-sans font-bold text-danger-500 mb-4">Zone dangereuse</h3>
                <div className="flex items-center justify-between p-4 rounded-xl bg-danger-50 dark:bg-danger-500/5 border border-danger-500/20">
                  <div><p className="text-sm font-medium text-danger-500">Réinitialiser les données</p><p className="text-xs text-navy-500">Cette action est irréversible</p></div>
                  <button className="btn-secondary text-danger-500 border-danger-500 hover:bg-danger-50 text-sm">Réinitialiser</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
