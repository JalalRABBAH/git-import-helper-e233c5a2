import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  apiPrefix: process.env.API_PREFIX || 'api',
  apiVersion: process.env.API_VERSION || 'v1',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Client-Locale'],
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  locale: {
    default: process.env.DEFAULT_LOCALE || 'fr_BF',
    supported: (process.env.SUPPORTED_LOCALES || 'fr_BF,mos_BF,dyu_BF,fuv_BF').split(','),
  },
  pagination: {
    defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT || '20', 10),
    maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT || '100', 10),
  },
  features: {
    enableGraphQL: process.env.ENABLE_GRAPHQL === 'true',
    enableSwagger: process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true',
    enableMFA: process.env.ENABLE_MFA !== 'false',
    enableAudit: process.env.ENABLE_AUDIT !== 'false',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS !== 'false',
    enableComplianceEngine: process.env.ENABLE_COMPLIANCE !== 'false',
  },
}));
