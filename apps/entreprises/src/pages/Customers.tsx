import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Plus, X, Phone, MapPin, FileText, Shield,
  ChevronRight, CheckCircle, UserCheck, Receipt, Calendar
} from 'lucide-react';
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, flexRender, createColumnHelper, type SortingState
} from '@tanstack/react-table';
import StatusBadge from '../components/StatusBadge';

interface Customer {
  id: string;
  prenom: string;
  nom: string;
  cnib: string;
  telephone: string;
  email: string;
  ville: string;
  adresse: string;
  dateNaissance: string;
  profession: string;
  kyc: 'success' | 'warning' | 'danger';
  nombreAchats: number;
  dernierAchat: string;
  montantTotal: string;
  vendeur: string;
  genre: string;
}

const mockCustomers: Customer[] = [
  { id: '1', prenom: 'Amadou', nom: 'Ouedraogo', cnib: 'B1234567', telephone: '+226 70 11 22 33', email: 'amadou.ouedraogo@email.bf', ville: 'Ouagadougou', adresse: 'Secteur 15, rue 12', dateNaissance: '15/03/1985', profession: 'Commerçant', kyc: 'success', nombreAchats: 3, dernierAchat: '05/06/2026', montantTotal: '2 850 000', vendeur: 'Ibrahim Bamba', genre: 'M' },
  { id: '2', prenom: 'Fatima', nom: 'Kaboré', cnib: 'B2345678', telephone: '+226 71 22 33 44', email: 'fatima.kabore@email.bf', ville: 'Bobo-Dioulasso', adresse: 'Secteur 3, avenue de la Gare', dateNaissance: '22/07/1990', profession: 'Enseignante', kyc: 'success', nombreAchats: 1, dernierAchat: '02/06/2026', montantTotal: '950 000', vendeur: 'Fatima Sanou', genre: 'F' },
  { id: '3', prenom: 'Ibrahim', nom: 'Bamba', cnib: 'B3456789', telephone: '+226 72 33 44 55', email: 'ibrahim.bamba@email.bf', ville: 'Ouagadougou', adresse: 'Secteur 25, rue des Jardins', dateNaissance: '10/11/1978', profession: 'Transporteur', kyc: 'success', nombreAchats: 5, dernierAchat: '07/06/2026', montantTotal: '4 750 000', vendeur: 'Ibrahim Bamba', genre: 'M' },
  { id: '4', prenom: 'Mariama', nom: 'Sanou', cnib: 'B4567890', telephone: '+226 73 44 55 66', email: 'mariama.sanou@email.bf', ville: 'Koudougou', adresse: 'Centre-ville, près du marché', dateNaissance: '05/01/1995', profession: 'Coiffeuse', kyc: 'warning', nombreAchats: 1, dernierAchat: '01/06/2026', montantTotal: '720 000', vendeur: 'Jean Zongo', genre: 'F' },
  { id: '5', prenom: 'Jean', nom: 'Zongo', cnib: 'B5678901', telephone: '+226 74 55 66 77', email: 'jean.zongo@email.bf', ville: 'Ouahigouya', adresse: 'Secteur 2, rue du Commerce', dateNaissance: '18/09/1982', profession: 'Agriculteur', kyc: 'success', nombreAchats: 2, dernierAchat: '04/06/2026', montantTotal: '1 680 000', vendeur: 'Ibrahim Bamba', genre: 'M' },
  { id: '6', prenom: 'Aminata', nom: 'Traoré', cnib: 'B6789012', telephone: '+226 75 66 77 88', email: 'aminata.traore@email.bf', ville: 'Banfora', adresse: 'Route de Niangoloko', dateNaissance: '30/04/1988', profession: 'Commerçante', kyc: 'success', nombreAchats: 2, dernierAchat: '06/06/2026', montantTotal: '1 900 000', vendeur: 'Fatima Sanou', genre: 'F' },
  { id: '7', prenom: 'Abdoulaye', nom: 'Compaoré', cnib: 'B7890123', telephone: '+226 76 77 88 99', email: 'abdoulaye.compaore@email.bf', ville: 'Ouagadougou', adresse: 'Secteur 10, boulevard Muammar Kadhafi', dateNaissance: '12/12/1975', profession: 'Fonctionnaire', kyc: 'success', nombreAchats: 4, dernierAchat: '03/06/2026', montantTotal: '3 800 000', vendeur: 'Ibrahim Bamba', genre: 'M' },
  { id: '8', prenom: 'Salamata', nom: 'Drabo', cnib: 'B8901234', telephone: '+226 77 88 99 00', email: 'salamata.drabo@email.bf', ville: 'Fada NGourma', adresse: 'Centre-ville', dateNaissance: '25/06/1992', profession: 'Infirmière', kyc: 'warning', nombreAchats: 1, dernierAchat: '28/05/2026', montantTotal: '850 000', vendeur: 'Mariama Ouédraogo', genre: 'F' },
  { id: '9', prenom: 'Youssouf', nom: 'Sawadogo', cnib: 'B9012345', telephone: '+226 78 99 00 11', email: 'youssouf.sawadogo@email.bf', ville: 'Dori', adresse: 'Route de Gorom-Gorom', dateNaissance: '08/02/1980', profession: 'Éleveur', kyc: 'success', nombreAchats: 3, dernierAchat: '30/05/2026', montantTotal: '2 550 000', vendeur: 'Ibrahim Bamba', genre: 'M' },
  { id: '10', prenom: 'Hassane', nom: 'Barry', cnib: 'B0123456', telephone: '+226 79 00 11 22', email: 'hassane.barry@email.bf', ville: 'Gorom-Gorom', adresse: 'Secteur 1', dateNaissance: '14/08/1987', profession: 'Mécanicien', kyc: 'success', nombreAchats: 1, dernierAchat: '25/05/2026', montantTotal: '680 000', vendeur: 'Jean Zongo', genre: 'M' },
  { id: '11', prenom: 'Pascal', nom: 'Zombre', cnib: 'B1234568', telephone: '+226 70 22 33 44', email: 'pascal.zombre@email.bf', ville: 'Ziniaré', adresse: 'Route nationale n°3', dateNaissance: '19/10/1991', profession: 'Student', kyc: 'warning', nombreAchats: 1, dernierAchat: '20/05/2026', montantTotal: '780 000', vendeur: 'Mariama Ouédraogo', genre: 'M' },
  { id: '12', prenom: 'Germain', nom: 'Belemtigri', cnib: 'B2345679', telephone: '+226 71 33 44 55', email: 'germain.belemtigri@email.bf', ville: 'Léo', adresse: 'Près du marché central', dateNaissance: '03/05/1972', profession: 'Cultivateur', kyc: 'success', nombreAchats: 2, dernierAchat: '22/05/2026', montantTotal: '1 450 000', vendeur: 'Ibrahim Bamba', genre: 'M' },
  { id: '13', prenom: 'Adama', nom: 'Koala', cnib: 'B3456790', telephone: '+226 72 44 55 66', email: 'adama.koala@email.bf', ville: 'Sapouy', adresse: 'Centre-ville', dateNaissance: '27/11/1984', profession: 'Forgeron', kyc: 'success', nombreAchats: 1, dernierAchat: '18/05/2026', montantTotal: '890 000', vendeur: 'Jean Zongo', genre: 'M' },
  { id: '14', prenom: 'Issouf', nom: 'Sana', cnib: 'B4567901', telephone: '+226 73 55 66 77', email: 'issouf.sana@email.bf', ville: 'Réo', adresse: 'Route de Koudougou', dateNaissance: '16/07/1989', profession: 'Commerçant', kyc: 'success', nombreAchats: 3, dernierAchat: '15/05/2026', montantTotal: '2 640 000', vendeur: 'Ibrahim Bamba', genre: 'M' },
  { id: '15', prenom: 'Théophile', nom: 'Yaméogo', cnib: 'B5678902', telephone: '+226 74 66 77 88', email: 'theophile.yameogo@email.bf', ville: 'Manga', adresse: 'Secteur 2, avenue principale', dateNaissance: '09/03/1979', profession: 'Instituteur', kyc: 'success', nombreAchats: 2, dernierAchat: '10/05/2026', montantTotal: '1 560 000', vendeur: 'Fatima Sanou', genre: 'M' },
  { id: '16', prenom: 'Lassina', nom: 'Kone', cnib: 'B6789013', telephone: '+226 75 77 88 99', email: 'lassina.kone@email.bf', ville: 'Tenkodogo', adresse: 'Boulevard du centre', dateNaissance: '21/01/1986', profession: 'Menuisier', kyc: 'danger', nombreAchats: 1, dernierAchat: '05/05/2026', montantTotal: '720 000', vendeur: 'Mariama Ouédraogo', genre: 'M' },
  { id: '17', prenom: 'Cécile', nom: 'Basene', cnib: 'B7890124', telephone: '+226 76 88 99 00', email: 'cecile.basene@email.bf', ville: 'Koupéla', adresse: 'Route nationale n°4', dateNaissance: '13/04/1993', profession: 'Coiffeuse', kyc: 'success', nombreAchats: 1, dernierAchat: '01/05/2026', montantTotal: '950 000', vendeur: 'Fatima Sanou', genre: 'F' },
  { id: '18', prenom: 'Bénédicte', nom: 'Soré', cnib: 'B8901235', telephone: '+226 77 99 00 11', email: 'benedicte.sore@email.bf', ville: 'Gaoua', adresse: 'Centre-ville', dateNaissance: '07/09/1981', profession: 'Commerçante', kyc: 'success', nombreAchats: 2, dernierAchat: '28/04/2026', montantTotal: '1 800 000', vendeur: 'Ibrahim Bamba', genre: 'F' },
  { id: '19', prenom: 'Siaka', nom: 'Badini', cnib: 'B9012346', telephone: '+226 78 00 11 22', email: 'siaka.badini@email.bf', ville: 'Orodara', adresse: 'Secteur 3', dateNaissance: '24/06/1977', profession: 'Tailleur', kyc: 'warning', nombreAchats: 1, dernierAchat: '20/04/2026', montantTotal: '650 000', vendeur: 'Jean Zongo', genre: 'M' },
  { id: '20', prenom: 'Alimata', nom: 'Wennéga', cnib: 'B0123457', telephone: '+226 79 11 22 33', email: 'alimata.wennega@email.bf', ville: 'Nouna', adresse: 'Route de Dédougou', dateNaissance: '02/12/1990', profession: 'Agricultrice', kyc: 'success', nombreAchats: 1, dernierAchat: '15/04/2026', montantTotal: '820 000', vendeur: 'Fatima Sanou', genre: 'F' },
  { id: '21', prenom: 'Abdel Kader', nom: 'Dicko', cnib: 'B1234569', telephone: '+226 70 33 44 55', email: 'abdel.dicko@email.bf', ville: 'Djibo', adresse: 'Centre-ville', dateNaissance: '11/05/1983', profession: 'Éleveur', kyc: 'success', nombreAchats: 2, dernierAchat: '10/04/2026', montantTotal: '1 540 000', vendeur: 'Ibrahim Bamba', genre: 'M' },
  { id: '22', prenom: 'Esther', nom: 'Ilboudo', cnib: 'B2345680', telephone: '+226 71 44 55 66', email: 'esther.ilboudo@email.bf', ville: 'Bobo-Dioulasso', adresse: 'Secteur 5, rue 8', dateNaissance: '28/02/1996', profession: 'Étudiante', kyc: 'warning', nombreAchats: 1, dernierAchat: '05/04/2026', montantTotal: '720 000', vendeur: 'Mariama Ouédraogo', genre: 'F' },
];

const columnHelper = createColumnHelper<Customer>();
const kycLabels: Record<string, string> = { success: 'Vérifié', warning: 'Incomplet', danger: 'Non vérifié' };

export default function Customers() {
  const [search, setSearch] = useState('');
  const [villeFilter, setVilleFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showSaleWizard, setShowSaleWizard] = useState(false);
  const [saleStep, setSaleStep] = useState(1);

  const columns = useMemo(() => [
    columnHelper.accessor(row => `${row.prenom} ${row.nom}`, { id: 'nom', header: 'Nom', cell: info => <span className="font-medium text-navy-900 dark:text-dm-text-primary flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-navy-100 dark:bg-dm-bg-tertiary flex items-center justify-center text-xs font-bold text-navy-700 dark:text-dm-text-primary">{info.row.original.prenom[0]}{info.row.original.nom[0]}</div>{info.getValue()}</span> }),
    columnHelper.accessor('cnib', { header: 'CNIB', cell: info => <span className="font-mono text-xs">{info.getValue()}</span> }),
    columnHelper.accessor('telephone', { header: 'Téléphone' }),
    columnHelper.accessor('ville', { header: 'Ville' }),
    columnHelper.accessor('profession', { header: 'Profession' }),
    columnHelper.accessor('kyc', { header: 'KYC', cell: info => <StatusBadge status={info.getValue() as 'success' | 'warning' | 'danger'} label={kycLabels[info.getValue() as string]} /> }),
    columnHelper.accessor('nombreAchats', { header: 'Achats' }),
    columnHelper.display({ id: 'actions', header: '', cell: ({ row }) => <button onClick={() => setSelectedCustomer(row.original)} className="text-terracotta-500 hover:text-terracotta-600 text-sm font-medium">Détails</button> }),
  ], []);

  const filteredData = useMemo(() => {
    return mockCustomers.filter(c => {
      const fullName = `${c.prenom} ${c.nom}`.toLowerCase();
      const matchSearch = !search || fullName.includes(search.toLowerCase()) || c.cnib.toLowerCase().includes(search.toLowerCase()) || c.telephone.includes(search);
      const matchVille = !villeFilter || c.ville === villeFilter;
      const matchKyc = !kycFilter || c.kyc === kycFilter;
      return matchSearch && matchVille && matchKyc;
    });
  }, [search, villeFilter, kycFilter]);

  const table = useReactTable({
    data: filteredData, columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const villes = [...new Set(mockCustomers.map(c => c.ville))];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Clientèle et Traçabilité</h2>
          <p className="text-sm text-navy-500 dark:text-dm-text-secondary mt-1">{mockCustomers.length} clients enregistrés</p>
        </div>
        <button onClick={() => setShowSaleWizard(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Nouvelle vente</button>
      </motion.div>

      {/* KYC Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-base p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center"><UserCheck className="w-5 h-5 text-success-500" /></div><div><p className="text-2xl font-dm-sans font-extrabold text-navy-900 dark:text-dm-text-primary">{mockCustomers.filter(c => c.kyc === 'success').length}</p><p className="text-xs text-navy-500">KYC Vérifiés</p></div></div>
        <div className="card-base p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center"><Shield className="w-5 h-5 text-warning-500" /></div><div><p className="text-2xl font-dm-sans font-extrabold text-navy-900 dark:text-dm-text-primary">{mockCustomers.filter(c => c.kyc === 'warning').length}</p><p className="text-xs text-navy-500">KYC Incomplets</p></div></div>
        <div className="card-base p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center"><Users className="w-5 h-5 text-danger-500" /></div><div><p className="text-2xl font-dm-sans font-extrabold text-navy-900 dark:text-dm-text-primary">{mockCustomers.filter(c => c.kyc === 'danger').length}</p><p className="text-xs text-navy-500">KYC Non vérifiés</p></div></div>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-navy-50 dark:bg-dm-bg-secondary rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" /><input type="text" placeholder="Rechercher par nom, CNIB, téléphone..." value={search} onChange={e => setSearch(e.target.value)} className="input-base w-full pl-10" /></div>
        <select value={villeFilter} onChange={e => setVilleFilter(e.target.value)} className="input-base min-w-[140px]"><option value="">Toutes les villes</option>{villes.map(v => <option key={v} value={v}>{v}</option>)}</select>
        <select value={kycFilter} onChange={e => setKycFilter(e.target.value)} className="input-base min-w-[140px]"><option value="">Tous KYC</option><option value="success">Vérifié</option><option value="warning">Incomplet</option><option value="danger">Non vérifié</option></select>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>{table.getHeaderGroups().map(hg => (<tr key={hg.id} className="table-header">{hg.headers.map(h => (<th key={h.id} className="px-4 py-3 text-left cursor-pointer select-none" onClick={h.column.getToggleSortingHandler()}><div className="flex items-center gap-1">{flexRender(h.column.columnDef.header, h.getContext())}{{'asc': '↑', 'desc': '↓'}[h.column.getIsSorted() as string] ?? null}</div></th>))}</tr>))}</thead>
            <tbody>{table.getRowModel().rows.map(row => (<tr key={row.id} className="table-row">{row.getVisibleCells().map(cell => (<td key={cell.id} className="px-4 py-3.5 text-sm text-navy-700 dark:text-dm-text-secondary">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>))}</tr>))}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-navy-200 dark:border-dm-border">
          <span className="text-xs text-navy-500 dark:text-dm-text-secondary">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} - {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)} sur {filteredData.length}</span>
          <div className="flex gap-2"><button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="btn-secondary text-xs h-8 px-3 disabled:opacity-50">Précédent</button><button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="btn-secondary text-xs h-8 px-3 disabled:opacity-50">Suivant</button></div>
        </div>
      </motion.div>

      {/* Customer Detail Drawer */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setSelectedCustomer(null)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-lg bg-white dark:bg-dm-bg-secondary h-full overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-navy-200 dark:border-dm-border flex items-center justify-between">
                <h3 className="text-lg font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Dossier client</h3>
                <button onClick={() => setSelectedCustomer(null)} className="w-8 h-8 rounded-lg hover:bg-navy-100 dark:hover:bg-dm-bg-tertiary flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-warm flex items-center justify-center text-xl font-bold text-white">{selectedCustomer.prenom[0]}{selectedCustomer.nom[0]}</div>
                  <div><h4 className="text-base font-bold text-navy-900 dark:text-dm-text-primary">{selectedCustomer.prenom} {selectedCustomer.nom}</h4><StatusBadge status={selectedCustomer.kyc} label={kycLabels[selectedCustomer.kyc]} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><p className="text-xs text-navy-500">CNIB</p><p className="text-sm font-mono text-navy-900 dark:text-dm-text-primary">{selectedCustomer.cnib}</p></div>
                  <div className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><p classNombre="text-xs text-navy-500">Téléphone</p><p className="text-sm text-navy-900 dark:text-dm-text-primary">{selectedCustomer.telephone}</p></div>
                  <div className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><p className="text-xs text-navy-500">Né(e) le</p><p className="text-sm text-navy-900 dark:text-dm-text-primary">{selectedCustomer.dateNaissance}</p></div>
                  <div className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><p className="text-xs text-navy-500">Profession</p><p className="text-sm text-navy-900 dark:text-dm-text-primary">{selectedCustomer.profession}</p></div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-navy-400" /><span className="text-navy-800 dark:text-dm-text-primary">{selectedCustomer.telephone}</span></div>
                  <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-navy-400" /><span className="text-navy-800 dark:text-dm-text-primary">{selectedCustomer.adresse}, {selectedCustomer.ville}</span></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><Receipt className="w-4 h-4 mx-auto text-navy-400 mb-1" /><p className="text-xs text-navy-500">Achats</p><p className="text-lg font-bold text-navy-900 dark:text-dm-text-primary">{selectedCustomer.nombreAchats}</p></div>
                  <div className="text-center p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><Calendar className="w-4 h-4 mx-auto text-navy-400 mb-1" /><p className="text-xs text-navy-500">Dernier</p><p className="text-sm font-bold text-navy-900 dark:text-dm-text-primary">{selectedCustomer.dernierAchat}</p></div>
                  <div className="text-center p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><FileText className="w-4 h-4 mx-auto text-navy-400 mb-1" /><p className="text-xs text-navy-500">Total (FCFA)</p><p className="text-sm font-bold text-navy-900 dark:text-dm-text-primary">{selectedCustomer.montantTotal}</p></div>
                </div>
                <div className="flex gap-3"><button className="btn-primary flex-1 flex items-center justify-center gap-2"><Receipt className="w-4 h-4" /> Nouvelle vente</button><button className="btn-secondary flex-1 flex items-center justify-center gap-2"><FileText className="w-4 h-4" /> Historique</button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sale Wizard */}
      <AnimatePresence>
        {showSaleWizard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSaleWizard(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-dm-bg-secondary rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-navy-200 dark:border-dm-border flex items-center justify-between"><h3 className="text-lg font-dm-sans font-bold">Assistant de vente</h3><button onClick={() => setShowSaleWizard(false)} className="w-8 h-8 rounded-lg hover:bg-navy-100 flex items-center justify-center"><X className="w-4 h-4" /></button></div>
              <div className="p-6">
                <div className="flex items-center justify-center mb-8">
                  {[1, 2, 3, 4].map(step => (<div key={step} className="flex items-center"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${saleStep >= step ? 'bg-terracotta-500 text-white' : 'bg-navy-200 dark:bg-dm-border text-navy-500'}`}>{step}</div>{step < 4 && <div className={`w-12 h-0.5 ${saleStep > step ? 'bg-terracotta-500' : 'bg-navy-200 dark:bg-dm-border'}`} />}</div>))}
                </div>
                {saleStep === 1 && <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4"><h4 className="font-semibold">Sélection du client</h4><input className="input-base w-full" placeholder="Rechercher par nom, CNIB, téléphone..." /><div className="space-y-2 max-h-48 overflow-y-auto">{mockCustomers.slice(0, 5).map(c => (<div key={c.id} className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary hover:bg-navy-100 cursor-pointer flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-navy-200 flex items-center justify-center text-xs font-bold">{c.prenom[0]}{c.nom[0]}</div><div><p className="text-sm font-medium">{c.prenom} {c.nom}</p><p className="text-xs text-navy-500">{c.cnib} | {c.telephone}</p></div></div>))}</div></motion.div>}
                {saleStep === 2 && <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4"><h4 className="font-semibold">Sélection du véhicule</h4><input className="input-base w-full font-mono" placeholder="VIN ou QR Code..." /><div className="grid grid-cols-2 gap-3">{['TVS HLX 125 - Rouge - 785K', 'Bajaj Boxer 150 - Bleu - 890K', 'Yamaha YBR 125 - Bleu - 1.4M', 'Suzuki GD 110 - Noir - 1.05M'].map((v, i) => (<div key={i} className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary hover:bg-navy-100 cursor-pointer border-2 border-transparent hover:border-terracotta-500"><p className="text-sm font-medium">{v}</p></div>))}</div></motion.div>}
                {saleStep === 3 && <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4"><h4 className="font-semibold">Prix et conditions</h4><div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-medium text-navy-700 mb-1 block">Prix de vente (FCFA)</label><input className="input-base w-full" placeholder="950 000" /></div><div><label className="text-xs font-medium text-navy-700 mb-1 block">Mode de paiement</label><select className="input-base w-full"><option>Comptant</option><option>Versement échelonné</option><option>Banque</option></select></div><div><label className="text-xs font-medium text-navy-700 mb-1 block">Acompte (FCFA)</label><input className="input-base w-full" placeholder="0" /></div><div><label className="text-xs font-medium text-navy-700 mb-1 block">Date de livraison</label><input type="date" className="input-base w-full" /></div></div></motion.div>}
                {saleStep === 4 && <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4"><h4 className="font-semibold">Récapitulatif et validation</h4><div className="p-4 rounded-xl bg-navy-50 dark:bg-dm-bg-tertiary space-y-2"><div className="flex justify-between text-sm"><span className="text-navy-500">Client</span><span className="font-medium">Amadou Ouedraogo (B1234567)</span></div><div className="flex justify-between text-sm"><span className="text-navy-500">Véhicule</span><span className="font-medium">TVS HLX 125 - Rouge</span></div><div className="flex justify-between text-sm"><span className="text-navy-500">VIN</span><span className="font-mono">MLBXB10EXKW000001</span></div><div className="flex justify-between text-sm"><span className="text-navy-500">Prix</span><span className="font-bold text-terracotta-500">950 000 FCFA</span></div></div><div className="p-3 rounded-lg bg-success-50 border border-success-500/20"><p className="text-sm text-success-500 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Tous les documents sont valides</p></div></motion.div>}
                <div className="flex justify-between mt-8">{saleStep > 1 ? <button onClick={() => setSaleStep(saleStep - 1)} className="btn-secondary">Précédent</button> : <div />}{saleStep < 4 ? <button onClick={() => setSaleStep(saleStep + 1)} className="btn-primary">Suivant</button> : <button onClick={() => setShowSaleWizard(false)} className="btn-primary flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Valider la vente</button>}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
