import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import databaseConfig, { AppDataSource } from '@config/database.config';
import redisConfig from '@config/redis.config';
import rabbitmqConfig from '@config/rabbitmq.config';
import minioConfig from '@config/minio.config';
import authConfig from '@config/auth.config';
import appConfig from '@config/app.config';

import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { RolesModule } from '@modules/roles/roles.module';
import { ActorsModule } from '@modules/actors/actors.module';
import { VehiclesModule } from '@modules/vehicles/vehicles.module';
import { StocksModule } from '@modules/stocks/stocks.module';
import { ClientsModule } from '@modules/clients/clients.module';
import { SalesModule } from '@modules/sales/sales.module';
import { PricingModule } from '@modules/pricing/pricing.module';
import { ReportsModule } from '@modules/reports/reports.module';
import { ComplianceModule } from '@modules/compliance/compliance.module';
import { SecurityModule } from '@modules/security/security.module';
import { MinistryModule } from '@modules/ministry/ministry.module';
import { AuditModule } from '@modules/audit/audit.module';
import { FilesModule } from '@modules/files/files.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { I18nModule } from '@modules/i18n/i18n.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, rabbitmqConfig, minioConfig, authConfig, appConfig],
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...AppDataSource.options,
        autoLoadEntities: true,
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: (configService: any) => [{
        ttl: configService.get('app.rateLimit.ttl', 60) * 1000,
        limit: configService.get('app.rateLimit.limit', 100),
      }],
      inject: [],
    }),

    // Event emitter
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),

    // Scheduler
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    RolesModule,
    ActorsModule,
    VehiclesModule,
    StocksModule,
    ClientsModule,
    SalesModule,
    PricingModule,
    ReportsModule,
    ComplianceModule,
    SecurityModule,
    MinistryModule,
    AuditModule,
    FilesModule,
    NotificationsModule,
    I18nModule,
  ],
})
export class AppModule {}
