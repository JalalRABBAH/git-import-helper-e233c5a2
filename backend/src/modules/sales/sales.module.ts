import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Sale, Invoice } from './entities/sale.entity';
import { Vehicle, VehicleBlacklist } from '@modules/vehicles/entities/vehicle.entity';
import { Client } from '@modules/clients/entities/client.entity';
import { AuditService } from '@modules/audit/audit.service';
import { AuditLog } from '@modules/audit/entities/audit.entity';
import { StockMovement } from '@modules/stocks/entities/stock.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, Invoice, Vehicle, VehicleBlacklist, Client, AuditLog, StockMovement]),
  ],
  controllers: [SalesController],
  providers: [SalesService, AuditService],
  exports: [SalesService],
})
export class SalesModule {}
