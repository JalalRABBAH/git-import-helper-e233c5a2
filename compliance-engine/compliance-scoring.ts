// =============================================================================
// iReg Moto BF — Système de Scoring de Conformité
// Calcul pondéré, historique, comparaison sectorielle, prédiction
// =============================================================================

import {
  Actor,
  ActorType,
  RuleCategory,
  ComplianceEvaluation,
  ScoreHistoryEntry,
  ScoreTrend,
  SectorComparison,
  CompliancePrediction,
  RuleResult,
  OverallComplianceStatus,
  StructuredLogger,
  ConsoleLogger,
} from './types';

// ============================================================================
// CONFIGURATION DES POIDS PAR CATÉGORIE
// ============================================================================

export interface CategoryWeightConfig {
  category: RuleCategory;
  weight: number; // 0.0 - 1.0
  criticalThreshold: number; // Score en-dessous duquel alerte
}

export const DEFAULT_CATEGORY_WEIGHTS: CategoryWeightConfig[] = [
  { category: 'A_REGISTRATION', weight: 0.20, criticalThreshold: 60 },
  { category: 'B_PREMISES', weight: 0.15, criticalThreshold: 60 },
  { category: 'C_STOCK_MANAGEMENT', weight: 0.20, criticalThreshold: 70 },
  { category: 'D_CLIENT_REGISTRY', weight: 0.15, criticalThreshold: 70 },
  { category: 'E_PRICING', weight: 0.15, criticalThreshold: 70 },
  { category: 'F_REPORTING', weight: 0.15, criticalThreshold: 50 },
];

// ============================================================================
// HISTORIQUE DES SCORES — Stockage en mémoire (remplacer par DB en production)
// ============================================================================

export interface IScoreHistoryRepository {
  save(entry: ScoreHistoryEntry): Promise<void>;
  getHistory(actorId: string, limit?: number): Promise<ScoreHistoryEntry[]>;
  getAllLatestScores(): Promise<Map<string, ScoreHistoryEntry>>;
  getByActorType(actorType: ActorType): Promise<ScoreHistoryEntry[]>;
}

export class InMemoryScoreHistoryRepository implements IScoreHistoryRepository {
  private history: Map<string, ScoreHistoryEntry[]> = new Map();

  async save(entry: ScoreHistoryEntry): Promise<void> {
    const existing = this.history.get(entry.actorId) ?? [];
    existing.push(entry);
    // Keep only last 100 entries per actor
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
    this.history.set(entry.actorId, existing);
  }

  async getHistory(actorId: string, limit: number = 50): Promise<ScoreHistoryEntry[]> {
    const entries = this.history.get(actorId) ?? [];
    return entries.slice(-limit);
  }

  async getAllLatestScores(): Promise<Map<string, ScoreHistoryEntry>> {
    const result = new Map<string, ScoreHistoryEntry>();
    for (const [actorId, entries] of this.history.entries()) {
      if (entries.length > 0) {
        result.set(actorId, entries[entries.length - 1]);
      }
    }
    return result;
  }

  async getByActorType(actorType: ActorType): Promise<ScoreHistoryEntry[]> {
    // This would need actor metadata in a real implementation
    const all: ScoreHistoryEntry[] = [];
    for (const entries of this.history.values()) {
      all.push(...entries);
    }
    return all;
  }
}

// ============================================================================
// CALCULATEUR DE SCORE PONDÉRÉ
// ============================================================================

export interface IWeightedScoreCalculator {
  calculateWeightedScore(evaluation: ComplianceEvaluation): WeightedScoreResult;
  calculateCategoryScores(ruleResults: RuleResult[]): Record<RuleCategory, number>;
}

export interface WeightedScoreResult {
  overallScore: number;
  categoryScores: Record<RuleCategory, number>;
  categoryDetails: CategoryScoreDetail[];
  weightedTotal: number;
  maxPossibleScore: number;
  complianceRate: number;
}

export interface CategoryScoreDetail {
  category: RuleCategory;
  rawScore: number;
  maxScore: number;
  weight: number;
  weightedContribution: number;
  isCritical: boolean;
}

export class WeightedScoreCalculator implements IWeightedScoreCalculator {
  private weights: CategoryWeightConfig[];

  constructor(weights?: CategoryWeightConfig[]) {
    this.weights = weights ?? DEFAULT_CATEGORY_WEIGHTS;
  }

  calculateWeightedScore(evaluation: ComplianceEvaluation): WeightedScoreResult {
    const categoryScores = this.calculateCategoryScores(evaluation.ruleResults);
    const categoryDetails: CategoryScoreDetail[] = [];
    let weightedTotal = 0;

    for (const config of this.weights) {
      const rawScore = categoryScores[config.category] ?? 0;
      const maxScore = 100; // Each category normalized to 100
      const normalizedScore = Math.min(100, Math.max(0, rawScore));
      const weightedContribution = normalizedScore * config.weight;
      weightedTotal += weightedContribution;

      categoryDetails.push({
        category: config.category,
        rawScore: Math.round(normalizedScore * 100) / 100,
        maxScore,
        weight: config.weight,
        weightedContribution: Math.round(weightedContribution * 100) / 100,
        isCritical: normalizedScore < config.criticalThreshold,
      });
    }

    const overallScore = Math.round(weightedTotal * 100) / 100;
    const maxPossibleScore = 100;

    return {
      overallScore,
      categoryScores,
      categoryDetails,
      weightedTotal: Math.round(weightedTotal * 100) / 100,
      maxPossibleScore,
      complianceRate: Math.round((overallScore / maxPossibleScore) * 10000) / 100,
    };
  }

  calculateCategoryScores(ruleResults: RuleResult[]): Record<RuleCategory, number> {
    const scores: Record<string, { earned: number; total: number }> = {};

    for (const result of ruleResults) {
      const cat = result.category;
      if (!scores[cat]) {
        scores[cat] = { earned: 0, total: 0 };
      }
      scores[cat].earned += result.pointsEarned;
      scores[cat].total += result.points;
    }

    const categoryScores: Partial<Record<RuleCategory, number>> = {};
    for (const [cat, val] of Object.entries(scores)) {
      categoryScores[cat as RuleCategory] = val.total > 0
        ? Math.round((val.earned / val.total) * 10000) / 100
        : 0;
    }

    return categoryScores as Record<RuleCategory, number>;
  }
}

// ============================================================================
// ANALYSE DE TENDANCE
// ============================================================================

export interface ITrendAnalyzer {
  determineTrend(history: ScoreHistoryEntry[]): ScoreTrend;
  predictFutureScore(history: ScoreHistoryEntry[]): { score30d: number; score90d: number; confidence: number };
}

export class TrendAnalyzer implements ITrendAnalyzer {
  determineTrend(history: ScoreHistoryEntry[]): ScoreTrend {
    if (history.length < 2) return 'STABLE';

    // Use last 5 entries (or fewer)
    const recent = history.slice(-5);
    const scores = recent.map(e => e.overallScore);

    // Linear regression on scores
    const n = scores.length;
    const sumX = recent.reduce((sum, _, i) => sum + i, 0);
    const sumY = scores.reduce((sum, s) => sum + s, 0);
    const sumXY = scores.reduce((sum, s, i) => sum + i * s, 0);
    const sumX2 = recent.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    if (slope > 2) return 'IMPROVING';
    if (slope < -2) return 'CRITICAL';
    if (slope < -0.5) return 'DECLINING';
    return 'STABLE';
  }

  predictFutureScore(history: ScoreHistoryEntry[]): { score30d: number; score90d: number; confidence: number } {
    if (history.length < 3) {
      const lastScore = history.length > 0 ? history[history.length - 1].overallScore : 50;
      return { score30d: lastScore, score90d: lastScore, confidence: 0.3 };
    }

    const scores = history.map(e => e.overallScore);
    const n = scores.length;

    // Simple linear regression
    const sumX = scores.reduce((sum, _, i) => sum + i, 0);
    const sumY = scores.reduce((sum, s) => sum + s, 0);
    const sumXY = scores.reduce((sum, s, i) => sum + i * s, 0);
    const sumX2 = scores.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict 30 days (assume ~4 evaluations per month)
    const futureIdx30 = n + 4;
    const futureIdx90 = n + 12;

    const score30d = Math.max(0, Math.min(150, slope * futureIdx30 + intercept));
    const score90d = Math.max(0, Math.min(150, slope * futureIdx90 + intercept));

    // Confidence based on data volume and variance
    const mean = sumY / n;
    const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);
    const confidence = Math.min(0.95, 0.3 + (n / 20) * 0.5 + (1 / (1 + stdDev / 20)) * 0.2);

    return {
      score30d: Math.round(score30d * 100) / 100,
      score90d: Math.round(score90d * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
    };
  }
}

// ============================================================================
// COMPARAISON SECTORIELLE
// ============================================================================

export interface ISectorComparator {
  compareToSector(actorId: string, actorType: ActorType, score: number): Promise<SectorComparison>;
}

export class SectorComparator implements ISectorComparator {
  private historyRepo: IScoreHistoryRepository;

  constructor(historyRepo: IScoreHistoryRepository) {
    this.historyRepo = historyRepo;
  }

  async compareToSector(actorId: string, actorType: ActorType, score: number): Promise<SectorComparison> {
    const allScores = await this.historyRepo.getByActorType(actorType);
    const sectorScores = allScores.map(s => s.overallScore);

    if (sectorScores.length === 0) {
      return {
        actorId,
        actorType,
        actorScore: score,
        sectorAverage: score,
        sectorMedian: score,
        sectorBest: score,
        sectorWorst: score,
        percentile: 50,
        comparisonDate: new Date(),
      };
    }

    const sorted = [...sectorScores].sort((a, b) => a - b);
    const avg = sorted.reduce((s, v) => s + v, 0) / sorted.length;
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    const percentile = sorted.filter(s => s <= score).length / sorted.length * 100;

    return {
      actorId,
      actorType,
      actorScore: Math.round(score * 100) / 100,
      sectorAverage: Math.round(avg * 100) / 100,
      sectorMedian: Math.round(median * 100) / 100,
      sectorBest: sorted[sorted.length - 1],
      sectorWorst: sorted[0],
      percentile: Math.round(percentile * 100) / 100,
      comparisonDate: new Date(),
    };
  }
}

// ============================================================================
// SERVICE PRINCIPAL — Compliance Scoring
// ============================================================================

export interface IComplianceScoringService {
  calculateScore(evaluation: ComplianceEvaluation): Promise<WeightedScoreResult>;
  saveScoreHistory(actorId: string, evaluation: ComplianceEvaluation): Promise<void>;
  getScoreHistory(actorId: string, limit?: number): Promise<ScoreHistoryEntry[]>;
  getTrend(actorId: string): Promise<ScoreTrend>;
  predictCompliance(actorId: string): Promise<CompliancePrediction>;
  compareToSector(actorId: string, actorType: ActorType, score: number): Promise<SectorComparison>;
  getFullScoreReport(actorId: string, actorType: ActorType, evaluation: ComplianceEvaluation): Promise<FullScoreReport>;
}

export interface FullScoreReport {
  actorId: string;
  evaluatedAt: Date;
  weightedScore: WeightedScoreResult;
  overallStatus: OverallComplianceStatus;
  trend: ScoreTrend;
  prediction: CompliancePrediction;
  sectorComparison: SectorComparison;
  riskFactors: string[];
  recommendations: string[];
}

export class ComplianceScoringService implements IComplianceScoringService {
  private calculator: IWeightedScoreCalculator;
  private trendAnalyzer: ITrendAnalyzer;
  private historyRepo: IScoreHistoryRepository;
  private sectorComparator: ISectorComparator;
  private logger: StructuredLogger;

  constructor(options: {
    calculator?: IWeightedScoreCalculator;
    trendAnalyzer?: ITrendAnalyzer;
    historyRepo?: IScoreHistoryRepository;
    sectorComparator?: ISectorComparator;
    logger?: StructuredLogger;
  } = {}) {
    this.calculator = options.calculator ?? new WeightedScoreCalculator();
    this.trendAnalyzer = options.trendAnalyzer ?? new TrendAnalyzer();
    this.historyRepo = options.historyRepo ?? new InMemoryScoreHistoryRepository();
    this.sectorComparator = options.sectorComparator ?? new SectorComparator(this.historyRepo);
    this.logger = options.logger ?? new ConsoleLogger();
  }

  async calculateScore(evaluation: ComplianceEvaluation): Promise<WeightedScoreResult> {
    this.logger.info('Calculating weighted score', { actorId: evaluation.actorId });
    return this.calculator.calculateWeightedScore(evaluation);
  }

  async saveScoreHistory(actorId: string, evaluation: ComplianceEvaluation): Promise<void> {
    const weightedScore = await this.calculateScore(evaluation);
    const trend = this.trendAnalyzer.determineTrend(
      await this.historyRepo.getHistory(actorId)
    );

    const entry: ScoreHistoryEntry = {
      actorId,
      evaluatedAt: evaluation.evaluatedAt,
      overallScore: weightedScore.overallScore,
      categoryScores: weightedScore.categoryScores,
      trend,
    };

    await this.historyRepo.save(entry);
    this.logger.info('Score history saved', { actorId, overallScore: weightedScore.overallScore });
  }

  async getScoreHistory(actorId: string, limit?: number): Promise<ScoreHistoryEntry[]> {
    return this.historyRepo.getHistory(actorId, limit);
  }

  async getTrend(actorId: string): Promise<ScoreTrend> {
    const history = await this.historyRepo.getHistory(actorId);
    return this.trendAnalyzer.determineTrend(history);
  }

  async predictCompliance(actorId: string): Promise<CompliancePrediction> {
    const history = await this.historyRepo.getHistory(actorId);
    const lastScore = history.length > 0 ? history[history.length - 1].overallScore : 0;
    const trend = this.trendAnalyzer.determineTrend(history);
    const prediction = this.trendAnalyzer.predictFutureScore(history);

    const riskFactors = this.identifyRiskFactors(history);

    return {
      actorId,
      currentScore: lastScore,
      predictedScore30d: prediction.score30d,
      predictedScore90d: prediction.score90d,
      confidence: prediction.confidence,
      trend,
      riskFactors,
      predictedAt: new Date(),
    };
  }

  async compareToSector(actorId: string, actorType: ActorType, score: number): Promise<SectorComparison> {
    return this.sectorComparator.compareToSector(actorId, actorType, score);
  }

  async getFullScoreReport(
    actorId: string,
    actorType: ActorType,
    evaluation: ComplianceEvaluation,
  ): Promise<FullScoreReport> {
    const weightedScore = await this.calculateScore(evaluation);
    await this.saveScoreHistory(actorId, evaluation);

    const [trend, prediction, sectorComparison] = await Promise.all([
      this.getTrend(actorId),
      this.predictCompliance(actorId),
      this.compareToSector(actorId, actorType, weightedScore.overallScore),
    ]);

    const riskFactors = this.identifyRiskFactors(await this.historyRepo.getHistory(actorId));
    const recommendations = this.generateRecommendations(weightedScore, trend, riskFactors);

    return {
      actorId,
      evaluatedAt: evaluation.evaluatedAt,
      weightedScore,
      overallStatus: evaluation.overallStatus,
      trend,
      prediction,
      sectorComparison,
      riskFactors,
      recommendations,
    };
  }

  private identifyRiskFactors(history: ScoreHistoryEntry[]): string[] {
    const factors: string[] = [];
    if (history.length === 0) return factors;

    const latest = history[history.length - 1];

    if (latest.overallScore < 50) {
      factors.push('Score global critique (< 50%)');
    }
    if (latest.categoryScores['A_REGISTRATION'] < 60) {
      factors.push('Non-conformité sur l\'enregistrement légal');
    }
    if (latest.categoryScores['F_REPORTING'] < 50) {
      factors.push('Retards ou absences de rapports trimestriels');
    }
    if (latest.categoryScores['C_STOCK_MANAGEMENT'] < 70) {
      factors.push('Gestion des stocks non conforme');
    }

    const trend = this.trendAnalyzer.determineTrend(history);
    if (trend === 'DECLINING' || trend === 'CRITICAL') {
      factors.push('Tendance de dégradation du score de conformité');
    }

    return factors;
  }

  private generateRecommendations(
    weightedScore: WeightedScoreResult,
    trend: ScoreTrend,
    riskFactors: string[],
  ): string[] {
    const recommendations: string[] = [];

    // Category-specific recommendations
    for (const detail of weightedScore.categoryDetails) {
      if (detail.isCritical) {
        const recs: Record<string, string> = {
          A_REGISTRATION: 'Prioriser la régularisation des documents légaux (RCCM, IFU, agrément)',
          B_PREMISES: 'Améliorer les locaux et la sécurité des entrepôts',
          C_STOCK_MANAGEMENT: 'Mettre en place un système de traçabilité VIN/QR et réaliser des inventaires réguliers',
          D_CLIENT_REGISTRY: 'Compléter les dossiers clients KYC et assurer la liaison acheteur-engin',
          E_PRICING: 'Réviser la politique de prix et s\'assurer de la déclaration de toutes les ventes',
          F_REPORTING: 'Soumettre les rapports trimestriels dans les délais avec données complètes',
        };
        recommendations.push(recs[detail.category] ?? `Améliorer la conformité en ${detail.category}`);
      }
    }

    if (trend === 'DECLINING' || trend === 'CRITICAL') {
      recommendations.push('Mettre en place un plan d\'action correctif urgent avec suivi hebdomadaire');
    }

    if (riskFactors.some(rf => rf.includes('critique'))) {
      recommendations.push('Contacter le support iReg Moto BF pour un accompagnement renforcé');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintenir les bonnes pratiques actuelles de conformité');
    }

    return recommendations;
  }
}
