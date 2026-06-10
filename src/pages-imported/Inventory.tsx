import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Search, Plus, X, QrCode, AlertTriangle, CheckCircle,
  ClipboardCheck, Filter, RotateCcw
} from 'lucide-react';
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, flexRender, createColumnHelper, type SortingState
} from '@tanstack/react-table';
import StatusBadge from '@/components/imported/StatusBadge';

interface Vehicle {
  id: string;
  vin: string;
  marque: string;
  modele: string;
  annee: number;
  type: string;
  cylindree: string;
  couleur: string;
  dateReception: string;
  statut: 'success' | 'warning' | 'danger' | 'info';
  prixAchat: string;
  prixVente: string;
  fournisseur: string;
  emplacement: string;
  qrcode: string;
  interdit: boolean;
}

const mockVehicles: Vehicle[] = [
  { id: '1', vin: 'MLBXB10EXKW000001', marque: 'TVS', modele: 'HLX 125', annee: 2026, type: 'Motocyclette', cylindree: '125cc', couleur: 'Rouge', dateReception: '15/05/2026', statut: 'success', prixAchat: '785 000', prixVente: '950 000', fournisseur: 'Faso Moto SARL', emplacement: 'Entrepôt A - Ouaga', qrcode: 'QR-001-2026', interdit: false },
  { id: '2', vin: 'MLBXB10EXKW000002', marque: 'TVS', modele: 'HLX 150', annee: 2026, type: 'Motocyclette', cylindree: '150cc', couleur: 'Noir', dateReception: '14/05/2026', statut: 'success', prixAchat: '895 000', prixVente: '1 100 000', fournisseur: 'Faso Moto SARL', emplacement: 'Entrepôt A - Ouaga', qrcode: 'QR-002-2026', interdit: false },
  { id: '3', vin: 'MLBXB10EXKW000003', marque: 'Bajaj', modele: 'Boxer 150', annee: 2025, type: 'Motocyclette', cylindree: '150cc', couleur: 'Bleu', dateReception: '12/05/2026', statut: 'warning', prixAchat: '720 000', prixVente: '890 000', fournisseur: 'Burkina Wheels SA', emplacement: 'Entrepôt B - Bobo', qrcode: 'QR-003-2026', interdit: false },
  { id: '4', vin: 'MLBXB10EXKW000004', marque: 'Bajaj', modele: 'Boxer 125', annee: 2026, type: 'Motocyclette', cylindree: '125cc', couleur: 'Rouge', dateReception: '10/05/2026', statut: 'success', prixAchat: '650 000', prixVente: '820 000', fournisseur: 'Burkina Wheels SA', emplacement: 'Entrepôt A - Ouaga', qrcode: 'QR-004-2026', interdit: false },
  { id: '5', vin: 'MLBXB10EXKW000005', marque: 'Yamaha', modele: 'CRUX 110', annee: 2026, type: 'Motocyclette', cylindree: '110cc', couleur: 'Noir', dateReception: '08/05/2026', statut: 'success', prixAchat: '920 000', prixVente: '1 150 000', fournisseur: 'Moto Pro Burkina', emplacement: 'Entrepôt A - Ouaga', qrcode: 'QR-005-2026', interdit: false },
  { id: '6', vin: 'MLBXB10EXKW000006', marque: 'Yamaha', modele: 'YBR 125', annee: 2026, type: 'Motocyclette', cylindree: '125cc', couleur: 'Bleu', dateReception: '06/05/2026', statut: 'success', prixAchat: '1 150 000', prixVente: '1 400 000', fournisseur: 'Moto Pro Burkina', emplacement: 'Showroom Ouaga', qrcode: 'QR-006-2026', interdit: false },
  { id: '7', vin: 'MLBXB10EXKW000007', marque: 'TVS', modele: 'Apache 160', annee: 2026, type: 'Motocyclette', cylindree: '160cc', couleur: 'Rouge', dateReception: '05/05/2026', statut: 'info', prixAchat: '1 350 000', prixVente: '1 650 000', fournisseur: 'Faso Moto SARL', emplacement: 'Showroom Ouaga', qrcode: 'QR-007-2026', interdit: false },
  { id: '8', vin: 'MLBXB10EXKW000008', marque: 'Suzuki', modele: 'GD 110', annee: 2025, type: 'Motocyclette', cylindree: '110cc', couleur: 'Noir', dateReception: '03/05/2026', statut: 'success', prixAchat: '850 000', prixVente: '1 050 000', fournisseur: 'Kombissiri Moto Import', emplacement: 'Entrepôt B - Bobo', qrcode: 'QR-008-2026', interdit: false },
  { id: '9', vin: 'MLBXB10EXKW000009', marque: 'Bajaj', modele: 'Pulsar 200', annee: 2026, type: 'Motocyclette', cylindree: '200cc', couleur: 'Bleu', dateReception: '01/05/2026', statut: 'danger', prixAchat: '1 450 000', prixVente: '1 750 000', fournisseur: 'Burkina Wheels SA', emplacement: 'Showroom Ouaga', qrcode: 'QR-009-2026', interdit: true },
  { id: '10', vin: 'MLBXB10EXKW000010', marque: 'TVS', modele: 'Star City+', annee: 2026, type: 'Motocyclette', cylindree: '110cc', couleur: 'Noir', dateReception: '28/04/2026', statut: 'success', prixAchat: '695 000', prixVente: '850 000', fournisseur: 'Faso Moto SARL', emplacement: 'Entrepôt A - Ouaga', qrcode: 'QR-010-2026', interdit: false },
  { id: '11', vin: 'MLBXB10EXKW000011', marque: 'Honda', modele: 'Ace 110', annee: 2026, type: 'Motocyclette', cylindree: '110cc', couleur: 'Rouge', dateReception: '26/04/2026', statut: 'success', prixAchat: '980 000', prixVente: '1 200 000', fournisseur: 'Moto Pro Burkina', emplacement: 'Entrepôt A - Ouaga', qrcode: 'QR-011-2026', interdit: false },
  { id: '12', vin: 'MLBXB10EXKW000012', marque: 'Bajaj', modele: 'Discover 125', annee: 2025, type: 'Motocyclette', cylindree: '125cc', couleur: 'Bleu', dateReception: '24/04/2026', statut: 'warning', prixAchat: '580 000', prixVente: '750 000', fournisseur: 'Burkina Wheels SA', emplacement: 'Entrepôt C - Koudougou', qrcode: 'QR-012-2026', interdit: false },
  { id: '13', vin: 'MLBXB10EXKW000013', marque: 'TVS', modele: 'Jupiter 110', annee: 2026, type: 'Scooter', cylindree: '110cc', couleur: 'Blanc', dateReception: '22/04/2026', statut: 'success', prixAchat: '820 000', prixVente: '1 000 000', fournisseur: 'Faso Moto SARL', emplacement: 'Showroom Ouaga', qrcode: 'QR-013-2026', interdit: false },
  { id: '14', vin: 'MLBXB10EXKW000014', marque: 'Yamaha', modele: 'FZ 16', annee: 2026, type: 'Motocyclette', cylindree: '150cc', couleur: 'Noir', dateReception: '20/04/2026', statut: 'success', prixAchat: '1 280 000', prixVente: '1 550 000', fournisseur: 'Moto Pro Burkina', emplacement: 'Showroom Ouaga', qrcode: 'QR-014-2026', interdit: false },
  { id: '15', vin: 'MLBXB10EXKW000015', marque: 'Bajaj', modele: 'Avenger 220', annee: 2026, type: 'Motocyclette', cylindree: '220cc', couleur: 'Rouge', dateReception: '18/04/2026', statut: 'danger', prixAchat: '1 650 000', prixVente: '1 950 000', fournisseur: 'Burkina Wheels SA', emplacement: 'Entrepôt B - Bobo', qrcode: 'QR-015-2026', interdit: true },
  { id: '16', vin: 'MLBXB10EXKW000016', marque: 'TVS', modele: 'Sport 100', annee: 2026, type: 'Motocyclette', cylindree: '100cc', couleur: 'Rouge', dateReception: '15/04/2026', statut: 'success', prixAchat: '520 000', prixVente: '680 000', fournisseur: 'Faso Moto SARL', emplacement: 'Entrepôt C - Koudougou', qrcode: 'QR-016-2026', interdit: false },
  { id: '17', vin: 'MLBXB10EXKW000017', marque: 'Suzuki', modele: 'Hayate 110', annee: 2026, type: 'Motocyclette', cylindree: '110cc', couleur: 'Noir', dateReception: '12/04/2026', statut: 'success', prixAchat: '750 000', prixVente: '920 000', fournisseur: 'Kombissiri Moto Import', emplacement: 'Entrepôt A - Ouaga', qrcode: 'QR-017-2026', interdit: false },
  { id: '18', vin: 'MLBXB10EXKW000018', marque: 'Honda', modele: 'Wave 110', annee: 2025, type: 'Motocyclette', cylindree: '110cc', couleur: 'Bleu', dateReception: '10/04/2026', statut: 'warning', prixAchat: '680 000', prixVente: '850 000', fournisseur: 'Moto Pro Burkina', emplacement: 'Entrepôt B - Bobo', qrcode: 'QR-018-2026', interdit: false },
  { id: '19', vin: 'MLBXB10EXKW000019', marque: 'TVS', modele: 'King 100', annee: 2026, type: 'Tricycle', cylindree: '100cc', couleur: 'Jaune', dateReception: '08/04/2026', statut: 'success', prixAchat: '1 450 000', prixVente: '1 750 000', fournisseur: 'Faso Moto SARL', emplacement: 'Entrepôt A - Ouaga', qrcode: 'QR-019-2026', interdit: false },
  { id: '20', vin: 'MLBXB10EXKW000020', marque: 'Bajaj', modele: 'RE 205', annee: 2026, type: 'Tricycle', cylindree: '205cc', couleur: 'Jaune/Noir', dateReception: '05/04/2026', statut: 'success', prixAchat: '1 850 000', prixVente: '2 200 000', fournisseur: 'Burkina Wheels SA', emplacement: 'Entrepôt A - Ouaga', qrcode: 'QR-020-2026', interdit: false },
  { id: '21', vin: 'MLBXB10EXKW000021', marque: 'Yamaha', modele: 'Crypton 110', annee: 2026, type: 'Motocyclette', cylindree: '110cc', couleur: 'Rouge', dateReception: '03/04/2026', statut: 'info', prixAchat: '890 000', prixVente: '1 100 000', fournisseur: 'Moto Pro Burkina', emplacement: 'Showroom Ouaga', qrcode: 'QR-021-2026', interdit: false },
  { id: '22', vin: 'MLBXB10EXKW000022', marque: 'TVS', modele: 'XL 100', annee: 2026, type: 'Motocyclette', cylindree: '100cc', couleur: 'Noir', dateReception: '01/04/2026', statut: 'success', prixAchat: '580 000', prixVente: '720 000', fournisseur: 'Faso Moto SARL', emplacement: 'Entrepôt B - Bobo', qrcode: 'QR-022-2026', interdit: false },
  { id: '23', vin: 'MLBXB10EXKW000023', marque: 'Bajaj', modele: 'CT 100', annee: 2025, type: 'Motocyclette', cylindree: '100cc', couleur: 'Bleu', dateReception: '28/03/2026', statut: 'success', prixAchat: '495 000', prixVente: '650 000', fournisseur: 'Burkina Wheels SA', emplacement: 'Entrepôt C - Koudougou', qrcode: 'QR-023-2026', interdit: false },
  { id: '24', vin: 'MLBXB10EXKW000024', marque: 'Suzuki', modele: 'Access 125', annee: 2026, type: 'Scooter', cylindree: '125cc', couleur: 'Blanc', dateReception: '25/03/2026', statut: 'success', prixAchat: '1 050 000', prixVente: '1 280 000', fournisseur: 'Kombissiri Moto Import', emplacement: 'Showroom Ouaga', qrcode: 'QR-024-2026', interdit: false },
  { id: '25', vin: 'MLBXB10EXKW000025', marque: 'Honda', modele: 'CB 125F', annee: 2026, type: 'Motocyclette', cylindree: '125cc', couleur: 'Rouge', dateReception: '22/03/2026', statut: 'success', prixAchat: '1 180 000', prixVente: '1 450 000', fournisseur: 'Moto Pro Burkina', emplacement: 'Showroom Ouaga', qrcode: 'QR-025-2026', interdit: false },
  { id: '26', vin: 'MLBXB10EXKW000026', marque: 'TVS', modele: 'NTORQ 125', annee: 2026, type: 'Scooter', cylindree: '125cc', couleur: 'Jaune', dateReception: '20/03/2026', statut: 'success', prixAchat: '980 000', prixVente: '1 200 000', fournisseur: 'Faso Moto SARL', emplacement: 'Showroom Ouaga', qrcode: 'QR-026-2026', interdit: false },
  { id: '27', vin: 'MLBXB10EXKW000027', marque: 'Bajaj', modele: 'Dominar 400', annee: 2026, type: 'Motocyclette', cylindree: '400cc', couleur: 'Noir', dateReception: '18/03/2026', statut: 'danger', prixAchat: '2 450 000', prixVente: '2 900 000', fournisseur: 'Burkina Wheels SA', emplacement: 'Showroom Ouaga', qrcode: 'QR-027-2026', interdit: true },
  { id: '28', vin: 'MLBXB10EXKW000028', marque: 'Yamaha', modele: 'MT-15', annee: 2026, type: 'Motocyclette', cylindree: '155cc', couleur: 'Bleu', dateReception: '15/03/2026', statut: 'info', prixAchat: '1 750 000', prixVente: '2 100 000', fournisseur: 'Moto Pro Burkina', emplacement: 'Showroom Ouaga', qrcode: 'QR-028-2026', interdit: false },
  { id: '29', vin: 'MLBXB10EXKW000029', marque: 'TVS', modele: 'Radeon 110', annee: 2026, type: 'Motocyclette', cylindree: '110cc', couleur: 'Noir', dateReception: '12/03/2026', statut: 'success', prixAchat: '620 000', prixVente: '780 000', fournisseur: 'Faso Moto SARL', emplacement: 'Entrepôt C - Koudougou', qrcode: 'QR-029-2026', interdit: false },
  { id: '30', vin: 'MLBXB10EXKW000030', marque: 'Suzuki', modele: 'Gixxer 155', annee: 2026, type: 'Motocyclette', cylindree: '155cc', couleur: 'Rouge', dateReception: '10/03/2026', statut: 'success', prixAchat: '1 320 000', prixVente: '1 600 000', fournisseur: 'Kombissiri Moto Import', emplacement: 'Showroom Ouaga', qrcode: 'QR-030-2026', interdit: false },
];

const statutLabels: Record<string, string> = { success: 'Disponible', warning: 'Réservé', danger: 'Interdit', info: 'Vendu' };
const columnHelper = createColumnHelper<Vehicle>();

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [marqueFilter, setMarqueFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showReconciliation, setShowReconciliation] = useState(false);

  const columns = useMemo(() => [
    columnHelper.accessor('vin', { header: 'VIN', cell: info => <span className="font-mono text-xs">{info.getValue()}</span> }),
    columnHelper.accessor('marque', { header: 'Marque' }),
    columnHelper.accessor('modele', { header: 'Modèle' }),
    columnHelper.accessor('annee', { header: 'Année' }),
    columnHelper.accessor('cylindree', { header: 'Cylindrée' }),
    columnHelper.accessor('couleur', { header: 'Couleur' }),
    columnHelper.accessor('statut', { header: 'Statut', cell: info => <StatusBadge status={info.getValue() as 'success' | 'warning' | 'danger' | 'info'} label={statutLabels[info.getValue() as string]} /> }),
    columnHelper.accessor('emplacement', { header: 'Emplacement' }),
    columnHelper.display({ id: 'actions', header: '', cell: ({ row }) => (
      <button onClick={() => setSelectedVehicle(row.original)} className="text-terracotta-500 hover:text-terracotta-600 text-sm font-medium">Détails</button>
    )}),
  ], []);

  const filteredData = useMemo(() => {
    return mockVehicles.filter(v => {
      const matchSearch = !search || v.vin.toLowerCase().includes(search.toLowerCase()) || v.marque.toLowerCase().includes(search.toLowerCase()) || v.modele.toLowerCase().includes(search.toLowerCase());
      const matchMarque = !marqueFilter || v.marque === marqueFilter;
      const matchStatut = !statutFilter || v.statut === statutFilter;
      return matchSearch && matchMarque && matchStatut;
    });
  }, [search, marqueFilter, statutFilter]);

  const forbiddenCount = mockVehicles.filter(v => v.interdit).length;
  const totalValue = mockVehicles.reduce((acc, v) => acc + parseInt(v.prixAchat.replace(/\s/g, '')), 0);

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

  const marques = [...new Set(mockVehicles.map(v => v.marque))];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Stocks et Inventaire</h2>
          <p className="text-sm text-navy-500 dark:text-dm-text-secondary mt-1">{mockVehicles.length} véhicules enregistrés | Valeur totale: {totalValue.toLocaleString()} FCFA</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowQrScanner(true)} className="btn-secondary flex items-center gap-2"><QrCode className="w-4 h-4" /> Scanner QR</button>
          <button className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Ajouter</button>
        </div>
      </motion.div>

      {/* Forbidden Alert */}
      {forbiddenCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-danger-50 dark:bg-danger-500/10 border border-danger-500/20 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-danger-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-danger-500">Alerte: Modèles interdits détectés</p>
            <p className="text-xs text-navy-600 dark:text-dm-text-secondary">{forbiddenCount} véhicule(s) appartiennent à la liste des modèles interdits par le Ministère. Action requise.</p>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-navy-50 dark:bg-dm-bg-secondary rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" /><input type="text" placeholder="Rechercher par VIN, marque, modèle..." value={search} onChange={e => setSearch(e.target.value)} className="input-base w-full pl-10" /></div>
        <select value={marqueFilter} onChange={e => setMarqueFilter(e.target.value)} className="input-base min-w-[140px]"><option value="">Toutes marques</option>{marques.map(m => <option key={m} value={m}>{m}</option>)}</select>
        <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)} className="input-base min-w-[140px]"><option value="">Tous statuts</option><option value="success">Disponible</option><option value="warning">Réservé</option><option value="info">Vendu</option><option value="danger">Interdit</option></select>
        <button onClick={() => setShowReconciliation(true)} className="btn-ghost flex items-center gap-2 text-sm"><RotateCcw className="w-4 h-4" /> Réconciliation</button>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>{table.getHeaderGroups().map(hg => (<tr key={hg.id} className="table-header">{hg.headers.map(h => (<th key={h.id} className="px-4 py-3 text-left cursor-pointer select-none" onClick={h.column.getToggleSortingHandler()}><div className="flex items-center gap-1">{flexRender(h.column.columnDef.header, h.getContext())}{{'asc': '↑', 'desc': '↓'}[h.column.getIsSorted() as string] ?? null}</div></th>))}</tr>))}</thead>
            <tbody>{table.getRowModel().rows.map(row => (<tr key={row.id} className={`table-row ${row.original.interdit ? 'bg-danger-50/50 dark:bg-danger-500/5' : ''}`}>{row.getVisibleCells().map(cell => (<td key={cell.id} className="px-4 py-3.5 text-sm text-navy-700 dark:text-dm-text-secondary">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>))}</tr>))}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-navy-200 dark:border-dm-border">
          <span className="text-xs text-navy-500 dark:text-dm-text-secondary">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} - {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)} sur {filteredData.length}</span>
          <div className="flex gap-2"><button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="btn-secondary text-xs h-8 px-3 disabled:opacity-50">Précédent</button><button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="btn-secondary text-xs h-8 px-3 disabled:opacity-50">Suivant</button></div>
        </div>
      </motion.div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setSelectedVehicle(null)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-lg bg-white dark:bg-dm-bg-secondary h-full overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-navy-200 dark:border-dm-border flex items-center justify-between">
                <h3 className="text-lg font-dm-sans font-bold text-navy-900 dark:text-dm-text-primary">Détails du véhicule</h3>
                <button onClick={() => setSelectedVehicle(null)} className="w-8 h-8 rounded-lg hover:bg-navy-100 dark:hover:bg-dm-bg-tertiary flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-warm flex items-center justify-center"><Package className="w-7 h-7 text-white" /></div>
                  <div><h4 className="text-base font-bold text-navy-900 dark:text-dm-text-primary">{selectedVehicle.marque} {selectedVehicle.modele}</h4><StatusBadge status={selectedVehicle.statut} label={statutLabels[selectedVehicle.statut]} />{selectedVehicle.interdit && <span className="ml-2 text-xs text-danger-500 font-medium">(INTERDIT)</span>}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><p className="text-xs text-navy-500">VIN</p><p className="text-sm font-mono text-navy-900 dark:text-dm-text-primary">{selectedVehicle.vin}</p></div>
                  <div className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><p className="text-xs text-navy-500">QR Code</p><p className="text-sm font-mono text-navy-900 dark:text-dm-text-primary">{selectedVehicle.qrcode}</p></div>
                  <div className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><p className="text-xs text-navy-500">Année</p><p className="text-sm font-mono text-navy-900 dark:text-dm-text-primary">{selectedVehicle.annee}</p></div>
                  <div className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><p className="text-xs text-navy-500">Cylindrée</p><p className="text-sm text-navy-900 dark:text-dm-text-primary">{selectedVehicle.cylindree}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-success-50 dark:bg-dm-bg-tertiary border border-success-500/20"><p className="text-xs text-success-500">Prix d&apos;achat</p><p className="text-sm font-bold text-navy-900 dark:text-dm-text-primary">{selectedVehicle.prixAchat} FCFA</p></div>
                  <div className="p-3 rounded-lg bg-info-50 dark:bg-dm-bg-tertiary border border-info-500/20"><p className="text-xs text-info-500">Prix de vente</p><p className="text-sm font-bold text-navy-900 dark:text-dm-text-primary">{selectedVehicle.prixVente} FCFA</p></div>
                </div>
                <div className="p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><p className="text-xs text-navy-500">Fournisseur</p><p className="text-sm text-navy-900 dark:text-dm-text-primary">{selectedVehicle.fournisseur}</p><p className="text-xs text-navy-500 mt-1">Emplacement: {selectedVehicle.emplacement}</p></div>
                <div className="flex gap-3"><button className="btn-primary flex-1 flex items-center justify-center gap-2"><ClipboardCheck className="w-4 h-4" /> Inventaire</button><button className="btn-secondary flex-1 flex items-center justify-center gap-2"><QrCode className="w-4 h-4" /> Imprimer QR</button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showQrScanner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowQrScanner(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-dm-bg-secondary rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-dm-sans font-bold">Scanner QR Code</h3><button onClick={() => setShowQrScanner(false)} className="w-8 h-8 rounded-lg hover:bg-navy-100 flex items-center justify-center"><X className="w-4 h-4" /></button></div>
              <div className="border-2 border-dashed border-navy-300 dark:border-dm-border rounded-xl p-8 text-center">
                <QrCode className="w-16 h-16 mx-auto text-navy-300 mb-3" />
                <p className="text-sm text-navy-600 dark:text-dm-text-secondary mb-2">Placez le QR code du véhicule dans le cadre</p>
                <p className="text-xs text-navy-500">ou saisissez le VIN manuellement</p>
                <input className="input-base w-full mt-4 font-mono" placeholder="MLBXB10EXKW..." />
              </div>
              <button onClick={() => setShowQrScanner(false)} className="btn-primary w-full mt-4">Rechercher</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reconciliation Modal */}
      <AnimatePresence>
        {showReconciliation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReconciliation(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-dm-bg-secondary rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-dm-sans font-bold">Réconciliation d&apos;inventaire</h3><button onClick={() => setShowReconciliation(false)} className="w-8 h-8 rounded-lg hover:bg-navy-100 flex items-center justify-center"><X className="w-4 h-4" /></button></div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><span className="text-sm text-navy-700 dark:text-dm-text-secondary">Véhicules enregistrés</span><span className="text-sm font-bold text-navy-900 dark:text-dm-text-primary">{mockVehicles.length}</span></div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-navy-50 dark:bg-dm-bg-tertiary"><span className="text-sm text-navy-700 dark:text-dm-text-secondary">Véhicules scannés ce mois</span><span className="text-sm font-bold text-success-500">28</span></div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-danger-50 dark:bg-dm-bg-tertiary border border-danger-500/20"><span className="text-sm text-danger-500">Écarts détectés</span><span className="text-sm font-bold text-danger-500">2 véhicules</span></div>
                <div className="p-3 rounded-lg bg-warning-50 dark:bg-dm-bg-tertiary border border-warning-500/20"><p className="text-xs text-warning-500 font-medium">⚠ Recommandation: Effectuer un scan complet de l&apos;entrepôt A</p></div>
              </div>
              <div className="flex gap-3 mt-6"><button onClick={() => setShowReconciliation(false)} className="btn-secondary flex-1">Fermer</button><button onClick={() => setShowReconciliation(false)} className="btn-primary flex-1 flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Lancer réconciliation</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
