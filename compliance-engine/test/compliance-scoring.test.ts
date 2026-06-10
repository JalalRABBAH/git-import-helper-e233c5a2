// =============================================================================
// Tests — Compliance Scoring
// =============================================================================

describe('ComplianceScoringService', () => {
  test('should calculate weighted score', async () => {
    const { ComplianceScoringService } = await import('../compliance-scoring');
    const service = new ComplianceScoringService();

    const mockEvaluation: any = {
      actorId: 'actor-1',
      actorType: 'IMPORTATEUR',
      evaluatedAt: new Date(),
      referenceDate: new Date(),
      ruleResults: [
        { ruleId: 'r1', category: 'A_REGISTRATION', ruleCode: 'A1', description: 'RCCM', points: 5, pointsEarned: 5, isCompliant: true, severity: 'BLOCKER', evaluatedAt: new Date() },
        { ruleId: 'r2', category: 'A_REGISTRATION', ruleCode: 'A2', description: 'IFU', points: 5, pointsEarned: 5, isCompliant: true, severity: 'BLOCKER', evaluatedAt: new Date() },
        { ruleId: 'r3', category: 'B_PREMISES', ruleCode: 'B1', description: 'Local', points: 5, pointsEarned: 5, isCompliant: true, severity: 'CRITICAL', evaluatedAt: new Date() },
        { ruleId: 'r4', category: 'C_STOCK_MANAGEMENT', ruleCode: 'C1', description: 'VIN', points: 5, pointsEarned: 3, isCompliant: false, severity: 'CRITICAL', evaluatedAt: new Date() },
        { ruleId: 'r5', category: 'E_PRICING', ruleCode: 'E1', description: 'Prix', points: 5, pointsEarned: 5, isCompliant: true, severity: 'WARNING', evaluatedAt: new Date() },
      ],
      totalPoints: 25,
      pointsEarned: 23,
      scorePercentage: 92,
      overallStatus: 'VERT',
      gaps: [],
      actionPlan: [],
    };

    const score = await service.calculateScore(mockEvaluation);
    expect(score).toBeDefined();
    expect(score.overallScore).toBeGreaterThan(0);
    expect(score.overallScore).toBeLessThanOrEqual(100);
    expect(score.categoryScores).toBeDefined();
    expect(score.categoryDetails.length).toBeGreaterThan(0);
  });

  test('should save and retrieve score history', async () => {
    const { ComplianceScoringService } = await import('../compliance-scoring');
    const service = new ComplianceScoringService();

    const mockEvaluation: any = {
      actorId: 'actor-1',
      actorType: 'IMPORTATEUR',
      evaluatedAt: new Date(),
      referenceDate: new Date(),
      ruleResults: [
        { ruleId: 'r1', category: 'A_REGISTRATION', ruleCode: 'A1', description: 'RCCM', points: 5, pointsEarned: 5, isCompliant: true, severity: 'BLOCKER', evaluatedAt: new Date() },
      ],
      totalPoints: 5,
      pointsEarned: 5,
      scorePercentage: 100,
      overallStatus: 'VERT',
      gaps: [],
      actionPlan: [],
    };

    await service.saveScoreHistory('actor-1', mockEvaluation);
    const history = await service.getScoreHistory('actor-1');
    expect(history.length).toBe(1);
    expect(history[0].actorId).toBe('actor-1');
  });

  test('should detect improving trend', async () => {
    const { ComplianceScoringService, InMemoryScoreHistoryRepository } = await import('../compliance-scoring');
    const repo = new InMemoryScoreHistoryRepository();
    const service = new ComplianceScoringService({ historyRepo: repo });

    // Save improving scores
    const entries = [
      { actorId: 'actor-1', evaluatedAt: new Date('2026-01-01'), overallScore: 45, categoryScores: {} as any, trend: 'DECLINING' as any },
      { actorId: 'actor-1', evaluatedAt: new Date('2026-02-01'), overallScore: 55, categoryScores: {} as any, trend: 'STABLE' as any },
      { actorId: 'actor-1', evaluatedAt: new Date('2026-03-01'), overallScore: 70, categoryScores: {} as any, trend: 'IMPROVING' as any },
      { actorId: 'actor-1', evaluatedAt: new Date('2026-04-01'), overallScore: 85, categoryScores: {} as any, trend: 'IMPROVING' as any },
    ];

    for (const entry of entries) {
      await repo.save(entry);
    }

    const trend = await service.getTrend('actor-1');
    expect(trend).toBe('IMPROVING');
  });

  test('should detect declining trend', async () => {
    const { ComplianceScoringService, InMemoryScoreHistoryRepository } = await import('../compliance-scoring');
    const repo = new InMemoryScoreHistoryRepository();
    const service = new ComplianceScoringService({ historyRepo: repo });

    const entries = [
      { actorId: 'actor-1', evaluatedAt: new Date('2026-01-01'), overallScore: 90, categoryScores: {} as any, trend: 'IMPROVING' as any },
      { actorId: 'actor-1', evaluatedAt: new Date('2026-02-01'), overallScore: 80, categoryScores: {} as any, trend: 'STABLE' as any },
      { actorId: 'actor-1', evaluatedAt: new Date('2026-03-01'), overallScore: 65, categoryScores: {} as any, trend: 'DECLINING' as any },
      { actorId: 'actor-1', evaluatedAt: new Date('2026-04-01'), overallScore: 50, categoryScores: {} as any, trend: 'DECLINING' as any },
    ];

    for (const entry of entries) {
      await repo.save(entry);
    }

    const trend = await service.getTrend('actor-1');
    expect(['DECLINING', 'CRITICAL']).toContain(trend);
  });

  test('should predict future scores', async () => {
    const { ComplianceScoringService, InMemoryScoreHistoryRepository } = await import('../compliance-scoring');
    const repo = new InMemoryScoreHistoryRepository();
    const service = new ComplianceScoringService({ historyRepo: repo });

    // Create a history with clear upward trend
    for (let i = 0; i < 10; i++) {
      await repo.save({
        actorId: 'actor-1',
        evaluatedAt: new Date(2026, 0, i * 7 + 1),
        overallScore: 50 + i * 3,
        categoryScores: {} as any,
        trend: 'IMPROVING',
      });
    }

    const prediction = await service.predictCompliance('actor-1');
    expect(prediction).toBeDefined();
    expect(prediction.currentScore).toBe(77); // 50 + 9*3
    expect(prediction.predictedScore30d).toBeGreaterThan(0);
    expect(prediction.confidence).toBeGreaterThan(0);
    expect(prediction.confidence).toBeLessThanOrEqual(1);
    expect(prediction.riskFactors).toBeDefined();
  });

  test('should compare to sector', async () => {
    const { ComplianceScoringService, InMemoryScoreHistoryRepository, SectorComparator } = await import('../compliance-scoring');
    const repo = new InMemoryScoreHistoryRepository();
    const comparator = new SectorComparator(repo);
    const service = new ComplianceScoringService({ historyRepo: repo, sectorComparator: comparator });

    // Seed sector data
    for (let i = 0; i < 20; i++) {
      await repo.save({
        actorId: `actor-sector-${i}`,
        evaluatedAt: new Date(),
        overallScore: 40 + Math.random() * 50,
        categoryScores: {} as any,
        trend: 'STABLE',
      });
    }

    const comparison = await service.compareToSector('actor-1', 'IMPORTATEUR' as any, 75);
    expect(comparison).toBeDefined();
    expect(comparison.actorScore).toBe(75);
    expect(comparison.sectorAverage).toBeGreaterThan(0);
    expect(comparison.percentile).toBeGreaterThanOrEqual(0);
    expect(comparison.percentile).toBeLessThanOrEqual(100);
  });

  test('should generate full score report', async () => {
    const { ComplianceScoringService } = await import('../compliance-scoring');
    const service = new ComplianceScoringService();

    const mockEvaluation: any = {
      actorId: 'actor-1',
      actorType: 'IMPORTATEUR',
      evaluatedAt: new Date(),
      referenceDate: new Date(),
      ruleResults: [
        { ruleId: 'r1', category: 'A_REGISTRATION', ruleCode: 'A1', description: 'RCCM', points: 5, pointsEarned: 5, isCompliant: true, severity: 'BLOCKER', evaluatedAt: new Date() },
        { ruleId: 'r2', category: 'A_REGISTRATION', ruleCode: 'A2', description: 'IFU', points: 5, pointsEarned: 5, isCompliant: true, severity: 'BLOCKER', evaluatedAt: new Date() },
        { ruleId: 'r3', category: 'B_PREMISES', ruleCode: 'B1', description: 'Local', points: 5, pointsEarned: 5, isCompliant: true, severity: 'CRITICAL', evaluatedAt: new Date() },
        { ruleId: 'r4', category: 'C_STOCK_MANAGEMENT', ruleCode: 'C1', description: 'VIN', points: 5, pointsEarned: 3, isCompliant: false, severity: 'CRITICAL', evaluatedAt: new Date() },
      ],
      totalPoints: 20,
      pointsEarned: 18,
      scorePercentage: 90,
      overallStatus: 'VERT',
      gaps: [
        { ruleId: 'r4', category: 'C_STOCK_MANAGEMENT', description: 'VIN missing', severity: 'CRITICAL', pointsAtStake: 2 },
      ],
      actionPlan: [
        { priority: 1, gap: { ruleId: 'r4', category: 'C_STOCK_MANAGEMENT', description: 'VIN missing', severity: 'CRITICAL', pointsAtStake: 2 }, action: 'Fix VIN', deadline: new Date(), estimatedEffort: '3-7 jours' },
      ],
    };

    const report = await service.getFullScoreReport('actor-1', 'IMPORTATEUR' as any, mockEvaluation);
    expect(report).toBeDefined();
    expect(report.actorId).toBe('actor-1');
    expect(report.weightedScore).toBeDefined();
    expect(report.trend).toBeDefined();
    expect(report.prediction).toBeDefined();
    expect(report.sectorComparison).toBeDefined();
    expect(report.riskFactors).toBeDefined();
    expect(report.recommendations).toBeDefined();
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  test('should handle category with zero points available', async () => {
    const { WeightedScoreCalculator } = await import('../compliance-scoring');
    const calc = new WeightedScoreCalculator();

    const scores = calc.calculateCategoryScores([]);
    expect(scores).toBeDefined();
  });

  test('should handle empty history for prediction', async () => {
    const { ComplianceScoringService, InMemoryScoreHistoryRepository } = await import('../compliance-scoring');
    const repo = new InMemoryScoreHistoryRepository();
    const service = new ComplianceScoringService({ historyRepo: repo });

    const prediction = await service.predictCompliance('actor-new');
    expect(prediction).toBeDefined();
    expect(prediction.currentScore).toBe(0);
    expect(prediction.confidence).toBeLessThan(0.5);
  });
});

describe('TrendAnalyzer', () => {
  test('should return STABLE for insufficient data', async () => {
    const { TrendAnalyzer } = await import('../compliance-scoring');
    const analyzer = new TrendAnalyzer();
    const trend = analyzer.determineTrend([]);
    expect(trend).toBe('STABLE');
  });

  test('should predict with low confidence for few data points', async () => {
    const { TrendAnalyzer } = await import('../compliance-scoring');
    const analyzer = new TrendAnalyzer();

    const prediction = analyzer.predictFutureScore([
      { actorId: 'a1', evaluatedAt: new Date(), overallScore: 50, categoryScores: {} as any, trend: 'STABLE' },
    ]);

    expect(prediction.confidence).toBeLessThan(0.5);
  });
});
