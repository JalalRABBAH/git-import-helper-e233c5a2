import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Sale } from '@modules/sales/entities/sale.entity';
import { Invoice } from '@modules/sales/entities/sale.entity';
import { Vehicle } from '@modules/vehicles/entities/vehicle.entity';
import { VehicleStatus } from '@shared/enums/vehicle.enum';
import { PaymentMethod } from '@shared/enums/sale.enum';
import { DateUtil } from '@common/utils/date.util';

const logger = new Logger('SalesSeed');

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

interface SalesSeedContext {
  vehicleIds: string[];
  clientIds: string[];
  actorIds: string[];
  userMap: Map<string, string>;
}

export async function seedSales(
  dataSource: DataSource,
  ctx: SalesSeedContext,
): Promise<string[]> {
  const saleRepo = dataSource.getRepository(Sale);
  const invoiceRepo = dataSource.getRepository(Invoice);
  const vehicleRepo = dataSource.getRepository(Vehicle);
  const saleIds: string[] = [];

  const paymentMethods = Object.values(PaymentMethod);

  // Select first 30 vehicles that are IN_STOCK for sales
  const availableVehicleIds = ctx.vehicleIds.slice(0, 30);

  for (let i = 0; i < 30; i++) {
    const vehicleId = availableVehicleIds[i];
    const clientId = ctx.clientIds[i % ctx.clientIds.length];
    const actorId = ctx.actorIds[i % ctx.actorIds.length];
    // Use actual seeded user IDs as sellers (cycle through enterprise sellers)
    const sellerEmails = ['seller@fasomoto.bf', 'admin@fasomoto.bf', 'manager@fasomoto.bf', 'admin@burkinawheels.bf'];
    const sellerId = ctx.userMap.get(sellerEmails[i % sellerEmails.length]) || ctx.clientIds[(i + 5) % ctx.clientIds.length];

    const basePrice = 500000 + Math.floor(seededRandom(i + 50) * 2500000);
    const taxAmount = Math.round(basePrice * 0.18 * 100) / 100;
    const totalAmount = Math.round((basePrice + taxAmount) * 100) / 100;

    const existing = await saleRepo.findOne({
      where: { vehicleId, status: 'PAID' },
    });

    if (!existing) {
      const sale = saleRepo.create({
        actorId,
        vehicleId,
        clientId,
        sellerUserId: sellerId,
        status: 'PAID',
        salePrice: basePrice,
        discountAmount: i % 7 === 0 ? Math.round(basePrice * 0.05 * 100) / 100 : undefined,
        taxAmount,
        totalAmount: i % 7 === 0 ? Math.round((basePrice * 0.95 + taxAmount) * 100) / 100 : totalAmount,
        paymentMethod: paymentMethods[i % paymentMethods.length],
        notes: `Transaction test #${i + 1} - Vente enregistrée automatiquement`,
        metadata: {
          seedIndex: i + 1,
          salesChannel: i % 3 === 0 ? 'DIRECT' : i % 3 === 1 ? 'DEALER' : 'ONLINE',
          warrantyMonths: 12 + (i % 24),
        },
      });

      const saved = await saleRepo.save(sale);
      saleIds.push(saved.id);

      // Update vehicle status to SOLD for first 30 vehicles
      const vehicle = await vehicleRepo.findOne({ where: { id: vehicleId } });
      if (vehicle) {
        vehicle.status = VehicleStatus.SOLD;
        await vehicleRepo.save(vehicle);
      }

      // Create invoice
      const invoice = invoiceRepo.create({
        saleId: saved.id,
        invoiceNumber: `FAC-SEED-${Date.now()}-${saved.id.slice(0, 8)}`,
        issueDate: new Date(Date.now() - (30 - i) * 86400000),
        dueDate: DateUtil.addDays(new Date(Date.now() - (30 - i) * 86400000), 30),
        status: 'ISSUED',
        subtotal: saved.salePrice,
        taxTotal: saved.taxAmount,
        total: saved.totalAmount,
        taxBreakdown: {
          tva: { rate: 0.18, amount: saved.taxAmount },
          ohada: { rate: 0.02, amount: Math.round(saved.salePrice * 0.02 * 100) / 100 },
        },
      });
      await invoiceRepo.save(invoice);
    } else {
      saleIds.push(existing.id);
    }
  }

  logger.log(`Sales seed completed (${saleIds.length} sales)`);
  return saleIds;
}
