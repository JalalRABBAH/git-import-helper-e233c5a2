-- =============================================================================
-- iReg Moto BF — Schéma PostgreSQL Complet
-- Plateforme réglementaire pour la conformité des deux-roues motorisés
-- Burkina Faso — Arrêté ministériel 05/06/2026
-- Version: 1.0.0 | PostgreSQL 15+ | PostGIS (optionnel)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Recherche textuelle fuzzy
CREATE EXTENSION IF NOT EXISTS "btree_gin";    -- Index GIN pour types scalaires

-- ---------------------------------------------------------------------------
-- 1. TYPES ENUM
-- ---------------------------------------------------------------------------

-- Acteurs économiques
CREATE TYPE actor_type_enum AS ENUM (
    'IMPORTATEUR', 'DISTRIBUTEUR', 'ASSEMBLEUR', 'DETAILLANT', 'PRESTATAIRE'
);

CREATE TYPE actor_status_enum AS ENUM (
    'PENDING', 'ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED'
);

CREATE TYPE agreement_status_enum AS ENUM (
    'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'RENEWAL_PENDING'
);

-- Véhicules
CREATE TYPE vehicle_category_enum AS ENUM (
    'CYCLOMOTEUR_50CC',       -- Cyclomoteur ≤ 50 cm³
    'MOTO_LEGERE_125CC',      -- Moto légère ≤ 125 cm³
    'MOTO_LOURDE_125CC_PLUS', -- Moto lourde > 125 cm³
    'TRICYCLE_MOTEUR',        -- Tricycle à moteur
    'QUADRACYCLE',            -- Quadricycle à moteur
    'ELECTRIQUE_50CC_EQ',     -- Électrique équivalent ≤ 50cc
    'ELECTRIQUE_125CC_EQ',    -- Électrique équivalent ≤ 125cc
    'ELECTRIQUE_PLUS',        -- Électrique équivalent > 125cc
    'INTERDITE'               -- Catégorie interdite à l'importation
);

CREATE TYPE fuel_type_enum AS ENUM (
    'ESSENCE', 'DIESEL', 'ELECTRIQUE', 'HYBRIDE', 'GPL'
);

CREATE TYPE transmission_enum AS ENUM (
    'MANUELLE', 'AUTOMATIQUE', 'SEMI_AUTOMATIQUE', 'CONTINUOUSLY_VARIABLE'
);

CREATE TYPE vehicle_status_enum AS ENUM (
    'IMPORTED', 'IN_STOCK', 'RESERVED', 'SOLD', 'REGISTERED', 'STOLEN', 'SCRAPPED', 'EXPORTED'
);

CREATE TYPE blacklist_reason_enum AS ENUM (
    'STOLEN', 'FRAUD', 'COUNTERFEIT', 'NON_COMPLIANT', 'ADMIN_SEIZURE', 'INSURANCE_TOTAL_LOSS'
);

-- Stocks
CREATE TYPE movement_type_enum AS ENUM (
    'IMPORT', 'ASSEMBLY', 'TRANSFER', 'SALE', 'RETURN', 'ADJUSTMENT', 'SCRAP', 'RESERVATION', 'RELEASE'
);

CREATE TYPE inventory_status_enum AS ENUM (
    'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'RECONCILED', 'DISCREPANCY_FOUND'
);

-- Clients
CREATE TYPE id_document_type_enum AS ENUM (
    'CNI', 'PASSPORT', 'CARTE_CONSULAIRE', 'NIF_CARD', 'PERMIS_CONDUIRE', 'CERTIFICAT_NAISSANCE'
);

CREATE TYPE client_status_enum AS ENUM (
    'PENDING_KYC', 'KYC_VERIFIED', 'KYC_REJECTED', 'BLACKLISTED'
);

CREATE TYPE biometric_type_enum AS ENUM (
    'FINGERPRINT_LEFT_THUMB', 'FINGERPRINT_RIGHT_THUMB', 'FINGERPRINT_LEFT_INDEX',
    'FINGERPRINT_RIGHT_INDEX', 'PHOTO_FACE', 'SIGNATURE'
);

-- Ventes
CREATE TYPE sale_status_enum AS ENUM (
    'DRAFT', 'PENDING_PAYMENT', 'PAID', 'PARTIALLY_PAID', 'CANCELLED', 'REFUNDED'
);

CREATE TYPE payment_method_enum AS ENUM (
    'CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHEQUE', 'CREDIT', 'INSTALLMENT'
);

CREATE TYPE invoice_status_enum AS ENUM (
    'DRAFT', 'ISSUED', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'
);

-- Conformité
CREATE TYPE compliance_rule_type_enum AS ENUM (
    'DOCUMENT', 'VEHICLE_SPEC', 'PRICING', 'STOCK', 'KYC', 'TIMING', 'CUSTOMS', 'TAX'
);

CREATE TYPE compliance_severity_enum AS ENUM (
    'INFO', 'WARNING', 'CRITICAL', 'BLOCKER'
);

CREATE TYPE compliance_status_enum AS ENUM (
    'COMPLIANT', 'NON_COMPLIANT_MINOR', 'NON_COMPLIANT_MAJOR', 'PENDING_REVIEW', 'EXEMPTED'
);

-- Rapports
CREATE TYPE report_period_enum AS ENUM (
    'Q1', 'Q2', 'Q3', 'Q4'
);

CREATE TYPE report_status_enum AS ENUM (
    'DRAFT', 'GENERATING', 'READY', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'AMENDMENT_REQUIRED'
);

CREATE TYPE report_format_enum AS ENUM (
    'XML_UEMOA', 'PDF_SIGNED', 'CSV', 'JSON'
);

-- Sécurité
CREATE TYPE fraud_alert_severity_enum AS ENUM (
    'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
);

CREATE TYPE fraud_alert_status_enum AS ENUM (
    'OPEN', 'UNDER_INVESTIGATION', 'CONFIRMED', 'FALSE_POSITIVE', 'CLOSED', 'ESCALATED'
);

CREATE TYPE transaction_flag_type_enum AS ENUM (
    'PRICE_ANOMALY', 'VOLUME_ANOMALY', 'CIRCULAR_TRADE', 'BLACKLISTED_VEHICLE',
    'SUSPICIOUS_CLIENT', 'GEO_ANOMALY', 'TIMING_ANOMALY', 'MULTIPLE_SAME_DAY'
);

-- Utilisateurs
CREATE TYPE user_role_enum AS ENUM (
    'SUPER_ADMIN', 'ADMIN_DRCTT', 'CONTROLEUR', 'IMPORTATEUR', 'DISTRIBUTEUR',
    'ASSEMBLEUR', 'DETAILLANT', 'AUDITEUR', 'CNTI_AGENT'
);

CREATE TYPE mfa_type_enum AS ENUM (
    'TOTP', 'SMS', 'BACKUP_CODE'
);

-- Notifications
CREATE_TYPE notification_channel_enum AS ENUM (
    'EMAIL', 'SMS', 'PUSH', 'IN_APP'
);

CREATE_TYPE notification_status_enum AS ENUM (
    'PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ'
);

-- Zones géographiques
CREATE TYPE geofence_type_enum AS ENUM (
    'INTERDITE', 'SURVEILLANCE_RENFORCEE', 'ZONE_AGREMENT', 'ZONE_DOUANE', 'ZONE_CONTROLE'
);

CREATE TYPE geofence_risk_level_enum AS ENUM (
    'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
);

-- ---------------------------------------------------------------------------
-- 2. FONCTION UTILITAIRE
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 3. TABLE : DEVISES ET TAUX DE CHANGE
-- ---------------------------------------------------------------------------
CREATE TABLE currencies (
    code CHAR(3) PRIMARY KEY,                      -- XOF, EUR, USD, NGN, GHS, XAF
    name VARCHAR(64) NOT NULL,
    symbol VARCHAR(8) NOT NULL,                    -- FCFA, €, $, ₦, GH₵
    decimal_places INT NOT NULL DEFAULT 0,         -- 0 pour XOF/XAF, 2 pour autres
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_currencies_updated_at
    BEFORE UPDATE ON currencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Devise par défaut : XOF
INSERT INTO currencies (code, name, symbol, decimal_places, is_default) VALUES
    ('XOF', 'Franc CFA (BCEAO)', 'FCFA', 0, TRUE),
    ('EUR', 'Euro', '€', 2, FALSE),
    ('USD', 'Dollar américain', '$', 2, FALSE),
    ('NGN', 'Naira nigérian', '₦', 2, FALSE),
    ('GHS', 'Cedi ghanéen', 'GH₵', 2, FALSE),
    ('XAF', 'Franc CFA (BEAC)', 'FCFA', 0, FALSE);

CREATE TABLE currency_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency CHAR(3) NOT NULL REFERENCES currencies(code),
    to_currency CHAR(3) NOT NULL REFERENCES currencies(code),
    rate DECIMAL(18, 8) NOT NULL,
    inverse_rate DECIMAL(18, 8) NOT NULL GENERATED ALWAYS AS (1 / rate) STORED,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    source VARCHAR(64) NOT NULL DEFAULT 'BCEAO',    -- BCEAO, MANUAL, CALCULATED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_from_to_different CHECK (from_currency != to_currency),
    CONSTRAINT uq_currency_rate_date UNIQUE (from_currency, to_currency, effective_date)
);

CREATE INDEX idx_currency_rates_lookup ON currency_rates(from_currency, to_currency, effective_date DESC);

-- ---------------------------------------------------------------------------
-- 4. TABLE : CONFIGURATIONS FISCALES (OHADA / UEMOA)
-- ---------------------------------------------------------------------------
CREATE TABLE tax_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_code VARCHAR(32) NOT NULL UNIQUE,           -- UEMOA-DD, UEMOA-TVA, UEMOA-DUS, OHADA-PRE
    tax_label VARCHAR(128) NOT NULL,                -- "Droit de Douane", "TVA"
    category VARCHAR(32) NOT NULL,                  -- CUSTOMS, VAT, EXCISE, REGISTRATION, OHADA
    rate_type VARCHAR(16) NOT NULL DEFAULT 'PERCENTAGE', -- PERCENTAGE, FIXED, SLIDING
    rate_value DECIMAL(10, 4),                      -- Taux (ex: 0.18 pour 18%)
    fixed_amount DECIMAL(15, 2),                    -- Montant fixe si applicable
    min_amount DECIMAL(15, 2),                      -- Montant minimum
    max_amount DECIMAL(15, 2),                      -- Montant maximum
    applicable_categories vehicle_category_enum[],  -- Catégories concernées
    applicable_actor_types actor_type_enum[],       -- Types d'acteurs concernés
    valid_from DATE NOT NULL,
    valid_to DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    legal_reference TEXT,                           -- Référence texte de loi
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_tax_config_updated_at
    BEFORE UPDATE ON tax_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Configurations fiscales initiales (Burkina Faso)
INSERT INTO tax_configurations (tax_code, tax_label, category, rate_type, rate_value, valid_from, legal_reference) VALUES
    ('UEMOA-TVA', 'Taxe sur la Valeur Ajoutée', 'VAT', 'PERCENTAGE', 0.18, '2020-01-01', 'Directive UEMOA N°08/2009/CM'),
    ('UEMOA-DD', 'Droit de Douane', 'CUSTOMS', 'PERCENTAGE', 0.35, '2020-01-01', 'Tarif Extérieur Commun UEMOA'),
    ('UEMOA-DUS-50', 'Droit d''Accise ≤50cc', 'EXCISE', 'FIXED', NULL, 5000.00, '2020-01-01', 'Code des Douanes UEMOA'),
    ('UEMOA-DUS-125', 'Droit d''Accise ≤125cc', 'EXCISE', 'FIXED', NULL, 15000.00, '2020-01-01', 'Code des Douanes UEMOA'),
    ('UEMOA-DUS-PLUS', 'Droit d''Accise >125cc', 'EXCISE', 'FIXED', NULL, 35000.00, '2020-01-01', 'Code des Douanes UEMOA'),
    ('UEMOA-RED', 'Redevance d''immatriculation', 'REGISTRATION', 'FIXED', NULL, 15000.00, '2020-01-01', 'Arrêté conjoint MTTD/MEF'),
    ('OHADA-PRE', 'Prélèvement OHADA', 'OHADA', 'PERCENTAGE', 0.02, '2020-01-01', 'Acte Uniforme OHADA SYSCOHADA');

-- ---------------------------------------------------------------------------
-- 5. TABLES : UTILISATEURS, RÔLES ET PERMISSIONS
-- ---------------------------------------------------------------------------
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name user_role_enum NOT NULL UNIQUE,
    label VARCHAR(64) NOT NULL,                     -- "Importateur", "Contrôleur DRCTT"
    description TEXT,
    hierarchy_level INT NOT NULL DEFAULT 0,         -- 0 = plus bas, 10 = SUPER_ADMIN
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO roles (name, label, description, hierarchy_level, is_system_role) VALUES
    ('SUPER_ADMIN', 'Super Administrateur', 'Accès complet à tous les modules', 10, TRUE),
    ('ADMIN_DRCTT', 'Administrateur DRCTT', 'Gestion nationale et configuration', 9, TRUE),
    ('CONTROLEUR', 'Contrôleur DRCTT', 'Inspection sur le terrain', 7, TRUE),
    ('AUDITEUR', 'Auditeur', 'Lecture seule tous les modules', 6, TRUE),
    ('CNTI_AGENT', 'Agent CNTI/PN', 'Signalement sécurité et blacklist', 5, TRUE),
    ('IMPORTATEUR', 'Importateur/Distributeur', 'Importation et distribution nationale', 4, FALSE),
    ('DISTRIBUTEUR', 'Distributeur', 'Distribution régionale', 3, FALSE),
    ('ASSEMBLEUR', 'Unité d''assemblage', 'Assemblage local', 3, FALSE),
    ('DETAILLANT', 'Détaillant', 'Vente au détail', 2, FALSE);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(64) NOT NULL,                  -- 'actor', 'vehicle', 'sale', 'report'
    action VARCHAR(32) NOT NULL,                    -- 'create', 'read', 'update', 'delete', 'submit', 'approve'
    condition VARCHAR(128),                         -- 'own', 'same_region', 'all'
    description TEXT,
    CONSTRAINT uq_permission_resource_action UNIQUE (resource, action, condition)
);

-- Matrice de permissions (extrait)
INSERT INTO permissions (resource, action, condition, description) VALUES
    ('actor', 'create', NULL, 'Créer un acteur économique'),
    ('actor', 'read', 'own', 'Consulter ses propres informations'),
    ('actor', 'read', 'all', 'Consulter tous les acteurs (admin)'),
    ('actor', 'update', 'own', 'Modifier ses informations'),
    ('actor', 'approve', NULL, 'Approuver un agrément'),
    ('vehicle', 'create', NULL, 'Enregistrer un véhicule'),
    ('vehicle', 'read', 'own', 'Consulter ses véhicules'),
    ('vehicle', 'read', 'all', 'Consulter tous les véhicules'),
    ('sale', 'create', NULL, 'Enregistrer une vente'),
    ('sale', 'read', 'own', 'Consulter ses ventes'),
    ('sale', 'cancel', NULL, 'Annuler une vente'),
    ('report', 'generate', 'own', 'Générer son rapport'),
    ('report', 'submit', 'own', 'Soumettre son rapport'),
    ('report', 'approve', NULL, 'Approuver un rapport (ministère)'),
    ('compliance', 'check', NULL, 'Lancer un contrôle'),
    ('compliance', 'read', 'own', 'Voir son score'),
    ('compliance', 'read', 'all', 'Voir tous les scores (admin)'),
    ('security', 'flag', NULL, 'Signaler une transaction'),
    ('security', 'read', NULL, 'Consulter les alertes'),
    ('admin', 'access', NULL, 'Accès portail admin'),
    ('admin', 'configure', NULL, 'Configuration système');

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Attribution permissions aux rôles (IMPORTATEUR)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'IMPORTATEUR'),
    id FROM permissions 
WHERE resource IN ('actor', 'vehicle', 'sale', 'report', 'compliance') 
  AND (condition = 'own' OR condition IS NULL);

-- Attribution permissions ADMIN_DRCTT
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'ADMIN_DRCTT'),
    id FROM permissions;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),                     -- NULL si OAuth2 uniquement
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    locale VARCHAR(10) NOT NULL DEFAULT 'fr_BF',    -- fr_BF, mos_BF, dyu_BF, fuv_BF
    timezone VARCHAR(64) NOT NULL DEFAULT 'Africa/Ouagadougou',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_metadata ON users USING GIN(metadata);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE user_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    actor_id UUID,                                     -- Lien vers actor (si rôle lié à entité)
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_primary_role BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_user_role_actor UNIQUE (user_id, role_id, actor_id)
);

CREATE INDEX idx_ura_user ON user_role_assignments(user_id);
CREATE INDEX idx_ura_role ON user_role_assignments(role_id);
CREATE INDEX idx_ura_actor ON user_role_assignments(actor_id) WHERE actor_id IS NOT NULL;

CREATE TABLE mfa_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mfa_type mfa_type_enum NOT NULL DEFAULT 'TOTP',
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,        -- Force par politique (admin)
    secret VARCHAR(255),                               -- Clé secrète TOTP (chiffrée)
    verified_at TIMESTAMPTZ,
    backup_codes JSONB DEFAULT '[]',                   -- Codes de secours (hachés)
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_mfa_user_type UNIQUE (user_id, mfa_type)
);

CREATE TRIGGER trg_mfa_settings_updated_at
    BEFORE UPDATE ON mfa_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL,
    name VARCHAR(128) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,                    -- SHA-256 du préfixe+clé
    key_prefix VARCHAR(16) NOT NULL,                   -- 8 premiers caractères (identification)
    scopes VARCHAR(64)[] NOT NULL DEFAULT '{}',        -- Permissions accordées
    rate_limit INT NOT NULL DEFAULT 1000,              -- Requêtes/minute
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_actor ON api_keys(actor_id);

-- ---------------------------------------------------------------------------
-- 6. TABLES : ACTEURS ÉCONOMIQUES (MODULE A)
-- ---------------------------------------------------------------------------
CREATE TABLE actor_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code actor_type_enum NOT NULL UNIQUE,
    label VARCHAR(128) NOT NULL,
    description TEXT,
    required_documents JSONB NOT NULL DEFAULT '[]',    -- Liste docs requis pour agrément
    can_import BOOLEAN NOT NULL DEFAULT FALSE,
    can_distribute BOOLEAN NOT NULL DEFAULT FALSE,
    can_assemble BOOLEAN NOT NULL DEFAULT FALSE,
    can_retail BOOLEAN NOT NULL DEFAULT FALSE,
    max_warehouses INT,                                 -- NULL = illimité
    reporting_frequency VARCHAR(16) DEFAULT 'QUARTERLY',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO actor_types (code, label, description, can_import, can_distribute, can_assemble, can_retail, max_warehouses, required_documents) VALUES
    ('IMPORTATEUR', 'Importateur/Distributeur', 'Importation et distribution nationale de 2R', TRUE, TRUE, FALSE, FALSE, NULL, '["REGISTRE_COMMERCE","NIF","ASSURANCE","CERTIFICATE_ORIGIN"]'),
    ('DISTRIBUTEUR', 'Distributeur', 'Distribution régionale', FALSE, TRUE, FALSE, FALSE, 5, '["REGISTRE_COMMERCE","NIF","CONTRAT_DISTRIBUTION"]'),
    ('ASSEMBLEUR', 'Unité d''assemblage', 'Assemblage local de 2R', FALSE, FALSE, TRUE, FALSE, 3, '["REGISTRE_COMMERCE","NIF","CERT_AGREEMENT","LOCAL_CONTENT_PLAN"]'),
    ('DETAILLANT', 'Détaillant', 'Vente au détail de 2R', FALSE, FALSE, FALSE, TRUE, 2, '["REGISTRE_COMMERCE","NIF"]'),
    ('PRESTATAIRE', 'Prestataire de services', 'Entretien, réparation', FALSE, FALSE, FALSE, FALSE, 1, '["REGISTRE_COMMERCE","NIF"]');

CREATE TABLE actors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_type_id UUID NOT NULL REFERENCES actor_types(id),
    status actor_status_enum NOT NULL DEFAULT 'PENDING',
    
    -- Identité
    company_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    nif VARCHAR(50) NOT NULL UNIQUE,                   -- Numéro Identification Fiscale
    rccm VARCHAR(50),                                   -- Registre Commerce
    
    -- Représentant légal
    legal_representative_name VARCHAR(200) NOT NULL,
    legal_representative_title VARCHAR(100),
    legal_representative_phone VARCHAR(20) NOT NULL,
    legal_representative_email VARCHAR(255),
    
    -- Contact
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    
    -- Adresse
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,                       -- Région administrative BF
    country VARCHAR(2) NOT NULL DEFAULT 'BF',
    postal_code VARCHAR(20),
    gps_coordinates POINT,                              -- (latitude, longitude)
    
    -- Agrément
    agreement_number VARCHAR(50),                       -- Numéro d'agrément DRCTT
    agreement_status agreement_status_enum DEFAULT 'DRAFT',
    agreement_issued_at TIMESTAMPTZ,
    agreement_expires_at TIMESTAMPTZ,
    agreement_renewal_reminder_sent BOOLEAN DEFAULT FALSE,
    
    -- Compteur de conformité
    compliance_score DECIMAL(5, 2) DEFAULT 100.00,    -- 0.00 - 100.00
    last_compliance_check_at TIMESTAMPTZ,
    compliance_countdown_days INT,                      -- Jours avant sanction
    
    -- Finance
    currency_code CHAR(3) NOT NULL DEFAULT 'XOF' REFERENCES currencies(code),
    bank_name VARCHAR(128),
    bank_account VARCHAR(50),
    bank_rib VARCHAR(50),                               -- Relevé d'Identité Bancaire
    
    -- Métadonnées
    parent_actor_id UUID REFERENCES actors(id),         -- Pour détaillants rattachés à distributeur
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Validation
    validated_at TIMESTAMPTZ,
    validated_by UUID REFERENCES users(id),
    rejection_reason TEXT
);

-- Indexes pour actor
CREATE INDEX idx_actors_nif ON actors(nif);
CREATE INDEX idx_actors_status ON actors(status);
CREATE INDEX idx_actors_type ON actors(actor_type_id);
CREATE INDEX idx_actors_agreement ON actors(agreement_status);
CREATE INDEX idx_actors_region ON actors(region);
CREATE INDEX idx_actors_compliance ON actors(compliance_score DESC);
CREATE INDEX idx_actors_gps ON actors USING GIST(gps_coordinates) WHERE gps_coordinates IS NOT NULL;
CREATE INDEX idx_actors_metadata ON actors USING GIN(metadata);
CREATE INDEX idx_actors_parent ON actors(parent_actor_id) WHERE parent_actor_id IS NOT NULL;
CREATE INDEX idx_actors_created_at ON actors(created_at DESC);

-- Recherche textuelle
CREATE INDEX idx_actors_company_name_trgm ON actors USING GIN(company_name gin_trgm_ops);
CREATE INDEX idx_actors_trade_name_trgm ON actors USING GIN(trade_name gin_trgm_ops);

CREATE TRIGGER trg_actors_updated_at
    BEFORE UPDATE ON actors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE actor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
    document_type VARCHAR(64) NOT NULL,                -- REGISTRE_COMMERCE, NIF, ASSURANCE, etc.
    document_label VARCHAR(128) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,                -- Chemin MinIO
    storage_bucket VARCHAR(64) NOT NULL DEFAULT 'ireg-kyc-documents',
    checksum_sha256 VARCHAR(64) NOT NULL,              -- Vérification intégrité
    issued_date DATE,
    expiry_date DATE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ad_actor ON actor_documents(actor_id);
CREATE INDEX idx_ad_type ON actor_documents(document_type);
CREATE INDEX idx_ad_verified ON actor_documents(is_verified);
CREATE INDEX idx_ad_expiry ON actor_documents(expiry_date) WHERE expiry_date IS NOT NULL;

CREATE TRIGGER trg_actor_documents_updated_at
    BEFORE UPDATE ON actor_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(32) NOT NULL,                          -- Code interne
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    gps_coordinates POINT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,          -- Entrepôt principal
    capacity_units INT,                                 -- Capacité en unités
    surface_sqm DECIMAL(10, 2),
    security_level VARCHAR(32) DEFAULT 'STANDARD',      -- STANDARD, RENFORCE, HAUTE
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_warehouse_code_actor UNIQUE (actor_id, code)
);

CREATE INDEX idx_warehouses_actor ON warehouses(actor_id);
CREATE INDEX idx_warehouses_city ON warehouses(city);
CREATE INDEX idx_warehouses_gps ON warehouses USING GIST(gps_coordinates) WHERE gps_coordinates IS NOT NULL;
CREATE INDEX idx_warehouses_active ON warehouses(is_active) WHERE is_active = TRUE;

CREATE TRIGGER trg_warehouses_updated_at
    BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 7. TABLES : VÉHICULES ET CATÉGORIES (MODULE B)
-- ---------------------------------------------------------------------------
CREATE TABLE vehicle_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code vehicle_category_enum NOT NULL UNIQUE,
    label VARCHAR(128) NOT NULL,
    description TEXT,
    cylinder_min_cc INT,                                -- Cylindrée minimum
    cylinder_max_cc INT,                                -- Cylindrée maximum
    power_min_kw DECIMAL(6, 2),
    power_max_kw DECIMAL(6, 2),
    max_speed_kmh INT,
    weight_max_kg INT,
    is_import_allowed BOOLEAN NOT NULL DEFAULT TRUE,    -- FALSE = catégorie interdite
    import_restriction_reason TEXT,                     -- Motif d'interdiction
    required_homologation VARCHAR(64),                  -- Type d'homologation requise
    dus_amount DECIMAL(15, 2),                          -- Montant DUS applicable
    compliance_rules JSONB DEFAULT '[]',                -- Règles spécifiques catégorie
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO vehicle_categories (code, label, description, cylinder_min_cc, cylinder_max_cc, max_speed_kmh, is_import_allowed, dus_amount) VALUES
    ('CYCLOMOTEUR_50CC', 'Cyclomoteur ≤ 50cc', 'Véhicule à 2 roues à moteur thermique de cylindrée n''excédant pas 50 cm³', 0, 50, 45, TRUE, 5000.00),
    ('MOTO_LEGERE_125CC', 'Motocyclette légère ≤ 125cc', 'Motocyclette à moteur thermique de cylindrée > 50 et ≤ 125 cm³', 51, 125, 110, TRUE, 15000.00),
    ('MOTO_LOURDE_125CC_PLUS', 'Motocyclette lourde > 125cc', 'Motocyclette à moteur thermique de cylindrée > 125 cm³', 126, 9999, NULL, TRUE, 35000.00),
    ('TRICYCLE_MOTEUR', 'Tricycle à moteur', 'Véhicule à 3 roues symétriques à moteur', NULL, NULL, NULL, TRUE, 25000.00),
    ('QUADRACYCLE', 'Quadricycle à moteur léger', 'Quadricycle à moteur non carrossé', NULL, NULL, 45, TRUE, 15000.00),
    ('ELECTRIQUE_50CC_EQ', 'Véhicule électrique équivalent ≤ 50cc', 'Véhicule électrique de puissance ≤ 4 kW', NULL, NULL, 45, TRUE, 0.00),
    ('ELECTRIQUE_125CC_EQ', 'Véhicule électrique équivalent ≤ 125cc', 'Véhicule électrique de puissance > 4 et ≤ 11 kW', NULL, NULL, NULL, TRUE, 0.00),
    ('ELECTRIQUE_PLUS', 'Véhicule électrique équivalent > 125cc', 'Véhicule électrique de puissance > 11 kW', NULL, NULL, NULL, TRUE, 0.00),
    ('INTERDITE', 'Catégorie interdite', 'Catégorie non conforme à la réglementation UEMOA/BF', NULL, NULL, NULL, FALSE, 'Véhicule non conforme à la réglementation');

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identification
    vin VARCHAR(17) NOT NULL UNIQUE,                    -- Vehicle Identification Number (ISO 3780)
    chassis_number VARCHAR(32),                         -- Numéro de chassis (si différent VIN)
    engine_number VARCHAR(32),                          -- Numéro de moteur
    manufacturer VARCHAR(100) NOT NULL,                 -- Constructeur (Yamaha, Honda, etc.)
    model VARCHAR(100) NOT NULL,                        -- Modèle
    model_year INT NOT NULL,                            -- Année modèle
    
    -- Caractéristiques techniques
    category_id UUID NOT NULL REFERENCES vehicle_categories(id),
    fuel_type fuel_type_enum NOT NULL,
    transmission transmission_enum NOT NULL DEFAULT 'MANUELLE',
    cylinder_capacity_cc INT,                           -- Cylindrée cm³
    power_kw DECIMAL(6, 2),                             -- Puissance kW
    weight_kg DECIMAL(8, 2),                            -- Poids à vide
    color VARCHAR(50),
    
    -- Traçabilité
    status vehicle_status_enum NOT NULL DEFAULT 'IMPORTED',
    current_owner_actor_id UUID REFERENCES actors(id),  -- Acteur économique propriétaire
    current_warehouse_id UUID REFERENCES warehouses(id),-- Entrepôt actuel
    current_client_id UUID,                             -- Client final (si vendu)
    
    -- Importation
    import_country_code CHAR(2) DEFAULT 'CN',           -- Pays d'origine
    import_declaration_number VARCHAR(50),              -- Numéro déclaration douane
    import_date DATE,
    customs_value DECIMAL(15, 2),                       -- Valeur en douane (XOF)
    origin_certificate_ref VARCHAR(50),                 -- Certificat d'origine
    
    -- QR / RFID
    qr_code VARCHAR(255) UNIQUE,                      -- Code QR unique généré
    rfid_tag VARCHAR(255) UNIQUE,                     -- Tag RFID (futur)
    qr_generated_at TIMESTAMPTZ,
    
    -- Conformité
    homologation_number VARCHAR(50),                    -- Numéro homologation UEMOA
    homologation_valid_until DATE,
    compliance_status compliance_status_enum DEFAULT 'PENDING_REVIEW',
    
    -- Géolocalisation
    last_gps_location POINT,
    last_gps_at TIMESTAMPTZ,
    
    -- Métadonnées
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Indexes pour vehicles
CREATE INDEX idx_vehicles_vin ON vehicles(vin);
CREATE INDEX idx_vehicles_chassis ON vehicles(chassis_number) WHERE chassis_number IS NOT NULL;
CREATE INDEX idx_vehicles_engine ON vehicles(engine_number) WHERE engine_number IS NOT NULL;
CREATE INDEX idx_vehicles_category ON vehicles(category_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_owner ON vehicles(current_owner_actor_id);
CREATE INDEX idx_vehicles_warehouse ON vehicles(current_warehouse_id);
CREATE INDEX idx_vehicles_manufacturer ON vehicles(manufacturer);
CREATE INDEX idx_vehicles_model ON vehicles(manufacturer, model);
CREATE INDEX idx_vehicles_import_date ON vehicles(import_date) WHERE import_date IS NOT NULL;
CREATE INDEX idx_vehicles_qr ON vehicles(qr_code) WHERE qr_code IS NOT NULL;
CREATE INDEX idx_vehicles_compliance ON vehicles(compliance_status);
CREATE INDEX idx_vehicles_metadata ON vehicles USING GIN(metadata);

CREATE TRIGGER trg_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE vehicle_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    vin VARCHAR(17) NOT NULL,                           -- Redondant pour lookup rapide
    reason blacklist_reason_enum NOT NULL,
    reason_details TEXT,
    source VARCHAR(64) NOT NULL,                        -- 'CNTI', 'POLICE', 'CUSTOMS', 'SYSTEM', 'MANUAL'
    source_reference VARCHAR(255),                      -- Référence du signalement
    reported_by UUID REFERENCES users(id),
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Résolution
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vb_vehicle ON vehicle_blacklist(vehicle_id);
CREATE INDEX idx_vb_vin ON vehicle_blacklist(vin);
CREATE INDEX idx_vb_active ON vehicle_blacklist(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_vb_reason ON vehicle_blacklist(reason);
CREATE INDEX idx_vb_reported_at ON vehicle_blacklist(reported_at DESC);

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    actor_id UUID NOT NULL REFERENCES actors(id),       -- Acteur responsable
    warehouse_id UUID REFERENCES warehouses(id),        -- Entrepôt concerné
    movement_type movement_type_enum NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    
    -- Références
    reference_document VARCHAR(128),                    -- Numéro BL, facture, bon de transfert
    reference_sale_id UUID,                             -- Si vente
    reference_transfer_from UUID REFERENCES warehouses(id),
    reference_transfer_to UUID REFERENCES warehouses(id),
    
    -- Détails
    unit_cost DECIMAL(15, 2),                           -- Coût unitaire au moment du mouvement
    currency_code CHAR(3) NOT NULL DEFAULT 'XOF' REFERENCES currencies(code),
    notes TEXT,
    
    -- Traçabilité
    performed_by UUID REFERENCES users(id),
    movement_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (movement_date);

-- Partitions mensuelles initiales
CREATE TABLE stock_movements_2026_01 PARTITION OF stock_movements
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE stock_movements_2026_02 PARTITION OF stock_movements
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE stock_movements_2026_03 PARTITION OF stock_movements
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE stock_movements_2026_04 PARTITION OF stock_movements
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE stock_movements_2026_05 PARTITION OF stock_movements
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE stock_movements_2026_06 PARTITION OF stock_movements
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- Default partition pour éviter les erreurs
CREATE TABLE stock_movements_default PARTITION OF stock_movements DEFAULT;

-- Indexes par partition
CREATE INDEX idx_sm_2026_01_vehicle ON stock_movements_2026_01(vehicle_id);
CREATE INDEX idx_sm_2026_01_actor ON stock_movements_2026_01(actor_id);
CREATE INDEX idx_sm_2026_01_type ON stock_movements_2026_01(movement_type);
CREATE INDEX idx_sm_2026_01_warehouse ON stock_movements_2026_01(warehouse_id);
CREATE INDEX idx_sm_2026_01_date ON stock_movements_2026_01(movement_date DESC);
CREATE INDEX idx_sm_2026_01_brin ON stock_movements_2026_01 USING BRIN(movement_date);

-- (Indexes similaires pour les autres partitions — générés par migration automatique)

CREATE TABLE inventory_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    actor_id UUID NOT NULL REFERENCES actors(id),
    status inventory_status_enum NOT NULL DEFAULT 'PLANNED',
    
    planned_date DATE NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    total_units_expected INT NOT NULL DEFAULT 0,
    total_units_counted INT NOT NULL DEFAULT 0,
    discrepancy_units INT GENERATED ALWAYS AS (total_units_counted - total_units_expected) STORED,
    discrepancy_value DECIMAL(15, 2),
    
    performed_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ic_warehouse ON inventory_counts(warehouse_id);
CREATE INDEX idx_ic_actor ON inventory_counts(actor_id);
CREATE INDEX idx_ic_status ON inventory_counts(status);
CREATE INDEX idx_ic_date ON inventory_counts(planned_date);

CREATE TRIGGER trg_inventory_counts_updated_at
    BEFORE UPDATE ON inventory_counts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE inventory_count_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_count_id UUID NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    expected_quantity INT NOT NULL DEFAULT 1,
    counted_quantity INT NOT NULL DEFAULT 0,
    discrepancy INT GENERATED ALWAYS AS (counted_quantity - expected_quantity) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ici_inventory ON inventory_count_items(inventory_count_id);
CREATE INDEX idx_ici_vehicle ON inventory_count_items(vehicle_id);

-- ---------------------------------------------------------------------------
-- 8. TABLES : CLIENTS ET TRAÇABILITÉ (MODULE C)
-- ---------------------------------------------------------------------------
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identité
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(201) GENERATED ALWAYS AS (last_name || ' ' || first_name) STORED,
    
    -- Documents d'identité
    id_document_type id_document_type_enum NOT NULL,
    id_document_number VARCHAR(50) NOT NULL,
    id_document_issued_at DATE,
    id_document_expires_at DATE,
    id_document_issued_by VARCHAR(128),                 -- Autorité émettrice
    
    -- Contact
    phone VARCHAR(20) NOT NULL,
    phone2 VARCHAR(20),
    email VARCHAR(255),
    
    -- Adresse
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    region VARCHAR(100),
    
    -- KYC
    status client_status_enum NOT NULL DEFAULT 'PENDING_KYC',
    kyc_verified_at TIMESTAMPTZ,
    kyc_verified_by UUID REFERENCES users(id),
    kyc_risk_level VARCHAR(16) DEFAULT 'LOW',          -- LOW, MEDIUM, HIGH
    
    -- Biométrie
    biometric_enrolled BOOLEAN NOT NULL DEFAULT FALSE,
    biometric_template_count INT NOT NULL DEFAULT 0,
    
    -- Traçabilité
    registered_by_actor_id UUID NOT NULL REFERENCES actors(id),
    registered_by_user_id UUID REFERENCES users(id),
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_id_doc ON clients(id_document_number);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_actor ON clients(registered_by_actor_id);
CREATE INDEX idx_clients_name ON clients(full_name);
CREATE INDEX idx_clients_created ON clients(created_at DESC);
CREATE INDEX idx_clients_metadata ON clients USING GIN(metadata);
CREATE INDEX idx_clients_name_trgm ON clients USING GIN(full_name gin_trgm_ops);

CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE client_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    document_type VARCHAR(64) NOT NULL,                -- CNI_FRONT, CNI_BACK, SELFIE, PROOF_ADDRESS
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    storage_bucket VARCHAR(64) NOT NULL DEFAULT 'ireg-kyc-documents',
    checksum_sha256 VARCHAR(64) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cd_client ON client_documents(client_id);
CREATE INDEX idx_cd_type ON client_documents(document_type);

CREATE TABLE biometric_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    biometric_type biometric_type_enum NOT NULL,
    
    -- Données biométriques (template chiffré)
    template_data BYTEA NOT NULL,                       -- Template ISO/IEC 19794-2
    template_format VARCHAR(32) NOT NULL DEFAULT 'ISO19794-2',
    template_version VARCHAR(16),
    
    -- Métadonnées du capteur
    device_model VARCHAR(100),                          -- Modèle du lecteur d'empreintes
    device_serial VARCHAR(100),
    quality_score INT CHECK (quality_score BETWEEN 0 AND 100),
    
    -- Sécurité
    encryption_key_id VARCHAR(64) NOT NULL,             -- ID de la clé de chiffrement (KMS)
    
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    captured_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bd_client ON biometric_data(client_id);
CREATE INDEX idx_bd_type ON biometric_data(biometric_type);

CREATE TABLE vehicle_ownerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    actor_id UUID NOT NULL REFERENCES actors(id),       -- Détaillant ayant vendu
    
    -- Détails transaction
    sale_id UUID,                                       -- Référence vente
    transfer_type VARCHAR(32) NOT NULL DEFAULT 'SALE',  -- SALE, GIFT, INHERITANCE
    
    -- Dates
    ownership_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ownership_ended_at TIMESTAMPTZ,                     -- NULL = propriété en cours
    
    -- Certification
    certificate_number VARCHAR(50),                     -- Numéro certificat propriété
    certificate_issued_at TIMESTAMPTZ,
    
    -- Géolocalisation au moment de la vente
    sale_gps_location POINT,
    
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_vehicle_current_owner UNIQUE (vehicle_id, is_current) WHERE is_current = TRUE
);

CREATE INDEX idx_vo_vehicle ON vehicle_ownerships(vehicle_id);
CREATE INDEX idx_vo_client ON vehicle_ownerships(client_id);
CREATE INDEX idx_vo_current ON vehicle_ownerships(vehicle_id, is_current) WHERE is_current = TRUE;
CREATE INDEX idx_vo_actor ON vehicle_ownerships(actor_id);
CREATE INDEX idx_vo_dates ON vehicle_ownerships(ownership_started_at, ownership_ended_at);

-- ---------------------------------------------------------------------------
-- 9. TABLES : VENTES ET PRICING (MODULE D)
-- ---------------------------------------------------------------------------
CREATE TABLE purchase_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES actors(id),
    vehicle_category_id UUID REFERENCES vehicle_categories(id),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    model_year INT,
    
    -- Prix
    unit_price_foreign DECIMAL(15, 2) NOT NULL,       -- Prix en devise étrangère
    foreign_currency_code CHAR(3) NOT NULL DEFAULT 'EUR' REFERENCES currencies(code),
    exchange_rate DECIMAL(18, 8) NOT NULL,            -- Taux appliqué
    unit_price_xof DECIMAL(15, 2) NOT NULL GENERATED ALWAYS AS (
        ROUND(unit_price_foreign * exchange_rate)
    ) STORED,
    
    -- Frais d'importation
    freight_cost DECIMAL(15, 2) DEFAULT 0,            -- Transport
    insurance_cost DECIMAL(15, 2) DEFAULT 0,          -- Assurance
    customs_duties DECIMAL(15, 2) DEFAULT 0,          -- Droits de douane
    other_costs DECIMAL(15, 2) DEFAULT 0,             -- Frais annexes
    
    -- Coût total débarqué
    total_landed_cost DECIMAL(15, 2) NOT NULL,
    
    -- Fournisseur
    supplier_name VARCHAR(200),
    supplier_country CHAR(2),
    order_reference VARCHAR(50),
    
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pp_actor ON purchase_prices(actor_id);
CREATE INDEX idx_pp_category ON purchase_prices(vehicle_category_id);
CREATE INDEX idx_pp_manufacturer ON purchase_prices(manufacturer);
CREATE INDEX idx_pp_model ON purchase_prices(manufacturer, model);
CREATE INDEX idx_pp_date ON purchase_prices(effective_date DESC);
CREATE INDEX idx_pp_active ON purchase_prices(is_active) WHERE is_active = TRUE;

CREATE TRIGGER trg_purchase_prices_updated_at
    BEFORE UPDATE ON purchase_prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE pricing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES actors(id),
    vehicle_id UUID REFERENCES vehicles(id),
    vehicle_category_id UUID REFERENCES vehicle_categories(id),
    
    -- Prix
    purchase_price DECIMAL(15, 2) NOT NULL,
    selling_price DECIMAL(15, 2) NOT NULL,
    margin_amount DECIMAL(15, 2) NOT NULL,
    margin_rate DECIMAL(6, 4) NOT NULL,                -- 0.1500 = 15%
    
    -- Taxes applicables
    applied_taxes JSONB NOT NULL DEFAULT '[]',          -- Détail des taxes appliquées
    total_taxes DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- Anomalies
    is_anomaly BOOLEAN NOT NULL DEFAULT FALSE,
    anomaly_type VARCHAR(32),                           -- MARGIN_TOO_LOW, MARGIN_TOO_HIGH, PRICE_SPIKE
    anomaly_details TEXT,
    
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ph_actor ON pricing_history(actor_id);
CREATE INDEX idx_ph_vehicle ON pricing_history(vehicle_id) WHERE vehicle_id IS NOT NULL;
CREATE INDEX idx_ph_date ON pricing_history(effective_date DESC);
CREATE INDEX idx_ph_anomaly ON pricing_history(is_anomaly) WHERE is_anomaly = TRUE;
CREATE INDEX idx_ph_margin ON pricing_history(margin_rate);

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES actors(id),       -- Détaillant vendeur
    warehouse_id UUID REFERENCES warehouses(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    user_id UUID REFERENCES users(id),                  -- Utilisateur ayant effectué la vente
    
    -- Statut et paiement
    status sale_status_enum NOT NULL DEFAULT 'DRAFT',
    payment_method payment_method_enum NOT NULL,
    payment_reference VARCHAR(128),                     -- Référence transaction
    
    -- Montants
    subtotal_amount DECIMAL(15, 2) NOT NULL DEFAULT 0, -- HT
    discount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,    -- TTC
    currency_code CHAR(3) NOT NULL DEFAULT 'XOF' REFERENCES currencies(code),
    
    -- Taxes détaillées (OHADA)
    tax_breakdown JSONB NOT NULL DEFAULT '{}',          -- { "UEMOA-TVA": 18000, "UEMOA-DUS": 15000 }
    
    -- Dates
    sale_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_due_date DATE,
    paid_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    -- Facture
    invoice_id UUID,                                    -- Référence facture générée
    invoice_number VARCHAR(50),                         -- Numéro facture OHADA
    
    -- Géolocalisation (pour traçabilité)
    sale_location POINT,
    
    -- Métadonnées
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT chk_sale_dates CHECK (sale_date <= NOW())
);

CREATE INDEX idx_sales_actor ON sales(actor_id);
CREATE INDEX idx_sales_client ON sales(client_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_date ON sales(sale_date DESC);
CREATE INDEX idx_sales_invoice ON sales(invoice_number) WHERE invoice_number IS NOT NULL;
CREATE INDEX idx_sales_payment ON sales(payment_method);
CREATE INDEX idx_sales_metadata ON sales USING GIN(metadata);

CREATE TRIGGER trg_sales_updated_at
    BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    
    -- Prix unitaire
    unit_price DECIMAL(15, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    line_total DECIMAL(15, 2) NOT NULL,
    
    -- Taxes ligne
    tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_breakdown JSONB DEFAULT '{}',
    
    -- Marge
    unit_cost DECIMAL(15, 2),                          -- Coût d'achat (pour calcul marge)
    margin_amount DECIMAL(15, 2),
    margin_rate DECIMAL(6, 4),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_si_sale ON sale_items(sale_id);
CREATE INDEX idx_si_vehicle ON sale_items(vehicle_id);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id),
    actor_id UUID NOT NULL REFERENCES actors(id),
    
    -- Numérotation OHADA
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_series VARCHAR(16) NOT NULL,                -- Série comptable (A, B, C...)
    
    -- Statut
    status invoice_status_enum NOT NULL DEFAULT 'DRAFT',
    
    -- Contenu
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    
    -- Montants
    subtotal_amount DECIMAL(15, 2) NOT NULL,
    discount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) NOT NULL DEFAULT 0,
    amount_due DECIMAL(15, 2) NOT NULL,
    currency_code CHAR(3) NOT NULL DEFAULT 'XOF' REFERENCES currencies(code),
    
    -- Détail taxes OHADA
    tax_details JSONB NOT NULL DEFAULT '[]',
    
    -- Documents
    pdf_url VARCHAR(500),                               -- Chemin MinIO vers PDF signé
    xml_url VARCHAR(500),                               -- Chemin MinIO vers XML OHADA
    digital_signature VARCHAR(512),                     -- Signature électronique
    
    -- QR Code facture
    qr_code VARCHAR(255),                               -- QR pour vérification
    
    -- Paiement
    paid_at TIMESTAMPTZ,
    paid_amount DECIMAL(15, 2),
    
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_sale ON invoices(sale_id) WHERE sale_id IS NOT NULL;
CREATE INDEX idx_invoices_actor ON invoices(actor_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(issue_date DESC);
CREATE INDEX idx_invoices_due ON invoices(due_date) WHERE status IN ('ISSUED', 'SENT');

CREATE TRIGGER trg_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 10. TABLES : RAPPORTAGE TRIMESTRIEL (MODULE E)
-- ---------------------------------------------------------------------------
CREATE TABLE quarterly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES actors(id),
    
    -- Période
    year INT NOT NULL,
    quarter report_period_enum NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Statut
    status report_status_enum NOT NULL DEFAULT 'DRAFT',
    
    -- Agrégations (pré-calculées)
    total_sales_count INT NOT NULL DEFAULT 0,
    total_sales_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_vehicles_sold INT NOT NULL DEFAULT 0,
    total_tax_collected DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    total_purchases_count INT NOT NULL DEFAULT 0,
    total_purchases_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_vehicles_imported INT NOT NULL DEFAULT 0,
    total_customs_duties DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    stock_opening_units INT NOT NULL DEFAULT 0,
    stock_closing_units INT NOT NULL DEFAULT 0,
    
    -- Conformité
    compliance_score DECIMAL(5, 2),
    compliance_violations_count INT NOT NULL DEFAULT 0,
    
    -- Documents générés
    xml_report_path VARCHAR(500),
    pdf_report_path VARCHAR(500),
    digital_signature VARCHAR(512),
    
    -- Soumission
    submitted_at TIMESTAMPTZ,
    submitted_by UUID REFERENCES users(id),
    
    -- Revue ministère
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    
    -- Amendement
    amendment_of UUID REFERENCES quarterly_reports(id), -- Rapport original amendé
    amendment_reason TEXT,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_actor ON quarterly_reports(actor_id);
CREATE INDEX idx_qr_period ON quarterly_reports(year, quarter);
CREATE INDEX idx_qr_status ON quarterly_reports(status);
CREATE INDEX idx_qr_submitted ON quarterly_reports(submitted_at DESC);
CREATE INDEX idx_qr_compliance ON quarterly_reports(compliance_score);

CREATE TRIGGER trg_quarterly_reports_updated_at
    BEFORE UPDATE ON quarterly_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE report_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES quarterly_reports(id),
    
    submission_number INT NOT NULL DEFAULT 1,           -- 1 = première soumission, 2+ = amendement
    
    -- Fichiers
    xml_file_path VARCHAR(500) NOT NULL,
    pdf_file_path VARCHAR(500) NOT NULL,
    xml_checksum VARCHAR(64) NOT NULL,
    pdf_checksum VARCHAR(64) NOT NULL,
    
    -- Réception
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_by UUID REFERENCES users(id),
    
    -- Accusé de réception
    acknowledgment_number VARCHAR(50),
    acknowledgment_generated_at TIMESTAMPTZ,
    
    -- Traitement
    processing_status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, VALIDATING, VALID, INVALID
    validation_errors JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rs_report ON report_submissions(report_id);
CREATE INDEX idx_rs_status ON report_submissions(processing_status);

-- ---------------------------------------------------------------------------
-- 11. TABLES : CONFORMITÉ (MODULE F)
-- ---------------------------------------------------------------------------
CREATE TABLE compliance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(32) NOT NULL UNIQUE,                   -- R001, R002, etc.
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    rule_type compliance_rule_type_enum NOT NULL,
    severity compliance_severity_enum NOT NULL DEFAULT 'WARNING',
    
    -- Règle exécutable
    rule_expression TEXT NOT NULL,                      -- Expression DSL ou SQL condition
    rule_version INT NOT NULL DEFAULT 1,
    
    -- Cible
    applicable_actor_types actor_type_enum[],
    applicable_categories vehicle_category_enum[],
    
    -- Statut
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to DATE,
    
    -- Référence légale
    legal_reference TEXT,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cr_type ON compliance_rules(rule_type);
CREATE INDEX idx_cr_severity ON compliance_rules(severity);
CREATE INDEX idx_cr_active ON compliance_rules(is_active) WHERE is_active = TRUE;

CREATE TRIGGER trg_compliance_rules_updated_at
    BEFORE UPDATE ON compliance_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Règles de conformité initiales
INSERT INTO compliance_rules (code, name, description, rule_type, severity, rule_expression, legal_reference) VALUES
    ('R001', 'Agrément valide', 'L''acteur doit posséder un agrément DRCTT valide non expiré', 'DOCUMENT', 'BLOCKER', 'actor.agreement_status = APPROVED AND actor.agreement_expires_at > NOW()', 'Arrêté 05/06/2026 Art. 3'),
    ('R002', 'NIF valide', 'L''acteur doit avoir un NIF en règle', 'DOCUMENT', 'BLOCKER', 'actor.nif IS NOT NULL AND actor.nif_verified = TRUE', 'Code des impôts BF'),
    ('R003', 'Assurance RC valide', 'L''acteur doit avoir une assurance responsabilité civile valide', 'DOCUMENT', 'CRITICAL', 'EXISTS(SELECT 1 FROM actor_documents WHERE type = ''ASSURANCE'' AND expiry_date > NOW())', 'Arrêté 05/06/2026 Art. 5'),
    ('R004', 'Catégorie autorisée', 'Le véhicule doit appartenir à une catégorie autorisée à l''importation', 'VEHICLE_SPEC', 'BLOCKER', 'vehicle.category.is_import_allowed = TRUE', 'Arrêté 05/06/2026 Art. 8'),
    ('R005', 'Homologation UEMOA', 'Le véhicule doit avoir une homologation UEMOA valide', 'VEHICLE_SPEC', 'CRITICAL', 'vehicle.homologation_number IS NOT NULL AND vehicle.homologation_valid_until > NOW()', 'Règlement UEMOA'),
    ('R006', 'Marge minimale', 'La marge de vente ne peut être inférieure à 5%', 'PRICING', 'WARNING', 'sale.margin_rate >= 0.05', 'Guide de conformité DRCTT'),
    ('R007', 'KYC client complet', 'Le client doit avoir un KYC vérifié', 'KYC', 'CRITICAL', 'client.status = KYC_VERIFIED', 'Arrêté 05/06/2026 Art. 12'),
    ('R008', 'Rapport trimestriel soumis', 'Le rapport trimestriel doit être soumis dans les délais', 'TIMING', 'CRITICAL', 'report.status IN (SUBMITTED, APPROVED) AND report.submitted_at <= deadline', 'Arrêté 05/06/2026 Art. 15'),
    ('R009', 'Stock inventorié', 'L''inventaire doit être réalisé au moins une fois par trimestre', 'STOCK', 'WARNING', 'LAST(inventory.date) >= NOW() - INTERVAL ''3 months''', 'Arrêté 05/06/2026 Art. 10'),
    ('R010', 'Pas de blacklist', 'Le véhicule ne doit pas figurer sur la liste noire', 'VEHICLE_SPEC', 'BLOCKER', 'NOT EXISTS(SELECT 1 FROM vehicle_blacklist WHERE vehicle_id = vehicle.id AND is_active = TRUE)', 'Arrêté 05/06/2026 Art. 20');

CREATE TABLE compliance_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES actors(id),
    
    name VARCHAR(200) NOT NULL,
    checklist_type VARCHAR(32) NOT NULL,                -- SELF_ASSESSMENT, INSPECTION, AUDIT
    
    -- Période
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Statut
    status VARCHAR(32) NOT NULL DEFAULT 'IN_PROGRESS',  -- IN_PROGRESS, COMPLETED, REVIEWED
    
    -- Résultat
    total_rules INT NOT NULL DEFAULT 0,
    passed_rules INT NOT NULL DEFAULT 0,
    failed_rules INT NOT NULL DEFAULT 0,
    warning_rules INT NOT NULL DEFAULT 0,
    
    -- Contrôle
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cl_actor ON compliance_checklists(actor_id);
CREATE INDEX idx_cl_type ON compliance_checklists(checklist_type);
CREATE INDEX idx_cl_status ON compliance_checklists(status);
CREATE INDEX idx_cl_period ON compliance_checklists(period_start, period_end);

CREATE TRIGGER trg_compliance_checklists_updated_at
    BEFORE UPDATE ON compliance_checklists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE compliance_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID NOT NULL REFERENCES compliance_checklists(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES compliance_rules(id),
    
    -- Évaluation
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',      -- PENDING, PASS, FAIL, NA
    observed_value TEXT,                                -- Valeur observée
    expected_value TEXT,                                -- Valeur attendue
    notes TEXT,
    
    -- Preuve
    evidence_document_id UUID,
    
    checked_at TIMESTAMPTZ,
    checked_by UUID REFERENCES users(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cli_checklist ON compliance_checklist_items(checklist_id);
CREATE INDEX idx_cli_rule ON compliance_checklist_items(rule_id);
CREATE INDEX idx_cli_status ON compliance_checklist_items(status);

CREATE TABLE compliance_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES actors(id),
    
    -- Score global (0-100)
    overall_score DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    
    -- Scores par dimension
    document_score DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    vehicle_score DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    pricing_score DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    kyc_score DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    reporting_score DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    stock_score DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    
    -- Détails
    rules_checked INT NOT NULL DEFAULT 0,
    rules_passed INT NOT NULL DEFAULT 0,
    rules_failed INT NOT NULL DEFAULT 0,
    critical_failures INT NOT NULL DEFAULT 0,
    
    -- Calcul
    score_breakdown JSONB DEFAULT '{}',                 -- Détail par règle
    calculation_method VARCHAR(32) NOT NULL DEFAULT 'WEIGHTED_AVERAGE',
    
    -- Période
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    calculated_by UUID REFERENCES users(id),
    valid_until TIMESTAMPTZ,                            -- Date d'expiration du score
    
    -- Alerte
    alert_level VARCHAR(16),                            -- NONE, WARNING, CRITICAL
    countdown_days INT,                                 -- Jours avant sanction
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cs_actor ON compliance_scores(actor_id);
CREATE INDEX idx_cs_score ON compliance_scores(overall_score DESC);
CREATE INDEX idx_cs_calculated ON compliance_scores(calculated_at DESC);
CREATE INDEX idx_cs_alert ON compliance_scores(alert_level) WHERE alert_level IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 12. TABLES : SÉCURITÉ / LUTTE CONTRE L'INSÉCURITÉ (MODULE G)
-- ---------------------------------------------------------------------------
CREATE TABLE fraud_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source
    alert_type VARCHAR(32) NOT NULL,                    -- VEHICLE, TRANSACTION, ACTOR, PATTERN
    severity fraud_alert_severity_enum NOT NULL,
    status fraud_alert_status_enum NOT NULL DEFAULT 'OPEN',
    
    -- Entités concernées
    vehicle_id UUID REFERENCES vehicles(id),
    actor_id UUID REFERENCES actors(id),
    client_id UUID REFERENCES clients(id),
    sale_id UUID REFERENCES sales(id),
    
    -- Détails
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    detected_pattern VARCHAR(64),                       -- Code du pattern détecté
    
    -- Score de risque
    risk_score DECIMAL(5, 2),                           -- 0.00 - 100.00
    risk_factors JSONB DEFAULT '[]',                    -- Facteurs de risque identifiés
    
    -- Preuves
    evidence JSONB DEFAULT '{}',                        -- Données supportant l'alerte
    
    -- Traitement
    assigned_to UUID REFERENCES users(id),
    investigated_by UUID REFERENCES users(id),
    investigation_notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolution_action VARCHAR(64),                      -- BLOCKED, ESCALATED, FALSE_POSITIVE
    
    -- Notification CNTI
    cnti_notified_at TIMESTAMPTZ,
    cnti_reference VARCHAR(128),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fa_vehicle ON fraud_alerts(vehicle_id) WHERE vehicle_id IS NOT NULL;
CREATE INDEX idx_fa_actor ON fraud_alerts(actor_id) WHERE actor_id IS NOT NULL;
CREATE INDEX idx_fa_severity ON fraud_alerts(severity);
CREATE INDEX idx_fa_status ON fraud_alerts(status);
CREATE INDEX idx_fa_risk ON fraud_alerts(risk_score DESC);
CREATE INDEX idx_fa_created ON fraud_alerts(created_at DESC);
CREATE INDEX idx_fa_assigned ON fraud_alerts(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_fa_type ON fraud_alerts(alert_type);

CREATE TRIGGER trg_fraud_alerts_updated_at
    BEFORE UPDATE ON fraud_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE security_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Entité blacklistée
    blacklist_type VARCHAR(32) NOT NULL,                -- VEHICLE, CLIENT, ACTOR, USER, VIN_PATTERN
    entity_id UUID,                                      -- ID de l'entité (si connue)
    entity_identifier VARCHAR(255) NOT NULL,            -- VIN, téléphone, NIF, etc.
    
    -- Motif
    reason TEXT NOT NULL,
    reason_category VARCHAR(32) NOT NULL,               -- FRAUD, THEFT, COUNTERFEIT, SANCTION
    source VARCHAR(64) NOT NULL,                        -- CNTI, POLICE, CUSTOMS, SYSTEM, MANUAL
    source_reference VARCHAR(255),
    
    -- Preuve
    evidence JSONB DEFAULT '{}',
    
    -- Durée
    blacklisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    blacklisted_by UUID REFERENCES users(id),
    expires_at TIMESTAMPTZ,                             -- NULL = permanent
    
    -- Résolution
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    removed_at TIMESTAMPTZ,
    removed_by UUID REFERENCES users(id),
    removal_reason TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sb_type ON security_blacklist(blacklist_type);
CREATE INDEX idx_sb_identifier ON security_blacklist(entity_identifier);
CREATE INDEX idx_sb_active ON security_blacklist(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_sb_created ON security_blacklist(blacklisted_at DESC);

CREATE TABLE transaction_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id),
    
    flag_type transaction_flag_type_enum NOT NULL,
    severity fraud_alert_severity_enum NOT NULL DEFAULT 'MEDIUM',
    
    -- Détails
    description TEXT NOT NULL,
    detected_values JSONB DEFAULT '{}',                 -- Valeurs ayant déclenché le flag
    
    -- Score impact
    risk_score DECIMAL(5, 2),
    
    -- Statut
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tf_sale ON transaction_flags(sale_id);
CREATE INDEX idx_tf_type ON transaction_flags(flag_type);
CREATE INDEX idx_tf_unresolved ON transaction_flags(is_resolved) WHERE is_resolved = FALSE;

-- ---------------------------------------------------------------------------
-- 13. TABLES : PORTAIL ADMIN (MODULE H)
-- ---------------------------------------------------------------------------
CREATE TABLE geofence_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name VARCHAR(200) NOT NULL,
    description TEXT,
    zone_type geofence_type_enum NOT NULL,
    risk_level geofence_risk_level_enum NOT NULL DEFAULT 'MEDIUM',
    
    -- Géométrie (PostGIS si disponible, sinon POINT + radius)
    center_latitude DECIMAL(10, 8) NOT NULL,
    center_longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INT,                                  -- Si zone circulaire
    -- geom GEOGRAPHY(POLYGON),                         -- PostGIS : polygone exact
    
    -- Zone administrative
    region VARCHAR(100),
    province VARCHAR(100),
    commune VARCHAR(100),
    
    -- Validité
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gz_type ON geofence_zones(zone_type);
CREATE INDEX idx_gz_risk ON geofence_zones(risk_level);
CREATE INDEX idx_gz_active ON geofence_zones(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_gz_location ON geofence_zones(center_latitude, center_longitude);

CREATE TRIGGER trg_geofence_zones_updated_at
    BEFORE UPDATE ON geofence_zones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    code VARCHAR(64) NOT NULL UNIQUE,                   -- REPORT_DUE_REMINDER, COMPLIANCE_ALERT
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Canaux
    channels notification_channel_enum[] NOT NULL DEFAULT '{}',
    
    -- Contenu multilingue
    subject_fr VARCHAR(255),
    body_fr TEXT,
    subject_mos VARCHAR(255),
    body_mos TEXT,
    subject_dyula VARCHAR(255),
    body_dyula TEXT,
    subject_fula VARCHAR(255),
    body_fula TEXT,
    
    -- Variables dynamiques
    variables JSONB DEFAULT '[]',                       -- ["actor_name", "deadline_date"]
    
    -- Règles de déclenchement
    trigger_event VARCHAR(64),                          -- Événement déclencheur
    trigger_delay_minutes INT DEFAULT 0,                -- Délai après l'événement
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES actors(id),
    
    name VARCHAR(128) NOT NULL,
    url VARCHAR(500) NOT NULL,
    secret VARCHAR(255),                                -- Pour HMAC signature
    
    -- Événements souscrits
    events VARCHAR(64)[] NOT NULL DEFAULT '{}',
    
    -- Configuration
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    retry_max INT NOT NULL DEFAULT 3,
    retry_backoff_ms INT NOT NULL DEFAULT 1000,
    timeout_ms INT NOT NULL DEFAULT 30000,
    
    -- Métriques
    last_delivered_at TIMESTAMPTZ,
    last_delivery_status VARCHAR(32),
    delivery_count INT NOT NULL DEFAULT 0,
    failure_count INT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_we_actor ON webhook_endpoints(actor_id);
CREATE INDEX idx_we_active ON webhook_endpoints(is_active) WHERE is_active = TRUE;

CREATE TRIGGER trg_webhook_endpoints_updated_at
    BEFORE UPDATE ON webhook_endpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 14. TABLE : AUDIT TRAIL (EVENT SOURCING)
-- ---------------------------------------------------------------------------
CREATE TABLE domain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    aggregate_type VARCHAR(64) NOT NULL,                -- 'vehicle', 'actor', 'sale', 'client'
    aggregate_id VARCHAR(128) NOT NULL,                 -- VIN, actor_id, sale_id
    event_type VARCHAR(128) NOT NULL,                   -- 'VehicleCreated', 'SaleRecorded'
    
    payload JSONB NOT NULL,
    
    -- Chaînage cryptographique (immuabilité)
    previous_hash VARCHAR(64),
    event_hash VARCHAR(64) NOT NULL,
    
    -- Contexte
    actor_user_id UUID REFERENCES users(id),
    actor_ip_address INET,
    actor_user_agent TEXT,
    
    -- Séquence globale pour vérification rapide
    sequence_number BIGSERIAL,
    
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Partitionné par mois
    CONSTRAINT chk_event_hash CHECK (event_hash IS NOT NULL)
) PARTITION BY RANGE (timestamp);

-- Partitions initiales
CREATE TABLE domain_events_2026_01 PARTITION OF domain_events
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE domain_events_2026_02 PARTITION OF domain_events
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE domain_events_2026_03 PARTITION OF domain_events
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE domain_events_2026_04 PARTITION OF domain_events
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE domain_events_2026_05 PARTITION OF domain_events
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE domain_events_2026_06 PARTITION OF domain_events
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE domain_events_default PARTITION OF domain_events DEFAULT;

-- Indexes par partition
CREATE INDEX idx_de_2026_01_aggregate ON domain_events_2026_01(aggregate_type, aggregate_id, timestamp);
CREATE INDEX idx_de_2026_01_type ON domain_events_2026_01(event_type);
CREATE INDEX idx_de_2026_01_user ON domain_events_2026_01(actor_user_id) WHERE actor_user_id IS NOT NULL;
CREATE INDEX idx_de_2026_01_brin ON domain_events_2026_01 USING BRIN(timestamp);
CREATE INDEX idx_de_2026_01_sequence ON domain_events_2026_01(sequence_number);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    action VARCHAR(64) NOT NULL,                        -- CREATE, UPDATE, DELETE, LOGIN, EXPORT
    resource_type VARCHAR(64) NOT NULL,                 -- 'actor', 'vehicle', 'sale', 'user'
    resource_id VARCHAR(128),
    
    -- Avant / Après
    old_values JSONB,
    new_values JSONB,
    changes_summary JSONB,                              -- Diff calculé
    
    -- Contexte
    user_id UUID REFERENCES users(id),
    user_role user_role_enum,
    actor_id UUID REFERENCES actors(id),
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(64),                             -- Correlation ID
    
    -- Résultat
    action_result VARCHAR(16) NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, FAILURE, DENIED
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Partitions initiales
CREATE TABLE audit_logs_2026_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE audit_logs_2026_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE audit_logs_2026_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE audit_logs_2026_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE audit_logs_2026_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE audit_logs_2026_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE audit_logs_default PARTITION OF audit_logs DEFAULT;

CREATE INDEX idx_al_2026_01_resource ON audit_logs_2026_01(resource_type, resource_id);
CREATE INDEX idx_al_2026_01_user ON audit_logs_2026_01(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_al_2026_01_action ON audit_logs_2026_01(action);
CREATE INDEX idx_al_2026_01_brin ON audit_logs_2026_01 USING BRIN(created_at);
CREATE INDEX idx_al_2026_01_request ON audit_logs_2026_01(request_id) WHERE request_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 15. TABLE : SYNC OFFLINE (PWA)
-- ---------------------------------------------------------------------------
CREATE TABLE sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    device_id VARCHAR(64) NOT NULL,                     -- Identifiant device
    user_id UUID NOT NULL REFERENCES users(id),
    
    operation VARCHAR(16) NOT NULL,                     -- CREATE, UPDATE, DELETE
    entity_type VARCHAR(32) NOT NULL,                   -- client, sale, vehicle, stock
    local_id VARCHAR(128) NOT NULL,                     -- ID local côté client
    server_id UUID,                                     -- ID serveur (si déjà sync)
    
    payload JSONB NOT NULL,
    checksum VARCHAR(64) NOT NULL,                      -- SHA256 du payload
    
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',      -- PENDING, PROCESSING, APPLIED, CONFLICT, FAILED
    retry_count INT NOT NULL DEFAULT 0,
    last_error TEXT,
    
    client_timestamp TIMESTAMPTZ NOT NULL,              -- Horodatage client
    processed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sq_user ON sync_queue(user_id);
CREATE INDEX idx_sq_device ON sync_queue(device_id);
CREATE INDEX idx_sq_status ON sync_queue(status);
CREATE INDEX idx_sq_pending ON sync_queue(user_id, status) WHERE status IN ('PENDING', 'CONFLICT');

CREATE TABLE sync_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_queue_id UUID NOT NULL REFERENCES sync_queue(id),
    
    conflict_type VARCHAR(32) NOT NULL,                 -- CONCURRENT_UPDATE, VALIDATION_ERROR
    client_values JSONB NOT NULL,
    server_values JSONB NOT NULL,
    
    resolution VARCHAR(32),                             -- CLIENT_WINS, SERVER_WINS, MERGED, PENDING
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 16. VUES MATÉRIALISÉES (CQRS — Read Models)
-- ---------------------------------------------------------------------------

-- Vue trimestrielle pour rapports
CREATE MATERIALIZED VIEW mv_quarterly_report_summary AS
SELECT 
    a.id as actor_id,
    a.company_name as actor_name,
    at.code as actor_type,
    date_trunc('quarter', s.sale_date) as quarter,
    COUNT(DISTINCT s.id) as total_sales_count,
    COALESCE(SUM(s.total_amount), 0) as total_sales_amount,
    COUNT(DISTINCT si.vehicle_id) as total_vehicles_sold,
    COALESCE(SUM(s.tax_amount), 0) as total_tax_collected,
    COALESCE((
        SELECT cs.overall_score FROM compliance_scores cs 
        WHERE cs.actor_id = a.id 
        ORDER BY cs.calculated_at DESC LIMIT 1
    ), 100) as compliance_score
FROM actors a
JOIN actor_types at ON at.id = a.actor_type_id
LEFT JOIN sales s ON s.actor_id = a.id AND s.status NOT IN ('DRAFT', 'CANCELLED')
LEFT JOIN sale_items si ON si.sale_id = s.id
GROUP BY a.id, a.company_name, at.code, date_trunc('quarter', s.sale_date);

CREATE UNIQUE INDEX idx_mv_qrs_actor_quarter ON mv_quarterly_report_summary(actor_id, quarter);
CREATE INDEX idx_mv_qrs_type ON mv_quarterly_report_summary(actor_type);

-- Vue de conformité par acteur
CREATE MATERIALIZED VIEW mv_actor_compliance_summary AS
SELECT 
    a.id as actor_id,
    a.company_name,
    a.status as actor_status,
    a.agreement_status,
    a.compliance_score,
    a.compliance_countdown_days,
    COUNT(DISTINCT v.id) as total_vehicles,
    COUNT(DISTINCT CASE WHEN v.status = 'SOLD' THEN v.id END) as vehicles_sold,
    COUNT(DISTINCT CASE WHEN v.status = 'IN_STOCK' THEN v.id END) as vehicles_in_stock,
    COUNT(DISTINCT CASE WHEN vb.id IS NOT NULL AND vb.is_active THEN v.id END) as blacklisted_vehicles,
    COUNT(DISTINCT s.id) as total_sales,
    COALESCE(SUM(s.total_amount), 0) as total_revenue
FROM actors a
LEFT JOIN vehicles v ON v.current_owner_actor_id = a.id
LEFT JOIN vehicle_blacklist vb ON vb.vehicle_id = v.id
LEFT JOIN sales s ON s.actor_id = a.id AND s.status NOT IN ('DRAFT', 'CANCELLED')
GROUP BY a.id, a.company_name, a.status, a.agreement_status, a.compliance_score, a.compliance_countdown_days;

CREATE UNIQUE INDEX idx_mv_acs_actor ON mv_actor_compliance_summary(actor_id);

-- ---------------------------------------------------------------------------
-- 17. FONCTIONS ET PROCÉDURES
-- ---------------------------------------------------------------------------

-- Fonction de calcul du score de conformité
CREATE OR REPLACE FUNCTION calculate_compliance_score(p_actor_id UUID)
RETURNS DECIMAL(5, 2) AS $$
DECLARE
    v_total_rules INT;
    v_passed_rules INT;
    v_score DECIMAL(5, 2);
BEGIN
    SELECT COUNT(*) INTO v_total_rules
    FROM compliance_rules
    WHERE is_active = TRUE;
    
    -- Simplification : le score réel serait calculé par le moteur de règles
    SELECT COUNT(*) INTO v_passed_rules
    FROM compliance_checklist_items cci
    JOIN compliance_checklists cc ON cc.id = cci.checklist_id
    WHERE cc.actor_id = p_actor_id AND cci.status = 'PASS';
    
    IF v_total_rules = 0 THEN
        RETURN 100.00;
    END IF;
    
    v_score := (v_passed_rules::DECIMAL / v_total_rules) * 100;
    RETURN ROUND(v_score, 2);
END;
$$ LANGUAGE plpgsql;

-- Fonction de vérification chaînage domain_events
CREATE OR REPLACE FUNCTION verify_event_chain()
RETURNS TABLE(broken_sequence BIGINT, expected_hash VARCHAR, actual_hash VARCHAR) AS $$
DECLARE
    v_prev_hash VARCHAR(64);
    v_calc_hash VARCHAR(64);
    rec RECORD;
BEGIN
    v_prev_hash := '0';
    
    FOR rec IN 
        SELECT id, payload, previous_hash, event_hash, sequence_number
        FROM domain_events
        ORDER BY sequence_number
    LOOP
        v_calc_hash := encode(
            digest(
                rec.payload::text || COALESCE(v_prev_hash, '0') || rec.sequence_number::text,
                'sha256'
            ),
            'hex'
        );
        
        IF v_calc_hash != rec.event_hash THEN
            broken_sequence := rec.sequence_number;
            expected_hash := v_calc_hash;
            actual_hash := rec.event_hash;
            RETURN NEXT;
        END IF;
        
        v_prev_hash := rec.event_hash;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 18. COMMENTAIRES ET DOCUMENTATION
-- ---------------------------------------------------------------------------

COMMENT ON TABLE actors IS 'Acteurs économiques : importateurs, distributeurs, assembleurs, détaillants de 2-roues';
COMMENT ON TABLE vehicles IS 'Véhicules enregistrés dans le système (motos, scooters, tricycles)';
COMMENT ON TABLE vehicle_blacklist IS 'Liste noire des véhicules signalés (vol, fraude, contrefaçon)';
COMMENT ON TABLE sales IS 'Ventes de véhicules aux clients finaux';
COMMENT ON TABLE clients IS 'Clients finaux ayant acheté un véhicule';
COMMENT ON TABLE compliance_rules IS 'Règles de conformité réglementaire évaluables par le moteur';
COMMENT ON TABLE compliance_scores IS 'Scores de conformité calculés par acteur';
COMMENT ON TABLE quarterly_reports IS 'Rapports trimestriels soumis au ministère';
COMMENT ON TABLE fraud_alerts IS 'Alertes de fraude et anomalies détectées';
COMMENT ON TABLE domain_events IS 'Event store pour audit trail immuable (chaînage SHA-256)';
COMMENT ON TABLE sync_queue IS 'File de synchronisation pour les clients PWA en mode offline';

-- =============================================================================
-- FIN DU SCHÉMA
-- =============================================================================
