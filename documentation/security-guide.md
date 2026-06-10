# iReg Moto BF — Guide de Sécurité

> **Version:** 1.0.0 | **Classification:** CONFIDENTIEL
> **Public cible:** RSSI, equipe securite, developpeurs, administrateurs systeme

---

## Table des matieres

1. [Architecture de securite (7 couches)](#1-architecture-de-securite-7-couches)
2. [Authentification et autorisation](#2-authentification-et-autorisation)
3. [Chiffrement des donnees](#3-chiffrement-des-donnees)
4. [Audit trail](#4-audit-trail)
5. [Detection de fraude](#5-detection-de-fraude)
6. [Bonnes pratiques](#6-bonnes-pratiques)

---

## 1. Architecture de securite (7 couches)

### 1.1 Vue d'ensemble

L'architecture de securite de iReg Moto BF s'appuie sur un modele de defense en profondeur (Defense in Depth) avec 7 couches distinctes. Chaque couche constitue une barriere independante — si une couche est compromise, les autres continuent de proteger le systeme.

```
+---------------------------------------------------------------+
|                    ARCHITECTURE 7 COUCHES                     |
+---------------------------------------------------------------+
|                                                               |
|  COUCHE 1 — PERIMETRE (Perimeter)                            |
|  +----------------+  +----------------+  +----------------+  |
|  | WAF (Traefik)  |  | Rate Limiting  |  | IP Whitelist   |  |
|  | Regles OWASP   |  | (Redis bucket) |  | (Admin)        |  |
|  | Core Rule Set  |  | Token bucket   |  | Restreint      |  |
|  +----------------+  +----------------+  +----------------+  |
|                                                               |
|  COUCHE 2 — TRANSPORT                                        |
|  +----------------+  +----------------+                      |
|  | TLS 1.3        |  | Certificate    |                      |
|  | (obligatoire)  |  | Pinning (app)  |                      |
|  | HSTS enabled   |  |                |                      |
|  +----------------+  +----------------+                      |
|                                                               |
|  COUCHE 3 — AUTHENTIFICATION                                 |
|  +----------------+  +----------------+  +----------------+  |
|  | JWT (RS256)    |  | OAuth2         |  | MFA (TOTP/SMS) |  |
|  | Access 15 min  |  | (Google, MS)   |  | Admin: oblig.  |  |
|  | Refresh 7j     |  |                |  | Backup codes   |  |
|  +----------------+  +----------------+  +----------------+  |
|                                                               |
|  COUCHE 4 — AUTORISATION (RBAC + ABAC)                       |
|  +----------------+  +----------------+  +----------------+  |
|  | Roles (DB)     |  | Permissions    |  | Ownership      |  |
|  | IMPORTATEUR    |  | granulaires    |  | ressource      |  |
|  | DISTRIBUTEUR   |  | actor:create   |  | actor:{id}     |  |
|  | ADMIN          |  | sale:create    |  | sale:{id}      |  |
|  | SUPER_ADMIN    |  | admin:*        |  | client:{id}    |  |
|  +----------------+  +----------------+  +----------------+  |
|                                                               |
|  COUCHE 5 — APPLICATION                                      |
|  +----------------+  +----------------+  +----------------+  |
|  | Input          |  | Output         |  | SQL Injection  |  |
|  | Validation     |  | Encoding       |  | Protection     |  |
|  | (class-        |  | (XSS prev.)    |  | (param.        |  |
|  |  validator)    |  |                |  |  queries)      |  |
|  +----------------+  +----------------+  +----------------+  |
|                                                               |
|  COUCHE 6 — DONNEES                                          |
|  +----------------+  +----------------+  +----------------+  |
|  | Encryption     |  | Row Level      |  | Audit Trail    |  |
|  | at Rest (AES)  |  | Security (PG)  |  | (Event Store   |  |
|  | 256-bit        |  |                |  |  Sourcing)     |  |
|  +----------------+  +----------------+  +----------------+  |
|                                                               |
|  COUCHE 7 — MONITORING                                       |
|  +----------------+  +----------------+  +----------------+  |
|  | Alertes        |  | SIEM (futur)   |  | Forensics      |  |
|  | (Grafana)      |  |                |  | (logs signes)  |  |
|  +----------------+  +----------------+  +----------------+  |
|                                                               |
+---------------------------------------------------------------+
```

### 1.2 Couche 1 — Perimetre

**WAF (Web Application Firewall)**

Traefik est configure avec les regles OWASP Core Rule Set (CRS) pour detecter et bloquer :
- Injections SQL, XSS, LFI/RFI
- Scans de vulnerabilites
- Bots malveillants
- Attaques par force brute

```yaml
# Configuration Traefik WAF
traefik:
  middlewares:
    rate-limit:
      rateLimit:
        average: 100
        burst: 20
        period: 1m
    ip-whitelist:
      ipWhiteList:
        sourceRange:
          - "197.239.0.0/16"  # Plage IP Burkina Faso
          - "10.0.0.0/8"       # Reseau interne
```

**Rate Limiting**

Le rate limiting utilise l'algorithme Token Bucket implemente dans Redis :

| Profil | Requetes/min | Burst | Fenetre |
|--------|-------------|-------|---------|
| Anonyme | 20 | 5 | 60s |
| Standard | 100 | 20 | 60s |
| Premium | 300 | 50 | 60s |
| Admin | 500 | 100 | 60s |
| API Key | 1000 | 200 | 60s |

### 1.3 Couche 2 — Transport

**TLS 1.3 obligatoire**

```nginx
# Configuration SSL
ssl_protocols TLSv1.3;
ssl_ciphers TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:50m;
ssl_session_timeout 1d;
ssl_session_tickets off;

# HSTS
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

**Certificate Pinning (application mobile)**

Les applications mobiles incluent l'empreinte du certificat serveur pour prevenir les attaques MITM.

### 1.4 Couche 3 — Authentification

Voir section 2.

### 1.5 Couche 4 — Autorisation

Voir section 2.

### 1.6 Couche 5 — Application

**Validation des entrees**

Toutes les entrees utilisateur sont validees avec class-validator :

```typescript
class CreateVehicleDto {
  @IsString()
  @Length(17, 17)
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/)
  vin: string;

  @IsNumber()
  @Min(1990)
  @Max(2030)
  modelYear: number;

  @IsString()
  @IsEnum(VehicleCategory)
  category: VehicleCategory;
}
```

**Protection XSS**

- Toutes les sorties sont encodees (HTMLEncode)
- Content-Security-Policy (CSP) activee
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`

**Protection Injection SQL**

- Requetes parametrees (TypeORM QueryBuilder)
- Aucune concatenation SQL directe
- BRIN indexes pour les tables partitionnees

### 1.7 Couche 6 — Donnees

Voir section 3.

### 1.8 Couche 7 — Monitoring

Voir section 5.

---

## 2. Authentification et autorisation

### 2.1 Modeles d'authentification

#### JWT (JSON Web Token) — RS256

Les tokens JWT utilisent l'algorithme RS256 (asymetrique) :
- **Cle privee** : stockee sur le serveur (signatures)
- **Cle publique** : accessible aux clients (verifications)

```
+--------+                                    +--------+
| Client |  ---(1) login(email, password)---> | Server |
+--------+                                    +--------+
                                                   |
                                                   v
+--------+  <--(2) JWT (signe cle privee)------ +--------+
| Client |                                       | Server |
+--------+  ---(3) Request + JWT --------------> +--------+
     |                                              |
     |  Verifie signature avec cle publique        |
     |<--------------------------------------------+
```

**Duree de vie des tokens** :

| Token | Duree | Usage |
|-------|-------|-------|
| Access Token | 15 minutes | Requetes API |
| Refresh Token | 7 jours | Renouvellement |
| MFA Temp Token | 5 minutes | Verification MFA |
| API Key | 1 an | Integrations systeme |

**Stockage securise** :

| Client | Stockage | Protection |
|--------|----------|------------|
| Navigateur | Cookie httpOnly + Secure + SameSite=Strict | XSS protection |
| Mobile | Keychain (iOS) / Keystore (Android) | Chiffrement hardware |
| API | Variable d'environnement | Aucun stockage fichier |

#### Multi-Factor Authentication (MFA)

**Profils requerant MFA** :

| Role | MFA obligatoire | Methodes acceptees |
|------|----------------|-------------------|
| SUPER_ADMIN | Oui | TOTP + SMS backup |
| ADMIN | Oui | TOTP + SMS backup |
| CONTROLEUR | Oui | TOTP + SMS backup |
| IMPORTATEUR | Recommande | TOTP |
| DISTRIBUTEUR | Recommande | TOTP |
| DETAILLANT | Optionnel | TOTP |

**Implementation TOTP (RFC 6238)** :

```
Etape 1: Serveur genere secret (base32)
         |
Etape 2: QR Code (otpauth://totp/...)
         |
Etape 3: Utilisateur scanne avec Google Authenticator
         |
Etape 4: A chaque connexion, saisie du code a 6 chiffres
         |
Etape 5: Serveur verifie avec fenetre de tolerance (±1 periode)
```

**Codes de secours** :
- 10 codes a usage unique generes a la configuration MFA
- Stockes hashes (bcrypt) dans la base de donnees
- Invalidation automatique apres utilisation
- Regeneration possible

### 2.2 Modele d'autorisation (RBAC + ABAC)

#### Roles (RBAC)

| Role | Description | Niveau |
|------|-------------|--------|
| `SUPER_ADMIN` | Administrateur systeme | 1 |
| `ADMIN_DRCTT` | Administrateur DRCTT | 2 |
| `CONTROLEUR` | Agent de controle terrain | 3 |
| `AUDITEUR` | Auditeur conformite | 4 |
| `CNTI_AGENT` | Agent CNTI / securite | 4 |
| `IMPORTATEUR` | Importateur agree | 5 |
| `DISTRIBUTEUR` | Distributeur agree | 5 |
| `ASSEMBLEUR` | Unite d'assemblage | 5 |
| `DETAILLANT` | Detailiant | 6 |

#### Permissions granulaires

```typescript
// Exemples de permissions
const PERMISSIONS = {
  ACTOR: {
    CREATE: 'actor:create',
    READ: 'actor:read',
    UPDATE: 'actor:update',
    DELETE: 'actor:delete',
    SUSPEND: 'actor:suspend',
  },
  VEHICLE: {
    CREATE: 'vehicle:create',
    READ: 'vehicle:read',
    UPDATE: 'vehicle:update',
    BLACKLIST: 'vehicle:blacklist',
  },
  SALE: {
    CREATE: 'sale:create',
    READ: 'sale:read',
    CANCEL: 'sale:cancel',
  },
  REPORT: {
    GENERATE: 'report:generate',
    SUBMIT: 'report:submit',
    REVIEW: 'report:review',      // Admin uniquement
    APPROVE: 'report:approve',    // Admin uniquement
  },
  ADMIN: {
    DASHBOARD: 'admin:dashboard',
    MANAGE_USERS: 'admin:users',
    MANAGE_RULES: 'admin:rules',
    MANAGE_AGREEMENTS: 'admin:agreements',
  },
};
```

#### Ownership (ABAC)

Les permissions sont combinees avec la verification de propriete :

```typescript
// Exemple: Un importateur ne peut modifier que SON acteur
@UseGuards(JwtAuthGuard, OwnershipGuard)
@Patch('actors/:id')
async updateActor(@Param('id') id: string, @Body() dto: UpdateActorDto, @CurrentUser() user: User) {
  // OwnershipGuard verifie que user.actorId === id
  return this.actorService.update(id, dto);
}
```

### 2.3 Guards NestJS

```typescript
// Guards implementes
@Injectable()
class JwtAuthGuard implements CanActivate { /* Verification JWT */ }

@Injectable()
class RolesGuard implements CanActivate { /* Verification role */ }

@Injectable()
class PermissionsGuard implements CanActivate { /* Verification permission */ }

@Injectable()
class OwnershipGuard implements CanActivate { /* Verification propriete */ }

@Injectable()
class MfaGuard implements CanActivate { /* Verification MFA */ }

// Utilisation combinee
@Controller('admin/actors')
@UseGuards(JwtAuthGuard, MfaGuard, RolesGuard, PermissionsGuard)
@Roles('ADMIN_DRCTT', 'SUPER_ADMIN')
@Permissions('actor:suspend')
export class AdminActorController { }
```

---

## 3. Chiffrement des donnees

### 3.1 Chiffrement en transit (Transit)

| Protocole | Version | Configuration |
|-----------|---------|---------------|
| HTTPS | TLS 1.3 | OBLIGATOIRE pour tout trafic |
| Certificat | Let's Encrypt / EV | Renouvellement automatique |
| HSTS | max-age=63072000 | Preconnexion forcee HTTPS |

### 3.2 Chiffrement au repos (At Rest)

#### Base de donnees PostgreSQL

```sql
-- Chiffrement transparent des donnees sensibles
-- Colonnes chiffrees : donnees biométriques, numéros de documents

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Exemple: Chiffrement AES-256 des données biométriques
INSERT INTO biometric_data (client_id, data_encrypted)
VALUES (
  'uuid-client',
  pgp_sym_encrypt('donnees_biométriques', current_setting('app.encryption_key'), 'cipher-algo=aes256')
);

-- Dechiffrement
SELECT pgp_sym_decrypt(data_encrypted, current_setting('app.encryption_key'))
FROM biometric_data WHERE client_id = 'uuid-client';
```

#### Stockage objet MinIO

```yaml
# Configuration MinIO — chiffrement SSE-S3
MINIO_KMS_SECRET_KEY: "my-minio-key:6368616e676520746869732070617373776f726420746f206120736563726574"
```

Tous les buckets utilisent le chiffrement SSE-S3 (AES-256) :
- `ireg-kyc-documents` : CNI, passeports, biométrie
- `ireg-vehicle-photos` : Photos véhicules
- `ireg-reports` : Rapports PDF/XML (10 ans conservation)
- `ireg-invoices` : Factures OHADA (10 ans conservation)

#### Variables sensibles

| Type | Chiffrement | Methode |
|------|-------------|---------|
| JWT Secrets | AES-256-GCM | Envelope encryption |
| Mots de passe DB | Hash bcrypt (12 rounds) | Irreversible |
| Donnees biométriques | AES-256 + HMAC | Authentification + confidentialite |
| Numeros de telephone | AES-256 | Reversible pour SMS |

### 3.3 Gestion des cles

**Principes** :
- Rotation des cles tous les 90 jours
- Separation des cles par environnement (dev/staging/prod)
- Stockage dans Kubernetes Secrets ou Vault (futur)
- Jamais de cle en clair dans le code

```bash
# Rotation manuelle d'une cle
kubectl create secret generic ireg-backend-secrets \
  --from-literal=jwt-secret=$(openssl rand -base64 48) \
  --dry-run=client -o yaml | kubectl apply -f -

# Redemarrer les pods pour prendre en compte
kubectl rollout restart deployment/backend -n ireg-moto-bf-prod
```

---

## 4. Audit trail

### 4.1 Principe de l'audit trail immuable

Toutes les actions metier critiques sont enregistrees dans un **Event Store** avec chainage cryptographique. Ce mecanisme garantit :
- **Traçabilite** : Historique complet de chaque action
- **Integrite** : Detection de toute modification (chainage SHA-256)
- **Preuve juridique** : Acceptable dans un proces administratif

### 4.2 Schema de la table domain_events

```sql
CREATE TABLE domain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(64) NOT NULL,     -- 'vehicle', 'actor', 'sale', 'client'
    aggregate_id VARCHAR(128) NOT NULL,       -- VIN, actor_id, sale_id
    event_type VARCHAR(128) NOT NULL,         -- 'VehicleCreated', 'SaleRecorded'
    payload JSONB NOT NULL,
    previous_hash VARCHAR(64),                -- Hash de l'evenement precedent
    event_hash VARCHAR(64) NOT NULL,          -- Hash SHA-256 de cet evenement
    actor_user_id UUID REFERENCES users(id),
    actor_ip_address INET,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sequence_number BIGSERIAL
) PARTITION BY RANGE (timestamp);
```

### 4.3 Chainage cryptographique

```
Evenement 1: { payload, prev_hash: "0", timestamp } → Hash(1) = SHA256(payload + "0" + timestamp)

Evenement 2: { payload, prev_hash: Hash(1), timestamp } → Hash(2) = SHA256(payload + Hash(1) + timestamp)

Evenement 3: { payload, prev_hash: Hash(2), timestamp } → Hash(3) = SHA256(payload + Hash(2) + timestamp)

Verification: Re-calculer tous les hashes, comparer aux valeurs stockees.
Si un payload est modifie → hash different → chaine brisee → alerte.
```

### 4.4 Verification d'integrite

```typescript
async function verifyChainIntegrity(): Promise<boolean> {
    const events = await repository.find({ order: { sequenceNumber: 'ASC' }});
    
    for (let i = 1; i < events.length; i++) {
        const current = events[i];
        const previous = events[i - 1];
        
        // Verifier que previous_hash correspond au hash precedent
        if (current.previousHash !== previous.eventHash) {
            await alertSecurityTeam(`Chain break at sequence ${current.sequenceNumber}`);
            return false;
        }
        
        // Recalculer le hash pour detecter toute modification
        const calculatedHash = sha256(
            JSON.stringify(current.payload) + 
            current.previousHash + 
            current.timestamp.toISOString()
        );
        
        if (calculatedHash !== current.eventHash) {
            await alertSecurityTeam(`Hash mismatch at sequence ${current.sequenceNumber}`);
            return false;
        }
    }
    return true;
}
```

### 4.5 Verification automatique

- **Frequence** : Tous les jours a 3h00 du matin
- **Portee** : 30 derniers jours d'evenements
- **Alerte** : Notification immediate a l'equipe securite en cas d'anomalie
- **Rapport** : Generation d'un rapport hebdomadaire d'integrite

### 4.6 Types d'evenements enregistres

| Evenement | Declencheur | Donnees stockees |
|-----------|-------------|-----------------|
| `ActorCreated` | Creation d'un acteur | Fiche complete |
| `ActorUpdated` | Modification d'un acteur | Delta (champs modifies) |
| `ActorSuspended` | Suspension | Raison, duree, decideur |
| `VehicleImported` | Import d'un vehicule | VIN, homologation, valeur |
| `VehicleSold` | Vente | VIN, client, prix, facture |
| `SaleRecorded` | Enregistrement vente | Details complets |
| `SaleCancelled` | Annulation vente | Raison, utilisateur |
| `ClientKYCCompleted` | KYC verifie | Resultat, agent |
| `ComplianceChecked` | Evaluation conformite | Score, regles, ecarts |
| `ReportSubmitted` | Rapport soumis | Periode, numero |
| `FraudAlertTriggered` | Alerte fraude | Type, severite, pattern |
| `BlacklistEntryAdded` | Liste noire | VIN, raison, source |

### 4.7 Exemple de verification

```bash
# Executer la verification d'integrite
curl -X POST https://api.ireg-moto.bf/api/v1/audit/verify-chain \
  -H "Authorization: Bearer <admin-token>"

# Reponse
{
  "verified": true,
  "eventsChecked": 154320,
  "chainIntegrity": "INTACT",
  "lastVerifiedAt": "2024-07-16T03:00:00Z",
  "durationMs": 2345
}
```

---

## 5. Detection de fraude

### 5.1 Moteur de detection

Le Module G (Securite) implemente un moteur de detection de fraude base sur :
- **Regles metier** (deterministes)
- **Heuristiques statistiques** (scoring)
- **Analyse de patterns** (machine learning — futur)

### 5.2 Regles de detection

| Regle | Description | Severite |
|-------|-------------|----------|
| **PRICE_ANOMALY** | Marge > 150% de la moyenne du marche | HIGH |
| **VOLUME_ANOMALY** | > 50 ventes en 24h par un detailiant | MEDIUM |
| **CIRCULAR_TRADE** | Vehicule revendu > 3 fois en 30 jours | HIGH |
| **BLACKLISTED_VEHICLE** | Tentative de vente d'un vehicule vole | CRITICAL |
| **SUSPICIOUS_CLIENT** | Client avec plusieurs KYC rejetes | HIGH |
| **GEO_ANOMALY** | Vente a > 500km de l'entrepot declare | MEDIUM |
| **TIMING_ANOMALY** | Ventes concentrees entre 0h-5h | MEDIUM |
| **MULTIPLE_SAME_DAY** | Meme client achete > 3 vehicules/jour | HIGH |

### 5.3 Scoring des transactions

Chaque transaction recoit un score de risque (0-100) :

```
Score risque = Σ(poids_regle * activation_regle)

0-30   : RISQUE FAIBLE    → Transaction autorisee
31-60  : RISQUE MODERE    → Transaction autorisee avec flag
61-80  : RISQUE ELEVE     → Verification manuelle requise
81-100 : RISQUE CRITIQUE  → Transaction bloquee
```

### 5.4 Workflow d'alerte

```
Detection regle
     |
     v
+---------+     +---------+     +---------+     +---------+
| Score   | --> | Si >=61 | --> | Blocage | --> | Alerte  |
| calculé |     |         |     | auto    |     | CNTI/PN |
+---------+     +---------+     +---------+     +---------+
     |                
     | Si 31-60
     v
+---------+     +---------+
| Flag    | --> | Revue   |
| discret |     | manuelle|
+---------+     +---------+
```

### 5.5 Interface de gestion des alertes

[Image: Interface de gestion des alertes de fraude avec scoring et actions]

Les agents CNTI/DRCTT peuvent :
- Consulter les alertes actives (filtrees par severite, statut)
- Investiguer (acces aux donnees contextuelles)
- Assigner a un investiguateur
- Resoudre (CONFIRMED / FAUX POSITIF)
- Escalader si necessaire

### 5.6 Liste noire

La liste noire contient les entites suivantes :

| Type | Raison possible | Impact |
|------|----------------|--------|
| **Vehicule (VIN)** | Vole, fraude, contrefacon | Vente bloquee |
| **Client** | Fraude documentaire, recidive | KYC rejete |
| **Acteur** | Infraction grave, suspension | Activite interdite |
| **Pattern VIN** | Serie contrefaite detectee | Import bloque |

**Sources de la liste noire** :
- Declarations CNTI / Police nationale
- Detections automatiques du systeme
- Signalements d'autres acteurs
- Bases de donnees internationales (futur)

---

## 6. Bonnes pratiques

### 6.1 Pour les administrateurs

1. **MFA obligatoire** : Tous les comptes admin DOIVENT avoir MFA active
2. **Rotation des mots de passe** : Tous les 90 jours minimum
3. **Principe du moindre privilege** : Ne donner que les permissions necessaires
4. **Revocation immediate** : En cas de depart d'un collaborateur
5. **Audit regulier** : Revoir les logs de connexion mensuellement
6. **Mises a jour** : Appliquer les patchs de securite sous 48h

### 6.2 Pour les developpeurs

1. **Ne jamais logger de secrets** : JWT, mots de passe, cles API
2. **Validation cote serveur** : Ne jamais faire confiance au client
3. **Requetes parametrees** : Toujours utiliser QueryBuilder
4. **Headers securite** : Helmet.js active sur toutes les routes
5. **Dependances** : Auditer regulierement (`npm audit`)
6. **Code review** : Validation obligatoire avant merge

### 6.3 Pour les utilisateurs

1. **Mot de passe fort** : 12+ caracteres, mixte, unique
2. **MFA active** : Activer sur son compte
3. **Deconnexion** : Se deconnecter apres chaque session
4. **Phishing** : Ne jamais cliquer sur des liens suspects
5. **Appareil** : Ne pas utiliser d'appareil partage ou public
6. **Signalement** : Reporter toute activite suspecte

### 6.4 Checklist de securite mensuelle

```
CHECKLIST SECURITE MENSUELLE — iReg Moto BF
============================================

AUTHENTIFICATION
[ ] Verifier les comptes sans MFA (doit etre 0 pour admin)
[ ] Revoir les tentatives de connexion echouees (> 10 par compte)
[ ] Verifier les connexions depuis des IP inhabituelles
[ ] Verifier les comptes inactifs depuis 90 jours

AUTORISATION
[ ] Auditer les permissions par role
[ ] Verifier les acces excesifs (principe moindre privilege)
[ ] Revoquer les acces des collaborateurs partis

DONNEES
[ ] Verifier l'integrite de la chaine d'audit
[ ] Confirmer les backups chiffres
[ ] Verifier les certificats SSL (date d'expiration)
[ ] Auditer les acces aux documents sensibles

INFRASTRUCTURE
[ ] Verifier les mises a jour de securite disponibles
[ ] Auditer les regles firewall / network policies
[ ] Verifier les logs d'acces anormaux
[ ] Confirmer le fonctionnement des alertes monitoring

APPLICATION
[ ] Executer npm audit
[ ] Verifier les dependances obsoletes
[ ] Tester les injections (pentest leger)
[ ] Verifier les headers de securite
```

### 6.5 Plan de reponse aux incidents

| Phase | Delai | Actions |
|-------|-------|---------|
| **Detection** | Immediate | Alertes monitoring, signalement utilisateur |
| **Containement** | < 1h | Isolation, revocation tokens, blocage IP |
| **Eradication** | < 4h | Suppression malware, patch vulnerabilite |
| **Recuperation** | < 24h | Restauration services, verification integrite |
| **Post-mortem** | < 72h | Rapport d'incident, lecons apprises |

### 6.6 Contacts securite

| Role | Contact | Disponibilite |
|------|---------|---------------|
| RSSI | security@ireg-moto.bf | 24/7 |
| Equipe securite | +226 70 XX XX XX | 24/7 |
| CNTI | cnti@gov.bf | 24/7 |
| Police cyber | cyber@police.bf | 24/7 |

---

## Annexes

### A. References

- OWASP Top 10 2021
- NIST Cybersecurity Framework
- eIDAS Regulation (UE) 910/2014
- RGPD UEMOA
- Arrete ministeriel 05/06/2026 (articles 22-25)

### B. Outils de securite

| Outil | Usage |
|-------|-------|
| OWASP ZAP | Pentest automatisé |
| SonarQube | Analyse statique de code |
| Trivy | Scan de vulnerabilites containers |
| kube-bench | Audit securite Kubernetes |
| Falco | Detection runtime (futur) |

---

> **Classification:** CONFIDENTIEL
> **Version:** 1.0.0 | **Mise a jour:** Juillet 2024
> **Distribution:** Restreinte — RSSI, equipe securite, architectes
