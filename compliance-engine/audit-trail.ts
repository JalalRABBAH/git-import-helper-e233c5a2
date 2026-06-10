// =============================================================================
// iReg Moto BF — Audit Trail Immuable
// Chaînage SHA-256 | Horodatage cryptographique | Signature numérique
// Vérification d'intégrité | Export pour inspection
// =============================================================================

import {
  AuditEvent,
  AuditEventType,
  AuditTrailVerificationResult,
  StructuredLogger,
  ConsoleLogger,
} from './types';

// ============================================================================
// UTILITAIRES CRYPTOGRAPHIQUES (Node.js crypto)
// ============================================================================

import { createHash, randomBytes, createSign, createVerify, generateKeyPairSync } from 'crypto';

export interface CryptoUtils {
  sha256(data: string): string;
  generateSignature(data: string, privateKey: string): string;
  verifySignature(data: string, signature: string, publicKey: string): boolean;
  generateKeyPair(): { publicKey: string; privateKey: string };
  generateNonce(): string;
}

export class NodeCryptoUtils implements CryptoUtils {
  sha256(data: string): string {
    return createHash('sha256').update(data, 'utf8').digest('hex');
  }

  generateSignature(data: string, privateKey: string): string {
    const signer = createSign('SHA256');
    signer.update(data, 'utf8');
    signer.end();
    return signer.sign(privateKey, 'base64');
  }

  verifySignature(data: string, signature: string, publicKey: string): boolean {
    const verifier = createVerify('SHA256');
    verifier.update(data, 'utf8');
    verifier.end();
    return verifier.verify(publicKey, signature, 'base64');
  }

  generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { publicKey, privateKey };
  }

  generateNonce(): string {
    return randomBytes(16).toString('hex');
  }
}

// ============================================================================
// REPOSITORY — Stockage des événements d'audit
// ============================================================================

export interface IAuditRepository {
  save(event: AuditEvent): Promise<AuditEvent>;
  findByAggregate(aggregateType: string, aggregateId: string): Promise<AuditEvent[]>;
  findByEventType(eventType: AuditEventType): Promise<AuditEvent[]>;
  findByUser(userId: string): Promise<AuditEvent[]>;
  findByDateRange(start: Date, end: Date): Promise<AuditEvent[]>;
  getLastEvent(): Promise<AuditEvent | null>;
  getEventBySequence(sequenceNumber: number): Promise<AuditEvent | null>;
  getAllEvents(): Promise<AuditEvent[]>;
}

export class InMemoryAuditRepository implements IAuditRepository {
  private events: AuditEvent[] = [];
  private sequenceCounter = 0;

  async save(event: AuditEvent): Promise<AuditEvent> {
    // Assign sequence number if not set
    if (event.sequenceNumber <= 0) {
      this.sequenceCounter++;
      event.sequenceNumber = this.sequenceCounter;
    } else {
      this.sequenceCounter = Math.max(this.sequenceCounter, event.sequenceNumber);
    }
    this.events.push(event);
    return event;
  }

  async findByAggregate(aggregateType: string, aggregateId: string): Promise<AuditEvent[]> {
    return this.events.filter(e =>
      e.aggregateType === aggregateType && e.aggregateId === aggregateId
    );
  }

  async findByEventType(eventType: AuditEventType): Promise<AuditEvent[]> {
    return this.events.filter(e => e.eventType === eventType);
  }

  async findByUser(userId: string): Promise<AuditEvent[]> {
    return this.events.filter(e => e.actorUserId === userId);
  }

  async findByDateRange(start: Date, end: Date): Promise<AuditEvent[]> {
    return this.events.filter(e => e.timestamp >= start && e.timestamp <= end);
  }

  async getLastEvent(): Promise<AuditEvent | null> {
    if (this.events.length === 0) return null;
    return this.events.reduce((latest, e) =>
      e.sequenceNumber > latest.sequenceNumber ? e : latest
    );
  }

  async getEventBySequence(sequenceNumber: number): Promise<AuditEvent | null> {
    return this.events.find(e => e.sequenceNumber === sequenceNumber) ?? null;
  }

  async getAllEvents(): Promise<AuditEvent[]> {
    return [...this.events];
  }
}

// ============================================================================
// AUDIT TRAIL — Chaînage SHA-256 immuable
// ============================================================================

export interface IAuditTrail {
  recordEvent(params: RecordEventParams): Promise<AuditEvent>;
  verifyIntegrity(): Promise<AuditTrailVerificationResult>;
  verifyChainSegment(startSeq: number, endSeq: number): Promise<AuditTrailVerificationResult>;
  exportForInspection(startDate?: Date, endDate?: Date): Promise<AuditExport>;
  getEventHistory(aggregateType: string, aggregateId: string): Promise<AuditEvent[]>;
  getTamperEvidence(): Promise<TamperEvidence | null>;
}

export interface RecordEventParams {
  eventType: AuditEventType;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  actorUserId?: string;
  actorIpAddress?: string;
}

export interface AuditExport {
  events: AuditEvent[];
  exportDate: Date;
  eventCount: number;
  chainHash: string;
  integrityProof: string;
  exportedBy?: string;
}

export interface TamperEvidence {
  sequenceNumber: number;
  expectedHash: string;
  actualHash: string;
  detectedAt: Date;
  eventDetails: AuditEvent;
}

export class AuditTrail implements IAuditTrail {
  private repository: IAuditRepository;
  private crypto: CryptoUtils;
  private privateKey: string | null;
  private publicKey: string | null;
  private logger: StructuredLogger;

  constructor(options: {
    repository?: IAuditRepository;
    crypto?: CryptoUtils;
    privateKey?: string;
    publicKey?: string;
    logger?: StructuredLogger;
  } = {}) {
    this.repository = options.repository ?? new InMemoryAuditRepository();
    this.crypto = options.crypto ?? new NodeCryptoUtils();
    this.privateKey = options.privateKey ?? null;
    this.publicKey = options.publicKey ?? null;
    this.logger = options.logger ?? new ConsoleLogger();
  }

  /**
   * Génère une paire de clés pour la signature
   */
  generateKeyPair(): { publicKey: string; privateKey: string } {
    const pair = this.crypto.generateKeyPair();
    this.privateKey = pair.privateKey;
    this.publicKey = pair.publicKey;
    this.logger.info('New RSA key pair generated for audit trail signing');
    return pair;
  }

  /**
   * Enregistre un événement avec chaînage SHA-256
   */
  async recordEvent(params: RecordEventParams): Promise<AuditEvent> {
    // Get previous event for chaining
    const lastEvent = await this.repository.getLastEvent();
    const previousHash = lastEvent?.eventHash ?? '0';

    const timestamp = new Date();
    const sequenceNumber = lastEvent ? lastEvent.sequenceNumber + 1 : 1;

    // Build payload string for hashing
    const payloadStr = JSON.stringify(params.payload, Object.keys(params.payload).sort());
    const hashInput = `${payloadStr}|${previousHash}|${timestamp.toISOString()}|${sequenceNumber}`;
    const eventHash = this.crypto.sha256(hashInput);

    // Build event
    const event: AuditEvent = {
      id: this.generateEventId(),
      eventType: params.eventType,
      aggregateType: params.aggregateType,
      aggregateId: params.aggregateId,
      payload: params.payload,
      previousHash,
      eventHash,
      actorUserId: params.actorUserId,
      actorIpAddress: params.actorIpAddress,
      timestamp,
      sequenceNumber,
    };

    // Sign if private key available
    if (this.privateKey) {
      const signData = `${eventHash}|${event.sequenceNumber}|${event.timestamp.toISOString()}`;
      event.digitalSignature = this.crypto.generateSignature(signData, this.privateKey);
    }

    const saved = await this.repository.save(event);

    this.logger.info('Audit event recorded', {
      eventType: params.eventType,
      aggregateType: params.aggregateType,
      aggregateId: params.aggregateId,
      sequenceNumber: saved.sequenceNumber,
      hasSignature: !!saved.digitalSignature,
    });

    return saved;
  }

  /**
   * Vérifie l'intégrité complète de la chaîne
   */
  async verifyIntegrity(): Promise<AuditTrailVerificationResult> {
    const allEvents = await this.repository.getAllEvents();

    if (allEvents.length === 0) {
      return { isValid: true, totalEvents: 0, verifiedAt: new Date() };
    }

    // Sort by sequence number
    const sorted = [...allEvents].sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    let previousHash = '0';

    for (const event of sorted) {
      // Verify chain continuity
      if (event.previousHash !== previousHash) {
        this.logger.error('Chain break detected', {
          sequenceNumber: event.sequenceNumber,
          expectedPrevHash: previousHash,
          actualPrevHash: event.previousHash,
        });
        return {
          isValid: false,
          totalEvents: sorted.length,
          brokenAtSequence: event.sequenceNumber,
          expectedHash: previousHash,
          actualHash: event.previousHash,
          verifiedAt: new Date(),
        };
      }

      // Recalculate hash
      const payloadStr = JSON.stringify(event.payload, Object.keys(event.payload).sort());
      const hashInput = `${payloadStr}|${event.previousHash}|${event.timestamp.toISOString()}|${event.sequenceNumber}`;
      const calculatedHash = this.crypto.sha256(hashInput);

      if (calculatedHash !== event.eventHash) {
        this.logger.error('Hash mismatch detected', {
          sequenceNumber: event.sequenceNumber,
          expectedHash: calculatedHash,
          actualHash: event.eventHash,
        });
        return {
          isValid: false,
          totalEvents: sorted.length,
          brokenAtSequence: event.sequenceNumber,
          expectedHash: calculatedHash,
          actualHash: event.eventHash,
          verifiedAt: new Date(),
        };
      }

      // Verify signature if present
      if (event.digitalSignature && this.publicKey) {
        const signData = `${event.eventHash}|${event.sequenceNumber}|${event.timestamp.toISOString()}`;
        const valid = this.crypto.verifySignature(signData, event.digitalSignature, this.publicKey);
        if (!valid) {
          this.logger.error('Signature verification failed', {
            sequenceNumber: event.sequenceNumber,
          });
          return {
            isValid: false,
            totalEvents: sorted.length,
            brokenAtSequence: event.sequenceNumber,
            verifiedAt: new Date(),
          };
        }
      }

      previousHash = event.eventHash;
    }

    this.logger.info('Audit chain integrity verified', {
      totalEvents: sorted.length,
      isValid: true,
    });

    return {
      isValid: true,
      totalEvents: sorted.length,
      verifiedAt: new Date(),
    };
  }

  /**
   * Vérifie un segment de la chaîne
   */
  async verifyChainSegment(startSeq: number, endSeq: number): Promise<AuditTrailVerificationResult> {
    const allEvents = await this.repository.getAllEvents();
    const segment = allEvents
      .filter(e => e.sequenceNumber >= startSeq && e.sequenceNumber <= endSeq)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    if (segment.length === 0) {
      return { isValid: true, totalEvents: 0, verifiedAt: new Date() };
    }

    // Get the event just before the segment for chain continuity
    const prevEvent = allEvents.find(e => e.sequenceNumber === startSeq - 1);
    let previousHash = prevEvent?.eventHash ?? '0';

    for (const event of segment) {
      if (event.previousHash !== previousHash) {
        return {
          isValid: false,
          totalEvents: segment.length,
          brokenAtSequence: event.sequenceNumber,
          expectedHash: previousHash,
          actualHash: event.previousHash,
          verifiedAt: new Date(),
        };
      }

      const payloadStr = JSON.stringify(event.payload, Object.keys(event.payload).sort());
      const hashInput = `${payloadStr}|${event.previousHash}|${event.timestamp.toISOString()}|${event.sequenceNumber}`;
      const calculatedHash = this.crypto.sha256(hashInput);

      if (calculatedHash !== event.eventHash) {
        return {
          isValid: false,
          totalEvents: segment.length,
          brokenAtSequence: event.sequenceNumber,
          expectedHash: calculatedHash,
          actualHash: event.eventHash,
          verifiedAt: new Date(),
        };
      }

      previousHash = event.eventHash;
    }

    return {
      isValid: true,
      totalEvents: segment.length,
      verifiedAt: new Date(),
    };
  }

  /**
   * Exporte les événements pour inspection
   */
  async exportForInspection(startDate?: Date, endDate?: Date): Promise<AuditExport> {
    let events: AuditEvent[];

    if (startDate && endDate) {
      events = await this.repository.findByDateRange(startDate, endDate);
    } else {
      events = await this.repository.getAllEvents();
    }

    // Sort by sequence
    events.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    // Calculate chain hash (Merkle root concept)
    const chainHashes = events.map(e => e.eventHash);
    const chainHash = this.calculateMerkleRoot(chainHashes);

    // Integrity proof
    const integrityResult = await this.verifyIntegrity();
    const integrityProof = integrityResult.isValid
      ? `INTEGRITY_VERIFIED:${integrityResult.totalEvents}:${integrityResult.verifiedAt!.toISOString()}`
      : `INTEGRITY_BROKEN:${integrityResult.brokenAtSequence}`;

    return {
      events,
      exportDate: new Date(),
      eventCount: events.length,
      chainHash,
      integrityProof,
    };
  }

  /**
   * Récupère l'historique d'un agrégat
   */
  async getEventHistory(aggregateType: string, aggregateId: string): Promise<AuditEvent[]> {
    return this.repository.findByAggregate(aggregateType, aggregateId);
  }

  /**
   * Détecte des preuves de falsification
   */
  async getTamperEvidence(): Promise<TamperEvidence | null> {
    const result = await this.verifyIntegrity();
    if (result.isValid) return null;

    const brokenEvent = await this.repository.getEventBySequence(result.brokenAtSequence!);
    if (!brokenEvent) return null;

    return {
      sequenceNumber: result.brokenAtSequence!,
      expectedHash: result.expectedHash!,
      actualHash: brokenEvent.eventHash,
      detectedAt: new Date(),
      eventDetails: brokenEvent,
    };
  }

  /**
   * Calcule la racine de Merkle pour une liste de hashes
   */
  private calculateMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return this.crypto.sha256('empty');
    if (hashes.length === 1) return hashes[0];

    let level = [...hashes];
    while (level.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = level[i + 1] ?? left; // Duplicate last if odd
        nextLevel.push(this.crypto.sha256(left + right));
      }
      level = nextLevel;
    }
    return level[0];
  }

  private generateEventId(): string {
    return `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// ============================================================================
// AUDIT TRAIL SERVICE — API haut niveau pour les modules métier
// ============================================================================

export interface IAuditTrailService {
  logStockCreation(userId: string, vehicleId: string, vin: string, metadata?: Record<string, unknown>): Promise<AuditEvent>;
  logStockUpdate(userId: string, vehicleId: string, changes: Record<string, unknown>): Promise<AuditEvent>;
  logStockDeletion(userId: string, vehicleId: string, reason: string): Promise<AuditEvent>;
  logSale(userId: string, saleId: string, vehicleId: string, clientId: string, amount: number): Promise<AuditEvent>;
  logOwnershipTransfer(userId: string, vehicleId: string, fromClientId: string, toClientId: string): Promise<AuditEvent>;
  logPriceChange(userId: string, vehicleId: string, oldPrice: number, newPrice: number): Promise<AuditEvent>;
  logReportSubmission(userId: string, reportId: string, actorId: string, quarter: string): Promise<AuditEvent>;
  logComplianceStatusChange(userId: string, actorId: string, oldStatus: string, newStatus: string, score: number): Promise<AuditEvent>;
  logAdminAction(userId: string, action: string, targetType: string, targetId: string, details?: Record<string, unknown>): Promise<AuditEvent>;
  verifyIntegrity(): Promise<AuditTrailVerificationResult>;
}

export class AuditTrailService implements IAuditTrailService {
  private auditTrail: IAuditTrail;
  private logger: StructuredLogger;

  constructor(auditTrail?: IAuditTrail, logger?: StructuredLogger) {
    this.auditTrail = auditTrail ?? new AuditTrail();
    this.logger = logger ?? new ConsoleLogger();
  }

  async logStockCreation(userId: string, vehicleId: string, vin: string, metadata?: Record<string, unknown>): Promise<AuditEvent> {
    return this.auditTrail.recordEvent({
      eventType: AuditEventType.STOCK_CREATED,
      aggregateType: 'vehicle',
      aggregateId: vehicleId,
      payload: { vin, action: 'CREATE', metadata: metadata ?? {} },
      actorUserId: userId,
    });
  }

  async logStockUpdate(userId: string, vehicleId: string, changes: Record<string, unknown>): Promise<AuditEvent> {
    return this.auditTrail.recordEvent({
      eventType: AuditEventType.STOCK_UPDATED,
      aggregateType: 'vehicle',
      aggregateId: vehicleId,
      payload: { changes, action: 'UPDATE' },
      actorUserId: userId,
    });
  }

  async logStockDeletion(userId: string, vehicleId: string, reason: string): Promise<AuditEvent> {
    return this.auditTrail.recordEvent({
      eventType: AuditEventType.STOCK_DELETED,
      aggregateType: 'vehicle',
      aggregateId: vehicleId,
      payload: { reason, action: 'DELETE' },
      actorUserId: userId,
    });
  }

  async logSale(userId: string, saleId: string, vehicleId: string, clientId: string, amount: number): Promise<AuditEvent> {
    return this.auditTrail.recordEvent({
      eventType: AuditEventType.SALE_RECORDED,
      aggregateType: 'sale',
      aggregateId: saleId,
      payload: { vehicleId, clientId, amount, action: 'SALE' },
      actorUserId: userId,
    });
  }

  async logOwnershipTransfer(userId: string, vehicleId: string, fromClientId: string, toClientId: string): Promise<AuditEvent> {
    return this.auditTrail.recordEvent({
      eventType: AuditEventType.OWNERSHIP_TRANSFERRED,
      aggregateType: 'vehicle',
      aggregateId: vehicleId,
      payload: { fromClientId, toClientId, action: 'TRANSFER' },
      actorUserId: userId,
    });
  }

  async logPriceChange(userId: string, vehicleId: string, oldPrice: number, newPrice: number): Promise<AuditEvent> {
    return this.auditTrail.recordEvent({
      eventType: AuditEventType.PRICE_CHANGED,
      aggregateType: 'vehicle',
      aggregateId: vehicleId,
      payload: { oldPrice, newPrice, variation: newPrice - oldPrice, variationRate: ((newPrice - oldPrice) / oldPrice * 100).toFixed(2) + '%', action: 'PRICE_CHANGE' },
      actorUserId: userId,
    });
  }

  async logReportSubmission(userId: string, reportId: string, actorId: string, quarter: string): Promise<AuditEvent> {
    return this.auditTrail.recordEvent({
      eventType: AuditEventType.REPORT_SUBMITTED,
      aggregateType: 'quarterly_report',
      aggregateId: reportId,
      payload: { actorId, quarter, action: 'SUBMIT' },
      actorUserId: userId,
    });
  }

  async logComplianceStatusChange(userId: string, actorId: string, oldStatus: string, newStatus: string, score: number): Promise<AuditEvent> {
    return this.auditTrail.recordEvent({
      eventType: AuditEventType.COMPLIANCE_STATUS_CHANGED,
      aggregateType: 'actor',
      aggregateId: actorId,
      payload: { oldStatus, newStatus, score, action: 'STATUS_CHANGE' },
      actorUserId: userId,
    });
  }

  async logAdminAction(userId: string, action: string, targetType: string, targetId: string, details?: Record<string, unknown>): Promise<AuditEvent> {
    return this.auditTrail.recordEvent({
      eventType: AuditEventType.ADMIN_ACTION,
      aggregateType: targetType,
      aggregateId: targetId,
      payload: { adminAction: action, details: details ?? {}, action: 'ADMIN' },
      actorUserId: userId,
    });
  }

  async verifyIntegrity(): Promise<AuditTrailVerificationResult> {
    return this.auditTrail.verifyIntegrity();
  }
}
