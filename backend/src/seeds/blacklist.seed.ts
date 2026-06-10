import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { VehicleBlacklist, Vehicle } from '@modules/vehicles/entities/vehicle.entity';

const logger = new Logger('BlacklistSeed');

const BLACKLIST_ENTRIES = [
  { reason: 'STOLEN', reasonDetails: 'Véhicule signalé volé le 15/01/2024 - Plainte #2341/2024' },
  { reason: 'FRAUD', reasonDetails: 'Documents d\'importation falsifiés détectés lors de l\'inspection' },
  { reason: 'COUNTERFEIT', reasonDetails: 'Numéro de chassis contrefait - non conforme au constructeur' },
  { reason: 'NON_COMPLIANT', reasonDetails: 'Non conformité aux normes d\'homologation BF-2024-EM-001' },
  { reason: 'ADMIN_SEIZURE', reasonDetails: 'Saisie administrative ordonnée par le tribunal de commerce' },
  { reason: 'INSURANCE_TOTAL_LOSS', reasonDetails: 'Véhicule déclaré perte totale par l\'assureur #SA2024' },
  { reason: 'STOLEN', reasonDetails: 'Vol signalé - Commissariat du 3ème arrondissement' },
  { reason: 'FRAUD', reasonDetails: 'Tentative de vente avec carte grise falsifiée' },
  { reason: 'NON_COMPLIANT', reasonDetails: 'Non conformité émission Euro 4 requise pour l\'import' },
  { reason: 'COUNTERFEIT', reasonDetails: 'Pièces détachées contrefaites identifiées lors du contrôle' },
];

export async function seedBlacklist(
  dataSource: DataSource,
  vehicleIds: string[],
): Promise<void> {
  const blacklistRepo = dataSource.getRepository(VehicleBlacklist);
  const vehicleRepo = dataSource.getRepository(Vehicle);

  // Use vehicles 31-40 (after the 30 sold ones) for blacklist
  const blacklistVehicleIds = vehicleIds.slice(30, 40);

  for (let i = 0; i < 10; i++) {
    const vehicleId = blacklistVehicleIds[i];
    if (!vehicleId) continue;

    const vehicle = await vehicleRepo.findOne({ where: { id: vehicleId } });
    if (!vehicle) continue;

    const existing = await blacklistRepo.findOne({
      where: { vin: vehicle.vin },
    });

    if (!existing) {
      const entry = blacklistRepo.create({
        vehicleId,
        vin: vehicle.vin,
        reason: BLACKLIST_ENTRIES[i].reason as any,
        reasonDetails: BLACKLIST_ENTRIES[i].reasonDetails,
        source: i < 5 ? 'MINISTRY_INSPECTION' : 'POLICE_REPORT',
        isActive: true,
        metadata: {
          seedIndex: i + 1,
          reportedBy: i % 2 === 0 ? 'inspector@iregmoto.gov.bf' : 'police@pn.bf',
          reportDate: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
        },
      });
      await blacklistRepo.save(entry);
    }
  }

  logger.log(`Blacklist seed completed (10 blacklisted models)`);
}
