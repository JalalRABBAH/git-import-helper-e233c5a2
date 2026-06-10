import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Search, Plus, X, ChevronRight, Phone, MapPin,
  FileText, ShieldCheck, Mail, Globe, Calendar
} from 'lucide-react';
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, flexRender,
  createColumnHelper, type SortingState
} from '@tanstack/react-table';
import StatusBadge from '../components/StatusBadge';

interface Actor {
  id: string;
  nom: string;
  type: string;
  rccm: string;
  ifu: string;
  telephone: string;
  email: string;
  ville: string;
  adresse: string;
  dateCreation: string;
  statut: 'success' | 'warning' | 'danger';
  responsable: string;
  cnib: string;
  siteWeb: string;
  nombreEmployes: number;
  chiffreAffaires: string;
  categorie: string;
}

const mockActors: Actor[] = [
  { id: '1', nom: 'Faso Moto SARL', type: 'Importateur', rccm: 'BF-OUA-2019-A-1234', ifu: '00012345A', telephone: '+226 70 12 34 56', email: 'contact@fasomoto.bf', ville: 'Ouagadougou', adresse: 'Avenue Kwamé Nkrumah, Secteur 15', dateCreation: '12/03/2019', statut: 'success', responsable: 'Amadou Ouedraogo', cnib: 'B1234567', siteWeb: 'www.fasomoto.bf', nombreEmployes: 45, chiffreAffaires: '850 000 000', categorie: 'A - Grand importateur' },
  { id: '2', nom: 'Burkina Wheels SA', type: 'Distributeur', rccm: 'BF-OUA-2020-B-5678', ifu: '00023456B', telephone: '+226 71 23 45 67', email: 'info@burkinawheels.bf', ville: 'Ouagadougou', adresse: 'Boulevard Charles de Gaulle', dateCreation: '05/07/2020', statut: 'success', responsable: 'Fatima Kaboré', cnib: 'B2345678', siteWeb: 'www.burkinawheels.bf', nombreEmployes: 28, chiffreAffaires: '420 000 000', categorie: 'B - Distributeur national' },
  { id: '3', nom: 'Sahel Motos Distribution', type: 'Distributeur', rccm: 'BF-BOB-2018-C-9012', ifu: '00034567C', telephone: '+226 72 34 56 78', email: 'sahelmotos@yahoo.fr', ville: 'Bobo-Dioulasso', adresse: 'Rue de la Gare, Secteur 3', dateCreation: '18/11/2018', statut: 'success', responsable: 'Ibrahim Bamba', cnib: 'B3456789', siteWeb: '', nombreEmployes: 22, chiffreAffaires: '310 000 000', categorie: 'B - Distributeur régional' },
  { id: '4', nom: 'Bobo Moto Plus', type: 'Assembler', rccm: 'BF-BOB-2021-D-3456', ifu: '00045678D', telephone: '+226 73 45 67 89', email: 'bobomotoplus@gmail.com', ville: 'Bobo-Dioulasso', adresse: 'Zone industrielle de Sonrier', dateCreation: '22/01/2021', statut: 'warning', responsable: 'Mariama Sanou', cnib: 'B4567890', siteWeb: '', nombreEmployes: 15, chiffreAffaires: '185 000 000', categorie: 'C - Assembleur local' },
  { id: '5', nom: 'Koudougou Motos SARL', type: 'Détaillant', rccm: 'BF-KOU-2022-E-7890', ifu: '00056789E', telephone: '+226 74 56 78 90', email: 'koudougoumotos@outlook.bf', ville: 'Koudougou', adresse: 'Avenue de la République', dateCreation: '10/04/2022', statut: 'success', responsable: 'Jean Zongo', cnib: 'B5678901', siteWeb: '', nombreEmployes: 8, chiffreAffaires: '95 000 000', categorie: 'D - Détaillant' },
  { id: '6', nom: 'Ouahigouya Moto Center', type: 'Détaillant', rccm: 'BF-OUA-2023-F-1234', ifu: '00067890F', telephone: '+226 75 67 89 01', email: 'ouahigouyamc@yahoo.fr', ville: 'Ouahigouya', adresse: 'Rue du Marché, secteur 2', dateCreation: '15/06/2023', statut: 'warning', responsable: 'Abdoulaye Compaoré', cnib: 'B6789012', siteWeb: '', nombreEmployes: 6, chiffreAffaires: '72 000 000', categorie: 'D - Détaillant' },
  { id: '7', nom: 'Banfora Wheels SARL', type: 'Détaillant', rccm: 'BF-BAN-2021-G-5678', ifu: '00078901G', telephone: '+226 76 78 90 12', email: 'banforawheels@gmail.com', ville: 'Banfora', adresse: 'Route de Niangoloko', dateCreation: '03/09/2021', statut: 'success', responsable: 'Aminata Traoré', cnib: 'B7890123', siteWeb: '', nombreEmployes: 5, chiffreAffaires: '58 000 000', categorie: 'D - Détaillant' },
  { id: '8', nom: 'Moto Pro Burkina', type: 'Importateur', rccm: 'BF-OUA-2017-H-9012', ifu: '00089012H', telephone: '+226 77 89 01 23', email: 'motopro@motopro.bf', ville: 'Ouagadougou', adresse: 'Zone industrielle, Kossodo', dateCreation: '28/02/2017', statut: 'success', responsable: 'Sylvain Tiendrébéogo', cnib: 'B8901234', siteWeb: 'www.motopro.bf', nombreEmployes: 62, chiffreAffaires: '1 250 000 000', categorie: 'A - Grand importateur' },
  { id: '9', nom: 'Kaya Moto Services', type: 'Réparateur', rccm: 'BF-KAY-2022-I-3456', ifu: '00090123I', telephone: '+226 78 90 12 34', email: 'kayamotoservices@gmail.com', ville: 'Kaya', adresse: 'Secteur 5, près du marché', dateCreation: '14/08/2022', statut: 'danger', responsable: 'Boureima Ouédraogo', cnib: 'B9012345', siteWeb: '', nombreEmployes: 4, chiffreAffaires: '32 000 000', categorie: 'E - Réparateur agréé' },
  { id: '10', nom: 'Fada NGourma Motos', type: 'Détaillant', rccm: 'BF-FAD-2023-J-7890', ifu: '00001234J', telephone: '+226 79 01 23 45', email: 'fadangourmamotos@yahoo.fr', ville: 'Fada NGourma', adresse: 'Centre-ville', dateCreation: '20/05/2023', statut: 'warning', responsable: 'Salamata Drabo', cnib: 'B0123456', siteWeb: '', nombreEmployes: 3, chiffreAffaires: '25 000 000', categorie: 'D - Détaillant' },
  { id: '11', nom: 'Dori Moto Import', type: 'Distributeur', rccm: 'BF-DOR-2020-K-1234', ifu: '00012345K', telephone: '+226 70 23 45 67', email: 'dorimoto@import.bf', ville: 'Dori', adresse: 'Route de Gorom-Gorom', dateCreation: '08/12/2020', statut: 'success', responsable: 'Youssouf Sawadogo', cnib: 'B1234568', siteWeb: '', nombreEmployes: 12, chiffreAffaires: '145 000 000', categorie: 'B - Distributeur régional' },
  { id: '12', nom: 'Gorom-Gorim Moto Plus', type: 'Détaillant', rccm: 'BF-GOR-2021-L-5678', ifu: '00023456L', telephone: '+226 71 34 56 78', email: 'gorommotoplus@gmail.com', ville: 'Gorom-Gorom', adresse: 'Secteur 1', dateCreation: '25/03/2021', statut: 'success', responsable: 'Hassane Barry', cnib: 'B2345679', siteWeb: '', nombreEmployes: 4, chiffreAffaires: '28 000 000', categorie: 'D - Détaillant' },
  { id: '13', nom: 'Ziniaré Moto SARL', type: 'Détaillant', rccm: 'BF-ZIN-2022-M-9012', ifu: '00034567M', telephone: '+226 72 45 67 89', email: 'ziniaremotos@outlook.bf', ville: 'Ziniaré', adresse: 'Route nationale n°3', dateCreation: '17/07/2022', statut: 'success', responsable: 'Pascal Zombre', cnib: 'B3456790', siteWeb: '', nombreEmployes: 5, chiffreAffaires: '42 000 000', categorie: 'D - Détaillant' },
  { id: '14', nom: 'Léo Moto Center', type: 'Réparateur', rccm: 'BF-LEO-2023-N-3456', ifu: '00045678N', telephone: '+226 73 56 78 90', email: 'leomotocenter@gmail.com', ville: 'Léo', adresse: 'Près du marché central', dateCreation: '02/10/2023', statut: 'warning', responsable: 'Germain Belemtigri', cnib: 'B4567901', siteWeb: '', nombreEmployes: 3, chiffreAffaires: '18 000 000', categorie: 'E - Réparateur agréé' },
  { id: '15', nom: 'Sapouy Motos Distribution', type: 'Détaillant', rccm: 'BF-SAP-2021-O-7890', ifu: '00056789O', telephone: '+226 74 67 89 01', email: 'sapouymotos@yahoo.fr', ville: 'Sapouy', adresse: 'Centre-ville', dateCreation: '11/01/2021', statut: 'success', responsable: 'Adama Koala', cnib: 'B5678902', siteWeb: '', nombreEmployes: 4, chiffreAffaires: '35 000 000', categorie: 'D - Détaillant' },
  { id: '16', nom: 'Réo Moto Services', type: 'Détaillant', rccm: 'BF-REO-2022-P-1234', ifu: '00067890P', telephone: '+226 75 78 90 12', email: 'reomotoservices@gmail.com', ville: 'Réo', adresse: 'Route de Koudougou', dateCreation: '29/04/2022', statut: 'success', responsable: 'Issouf Sana', cnib: 'B6789013', siteWeb: '', nombreEmployes: 6, chiffreAffaires: '48 000 000', categorie: 'D - Détaillant' },
  { id: '17', nom: 'Manga Moto Plus', type: 'Détaillant', rccm: 'BF-MAN-2020-Q-5678', ifu: '00078901Q', telephone: '+226 76 89 01 23', email: 'mangamotoplus@outlook.bf', ville: 'Manga', adresse: 'Secteur 2, avenue principale', dateCreation: '06/08/2020', statut: 'warning', responsable: 'Théophile Yaméogo', cnib: 'B7890124', siteWeb: '', nombreEmployes: 7, chiffreAffaires: '55 000 000', categorie: 'D - Détaillant' },
  { id: '18', nom: 'Tenkodogo Moto SARL', type: 'Distributeur', rccm: 'BF-TEN-2019-R-9012', ifu: '00089012R', telephone: '+226 77 90 12 34', email: 'tenkodogomoto@yahoo.fr', ville: 'Tenkodogo', adresse: 'Boulevard du centre', dateCreation: '19/06/2019', statut: 'success', responsable: 'Lassina Kone', cnib: 'B8901235', siteWeb: '', nombreEmployes: 18, chiffreAffaires: '220 000 000', categorie: 'B - Distributeur régional' },
  { id: '19', nom: 'Koupéla Motos Center', type: 'Détaillant', rccm: 'BF-KOU-2021-S-3456', ifu: '00090123S', telephone: '+226 78 01 23 45', email: 'koupelamotos@gmail.com', ville: 'Koupéla', adresse: 'Route nationale n°4', dateCreation: '24/02/2021', statut: 'success', responsable: 'Cécile Basene', cnib: 'B9012346', siteWeb: '', nombreEmployes: 5, chiffreAffaires: '38 000 000', categorie: 'D - Détaillant' },
  { id: '20', nom: 'Kombissiri Moto Import', type: 'Importateur', rccm: 'BF-KOM-2018-T-7890', ifu: '00001234T', telephone: '+226 79 12 34 56', email: 'kombissiri@import.bf', ville: 'Ouagadougou', adresse: 'Zone industrielle, secteur 30', dateCreation: '07/04/2018', statut: 'success', responsable: 'Édouard Tamini', cnib: 'B0123457', siteWeb: '', nombreEmployes: 38, chiffreAffaires: '680 000 000', categorie: 'A - Grand importateur' },
  { id: '21', nom: 'Gaoua Moto Services', type: 'Détaillant', rccm: 'BF-GAO-2022-U-1234', ifu: '00012345U', telephone: '+226 70 34 56 78', email: 'gaoamotoservices@yahoo.fr', ville: 'Gaoua', adresse: 'Centre-ville, près du marché', dateCreation: '13/09/2022', statut: 'warning', responsable: 'Bénédicte Soré', cnib: 'B1234569', siteWeb: '', nombreEmployes: 6, chiffreAffaires: '52 000 000', categorie: 'D - Détaillant' },
  { id: '22', nom: 'Orodara Moto Plus', type: 'Réparateur', rccm: 'BF-ORO-2023-V-5678', ifu: '00023456V', telephone: '+226 71 45 67 89', email: 'orodaramoto@gmail.com', ville: 'Orodara', adresse: 'Secteur 3', dateCreation: '01/12/2023', statut: 'danger', responsable: 'Siaka Badini', cnib: 'B2345680', siteWeb: '', nombreEmployes: 2, chiffreAffaires: '12 000 000', categorie: 'E - Réparateur agréé' },
  { id: '23', nom: 'Nouna Moto Distribution', type: 'Détaillant', rccm: 'BF-NOU-2021-W-9012', ifu: '00034567W', telephone: '+226 72 56 78 90', email: 'nounamoto@outlook.bf', ville: 'Nouna', adresse: 'Route de Dédougou', dateCreation: '16/05/2021', statut: 'success', responsable: 'Alimata Wennéga', cnib: 'B3456791', siteWeb: '', nombreEmployes: 5, chiffreAffaires: '40 000 000', categorie: 'D - Détaillant' },
  { id: '24', nom: 'Djibo Moto SARL', type: 'Détaillant', rccm: 'BF-DJI-2020-X-3456', ifu: '00045678X', telephone: '+226 73 67 89 01', email: 'djibomoto@yahoo.fr', ville: 'Djibo', adresse: 'Centre-ville', dateCreation: '09/11/2020', statut: 'success', responsable: 'Abdel Kader Dicko', cnib: 'B4567902', siteWeb: '', nombreEmployes: 4, chiffreAffaires: '30 000 000', categorie: 'D - Détaillant' },
];

const columnHelper = createColumnHelper<Actor>();

const statutsLabels: Record<string, string> = { success: 'Actif', warning: 'En attente', danger: 'Non conforme' };

export default function Actors() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [villeFilter, setVilleFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  const columns = useMemo(() => [
    columnHelper.accessor('nom', { header: 'Nom', cell: info => <span className="font-medium text-navy-900 dark:text-dm-text-primary">{info.getValue()}</span> }),
    columnHelper.accessor('type', { header: 'Type' }),
    columnHelper.accessor('rccm', { header: 'RCCM', cell: info => <span className="font-mono text-xs">{info.getValue()}</span> }),
    columnHelper.accessor('ifu', { header: 'IFU', cell: info => <span className="font-mono text-xs">{info.getValue()}</span> }),
    columnHelper.accessor('ville', { header: 'Ville' }),
    columnHelper.accessor('telephone', { header: 'Téléphone' }),
    columnHelper.accessor('responsable', { header: 'Responsable' }),
    columnHelper.accessor('statut', { header: 'Statut', cell: info => <StatusBadge status={info.getValue() as 'success' | 'warning' | 'danger'} label={statutsLabels[info.getValue() as string]} /> }),
    columnHelper.display({ id: 'actions', header: '', cell: ({ row }) => (
      <button onClick={() => setSelectedActor(row.original)} className="text-terracotta-500 hover:text-terracotta-600 text-sm font-medium flex items-center gap-1">
        Détails <ChevronRight className="w-3 h-3" />
      </button>
    )}),
  ], []);

  const filteredData = useMemo(() => {
    return mockActors.filter(a => {
      const matchSearch = !search || a.nom.toLowerCase().includes(search.toLowerCase()) || a.rccm.toLowerCase().includes(search.toLowerCase()) || a.responsable.toLowerCase().includes(search.toLowerCase());
      const matchType = !typeFilter || a.type === typeFilter;
      const matchVille = !villeFilter || a.ville === villeFilter;
      return matchSearch && matchType && matchVille;
    });
  }, [search, typeFilter, villeFilter]);

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

  const types = [...new Set(mockActors.map(a => a.type))];
  const villes = [...new Set(mockActors.map(a => a.ville))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Acteurs Économiques</h2>
          <p className="text-sm text-navy-500 dark:text-dm-text-secondary mt-1">{mockActors.length} acteurs enregistrés dans le système</p>
        </div>
        <button onClick={() => setShowAddWizard(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter un acteur
        </button>
      </motion.div>

      {/* Filter Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-navy-50 dark:bg-dm-bg-secondary rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input type="text" placeholder="Rechercher par nom, RCCM, responsable..." value={search} onChange={e => setSearch(e.target.value)} className="input-base w-full pl-10" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-base min-w-[140px]">
          <option value="">Tous les types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={villeFilter} onChange={e => setVilleFilter(e.target.value)} className="input-base min-w-[140px]">
          <option value="">Toutes les villes</option>
          {villes.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <button onClick={() => { setSearch(''); setTypeFilter(''); setVilleFilter(''); }} className="btn-ghost text-sm">Réinitialiser</button>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id} className="table-header">
                  {hg.headers.map(h => (
                    <th key={h.id} className="px-4 py-3 text-left cursor-pointer select-none" onClick={h.column.getToggleSortingHandler()}>
                      <div className="flex items-center gap-1">{flexRender(h.column.columnDef.header, h.getContext())}{{'asc': '↑', 'desc': '↓'}[h.column.getIsSorted() as string] ?? null}</div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="table-row">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3.5 text-sm text-navy-700 dark:text-dm-text-secondary">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-navy-200 dark:border-dm-border">
          <span className="text-xs text-navy-500 dark:text-dm-text-secondary">Afficher {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} - {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)} sur {filteredData.length}</span>
          <div className="flex gap-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="btn-secondary text-xs h-8 px-3 disabled:opacity-50">Précédent</button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="btn-secondary text-xs h-8 px-3 disabled:opacity-50">Suivant</button>
          </div>
        </div>
      </motion.div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedActor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setSelectedActor(null)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-lg bg-white dark:bg-dm-bg-secondary h-full overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-navy-200 dark:border-dm-border flex items-center justify-between">
                <h3 className="text-lg font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Détails de l&apos;acteur</h3>
                <button onClick={() => setSelectedActor(null)} className="w-8 h-8 rounded-lg hover:bg-navy-100 dark:hover:bg-dm-bg-tertiary flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-warm flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-navy-900 dark:text-dm-text-primary">{selectedActor.nom}</h4>
                    <StatusBadge status={selectedActor.statut} label={statutsLabels[selectedActor.statut]} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><p className="text-xs text-navy-500 dark:text-dm-text-secondary">Type</p><p className="text-sm font-medium text-navy-900 dark:text-dm-text-primary mt-1">{selectedActor.type}</p></div>
                  <div className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><p className="text-xs text-navy-500 dark:text-dm-text-secondary">Catégorie</p><p className="text-sm font-medium text-navy-900 dark:text-dm-text-primary mt-1">{selectedActor.categorie}</p></div>
                  <div className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><p className="text-xs text-navy-500 dark:text-dm-text-secondary">RCCM</p><p className="text-sm font-mono text-navy-900 dark:text-dm-text-primary mt-1">{selectedActor.rccm}</p></div>
                  <div className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><p className="text-xs text-navy-500 dark:text-dm-text-secondary">IFU</p><p className="text-sm font-mono text-navy-900 dark:text-dm-text-primary mt-1">{selectedActor.ifu}</p></div>
                </div>
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-navy-700 dark:text-dm-text-secondary uppercase tracking-wide">Contact</h5>
                  <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-navy-400" /><span className="text-navy-800 dark:text-dm-text-primary">{selectedActor.telephone}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-navy-400" /><span className="text-navy-800 dark:text-dm-text-primary">{selectedActor.email}</span></div>
                  {selectedActor.siteWeb && <div className="flex items-center gap-3 text-sm"><Globe className="w-4 h-4 text-navy-400" /><span className="text-navy-800 dark:text-dm-text-primary">{selectedActor.siteWeb}</span></div>}
                  <div className="flex items-center gap-3 text-sm"><MapPin className="w-4 h-4 text-navy-400" /><span className="text-navy-800 dark:text-dm-text-primary">{selectedActor.adresse}, {selectedActor.ville}</span></div>
                </div>
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-navy-700 dark:text-dm-text-secondary uppercase tracking-wide">Responsable</h5>
                  <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-navy-200 dark:bg-dm-bg-tertiary flex items-center justify-center text-sm font-bold text-navy-700 dark:text-dm-text-primary">{selectedActor.responsable.split(' ').map(n => n[0]).join('')}</div><div><p className="text-sm font-medium text-navy-900 dark:text-dm-text-primary">{selectedActor.responsable}</p><p className="text-xs text-navy-500 dark:text-dm-text-secondary">CNIB: {selectedActor.cnib}</p></div></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><Calendar className="w-4 h-4 mx-auto text-navy-400 mb-1" /><p className="text-xs text-navy-500">Création</p><p className="text-sm font-mono text-navy-900 dark:text-dm-text-primary">{selectedActor.dateCreation}</p></div>
                  <div className="text-center p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><Users className="w-4 h-4 mx-auto text-navy-400 mb-1" /><p className="text-xs text-navy-500">Employés</p><p className="text-sm font-mono text-navy-900 dark:text-dm-text-primary">{selectedActor.nombreEmployes}</p></div>
                  <div className="text-center p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><FileText className="w-4 h-4 mx-auto text-navy-400 mb-1" /><p className="text-xs text-navy-500">CA (FCFA)</p><p className="text-sm font-mono text-navy-900 dark:text-dm-text-primary">{selectedActor.chiffreAffaires}</p></div>
                </div>
                <div className="flex gap-3">
                  <button className="btn-primary flex-1 flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4" /> Vérifier conformité</button>
                  <button className="btn-secondary flex-1 flex items-center justify-center gap-2"><FileText className="w-4 h-4" /> Documents</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Wizard Modal */}
      <AnimatePresence>
        {showAddWizard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddWizard(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-dm-bg-secondary rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-navy-200 dark:border-dm-border flex items-center justify-between">
                <h3 className="text-lg font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Ajouter un acteur économique</h3>
                <button onClick={() => setShowAddWizard(false)} className="w-8 h-8 rounded-lg hover:bg-navy-100 dark:hover:bg-dm-bg-tertiary flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6">
                {/* Stepper */}
                <div className="flex items-center justify-center mb-8">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${wizardStep >= step ? 'bg-terracotta-500 text-white' : 'bg-navy-200 dark:bg-dm-border text-navy-500'}`}>{step}</div>
                      {step < 3 && <div className={`w-16 h-0.5 ${wizardStep > step ? 'bg-terracotta-500' : 'bg-navy-200 dark:bg-dm-border'}`} />}
                    </div>
                  ))}
                </div>
                {wizardStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h4 className="font-semibold text-navy-800 dark:text-dm-text-primary">Informations générales</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">Nom de l&apos;entreprise</label><input className="input-base w-full" placeholder="ex: Faso Moto SARL" /></div>
                      <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">Type d&apos;acteur</label><select className="input-base w-full"><option>Importateur</option><option>Distributeur</option><option>Assembler</option><option>Détaillant</option><option>Réparateur</option></select></div>
                      <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">RCCM</label><input className="input-base w-full font-mono" placeholder="BF-OUA-2019-A-1234" /></div>
                      <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">IFU</label><input className="input-base w-full font-mono" placeholder="00012345A" /></div>
                    </div>
                  </motion.div>
                )}
                {wizardStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h4 className="font-semibold text-navy-800 dark:text-dm-text-primary">Contact et localisation</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">Téléphone</label><input className="input-base w-full" placeholder="+226 XX XX XX XX" /></div>
                      <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">Email</label><input className="input-base w-full" placeholder="contact@entreprise.bf" /></div>
                      <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">Ville</label><select className="input-base w-full"><option>Ouagadougou</option><option>Bobo-Dioulasso</option><option>Koudougou</option><option>Ouahigouya</option><option>Banfora</option></select></div>
                      <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">Adresse</label><input className="input-base w-full" placeholder="Avenue/Rue/Secteur" /></div>
                    </div>
                  </motion.div>
                )}
                {wizardStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h4 className="font-semibold text-navy-800 dark:text-dm-text-primary">Responsable et validation</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">Nom du responsable</label><input className="input-base w-full" placeholder="Prénom Nom" /></div>
                      <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">CNIB</label><input className="input-base w-full font-mono" placeholder="B1234567" /></div>
                      <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">Nombre d&apos;employés</label><input type="number" className="input-base w-full" placeholder="5" /></div>
                      <div><label className="text-xs font-medium text-navy-700 dark:text-dm-text-secondary mb-1 block">Chiffre d&apos;affaires annuel (FCFA)</label><input className="input-base w-full" placeholder="100 000 000" /></div>
                    </div>
                    <div className="p-4 rounded-lg bg-success-50 dark:bg-dm-bg-tertiary border border-success-500/20">
                      <p className="text-sm text-success-500 font-medium flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Toutes les informations sont complètes</p>
                    </div>
                  </motion.div>
                )}
                <div className="flex justify-between mt-8">
                  {wizardStep > 1 ? <button onClick={() => setWizardStep(wizardStep - 1)} className="btn-secondary">Précédent</button> : <div />}
                  {wizardStep < 3 ? <button onClick={() => setWizardStep(wizardStep + 1)} className="btn-primary">Suivant</button> : <button onClick={() => setShowAddWizard(false)} className="btn-primary flex items-center gap-2"><CheckIcon /> Enregistrer</button>}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
}
