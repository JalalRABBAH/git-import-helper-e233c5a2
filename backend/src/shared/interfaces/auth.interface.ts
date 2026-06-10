export interface TokenPayload {
  sub: string;       // userId
  email: string;
  roles: string[];
  permissions: string[];
  actorId?: string;
  locale: string;
  type: 'access' | 'refresh';
  jti: string;       // JWT ID unique
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface MfaSetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface OauthProfile {
  provider: string;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}
