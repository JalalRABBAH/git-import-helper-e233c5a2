import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { seedRoles } from './roles.seed';
import { seedEnterprises } from './enterprises.seed';
import { seedUsers } from './users.seed';
import { seedClients } from './clients.seed';
import { seedStocks } from './stocks.seed';
import { seedSales } from './sales.seed';
import { seedBlacklist } from './blacklist.seed';

const logger = new Logger('SeedRunner');

async function runSeeds() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'ireg_user',
    password: process.env.DB_PASSWORD || 'ireg_password',
    database: process.env.DB_NAME || 'ireg_moto_bf',
    schema: process.env.DB_SCHEMA || 'public',
    entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  await dataSource.initialize();
  logger.log('Database connection established');

  try {
    await seedRoles(dataSource);
    const enterpriseMap = await seedEnterprises(dataSource);
    const userMap = await seedUsers(dataSource, enterpriseMap);
    const clientIds = await seedClients(dataSource);
    const { vehicleIds, actorIds } = await seedStocks(dataSource, enterpriseMap);
    await seedSales(dataSource, { vehicleIds, clientIds, actorIds, userMap });
    await seedBlacklist(dataSource, vehicleIds);

    logger.log('All seeds completed successfully');
  } catch (error) {
    logger.error('Seed failed', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

runSeeds().catch((err) => {
  console.error(err);
  process.exit(1);
});
