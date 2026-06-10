import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

export interface SendNotificationDto {
  userId: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  subject: string;
  body: string;
  template?: string;
  templateData?: Record<string, any>;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(@InjectRepository(Notification) private notifRepo: Repository<Notification>) {}

  async send(dto: SendNotificationDto): Promise<Notification> {
    const notif = this.notifRepo.create({
      userId: dto.userId,
      channelType: dto.channel,
      subject: dto.subject,
      body: dto.body,
      templateName: dto.template,
      templateData: dto.templateData || {},
      priority: dto.priority || 'NORMAL',
      status: 'PENDING',
    });

    const saved = await this.notifRepo.save(notif);

    // In production: enqueue to RabbitMQ for async processing
    this.logger.log(`Notification queued: ${dto.channel} to ${dto.userId}`);
    return saved;
  }

  async findByUser(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.notifRepo.findAndCount({
      where: { userId },
      skip, take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async markAsRead(id: string): Promise<Notification> {
    const notif = await this.notifRepo.findOne({ where: { id } });
    if (!notif) throw new Error('Notification non trouvée');
    notif.status = 'READ';
    notif.readAt = new Date();
    return this.notifRepo.save(notif);
  }

  // ─── Templates ────────────────────────────────────────
  async renderTemplate(templateName: string, data: Record<string, any>, locale: string = 'fr_BF'): Promise<string> {
    const templates: Record<string, Record<string, string>> = {
      'agreement_expiring': {
        fr_BF: 'Votre agrément expire dans {{days}} jours. Veuillez renouveler.',
        mos_BF: 'Zɑɑgré mã ne wɑɑtɑ {{days}} lɑ. M boend kũndg.',
      },
      'sale_complete': {
        fr_BF: 'Vente enregistrée: {{vehicle}} à {{client}} pour {{amount}} FCFA.',
      },
      'compliance_alert': {
        fr_BF: 'Alerte conformité: {{message}}. Score actuel: {{score}}/100.',
      },
      'password_reset': {
        fr_BF: 'Code de réinitialisation: {{code}}. Valide 15 minutes.',
      },
      'report_ready': {
        fr_BF: 'Votre rapport {{period}} est prêt. Téléchargez-le depuis votre tableau de bord.',
      },
      'blacklist_alert': {
        fr_BF: 'ALERTE: Le véhicule {{vin}} a été signalé comme {{reason}}.',
      },
    };

    const template = templates[templateName]?.[locale] || templates[templateName]?.['fr_BF'] || templateName;
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key]?.toString() || '');
  }
}
