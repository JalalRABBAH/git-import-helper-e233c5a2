import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { Vehicle, VehicleBlacklist, VehicleCategoryEntity } from './entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, VehicleBlacklist, VehicleCategoryEntity])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
