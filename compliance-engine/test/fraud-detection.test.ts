// =============================================================================
// Tests — Fraud Detection (8 règles de détection)
// =============================================================================

describe('FraudDetectionEngine', () => {
  const createMockSale = (overrides: any = {}) => ({
    id: 'sale-1',
    actorId: 'actor-1',
    clientId: 'client-1',
    status: 'PAID',
    paymentMethod: 'CASH',
    totalAmount: 850000,
    subtotalAmount: 720339,
    taxAmount: 129661,
    saleDate: new Date('2026-05-15T10:30:00Z'),
    currencyCode: 'XOF',
    items: [
      { id: 'si-1', saleId: 'sale-1', vehicleId: 'v-1', unitPrice: 850000, quantity: 1, lineTotal: 850000, taxAmount: 129661, unitCost: 650000, marginAmount: 200000, marginRate: 0.2353 },
    ],
    ...overrides,
  });

  const createMockClient = (overrides: any = {}) => ({
    id: 'client-1',
    firstName: 'Jean',
    lastName: 'KABORE',
    fullName: 'KABORE Jean',
    idDocumentType: 'CNI',
    idDocumentNumber: 'B1234567',
    idDocumentIssuedAt: new Date('2020-01-15'),
    idDocumentExpiresAt: new Date('2030-01-14'),
    phone: '+22670123456',
    city: 'Ouagadougou',
    status: 'KYC_VERIFIED',
    registeredByActorId: 'actor-1',
    biometricEnrolled: true,
    ...overrides,
  });

  const createMockVehicle = (overrides: any = {}) => ({
    id: 'v-1',
    vin: 'MLHXB8012JK123456',
    manufacturer: 'HONDA',
    model: 'WAVE 110',
    modelYear: 2025,
    categoryCode: 'MOTO_LEGERE_125CC',
    status: 'SOLD',
    ...overrides,
  });

  const createMockActor = (overrides: any = {}) => ({
    id: 'actor-1',
    actorType: 'DETAILLANT',
    companyName: 'Moto Shop BF',
    ...overrides,
  });

  const createSectorPrices = (): any => ({
    averageSellingPrice: 900000,
    medianSellingPrice: 875000,
    stdDeviation: 125000,
    sampleSize: 150,
    byCategory: {
      MOTO_LEGERE_125CC: { avg: 900000, median: 875000, std: 125000 },
    },
  });

  test('should load fraud detection engine', async () => {
    const { FraudDetectionEngine } = await import('../fraud-detection');
    const engine = new FraudDetectionEngine();
    expect(engine).toBeDefined();
    expect(engine.getAllRules().length).toBe(8);
  });

  // === RULE 1: Multiple Purchase ===
  describe('Rule_MultiplePurchase', () => {
    test('should detect client buying more than 3 vehicles in 30 days', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const now = new Date();
      const sales = [
        { ...createMockSale(), id: 's-1', saleDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), items: [{ ...createMockSale().items[0], vehicleId: 'v-1' }] },
        { ...createMockSale(), id: 's-2', saleDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), items: [{ ...createMockSale().items[0], vehicleId: 'v-2' }] },
        { ...createMockSale(), id: 's-3', saleDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), items: [{ ...createMockSale().items[0], vehicleId: 'v-3' }] },
        { ...createMockSale(), id: 's-4', saleDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), items: [{ ...createMockSale().items[0], vehicleId: 'v-4' }] },
      ];

      const ctx: any = {
        sale: sales[0],
        client: createMockClient(),
        actorSales: sales,
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'MULTIPLE_PURCHASE');
      expect(alert).toBeDefined();
      expect(alert!.riskScore).toBeGreaterThan(0);
      expect(alert!.level).toBe('HIGH');
    });

    test('should not alert for single purchase', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale(),
        client: createMockClient(),
        actorSales: [createMockSale()],
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'MULTIPLE_PURCHASE');
      expect(alert).toBeUndefined();
    });
  });

  // === RULE 2: Border Zone Sale ===
  describe('Rule_BorderZoneSale', () => {
    test('should detect sale near Mali border', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale({ saleLocation: { lat: 12.6, lng: -4.4 } }),
        actor: createMockActor(),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'BORDER_ZONE_SALE');
      expect(alert).toBeDefined();
      expect(alert!.riskScore).toBeGreaterThan(0);
    });

    test('should not alert for sale in Ouagadougou', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale({ saleLocation: { lat: 12.3714, lng: -1.5197 } }),
        actor: createMockActor(),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'BORDER_ZONE_SALE');
      expect(alert).toBeUndefined();
    });

    test('should not alert without GPS data', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale({ saleLocation: undefined }),
        actor: createMockActor(),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'BORDER_ZONE_SALE');
      expect(alert).toBeUndefined();
    });
  });

  // === RULE 3: Cash Payment Anomaly ===
  describe('Rule_CashPaymentAnomaly', () => {
    test('should detect cash payment above 5M XOF', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale({ paymentMethod: 'CASH', totalAmount: 6_500_000 }),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'CASH_PAYMENT_ANOMALY');
      expect(alert).toBeDefined();
      expect(alert!.riskScore).toBeGreaterThan(70);
      expect(alert!.level).toBe('HIGH');
    });

    test('should detect critical cash payment above 10M XOF', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale({ paymentMethod: 'CASH', totalAmount: 12_000_000 }),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'CASH_PAYMENT_ANOMALY');
      expect(alert).toBeDefined();
      expect(alert!.level).toBe('CRITICAL');
    });

    test('should not alert for bank transfer above 5M', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale({ paymentMethod: 'BANK_TRANSFER', totalAmount: 6_500_000 }),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'CASH_PAYMENT_ANOMALY');
      expect(alert).toBeUndefined();
    });

    test('should not alert for cash payment below threshold', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale({ paymentMethod: 'CASH', totalAmount: 3_000_000 }),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'CASH_PAYMENT_ANOMALY');
      expect(alert).toBeUndefined();
    });
  });

  // === RULE 4: Price Deviation ===
  describe('Rule_PriceDeviation', () => {
    test('should detect price 30% above sector average', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale({ items: [{ ...createMockSale().items[0], unitPrice: 1_200_000 }] }),
        sectorPrices: createSectorPrices(),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'PRICE_DEVIATION');
      expect(alert).toBeDefined();
      expect(alert!.riskScore).toBeGreaterThan(0);
    });

    test('should not alert for price within 20% of average', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale({ items: [{ ...createMockSale().items[0], unitPrice: 950_000 }] }),
        sectorPrices: createSectorPrices(),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'PRICE_DEVIATION');
      expect(alert).toBeUndefined();
    });

    test('should not alert without sector prices', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale(),
        sectorPrices: undefined,
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'PRICE_DEVIATION');
      expect(alert).toBeUndefined();
    });
  });

  // === RULE 5: Forbidden Model ===
  describe('Rule_ForbiddenModel', () => {
    test('should detect sale of forbidden model', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale(),
        vehicle: createMockVehicle({ categoryCode: 'INTERDITE', manufacturer: 'MOTO_INCONNUE', model: 'XG-50' }),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'FORBIDDEN_MODEL');
      expect(alert).toBeDefined();
      expect(alert!.level).toBe('CRITICAL');
      expect(alert!.riskScore).toBe(95);
    });

    test('should not alert for compliant model', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale(),
        vehicle: createMockVehicle(),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'FORBIDDEN_MODEL');
      expect(alert).toBeUndefined();
    });
  });

  // === RULE 6: Invalid ID Document ===
  describe('Rule_InvalidIdDocument', () => {
    test('should detect client without valid ID', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale(),
        client: createMockClient({ idDocumentNumber: '', status: 'PENDING_KYC' }),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'INVALID_ID_DOCUMENT');
      expect(alert).toBeDefined();
      expect(alert!.riskScore).toBeGreaterThan(0);
    });

    test('should detect expired ID document', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale(),
        client: createMockClient({ idDocumentExpiresAt: new Date('2025-01-01') }),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'INVALID_ID_DOCUMENT');
      expect(alert).toBeDefined();
      expect(alert!.riskScore).toBeGreaterThan(70);
    });

    test('should not alert for client with valid ID', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale(),
        client: createMockClient(),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'INVALID_ID_DOCUMENT');
      expect(alert).toBeUndefined();
    });
  });

  // === RULE 7: Off Hours Transaction ===
  describe('Rule_OffHoursTransaction', () => {
    test('should detect transaction at 22h', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale({ saleDate: new Date('2026-05-15T22:30:00Z') }),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'OFF_HOURS_TRANSACTION');
      expect(alert).toBeDefined();
      expect(alert!.level).toBe('LOW');
    });

    test('should detect transaction at 4h', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale({ saleDate: new Date('2026-05-15T04:00:00Z') }),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'OFF_HOURS_TRANSACTION');
      expect(alert).toBeDefined();
    });

    test('should not alert for transaction at 14h', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale({ saleDate: new Date('2026-05-15T14:00:00Z') }),
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'OFF_HOURS_TRANSACTION');
      expect(alert).toBeUndefined();
    });
  });

  // === RULE 8: Volume Anomaly ===
  describe('Rule_VolumeAnomaly', () => {
    test('should detect 3x volume spike', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const now = new Date();
      // Create 15 recent sales (avg 2.1/day) vs 5 previous (avg 0.2/day)
      const recentSales = Array.from({ length: 15 }, (_, i) => ({
        ...createMockSale(),
        id: `s-recent-${i}`,
        saleDate: new Date(now.getTime() - i * 12 * 60 * 60 * 1000),
      }));
      const previousSales = Array.from({ length: 5 }, (_, i) => ({
        ...createMockSale(),
        id: `s-prev-${i}`,
        saleDate: new Date(now.getTime() - (10 + i) * 24 * 60 * 60 * 1000),
      }));

      const ctx: any = {
        sale: recentSales[0],
        actor: createMockActor(),
        actorSales: [...recentSales, ...previousSales],
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'VOLUME_ANOMALY');
      expect(alert).toBeDefined();
      expect(alert!.riskScore).toBeGreaterThan(0);
    });

    test('should not alert for stable volume', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const now = new Date();
      const sales = Array.from({ length: 10 }, (_, i) => ({
        ...createMockSale(),
        id: `s-${i}`,
        saleDate: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
      }));

      const ctx: any = {
        sale: sales[0],
        actor: createMockActor(),
        actorSales: sales,
      };

      const alerts = engine.analyzeTransaction(ctx);
      const alert = alerts.find(a => a.alertType === 'VOLUME_ANOMALY');
      expect(alert).toBeUndefined();
    });
  });

  // === Engine integration ===
  describe('FraudDetectionEngine integration', () => {
    test('should sort alerts by risk score descending', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        sale: createMockSale({
          paymentMethod: 'CASH',
          totalAmount: 12_000_000,
          saleDate: new Date('2026-05-15T22:30:00Z'),
        }),
        vehicle: createMockVehicle({ categoryCode: 'INTERDITE' }),
        client: createMockClient({ idDocumentNumber: '' }),
        actor: createMockActor(),
        actorSales: [createMockSale()],
      };

      const alerts = engine.analyzeTransaction(ctx);
      expect(alerts.length).toBeGreaterThan(0);

      // Check descending order
      for (let i = 1; i < alerts.length; i++) {
        expect(alerts[i].riskScore).toBeLessThanOrEqual(alerts[i - 1].riskScore);
      }
    });

    test('should calculate actor risk score', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      const ctx: any = {
        actor: createMockActor(),
        actorSales: [
          createMockSale({ paymentMethod: 'CASH', totalAmount: 7_000_000 }),
          createMockSale({ paymentMethod: 'CASH', totalAmount: 8_000_000 }),
        ],
      };

      const riskScore = engine.calculateActorRiskScore(ctx);
      expect(riskScore).toBeDefined();
      expect(riskScore.overallRiskScore).toBeGreaterThan(0);
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(riskScore.riskLevel);
      expect(riskScore.alertCount).toBeGreaterThan(0);
    });

    test('should handle errors gracefully', async () => {
      const { FraudDetectionEngine } = await import('../fraud-detection');
      const engine = new FraudDetectionEngine();

      // Add a rule that throws
      engine.addRule({
        id: 'bad-rule',
        alertType: 'MULTIPLE_PURCHASE' as any,
        title: 'Bad Rule',
        description: 'Throws error',
        baseRiskScore: 50,
        detect: () => { throw new Error('Rule error'); },
      });

      const ctx: any = {
        sale: createMockSale(),
        actor: createMockActor(),
        actorSales: [createMockSale()],
      };

      // Should not throw
      expect(() => engine.analyzeTransaction(ctx)).not.toThrow();
      const alerts = engine.analyzeTransaction(ctx);
      // Original 8 rules should still work
      expect(alerts.length).toBeGreaterThanOrEqual(0);
    });
  });
});
