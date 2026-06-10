import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const appConfig = configService.get('app');
  const authConfig = configService.get('auth');

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Compression
  app.use(compression());

  // CORS
  app.enableCors(appConfig.cors);

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: appConfig.apiVersion.replace('v', ''),
    prefix: appConfig.apiVersion,
  });

  // Global prefix
  app.setGlobalPrefix(appConfig.apiPrefix);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: appConfig.nodeEnv === 'production',
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger/OpenAPI documentation
  if (appConfig.features.enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('iReg Moto BF API')
      .setDescription(
        'Plateforme réglementaire pour la conformité des deux-roues motorisés au Burkina Faso.\n\n' +
        'Supporte l\'authentification JWT (Bearer) et les clés API.'
      )
      .setVersion('1.0.0')
      .setContact('iReg Moto BF Technical Team', 'https://ireg-moto.bf', 'tech@ireg-moto.bf')
      .setLicense('Proprietary', 'https://ireg-moto.bf/licence')
      .addServer('https://api.ireg-moto.bf/v1', 'Production')
      .addServer('https://api-staging.ireg-moto.bf/v1', 'Staging')
      .addServer('http://localhost:3000/api/v1', 'Local Development')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Access Token',
        },
        'BearerAuth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'Clé API pour les intégrations système',
        },
        'ApiKeyAuth',
      )
      .addTag('Auth', 'Authentification et autorisation (JWT + OAuth2 + MFA)')
      .addTag('Acteurs', 'MODULE A — Gestion des acteurs économiques')
      .addTag('Vehicules', 'MODULE B — Gestion des véhicules et catégories')
      .addTag('Stocks', 'MODULE B — Gestion des stocks et inventaires')
      .addTag('Clients', 'MODULE C — Gestion clientèle, KYC et traçabilité')
      .addTag('Ventes', 'MODULE D — Ventes et facturation')
      .addTag('Pricing', 'MODULE D — Pricing, marges et historique')
      .addTag('Rapports', 'MODULE E — Rapportage trimestriel')
      .addTag('Conformite', 'MODULE F — Contrôle et conformité réglementaire')
      .addTag('Securite', 'MODULE G — Lutte contre l\'insécurité et fraude')
      .addTag('Ministere', 'MODULE H — APIs portail ministère')
      .addTag('Admin', 'MODULE H — Portail administratif')
      .addTag('Audit', 'Audit trail immuable')
      .addTag('Fichiers', 'Upload/download de documents')
      .addTag('Notifications', 'Notifications multi-canal')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      deepScanRoutes: true,
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        `${controllerKey.replace(/Controller$/, '')}_${methodKey}`,
    });

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
      },
      customSiteTitle: 'iReg Moto BF API Documentation',
    });
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = appConfig.port;
  const host = appConfig.host;

  await app.listen(port, host);

  console.log(`\n🚀 iReg Moto BF API is running on: http://${host}:${port}/${appConfig.apiPrefix}`);
  console.log(`📚 Swagger Docs: http://${host}:${port}/api/docs`);
  console.log(`🌍 Environment: ${appConfig.nodeEnv}`);
  console.log(`🔑 Auth: JWT (${authConfig.jwt.algorithm}) + OAuth2 + MFA`);
}

bootstrap();
