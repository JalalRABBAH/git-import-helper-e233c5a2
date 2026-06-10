import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'ireg_user',
  password: process.env.DB_PASSWORD || 'ireg_password',
  database: process.env.DB_NAME || 'ireg_moto_bf',
  schema: process.env.DB_SCHEMA || 'public',
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  extra: {
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_TIMEOUT || '5000', 10),
  },
};

export default registerAs('database', () => config);
export const AppDataSource = new DataSource(config);
