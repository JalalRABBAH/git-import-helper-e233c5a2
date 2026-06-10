export interface AuditEvent {
  id: string;
  eventType: string;
  actorType: 'USER' | 'SYSTEM' | 'EXTERNAL';
  actorId: string;
  targetEntity: string;
  targetId: string;
  action: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  hash: string;         // SHA-256 chainé
  previousHash: string;
}
