// =============================================================================
// Tests — Audit Trail (chaînage SHA-256 immuable)
// =============================================================================

describe('AuditTrail', () => {
  test('should record an event with hash chain', async () => {
    const { AuditTrail } = await import('../audit-trail');
    const audit = new AuditTrail();

    const event = await audit.recordEvent({
      eventType: 'STOCK_CREATED' as any,
      aggregateType: 'vehicle',
      aggregateId: 'v-1',
      payload: { vin: 'MLHXB8012JK123456', manufacturer: 'HONDA' },
      actorUserId: 'user-1',
    });

    expect(event).toBeDefined();
    expect(event.id).toBeDefined();
    expect(event.eventHash).toBeDefined();
    expect(event.eventHash.length).toBe(64); // SHA-256 hex
    expect(event.sequenceNumber).toBe(1);
    expect(event.previousHash).toBe('0');
    expect(event.timestamp).toBeInstanceOf(Date);
  });

  test('should chain events correctly', async () => {
    const { AuditTrail } = await import('../audit-trail');
    const audit = new AuditTrail();

    const event1 = await audit.recordEvent({
      eventType: 'STOCK_CREATED' as any,
      aggregateType: 'vehicle',
      aggregateId: 'v-1',
      payload: { vin: 'MLHXB8012JK123456' },
      actorUserId: 'user-1',
    });

    const event2 = await audit.recordEvent({
      eventType: 'STOCK_UPDATED' as any,
      aggregateType: 'vehicle',
      aggregateId: 'v-1',
      payload: { status: 'SOLD' },
      actorUserId: 'user-1',
    });

    expect(event2.sequenceNumber).toBe(event1.sequenceNumber + 1);
    expect(event2.previousHash).toBe(event1.eventHash);
    expect(event2.eventHash).not.toBe(event1.eventHash);
  });

  test('should verify chain integrity', async () => {
    const { AuditTrail } = await import('../audit-trail');
    const audit = new AuditTrail();

    // Record multiple events
    for (let i = 0; i < 5; i++) {
      await audit.recordEvent({
        eventType: 'STOCK_CREATED' as any,
        aggregateType: 'vehicle',
        aggregateId: `v-${i}`,
        payload: { index: i },
        actorUserId: 'user-1',
      });
    }

    const result = await audit.verifyIntegrity();
    expect(result.isValid).toBe(true);
    expect(result.totalEvents).toBe(5);
  });

  test('should detect tampered event', async () => {
    const { AuditTrail, InMemoryAuditRepository } = await import('../audit-trail');
    const repo = new InMemoryAuditRepository();
    const audit = new AuditTrail({ repository: repo });

    const event1 = await audit.recordEvent({
      eventType: 'STOCK_CREATED' as any,
      aggregateType: 'vehicle',
      aggregateId: 'v-1',
      payload: { vin: 'ORIGINAL' },
      actorUserId: 'user-1',
    });

    await audit.recordEvent({
      eventType: 'STOCK_UPDATED' as any,
      aggregateType: 'vehicle',
      aggregateId: 'v-1',
      payload: { status: 'SOLD' },
      actorUserId: 'user-1',
    });

    // Tamper with the event in repository (simulating attack)
    const allEvents = await repo.getAllEvents();
    const tamperedEvent = allEvents.find(e => e.sequenceNumber === 1);
    if (tamperedEvent) {
      tamperedEvent.payload = { vin: 'TAMPERED' };
    }

    const result = await audit.verifyIntegrity();
    expect(result.isValid).toBe(false);
    expect(result.brokenAtSequence).toBeDefined();
  });

  test('should detect broken chain', async () => {
    const { AuditTrail, InMemoryAuditRepository } = await import('../audit-trail');
    const repo = new InMemoryAuditRepository();
    const audit = new AuditTrail({ repository: repo });

    const event1 = await audit.recordEvent({
      eventType: 'STOCK_CREATED' as any,
      aggregateType: 'vehicle',
      aggregateId: 'v-1',
      payload: { vin: 'ORIGINAL' },
      actorUserId: 'user-1',
    });

    await audit.recordEvent({
      eventType: 'STOCK_UPDATED' as any,
      aggregateType: 'vehicle',
      aggregateId: 'v-1',
      payload: { status: 'SOLD' },
      actorUserId: 'user-1',
    });

    // Tamper with the previous hash
    const allEvents = await repo.getAllEvents();
    const tamperedEvent = allEvents.find(e => e.sequenceNumber === 2);
    if (tamperedEvent) {
      tamperedEvent.previousHash = 'wrong-hash';
    }

    const result = await audit.verifyIntegrity();
    expect(result.isValid).toBe(false);
  });

  test('should sign events when key pair exists', async () => {
    const { AuditTrail } = await import('../audit-trail');
    const audit = new AuditTrail();

    // Generate key pair
    audit.generateKeyPair();

    const event = await audit.recordEvent({
      eventType: 'STOCK_CREATED' as any,
      aggregateType: 'vehicle',
      aggregateId: 'v-1',
      payload: { vin: 'MLHXB8012JK123456' },
      actorUserId: 'user-1',
    });

    expect(event.digitalSignature).toBeDefined();
    expect(event.digitalSignature!.length).toBeGreaterThan(0);
  });

  test('should verify signature', async () => {
    const { AuditTrail } = await import('../audit-trail');
    const audit = new AuditTrail();

    audit.generateKeyPair();

    await audit.recordEvent({
      eventType: 'STOCK_CREATED' as any,
      aggregateType: 'vehicle',
      aggregateId: 'v-1',
      payload: { vin: 'MLHXB8012JK123456' },
      actorUserId: 'user-1',
    });

    const result = await audit.verifyIntegrity();
    expect(result.isValid).toBe(true);
  });

  test('should export for inspection', async () => {
    const { AuditTrail } = await import('../audit-trail');
    const audit = new AuditTrail();

    for (let i = 0; i < 3; i++) {
      await audit.recordEvent({
        eventType: 'SALE_RECORDED' as any,
        aggregateType: 'sale',
        aggregateId: `sale-${i}`,
        payload: { amount: 1000 * (i + 1) },
        actorUserId: 'user-1',
      });
    }

    const export_ = await audit.exportForInspection();
    expect(export_.events.length).toBe(3);
    expect(export_.eventCount).toBe(3);
    expect(export_.chainHash).toBeDefined();
    expect(export_.integrityProof).toContain('INTEGRITY_VERIFIED');
    expect(export_.exportDate).toBeInstanceOf(Date);
  });

  test('should get event history for aggregate', async () => {
    const { AuditTrail } = await import('../audit-trail');
    const audit = new AuditTrail();

    await audit.recordEvent({
      eventType: 'STOCK_CREATED' as any,
      aggregateType: 'vehicle',
      aggregateId: 'v-1',
      payload: { action: 'create' },
      actorUserId: 'user-1',
    });

    await audit.recordEvent({
      eventType: 'STOCK_UPDATED' as any,
      aggregateType: 'vehicle',
      aggregateId: 'v-1',
      payload: { action: 'update' },
      actorUserId: 'user-1',
    });

    await audit.recordEvent({
      eventType: 'STOCK_CREATED' as any,
      aggregateType: 'vehicle',
      aggregateId: 'v-2',
      payload: { action: 'create' },
      actorUserId: 'user-1',
    });

    const history = await audit.getEventHistory('vehicle', 'v-1');
    expect(history.length).toBe(2);
    expect(history[0].payload).toEqual({ action: 'create' });
    expect(history[1].payload).toEqual({ action: 'update' });
  });

  test('should detect tamper evidence', async () => {
    const { AuditTrail, InMemoryAuditRepository } = await import('../audit-trail');
    const repo = new InMemoryAuditRepository();
    const audit = new AuditTrail({ repository: repo });

    await audit.recordEvent({
      eventType: 'STOCK_CREATED' as any,
      aggregateType: 'vehicle',
      aggregateId: 'v-1',
      payload: { original: true },
      actorUserId: 'user-1',
    });

    // Tamper
    const events = await repo.getAllEvents();
    if (events[0]) {
      events[0].payload = { tampered: true };
    }

    const tamperEvidence = await audit.getTamperEvidence();
    expect(tamperEvidence).toBeDefined();
    expect(tamperEvidence!.sequenceNumber).toBe(1);
    expect(tamperEvidence!.expectedHash).toBeDefined();
    expect(tamperEvidence!.actualHash).toBeDefined();
  });

  test('should return null tamper evidence for valid chain', async () => {
    const { AuditTrail } = await import('../audit-trail');
    const audit = new AuditTrail();

    await audit.recordEvent({
      eventType: 'STOCK_CREATED' as any,
      aggregateType: 'vehicle',
      aggregateId: 'v-1',
      payload: { original: true },
      actorUserId: 'user-1',
    });

    const tamperEvidence = await audit.getTamperEvidence();
    expect(tamperEvidence).toBeNull();
  });

  test('should verify chain segment', async () => {
    const { AuditTrail } = await import('../audit-trail');
    const audit = new AuditTrail();

    for (let i = 0; i < 10; i++) {
      await audit.recordEvent({
        eventType: 'STOCK_CREATED' as any,
        aggregateType: 'vehicle',
        aggregateId: `v-${i}`,
        payload: { index: i },
        actorUserId: 'user-1',
      });
    }

    const segmentResult = await audit.verifyChainSegment(3, 7);
    expect(segmentResult.isValid).toBe(true);
    expect(segmentResult.totalEvents).toBe(5); // 3,4,5,6,7
  });

  test('should handle empty audit trail', async () => {
    const { AuditTrail } = await import('../audit-trail');
    const audit = new AuditTrail();

    const result = await audit.verifyIntegrity();
    expect(result.isValid).toBe(true);
    expect(result.totalEvents).toBe(0);

    const export_ = await audit.exportForInspection();
    expect(export_.events.length).toBe(0);

    const tamperEvidence = await audit.getTamperEvidence();
    expect(tamperEvidence).toBeNull();
  });
});

describe('AuditTrailService', () => {
  test('should log stock creation', async () => {
    const { AuditTrailService } = await import('../audit-trail');
    const service = new AuditTrailService();

    const event = await service.logStockCreation('user-1', 'v-1', 'MLHXB8012JK123456');
    expect(event.eventType).toBe('STOCK_CREATED');
    expect(event.aggregateType).toBe('vehicle');
    expect(event.payload.vin).toBe('MLHXB8012JK123456');
  });

  test('should log sale', async () => {
    const { AuditTrailService } = await import('../audit-trail');
    const service = new AuditTrailService();

    const event = await service.logSale('user-1', 'sale-1', 'v-1', 'client-1', 850000);
    expect(event.eventType).toBe('SALE_RECORDED');
    expect(event.payload.amount).toBe(850000);
  });

  test('should log compliance status change', async () => {
    const { AuditTrailService } = await import('../audit-trail');
    const service = new AuditTrailService();

    const event = await service.logComplianceStatusChange('admin-1', 'actor-1', 'ORANGE', 'VERT', 85);
    expect(event.eventType).toBe('COMPLIANCE_STATUS_CHANGED');
    expect(event.payload.oldStatus).toBe('ORANGE');
    expect(event.payload.newStatus).toBe('VERT');
    expect(event.payload.score).toBe(85);
  });

  test('should log price change with variation', async () => {
    const { AuditTrailService } = await import('../audit-trail');
    const service = new AuditTrailService();

    const event = await service.logPriceChange('user-1', 'v-1', 800000, 850000);
    expect(event.eventType).toBe('PRICE_CHANGED');
    expect(event.payload.oldPrice).toBe(800000);
    expect(event.payload.newPrice).toBe(850000);
    expect(event.payload.variation).toBe(50000);
  });

  test('should log admin action', async () => {
    const { AuditTrailService } = await import('../audit-trail');
    const service = new AuditTrailService();

    const event = await service.logAdminAction('admin-1', 'BLOCK_SALE', 'sale', 'sale-1', { reason: 'Fraud detected' });
    expect(event.eventType).toBe('ADMIN_ACTION');
    expect(event.payload.adminAction).toBe('BLOCK_SALE');
  });

  test('should verify integrity through service', async () => {
    const { AuditTrailService } = await import('../audit-trail');
    const service = new AuditTrailService();

    await service.logStockCreation('user-1', 'v-1', 'MLHXB8012JK123456');
    await service.logStockUpdate('user-1', 'v-1', { status: 'SOLD' });

    const result = await service.verifyIntegrity();
    expect(result.isValid).toBe(true);
  });
});

describe('NodeCryptoUtils', () => {
  test('should compute SHA-256', async () => {
    const { NodeCryptoUtils } = await import('../audit-trail');
    const crypto = new NodeCryptoUtils();

    const hash = crypto.sha256('test');
    expect(hash).toBeDefined();
    expect(hash.length).toBe(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test('should produce deterministic hash', async () => {
    const { NodeCryptoUtils } = await import('../audit-trail');
    const crypto = new NodeCryptoUtils();

    const hash1 = crypto.sha256('same input');
    const hash2 = crypto.sha256('same input');
    expect(hash1).toBe(hash2);
  });

  test('should generate different hashes for different inputs', async () => {
    const { NodeCryptoUtils } = await import('../audit-trail');
    const crypto = new NodeCryptoUtils();

    const hash1 = crypto.sha256('input A');
    const hash2 = crypto.sha256('input B');
    expect(hash1).not.toBe(hash2);
  });

  test('should generate key pair', async () => {
    const { NodeCryptoUtils } = await import('../audit-trail');
    const crypto = new NodeCryptoUtils();

    const pair = crypto.generateKeyPair();
    expect(pair.publicKey).toBeDefined();
    expect(pair.privateKey).toBeDefined();
    expect(pair.publicKey).toContain('BEGIN PUBLIC KEY');
    expect(pair.privateKey).toContain('BEGIN PRIVATE KEY');
  });

  test('should sign and verify', async () => {
    const { NodeCryptoUtils } = await import('../audit-trail');
    const crypto = new NodeCryptoUtils();

    const pair = crypto.generateKeyPair();
    const data = 'data to sign';

    const signature = crypto.generateSignature(data, pair.privateKey);
    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(0);

    const verified = crypto.verifySignature(data, signature, pair.publicKey);
    expect(verified).toBe(true);
  });

  test('should reject invalid signature', async () => {
    const { NodeCryptoUtils } = await import('../audit-trail');
    const crypto = new NodeCryptoUtils();

    const pair = crypto.generateKeyPair();
    const verified = crypto.verifySignature('data', 'invalid-sig', pair.publicKey);
    expect(verified).toBe(false);
  });

  test('should generate unique nonces', async () => {
    const { NodeCryptoUtils } = await import('../audit-trail');
    const crypto = new NodeCryptoUtils();

    const nonce1 = crypto.generateNonce();
    const nonce2 = crypto.generateNonce();
    expect(nonce1).not.toBe(nonce2);
    expect(nonce1.length).toBe(32); // 16 bytes = 32 hex chars
  });
});
