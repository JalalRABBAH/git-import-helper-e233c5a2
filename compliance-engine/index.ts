// =============================================================================
// iReg Moto BF — Moteur de Conformité & Sécurité
// Point d'entrée unique pour tous les modules
// =============================================================================

// Types
export * from './types';

// Moteur de règles réglementaires (150 points)
export {
  RegulatoryRulesEngine,
  RuleRegistry,
  // Rules Category A — Registration
  RuleA1_RccmValid,
  RuleA2_IfuValid,
  RuleA3_AgrementValid,
  RuleA4_ImportLicense,
  RuleA5_RegistrationDelay,
  // Rules Category B — Premises
  RuleB1_CommercialPremises,
  RuleB2_SecureWarehouse,
  RuleB3_TraceabilitySystem,
  RuleB4_InternetConnection,
  RuleB5_AssemblyUnit,
  // Rules Category C — Stock Management
  RuleC1_VinRegistration,
  RuleC2_ModelCompliance,
  RuleC3_QuarterlyInventory,
  RuleC4_QrOrRfid,
  RuleC5_StockReconciliation,
  // Rules Category D — Client Registry
  RuleD1_ClientIdentity,
  RuleD2_BuyerPhoto,
  RuleD3_BuyerVehicleLink,
  RuleD4_QuarterlyRegistry,
  RuleD5_ArchiveRetention,
  // Rules Category E — Pricing
  RuleE1_PurchasePriceRecorded,
  RuleE2_SellingPriceDeclared,
  RuleE3_StandardizedInvoicing,
  RuleE4_MarginCompliance,
  // Rules Category F — Reporting
  RuleF1_TimelyReport,
  RuleF2_CompleteAccurateData,
  RuleF3_XmlPdfFormat,
  // Interfaces
  type IComplianceRule,
  type IRuleRegistry,
  type IRegulatoryRulesEngine,
} from './regulatory-rules-engine';

// Checklist dynamique
export {
  ChecklistManager,
  ImportateurChecklistFactory,
  DistributeurChecklistFactory,
  AssembleurChecklistFactory,
  DetallantChecklistFactory,
  type IChecklistFactory,
  type IChecklistManager,
} from './compliance-checklist';

// Scoring
export {
  ComplianceScoringService,
  WeightedScoreCalculator,
  TrendAnalyzer,
  SectorComparator,
  InMemoryScoreHistoryRepository,
  DEFAULT_CATEGORY_WEIGHTS,
  type IComplianceScoringService,
  type IWeightedScoreCalculator,
  type ITrendAnalyzer,
  type ISectorComparator,
  type IScoreHistoryRepository,
  type WeightedScoreResult,
  type FullScoreReport,
  type CategoryWeightConfig,
} from './compliance-scoring';

// Compte à rebours
export {
  ComplianceCountdownService,
  CountdownCalculator,
  CountdownNotificationService,
  DEFAULT_GRACE_PERIODS,
  ESCALATION_LEVELS,
  type IComplianceCountdownService,
  type ICountdownCalculator,
  type INotificationService,
  type CountdownDashboardStats,
  type GracePeriodConfig,
} from './compliance-countdown';

// Détection de fraude
export {
  FraudDetectionEngine,
  Rule_MultiplePurchase,
  Rule_BorderZoneSale,
  Rule_CashPaymentAnomaly,
  Rule_PriceDeviation,
  Rule_ForbiddenModel,
  Rule_InvalidIdDocument,
  Rule_OffHoursTransaction,
  Rule_VolumeAnomaly,
  type IFraudDetectionEngine,
  type IFraudDetectionRule,
  type ActorRiskScore,
} from './fraud-detection';

// Blacklist
export {
  BlacklistManager,
  InMemoryBlacklistDataSource,
  BlacklistCache,
  type IBlacklistDataSource,
} from './blacklist-manager';

// Audit trail
export {
  AuditTrail,
  AuditTrailService,
  InMemoryAuditRepository,
  NodeCryptoUtils,
  type IAuditTrail,
  type IAuditRepository,
  type IAuditTrailService,
  type RecordEventParams,
  type AuditExport,
  type TamperEvidence,
  type CryptoUtils,
} from './audit-trail';

// Générateur de rapports
export {
  ReportGenerator,
  XmlReportGenerator,
  CsvReportGenerator,
  PdfReportGenerator,
  JsonReportGenerator,
  type IReportGenerator,
  type ReportData,
} from './report-generator';

// Moteur fiscal OHADA/UEMOA
export {
  OhadaTaxEngine,
  CurrencyConverter,
  DefaultTaxEngineFactory,
  DEFAULT_TAX_CONFIGURATIONS,
  type IOhadaTaxEngine,
  type ICurrencyConverter,
  type ImportTaxParams,
  type SaleTaxParams,
  type TaxConfiguration,
  type TaxEngineFactory,
} from './ohada-tax-engine';
