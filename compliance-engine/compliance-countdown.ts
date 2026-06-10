// =============================================================================
// iReg Moto BF — Compte à Rebours de Conformité
// Date de référence: 05/06/2026 | Escalade automatique | Notifications
// =============================================================================

import {
  Actor,
  ActorType,
  ComplianceCountdown,
  EscalationLevel,
  CountdownMilestone,
  NotificationRecord,
  NotificationChannel,
  StructuredLogger,
  ConsoleLogger,
} from './types';

// ============================================================================
// CONFIGURATION DES DÉLAIS PAR PROFIL
// ============================================================================

export interface GracePeriodConfig {
  actorType: ActorType;
  gracePeriodDays: number;
  description: string;
}

export const DEFAULT_GRACE_PERIODS: GracePeriodConfig[] = [
  { actorType: ActorType.IMPORTATEUR, gracePeriodDays: 90, description: '3 mois pour importateurs' },
  { actorType: ActorType.DISTRIBUTEUR, gracePeriodDays: 120, description: '4 mois pour distributeurs' },
  { actorType: ActorType.ASSEMBLEUR, gracePeriodDays: 180, description: '6 mois pour assembleurs' },
  { actorType: ActorType.DETAILLANT, gracePeriodDays: 365, description: '1 an pour détaillants' },
  { actorType: ActorType.PRESTATAIRE, gracePeriodDays: 365, description: '1 an pour prestataires' },
];

// ============================================================================
// NIVEAUX D'ESCALADE
// ============================================================================

export const ESCALATION_LEVELS: EscalationLevel[] = [
  {
    level: 0,
    label: 'CONFORME',
    daysThreshold: 91,
    actions: ['Aucune action requise'],
  },
  {
    level: 1,
    label: 'ALERTE_90J',
    daysThreshold: 90,
    actions: [
      'Notification email rappel échéance',
      'Publication dans le tableau de bord',
    ],
  },
  {
    level: 2,
    label: 'ALERTE_60J',
    daysThreshold: 60,
    actions: [
      'Notification email + SMS',
      'Relance automatique hebdomadaire',
      'Information au responsable régional',
    ],
  },
  {
    level: 3,
    label: 'ALERTE_30J',
    daysThreshold: 30,
    actions: [
      'Notification email + SMS + Push',
      'Alerte au contrôleur DRCTT assigné',
      'Mise en surbrillance du tableau de bord',
    ],
  },
  {
    level: 4,
    label: 'ALERTE_15J',
    daysThreshold: 15,
    actions: [
      'Notification email + SMS + Push (urgent)',
      'Convocation au ministère',
      'Pré-avertissement de sanction',
    ],
  },
  {
    level: 5,
    label: 'ALERTE_7J',
    daysThreshold: 7,
    actions: [
      'Notification tous canaux (CRITIQUE)',
      'Transfert au service juridique DRCTT',
      'Activation procédure de sanction',
      'Notification CNTI/PN',
    ],
  },
  {
    level: 6,
    label: 'DÉLAI_DÉPASSÉ',
    daysThreshold: 0,
    actions: [
      'Suspension temporaire de l\'agrément',
      'Procédure de fermeture administrative',
      'Publication de la sanction',
      'Transmission au parquet',
    ],
  },
];

// ============================================================================
// CALCULATEUR DE DÉLAI
// ============================================================================

export interface ICountdownCalculator {
  calculateCountdown(actor: Actor, referenceDate?: Date): ComplianceCountdown;
  getGracePeriod(actorType: ActorType): number;
  getNextMilestone(daysRemaining: number): CountdownMilestone;
  getEscalationLevel(daysRemaining: number): EscalationLevel;
}

export class CountdownCalculator implements ICountdownCalculator {
  private decreeDate: Date;
  private gracePeriods: Map<ActorType, number>;

  constructor(
    decreeDate: Date = new Date('2026-06-05T00:00:00Z'),
    gracePeriods?: GracePeriodConfig[],
  ) {
    this.decreeDate = decreeDate;
    this.gracePeriods = new Map(
      (gracePeriods ?? DEFAULT_GRACE_PERIODS).map(g => [g.actorType, g.gracePeriodDays])
    );
  }

  getGracePeriod(actorType: ActorType): number {
    return this.gracePeriods.get(actorType) ?? 365; // Default 1 year
  }

  calculateCountdown(actor: Actor, referenceDate?: Date): ComplianceCountdown {
    const refDate = referenceDate ?? new Date();
    const graceDays = this.getGracePeriod(actor.actorType);

    // Deadline = decree date + grace period
    const deadlineDate = new Date(this.decreeDate);
    deadlineDate.setDate(deadlineDate.getDate() + graceDays);

    // If actor was created after decree, their deadline extends
    if (actor.createdAt > this.decreeDate) {
      const actorDeadline = new Date(actor.createdAt);
      actorDeadline.setDate(actorDeadline.getDate() + graceDays);
      if (actorDeadline > deadlineDate) {
        deadlineDate.setTime(actorDeadline.getTime());
      }
    }

    const diffMs = deadlineDate.getTime() - refDate.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const escalationLevel = this.getEscalationLevel(daysRemaining);
    const nextMilestone = this.getNextMilestone(daysRemaining);

    // Generate mock notification history (in production, load from DB)
    const notificationsSent: NotificationRecord[] = [];
    if (daysRemaining <= 90) {
      notificationsSent.push({
        channel: NotificationChannel.EMAIL,
        sentAt: new Date(refDate.getTime() - (90 - daysRemaining) * 24 * 60 * 60 * 1000),
        template: 'REMINDER_90D',
        delivered: true,
      });
    }
    if (daysRemaining <= 60) {
      notificationsSent.push({
        channel: NotificationChannel.SMS,
        sentAt: new Date(refDate.getTime() - (60 - daysRemaining) * 24 * 60 * 60 * 1000),
        template: 'REMINDER_60D',
        delivered: true,
      });
    }

    return {
      actorId: actor.id,
      actorType: actor.actorType,
      decreeDate: this.decreeDate,
      deadlineDate,
      daysRemaining,
      gracePeriodDays: graceDays,
      escalationLevel,
      nextMilestone,
      notificationsSent,
    };
  }

  getNextMilestone(daysRemaining: number): CountdownMilestone {
    if (daysRemaining <= 0) {
      return {
        days: 0,
        label: 'DÉLAI DÉPASSÉ',
        date: new Date(),
        actionRequired: 'Sanction immédiate — contacter le ministère',
      };
    }

    const thresholds = [7, 15, 30, 60, 90];
    for (const t of thresholds) {
      if (daysRemaining > t) {
        const milestoneDate = new Date();
        milestoneDate.setDate(milestoneDate.getDate() + (daysRemaining - t));
        return {
          days: t,
          label: `Alerte ${t}j`,
          date: milestoneDate,
          actionRequired: this.getActionForThreshold(t),
        };
      }
    }

    // Days remaining <= 7
    return {
      days: 0,
      label: 'ALERTE CRITIQUE',
      date: new Date(),
      actionRequired: 'Sanction imminente — action immédiate requise',
    };
  }

  getEscalationLevel(daysRemaining: number): EscalationLevel {
    // Find the highest level whose threshold is >= days remaining
    for (let i = ESCALATION_LEVELS.length - 1; i >= 0; i--) {
      if (daysRemaining <= ESCALATION_LEVELS[i].daysThreshold) {
        return ESCALATION_LEVELS[i];
      }
    }
    return ESCALATION_LEVELS[0];
  }

  private getActionForThreshold(days: number): string {
    const actions: Record<number, string> = {
      90: 'Soumettre le plan de mise en conformité',
      60: 'Finaliser les documents manquants',
      30: 'Compléter toutes les démarches urgentes',
      15: 'Vérification finale avant échéance',
      7: 'Dernière chance — tout doit être en règle',
    };
    return actions[days] ?? 'Action requise';
  }
}

// ============================================================================
// SERVICE DE NOTIFICATIONS
// ============================================================================

export interface INotificationService {
  shouldNotify(countdown: ComplianceCountdown): boolean;
  getNotificationsToSend(countdown: ComplianceCountdown): NotificationTemplate[];
}

export interface NotificationTemplate {
  channel: NotificationChannel;
  templateCode: string;
  subject: string;
  body: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

export class CountdownNotificationService implements INotificationService {
  private lastNotifiedLevel: Map<string, number> = new Map();

  shouldNotify(countdown: ComplianceCountdown): boolean {
    const lastLevel = this.lastNotifiedLevel.get(countdown.actorId) ?? -1;
    return countdown.escalationLevel.level > lastLevel;
  }

  getNotificationsToSend(countdown: ComplianceCountdown): NotificationTemplate[] {
    const templates: NotificationTemplate[] = [];
    const level = countdown.escalationLevel;

    if (level.level >= 5) {
      templates.push({
        channel: NotificationChannel.EMAIL,
        templateCode: 'COUNTDOWN_CRITICAL_7D',
        subject: '[URGENT] iReg Moto BF — 7 jours avant échéance de conformité',
        body: this.buildCriticalBody(countdown),
        priority: 'URGENT',
      });
      templates.push({
        channel: NotificationChannel.SMS,
        templateCode: 'COUNTDOWN_CRITICAL_7D_SMS',
        subject: '',
        body: `iReg Moto BF: ${countdown.daysRemaining}j avant échéance. Sanction imminente. Contactez URGENTEMENT le ministère.`,
        priority: 'URGENT',
      });
    } else if (level.level >= 4) {
      templates.push({
        channel: NotificationChannel.EMAIL,
        templateCode: 'COUNTDOWN_15D',
        subject: '[IMPORTANT] iReg Moto BF — 15 jours avant échéance',
        body: this.buildWarningBody(countdown),
        priority: 'HIGH',
      });
    } else if (level.level >= 3) {
      templates.push({
        channel: NotificationChannel.EMAIL,
        templateCode: 'COUNTDOWN_30D',
        subject: 'iReg Moto BF — 30 jours avant échéance de conformité',
        body: this.buildWarningBody(countdown),
        priority: 'HIGH',
      });
    } else if (level.level >= 2) {
      templates.push({
        channel: NotificationChannel.EMAIL,
        templateCode: 'COUNTDOWN_60D',
        subject: 'iReg Moto BF — Rappel: 60 jours avant échéance',
        body: this.buildReminderBody(countdown),
        priority: 'NORMAL',
      });
    } else if (level.level >= 1) {
      templates.push({
        channel: NotificationChannel.EMAIL,
        templateCode: 'COUNTDOWN_90D',
        subject: 'iReg Moto BF — Information: 90 jours avant échéance',
        body: this.buildReminderBody(countdown),
        priority: 'LOW',
      });
    }

    this.lastNotifiedLevel.set(countdown.actorId, level.level);
    return templates;
  }

  private buildReminderBody(cd: ComplianceCountdown): string {
    return `
Bonjour,

Vous disposez encore de ${cd.daysRemaining} jours pour vous mettre en conformité avec l'arrêté ministériel du 05/06/2026.

Date d'échéance: ${cd.deadlineDate.toISOString().slice(0, 10)}
Prochaine étape: ${cd.nextMilestone.label} (${cd.nextMilestone.date.toISOString().slice(0, 10)})

Connectez-vous sur iReg Moto BF pour compléter votre dossier.

Cordialement,
L'équipe DRCTT
    `.trim();
  }

  private buildWarningBody(cd: ComplianceCountdown): string {
    return `
Bonjour,

ALERTE: Plus que ${cd.daysRemaining} jours avant l'échéance de conformité!

Date d'échéance: ${cd.deadlineDate.toISOString().slice(0, 10)}
Niveau d'alerte: ${cd.escalationLevel.label}

Actions requises:
${cd.escalationLevel.actions.map(a => `- ${a}`).join('\n')}

Connectez-vous IMMÉDIATEMENT sur iReg Moto BF.

DRCTT — Direction de la Réglementation et du Contrôle
    `.trim();
  }

  private buildCriticalBody(cd: ComplianceCountdown): string {
    return `
URGENT — SANCTION IMMINENTE

Il ne vous reste plus que ${cd.daysRemaining} jours avant l'échéance.

Sans mise en conformité immédiate, les mesures suivantes seront appliquées:
- Suspension temporaire de l'agrément
- Fermeture administrative possible
- Publication de la sanction

Contactez URGENTEMENT:
- DRCTT: +226 XX XX XX XX
- Email: conformite@drctt.gov.bf

Date d'échéance: ${cd.deadlineDate.toISOString().slice(0, 10)}
    `.trim();
  }
}

// ============================================================================
// ORCHESTRATEUR — Compliance Countdown Service
// ============================================================================

export interface IComplianceCountdownService {
  getCountdown(actor: Actor, referenceDate?: Date): ComplianceCountdown;
  checkAndNotify(actor: Actor): NotificationTemplate[];
  getBatchCountdowns(actors: Actor[], referenceDate?: Date): ComplianceCountdown[];
  getOverdueActors(actors: Actor[]): Actor[];
  getActorsByEscalationLevel(actors: Actor[], level: number): Actor[];
}

export class ComplianceCountdownService implements IComplianceCountdownService {
  private calculator: ICountdownCalculator;
  private notificationService: INotificationService;
  private logger: StructuredLogger;

  constructor(options: {
    calculator?: ICountdownCalculator;
    notificationService?: INotificationService;
    logger?: StructuredLogger;
  } = {}) {
    this.calculator = options.calculator ?? new CountdownCalculator();
    this.notificationService = options.notificationService ?? new CountdownNotificationService();
    this.logger = options.logger ?? new ConsoleLogger();
  }

  getCountdown(actor: Actor, referenceDate?: Date): ComplianceCountdown {
    return this.calculator.calculateCountdown(actor, referenceDate);
  }

  checkAndNotify(actor: Actor): NotificationTemplate[] {
    const countdown = this.getCountdown(actor);
    if (this.notificationService.shouldNotify(countdown)) {
      const notifications = this.notificationService.getNotificationsToSend(countdown);
      this.logger.info('Notifications triggered', {
        actorId: actor.id,
        daysRemaining: countdown.daysRemaining,
        escalationLevel: countdown.escalationLevel.label,
        notificationCount: notifications.length,
      });
      return notifications;
    }
    return [];
  }

  getBatchCountdowns(actors: Actor[], referenceDate?: Date): ComplianceCountdown[] {
    return actors.map(a => this.getCountdown(a, referenceDate));
  }

  getOverdueActors(actors: Actor[]): Actor[] {
    return actors.filter(a => {
      const cd = this.getCountdown(a);
      return cd.daysRemaining <= 0;
    });
  }

  getActorsByEscalationLevel(actors: Actor[], level: number): Actor[] {
    return actors.filter(a => {
      const cd = this.getCountdown(a);
      return cd.escalationLevel.level === level;
    });
  }

  /**
   * Génère un tableau de bord des échéances pour le ministère
   */
  generateDashboardStats(actors: Actor[]): CountdownDashboardStats {
    const countdowns = this.getBatchCountdowns(actors);

    const total = countdowns.length;
    const overdue = countdowns.filter(c => c.daysRemaining <= 0).length;
    const critical7d = countdowns.filter(c => c.daysRemaining > 0 && c.daysRemaining <= 7).length;
    const warning15d = countdowns.filter(c => c.daysRemaining > 7 && c.daysRemaining <= 15).length;
    alert30d: number;
    const alert30d = countdowns.filter(c => c.daysRemaining > 15 && c.daysRemaining <= 30).length;
    const alert60d = countdowns.filter(c => c.daysRemaining > 30 && c.daysRemaining <= 60).length;
    const alert90d = countdowns.filter(c => c.daysRemaining > 60 && c.daysRemaining <= 90).length;
    const conforme = countdowns.filter(c => c.daysRemaining > 90).length;

    return {
      total,
      overdue,
      critical7d,
      warning15d,
      alert30d,
      alert60d,
      alert90d,
      conforme,
      averageDaysRemaining: total > 0
        ? Math.round(countdowns.reduce((s, c) => s + Math.max(0, c.daysRemaining), 0) / total)
        : 0,
      generatedAt: new Date(),
    };
  }
}

export interface CountdownDashboardStats {
  total: number;
  overdue: number;
  critical7d: number;
  warning15d: number;
  alert30d: number;
  alert60d: number;
  alert90d: number;
  conforme: number;
  averageDaysRemaining: number;
  generatedAt: Date;
}
