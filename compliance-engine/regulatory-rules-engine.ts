// =============================================================================
// iReg Moto BF — Moteur de Règles Réglementaires
// Arrêté ministériel 05/06/2026 — 150 points de conformité
// Pattern Strategy + Injection de Dépendances
// =============================================================================

import {
  Actor,
  ActorType,
  RuleContext,
  RuleResult,
  RuleCategory,
  ComplianceEvaluation,
  ComplianceGap,
  CorrectiveAction,
  OverallComplianceStatus,
  ComplianceSeverity,
  Vehicle,
  Sale,
  StructuredLogger,
  ConsoleLogger,
  ChecklistItemStatus,
} from './types';

// ============================================================================
// INTERFACE STRATÉGIE — Règle individuelle
// ============================================================================

export interface IComplianceRule {
  readonly id: string;
  readonly code: string;
  readonly category: RuleCategory;
  readonly description: string;
  readonly points: number;
  readonly severity: ComplianceSeverity;
  readonly applicableActorTypes: ActorType[];
  readonly evidenceRequired: string;

  evaluate(ctx: RuleContext): RuleResult;
}

// ============================================================================
// REGISTRE DE RÈGLES — Container DI
// ============================================================================

export interface IRuleRegistry {
  register(rule: IComplianceRule): void;
  getRulesForActorType(actorType: ActorType): IComplianceRule[];
  getAllRules(): IComplianceRule[];
  getRuleById(id: string): IComplianceRule | undefined;
}

export class RuleRegistry implements IRuleRegistry {
  private rules: Map<string, IComplianceRule> = new Map();

  register(rule: IComplianceRule): void {
    this.rules.set(rule.id, rule);
  }

  getRulesForActorType(actorType: ActorType): IComplianceRule[] {
    return Array.from(this.rules.values()).filter(r =>
      r.applicableActorTypes.includes(actorType)
    );
  }

  getAllRules(): IComplianceRule[] {
    return Array.from(this.rules.values());
  }

  getRuleById(id: string): IComplianceRule | undefined {
    return this.rules.get(id);
  }
}

// ============================================================================
// CATÉGORIE A — Enregistrement et Agrément (30 points)
// ============================================================================

/** A1: RCCM valide et à jour (5 pts) */
export class RuleA1_RccmValid implements IComplianceRule {
  readonly id = 'rule-a1';
  readonly code = 'A1';
  readonly category: RuleCategory = 'A_REGISTRATION';
  readonly description = 'RCCM (Registre du Commerce et du Crédit Mobilier) valide et à jour';
  readonly points = 5;
  readonly severity = ComplianceSeverity.BLOCKER;
  readonly applicableActorTypes = Object.values(ActorType);
  readonly evidenceRequired = 'Copie du RCCM datant de moins de 3 mois';

  evaluate(ctx: RuleContext): RuleResult {
    const actor = ctx.actor;
    const hasRccm = !!actor.rccm && actor.rccm.length >= 5;
    const doc = ctx.documents?.find(d =>
      d.documentType === 'REGISTRE_COMMERCE' && d.isVerified
    );
    const isValid = hasRccm && !!doc;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: isValid ? this.points : 0,
      isCompliant: isValid,
      severity: this.severity,
      observedValue: isValid ? `RCCM: ${actor.rccm} (vérifié)` : `RCCM: ${actor.rccm ?? 'manquant'}`,
      expectedValue: 'RCCM enregistré et document vérifié',
      gapDescription: isValid ? undefined : 'RCCM manquant, invalide ou document non vérifié',
      correctiveAction: 'Enregistrer le RCCM auprès du Greffe du Tribunal de Commerce et téléverser le document',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

/** A2: IFU en règle (5 pts) */
export class RuleA2_IfuValid implements IComplianceRule {
  readonly id = 'rule-a2';
  readonly code = 'A2';
  readonly category: RuleCategory = 'A_REGISTRATION';
  readonly description = 'Identification Fiscale Unique (IFU/NIF) en règle et vérifiée';
  readonly points = 5;
  readonly severity = ComplianceSeverity.BLOCKER;
  readonly applicableActorTypes = Object.values(ActorType);
  readonly evidenceRequired = 'Copie de l\'attestation IFU';

  evaluate(ctx: RuleContext): RuleResult {
    const actor = ctx.actor;
    const hasNif = !!actor.nif && actor.nif.length >= 8;
    const doc = ctx.documents?.find(d =>
      d.documentType === 'NIF' && d.isVerified
    );
    const isValid = hasNif && !!doc;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: isValid ? this.points : 0,
      isCompliant: isValid,
      severity: this.severity,
      observedValue: isValid ? `IFU: ${actor.nif} (vérifié)` : `IFU: ${actor.nif ?? 'manquant'}`,
      expectedValue: 'IFU/NIF enregistré et vérifié auprès de la DGI',
      gapDescription: isValid ? undefined : 'IFU manquant, non enregistré ou document non vérifié',
      correctiveAction: 'Enregistrer l\'entreprise auprès de la DGI et obtenir un IFU valide',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

/** A3: Agrément ministère du Commerce valide (10 pts) */
export class RuleA3_AgrementValid implements IComplianceRule {
  readonly id = 'rule-a3';
  readonly code = 'A3';
  readonly category: RuleCategory = 'A_REGISTRATION';
  readonly description = 'Agrément du ministère du Commerce et de l\'Industrie valide';
  readonly points = 10;
  readonly severity = ComplianceSeverity.BLOCKER;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR];
  readonly evidenceRequired = 'Arrêté d\'agrément du ministère';

  evaluate(ctx: RuleContext): RuleResult {
    const actor = ctx.actor;
    const hasAgreement = actor.agreementStatus === 'APPROVED';
    const notExpired = !!actor.agreementExpiresAt && actor.agreementExpiresAt > (ctx.referenceDate ?? new Date());
    const isValid = hasAgreement && notExpired && !!actor.agreementNumber;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: isValid ? this.points : 0,
      isCompliant: isValid,
      severity: this.severity,
      observedValue: hasAgreement
        ? `Agrément ${actor.agreementNumber} — expire le ${actor.agreementExpiresAt?.toISOString().slice(0, 10)}`
        : `Statut: ${actor.agreementStatus ?? 'non déposé'}`,
      expectedValue: 'Agrément APPROVED avec numéro valide et non expiré',
      gapDescription: isValid ? undefined : 'Agrément manquant, non approuvé ou expiré',
      correctiveAction: 'Déposer une demande d\'agrément auprès du ministère du Commerce ou renouveler l\'agrément expiré',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

/** A4: Licence d'importation (pour importateurs) (5 pts) */
export class RuleA4_ImportLicense implements IComplianceRule {
  readonly id = 'rule-a4';
  readonly code = 'A4';
  readonly category: RuleCategory = 'A_REGISTRATION';
  readonly description = 'Licence d\'importation de véhicules deux-roues valide';
  readonly points = 5;
  readonly severity = ComplianceSeverity.CRITICAL;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR];
  readonly evidenceRequired = 'Licence d\'importation délivrée par la DGD';

  evaluate(ctx: RuleContext): RuleResult {
    const actor = ctx.actor;
    const doc = ctx.documents?.find(d =>
      d.documentType === 'LICENCE_IMPORTATION' && d.isVerified
    );
    const hasLicense = !!doc;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: hasLicense ? this.points : 0,
      isCompliant: hasLicense,
      severity: this.severity,
      observedValue: hasLicense ? 'Licence d\'importation vérifiée' : 'Licence d\'importation manquante',
      expectedValue: 'Licence d\'importation en cours de validité',
      gapDescription: hasLicense ? undefined : 'Licence d\'importation non déposée ou non vérifiée',
      correctiveAction: 'Obtenir une licence d\'importation auprès de la Direction Générale des Douanes',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

/** A5: Enregistrement dans le délai de 30 jours (5 pts) */
export class RuleA5_RegistrationDelay implements IComplianceRule {
  readonly id = 'rule-a5';
  readonly code = 'A5';
  readonly category: RuleCategory = 'A_REGISTRATION';
  readonly description = 'Enregistrement dans le système dans le délai de 30 jours après début d\'activité';
  readonly points = 5;
  readonly severity = ComplianceSeverity.WARNING;
  readonly applicableActorTypes = Object.values(ActorType);
  readonly evidenceRequired = 'Date de création de l\'entreprise';

  evaluate(ctx: RuleContext): RuleResult {
    const actor = ctx.actor;
    const createdAt = actor.createdAt;
    const refDate = ctx.referenceDate ?? new Date();
    const daysSinceCreation = Math.floor((refDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const isWithinDelay = daysSinceCreation <= 30;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: isWithinDelay ? this.points : 0,
      isCompliant: isWithinDelay,
      severity: this.severity,
      observedValue: `Enregistré depuis ${daysSinceCreation} jours`,
      expectedValue: 'Enregistrement dans les 30 jours',
      gapDescription: isWithinDelay ? undefined : `Enregistrement tardif (${daysSinceCreation} jours)`,
      correctiveAction: 'Procéder à l\'enregistrement immédiat dans iReg Moto BF',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

// ============================================================================
// CATÉGORIE B — Locaux et Infrastructure (25 points)
// ============================================================================

/** B1: Local commercial déclaré et conforme (5 pts) */
export class RuleB1_CommercialPremises implements IComplianceRule {
  readonly id = 'rule-b1';
  readonly code = 'B1';
  readonly category: RuleCategory = 'B_PREMISES';
  readonly description = 'Local commercial déclaré et conforme aux normes';
  readonly points = 5;
  readonly severity = ComplianceSeverity.CRITICAL;
  readonly applicableActorTypes = Object.values(ActorType);
  readonly evidenceRequired = 'Attestation de localisation, plan du local';

  evaluate(ctx: RuleContext): RuleResult {
    const actor = ctx.actor;
    const hasAddress = !!actor.addressLine1 && actor.addressLine1.length > 5;
    const hasGps = !!actor.gpsCoordinates;
    const isValid = hasAddress && hasGps;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: isValid ? this.points : 0,
      isCompliant: isValid,
      severity: this.severity,
      observedValue: hasAddress
        ? `Adresse: ${actor.addressLine1}${hasGps ? ' (GPS renseigné)' : ' (GPS manquant)'}`
        : 'Adresse commerciale non déclarée',
      expectedValue: 'Adresse complète avec coordonnées GPS',
      gapDescription: isValid ? undefined : 'Local commercial non déclaré ou coordonnées GPS manquantes',
      correctiveAction: 'Déclarer le local commercial avec coordonnées GPS et plan d\'aménagement',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

/** B2: Entrepôt sécurisé avec inventaire physique (5 pts) */
export class RuleB2_SecureWarehouse implements IComplianceRule {
  readonly id = 'rule-b2';
  readonly code = 'B2';
  readonly category: RuleCategory = 'B_PREMISES';
  readonly description = 'Entrepôt sécurisé avec système d\'inventaire physique';
  readonly points = 5;
  readonly severity = ComplianceSeverity.CRITICAL;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR];
  readonly evidenceRequired = 'Photos de l\'entrepôt, fiche de sécurité';

  evaluate(ctx: RuleContext): RuleResult {
    const warehouses = ctx.warehouses ?? [];
    const actorWarehouses = warehouses.filter(w => w.actorId === ctx.actor.id && w.isActive);
    const hasWarehouse = actorWarehouses.length > 0;
    const hasSecure = actorWarehouses.some(w =>
      w.securityLevel === 'RENFORCE' || w.securityLevel === 'HAUTE'
    );
    const isValid = hasWarehouse && hasSecure;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: isValid ? this.points : 0,
      isCompliant: isValid,
      severity: this.severity,
      observedValue: hasWarehouse
        ? `${actorWarehouses.length} entrepôt(s)${hasSecure ? ' dont au moins 1 sécurisé' : ' aucun sécurisé'}`
        : 'Aucun entrepôt déclaré',
      expectedValue: 'Au moins un entrepôt avec sécurité renforcée',
      gapDescription: isValid ? undefined : 'Entrepôt manquant ou sécurité insuffisante',
      correctiveAction: 'Aménager un entrepôt sécurisé (clôture, gardiennage, système de stockage)',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

/** B3: Système informatique de traçabilité (5 pts) */
export class RuleB3_TraceabilitySystem implements IComplianceRule {
  readonly id = 'rule-b3';
  readonly code = 'B3';
  readonly category: RuleCategory = 'B_PREMISES';
  readonly description = 'Système informatique de traçabilité des engins opérationnel';
  readonly points = 5;
  readonly severity = ComplianceSeverity.CRITICAL;
  readonly applicableActorTypes = Object.values(ActorType);
  readonly evidenceRequired = 'Capture d\'écran du système, certificat logiciel';

  evaluate(ctx: RuleContext): RuleResult {
    const actor = ctx.actor;
    const hasSystem = !!actor.metadata?.['hasTraceabilitySystem'];
    const vehiclesTracked = (ctx.vehicles ?? []).filter(v =>
      v.currentOwnerActorId === actor.id && !!v.vin
    ).length;
    const isValid = hasSystem || vehiclesTracked > 0;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: isValid ? this.points : 0,
      isCompliant: isValid,
      severity: this.severity,
      observedValue: hasSystem
        ? 'Système de traçabilité déclaré'
        : `${vehiclesTracked} véhicule(s) avec VIN enregistré(s)`,
      expectedValue: 'Système informatique de suivi des stocks et ventes',
      gapDescription: isValid ? undefined : 'Aucun système de traçabilité détecté',
      correctiveAction: 'S\'enregistrer sur iReg Moto BF et utiliser le module de traçabilité',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

/** B4: Connexion internet pour reporting (5 pts) */
export class RuleB4_InternetConnection implements IComplianceRule {
  readonly id = 'rule-b4';
  readonly code = 'B4';
  readonly category: RuleCategory = 'B_PREMISES';
  readonly description = 'Connexion internet fonctionnelle pour le reporting réglementaire';
  readonly points = 5;
  readonly severity = ComplianceSeverity.WARNING;
  readonly applicableActorTypes = Object.values(ActorType);
  readonly evidenceRequired = 'Attestation de connexion internet ou forfait data';

  evaluate(ctx: RuleContext): RuleResult {
    const actor = ctx.actor;
    const hasInternet = !!actor.metadata?.['hasInternetConnection'];
    const lastReportDate = ctx.quarterlyReports?.[ctx.quarterlyReports.length - 1]?.submittedAt;
    const recentReport = lastReportDate
      ? ((ctx.referenceDate ?? new Date()).getTime() - lastReportDate.getTime()) / (1000 * 60 * 60 * 24) < 120
      : false;
    const isValid = hasInternet || recentReport;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: isValid ? this.points : 0,
      isCompliant: isValid,
      severity: this.severity,
      observedValue: hasInternet ? 'Connexion internet confirmée' : (recentReport ? 'Reporting récent (connexion implicite)' : 'Connexion non confirmée'),
      expectedValue: 'Accès internet permanent pour soumission des rapports',
      gapDescription: isValid ? undefined : 'Aucune connexion internet déclarée',
      correctiveAction: 'Souscrire à une connexion internet ou un forfait mobile data',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

/** B5: Unité de montage agréée (pour assembleurs) (5 pts) */
export class RuleB5_AssemblyUnit implements IComplianceRule {
  readonly id = 'rule-b5';
  readonly code = 'B5';
  readonly category: RuleCategory = 'B_PREMISES';
  readonly description = 'Unité de montage/assemblage agréée par le ministère';
  readonly points = 5;
  readonly severity = ComplianceSeverity.BLOCKER;
  readonly applicableActorTypes = [ActorType.ASSEMBLEUR];
  readonly evidenceRequired = 'Certificat d\'agrément de l\'unité de montage';

  evaluate(ctx: RuleContext): RuleResult {
    const doc = ctx.documents?.find(d =>
      d.documentType === 'CERT_ASSEMBLY_UNIT' && d.isVerified
    );
    const isValid = !!doc;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: isValid ? this.points : 0,
      isCompliant: isValid,
      severity: this.severity,
      observedValue: isValid ? 'Unité de montage agréée (certificat vérifié)' : 'Aucune unité de montage agréée',
      expectedValue: 'Unité de montage certifiée et agréée',
      gapDescription: isValid ? undefined : 'Certificat d\'agrément de l\'unité de montage manquant',
      correctiveAction: 'Faire certifier son unité de montage par le ministère de l\'Industrie',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

// ============================================================================
// CATÉGORIE C — Gestion des Stocks (25 points)
// ============================================================================

/** C1: Enregistrement VIN/numéro de série pour chaque engin (5 pts) */
export class RuleC1_VinRegistration implements IComplianceRule {
  readonly id = 'rule-c1';
  readonly code = 'C1';
  readonly category: RuleCategory = 'C_STOCK_MANAGEMENT';
  readonly description = 'Numéro VIN et numéro de série enregistrés pour chaque engin';
  readonly points = 5;
  readonly severity = ComplianceSeverity.CRITICAL;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR, ActorType.DETAILLANT];
  readonly evidenceRequired = 'Fichier VIN de tous les engins en stock';

  evaluate(ctx: RuleContext): RuleResult {
    const actorVehicles = (ctx.vehicles ?? []).filter(v =>
      v.currentOwnerActorId === ctx.actor.id && (v.status === 'IN_STOCK' || v.status === 'IMPORTED')
    );
    const totalVehicles = actorVehicles.length;
    const vehiclesWithVin = actorVehicles.filter(v =>
      !!v.vin && v.vin.length === 17
    ).length;
    const complianceRate = totalVehicles > 0 ? vehiclesWithVin / totalVehicles : 1;
    const isValid = complianceRate >= 0.95; // 95% threshold

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: isValid ? this.points : Math.round(this.points * complianceRate),
      isCompliant: isValid,
      severity: this.severity,
      observedValue: `${vehiclesWithVin}/${totalVehicles} engins avec VIN valide (${(complianceRate * 100).toFixed(1)}%)`,
      expectedValue: '100% des engins avec VIN enregistré (17 caractères ISO 3780)',
      gapDescription: complianceRate >= 1 ? undefined : `${totalVehicles - vehiclesWithVin} engin(s) sans VIN valide`,
      correctiveAction: 'Enregistrer le VIN de chaque engin dans le système iReg Moto BF',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

/** C2: Vérification conformité modèles (non interdits depuis 2022) (5 pts) */
export class RuleC2_ModelCompliance implements IComplianceRule {
  readonly id = 'rule-c2';
  readonly code = 'C2';
  readonly category: RuleCategory = 'C_STOCK_MANAGEMENT';
  readonly description = 'Aucun modèle interdit depuis 2022 dans le stock';
  readonly points = 5;
  readonly severity = ComplianceSeverity.BLOCKER;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR, ActorType.DETAILLANT];
  readonly evidenceRequired = 'Liste des modèles avec attestation de conformité';

  evaluate(ctx: RuleContext): RuleResult {
    const actor = ctx.actor;
    const actorVehicles = (ctx.vehicles ?? []).filter(v =>
      v.currentOwnerActorId === actor.id
    );
    const blacklistedManager = ctx.blacklistManager;

    let forbiddenCount = 0;
    if (blacklistedManager) {
      // Async check would be in service layer; here we check basic category
      forbiddenCount = actorVehicles.filter(v => v.categoryCode === 'INTERDITE').length;
    } else {
      forbiddenCount = actorVehicles.filter(v => v.categoryCode === 'INTERDITE').length;
    }

    const isValid = forbiddenCount === 0;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: isValid ? this.points : 0,
      isCompliant: isValid,
      severity: this.severity,
      observedValue: isValid
        ? 'Aucun modèle interdétecté'
        : `${forbiddenCount} modèle(s) interdit(s) détecté(s)`,
      expectedValue: 'Zéro modèle interdit en stock',
      gapDescription: isValid ? undefined : 'Présence de modèles interdits dans le stock',
      correctiveAction: 'Retirer immédiatement les modèles interdits et les déclarer au ministère',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

/** C3: Inventaire physique trimestriel (5 pts) */
export class RuleC3_QuarterlyInventory implements IComplianceRule {
  readonly id = 'rule-c3';
  readonly code = 'C3';
  readonly category: RuleCategory = 'C_STOCK_MANAGEMENT';
  readonly description = 'Inventaire physique réalisé au moins une fois par trimestre';
  readonly points = 5;
  readonly severity = ComplianceSeverity.WARNING;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR];
  readonly evidenceRequired = 'Rapport d\'inventaire signé';

  evaluate(ctx: RuleContext): RuleResult {
    const refDate = ctx.referenceDate ?? new Date();
    const threeMonthsAgo = new Date(refDate);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentInventories = (ctx.inventoryCounts ?? []).filter(inv =>
      inv.actorId === ctx.actor.id &&
      inv.completedAt &&
      inv.completedAt >= threeMonthsAgo
    );
    const isValid = recentInventories.length > 0;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: isValid ? this.points : 0,
      isCompliant: isValid,
      severity: this.severity,
      observedValue: isValid
        ? `Dernier inventaire: ${recentInventories[0].completedAt!.toISOString().slice(0, 10)}`
        : 'Aucun inventaire réalisé dans les 3 derniers mois',
      expectedValue: 'Inventaire physique dans les 3 derniers mois',
      gapDescription: isValid ? undefined : 'Inventaire trimestriel non réalisé',
      correctiveAction: 'Planifier et réaliser un inventaire physique complet du stock',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

/** C4: QR code ou RFID sur chaque unité (5 pts) */
export class RuleC4_QrOrRfid implements IComplianceRule {
  readonly id = 'rule-c4';
  readonly code = 'C4';
  readonly category: RuleCategory = 'C_STOCK_MANAGEMENT';
  readonly description = 'QR code ou tag RFID apposé sur chaque unité en stock';
  readonly points = 5;
  readonly severity = ComplianceSeverity.CRITICAL;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR, ActorType.DETAILLANT];
  readonly evidenceRequired = 'Photos d\'engins avec QR code visible';

  evaluate(ctx: RuleContext): RuleResult {
    const actorVehicles = (ctx.vehicles ?? []).filter(v =>
      v.currentOwnerActorId === ctx.actor.id && (v.status === 'IN_STOCK' || v.status === 'IMPORTED')
    );
    const totalVehicles = actorVehicles.length;
    const taggedVehicles = actorVehicles.filter(v => !!v.qrCode || !!v.rfidTag).length;
    const complianceRate = totalVehicles > 0 ? taggedVehicles / totalVehicles : 1;
    const isValid = complianceRate >= 0.95;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: isValid ? this.points : Math.round(this.points * complianceRate),
      isCompliant: isValid,
      severity: this.severity,
      observedValue: `${taggedVehicles}/${totalVehicles} engins tagués (${(complianceRate * 100).toFixed(1)}%)`,
      expectedValue: '100% des engins avec QR code ou RFID',
      gapDescription: complianceRate >= 1 ? undefined : `${totalVehicles - taggedVehicles} engin(s) sans QR/RFID`,
      correctiveAction: 'Générer et apposer des QR codes sur tous les engins via le système iReg Moto BF',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

/** C5: Reconciliation stock physique vs système (5 pts) */
export class RuleC5_StockReconciliation implements IComplianceRule {
  readonly id = 'rule-c5';
  readonly code = 'C5';
  readonly category: RuleCategory = 'C_STOCK_MANAGEMENT';
  readonly description = 'Réconciliation entre stock physique et stock système';
  readonly points = 5;
  readonly severity = ComplianceSeverity.WARNING;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR];
  readonly evidenceRequired = 'Rapport de réconciliation signé';

  evaluate(ctx: RuleContext): RuleResult {
    const recentInventories = (ctx.inventoryCounts ?? []).filter(inv =>
      inv.actorId === ctx.actor.id && inv.status === 'RECONCILED'
    );
    const lastInventory = recentInventories[recentInventories.length - 1];
    const isValid = !!lastInventory && lastInventory.discrepancyUnits === 0;
    const noDiscrepancy = !lastInventory || lastInventory.discrepancyUnits === 0;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: noDiscrepancy ? this.points : Math.max(0, this.points - Math.abs(lastInventory!.discrepancyUnits)),
      isCompliant: isValid,
      severity: this.severity,
      observedValue: lastInventory
        ? `Dernière reco: ${lastInventory.discrepancyUnits} écart(s)`
        : 'Aucune réconciliation effectuée',
      expectedValue: 'Stock physique = Stock système (0 écart)',
      gapDescription: noDiscrepancy ? undefined : `Écart de ${Math.abs(lastInventory!.discrepancyUnits)} unité(s) détecté`,
      correctiveAction: 'Investiger et corriger les écarts de stock, mettre à jour le système',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

// ============================================================================
// CATÉGORIE D — Registre Clients (25 points)
// ============================================================================

/** D1: Identité complète avec pièce d'identité valide (5 pts) */
export class RuleD1_ClientIdentity implements IComplianceRule {
  readonly id = 'rule-d1';
  readonly code = 'D1';
  readonly category: RuleCategory = 'D_CLIENT_REGISTRY';
  readonly description = 'Identité complète du client avec pièce d\'identité valide';
  readonly points = 5;
  readonly severity = ComplianceSeverity.CRITICAL;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR, ActorType.DETAILLANT];
  readonly evidenceRequired = 'Copie de la pièce d\'identité du client';

  evaluate(ctx: RuleContext): RuleResult {
    const actor = ctx.actor;
    const actorClients = (ctx.clients ?? []).filter(c =>
      c.registeredByActorId === actor.id
    );
    const totalClients = actorClients.length;
    if (totalClients === 0) {
      return {
        ruleId: this.id, category: this.category, ruleCode: this.code,
        description: this.description, points: this.points, pointsEarned: this.points,
        isCompliant: true, severity: this.severity,
        observedValue: 'Aucun client enregistré (pas de vente)',
        expectedValue: 'KYC complet pour chaque client', evidenceRequired: this.evidenceRequired,
        evaluatedAt: new Date(),
      };
    }
    const validClients = actorClients.filter(c =>
      !!c.idDocumentNumber && c.idDocumentNumber.length >= 5 &&
      !!c.idDocumentType && (!c.idDocumentExpiresAt || c.idDocumentExpiresAt > new Date())
    ).length;
    const complianceRate = validClients / totalClients;
    const isValid = complianceRate >= 0.95;

    return {
      ruleId: this.id,
      category: this.category,
      ruleCode: this.code,
      description: this.description,
      points: this.points,
      pointsEarned: isValid ? this.points : Math.round(this.points * complianceRate),
      isCompliant: isValid,
      severity: this.severity,
      observedValue: `${validClients}/${totalClients} clients avec ID valide (${(complianceRate * 100).toFixed(1)}%)`,
      expectedValue: '100% des clients avec pièce d\'identité valide',
      gapDescription: complianceRate >= 1 ? undefined : `${totalClients - validClients} client(s) avec ID invalide`,
      correctiveAction: 'Vérifier et compléter les pièces d\'identité de tous les clients',
      evidenceRequired: this.evidenceRequired,
      evaluatedAt: new Date(),
    };
  }
}

/** D2: Photo de l'acheteur archivée (5 pts) */
export class RuleD2_BuyerPhoto implements IComplianceRule {
  readonly id = 'rule-d2';
  readonly code = 'D2';
  readonly category: RuleCategory = 'D_CLIENT_REGISTRY';
  readonly description = 'Photo de l\'acheteur archivée dans le système';
  readonly points = 5;
  readonly severity = ComplianceSeverity.WARNING;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR, ActorType.DETAILLANT];
  readonly evidenceRequired = 'Photos des acheteurs';

  evaluate(ctx: RuleContext): RuleResult {
    const actorClients = (ctx.clients ?? []).filter(c =>
      c.registeredByActorId === ctx.actor.id
    );
    const totalClients = actorClients.length;
    if (totalClients === 0) {
      return {
        ruleId: this.id, category: this.category, ruleCode: this.code,
        description: this.description, points: this.points, pointsEarned: this.points,
        isCompliant: true, severity: this.severity,
        observedValue: 'Aucun client', expectedValue: 'Photo archivée',
        evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
      };
    }
    const clientsWithPhoto = actorClients.filter(c => !!c.photoUrl || c.biometricEnrolled).length;
    const complianceRate = clientsWithPhoto / totalClients;
    const isValid = complianceRate >= 0.90;

    return {
      ruleId: this.id, category: this.category, ruleCode: this.code,
      description: this.description, points: this.points,
      pointsEarned: isValid ? this.points : Math.round(this.points * complianceRate),
      isCompliant: isValid, severity: this.severity,
      observedValue: `${clientsWithPhoto}/${totalClients} clients avec photo (${(complianceRate * 100).toFixed(1)}%)`,
      expectedValue: '90%+ des clients avec photo archivée',
      gapDescription: complianceRate >= 0.9 ? undefined : `${totalClients - clientsWithPhoto} client(s) sans photo`,
      correctiveAction: 'Photographier chaque acheteur lors de la vente et archiver dans iReg Moto BF',
      evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
    };
  }
}

/** D3: Liaison acheteur-engin systématique (5 pts) */
export class RuleD3_BuyerVehicleLink implements IComplianceRule {
  readonly id = 'rule-d3';
  readonly code = 'D3';
  readonly category: RuleCategory = 'D_CLIENT_REGISTRY';
  readonly description = 'Liaion systématique entre acheteur et engin acheté';
  readonly points = 5;
  readonly severity = ComplianceSeverity.CRITICAL;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR, ActorType.DETAILLANT];
  readonly evidenceRequired = 'Extrait du registre des ventes avec VIN et ID client';

  evaluate(ctx: RuleContext): RuleResult {
    const actorSales = (ctx.sales ?? []).filter(s =>
      s.actorId === ctx.actor.id && s.status === 'PAID'
    );
    const totalSales = actorSales.length;
    if (totalSales === 0) {
      return {
        ruleId: this.id, category: this.category, ruleCode: this.code,
        description: this.description, points: this.points, pointsEarned: this.points,
        isCompliant: true, severity: this.severity,
        observedValue: 'Aucune vente', expectedValue: 'Liaison acheteur-engin',
        evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
      };
    }
    const linkedSales = actorSales.filter(s =>
      s.items && s.items.length > 0 && !!s.clientId
    ).length;
    const complianceRate = linkedSales / totalSales;
    const isValid = complianceRate >= 0.98;

    return {
      ruleId: this.id, category: this.category, ruleCode: this.code,
      description: this.description, points: this.points,
      pointsEarned: isValid ? this.points : Math.round(this.points * complianceRate),
      isCompliant: isValid, severity: this.severity,
      observedValue: `${linkedSales}/${totalSales} ventes liées (${(complianceRate * 100).toFixed(1)}%)`,
      expectedValue: '100% des ventes avec liaison acheteur-engin',
      gapDescription: complianceRate >= 0.98 ? undefined : `${totalSales - linkedSales} vente(s) sans liaison`,
      correctiveAction: 'S\'assurer que chaque vente enregistre le VIN et l\'identifiant client',
      evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
    };
  }
}

/** D4: Registre exhaustif soumis trimestriellement (5 pts) */
export class RuleD4_QuarterlyRegistry implements IComplianceRule {
  readonly id = 'rule-d4';
  readonly code = 'D4';
  readonly category: RuleCategory = 'D_CLIENT_REGISTRY';
  readonly description = 'Registre clients exhaustif soumis au ministère chaque trimestre';
  readonly points = 5;
  readonly severity = ComplianceSeverity.CRITICAL;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR, ActorType.DETAILLANT];
  readonly evidenceRequired = 'Accusé de réception du registre clients';

  evaluate(ctx: RuleContext): RuleResult {
    const actorClients = (ctx.clients ?? []).filter(c =>
      c.registeredByActorId === ctx.actor.id
    );
    const hasClients = actorClients.length > 0;
    const hasSubmittedReport = (ctx.quarterlyReports ?? []).some(r =>
      r.actorId === ctx.actor.id && r.status === 'SUBMITTED'
    );
    const isValid = !hasClients || hasSubmittedReport;

    return {
      ruleId: this.id, category: this.category, ruleCode: this.code,
      description: this.description, points: this.points,
      pointsEarned: isValid ? this.points : 0,
      isCompliant: isValid, severity: this.severity,
      observedValue: hasSubmittedReport ? 'Registre soumis' : (hasClients ? 'Registre non soumis' : 'Aucun client'),
      expectedValue: 'Registre clients trimestriel soumis',
      gapDescription: isValid ? undefined : 'Registre clients non soumis au trimestre en cours',
      correctiveAction: 'Soumettre le registre clients via le module de rapportage trimestriel',
      evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
    };
  }
}

/** D5: Conservation archives 5 ans (5 pts) */
export class RuleD5_ArchiveRetention implements IComplianceRule {
  readonly id = 'rule-d5';
  readonly code = 'D5';
  readonly category: RuleCategory = 'D_CLIENT_REGISTRY';
  readonly description = 'Archives clients et ventes conservées 5 ans minimum';
  readonly points = 5;
  readonly severity = ComplianceSeverity.WARNING;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR, ActorType.DETAILLANT];
  readonly evidenceRequired = 'Politique de rétention documentaire';

  evaluate(ctx: RuleContext): RuleResult {
    const actor = ctx.actor;
    const hasPolicy = !!actor.metadata?.['hasArchivePolicy'];
    const oldRecords = (ctx.sales ?? []).some(s =>
      s.actorId === actor.id &&
      s.saleDate < new Date(Date.now() - 4 * 365 * 24 * 60 * 60 * 1000)
    );
    const isValid = hasPolicy || oldRecords;

    return {
      ruleId: this.id, category: this.category, ruleCode: this.code,
      description: this.description, points: this.points,
      pointsEarned: isValid ? this.points : 0,
      isCompliant: isValid, severity: this.severity,
      observedValue: hasPolicy ? 'Politique de rétention définie' : (oldRecords ? 'Données anciennes présentes' : 'Rétention non confirmée'),
      expectedValue: 'Archives conservées 5 ans (support numérique accepté)',
      gapDescription: isValid ? undefined : 'Politique de conservation des archives non définie',
      correctiveAction: 'Mettre en place une politique de rétention de 5 ans minimum avec sauvegarde numérique',
      evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
    };
  }
}

// ============================================================================
// CATÉGORIE E — Prix et Facturation (20 points)
// ============================================================================

/** E1: Prix d'achat enregistré (5 pts) */
export class RuleE1_PurchasePriceRecorded implements IComplianceRule {
  readonly id = 'rule-e1';
  readonly code = 'E1';
  readonly category: RuleCategory = 'E_PRICING';
  readonly description = 'Prix d\'achat enregistré pour chaque engin';
  readonly points = 5;
  readonly severity = ComplianceSeverity.WARNING;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR, ActorType.DETAILLANT];
  readonly evidenceRequired = 'Factures d\'achat';

  evaluate(ctx: RuleContext): RuleResult {
    const actorPurchases = (ctx.purchasePrices ?? []).filter(pp =>
      pp.actorId === ctx.actor.id && pp.isActive
    );
    const hasPrices = actorPurchases.length > 0;

    return {
      ruleId: this.id, category: this.category, ruleCode: this.code,
      description: this.description, points: this.points,
      pointsEarned: hasPrices ? this.points : 0,
      isCompliant: hasPrices, severity: this.severity,
      observedValue: hasPrices ? `${actorPurchases.length} prix d'achat enregistré(s)` : 'Aucun prix d\'achat',
      expectedValue: 'Prix d\'achat enregistré pour chaque référence',
      gapDescription: hasPrices ? undefined : 'Prix d\'achat non enregistrés',
      correctiveAction: 'Enregistrer les prix d\'achat dans le système pour chaque réception de stock',
      evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
    };
  }
}

/** E2: Prix de vente déclaré (5 pts) */
export class RuleE2_SellingPriceDeclared implements IComplianceRule {
  readonly id = 'rule-e2';
  readonly code = 'E2';
  readonly category: RuleCategory = 'E_PRICING';
  readonly description = 'Prix de vente déclaré pour chaque transaction';
  readonly points = 5;
  readonly severity = ComplianceSeverity.WARNING;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR, ActorType.DETAILLANT];
  readonly evidenceRequired = 'Factures de vente';

  evaluate(ctx: RuleContext): RuleResult {
    const actorSales = (ctx.sales ?? []).filter(s =>
      s.actorId === ctx.actor.id && s.status === 'PAID'
    );
    const totalSales = actorSales.length;
    if (totalSales === 0) {
      return {
        ruleId: this.id, category: this.category, ruleCode: this.code,
        description: this.description, points: this.points, pointsEarned: this.points,
        isCompliant: true, severity: this.severity,
        observedValue: 'Aucune vente', expectedValue: 'Prix de vente déclaré',
        evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
      };
    }
    const declaredSales = actorSales.filter(s => s.totalAmount > 0).length;
    const isValid = declaredSales === totalSales;

    return {
      ruleId: this.id, category: this.category, ruleCode: this.code,
      description: this.description, points: this.points,
      pointsEarned: isValid ? this.points : Math.round(this.points * (declaredSales / totalSales)),
      isCompliant: isValid, severity: this.severity,
      observedValue: `${declaredSales}/${totalSales} ventes avec prix déclaré`,
      expectedValue: '100% des ventes avec prix déclaré',
      gapDescription: isValid ? undefined : `${totalSales - declaredSales} vente(s) sans prix`,
      correctiveAction: 'Déclarer le prix de vente sur chaque facture',
      evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
    };
  }
}

/** E3: Facturation normalisée avec N° agrément (5 pts) */
export class RuleE3_StandardizedInvoicing implements IComplianceRule {
  readonly id = 'rule-e3';
  readonly code = 'E3';
  readonly category: RuleCategory = 'E_PRICING';
  readonly description = 'Facturation normalisée avec numéro d\'agrément';
  readonly points = 5;
  readonly severity = ComplianceSeverity.CRITICAL;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR, ActorType.DETAILLANT];
  readonly evidenceRequired = 'Modèle de facture conforme';

  evaluate(ctx: RuleContext): RuleResult {
    const actor = ctx.actor;
    const hasAgreement = !!actor.agreementNumber;
    const actorSales = (ctx.sales ?? []).filter(s =>
      s.actorId === actor.id && s.status === 'PAID'
    );
    const totalSales = actorSales.length;
    if (totalSales === 0) {
      return {
        ruleId: this.id, category: this.category, ruleCode: this.code,
        description: this.description, points: this.points, pointsEarned: this.points,
        isCompliant: true, severity: this.severity,
        observedValue: 'Aucune vente', expectedValue: 'Facturation normalisée',
        evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
      };
    }
    const hasInvoice = actorSales.filter(s => !!s.metadata?.['invoiceNumber']).length;
    const complianceRate = hasInvoice / totalSales;
    const isValid = hasAgreement && complianceRate >= 0.95;

    return {
      ruleId: this.id, category: this.category, ruleCode: this.code,
      description: this.description, points: this.points,
      pointsEarned: isValid ? this.points : Math.round(this.points * complianceRate),
      isCompliant: isValid, severity: this.severity,
      observedValue: `${hasInvoice}/${totalSales} factures émises (${(complianceRate * 100).toFixed(1)}%)`,
      expectedValue: '95%+ des ventes avec facture normalisée et N° agrément',
      gapDescription: isValid ? undefined : 'Facturation non conforme ou agrément non indiqué',
      correctiveAction: 'Utiliser le modèle de facture iReg Moto BF avec mention du N° agrément',
      evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
    };
  }
}

/** E4: Marges conformes (écart < 20%) (5 pts) */
export class RuleE4_MarginCompliance implements IComplianceRule {
  readonly id = 'rule-e4';
  readonly code = 'E4';
  readonly category: RuleCategory = 'E_PRICING';
  readonly description = 'Marges de vente conformes (écart < 20% par rapport à la moyenne sectorielle)';
  readonly points = 5;
  readonly severity = ComplianceSeverity.WARNING;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR, ActorType.DETAILLANT];
  readonly evidenceRequired = 'Tableau de suivi des marges';

  evaluate(ctx: RuleContext): RuleResult {
    const actorSales = (ctx.sales ?? []).filter(s =>
      s.actorId === ctx.actor.id && s.status === 'PAID'
    );
    const totalSales = actorSales.length;
    if (totalSales === 0) {
      return {
        ruleId: this.id, category: this.category, ruleCode: this.code,
        description: this.description, points: this.points, pointsEarned: this.points,
        isCompliant: true, severity: this.severity,
        observedValue: 'Aucune vente', expectedValue: 'Marges conformes',
        evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
      };
    }

    // Calculate average margin from sales
    const margins: number[] = [];
    for (const sale of actorSales) {
      for (const item of sale.items) {
        if (item.unitCost && item.unitPrice > 0) {
          const marginRate = (item.unitPrice - item.unitCost) / item.unitPrice;
          margins.push(marginRate);
        }
      }
    }

    if (margins.length === 0) {
      return {
        ruleId: this.id, category: this.category, ruleCode: this.code,
        description: this.description, points: this.points, pointsEarned: this.points,
        isCompliant: true, severity: this.severity,
        observedValue: 'Données de marge insuffisantes', expectedValue: 'Marges conformes',
        evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
      };
    }

    const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
    // Margin should be between 5% and 50% (reasonable range)
    const isValid = avgMargin >= 0.05 && avgMargin <= 0.50;

    return {
      ruleId: this.id, category: this.category, ruleCode: this.code,
      description: this.description, points: this.points,
      pointsEarned: isValid ? this.points : 0,
      isCompliant: isValid, severity: this.severity,
      observedValue: `Marge moyenne: ${(avgMargin * 100).toFixed(1)}%`,
      expectedValue: 'Marge entre 5% et 50%',
      gapDescription: isValid ? undefined : `Marge hors fourchette acceptable: ${(avgMargin * 100).toFixed(1)}%`,
      correctiveAction: 'Réviser la politique de prix pour respecter les marges sectorielles',
      evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
    };
  }
}

// ============================================================================
// CATÉGORIE F — Reporting (25 points)
// ============================================================================

/** F1: Rapport trimestriel soumis dans les délais (10 pts) */
export class RuleF1_TimelyReport implements IComplianceRule {
  readonly id = 'rule-f1';
  readonly code = 'F1';
  readonly category: RuleCategory = 'F_REPORTING';
  readonly description = 'Rapport trimestriel soumis dans les délais réglementaires';
  readonly points = 10;
  readonly severity = ComplianceSeverity.CRITICAL;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR];
  readonly evidenceRequired = 'Accusé de réception du rapport';

  evaluate(ctx: RuleContext): RuleResult {
    const refDate = ctx.referenceDate ?? new Date();
    const currentQuarter = Math.floor(refDate.getMonth() / 3) + 1;
    const currentYear = refDate.getFullYear();

    const report = (ctx.quarterlyReports ?? []).find(r =>
      r.actorId === ctx.actor.id && r.year === currentYear && r.quarter === `Q${currentQuarter}`
    );

    const isSubmitted = report?.status === 'SUBMITTED' || report?.status === 'APPROVED';
    const isOnTime = isSubmitted && !!report?.submittedAt;

    return {
      ruleId: this.id, category: this.category, ruleCode: this.code,
      description: this.description, points: this.points,
      pointsEarned: isSubmitted ? this.points : 0,
      isCompliant: isSubmitted, severity: this.severity,
      observedValue: isSubmitted
        ? `Rapport Q${currentQuarter}-${currentYear} soumis le ${report!.submittedAt!.toISOString().slice(0, 10)}`
        : `Rapport Q${currentQuarter}-${currentYear} non soumis`,
      expectedValue: 'Rapport trimestriel soumis avant le 15 du mois suivant le trimestre',
      gapDescription: isSubmitted ? undefined : `Rapport Q${currentQuarter}-${currentYear} manquant`,
      correctiveAction: 'Soumettre immédiatement le rapport trimestriel via iReg Moto BF',
      evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
    };
  }
}

/** F2: Données complètes et exactes (10 pts) */
export class RuleF2_CompleteAccurateData implements IComplianceRule {
  readonly id = 'rule-f2';
  readonly code = 'F2';
  readonly category: RuleCategory = 'F_REPORTING';
  readonly description = 'Données du rapport trimestriel complètes et exactes';
  readonly points = 10;
  readonly severity = ComplianceSeverity.CRITICAL;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR];
  readonly evidenceRequired = 'Rapport validé par le système';

  evaluate(ctx: RuleContext): RuleResult {
    const actor = ctx.actor;
    const reports = (ctx.quarterlyReports ?? []).filter(r =>
      r.actorId === actor.id && (r.status === 'SUBMITTED' || r.status === 'APPROVED')
    );

    if (reports.length === 0) {
      return {
        ruleId: this.id, category: this.category, ruleCode: this.code,
        description: this.description, points: this.points, pointsEarned: 0,
        isCompliant: false, severity: this.severity,
        observedValue: 'Aucun rapport soumis', expectedValue: 'Données complètes et exactes',
        gapDescription: 'Aucun rapport disponible pour validation',
        correctiveAction: 'Soumettre un rapport avec toutes les données requises',
        evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
      };
    }

    const lastReport = reports[reports.length - 1];
    const hasSalesData = lastReport.totalSalesCount >= 0 && lastReport.totalSalesAmount > 0;
    const hasStockData = lastReport.stockOpeningUnits >= 0 && lastReport.stockClosingUnits >= 0;
    const hasPurchaseData = lastReport.totalPurchasesCount >= 0;
    const isComplete = hasSalesData && hasStockData && hasPurchaseData;

    return {
      ruleId: this.id, category: this.category, ruleCode: this.code,
      description: this.description, points: this.points,
      pointsEarned: isComplete ? this.points : Math.round(this.points * 0.5),
      isCompliant: isComplete, severity: this.severity,
      observedValue: `Ventes: ${lastReport.totalSalesCount}, Stock: ${lastReport.stockClosingUnits}, Achats: ${lastReport.totalPurchasesCount}`,
      expectedValue: 'Toutes les rubriques renseignées (ventes, stock, achats, taxes)',
      gapDescription: isComplete ? undefined : 'Données incomplètes dans le dernier rapport',
      correctiveAction: 'Compléter toutes les rubriques du rapport trimestriel',
      evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
    };
  }
}

/** F3: Format XML + PDF conforme (5 pts) */
export class RuleF3_XmlPdfFormat implements IComplianceRule {
  readonly id = 'rule-f3';
  readonly code = 'F3';
  readonly category: RuleCategory = 'F_REPORTING';
  readonly description = 'Rapport au format XML structuré et PDF signé conforme au schéma XSD';
  readonly points = 5;
  readonly severity = ComplianceSeverity.WARNING;
  readonly applicableActorTypes = [ActorType.IMPORTATEUR, ActorType.DISTRIBUTEUR, ActorType.ASSEMBLEUR];
  readonly evidenceRequired = 'Fichiers XML et PDF générés';

  evaluate(ctx: RuleContext): RuleResult {
    const reports = (ctx.quarterlyReports ?? []).filter(r =>
      r.actorId === ctx.actor.id && (r.status === 'SUBMITTED' || r.status === 'APPROVED')
    );

    if (reports.length === 0) {
      return {
        ruleId: this.id, category: this.category, ruleCode: this.code,
        description: this.description, points: this.points, pointsEarned: 0,
        isCompliant: false, severity: this.severity,
        observedValue: 'Aucun rapport soumis', expectedValue: 'Format XML + PDF conforme',
        correctiveAction: 'Générer le rapport aux formats XML et PDF via iReg Moto BF',
        evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
      };
    }

    const lastReport = reports[reports.length - 1];
    const hasXml = !!lastReport.xmlReportPath;
    const hasPdf = !!lastReport.pdfReportPath;
    const isValid = hasXml && hasPdf;

    return {
      ruleId: this.id, category: this.category, ruleCode: this.code,
      description: this.description, points: this.points,
      pointsEarned: isValid ? this.points : (hasXml || hasPdf ? Math.round(this.points * 0.5) : 0),
      isCompliant: isValid, severity: this.severity,
      observedValue: `XML: ${hasXml ? 'OUI' : 'NON'}, PDF: ${hasPdf ? 'OUI' : 'NON'}`,
      expectedValue: 'Rapport au format XML + PDF signé',
      gapDescription: isValid ? undefined : 'Format de rapport incomplet',
      correctiveAction: 'Générer les deux formats (XML + PDF) via le générateur de rapports',
      evidenceRequired: this.evidenceRequired, evaluatedAt: new Date(),
    };
  }
}

// ============================================================================
// MOTEUR PRINCIPAL — Orquestreur d'évaluation
// ============================================================================

export interface IRegulatoryRulesEngine {
  evaluateCompliance(actorId: string, actorType: ActorType, ctx: RuleContext): ComplianceEvaluation;
  getApplicableRules(actorType: ActorType): IComplianceRule[];
  registerCustomRule(rule: IComplianceRule): void;
}

export class RegulatoryRulesEngine implements IRegulatoryRulesEngine {
  private registry: IRuleRegistry;
  private logger: StructuredLogger;

  constructor(options: { registry?: IRuleRegistry; logger?: StructuredLogger } = {}) {
    this.registry = options.registry ?? new RuleRegistry();
    this.logger = options.logger ?? new ConsoleLogger();
    this.registerDefaultRules();
  }

  private registerDefaultRules(): void {
    // Catégorie A — Enregistrement et Agrément (30 pts)
    this.registry.register(new RuleA1_RccmValid());
    this.registry.register(new RuleA2_IfuValid());
    this.registry.register(new RuleA3_AgrementValid());
    this.registry.register(new RuleA4_ImportLicense());
    this.registry.register(new RuleA5_RegistrationDelay());

    // Catégorie B — Locaux et Infrastructure (25 pts)
    this.registry.register(new RuleB1_CommercialPremises());
    this.registry.register(new RuleB2_SecureWarehouse());
    this.registry.register(new RuleB3_TraceabilitySystem());
    this.registry.register(new RuleB4_InternetConnection());
    this.registry.register(new RuleB5_AssemblyUnit());

    // Catégorie C — Gestion des Stocks (25 pts)
    this.registry.register(new RuleC1_VinRegistration());
    this.registry.register(new RuleC2_ModelCompliance());
    this.registry.register(new RuleC3_QuarterlyInventory());
    this.registry.register(new RuleC4_QrOrRfid());
    this.registry.register(new RuleC5_StockReconciliation());

    // Catégorie D — Registre Clients (25 pts)
    this.registry.register(new RuleD1_ClientIdentity());
    this.registry.register(new RuleD2_BuyerPhoto());
    this.registry.register(new RuleD3_BuyerVehicleLink());
    this.registry.register(new RuleD4_QuarterlyRegistry());
    this.registry.register(new RuleD5_ArchiveRetention());

    // Catégorie E — Prix et Facturation (20 pts)
    this.registry.register(new RuleE1_PurchasePriceRecorded());
    this.registry.register(new RuleE2_SellingPriceDeclared());
    this.registry.register(new RuleE3_StandardizedInvoicing());
    this.registry.register(new RuleE4_MarginCompliance());

    // Catégorie F — Reporting (25 pts)
    this.registry.register(new RuleF1_TimelyReport());
    this.registry.register(new RuleF2_CompleteAccurateData());
    this.registry.register(new RuleF3_XmlPdfFormat());

    this.logger.info('Default rules registered', { count: this.registry.getAllRules().length });
  }

  registerCustomRule(rule: IComplianceRule): void {
    this.registry.register(rule);
    this.logger.info('Custom rule registered', { ruleId: rule.id, code: rule.code });
  }

  getApplicableRules(actorType: ActorType): IComplianceRule[] {
    return this.registry.getRulesForActorType(actorType);
  }

  evaluateCompliance(
    actorId: string,
    actorType: ActorType,
    ctx: RuleContext,
  ): ComplianceEvaluation {
    const evaluatedAt = new Date();
    const referenceDate = ctx.referenceDate ?? evaluatedAt;

    this.logger.info('Starting compliance evaluation', { actorId, actorType, referenceDate });

    const rules = this.getApplicableRules(actorType);
    const ruleResults: RuleResult[] = [];

    for (const rule of rules) {
      try {
        const result = rule.evaluate(ctx);
        ruleResults.push(result);
      } catch (error) {
        this.logger.error(`Rule evaluation failed: ${rule.id}`, {
          error: error instanceof Error ? error.message : String(error),
        });
        // Push a failed result
        ruleResults.push({
          ruleId: rule.id,
          category: rule.category,
          ruleCode: rule.code,
          description: rule.description,
          points: rule.points,
          pointsEarned: 0,
          isCompliant: false,
          severity: rule.severity,
          observedValue: 'ERREUR D\'ÉVALUATION',
          expectedValue: rule.description,
          gapDescription: `Erreur technique lors de l'évaluation: ${error instanceof Error ? error.message : String(error)}`,
          correctiveAction: 'Contacter le support technique iReg Moto BF',
          evidenceRequired: rule.evidenceRequired,
          evaluatedAt: new Date(),
        });
      }
    }

    // Calculate totals
    const totalPoints = ruleResults.reduce((sum, r) => sum + r.points, 0);
    const pointsEarned = ruleResults.reduce((sum, r) => sum + r.pointsEarned, 0);
    const scorePercentage = totalPoints > 0 ? (pointsEarned / totalPoints) * 100 : 0;

    // Determine overall status
    let overallStatus: OverallComplianceStatus;
    if (scorePercentage >= 120 / 150 * 100) {
      overallStatus = OverallComplianceStatus.VERT;
    } else if (scorePercentage >= 90 / 150 * 100) {
      overallStatus = OverallComplianceStatus.ORANGE;
    } else {
      overallStatus = OverallComplianceStatus.ROUGE;
    }

    // Generate gaps list
    const gaps: ComplianceGap[] = ruleResults
      .filter(r => !r.isCompliant)
      .map(r => ({
        ruleId: r.ruleId,
        category: r.category,
        description: r.gapDescription ?? r.description,
        severity: r.severity,
        pointsAtStake: r.points - r.pointsEarned,
        deadline: this.calculateGapDeadline(r, referenceDate),
      }));

    // Generate action plan
    const actionPlan = this.generateActionPlan(gaps, referenceDate);

    this.logger.info('Compliance evaluation completed', {
      actorId,
      totalPoints,
      pointsEarned,
      scorePercentage: scorePercentage.toFixed(2),
      overallStatus,
      gapsCount: gaps.length,
    });

    return {
      actorId,
      actorType,
      evaluatedAt,
      referenceDate,
      ruleResults,
      totalPoints,
      pointsEarned,
      scorePercentage: Math.round(scorePercentage * 100) / 100,
      overallStatus,
      gaps,
      actionPlan,
    };
  }

  private calculateGapDeadline(result: RuleResult, referenceDate: Date): Date {
    const deadline = new Date(referenceDate);
    switch (result.severity) {
      case ComplianceSeverity.BLOCKER:
        deadline.setDate(deadline.getDate() + 7);
        break;
      case ComplianceSeverity.CRITICAL:
        deadline.setDate(deadline.getDate() + 15);
        break;
      case ComplianceSeverity.WARNING:
        deadline.setDate(deadline.getDate() + 30);
        break;
      default:
        deadline.setDate(deadline.getDate() + 60);
    }
    return deadline;
  }

  private generateActionPlan(gaps: ComplianceGap[], referenceDate: Date): CorrectiveAction[] {
    // Sort by severity then by points at stake
    const sorted = [...gaps].sort((a, b) => {
      const severityOrder = { BLOCKER: 0, CRITICAL: 1, WARNING: 2, INFO: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity]
        || b.pointsAtStake - a.pointsAtStake;
    });

    return sorted.map((gap, index) => ({
      priority: index + 1,
      gap,
      action: this.getCorrectiveActionForGap(gap),
      deadline: gap.deadline ?? new Date(referenceDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      estimatedEffort: this.getEffortEstimate(gap.severity),
    }));
  }

  private getCorrectiveActionForGap(gap: ComplianceGap): string {
    const actions: Record<string, string> = {
      A_REGISTRATION: 'Se conformer aux exigences d\'enregistrement et fournir les documents légaux.',
      B_PREMISES: 'Mettre à niveau les locaux et l\'infrastructure selon les normes DRCTT.',
      C_STOCK_MANAGEMENT: 'Mettre en place les procédures de gestion de stock requises.',
      D_CLIENT_REGISTRY: 'Compléter et mettre à jour le registre clients.',
      E_PRICING: 'Ajuster la politique de prix et de facturation.',
      F_REPORTING: 'Soumettre les rapports requis dans les délais.',
    };
    return actions[gap.category] ?? 'Corrector l\'écart identifié.';
  }

  private getEffortEstimate(severity: ComplianceSeverity): string {
    switch (severity) {
      case ComplianceSeverity.BLOCKER: return '1-3 jours';
      case ComplianceSeverity.CRITICAL: return '3-7 jours';
      case ComplianceSeverity.WARNING: return '1-2 semaines';
      case ComplianceSeverity.INFO: return '1 mois';
    }
  }
}
