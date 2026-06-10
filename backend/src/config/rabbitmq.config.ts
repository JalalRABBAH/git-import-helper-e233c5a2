import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  uri: process.env.RABBITMQ_URI || 'amqp://ireg_user:ireg_password@localhost:5672/ireg_vhost',
  exchanges: {
    events: 'ireg.events',
    notifications: 'ireg.notifications',
    reports: 'ireg.reports',
    compliance: 'ireg.compliance',
    security: 'ireg.security',
  },
  queues: {
    notifications: 'ireg.notifications.queue',
    reportGenerator: 'ireg.report-generator.queue',
    complianceChecker: 'ireg.compliance-checker.queue',
    securityAnalyzer: 'ireg.security-analyzer.queue',
    auditLogger: 'ireg.audit-logger.queue',
    cacheInvalidator: 'ireg.cache-invalidator.queue',
  },
  prefetchCount: parseInt(process.env.RABBITMQ_PREFETCH || '10', 10),
}));
