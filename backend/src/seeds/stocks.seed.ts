import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Vehicle, VehicleCategoryEntity } from '@modules/vehicles/entities/vehicle.entity';
import { VehicleCategory, FuelType, Transmission, VehicleStatus } from '@shared/enums/vehicle.enum';

const logger = new Logger('StocksSeed');

const MANUFACTURERS = [
  'Yamaha', 'Honda', 'Suzuki', 'Kawasaki', 'Bajaj', 'TVS', 'Haojue',
  'Kymco', 'Piaggio', 'Vespa', 'KTM', 'Ducati', 'BMW Motorrad', 'Hero',
  'Dayun', 'Lifan', 'Shineray', 'Zongshen', 'CFMoto', 'Keeway',
];

const MODELS: Record<string, string[]> = {
  Yamaha: ['MT-07', 'MT-09', 'YZF-R3', 'YZF-R6', 'XSR700', 'Ténéré 700', 'FZ-S V3', 'Fascino 125'],
  Honda: ['CBR500R', 'CB500F', 'Africa Twin', 'CRF300L', 'Click 125', 'Wave 110', 'PCX 160'],
  Suzuki: ['GSX-R750', 'V-Strom 650', 'Burgman 200', 'GSX-S750', 'Hayabusa', 'Address 110'],
  Kawasaki: ['Ninja 400', 'Z650', 'Versys 650', 'KLX 300', 'Z900', 'Ninja ZX-10R'],
  Bajaj: ['Boxer 150', 'Pulsar NS200', 'Pulsar RS200', 'Dominar 400', 'CT 100', 'Platina 110'],
  TVS: ['Apache RTR 200', 'Apache RR 310', 'NTorq 125', 'Jupiter 125', 'XL100', 'iQube'],
  Haojue: ['NK150', 'TR150', 'KA125', 'HJ125', 'UHR150', 'AFR125'],
  Kymco: ['Agility 125', 'Downtown 350', 'AK 550', 'Like 125', 'XCiting 400'],
  Piaggio: ['Beverly 350', 'Liberty 125', 'Medley 125', 'MP3 500', 'Fly 150'],
  Vespa: ['Primavera 125', 'Sprint 150', 'GTS 300', 'S 125', 'LX 125'],
  KTM: ['Duke 200', 'Duke 390', 'RC 390', 'Adventure 390', 'Duke 890'],
  Ducati: ['Monster 821', 'Panigale V2', 'Scrambler Icon', 'Multistrada V2'],
  'BMW Motorrad': ['G 310 R', 'G 310 GS', 'F 750 GS', 'F 900 R', 'R 1250 GS'],
  Hero: ['Splendor Plus', 'Passion Pro', 'Xtreme 160R', 'HF Deluxe', 'Glamour'],
  Dayun: ['DY150', 'DY125', 'DY250', 'DY110', 'DY200'],
  Lifan: ['KP200', 'KPR200', 'LF150', 'LF200', 'KP250'],
  Shineray: ['XY150', 'XY200', 'XY250', 'XY400', 'XY125'],
  Zongshen: ['ZS150', 'ZS200', 'ZS250', 'RX3', 'Cyclone 400'],
  CFMoto: ['300NK', '650NK', '300SR', '650MT', '800MT'],
  Keeway: ['RKF 125', 'K-Light 202', 'Superlight 125', 'Cityblade 125'],
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export async function seedStocks(
  dataSource: DataSource,
  enterpriseMap: Map<string, string>,
): Promise<{ vehicleIds: string[]; actorIds: string[] }> {
  const vehicleRepo = dataSource.getRepository(Vehicle);
  const categoryRepo = dataSource.getRepository(VehicleCategoryEntity);
  const vehicleIds: string[] = [];
  const actorIdList = Array.from(enterpriseMap.values());

  // Fetch real category IDs from database
  const dbCategories = await categoryRepo.find();
  const categoryIds = dbCategories.length > 0
    ? dbCategories.map(c => c.id)
    : ['00000000-0000-0000-0000-000000000001'];

  const categories = Object.values(VehicleCategory);
  const fuels = Object.values(FuelType);
  const transmissions = Object.values(Transmission);

  let vehicleIndex = 0;
  for (const [entKey, actorId] of enterpriseMap.entries()) {
    for (let i = 0; i < 50; i++) {
      const globalIdx = vehicleIndex * 50 + i;
      const manufacturer = MANUFACTURERS[globalIdx % MANUFACTURERS.length];
      const modelList = MODELS[manufacturer] || ['Standard'];
      const model = modelList[i % modelList.length];
      const year = 2021 + (i % 5);
      const vin = `BF${manufacturer.substring(0, 2).toUpperCase()}${String(year).substring(2)}${String(globalIdx + 1).padStart(6, '0')}XXXXX`;

      const existing = await vehicleRepo.findOne({ where: { vin } });

      if (!existing) {
        const category = categories[i % categories.length];
        const fuel = category.includes('ELECTRIQUE') ? FuelType.ELECTRIQUE : fuels[i % fuels.length];
        const status = i < 45 ? VehicleStatus.IN_STOCK : VehicleStatus.RESERVED;

        const vehicle = vehicleRepo.create({
          vin,
          chassisNumber: `CHS${String(globalIdx + 1).padStart(8, '0')}`,
          engineNumber: `ENG${String(globalIdx + 1).padStart(8, '0')}`,
          manufacturer,
          model,
          modelYear: year,
          categoryId: categoryIds[i % categoryIds.length],
          fuelType: fuel,
          transmission: transmissions[i % transmissions.length],
          cylinderCapacityCc: category.includes('50CC') ? 50 : category.includes('125CC') ? 125 : 150 + (i % 800),
          powerKw: 5 + (i % 50),
          weightKg: 100 + (i % 150),
          color: ['Rouge', 'Noir', 'Bleu', 'Blanc', 'Gris', 'Vert', 'Jaune', 'Orange'][i % 8],
          status,
          currentOwnerActorId: actorId,
          importCountryCode: ['CN', 'JP', 'IN', 'ID', 'TH', 'VN', 'TW', 'DE', 'IT'][i % 9],
          importDeclarationNumber: `DECL-${2023 + (i % 2)}-${String(globalIdx + 1).padStart(5, '0')}`,
          importDate: new Date(`${2023 + (i % 2)}-${String((i % 12) + 1).padStart(2, '0')}-15`),
          customsValue: 500000 + (i % 200) * 50000,
          homologationNumber: `HOMO-BF-${2023}-${String(globalIdx + 1).padStart(4, '0')}`,
          complianceStatus: 'COMPLIANT',
          metadata: {
            seedIndex: globalIdx + 1,
            enterprise: entKey,
            batchNumber: `BATCH-${2024}-${String(Math.floor(i / 10) + 1).padStart(2, '0')}`,
          },
        });

        const saved = await vehicleRepo.save(vehicle);
        vehicleIds.push(saved.id);
      } else {
        vehicleIds.push(existing.id);
      }
    }
    vehicleIndex++;
  }

  logger.log(`Stocks seed completed (${vehicleIds.length} vehicles)`);
  return { vehicleIds, actorIds: actorIdList };
}
