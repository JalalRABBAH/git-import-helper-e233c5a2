import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinistryController } from './ministry.controller';
import { MinistryService } from './ministry.service';
import { AgreementDecision, RegulatoryPublication } from './entities/ministry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgreementDecision, RegulatoryPublication])],
  controllers: [MinistryController],
  providers: [MinistryService],
  exports: [MinistryService],
})
export class MinistryModule {}
