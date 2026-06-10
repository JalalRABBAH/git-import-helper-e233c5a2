import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActorsController } from './actors.controller';
import { ActorsService } from './actors.service';
import { Actor, ActorDocument, Warehouse } from './entities/actor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Actor, ActorDocument, Warehouse])],
  controllers: [ActorsController],
  providers: [ActorsService],
  exports: [ActorsService],
})
export class ActorsModule {}
