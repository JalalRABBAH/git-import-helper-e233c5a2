// =============================================================================
// iReg Moto BF — Gestion des Listes d'Interdiction
// Modèles interdits, zones interdites, personnes interdites
// Cache local avec TTL, mise à jour par API ministère
// =============================================================================

import {
  IBlacklistManager,
  BlacklistedModel,
  RestrictedZone,
  BlacklistType,
  BlacklistedEntry,
  StructuredLogger,
  ConsoleLogger,
} from './types';

// ============================================================================
// INTERFACE — Source de données blacklist
// ============================================================================

export interface IBlacklistDataSource {
  fetchBlacklistedModels(): Promise<BlacklistedModel[]>;
  fetchRestrictedZones(): Promise<RestrictedZone[]>;
  fetchBlacklistedEntities(type: BlacklistType): Promise<BlacklistedEntry[]>;
  getLastUpdateTime(): Promise<Date | null>;
}

// ============================================================================
// CACHE LOCAL AVEC TTL
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  expiresAt: number; // timestamp
}

export class BlacklistCache {
  private models: CacheEntry<BlacklistedModel[]> | null = null;
  private zones: CacheEntry<RestrictedZone[]> | null = null;
  private entities: Map<BlacklistType, CacheEntry<BlacklistedEntry[]>> = new Map();
  private defaultTtlMs: number;

  constructor(defaultTtlMs: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTtlMs = defaultTtlMs;
  }

  getModels(): BlacklistedModel[] | null {
    if (this.models && Date.now() < this.models.expiresAt) {
      return this.models.data;
    }
    return null;
  }

  setModels(models: BlacklistedModel[], ttlMs?: number): void {
    this.models = {
      data: models,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    };
  }

  getZones(): RestrictedZone[] | null {
    if (this.zones && Date.now() < this.zones.expiresAt) {
      return this.zones.data;
    }
    return null;
  }

  setZones(zones: RestrictedZone[], ttlMs?: number): void {
    this.zones = {
      data: zones,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    };
  }

  getEntities(type: BlacklistType): BlacklistedEntry[] | null {
    const entry = this.entities.get(type);
    if (entry && Date.now() < entry.expiresAt) {
      return entry.data;
    }
    return null;
  }

  setEntities(type: BlacklistType, entities: BlacklistedEntry[], ttlMs?: number): void {
    this.entities.set(type, {
      data: entities,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  invalidateAll(): void {
    this.models = null;
    this.zones = null;
    this.entities.clear();
  }

  invalidate(type: 'models' | 'zones' | 'entities'): void {
    switch (type) {
      case 'models': this.models = null; break;
      case 'zones': this.zones = null; break;
      case 'entities': this.entities.clear(); break;
    }
  }
}

// ============================================================================
// SOURCE DE DONNÉES EN MÉMOIRE (pour tests et fallback)
// ============================================================================

export class InMemoryBlacklistDataSource implements IBlacklistDataSource {
  private models: BlacklistedModel[] = [];
  private zones: RestrictedZone[] = [];
  private entities: Map<BlacklistType, BlacklistedEntry[]> = new Map();
  private lastUpdate: Date | null = null;

  constructor() {
    // Initialize with default data
    this.seedDefaultData();
  }

  private seedDefaultData(): void {
    // Modèles interdits depuis 2022 (exemples)
    this.models = [
      {
        id: 'blm-001',
        manufacturer: 'MOTO_INCONNUE',
        model: 'XG-50',
        yearFrom: 2018,
        yearTo: 2025,
        reason: 'Non homologué UEMOA, émissions non conformes',
        bannedSince: new Date('2022-01-15'),
        source: 'MINISTERE_COMMERCE',
      },
      {
        id: 'blm-002',
        manufacturer: 'SCOOTER_IMPORT',
        model: 'ZZ-125',
        yearFrom: 2019,
        yearTo: undefined, // Still banned
        reason: 'Contrefaçon de marque, pièces non conformes',
        bannedSince: new Date('2022-03-20'),
        source: 'CNTI',
      },
      {
        id: 'blm-003',
        manufacturer: 'POWER_BIKE',
        model: 'MONSTER_200',
        yearFrom: 2020,
        yearTo: undefined,
        reason: 'Cylindrée > 125cc non autorisée pour import',
        bannedSince: new Date('2022-06-01'),
        source: 'DOUANE_UEMOA',
      },
      {
        id: 'blm-004',
        manufacturer: 'ELECTRO_SCOOT',
        model: 'E-FAST',
        yearFrom: 2021,
        yearTo: undefined,
        reason: 'Batterie non certifiée, risque incendie',
        bannedSince: new Date('2023-01-10'),
        source: 'MINISTERE_COMMERCE',
      },
    ];

    // Zones interdites / à risque
    this.zones = [
      {
        id: 'blz-001',
        name: 'Zone frontalière Mali — Oudalan',
        riskLevel: 'CRITICAL',
        centerLat: 14.6,
        centerLng: -0.3,
        radiusMeters: 25000,
        reason: 'Contrebande active, flux non déclarés',
        validFrom: new Date('2022-01-01'),
      },
      {
        id: 'blz-002',
        name: 'Zone frontalière CIV — Comoé',
        riskLevel: 'HIGH',
        centerLat: 10.2,
        centerLng: -4.5,
        radiusMeters: 20000,
        reason: 'Forte activité de revente parallèle',
        validFrom: new Date('2022-01-01'),
      },
      {
        id: 'blz-003',
        name: 'Marché noir Ouagadougou (Kilwin)',
        riskLevel: 'HIGH',
        centerLat: 12.37,
        centerLng: -1.52,
        radiusMeters: 3000,
        reason: 'Vente non déclarée de véhicules volés',
        validFrom: new Date('2023-06-01'),
      },
      {
        id: 'blz-004',
        name: 'Zone frontalière Ghana — Boulgou',
        riskLevel: 'MEDIUM',
        centerLat: 11.3,
        centerLng: -0.1,
        radiusMeters: 15000,
        reason: 'Importation parallèle depuis le Ghana',
        validFrom: new Date('2022-01-01'),
      },
    ];

    this.lastUpdate = new Date();
  }

  async fetchBlacklistedModels(): Promise<BlacklistedModel[]> {
    return [...this.models];
  }

  async fetchRestrictedZones(): Promise<RestrictedZone[]> {
    return [...this.zones];
  }

  async fetchBlacklistedEntities(type: BlacklistType): Promise<BlacklistedEntry[]> {
    return [...(this.entities.get(type) ?? [])];
  }

  async getLastUpdateTime(): Promise<Date | null> {
    return this.lastUpdate;
  }

  // Methods for seeding test data
  addModel(model: BlacklistedModel): void {
    this.models.push(model);
    this.lastUpdate = new Date();
  }

  addZone(zone: RestrictedZone): void {
    this.zones.push(zone);
    this.lastUpdate = new Date();
  }

  addEntity(type: BlacklistType, entry: BlacklistedEntry): void {
    const existing = this.entities.get(type) ?? [];
    existing.push(entry);
    this.entities.set(type, existing);
    this.lastUpdate = new Date();
  }
}

// ============================================================================
// BLACKLIST MANAGER — Implémentation
// ============================================================================

export class BlacklistManager implements IBlacklistManager {
  private dataSource: IBlacklistDataSource;
  private cache: BlacklistCache;
  private logger: StructuredLogger;

  constructor(
    dataSource?: IBlacklistDataSource,
    cache?: BlacklistCache,
    logger?: StructuredLogger,
  ) {
    this.dataSource = dataSource ?? new InMemoryBlacklistDataSource();
    this.cache = cache ?? new BlacklistCache();
    this.logger = logger ?? new ConsoleLogger();
  }

  async refreshCache(): Promise<void> {
    this.logger.info('Refreshing blacklist cache');
    this.cache.invalidateAll();

    try {
      const [models, zones] = await Promise.all([
        this.dataSource.fetchBlacklistedModels(),
        this.dataSource.fetchRestrictedZones(),
      ]);

      this.cache.setModels(models);
      this.cache.setZones(zones);

      // Fetch all entity types
      for (const type of Object.values(BlacklistType)) {
        const entities = await this.dataSource.fetchBlacklistedEntities(type);
        this.cache.setEntities(type, entities);
      }

      this.logger.info('Blacklist cache refreshed', {
        modelsCount: models.length,
        zonesCount: zones.length,
      });
    } catch (error) {
      this.logger.error('Failed to refresh blacklist cache', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async isVehicleBlacklisted(vin: string): Promise<boolean> {
    let models = this.cache.getModels();
    if (!models) {
      models = await this.dataSource.fetchBlacklistedModels();
      this.cache.setModels(models);
    }

    // In production, VIN contains manufacturer and model info
    // Here we do a simplified check
    return models.some(m => {
      const vinUpper = vin.toUpperCase();
      return vinUpper.includes(m.manufacturer.toUpperCase()) ||
        vinUpper.includes(m.model.toUpperCase());
    });
  }

  async isModelBlacklisted(manufacturer: string, model: string, year: number): Promise<boolean> {
    let models = this.cache.getModels();
    if (!models) {
      models = await this.dataSource.fetchBlacklistedModels();
      this.cache.setModels(models);
    }

    return models.some(m => {
      const manuMatch = m.manufacturer.toUpperCase() === manufacturer.toUpperCase();
      const modelMatch = m.model.toUpperCase() === model.toUpperCase();
      const yearMatch = year >= m.yearFrom && (m.yearTo === undefined || year <= m.yearTo);
      return manuMatch && modelMatch && yearMatch;
    });
  }

  async isClientBlacklisted(clientId: string): Promise<boolean> {
    let entities = this.cache.getEntities(BlacklistType.CLIENT);
    if (!entities) {
      entities = await this.dataSource.fetchBlacklistedEntities(BlacklistType.CLIENT);
      this.cache.setEntities(BlacklistType.CLIENT, entities);
    }

    return entities.some(e => e.entityIdentifier === clientId && e.isActive);
  }

  async isZoneRestricted(lat: number, lng: number): Promise<{ restricted: boolean; reason?: string }> {
    let zones = this.cache.getZones();
    if (!zones) {
      zones = await this.dataSource.fetchRestrictedZones();
      this.cache.setZones(zones);
    }

    for (const zone of zones) {
      if (!zone.validTo || zone.validTo > new Date()) {
        const distance = this.haversineDistance(
          lat, lng, zone.centerLat, zone.centerLng
        );
        if (distance <= zone.radiusMeters) {
          return {
            restricted: true,
            reason: `${zone.name}: ${zone.reason} (niveau: ${zone.riskLevel})`,
          };
        }
      }
    }

    return { restricted: false };
  }

  async getBlacklistedModels(): Promise<BlacklistedModel[]> {
    let models = this.cache.getModels();
    if (!models) {
      models = await this.dataSource.fetchBlacklistedModels();
      this.cache.setModels(models);
    }
    return models;
  }

  async getRestrictedZones(): Promise<RestrictedZone[]> {
    let zones = this.cache.getZones();
    if (!zones) {
      zones = await this.dataSource.fetchRestrictedZones();
      this.cache.setZones(zones);
    }
    return zones;
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return deg * Math.PI / 180;
  }
}
