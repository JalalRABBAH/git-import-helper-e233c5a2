// =============================================================================
// iReg Moto BF — Moteur Fiscal OHADA / UEMOA
// Calcul automatique des taxes: DD, TVA, DUS, RED, Prélèvements
// Conversion devises avec taux journalier
// =============================================================================

import {
  TaxCalculation,
  TaxCategory,
  RateType,
  FiscalBreakdown,
  CurrencyRate,
  Vehicle,
  StructuredLogger,
  ConsoleLogger,
} from './types';

// ============================================================================
// CONFIGURATION FISCALE OHADA/UEMOA
// ============================================================================

export interface TaxConfiguration {
  taxCode: string;
  taxLabel: string;
  category: TaxCategory;
  rateType: RateType;
  rateValue: number;       // percentage (0.18) or fixed amount
  fixedAmount?: number;    // for fixed taxes
  minAmount?: number;
  maxAmount?: number;
  applicableCategories: string[];  // vehicle category codes
  legalReference: string;
}

export const DEFAULT_TAX_CONFIGURATIONS: TaxConfiguration[] = [
  // TVA — 18% (UEMOA)
  {
    taxCode: 'UEMOA-TVA',
    taxLabel: 'Taxe sur la Valeur Ajoutée',
    category: 'VAT',
    rateType: 'PERCENTAGE',
    rateValue: 0.18,
    applicableCategories: ['CYCLOMOTEUR_50CC', 'MOTO_LEGERE_125CC', 'MOTO_LOURDE_125CC_PLUS', 'TRICYCLE_MOTEUR', 'QUADRACYCLE', 'ELECTRIQUE_50CC_EQ', 'ELECTRIQUE_125CC_EQ', 'ELECTRIQUE_PLUS'],
    legalReference: 'Directive UEMOA N°08/2009/CM',
  },
  // Droit de Douane — variable selon produit
  {
    taxCode: 'UEMOA-DD',
    taxLabel: 'Droit de Douane',
    category: 'CUSTOMS',
    rateType: 'PERCENTAGE',
    rateValue: 0.35, // 35% par défaut pour motos
    applicableCategories: ['CYCLOMOTEUR_50CC', 'MOTO_LEGERE_125CC', 'MOTO_LOURDE_125CC_PLUS', 'TRICYCLE_MOTEUR', 'QUADRACYCLE', 'ELECTRIQUE_50CC_EQ', 'ELECTRIQUE_125CC_EQ', 'ELECTRIQUE_PLUS'],
    legalReference: 'Tarif Extérieur Commun UEMOA',
  },
  // DUS — Droit Uniquement de Statistique (1%)
  {
    taxCode: 'UEMOA-DUS',
    taxLabel: 'Droit Uniquement de Statistique',
    category: 'CUSTOMS',
    rateType: 'PERCENTAGE',
    rateValue: 0.01,
    applicableCategories: ['CYCLOMOTEUR_50CC', 'MOTO_LEGERE_125CC', 'MOTO_LOURDE_125CC_PLUS', 'TRICYCLE_MOTEUR', 'QUADRACYCLE', 'ELECTRIQUE_50CC_EQ', 'ELECTRIQUE_125CC_EQ', 'ELECTRIQUE_PLUS'],
    legalReference: 'Code des Douanes UEMOA',
  },
  // DUS Spécifique (droit d'accise) par cylindrée
  {
    taxCode: 'UEMOA-DUS-50',
    taxLabel: 'Droit d\'Accise ≤ 50cc',
    category: 'EXCISE',
    rateType: 'FIXED',
    rateValue: 5000,
    applicableCategories: ['CYCLOMOTEUR_50CC', 'ELECTRIQUE_50CC_EQ'],
    legalReference: 'Code des Douanes UEMOA — DUS Cat. A',
  },
  {
    taxCode: 'UEMOA-DUS-125',
    taxLabel: 'Droit d\'Accise ≤ 125cc',
    category: 'EXCISE',
    rateType: 'FIXED',
    rateValue: 15000,
    applicableCategories: ['MOTO_LEGERE_125CC', 'QUADRACYCLE', 'ELECTRIQUE_125CC_EQ'],
    legalReference: 'Code des Douanes UEMOA — DUS Cat. B',
  },
  {
    taxCode: 'UEMOA-DUS-PLUS',
    taxLabel: 'Droit d\'Accise > 125cc',
    category: 'EXCISE',
    rateType: 'FIXED',
    rateValue: 35000,
    applicableCategories: ['MOTO_LOURDE_125CC_PLUS', 'TRICYCLE_MOTEUR', 'ELECTRIQUE_PLUS'],
    legalReference: 'Code des Douanes UEMOA — DUS Cat. C',
  },
  // RED — Redevance Économique et Domestique
  {
    taxCode: 'UEMOA-RED',
    taxLabel: 'Redevance Économique et Domestique',
    category: 'REGISTRATION',
    rateType: 'FIXED',
    rateValue: 15000,
    applicableCategories: ['CYCLOMOTEUR_50CC', 'MOTO_LEGERE_125CC', 'MOTO_LOURDE_125CC_PLUS', 'TRICYCLE_MOTEUR', 'QUADRACYCLE', 'ELECTRIQUE_50CC_EQ', 'ELECTRIQUE_125CC_EQ', 'ELECTRIQUE_PLUS'],
    legalReference: 'Arrêté conjoint MTTD/MEF',
  },
  // Prélèvement OHADA — 2%
  {
    taxCode: 'OHADA-PRE',
    taxLabel: 'Prélèvement OHADA',
    category: 'OHADA',
    rateType: 'PERCENTAGE',
    rateValue: 0.02,
    applicableCategories: ['CYCLOMOTEUR_50CC', 'MOTO_LEGERE_125CC', 'MOTO_LOURDE_125CC_PLUS', 'TRICYCLE_MOTEUR', 'QUADRACYCLE', 'ELECTRIQUE_50CC_EQ', 'ELECTRIQUE_125CC_EQ', 'ELECTRIQUE_PLUS'],
    legalReference: 'Acte Uniforme OHADA SYSCOHADA',
  },
  // Prélèvement communautaire — 0.5%
  {
    taxCode: 'UEMOA-COM',
    taxLabel: 'Prélèvement Communautaire UEMOA',
    category: 'COMMUNITY',
    rateType: 'PERCENTAGE',
    rateValue: 0.005,
    applicableCategories: ['CYCLOMOTEUR_50CC', 'MOTO_LEGERE_125CC', 'MOTO_LOURDE_125CC_PLUS', 'TRICYCLE_MOTEUR', 'QUADRACYCLE', 'ELECTRIQUE_50CC_EQ', 'ELECTRIQUE_125CC_EQ', 'ELECTRIQUE_PLUS'],
    legalReference: 'Traités UEMOA',
  },
];

// ============================================================================
// TAUX DE CHANGE
// ============================================================================

export interface ICurrencyConverter {
  convert(amount: number, fromCurrency: string, toCurrency: string, date?: Date): Promise<number>;
  getRate(fromCurrency: string, toCurrency: string, date?: Date): Promise<CurrencyRate>;
}

export class CurrencyConverter implements ICurrencyConverter {
  private rates: Map<string, CurrencyRate> = new Map();
  private logger: StructuredLogger;

  constructor(logger?: StructuredLogger) {
    this.logger = logger ?? new ConsoleLogger();
    this.seedDefaultRates();
  }

  private seedDefaultRates(): void {
    const today = new Date().toISOString().split('T')[0];
    const rates: CurrencyRate[] = [
      { fromCurrency: 'EUR', toCurrency: 'XOF', rate: 655.957, effectiveDate: new Date(today), source: 'BCEAO' },
      { fromCurrency: 'USD', toCurrency: 'XOF', rate: 605.5, effectiveDate: new Date(today), source: 'BCEAO' },
      { fromCurrency: 'GBP', toCurrency: 'XOF', rate: 775.2, effectiveDate: new Date(today), source: 'BCEAO' },
      { fromCurrency: 'CNY', toCurrency: 'XOF', rate: 84.3, effectiveDate: new Date(today), source: 'BCEAO' },
      { fromCurrency: 'NGN', toCurrency: 'XOF', rate: 0.38, effectiveDate: new Date(today), source: 'BCEAO' },
      { fromCurrency: 'XOF', toCurrency: 'XOF', rate: 1, effectiveDate: new Date(today), source: 'FIXED' },
    ];

    for (const rate of rates) {
      this.rates.set(`${rate.fromCurrency}-${rate.toCurrency}`, rate);
    }
  }

  async convert(amount: number, fromCurrency: string, toCurrency: string, date?: Date): Promise<number> {
    if (fromCurrency === toCurrency) return amount;

    const rate = await this.getRate(fromCurrency, toCurrency, date);
    return Math.round(amount * rate.rate * 100) / 100;
  }

  async getRate(fromCurrency: string, toCurrency: string, date?: Date): Promise<CurrencyRate> {
    const key = `${fromCurrency}-${toCurrency}`;
    const rate = this.rates.get(key);

    if (rate) {
      return rate;
    }

    // Try inverse rate
    const inverseKey = `${toCurrency}-${fromCurrency}`;
    const inverseRate = this.rates.get(inverseKey);
    if (inverseRate) {
      return {
        fromCurrency,
        toCurrency,
        rate: 1 / inverseRate.rate,
        effectiveDate: date ?? new Date(),
        source: `INVERSE_${inverseRate.source}`,
      };
    }

    this.logger.warn('Exchange rate not found, using 1:1', { fromCurrency, toCurrency });
    return {
      fromCurrency,
      toCurrency,
      rate: 1,
      effectiveDate: date ?? new Date(),
      source: 'FALLBACK',
    };
  }

  updateRate(rate: CurrencyRate): void {
    const key = `${rate.fromCurrency}-${rate.toCurrency}`;
    this.rates.set(key, rate);
    this.logger.info('Exchange rate updated', { key, rate: rate.rate, source: rate.source });
  }
}

// ============================================================================
// MOTEUR FISCAL
// ============================================================================

export interface IOhadaTaxEngine {
  calculateImportTaxes(params: ImportTaxParams): Promise<FiscalBreakdown>;
  calculateSaleTaxes(params: SaleTaxParams): Promise<FiscalBreakdown>;
  calculateRegistrationTaxes(vehicleCategory: string): Promise<FiscalBreakdown>;
  getApplicableTaxes(vehicleCategory: string): TaxConfiguration[];
  getTaxConfiguration(taxCode: string): TaxConfiguration | undefined;
}

export interface ImportTaxParams {
  customsValueXof: number;     // Valeur en douane en XOF
  vehicleCategory: string;     // Code catégorie véhicule
  cylinderCapacityCc?: number; // Cylindrée
  originCountryCode?: string;  // Pays d'origine
  electricVehicle?: boolean;   // Véhicule électrique
}

export interface SaleTaxParams {
  saleAmount: number;         // Montant de vente HT
  vehicleCategory: string;    // Code catégorie
  actorType: string;          // Type d'acteur
  isLocalAssembly?: boolean;  // Assemblage local
}

export class OhadaTaxEngine implements IOhadaTaxEngine {
  private configurations: TaxConfiguration[];
  private currencyConverter: ICurrencyConverter;
  private logger: StructuredLogger;

  constructor(
    configurations?: TaxConfiguration[],
    currencyConverter?: ICurrencyConverter,
    logger?: StructuredLogger,
  ) {
    this.configurations = configurations ?? DEFAULT_TAX_CONFIGURATIONS;
    this.currencyConverter = currencyConverter ?? new CurrencyConverter();
    this.logger = logger ?? new ConsoleLogger();
  }

  getApplicableTaxes(vehicleCategory: string): TaxConfiguration[] {
    return this.configurations.filter(config =>
      config.applicableCategories.includes(vehicleCategory)
    );
  }

  getTaxConfiguration(taxCode: string): TaxConfiguration | undefined {
    return this.configurations.find(c => c.taxCode === taxCode);
  }

  async calculateImportTaxes(params: ImportTaxParams): Promise<FiscalBreakdown> {
    const {
      customsValueXof,
      vehicleCategory,
      electricVehicle = false,
    } = params;

    this.logger.info('Calculating import taxes', {
      customsValue: customsValueXof,
      vehicleCategory,
      electricVehicle,
    });

    const applicableTaxes = this.getApplicableTaxes(vehicleCategory);
    const taxes: TaxCalculation[] = [];
    let totalTaxes = 0;

    for (const config of applicableTaxes) {
      // Skip excise for electric vehicles (DUS = 0)
      if (electricVehicle && config.category === 'EXCISE') {
        taxes.push({
          taxCode: config.taxCode,
          taxLabel: config.taxLabel + ' (Exonéré VE)',
          category: config.category,
          rateType: config.rateType,
          rateValue: config.rateValue,
          calculatedAmount: 0,
          currencyCode: 'XOF',
          legalReference: config.legalReference,
        });
        continue;
      }

      const calculatedAmount = this.calculateTaxAmount(config, customsValueXof);

      taxes.push({
        taxCode: config.taxCode,
        taxLabel: config.taxLabel,
        category: config.category,
        rateType: config.rateType,
        rateValue: config.rateType === 'PERCENTAGE' ? config.rateValue : undefined,
        fixedAmount: config.rateType === 'FIXED' ? config.rateValue : undefined,
        calculatedAmount,
        currencyCode: 'XOF',
        legalReference: config.legalReference,
      });

      totalTaxes += calculatedAmount;
    }

    const result: FiscalBreakdown = {
      baseAmount: customsValueXof,
      currencyCode: 'XOF',
      taxes,
      totalTaxes: Math.round(totalTaxes * 100) / 100,
      totalWithTaxes: Math.round((customsValueXof + totalTaxes) * 100) / 100,
      effectiveDate: new Date(),
    };

    this.logger.info('Import taxes calculated', {
      baseAmount: result.baseAmount,
      totalTaxes: result.totalTaxes,
      taxCount: result.taxes.length,
    });

    return result;
  }

  async calculateSaleTaxes(params: SaleTaxParams): Promise<FiscalBreakdown> {
    const { saleAmount, vehicleCategory, isLocalAssembly = false } = params;

    this.logger.info('Calculating sale taxes', {
      saleAmount,
      vehicleCategory,
      isLocalAssembly,
    });

    // For sales, only TVA and OHADA prelevement apply
    const applicableTaxes = this.getApplicableTaxes(vehicleCategory).filter(
      config => config.category === 'VAT' || config.category === 'OHADA' || config.category === 'COMMUNITY'
    );

    const taxes: TaxCalculation[] = [];
    let totalTaxes = 0;

    for (const config of applicableTaxes) {
      const calculatedAmount = this.calculateTaxAmount(config, saleAmount);

      taxes.push({
        taxCode: config.taxCode,
        taxLabel: config.taxLabel,
        category: config.category,
        rateType: config.rateType,
        rateValue: config.rateType === 'PERCENTAGE' ? config.rateValue : undefined,
        calculatedAmount,
        currencyCode: 'XOF',
        legalReference: config.legalReference,
      });

      totalTaxes += calculatedAmount;
    }

    // Add registration tax (RED) on sale
    const redConfig = this.configurations.find(c => c.taxCode === 'UEMOA-RED');
    if (redConfig && redConfig.applicableCategories.includes(vehicleCategory)) {
      taxes.push({
        taxCode: redConfig.taxCode,
        taxLabel: redConfig.taxLabel,
        category: redConfig.category,
        rateType: redConfig.rateType,
        fixedAmount: redConfig.rateValue,
        calculatedAmount: redConfig.rateValue,
        currencyCode: 'XOF',
        legalReference: redConfig.legalReference,
      });
      totalTaxes += redConfig.rateValue;
    }

    return {
      baseAmount: saleAmount,
      currencyCode: 'XOF',
      taxes,
      totalTaxes: Math.round(totalTaxes * 100) / 100,
      totalWithTaxes: Math.round((saleAmount + totalTaxes) * 100) / 100,
      effectiveDate: new Date(),
    };
  }

  async calculateRegistrationTaxes(vehicleCategory: string): Promise<FiscalBreakdown> {
    // Registration taxes = RED + DUS
    const applicableTaxes = this.configurations.filter(
      config =>
        (config.category === 'REGISTRATION' || config.category === 'EXCISE') &&
        config.applicableCategories.includes(vehicleCategory)
    );

    const taxes: TaxCalculation[] = [];
    let totalTaxes = 0;

    for (const config of applicableTaxes) {
      taxes.push({
        taxCode: config.taxCode,
        taxLabel: config.taxLabel,
        category: config.category,
        rateType: config.rateType,
        rateValue: config.rateType === 'PERCENTAGE' ? config.rateValue : undefined,
        fixedAmount: config.rateType === 'FIXED' ? config.rateValue : undefined,
        calculatedAmount: config.rateValue,
        currencyCode: 'XOF',
        legalReference: config.legalReference,
      });
      totalTaxes += config.rateValue;
    }

    return {
      baseAmount: 0,
      currencyCode: 'XOF',
      taxes,
      totalTaxes: Math.round(totalTaxes * 100) / 100,
      totalWithTaxes: Math.round(totalTaxes * 100) / 100,
      effectiveDate: new Date(),
    };
  }

  private calculateTaxAmount(config: TaxConfiguration, baseAmount: number): number {
    if (config.rateType === 'PERCENTAGE') {
      return Math.round(baseAmount * config.rateValue * 100) / 100;
    } else if (config.rateType === 'FIXED') {
      return config.rateValue;
    }
    return 0;
  }

  /**
   * Calcule le coût total d'importation (landed cost)
   */
  async calculateLandedCost(
    foreignPrice: number,
    foreignCurrency: string,
    vehicleCategory: string,
    freightCost: number = 0,
    insuranceCost: number = 0,
    date?: Date,
  ): Promise<{
    foreignPrice: number;
    exchangeRate: number;
    customsValueXof: number;
    freightCost: number;
    insuranceCost: number;
    taxes: FiscalBreakdown;
    totalLandedCost: number;
  }> {
    // Convert to XOF
    const customsValueXof = await this.currencyConverter.convert(foreignPrice, foreignCurrency, 'XOF', date);
    const rate = await this.currencyConverter.getRate(foreignCurrency, 'XOF', date);

    // Calculate taxes
    const taxes = await this.calculateImportTaxes({
      customsValueXof: customsValueXof + freightCost + insuranceCost,
      vehicleCategory,
    });

    const totalLandedCost = customsValueXof + freightCost + insuranceCost + taxes.totalTaxes;

    return {
      foreignPrice,
      exchangeRate: rate.rate,
      customsValueXof: Math.round(customsValueXof * 100) / 100,
      freightCost: Math.round(freightCost * 100) / 100,
      insuranceCost: Math.round(insuranceCost * 100) / 100,
      taxes,
      totalLandedCost: Math.round(totalLandedCost * 100) / 100,
    };
  }
}

// ============================================================================
// FACTORY — Création d'un moteur fiscal configuré
// ============================================================================

export interface TaxEngineFactory {
  createEngine(configs?: TaxConfiguration[]): IOhadaTaxEngine;
}

export class DefaultTaxEngineFactory implements TaxEngineFactory {
  createEngine(configs?: TaxConfiguration[]): IOhadaTaxEngine {
    return new OhadaTaxEngine(configs);
  }
}
