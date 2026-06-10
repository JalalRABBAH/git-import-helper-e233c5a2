// =============================================================================
// iReg Moto BF — Checklist Dynamique par Type d'Acteur
// Checklists spécifiques: Importateur, Distributeur, Assembleur, Détaillant
// =============================================================================

import {
  Actor,
  ActorType,
  RuleCategory,
  ChecklistItem,
  ChecklistItemStatus,
  ComplianceChecklist,
  RuleContext,
  IComplianceRule,
  StructuredLogger,
  ConsoleLogger,
} from './types';
import { IRuleRegistry, RuleRegistry, RegulatoryRulesEngine } from './regulatory-rules-engine';

// ============================================================================
// INTERFACE — Factory de checklist
// ============================================================================

export interface IChecklistFactory {
  createChecklist(actor: Actor, ctx: RuleContext, periodStart: Date, periodEnd: Date): ComplianceChecklist;
  getChecklistType(): ActorType;
}

// ============================================================================
// CHECKLIST DE BASE — Items communs à tous les acteurs
// ============================================================================

abstract class BaseChecklistFactory implements IChecklistFactory {
  protected logger: StructuredLogger;

  constructor(logger?: StructuredLogger) {
    this.logger = logger ?? new ConsoleLogger();
  }

  abstract getChecklistType(): ActorType;

  createChecklist(
    actor: Actor,
    ctx: RuleContext,
    periodStart: Date,
    periodEnd: Date,
  ): ComplianceChecklist {
    const items = this.buildItems(actor, ctx);
    const totalPoints = items.reduce((sum, i) => sum + i.points, 0);
    const pointsEarned = items
      .filter(i => i.status === ChecklistItemStatus.CONFORME)
      .reduce((sum, i) => sum + i.points, 0);

    const passedCount = items.filter(i => i.status === ChecklistItemStatus.CONFORME).length;
    const failedCount = items.filter(i => i.status === ChecklistItemStatus.NON_CONFORME).length;
    const naCount = items.filter(i => i.status === ChecklistItemStatus.NA).length;

    this.logger.info('Checklist created', {
      actorId: actor.id,
      actorType: this.getChecklistType(),
      itemsCount: items.length,
      passed: passedCount,
      failed: failedCount,
    });

    return {
      id: this.generateChecklistId(),
      actorId: actor.id,
      actorType: this.getChecklistType(),
      checklistType: 'SELF_ASSESSMENT',
      periodStart,
      periodEnd,
      items,
      totalPoints,
      pointsEarned,
      status: failedCount === 0 ? 'COMPLETED' : failedCount > 3 ? 'CRITICAL' : 'IN_PROGRESS',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  protected abstract buildItems(actor: Actor, ctx: RuleContext): ChecklistItem[];

  protected createItem(
    id: string,
    ruleId: string,
    category: RuleCategory,
    description: string,
    points: number,
    isCompliant: boolean,
    isApplicable: boolean,
    requiredEvidence: string,
    notes?: string,
  ): ChecklistItem {
    let status: ChecklistItemStatus;
    if (!isApplicable) {
      status = ChecklistItemStatus.NA;
    } else if (isCompliant) {
      status = ChecklistItemStatus.CONFORME;
    } else {
      status = ChecklistItemStatus.NON_CONFORME;
    }

    return {
      id,
      ruleId,
      category,
      description,
      points,
      status,
      requiredEvidence,
      evaluatedAt: new Date(),
      notes,
    };
  }

  private generateChecklistId(): string {
    return `chk-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// ============================================================================
// CHECKLIST IMPORTATEUR
// ============================================================================

export class ImportateurChecklistFactory extends BaseChecklistFactory {
  getChecklistType(): ActorType {
    return ActorType.IMPORTATEUR;
  }

  protected buildItems(actor: Actor, ctx: RuleContext): ChecklistItem[] {
    const items: ChecklistItem[] = [];

    // === Catégorie A — Enregistrement et Agrément (30 pts) ===
    items.push(this.createItem(
      'chk-imp-a1', 'rule-a1', 'A_REGISTRATION',
      'A1 — RCCM valide et à jour', 5,
      !!actor.rccm && actor.rccm.length >= 5,
      true,
      'Copie du RCCM datant de moins de 3 mois',
    ));
    items.push(this.createItem(
      'chk-imp-a2', 'rule-a2', 'A_REGISTRATION',
      'A2 — IFU/NIF en règle', 5,
      !!actor.nif && actor.nif.length >= 8,
      true,
      'Attestation IFU',
    ));
    items.push(this.createItem(
      'chk-imp-a3', 'rule-a3', 'A_REGISTRATION',
      'A3 — Agrément ministère du Commerce valide', 10,
      actor.agreementStatus === 'APPROVED' && !!actor.agreementExpiresAt && actor.agreementExpiresAt > new Date(),
      true,
      'Arrêté d\'agrément',
    ));
    items.push(this.createItem(
      'chk-imp-a4', 'rule-a4', 'A_REGISTRATION',
      'A4 — Licence d\'importation valide', 5,
      !!ctx.documents?.find(d => d.documentType === 'LICENCE_IMPORTATION' && d.isVerified),
      true,
      'Licence DGD',
    ));
    items.push(this.createItem(
      'chk-imp-a5', 'rule-a5', 'A_REGISTRATION',
      'A5 — Enregistrement dans le délai de 30 jours', 5,
      ((ctx.referenceDate ?? new Date()).getTime() - actor.createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 30,
      true,
      'Date d\'immatriculation',
    ));

    // === Catégorie B — Locaux et Infrastructure (25 pts) ===
    const warehouses = (ctx.warehouses ?? []).filter(w => w.actorId === actor.id && w.isActive);
    items.push(this.createItem(
      'chk-imp-b1', 'rule-b1', 'B_PREMISES',
      'B1 — Local commercial déclaré et conforme', 5,
      !!actor.addressLine1 && !!actor.gpsCoordinates,
      true,
      'Attestation de localisation',
    ));
    items.push(this.createItem(
      'chk-imp-b2', 'rule-b2', 'B_PREMISES',
      'B2 — Entrepôt sécurisé avec inventaire physique', 5,
      warehouses.length > 0 && warehouses.some(w => w.securityLevel === 'RENFORCE' || w.securityLevel === 'HAUTE'),
      true,
      'Photos entrepôt + fiche sécurité',
    ));
    items.push(this.createItem(
      'chk-imp-b3', 'rule-b3', 'B_PREMISES',
      'B3 — Système informatique de traçabilité opérationnel', 5,
      !!actor.metadata?.['hasTraceabilitySystem'],
      true,
      'Capture d\'écran système',
    ));
    items.push(this.createItem(
      'chk-imp-b4', 'rule-b4', 'B_PREMISES',
      'B4 — Connexion internet pour reporting', 5,
      !!actor.metadata?.['hasInternetConnection'],
      true,
      'Attestation de connexion',
    ));
    // B5 non applicable aux importateurs
    items.push(this.createItem(
      'chk-imp-b5', 'rule-b5', 'B_PREMISES',
      'B5 — Unité de montage agréée (spécifique assembleur)', 5,
      false, false,
      'N/A — Spécifique assembleur',
    ));

    // === Catégorie C — Gestion des Stocks (25 pts) ===
    const actorVehicles = (ctx.vehicles ?? []).filter(v => v.currentOwnerActorId === actor.id);
    const inStock = actorVehicles.filter(v => v.status === 'IN_STOCK' || v.status === 'IMPORTED');
    items.push(this.createItem(
      'chk-imp-c1', 'rule-c1', 'C_STOCK_MANAGEMENT',
      'C1 — VIN/numéro de série enregistré pour chaque engin', 5,
      inStock.length === 0 || inStock.filter(v => !!v.vin && v.vin.length === 17).length / Math.max(inStock.length, 1) >= 0.95,
      true,
      'Fichier VIN complet',
    ));
    items.push(this.createItem(
      'chk-imp-c2', 'rule-c2', 'C_STOCK_MANAGEMENT',
      'C2 — Vérification conformité modèles (non interdits)', 5,
      !actorVehicles.some(v => v.categoryCode === 'INTERDITE'),
      true,
      'Liste des modèles avec conformité',
    ));
    items.push(this.createItem(
      'chk-imp-c3', 'rule-c3', 'C_STOCK_MANAGEMENT',
      'C3 — Inventaire physique trimestriel réalisé', 5,
      (ctx.inventoryCounts ?? []).some(inv =>
        inv.actorId === actor.id && inv.completedAt &&
        inv.completedAt > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      ),
      true,
      'Rapport d\'inventaire signé',
    ));
    items.push(this.createItem(
      'chk-imp-c4', 'rule-c4', 'C_STOCK_MANAGEMENT',
      'C4 — QR code ou RFID sur chaque unité', 5,
      inStock.length === 0 || inStock.filter(v => !!v.qrCode || !!v.rfidTag).length / Math.max(inStock.length, 1) >= 0.95,
      true,
      'Photos engins avec QR visible',
    ));
    items.push(this.createItem(
      'chk-imp-c5', 'rule-c5', 'C_STOCK_MANAGEMENT',
      'C5 — Réconciliation stock physique vs système', 5,
      (ctx.inventoryCounts ?? []).some(inv =>
        inv.actorId === actor.id && inv.status === 'RECONCILED' && inv.discrepancyUnits === 0
      ),
      true,
      'Rapport de réconciliation',
    ));

    // === Catégorie D — Registre Clients (25 pts) ===
    const actorClients = (ctx.clients ?? []).filter(c => c.registeredByActorId === actor.id);
    items.push(this.createItem(
      'chk-imp-d1', 'rule-d1', 'D_CLIENT_REGISTRY',
      'D1 — Identité complète avec pièce d\'identité valide', 5,
      actorClients.length === 0 || actorClients.filter(c =>
        !!c.idDocumentNumber && c.idDocumentNumber.length >= 5
      ).length / Math.max(actorClients.length, 1) >= 0.95,
      true,
      'Copies des pièces d\'identité',
    ));
    items.push(this.createItem(
      'chk-imp-d2', 'rule-d2', 'D_CLIENT_REGISTRY',
      'D2 — Photo de l\'acheteur archivée', 5,
      actorClients.length === 0 || actorClients.filter(c => !!c.photoUrl || c.biometricEnrolled).length / Math.max(actorClients.length, 1) >= 0.90,
      true,
      'Photos des acheteurs',
    ));
    items.push(this.createItem(
      'chk-imp-d3', 'rule-d3', 'D_CLIENT_REGISTRY',
      'D3 — Liaison acheteur-engin systématique', 5,
      (ctx.sales ?? []).filter(s => s.actorId === actor.id && s.status === 'PAID').every(s =>
        s.items && s.items.length > 0 && !!s.clientId
      ),
      true,
      'Registre des ventes avec VIN+client',
    ));
    items.push(this.createItem(
      'chk-imp-d4', 'rule-d4', 'D_CLIENT_REGISTRY',
      'D4 — Registre exhaustif soumis trimestriellement', 5,
      (ctx.quarterlyReports ?? []).some(r => r.actorId === actor.id && r.status === 'SUBMITTED'),
      true,
      'Accusé de réception registre',
    ));
    items.push(this.createItem(
      'chk-imp-d5', 'rule-d5', 'D_CLIENT_REGISTRY',
      'D5 — Conservation archives 5 ans', 5,
      !!actor.metadata?.['hasArchivePolicy'],
      true,
      'Politique de rétention documentaire',
    ));

    // === Catégorie E — Prix et Facturation (20 pts) ===
    items.push(this.createItem(
      'chk-imp-e1', 'rule-e1', 'E_PRICING',
      'E1 — Prix d\'achat enregistré', 5,
      (ctx.purchasePrices ?? []).filter(pp => pp.actorId === actor.id && pp.isActive).length > 0,
      true,
      'Factures d\'achat',
    ));
    const actorSales = (ctx.sales ?? []).filter(s => s.actorId === actor.id && s.status === 'PAID');
    items.push(this.createItem(
      'chk-imp-e2', 'rule-e2', 'E_PRICING',
      'E2 — Prix de vente déclaré', 5,
      actorSales.length === 0 || actorSales.every(s => s.totalAmount > 0),
      true,
      'Factures de vente',
    ));
    items.push(this.createItem(
      'chk-imp-e3', 'rule-e3', 'E_PRICING',
      'E3 — Facturation normalisée avec N° agrément', 5,
      !!actor.agreementNumber && (actorSales.length === 0 || actorSales.filter(s => !!s.metadata?.['invoiceNumber']).length / Math.max(actorSales.length, 1) >= 0.95),
      true,
      'Modèle de facture conforme',
    ));
    items.push(this.createItem(
      'chk-imp-e4', 'rule-e4', 'E_PRICING',
      'E4 — Marges conformes (écart < 20%)', 5,
      this.checkMargins(ctx, actor.id),
      true,
      'Tableau de suivi des marges',
    ));

    // === Catégorie F — Reporting (25 pts) ===
    const now = ctx.referenceDate ?? new Date();
    const q = Math.floor(now.getMonth() / 3) + 1;
    const y = now.getFullYear();
    items.push(this.createItem(
      'chk-imp-f1', 'rule-f1', 'F_REPORTING',
      'F1 — Rapport trimestriel soumis dans les délais (10 pts)', 10,
      (ctx.quarterlyReports ?? []).some(r => r.actorId === actor.id && r.year === y && r.quarter === `Q${q}` && (r.status === 'SUBMITTED' || r.status === 'APPROVED')),
      true,
      'Accusé de réception',
    ));
    const lastReport = (ctx.quarterlyReports ?? []).filter(r => r.actorId === actor.id).pop();
    items.push(this.createItem(
      'chk-imp-f2', 'rule-f2', 'F_REPORTING',
      'F2 — Données complètes et exactes (10 pts)', 10,
      !!lastReport && lastReport.totalSalesCount >= 0 && lastReport.stockClosingUnits >= 0 && lastReport.totalPurchasesCount >= 0,
      true,
      'Rapport validé par le système',
    ));
    items.push(this.createItem(
      'chk-imp-f3', 'rule-f3', 'F_REPORTING',
      'F3 — Format XML + PDF conforme (5 pts)', 5,
      !!lastReport && !!lastReport.xmlReportPath && !!lastReport.pdfReportPath,
      true,
      'Fichiers XML et PDF',
    ));

    return items;
  }

  private checkMargins(ctx: RuleContext, actorId: string): boolean {
    const sales = (ctx.sales ?? []).filter(s => s.actorId === actorId && s.status === 'PAID');
    if (sales.length === 0) return true;
    const margins: number[] = [];
    for (const sale of sales) {
      for (const item of sale.items) {
        if (item.unitCost && item.unitPrice > 0) {
          margins.push((item.unitPrice - item.unitCost) / item.unitPrice);
        }
      }
    }
    if (margins.length === 0) return true;
    const avg = margins.reduce((a, b) => a + b, 0) / margins.length;
    return avg >= 0.05 && avg <= 0.50;
  }
}

// ============================================================================
// CHECKLIST DISTRIBUTEUR
// ============================================================================

export class DistributeurChecklistFactory extends BaseChecklistFactory {
  getChecklistType(): ActorType {
    return ActorType.DISTRIBUTEUR;
  }

  protected buildItems(actor: Actor, ctx: RuleContext): ChecklistItem[] {
    // Le distributeur a les mêmes règles que l'importateur sauf A4 (licence import)
    const importateur = new ImportateurChecklistFactory(this.logger);
    const baseItems = importateur.createChecklist(actor, ctx, new Date(), new Date()).items;

    // Modifier A4 pour distributeur (non applicable)
    return baseItems.map(item => {
      if (item.ruleId === 'rule-a4') {
        return this.createItem(
          item.id, item.ruleId, item.category,
          'A4 — Licence d\'importation (N/A pour distributeur)', 5,
          false, false,
          'N/A — Spécifique importateur',
        );
      }
      if (item.ruleId === 'rule-b5') {
        return this.createItem(
          item.id, item.ruleId, item.category,
          'B5 — Unité de montage agréée (N/A pour distributeur)', 5,
          false, false,
          'N/A — Spécifique assembleur',
        );
      }
      // Recalculate status based on actual data
      return item;
    });
  }
}

// ============================================================================
// CHECKLIST ASSEMBLEUR
// ============================================================================

export class AssembleurChecklistFactory extends BaseChecklistFactory {
  getChecklistType(): ActorType {
    return ActorType.ASSEMBLEUR;
  }

  protected buildItems(actor: Actor, ctx: RuleContext): ChecklistItem[] {
    const importateur = new ImportateurChecklistFactory(this.logger);
    const baseItems = importateur.createChecklist(actor, ctx, new Date(), new Date()).items;

    return baseItems.map(item => {
      if (item.ruleId === 'rule-a4') {
        return this.createItem(
          item.id, item.ruleId, item.category,
          'A4 — Licence d\'importation kits CKD (si import)', 5,
          !!ctx.documents?.find(d => d.documentType === 'LICENCE_IMPORTATION' && d.isVerified),
          true,
          'Licence importation kits CKD',
        );
      }
      // B5 is applicable and REQUIRED for assembleurs
      if (item.ruleId === 'rule-b5') {
        return this.createItem(
          item.id, item.ruleId, item.category,
          'B5 — Unité de montage agréée (REQUIS)', 5,
          !!ctx.documents?.find(d => d.documentType === 'CERT_ASSEMBLY_UNIT' && d.isVerified),
          true,
          'Certificat d\'agrément unité de montage',
        );
      }
      return item;
    });
  }
}

// ============================================================================
// CHECKLIST DÉTAILLANT
// ============================================================================

export class DetallantChecklistFactory extends BaseChecklistFactory {
  getChecklistType(): ActorType {
    return ActorType.DETAILLANT;
  }

  protected buildItems(actor: Actor, ctx: RuleContext): ChecklistItem[] {
    // Détaillant : règles simplifiées (pas d'agrément ministère, pas de licence import, pas d'inventaire trimestriel obligatoire)
    const items: ChecklistItem[] = [];

    // A: Enregistrement (15 pts seulement pour détaillant)
    items.push(this.createItem(
      'chk-det-a1', 'rule-a1', 'A_REGISTRATION',
      'A1 — RCCM valide et à jour', 5,
      !!actor.rccm && actor.rccm.length >= 5, true,
      'Copie du RCCM',
    ));
    items.push(this.createItem(
      'chk-det-a2', 'rule-a2', 'A_REGISTRATION',
      'A2 — IFU/NIF en règle', 5,
      !!actor.nif && actor.nif.length >= 8, true,
      'Attestation IFU',
    ));
    // A3: Pas d'agrément ministère requis pour détaillant
    items.push(this.createItem(
      'chk-det-a3', 'rule-a3', 'A_REGISTRATION',
      'A3 — Agrément ministère (N/A détaillant)', 10,
      false, false,
      'N/A — Non requis pour détaillant',
    ));
    items.push(this.createItem(
      'chk-det-a4', 'rule-a4', 'A_REGISTRATION',
      'A4 — Licence d\'importation (N/A détaillant)', 5,
      false, false,
      'N/A — Spécifique importateur',
    ));
    items.push(this.createItem(
      'chk-det-a5', 'rule-a5', 'A_REGISTRATION',
      'A5 — Enregistrement dans le délai de 30 jours', 5,
      ((ctx.referenceDate ?? new Date()).getTime() - actor.createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 30,
      true, 'Date d\'immatriculation',
    ));

    // B: Locaux (20 pts)
    items.push(this.createItem(
      'chk-det-b1', 'rule-b1', 'B_PREMISES',
      'B1 — Local commercial déclaré et conforme', 5,
      !!actor.addressLine1 && !!actor.gpsCoordinates, true,
      'Attestation de localisation',
    ));
    // B2: Pas d'entrepôt obligatoire pour détaillant (magasin suffit)
    items.push(this.createItem(
      'chk-det-b2', 'rule-b2', 'B_PREMISES',
      'B2 — Magasin sécurisé', 5,
      (ctx.warehouses ?? []).some(w => w.actorId === actor.id && w.isActive && w.securityLevel !== 'STANDARD'),
      true, 'Photos magasin',
    ));
    items.push(this.createItem(
      'chk-det-b3', 'rule-b3', 'B_PREMISES',
      'B3 — Système informatique de traçabilité', 5,
      !!actor.metadata?.['hasTraceabilitySystem'], true,
      'Capture d\'écran système',
    ));
    items.push(this.createItem(
      'chk-det-b4', 'rule-b4', 'B_PREMISES',
      'B4 — Connexion internet pour reporting', 5,
      !!actor.metadata?.['hasInternetConnection'], true,
      'Attestation de connexion',
    ));
    items.push(this.createItem(
      'chk-det-b5', 'rule-b5', 'B_PREMISES',
      'B5 — Unité de montage (N/A détaillant)', 5,
      false, false,
      'N/A — Spécifique assembleur',
    ));

    // C: Stock (25 pts — plein pour détaillant)
    const actorVehicles = (ctx.vehicles ?? []).filter(v => v.currentOwnerActorId === actor.id);
    const inStock = actorVehicles.filter(v => v.status === 'IN_STOCK');
    items.push(this.createItem(
      'chk-det-c1', 'rule-c1', 'C_STOCK_MANAGEMENT',
      'C1 — VIN enregistré pour chaque engin', 5,
      inStock.length === 0 || inStock.filter(v => !!v.vin && v.vin.length === 17).length / Math.max(inStock.length, 1) >= 0.95,
      true, 'Fichier VIN',
    ));
    items.push(this.createItem(
      'chk-det-c2', 'rule-c2', 'C_STOCK_MANAGEMENT',
      'C2 — Conformité modèles (non interdits)', 5,
      !actorVehicles.some(v => v.categoryCode === 'INTERDITE'), true,
      'Liste modèles conformes',
    ));
    items.push(this.createItem(
      'chk-det-c3', 'rule-c3', 'C_STOCK_MANAGEMENT',
      'C3 — Inventaire physique (recommandé)', 5,
      (ctx.inventoryCounts ?? []).some(inv => inv.actorId === actor.id && inv.completedAt && inv.completedAt > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
      true, 'Rapport inventaire',
    ));
    items.push(this.createItem(
      'chk-det-c4', 'rule-c4', 'C_STOCK_MANAGEMENT',
      'C4 — QR code ou RFID sur chaque unité', 5,
      inStock.length === 0 || inStock.filter(v => !!v.qrCode || !!v.rfidTag).length / Math.max(inStock.length, 1) >= 0.95,
      true, 'Photos QR visibles',
    ));
    items.push(this.createItem(
      'chk-det-c5', 'rule-c5', 'C_STOCK_MANAGEMENT',
      'C5 — Réconciliation stock physique vs système', 5,
      (ctx.inventoryCounts ?? []).some(inv => inv.actorId === actor.id && inv.status === 'RECONCILED'),
      true, 'Rapport réconciliation',
    ));

    // D: Registre Clients (25 pts — plein pour détaillant)
    const actorClients = (ctx.clients ?? []).filter(c => c.registeredByActorId === actor.id);
    items.push(this.createItem(
      'chk-det-d1', 'rule-d1', 'D_CLIENT_REGISTRY',
      'D1 — Identité complète avec pièce d\'identité valide', 5,
      actorClients.length === 0 || actorClients.filter(c => !!c.idDocumentNumber && c.idDocumentNumber.length >= 5).length / Math.max(actorClients.length, 1) >= 0.95,
      true, 'Copies pièces d\'identité',
    ));
    items.push(this.createItem(
      'chk-det-d2', 'rule-d2', 'D_CLIENT_REGISTRY',
      'D2 — Photo de l\'acheteur archivée', 5,
      actorClients.length === 0 || actorClients.filter(c => !!c.photoUrl || c.biometricEnrolled).length / Math.max(actorClients.length, 1) >= 0.90,
      true, 'Photos acheteurs',
    ));
    items.push(this.createItem(
      'chk-det-d3', 'rule-d3', 'D_CLIENT_REGISTRY',
      'D3 — Liaison acheteur-engin systématique', 5,
      (ctx.sales ?? []).filter(s => s.actorId === actor.id && s.status === 'PAID').every(s => s.items && s.items.length > 0 && !!s.clientId),
      true, 'Registre ventes VIN+client',
    ));
    // D4: Pas de registre trimestriel obligatoire pour détaillant
    items.push(this.createItem(
      'chk-det-d4', 'rule-d4', 'D_CLIENT_REGISTRY',
      'D4 — Registre soumis (recommandé)', 5,
      (ctx.quarterlyReports ?? []).some(r => r.actorId === actor.id && r.status === 'SUBMITTED'),
      true, 'Accusé de réception',
    ));
    items.push(this.createItem(
      'chk-det-d5', 'rule-d5', 'D_CLIENT_REGISTRY',
      'D5 — Conservation archives 5 ans', 5,
      !!actor.metadata?.['hasArchivePolicy'], true,
      'Politique rétention',
    ));

    // E: Prix et Facturation (20 pts — plein pour détaillant)
    const actorSales = (ctx.sales ?? []).filter(s => s.actorId === actor.id && s.status === 'PAID');
    items.push(this.createItem(
      'chk-det-e1', 'rule-e1', 'E_PRICING',
      'E1 — Prix d\'achat enregistré', 5,
      (ctx.purchasePrices ?? []).filter(pp => pp.actorId === actor.id).length > 0 || actorSales.length === 0,
      true, 'Factures achat',
    ));
    items.push(this.createItem(
      'chk-det-e2', 'rule-e2', 'E_PRICING',
      'E2 — Prix de vente déclaré', 5,
      actorSales.length === 0 || actorSales.every(s => s.totalAmount > 0), true,
      'Factures vente',
    ));
    items.push(this.createItem(
      'chk-det-e3', 'rule-e3', 'E_PRICING',
      'E3 — Facturation normalisée', 5,
      actorSales.length === 0 || actorSales.filter(s => !!s.metadata?.['invoiceNumber']).length / Math.max(actorSales.length, 1) >= 0.95,
      true, 'Modèle facture',
    ));
    items.push(this.createItem(
      'chk-det-e4', 'rule-e4', 'E_PRICING',
      'E4 — Marges conformes', 5,
      this.checkMargins(ctx, actor.id), true,
      'Tableau marges',
    ));

    // F: Reporting (15 pts — réduit pour détaillant, pas obligatoire)
    items.push(this.createItem(
      'chk-det-f1', 'rule-f1', 'F_REPORTING',
      'F1 — Rapport trimestriel (recommandé)', 5,
      (ctx.quarterlyReports ?? []).some(r => r.actorId === actor.id && r.status === 'SUBMITTED'),
      true, 'Accusé réception',
    ));
    const lastReport = (ctx.quarterlyReports ?? []).filter(r => r.actorId === actor.id).pop();
    items.push(this.createItem(
      'chk-det-f2', 'rule-f2', 'F_REPORTING',
      'F2 — Données complètes si rapport soumis', 5,
      !lastReport || (lastReport.totalSalesCount >= 0 && lastReport.stockClosingUnits >= 0),
      true, 'Rapport validé',
    ));
    items.push(this.createItem(
      'chk-det-f3', 'rule-f3', 'F_REPORTING',
      'F3 — Format conforme si rapport soumis', 5,
      !lastReport || (!!lastReport.xmlReportPath && !!lastReport.pdfReportPath),
      true, 'Fichiers XML+PDF',
    ));

    return items;
  }

  private checkMargins(ctx: RuleContext, actorId: string): boolean {
    const sales = (ctx.sales ?? []).filter(s => s.actorId === actorId && s.status === 'PAID');
    if (sales.length === 0) return true;
    const margins: number[] = [];
    for (const sale of sales) {
      for (const item of sale.items) {
        if (item.unitCost && item.unitPrice > 0) {
          margins.push((item.unitPrice - item.unitCost) / item.unitPrice);
        }
      }
    }
    if (margins.length === 0) return true;
    const avg = margins.reduce((a, b) => a + b, 0) / margins.length;
    return avg >= 0.05 && avg <= 0.50;
  }
}

// ============================================================================
// ORCHESTRATEUR — Checklist Manager
// ============================================================================

export interface IChecklistManager {
  generateChecklist(actor: Actor, ctx: RuleContext, periodStart?: Date, periodEnd?: Date): ComplianceChecklist;
  getFactoryForActorType(actorType: ActorType): IChecklistFactory;
}

export class ChecklistManager implements IChecklistManager {
  private factories: Map<ActorType, IChecklistFactory> = new Map();
  private logger: StructuredLogger;

  constructor(logger?: StructuredLogger) {
    this.logger = logger ?? new ConsoleLogger();
    this.registerDefaultFactories();
  }

  private registerDefaultFactories(): void {
    this.factories.set(ActorType.IMPORTATEUR, new ImportateurChecklistFactory(this.logger));
    this.factories.set(ActorType.DISTRIBUTEUR, new DistributeurChecklistFactory(this.logger));
    this.factories.set(ActorType.ASSEMBLEUR, new AssembleurChecklistFactory(this.logger));
    this.factories.set(ActorType.DETAILLANT, new DetallantChecklistFactory(this.logger));
  }

  registerFactory(actorType: ActorType, factory: IChecklistFactory): void {
    this.factories.set(actorType, factory);
    this.logger.info('Checklist factory registered', { actorType });
  }

  getFactoryForActorType(actorType: ActorType): IChecklistFactory {
    const factory = this.factories.get(actorType);
    if (!factory) {
      throw new Error(`No checklist factory registered for actor type: ${actorType}`);
    }
    return factory;
  }

  generateChecklist(
    actor: Actor,
    ctx: RuleContext,
    periodStart?: Date,
    periodEnd?: Date,
  ): ComplianceChecklist {
    const factory = this.getFactoryForActorType(actor.actorType);
    const start = periodStart ?? this.getQuarterStart(ctx.referenceDate ?? new Date());
    const end = periodEnd ?? this.getQuarterEnd(ctx.referenceDate ?? new Date());

    this.logger.info('Generating checklist', { actorId: actor.id, actorType: actor.actorType });

    return factory.createChecklist(actor, ctx, start, end);
  }

  private getQuarterStart(date: Date): Date {
    const month = Math.floor(date.getMonth() / 3) * 3;
    return new Date(date.getFullYear(), month, 1);
  }

  private getQuarterEnd(date: Date): Date {
    const month = Math.floor(date.getMonth() / 3) * 3 + 2;
    return new Date(date.getFullYear(), month + 1, 0);
  }
}
