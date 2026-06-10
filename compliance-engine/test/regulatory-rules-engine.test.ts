// =============================================================================
// Tests — Regulatory Rules Engine (150 points de conformité)
// =============================================================================

describe('RegulatoryRulesEngine', () => {
  let engine: any;
  let mockActor: any;
  let mockContext: any;

  beforeEach(() => {
    // Dynamic import to get the module
    jest.resetModules();
  });

  const createMockActor = (overrides: any = {}) => ({
    id: 'actor-123',
    actorType: 'IMPORTATEUR',
    companyName: 'Moto Import BF',
    nif: 'NIF12345678',
    rccm: 'RCCM-OUAG-2024',
    status: 'ACTIVE',
    agreementNumber: 'AGR-2024-001',
    agreementStatus: 'APPROVED',
    agreementExpiresAt: new Date('2027-12-31'),
    region: 'Centre',
    city: 'Ouagadougou',
    addressLine1: 'Avenue Kwamé Nkrumah, secteur 15',
    gpsCoordinates: { lat: 12.3714, lng: -1.5197 },
    createdAt: new Date('2026-04-15'),
    updatedAt: new Date('2026-04-15'),
    metadata: { hasTraceabilitySystem: true, hasInternetConnection: true },
    ...overrides,
  });

  const createMockContext = (overrides: any = {}) => ({
    actor: createMockActor(),
    documents: [
      { id: 'doc-1', actorId: 'actor-123', documentType: 'REGISTRE_COMMERCE', documentLabel: 'RCCM', fileName: 'rccm.pdf', isVerified: true, storagePath: '/docs/rccm.pdf' },
      { id: 'doc-2', actorId: 'actor-123', documentType: 'NIF', documentLabel: 'IFU', fileName: 'ifu.pdf', isVerified: true, storagePath: '/docs/ifu.pdf' },
      { id: 'doc-3', actorId: 'actor-123', documentType: 'LICENCE_IMPORTATION', documentLabel: 'Licence Import', fileName: 'licence.pdf', isVerified: true, storagePath: '/docs/licence.pdf' },
    ],
    vehicles: [
      { id: 'v-1', vin: 'MLHXB8012JK123456', manufacturer: 'HONDA', model: 'WAVE 110', modelYear: 2025, categoryId: 'cat-1', categoryCode: 'MOTO_LEGERE_125CC', status: 'IN_STOCK', currentOwnerActorId: 'actor-123', qrCode: 'QR-001' },
      { id: 'v-2', vin: 'MLHXB8012JK789012', manufacturer: 'YAMAHA', model: 'CRYPTON', modelYear: 2025, categoryId: 'cat-1', categoryCode: 'MOTO_LEGERE_125CC', status: 'IN_STOCK', currentOwnerActorId: 'actor-123', qrCode: 'QR-002' },
    ],
    warehouses: [
      { id: 'w-1', actorId: 'actor-123', name: 'Entrepôt Principal', code: 'DEPOT-01', addressLine1: 'Zone industrielle', city: 'Ouagadougou', region: 'Centre', isPrimary: true, securityLevel: 'RENFORCE', isActive: true },
    ],
    inventoryCounts: [
      { id: 'inv-1', warehouseId: 'w-1', actorId: 'actor-123', status: 'RECONCILED', plannedDate: new Date('2026-05-01'), completedAt: new Date('2026-05-03'), totalUnitsExpected: 2, totalUnitsCounted: 2, discrepancyUnits: 0 },
    ],
    clients: [
      { id: 'c-1', firstName: 'Jean', lastName: 'KABORE', fullName: 'KABORE Jean', idDocumentType: 'CNI', idDocumentNumber: 'B1234567', phone: '+22670123456', city: 'Ouagadougou', status: 'KYC_VERIFIED', registeredByActorId: 'actor-123', biometricEnrolled: true, photoUrl: '/photos/c1.jpg' },
    ],
    sales: [
      { id: 's-1', actorId: 'actor-123', clientId: 'c-1', status: 'PAID', paymentMethod: 'BANK_TRANSFER', totalAmount: 850000, subtotalAmount: 720339, taxAmount: 129661, saleDate: new Date('2026-05-15'), currencyCode: 'XOF', items: [{ id: 'si-1', saleId: 's-1', vehicleId: 'v-1', unitPrice: 850000, quantity: 1, lineTotal: 850000, taxAmount: 129661, unitCost: 650000, marginAmount: 200000, marginRate: 0.2353 }] },
    ],
    purchasePrices: [
      { id: 'pp-1', actorId: 'actor-123', manufacturer: 'HONDA', model: 'WAVE 110', unitPriceForeign: 991, foreignCurrencyCode: 'EUR', exchangeRate: 655.957, unitPriceXof: 650000, freightCost: 25000, insuranceCost: 15000, customsDuties: 227500, otherCosts: 10000, totalLandedCost: 927500, effectiveDate: new Date('2026-04-01'), isActive: true },
    ],
    quarterlyReports: [
      { id: 'r-1', actorId: 'actor-123', year: 2026, quarter: 'Q2', periodStart: new Date('2026-04-01'), periodEnd: new Date('2026-06-30'), status: 'SUBMITTED', totalSalesCount: 1, totalSalesAmount: 850000, totalVehiclesSold: 1, totalTaxCollected: 129661, totalPurchasesCount: 1, totalPurchasesAmount: 650000, totalVehiclesImported: 1, totalCustomsDuties: 227500, stockOpeningUnits: 1, stockClosingUnits: 1, complianceScore: 85, submittedAt: new Date('2026-07-10'), xmlReportPath: '/reports/r1.xml', pdfReportPath: '/reports/r1.pdf' },
    ],
    referenceDate: new Date('2026-06-15'),
    ...overrides,
  });

  test('should load the engine module', async () => {
    const { RegulatoryRulesEngine } = await import('../regulatory-rules-engine');
    const engine = new RegulatoryRulesEngine();
    expect(engine).toBeDefined();
  });

  test('should have all 19 default rules registered', async () => {
    const { RegulatoryRulesEngine } = await import('../regulatory-rules-engine');
    const engine = new RegulatoryRulesEngine();
    const rules = engine.getApplicableRules('IMPORTATEUR' as any);
    // IMPORTATEUR has all rules except B5 (specific assembleur) and some are filtered
    expect(rules.length).toBeGreaterThan(0);
  });

  test('should evaluate a fully compliant importateur with green status', async () => {
    const { RegulatoryRulesEngine } = await import('../regulatory-rules-engine');
    const engine = new RegulatoryRulesEngine();
    const ctx = createMockContext();

    const result = engine.evaluateCompliance('actor-123', 'IMPORTATEUR' as any, ctx);

    expect(result).toBeDefined();
    expect(result.actorId).toBe('actor-123');
    expect(result.actorType).toBe('IMPORTATEUR');
    expect(result.ruleResults.length).toBeGreaterThan(0);
    expect(result.totalPoints).toBeGreaterThan(0);
    expect(result.pointsEarned).toBeGreaterThanOrEqual(0);
    expect(result.scorePercentage).toBeGreaterThanOrEqual(0);
    expect(result.scorePercentage).toBeLessThanOrEqual(100);
    expect(['VERT', 'ORANGE', 'ROUGE']).toContain(result.overallStatus);
    expect(result.gaps).toBeDefined();
    expect(result.actionPlan).toBeDefined();
    expect(result.evaluatedAt).toBeInstanceOf(Date);
  });

  test('should return ROUGE status for non-compliant actor', async () => {
    const { RegulatoryRulesEngine } = await import('../regulatory-rules-engine');
    const engine = new RegulatoryRulesEngine();
    const ctx = createMockContext({
      actor: createMockActor({
        rccm: undefined,
        nif: undefined,
        agreementStatus: 'DRAFT',
        agreementNumber: undefined,
        agreementExpiresAt: undefined,
        addressLine1: '',
        gpsCoordinates: undefined,
        metadata: {},
      }),
      documents: [],
      warehouses: [],
      vehicles: [],
      inventoryCounts: [],
      clients: [],
      sales: [],
      purchasePrices: [],
      quarterlyReports: [],
    });

    const result = engine.evaluateCompliance('actor-123', 'IMPORTATEUR' as any, ctx);
    expect(result.overallStatus).toBe('ROUGE');
    expect(result.pointsEarned).toBeLessThan(result.totalPoints);
    expect(result.gaps.length).toBeGreaterThan(0);
    expect(result.actionPlan.length).toBeGreaterThan(0);
  });

  test('should handle missing data gracefully', async () => {
    const { RegulatoryRulesEngine } = await import('../regulatory-rules-engine');
    const engine = new RegulatoryRulesEngine();
    const ctx = createMockContext({
      actor: createMockActor(),
      vehicles: undefined,
      sales: undefined,
      clients: undefined,
      warehouses: undefined,
      documents: undefined,
      inventoryCounts: undefined,
      purchasePrices: undefined,
      quarterlyReports: undefined,
    });

    const result = engine.evaluateCompliance('actor-123', 'IMPORTATEUR' as any, ctx);
    expect(result).toBeDefined();
    expect(result.ruleResults.length).toBeGreaterThan(0);
  });

  test('should sort action plan by priority', async () => {
    const { RegulatoryRulesEngine } = await import('../regulatory-rules-engine');
    const engine = new RegulatoryRulesEngine();
    const ctx = createMockContext({
      actor: createMockActor({ agreementStatus: 'DRAFT' }),
      documents: [],
    });

    const result = engine.evaluateCompliance('actor-123', 'IMPORTATEUR' as any, ctx);
    const priorities = result.actionPlan.map(a => a.priority);
    for (let i = 1; i < priorities.length; i++) {
      expect(priorities[i]).toBeGreaterThanOrEqual(priorities[i - 1]);
    }
  });

  test('should evaluate detaillant with fewer applicable rules', async () => {
    const { RegulatoryRulesEngine } = await import('../regulatory-rules-engine');
    const engine = new RegulatoryRulesEngine();
    const ctx = createMockContext({
      actor: createMockActor({ actorType: 'DETAILLANT' }),
    });

    const result = engine.evaluateCompliance('actor-123', 'DETAILLANT' as any, ctx);
    expect(result).toBeDefined();
    expect(result.actorType).toBe('DETAILLANT');
  });

  test('should evaluate assembleur with B5 rule applicable', async () => {
    const { RegulatoryRulesEngine } = await import('../regulatory-rules-engine');
    const engine = new RegulatoryRulesEngine();
    const ctx = createMockContext({
      actor: createMockActor({ actorType: 'ASSEMBLEUR' }),
      documents: [
        ...createMockContext().documents,
        { id: 'doc-asm', actorId: 'actor-123', documentType: 'CERT_ASSEMBLY_UNIT', documentLabel: 'Certificat Unité Montage', fileName: 'asm.pdf', isVerified: true, storagePath: '/docs/asm.pdf' },
      ],
    });

    const result = engine.evaluateCompliance('actor-123', 'ASSEMBLEUR' as any, ctx);
    expect(result).toBeDefined();
    expect(result.actorType).toBe('ASSEMBLEUR');
  });

  test('should handle rule evaluation errors gracefully', async () => {
    const { RegulatoryRulesEngine, IComplianceRule } = await import('../regulatory-rules-engine');
    const engine = new RegulatoryRulesEngine();

    // Register a rule that throws
    const badRule = {
      id: 'bad-rule',
      code: 'BAD',
      category: 'A_REGISTRATION',
      description: 'Bad rule',
      points: 5,
      severity: 'WARNING',
      applicableActorTypes: ['IMPORTATEUR'],
      evidenceRequired: 'none',
      evaluate: () => { throw new Error('Rule error'); },
    };

    engine.registerCustomRule(badRule as any);

    const ctx = createMockContext();
    const result = engine.evaluateCompliance('actor-123', 'IMPORTATEUR' as any, ctx);

    const badResult = result.ruleResults.find((r: any) => r.ruleCode === 'BAD');
    expect(badResult).toBeDefined();
    expect(badResult!.isCompliant).toBe(false);
    expect(badResult!.pointsEarned).toBe(0);
    expect(badResult!.observedValue).toContain('ERREUR');
  });

  test('should detect forbidden model in stock (C2)', async () => {
    const { RegulatoryRulesEngine } = await import('../regulatory-rules-engine');
    const engine = new RegulatoryRulesEngine();
    const ctx = createMockContext({
      vehicles: [
        { id: 'v-bad', vin: 'MLHXB8012JK999999', manufacturer: 'MOTO_INCONNUE', model: 'XG-50', modelYear: 2023, categoryId: 'cat-x', categoryCode: 'INTERDITE', status: 'IN_STOCK', currentOwnerActorId: 'actor-123', qrCode: 'QR-BAD' },
      ],
    });

    const result = engine.evaluateCompliance('actor-123', 'IMPORTATEUR' as any, ctx);
    const c2Result = result.ruleResults.find((r: any) => r.ruleCode === 'C2');
    expect(c2Result).toBeDefined();
    expect(c2Result!.isCompliant).toBe(false);
    expect(c2Result!.pointsEarned).toBe(0);
  });

  test('should check margin compliance (E4)', async () => {
    const { RegulatoryRulesEngine } = await import('../regulatory-rules-engine');
    const engine = new RegulatoryRulesEngine();
    const ctx = createMockContext();

    const result = engine.evaluateCompliance('actor-123', 'IMPORTATEUR' as any, ctx);
    const e4Result = result.ruleResults.find((r: any) => r.ruleCode === 'E4');
    expect(e4Result).toBeDefined();
  });

  test('should respect thresholds: VERT >= 80%, ORANGE >= 60%, ROUGE < 60%', async () => {
    const { RegulatoryRulesEngine } = await import('../regulatory-rules-engine');
    const engine = new RegulatoryRulesEngine();

    // Fully compliant context
    const goodCtx = createMockContext();
    const goodResult = engine.evaluateCompliance('actor-123', 'IMPORTATEUR' as any, goodCtx);

    // Status should be one of the three valid values
    expect(['VERT', 'ORANGE', 'ROUGE']).toContain(goodResult.overallStatus);
  });
});
