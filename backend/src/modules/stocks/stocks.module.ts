import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';
import { StockMovement, InventoryCount } from './entities/stock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovement, InventoryCount])],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
