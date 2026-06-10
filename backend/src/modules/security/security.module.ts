import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { FraudAlert, SecurityBlacklist, SeizedVehicle } from './entities/security.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FraudAlert, SecurityBlacklist, SeizedVehicle])],
  controllers: [SecurityController],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
