import { registerAs } from '@nestjs/config';

function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[SECURITY] La variable d'environnement ${name} est requise. Veuillez la définir dans le fichier .env`);
  }
  return value;
}

export default registerAs('auth', () => ({
  jwt: {
    secret: requireEnvVar('JWT_SECRET'),
    refreshSecret: requireEnvVar('JWT_REFRESH_SECRET'),
    publicKey: process.env.JWT_PUBLIC_KEY,
    privateKey: process.env.JWT_PRIVATE_KEY,
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'ireg-moto-bf-api',
    audience: process.env.JWT_AUDIENCE || 'ireg-moto-bf-client',
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
  },
  oauth: {
    google: {
      clientId: process.env.OAUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.OAUTH_GOOGLE_CALLBACK || '/auth/oauth/google/callback',
    },
    microsoft: {
      clientId: process.env.OAUTH_MICROSOFT_CLIENT_ID,
      clientSecret: process.env.OAUTH_MICROSOFT_CLIENT_SECRET,
      callbackUrl: process.env.OAUTH_MICROSOFT_CALLBACK || '/auth/oauth/microsoft/callback',
    },
  },
  mfa: {
    issuer: process.env.MFA_ISSUER || 'iRegMotoBF',
    digits: 6,
    step: 30,
    window: 1,
    maxAttempts: 5,
    lockoutMinutes: 15,
  },
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '12', 10),
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    maxAgeDays: parseInt(process.env.PASSWORD_MAX_AGE_DAYS || '90', 10),
  },
  session: {
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5', 10),
    idleTimeoutMinutes: parseInt(process.env.SESSION_IDLE_TIMEOUT || '30', 10),
  },
}));
