import { registerAs } from '@nestjs/config';

export default registerAs('minio', () => ({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'iregminio',
  secretKey: process.env.MINIO_SECRET_KEY || 'iregminio_password',
  buckets: {
    kycDocuments: process.env.MINIO_BUCKET_KYC || 'ireg-kyc-documents',
    vehiclePhotos: process.env.MINIO_BUCKET_VEHICLE || 'ireg-vehicle-photos',
    reports: process.env.MINIO_BUCKET_REPORTS || 'ireg-reports',
    invoices: process.env.MINIO_BUCKET_INVOICES || 'ireg-invoices',
    temp: process.env.MINIO_BUCKET_TEMP || 'ireg-temp',
  },
  presignedExpiry: parseInt(process.env.MINIO_PRESIGNED_EXPIRY || '3600', 10),
  maxFileSize: parseInt(process.env.MINIO_MAX_FILE_SIZE || '10485760', 10), // 10MB
}));
