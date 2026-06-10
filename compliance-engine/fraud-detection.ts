// =============================================================================
// iReg Moto BF — Détection des Transactions Suspectes
// 8 règles de détection avec scoring de risque et preuves
// =============================================================================

import {
  Actor,
  ActorType,
  Sale,
  Client,
  Vehicle,
  FraudAlert,
  FraudAlertLevel,
  FraudAlertType,
  FraudEvidence,
  FraudDetectionContext,
  SectorPriceStats,
  StructuredLogger,
  ConsoleLogger,
} from './types';

// ============================================================================
// INTERFACE STRATÉGIE — Règle de détection de fraude
// ============================================================================

export interface IFraudDetectionRule {
  readonly id: string;
  readonly alertType: FraudAlertType;
  readonly title: string;
  readonly description: string;
  readonly baseRiskScore: number;

  detect(ctx: FraudDetectionContext): FraudAlert | null;
}

// ============================================================================
// RÈGLE 1 — Achat multiple par même client (> 3 engins sur 30 jours)
// ============================================================================

export class Rule_MultiplePurchase implements IFraudDetectionRule {
  readonly id = 'fraud-multiple-purchase';
  readonly alertType = FraudAlertType.MULTIPLE_PURCHASE;
  readonly title = 'Achat multiple par même client';
  readonly description = 'Un client a acheté plus de 3 engins sur une période de 30 jours';
  readonly baseRiskScore = 65;
  private threshold: number;

  constructor(threshold: number = 3) {
    this.threshold = threshold;
  }

  detect(ctx: FraudDetectionContext): FraudAlert | null {
    if (!ctx.client || !ctx.actorSales) return null;

    const clientId = ctx.client.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const clientSales = ctx.actorSales.filter(s =>
      s.clientId === clientId &&
      s.status === 'PAID' &&
      s.saleDate >= thirtyDaysAgo
    );

    const vehicleCount = clientSales.reduce((sum, s) => sum + (s.items?.length ?? 1), 0);

    if (vehicleCount > this.threshold) {
      const evidence: FraudEvidence[] = [
        { key: 'clientId', value: clientId, source: 'sale_records' },
        { key: 'clientName', value: ctx.client.fullName, source: 'client_registry' },
        { key: 'vehicleCount', value: vehicleCount, source: 'sale_records' },
        { key: 'threshold', value: this.threshold, source: 'rule_config' },
        { key: 'periodDays', value: 30, source: 'rule_config' },
        { key: 'salesDetails', value: clientSales.map(s => ({ id: s.id, date: s.saleDate, amount: s.totalAmount })), source: 'sale_records' },
      ];

      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        alertType: this.alertType,
        level: vehicleCount > 5 ? FraudAlertLevel.CRITICAL : FraudAlertLevel.HIGH,
        title: this.title,
        description: `Le client ${ctx.client.fullName} (${ctx.client.idDocumentNumber}) a acquis ${vehicleCount} engins en 30 jours (seuil: ${this.threshold}). Cela peut indiquer un réseau de revente ou du blanchiment.`,
        riskScore: Math.min(100, this.baseRiskScore + (vehicleCount - this.threshold) * 10),
        evidence,
        recommendation: 'Vérifier l\'usage professionnel déclaré, rechercher des ventes précédentes, contacter le client pour justification.',
        clientId: ctx.client.id,
        actorId: ctx.sale?.actorId,
        createdAt: new Date(),
        status: 'OPEN',
      };
    }

    return null;
  }
}

// ============================================================================
// RÈGLE 2 — Vente vers zones frontalières à risque
// ============================================================================

export class Rule_BorderZoneSale implements IFraudDetectionRule {
  readonly id = 'fraud-border-zone';
  readonly alertType = FraudAlertType.BORDER_ZONE_SALE;
  readonly title = 'Vente en zone frontalière à risque';
  readonly description = 'Transaction réalisée dans une zone frontalière classée à risque';
  readonly baseRiskScore = 55;

  // Zones frontalières à risque (coordonnées approximatives)
  private riskZones: Array<{ name: string; lat: number; lng: number; radiusKm: number }> = [
    { name: 'Frontière Mali (Ouest)', lat: 12.5, lng: -4.5, radiusKm: 50 },
    { name: 'Frontière Côte d\'Ivoire (Sud-Ouest)', lat: 10.0, lng: -4.8, radiusKm: 40 },
    { name: 'Frontière Ghana (Sud)', lat: 10.8, lng: -0.2, radiusKm: 40 },
    { name: 'Frontière Togo (Sud-Est)', lat: 11.2, lng: 0.2, radiusKm: 35 },
    { name: 'Frontière Bénin/Niger (Est)', lat: 12.0, lng: 1.8, radiusKm: 45 },
  ];

  detect(ctx: FraudDetectionContext): FraudAlert | null {
    if (!ctx.sale?.saleLocation) return null;

    const { lat, lng } = ctx.sale.saleLocation;

    for (const zone of this.riskZones) {
      const distanceKm = this.haversineDistance(lat, lng, zone.lat, zone.lng);
      if (distanceKm <= zone.radiusKm) {
        const evidence: FraudEvidence[] = [
          { key: 'saleLocation', value: { lat, lng }, source: 'sale_gps' },
          { key: 'zoneName', value: zone.name, source: 'geofence_db' },
          { key: 'distanceKm', value: Math.round(distanceKm * 100) / 100, source: 'geolocation' },
          { key: 'saleAmount', value: ctx.sale.totalAmount, source: 'sale_record' },
          { key: 'paymentMethod', value: ctx.sale.paymentMethod, source: 'sale_record' },
        ];

        return {
          id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          alertType: this.alertType,
          level: FraudAlertLevel.HIGH,
          title: this.title,
          description: `Vente réalisée à ${Math.round(distanceKm)} km de la ${zone.name}. Risque de fuite vers le marché parallèle.`,
          riskScore: Math.min(100, this.baseRiskScore + Math.round((1 - distanceKm / zone.radiusKm) * 30)),
          evidence,
          recommendation: 'Vérifier l\'adresse du client, demander justificatif de domicile, signaler à la CNTI si récidive.',
          saleId: ctx.sale.id,
          actorId: ctx.sale.actorId,
          clientId: ctx.sale.clientId,
          createdAt: new Date(),
          status: 'OPEN',
        };
      }
    }

    return null;
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return deg * Math.PI / 180;
  }
}

// ============================================================================
// RÈGLE 3 — Paiement cash anormalement élevé (> 5 000 000 XOF)
// ============================================================================

export class Rule_CashPaymentAnomaly implements IFraudDetectionRule {
  readonly id = 'fraud-cash-payment';
  readonly alertType = FraudAlertType.CASH_PAYMENT_ANOMALY;
  readonly title = 'Paiement cash anormalement élevé';
  readonly description = 'Paiement en espèces supérieur à 5 000 000 XOF';
  readonly baseRiskScore = 70;
  private threshold: number;

  constructor(threshold: number = 5_000_000) {
    this.threshold = threshold;
  }

  detect(ctx: FraudDetectionContext): FraudAlert | null {
    if (!ctx.sale) return null;

    const isCash = ctx.sale.paymentMethod === 'CASH';
    const isHigh = ctx.sale.totalAmount > this.threshold;

    if (isCash && isHigh) {
      const evidence: FraudEvidence[] = [
        { key: 'paymentMethod', value: ctx.sale.paymentMethod, source: 'sale_record' },
        { key: 'totalAmount', value: ctx.sale.totalAmount, source: 'sale_record' },
        { key: 'threshold', value: this.threshold, source: 'rule_config' },
        { key: 'excessAmount', value: ctx.sale.totalAmount - this.threshold, source: 'calculation' },
        { key: 'saleDate', value: ctx.sale.saleDate, source: 'sale_record' },
      ];

      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        alertType: this.alertType,
        level: ctx.sale.totalAmount > this.threshold * 2 ? FraudAlertLevel.CRITICAL : FraudAlertLevel.HIGH,
        title: this.title,
        description: `Paiement en espèces de ${ctx.sale.totalAmount.toLocaleString()} XOF (seuil: ${this.threshold.toLocaleString()} XOF). Risque de blanchiment ou d'évasion fiscale.`,
        riskScore: Math.min(100, this.baseRiskScore + Math.round((ctx.sale.totalAmount - this.threshold) / this.threshold * 20)),
        evidence,
        recommendation: 'Exiger une traçabilité bancaire pour les paiements > 5M XOF, vérifier la source des fonds, déclarer à la CENTIF-UEO si suspicion.',
        saleId: ctx.sale.id,
        actorId: ctx.sale.actorId,
        clientId: ctx.sale.clientId,
        createdAt: new Date(),
        status: 'OPEN',
      };
    }

    return null;
  }
}

// ============================================================================
// RÈGLE 4 — Écart de prix > 20% par rapport à la moyenne sectorielle
// ============================================================================

export class Rule_PriceDeviation implements IFraudDetectionRule {
  readonly id = 'fraud-price-deviation';
  readonly alertType = FraudAlertType.PRICE_DEVIATION;
  readonly title = 'Écart de prix anormal';
  readonly description = 'Prix de vente écartant de plus de 20% de la moyenne sectorielle';
  readonly baseRiskScore = 50;

  detect(ctx: FraudDetectionContext): FraudAlert | null {
    if (!ctx.sale || !ctx.sectorPrices) return null;

    const deviations: Array<{ item: typeof ctx.sale.items[0]; deviation: number; expectedPrice: number }> = [];

    for (const item of ctx.sale.items) {
      const sectorAvg = ctx.sectorPrices.averageSellingPrice;
      if (sectorAvg > 0 && item.unitPrice > 0) {
        const deviation = Math.abs(item.unitPrice - sectorAvg) / sectorAvg;
        if (deviation > 0.20) {
          deviations.push({ item, deviation, expectedPrice: sectorAvg });
        }
      }
    }

    if (deviations.length > 0) {
      const maxDeviation = Math.max(...deviations.map(d => d.deviation));
      const evidence: FraudEvidence[] = [
        { key: 'deviations', value: deviations.map(d => ({
          vehicleId: d.item.vehicleId,
          actualPrice: d.item.unitPrice,
          expectedPrice: d.expectedPrice,
          deviation: `${(d.deviation * 100).toFixed(1)}%`,
        })), source: 'pricing_analysis' },
        { key: 'sectorAverage', value: ctx.sectorPrices.averageSellingPrice, source: 'sector_stats' },
        { key: 'sectorMedian', value: ctx.sectorPrices.medianSellingPrice, source: 'sector_stats' },
        { key: 'sampleSize', value: ctx.sectorPrices.sampleSize, source: 'sector_stats' },
      ];

      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        alertType: this.alertType,
        level: maxDeviation > 0.50 ? FraudAlertLevel.HIGH : FraudAlertLevel.MEDIUM,
        title: this.title,
        description: `${deviations.length} article(s) avec un écart de prix > 20% par rapport à la moyenne sectorielle (écart max: ${(maxDeviation * 100).toFixed(1)}%).`,
        riskScore: Math.min(100, this.baseRiskScore + Math.round(maxDeviation * 100)),
        evidence,
        recommendation: 'Vérifier la justification du prix (options, promotion, erreur de saisie), comparer avec le prix d\'achat.',
        saleId: ctx.sale.id,
        actorId: ctx.sale.actorId,
        createdAt: new Date(),
        status: 'OPEN',
      };
    }

    return null;
  }
}

// ============================================================================
// RÈGLE 5 — Vente de modèle interdit
// ============================================================================

export class Rule_ForbiddenModel implements IFraudDetectionRule {
  readonly id = 'fraud-forbidden-model';
  readonly alertType = FraudAlertType.FORBIDDEN_MODEL;
  readonly title = 'Vente de modèle interdit';
  readonly description = 'Vente d\'un modèle figurant sur la liste des modèles interdits depuis 2022';
  readonly baseRiskScore = 95;

  detect(ctx: FraudDetectionContext): FraudAlert | null {
    if (!ctx.vehicle || !ctx.sale) return null;

    const isForbidden = ctx.vehicle.categoryCode === 'INTERDITE';

    if (isForbidden) {
      const evidence: FraudEvidence[] = [
        { key: 'vin', value: ctx.vehicle.vin, source: 'vehicle_registry' },
        { key: 'manufacturer', value: ctx.vehicle.manufacturer, source: 'vehicle_registry' },
        { key: 'model', value: ctx.vehicle.model, source: 'vehicle_registry' },
        { key: 'modelYear', value: ctx.vehicle.modelYear, source: 'vehicle_registry' },
        { key: 'categoryCode', value: ctx.vehicle.categoryCode, source: 'vehicle_registry' },
        { key: 'saleId', value: ctx.sale.id, source: 'sale_record' },
        { key: 'saleAmount', value: ctx.sale.totalAmount, source: 'sale_record' },
      ];

      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        alertType: this.alertType,
        level: FraudAlertLevel.CRITICAL,
        title: this.title,
        description: `Vente d'un modèle INTERDIT: ${ctx.vehicle.manufacturer} ${ctx.vehicle.model} (${ctx.vehicle.modelYear}), VIN: ${ctx.vehicle.vin}. Cette vente viole l'arrêté ministériel 05/06/2026.`,
        riskScore: this.baseRiskScore,
        evidence,
        recommendation: 'BLOQUER immédiatement la transaction, saisir l\'engin, notifier le CNTI et la Police nationale.',
        saleId: ctx.sale.id,
        actorId: ctx.sale.actorId,
        vehicleId: ctx.vehicle.id,
        clientId: ctx.sale.clientId,
        createdAt: new Date(),
        status: 'OPEN',
      };
    }

    return null;
  }
}

// ============================================================================
// RÈGLE 6 — Client sans pièce d'identité valide
// ============================================================================

export class Rule_InvalidIdDocument implements IFraudDetectionRule {
  readonly id = 'fraud-invalid-id';
  readonly alertType = FraudAlertType.INVALID_ID_DOCUMENT;
  readonly title = 'Client sans pièce d\'identité valide';
  readonly description = 'Transaction effectuée avec un client dont la pièce d\'identité est invalide ou absente';
  readonly baseRiskScore = 60;

  detect(ctx: FraudDetectionContext): FraudAlert | null {
    if (!ctx.client || !ctx.sale) return null;

    const noId = !ctx.client.idDocumentNumber || ctx.client.idDocumentNumber.length < 5;
    const expiredId = !!ctx.client.idDocumentExpiresAt && ctx.client.idDocumentExpiresAt < new Date();
    const notVerified = ctx.client.status !== 'KYC_VERIFIED';

    if (noId || expiredId) {
      const evidence: FraudEvidence[] = [
        { key: 'clientId', value: ctx.client.id, source: 'client_registry' },
        { key: 'clientName', value: ctx.client.fullName, source: 'client_registry' },
        { key: 'idDocumentType', value: ctx.client.idDocumentType, source: 'client_registry' },
        { key: 'idDocumentNumber', value: ctx.client.idDocumentNumber, source: 'client_registry' },
        { key: 'idDocumentExpiresAt', value: ctx.client.idDocumentExpiresAt, source: 'client_registry' },
        { key: 'kycStatus', value: ctx.client.status, source: 'client_registry' },
        { key: 'noId', value: noId, source: 'validation' },
        { key: 'expiredId', value: expiredId, source: 'validation' },
      ];

      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        alertType: this.alertType,
        level: FraudAlertLevel.HIGH,
        title: this.title,
        description: `Client ${ctx.client.fullName} sans pièce d'identité valide (KYC: ${ctx.client.status}). Vente non conforme à l'arrêté 05/06/2026 Art. 12.`,
        riskScore: this.baseRiskScore + (expiredId ? 15 : 0),
        evidence,
        recommendation: 'BLOQUER la livraison jusqu\'à obtention d\'une pièce d\'identité valide. Scanner et vérifier le document.',
        saleId: ctx.sale.id,
        actorId: ctx.sale.actorId,
        clientId: ctx.client.id,
        createdAt: new Date(),
        status: 'OPEN',
      };
    }

    return null;
  }
}

// ============================================================================
// RÈGLE 7 — Transaction hors heures normales
// ============================================================================

export class Rule_OffHoursTransaction implements IFraudDetectionRule {
  readonly id = 'fraud-off-hours';
  readonly alertType = FraudAlertType.OFF_HOURS_TRANSACTION;
  readonly title = 'Transaction hors heures normales';
  readonly description = 'Vente réalisée en dehors des heures d\'ouverture déclarées (20h-06h)';
  readonly baseRiskScore = 35;

  detect(ctx: FraudDetectionContext): FraudAlert | null {
    if (!ctx.sale) return null;

    const saleHour = ctx.sale.saleDate.getHours();
    const isOffHours = saleHour < 6 || saleHour >= 20; // Before 6am or after 8pm

    if (isOffHours) {
      const evidence: FraudEvidence[] = [
        { key: 'saleHour', value: saleHour, source: 'sale_record' },
        { key: 'saleDate', value: ctx.sale.saleDate.toISOString(), source: 'sale_record' },
        { key: 'totalAmount', value: ctx.sale.totalAmount, source: 'sale_record' },
        { key: 'paymentMethod', value: ctx.sale.paymentMethod, source: 'sale_record' },
      ];

      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        alertType: this.alertType,
        level: FraudAlertLevel.LOW,
        title: this.title,
        description: `Vente réalisée à ${saleHour}h${ctx.sale.saleDate.getMinutes().toString().padStart(2, '0')} (hors heures normales 06h-20h).`,
        riskScore: this.baseRiskScore + (ctx.sale.totalAmount > 2_000_000 ? 15 : 0),
        evidence,
        recommendation: 'Vérifier la justification (client professionnel, urgence), confirmer avec le vendeur.',
        saleId: ctx.sale.id,
        actorId: ctx.sale.actorId,
        clientId: ctx.sale.clientId,
        createdAt: new Date(),
        status: 'OPEN',
      };
    }

    return null;
  }
}

// ============================================================================
// RÈGLE 8 — Volume anormal de ventes sur courte période
// ============================================================================

export class Rule_VolumeAnomaly implements IFraudDetectionRule {
  readonly id = 'fraud-volume-anomaly';
  readonly alertType = FraudAlertType.VOLUME_ANOMALY;
  readonly title = 'Volume anormal de ventes';
  readonly description = 'Nombre anormalement élevé de ventes sur une courte période par rapport à l\'historique';
  readonly baseRiskScore = 55;
  private thresholdFactor: number;

  constructor(thresholdFactor: number = 3) {
    this.thresholdFactor = thresholdFactor; // 3x the average
  }

  detect(ctx: FraudDetectionContext): FraudAlert | null {
    if (!ctx.actorSales || !ctx.actor || !ctx.sale) return null;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Sales in last 7 days
    const recentSales = ctx.actorSales.filter(s =>
      s.status === 'PAID' && s.saleDate >= sevenDaysAgo
    );

    // Sales in previous 30 days (before last 7)
    const previousSales = ctx.actorSales.filter(s =>
      s.status === 'PAID' && s.saleDate >= thirtyDaysAgo && s.saleDate < sevenDaysAgo
    );

    const recentDailyAvg = recentSales.length / 7;
    const previousDailyAvg = previousSales.length > 0 ? previousSales.length / 23 : 0.1; // Avoid div by 0

    if (recentDailyAvg > previousDailyAvg * this.thresholdFactor && recentSales.length >= 5) {
      const evidence: FraudEvidence[] = [
        { key: 'recentSalesCount', value: recentSales.length, source: 'sale_records' },
        { key: 'recentDailyAvg', value: Math.round(recentDailyAvg * 100) / 100, source: 'calculation' },
        { key: 'previousDailyAvg', value: Math.round(previousDailyAvg * 100) / 100, source: 'calculation' },
        { key: 'multiplier', value: Math.round((recentDailyAvg / previousDailyAvg) * 100) / 100, source: 'calculation' },
        { key: 'thresholdFactor', value: this.thresholdFactor, source: 'rule_config' },
        { key: 'totalRevenue7d', value: recentSales.reduce((s, sale) => s + sale.totalAmount, 0), source: 'sale_records' },
      ];

      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        alertType: this.alertType,
        level: recentDailyAvg > previousDailyAvg * 5 ? FraudAlertLevel.HIGH : FraudAlertLevel.MEDIUM,
        title: this.title,
        description: `${recentSales.length} ventes en 7 jours (moyenne journalière: ${recentDailyAvg.toFixed(1)}) vs ${previousDailyAvg.toFixed(1)} sur la période précédente (${(recentDailyAvg / previousDailyAvg).toFixed(1)}x).`,
        riskScore: Math.min(100, this.baseRiskScore + Math.round((recentDailyAvg / previousDailyAvg) * 10)),
        evidence,
        recommendation: 'Vérifier si pic justifié (promotion, saisonnalité), analyser les profils clients, rechercher des ventes fictives.',
        actorId: ctx.actor.id,
        createdAt: new Date(),
        status: 'OPEN',
      };
    }

    return null;
  }
}

// ============================================================================
// MOTEUR DE DÉTECTION — Orchestrateur
// ============================================================================

export interface IFraudDetectionEngine {
  analyzeTransaction(ctx: FraudDetectionContext): FraudAlert[];
  analyzeActor(ctx: FraudDetectionContext): FraudAlert[];
  getAllRules(): IFraudDetectionRule[];
  addRule(rule: IFraudDetectionRule): void;
}

export class FraudDetectionEngine implements IFraudDetectionEngine {
  private rules: IFraudDetectionRule[] = [];
  private logger: StructuredLogger;

  constructor(options: { rules?: IFraudDetectionRule[]; logger?: StructuredLogger } = {}) {
    this.logger = options.logger ?? new ConsoleLogger();
    this.rules = options.rules ?? this.getDefaultRules();
  }

  private getDefaultRules(): IFraudDetectionRule[] {
    return [
      new Rule_MultiplePurchase(3),
      new Rule_BorderZoneSale(),
      new Rule_CashPaymentAnomaly(5_000_000),
      new Rule_PriceDeviation(),
      new Rule_ForbiddenModel(),
      new Rule_InvalidIdDocument(),
      new Rule_OffHoursTransaction(),
      new Rule_VolumeAnomaly(3),
    ];
  }

  addRule(rule: IFraudDetectionRule): void {
    this.rules.push(rule);
    this.logger.info('Fraud detection rule added', { ruleId: rule.id });
  }

  getAllRules(): IFraudDetectionRule[] {
    return [...this.rules];
  }

  analyzeTransaction(ctx: FraudDetectionContext): FraudAlert[] {
    this.logger.info('Analyzing transaction for fraud', {
      saleId: ctx.sale?.id,
      actorId: ctx.actor?.id,
    });

    const alerts: FraudAlert[] = [];

    for (const rule of this.rules) {
      try {
        const alert = rule.detect(ctx);
        if (alert) {
          alerts.push(alert);
          this.logger.warn('Fraud alert detected', {
            ruleId: rule.id,
            alertType: alert.alertType,
            riskScore: alert.riskScore,
            level: alert.level,
          });
        }
      } catch (error) {
        this.logger.error(`Fraud rule error: ${rule.id}`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Sort by risk score descending
    alerts.sort((a, b) => b.riskScore - a.riskScore);

    this.logger.info('Transaction analysis complete', {
      alertsCount: alerts.length,
      maxRiskScore: alerts.length > 0 ? alerts[0].riskScore : 0,
    });

    return alerts;
  }

  analyzeActor(ctx: FraudDetectionContext): FraudAlert[] {
    // Analyze all sales of an actor
    const allAlerts: FraudAlert[] = [];

    if (ctx.actorSales) {
      for (const sale of ctx.actorSales) {
        const saleCtx: FraudDetectionContext = {
          ...ctx,
          sale,
        };
        const alerts = this.analyzeTransaction(saleCtx);
        allAlerts.push(...alerts);
      }
    }

    // Deduplicate by alert type (keep highest risk score)
    const deduped = new Map<FraudAlertType, FraudAlert>();
    for (const alert of allAlerts) {
      const existing = deduped.get(alert.alertType);
      if (!existing || alert.riskScore > existing.riskScore) {
        deduped.set(alert.alertType, alert);
      }
    }

    return Array.from(deduped.values()).sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Calcule un score de risque global pour un acteur
   */
  calculateActorRiskScore(ctx: FraudDetectionContext): ActorRiskScore {
    const alerts = this.analyzeActor(ctx);

    if (alerts.length === 0) {
      return {
        actorId: ctx.actor?.id ?? 'unknown',
        overallRiskScore: 0,
        riskLevel: 'LOW',
        alertCount: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        topAlerts: [],
        assessedAt: new Date(),
      };
    }

    // Weighted scoring: critical=1.0, high=0.7, medium=0.4, low=0.2
    const levelWeights: Record<string, number> = {
      CRITICAL: 1.0,
      HIGH: 0.7,
      MEDIUM: 0.4,
      LOW: 0.2,
    };

    let weightedSum = 0;
    let maxPossible = 0;

    const criticalCount = alerts.filter(a => a.level === 'CRITICAL').length;
    const highCount = alerts.filter(a => a.level === 'HIGH').length;
    const mediumCount = alerts.filter(a => a.level === 'MEDIUM').length;
    const lowCount = alerts.filter(a => a.level === 'LOW').length;

    for (const alert of alerts) {
      weightedSum += alert.riskScore * (levelWeights[alert.level] ?? 0.2);
      maxPossible += 100 * (levelWeights[alert.level] ?? 0.2);
    }

    const overallRiskScore = maxPossible > 0
      ? Math.round((weightedSum / maxPossible) * 100)
      : 0;

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (overallRiskScore >= 70 || criticalCount > 0) riskLevel = 'CRITICAL';
    else if (overallRiskScore >= 50 || highCount > 0) riskLevel = 'HIGH';
    else if (overallRiskScore >= 25 || mediumCount > 0) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    return {
      actorId: ctx.actor?.id ?? 'unknown',
      overallRiskScore,
      riskLevel,
      alertCount: alerts.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      topAlerts: alerts.slice(0, 5),
      assessedAt: new Date(),
    };
  }
}

export interface ActorRiskScore {
  actorId: string;
  overallRiskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  alertCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  topAlerts: FraudAlert[];
  assessedAt: Date;
}
