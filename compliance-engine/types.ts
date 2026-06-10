// =============================================================================
// iReg Moto BF — Types communs du moteur de conformité et sécurité
// =============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export enum ActorType {
  IMPORTATEUR = 'IMPORTATEUR',
  DISTRIBUTEUR = 'DISTRIBUTEUR',
  ASSEMBLEUR = 'ASSEMBLEUR',
  DETAILLANT = 'DETAILLANT',
  PRESTATAIRE = 'PRESTATAIRE',
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT_MINOR = 'NON_COMPLIANT_MINOR',
  NON_COMPLIANT_MAJOR = 'NON_COMPLIANT_MAJOR',
  PENDING_REVIEW = 'PENDING_REVIEW',
  EXEMPTED = 'EXEMPTED',
}

export enum ComplianceSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  BLOCKER = 'BLOCKER',
}

export enum ChecklistItemStatus {
  CONFORME = 'CONFORME',
  NON_CONFORME = 'NON_CONFORME',
  NA = 'NA',
  PENDING = 'PENDING',
}

export enum OverallComplianceStatus {
  VERT = 'VERT',
  ORANGE = 'ORANGE',
  ROUGE = 'ROUGE',
}

export enum FraudAlertLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum FraudAlertType {
  MULTIPLE_PURCHASE = 'MULTIPLE_PURCHASE',
  BORDER_ZONE_SALE = 'BORDER_ZONE_SALE',
  CASH_PAYMENT_ANOMALY = 'CASH_PAYMENT_ANOMALY',
  PRICE_DEVIATION = 'PRICE_DEVIATION',
  FORBIDDEN_MODEL = 'FORBIDDEN_MODEL',
  INVALID_ID_DOCUMENT = 'INVALID_ID_DOCUMENT',
  OFF_HOURS_TRANSACTION = 'OFF_HOURS_TRANSACTION',
  VOLUME_ANOMALY = 'VOLUME_ANOMALY',
}

export enum BlacklistType {
  VEHICLE = 'VEHICLE',
  CLIENT = 'CLIENT',
  ACTOR = 'ACTOR',
  MODEL = 'MODEL',
  ZONE = 'ZONE',
}

export enum AuditEventType {
  STOCK_CREATED = 'STOCK_CREATED',
  STOCK_UPDATED = 'STOCK_UPDATED',
  STOCK_DELETED = 'STOCK_DELETED',
  SALE_RECORDED = 'SALE_RECORDD',
  SALE_TRANSFERRED = 'SALE_TRANSFERRED',
  OWNERSHIP_TRANSFERRED = 'OWNERSHIP_TRANSFERRED',
  PRICE_CHANGED = 'PRICE_CHANGED',
  REPORT_SUBMITTED = 'REPORT_SUBMITTED',
  COMPLIANCE_STATUS_CHANGED = 'COMPLIANCE_STATUS_CHANGED',
  ADMIN_ACTION = 'ADMIN_ACTION',
}

export enum ReportFormat {
  XML_UEMOA = 'XML_UEMOA',
  PDF_SIGNED = 'PDF_SIGNED',
  CSV = 'CSV',
  JSON = 'JSON',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

// ---------------------------------------------------------------------------
// Interfaces de base
// ---------------------------------------------------------------------------

export interface Actor {
  id: string;
  actorType: ActorType;
  companyName: string;
  tradeName?: string;
  nif: string;
  rccm?: string;
  status: string;
  agreementNumber?: string;
  agreementStatus?: string;
  agreementIssuedAt?: Date;
  agreementExpiresAt?: Date;
  complianceScore?: number;
  lastComplianceCheckAt?: Date;
  complianceCountdownDays?: number;
  region: string;
  city: string;
  addressLine1: string;
  gpsCoordinates?: { lat: number; lng: number };
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface Vehicle {
  id: string;
  vin: string;
  chassisNumber?: string;
  engineNumber?: string;
  manufacturer: string;
  model: string;
  modelYear: number;
  categoryId: string;
  categoryCode?: string;
  fuelType: string;
  cylinderCapacityCc?: number;
  powerKw?: number;
  color?: string;
  status: string;
  currentOwnerActorId?: string;
  currentWarehouseId?: string;
  currentClientId?: string;
  importCountryCode?: string;
  importDeclarationNumber?: string;
  importDate?: Date;
  customsValue?: number;
  qrCode?: string;
  rfidTag?: string;
  homologationNumber?: string;
  homologationValidUntil?: Date;
  complianceStatus?: string;
  metadata?: Record<string, unknown>;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  idDocumentType: string;
  idDocumentNumber: string;
  idDocumentIssuedAt?: Date;
  idDocumentExpiresAt?: Date;
  phone: string;
  email?: string;
  addressLine1?: string;
  city?: string;
  region?: string;
  status: string;
  kycVerifiedAt?: Date;
  kycRiskLevel?: string;
  biometricEnrolled: boolean;
  registeredByActorId: string;
  photoUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface Sale {
  id: string;
  actorId: string;
  warehouseId?: string;
  clientId: string;
  userId?: string;
  status: string;
  paymentMethod: string;
  paymentReference?: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currencyCode: string;
  taxBreakdown?: Record<string, number>;
  saleDate: Date;
  saleLocation?: { lat: number; lng: number };
  items: SaleItem[];
  metadata?: Record<string, unknown>;
}

export interface SaleItem {
  id: string;
  saleId: string;
  vehicleId: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  taxAmount: number;
  unitCost?: number;
  marginAmount?: number;
  marginRate?: number;
}

export interface Warehouse {
  id: string;
  actorId: string;
  name: string;
  code: string;
  addressLine1: string;
  city: string;
  region: string;
  gpsCoordinates?: { lat: number; lng: number };
  isPrimary: boolean;
  capacityUnits?: number;
  securityLevel: string;
  isActive: boolean;
}

export interface PurchasePrice {
  id: string;
  actorId: string;
  vehicleCategoryId?: string;
  manufacturer?: string;
  model?: string;
  modelYear?: number;
  unitPriceForeign: number;
  foreignCurrencyCode: string;
  exchangeRate: number;
  unitPriceXof: number;
  freightCost: number;
  insuranceCost: number;
  customsDuties: number;
  otherCosts: number;
  totalLandedCost: number;
  effectiveDate: Date;
  isActive: boolean;
}

export interface QuarterlyReport {
  id: string;
  actorId: string;
  year: number;
  quarter: string;
  periodStart: Date;
  periodEnd: Date;
  status: string;
  totalSalesCount: number;
  totalSalesAmount: number;
  totalVehiclesSold: number;
  totalTaxCollected: number;
  totalPurchasesCount: number;
  totalPurchasesAmount: number;
  totalVehiclesImported: number;
  totalCustomsDuties: number;
  stockOpeningUnits: number;
  stockClosingUnits: number;
  complianceScore?: number;
  submittedAt?: Date;
  xmlReportPath?: string;
  pdfReportPath?: string;
}

// ---------------------------------------------------------------------------
// Interfaces pour le moteur de règles
// ---------------------------------------------------------------------------

export interface RuleContext {
  actor: Actor;
  vehicles?: Vehicle[];
  sales?: Sale[];
  clients?: Client[];
  warehouses?: Warehouse[];
  purchasePrices?: PurchasePrice[];
  inventoryCounts?: InventoryCount[];
  quarterlyReports?: QuarterlyReport[];
  documents?: ActorDocument[];
  blacklistManager?: IBlacklistManager;
  referenceDate?: Date;
}

export interface ActorDocument {
  id: string;
  actorId: string;
  documentType: string;
  documentLabel: string;
  fileName: string;
  issuedDate?: Date;
  expiryDate?: Date;
  isVerified: boolean;
  storagePath: string;
}

export interface InventoryCount {
  id: string;
  warehouseId: string;
  actorId: string;
  status: string;
  plannedDate: Date;
  completedAt?: Date;
  totalUnitsExpected: number;
  totalUnitsCounted: number;
  discrepancyUnits: number;
}

export interface RuleResult {
  ruleId: string;
  category: RuleCategory;
  ruleCode: string;
  description: string;
  points: number;
  pointsEarned: number;
  isCompliant: boolean;
  severity: ComplianceSeverity;
  observedValue?: string;
  expectedValue?: string;
  gapDescription?: string;
  correctiveAction?: string;
  evidenceRequired?: string;
  evaluatedAt: Date;
}

export type RuleCategory =
  | 'A_REGISTRATION'
  | 'B_PREMISES'
  | 'C_STOCK_MANAGEMENT'
  | 'D_CLIENT_REGISTRY'
  | 'E_PRICING'
  | 'F_REPORTING';

export interface ComplianceEvaluation {
  actorId: string;
  actorType: ActorType;
  evaluatedAt: Date;
  referenceDate: Date;
  ruleResults: RuleResult[];
  totalPoints: number;
  pointsEarned: number;
  scorePercentage: number;
  overallStatus: OverallComplianceStatus;
  gaps: ComplianceGap[];
  actionPlan: CorrectiveAction[];
}

export interface ComplianceGap {
  ruleId: string;
  category: RuleCategory;
  description: string;
  severity: ComplianceSeverity;
  pointsAtStake: number;
  deadline?: Date;
}

export interface CorrectiveAction {
  priority: number;
  gap: ComplianceGap;
  action: string;
  responsible?: string;
  deadline: Date;
  estimatedEffort: string;
}

// ---------------------------------------------------------------------------
// Interfaces pour la checklist
// ---------------------------------------------------------------------------

export interface ChecklistItem {
  id: string;
  ruleId: string;
  category: RuleCategory;
  description: string;
  points: number;
  status: ChecklistItemStatus;
  requiredEvidence: string;
  evaluatedAt?: Date;
  evaluatedBy?: string;
  notes?: string;
}

export interface ComplianceChecklist {
  id: string;
  actorId: string;
  actorType: ActorType;
  checklistType: string;
  periodStart: Date;
  periodEnd: Date;
  items: ChecklistItem[];
  totalPoints: number;
  pointsEarned: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Interfaces pour le scoring
// ---------------------------------------------------------------------------

export interface ScoreHistoryEntry {
  actorId: string;
  evaluatedAt: Date;
  overallScore: number;
  categoryScores: Record<RuleCategory, number>;
  trend: ScoreTrend;
}

export type ScoreTrend = 'IMPROVING' | 'STABLE' | 'DECLINING' | 'CRITICAL';

export interface SectorComparison {
  actorId: string;
  actorType: ActorType;
  actorScore: number;
  sectorAverage: number;
  sectorMedian: number;
  sectorBest: number;
  sectorWorst: number;
  percentile: number;
  comparisonDate: Date;
}

export interface CompliancePrediction {
  actorId: string;
  currentScore: number;
  predictedScore30d: number;
  predictedScore90d: number;
  confidence: number;
  trend: ScoreTrend;
  riskFactors: string[];
  predictedAt: Date;
}

// ---------------------------------------------------------------------------
// Interfaces pour le compte à rebours
// ---------------------------------------------------------------------------

export interface ComplianceCountdown {
  actorId: string;
  actorType: ActorType;
  decreeDate: Date;
  deadlineDate: Date;
  daysRemaining: number;
  gracePeriodDays: number;
  escalationLevel: EscalationLevel;
  nextMilestone: CountdownMilestone;
  notificationsSent: NotificationRecord[];
}

export interface EscalationLevel {
  level: number;
  label: string;
  daysThreshold: number;
  actions: string[];
}

export interface CountdownMilestone {
  days: number;
  label: string;
  date: Date;
  actionRequired: string;
}

export interface NotificationRecord {
  channel: NotificationChannel;
  sentAt: Date;
  template: string;
  delivered: boolean;
}

// ---------------------------------------------------------------------------
// Interfaces pour la détection de fraude
// ---------------------------------------------------------------------------

export interface FraudAlert {
  id: string;
  alertType: FraudAlertType;
  level: FraudAlertLevel;
  title: string;
  description: string;
  riskScore: number;
  evidence: FraudEvidence[];
  recommendation: string;
  actorId?: string;
  clientId?: string;
  saleId?: string;
  vehicleId?: string;
  createdAt: Date;
  status: string;
}

export interface FraudEvidence {
  key: string;
  value: unknown;
  source: string;
}

export interface FraudDetectionContext {
  sale?: Sale;
  actor?: Actor;
  client?: Client;
  vehicle?: Vehicle;
  actorSales?: Sale[];
  sectorPrices?: SectorPriceStats;
}

export interface SectorPriceStats {
  averageSellingPrice: number;
  medianSellingPrice: number;
  stdDeviation: number;
  sampleSize: number;
  byCategory: Record<string, { avg: number; median: number; std: number }>;
}

// ---------------------------------------------------------------------------
// Interfaces pour la blacklist
// ---------------------------------------------------------------------------

export interface IBlacklistManager {
  isVehicleBlacklisted(vin: string): Promise<boolean>;
  isClientBlacklisted(clientId: string): Promise<boolean>;
  isModelBlacklisted(manufacturer: string, model: string, year: number): Promise<boolean>;
  isZoneRestricted(lat: number, lng: number): Promise<{ restricted: boolean; reason?: string }>;
  getBlacklistedModels(): Promise<BlacklistedModel[]>;
  getRestrictedZones(): Promise<RestrictedZone[]>;
  refreshCache(): Promise<void>;
}

export interface BlacklistedModel {
  id: string;
  manufacturer: string;
  model: string;
  yearFrom: number;
  yearTo?: number;
  reason: string;
  bannedSince: Date;
  source: string;
}

export interface RestrictedZone {
  id: string;
  name: string;
  riskLevel: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  reason: string;
  validFrom: Date;
  validTo?: Date;
}

export interface BlacklistedEntry {
  id: string;
  blacklistType: BlacklistType;
  entityIdentifier: string;
  reason: string;
  source: string;
  blacklistedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Interfaces pour l'audit trail
// ---------------------------------------------------------------------------

export interface AuditEvent {
  id: string;
  eventType: AuditEventType;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  previousHash: string | null;
  eventHash: string;
  actorUserId?: string;
  actorIpAddress?: string;
  timestamp: Date;
  sequenceNumber: number;
  digitalSignature?: string;
}

export interface AuditTrailVerificationResult {
  isValid: boolean;
  totalEvents: number;
  brokenAtSequence?: number;
  expectedHash?: string;
  actualHash?: string;
  verifiedAt: Date;
}

// ---------------------------------------------------------------------------
// Interfaces pour les rapports
// ---------------------------------------------------------------------------

export interface GeneratedReport {
  format: ReportFormat;
  content: Buffer | string;
  fileName: string;
  mimeType: string;
  checksum: string;
  generatedAt: Date;
  digitalSignature?: string;
}

export interface ReportContent {
  actor: Actor;
  periodStart: Date;
  periodEnd: Date;
  openingStock: StockEntry[];
  closingStock: StockEntry[];
  clients: Client[];
  sales: Sale[];
  purchasePrices: PurchasePrice[];
  anomalies: string[];
}

export interface StockEntry {
  vehicleId: string;
  vin: string;
  manufacturer: string;
  model: string;
  category: string;
  status: string;
  qrCode?: string;
}

// ---------------------------------------------------------------------------
// Interfaces pour le moteur fiscal
// ---------------------------------------------------------------------------

export interface TaxCalculation {
  taxCode: string;
  taxLabel: string;
  category: TaxCategory;
  rateType: RateType;
  rateValue?: number;
  fixedAmount?: number;
  calculatedAmount: number;
  currencyCode: string;
  legalReference?: string;
}

export type TaxCategory = 'CUSTOMS' | 'VAT' | 'EXCISE' | 'REGISTRATION' | 'OHADA' | 'COMMUNITY';
export type RateType = 'PERCENTAGE' | 'FIXED' | 'SLIDING';

export interface FiscalBreakdown {
  baseAmount: number;
  currencyCode: string;
  exchangeRate?: number;
  taxes: TaxCalculation[];
  totalTaxes: number;
  totalWithTaxes: number;
  effectiveDate: Date;
}

export interface CurrencyRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: Date;
  source: string;
}

// ---------------------------------------------------------------------------
// Interfaces pour les logs structurés
// ---------------------------------------------------------------------------

export interface StructuredLogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export class ConsoleLogger implements StructuredLogger {
  private format(meta?: Record<string, unknown>): string {
    return meta ? ` | ${JSON.stringify(meta)}` : '';
  }
  debug(message: string, meta?: Record<string, unknown>): void {
    console.debug(`[DEBUG] ${message}${this.format(meta)}`);
  }
  info(message: string, meta?: Record<string, unknown>): void {
    console.info(`[INFO] ${message}${this.format(meta)}`);
  }
  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}${this.format(meta)}`);
  }
  error(message: string, meta?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}${this.format(meta)}`);
  }
}
