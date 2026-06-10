# iReg Moto BF — Documentation API

> **Version:** 1.0.0 | **Base URL:** `https://api.ireg-moto.bf/v1`
> **Protocols:** REST (mutations metier) + GraphQL (analytics)
> **Authentication:** JWT (RS256) + OAuth2 + MFA

---

## Table des matières

1. [Vue d'ensemble de l'API](#1-vue-densemble-de-lapi)
2. [Authentification](#2-authentification)
3. [Endpoints par module](#3-endpoints-par-module)
   - 3.1 Auth
   - 3.2 Acteurs (Module A)
   - 3.3 Vehicules (Module B)
   - 3.4 Stocks (Module B)
   - 3.5 Clients (Module C)
   - 3.6 Ventes (Module D)
   - 3.7 Pricing (Module D)
   - 3.8 Rapports (Module E)
   - 3.9 Conformite (Module F)
   - 3.10 Securite (Module G)
   - 3.11 Admin (Module H)
   - 3.12 Ministere (Module H)
   - 3.13 Webhooks
4. [Codes d'erreur](#4-codes-derreur)
5. [Rate Limiting](#5-rate-limiting)
6. [Webhooks](#6-webhooks)
7. [GraphQL](#7-graphql)

---

## 1. Vue d'ensemble de l'API

### Architecture hybride

L'API iReg Moto BF adopte une architecture hybride deliberement concue pour servir deux usages distincts :

| Protocole | Endpoint | Usage |
|-----------|----------|-------|
| **REST** | `/api/v1/*` | Mutations metier (POST/PUT/DELETE) — utilise par la PWA offline-first |
| **GraphQL** | `/graphql` | Requetes analytiques complexes — utilise par le portail admin |
| **Swagger UI** | `/api/docs` | Documentation interactive de l'API |

### Environnements

| Environnement | URL | Statut |
|---------------|-----|--------|
| Production | `https://api.ireg-moto.bf/v1` | Live |
| Staging | `https://api-staging.ireg-moto.bf/v1` | Pre-production |
| Local | `http://localhost:3000/api/v1` | Developpement |

### Conventions

- **Format de date** : ISO 8601 (`2026-06-15T10:30:00Z`)
- **Format de monnaie** : XOF (CFA franc), centimes
- **Pagination** : `?page=1&limit=20` (max 100)
- **Content-Type** : `application/json` (sauf upload de fichiers : `multipart/form-data`)
- **Langue** : Header `Accept-Language: fr` (fr, mos, dyu, ff)

### Headers obligatoires

```
Content-Type: application/json
Authorization: Bearer <jwt_access_token>
X-Request-ID: <uuid_unique_par_requete>
X-Client-Locale: fr_BF
```

---

## 2. Authentification

### 2.1 Schema d'authentification

L'API supporte trois modes d'authentification :

1. **JWT standard** (email/mot de passe) — pour les acteurs economiques
2. **JWT + MFA** (TOTP/SMS) — obligatoire pour ADMIN, CONTROLEUR, SUPER_ADMIN
3. **OAuth2** (Google, Microsoft) — optionnel pour les acteurs economiques
4. **API Key** (X-API-Key) — pour les integrations systeme (ministere, DGI)

### 2.2 Flux d'authentification JWT

**Etape 1 — Login**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "contact@societe-import.bf",
  "password": "MotDePasseSecurise123!",
  "deviceId": "uuid-device-unique"
}
```

**Reponse (sans MFA)** :

```json
{
  "success": true,
  "mfaRequired": false,
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "uuid-user",
    "email": "contact@societe-import.bf",
    "firstName": "Amadou",
    "lastName": "TRAORE",
    "roles": [{"role": "IMPORTATEUR", "actorId": "uuid-actor"}],
    "permissions": ["actor:read", "actor:update", "sale:create", "report:submit"],
    "locale": "fr_BF",
    "mfaEnabled": false
  }
}
```

**Reponse (avec MFA requis)** :

```json
{
  "success": true,
  "mfaRequired": true,
  "tempToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...temp"
}
```

**Etape 2 — Verification MFA**

```http
POST /api/v1/auth/mfa/verify
Content-Type: application/json

{
  "tempToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...temp",
  "mfaCode": "123456",
  "mfaType": "TOTP"
}
```

### 2.3 Configuration MFA

**Generer un secret MFA (TOTP)** :

```http
POST /api/v1/auth/mfa/setup
Authorization: Bearer <token>
Content-Type: application/json

{
  "mfaType": "TOTP"
}
```

**Reponse** :

```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "otpauth://totp/iRegMoto:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=iRegMoto",
  "backupCodes": ["12345678", "87654321", "11223344", "44332211", "55667788"]
}
```

[Image: Capture d'ecran du QR code iReg Moto BF dans Google Authenticator]

### 2.4 Rafraichissement du token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...refresh"
}
```

**Reponse** :

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...new",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...new-refresh",
  "expiresIn": 900
}
```

> **Note** : Les refresh tokens sont automatiquement rotés (un nouveau est genere a chaque utilisation). L'ancien est invalide.

### 2.5 Deconnexion

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

**Reponse** : `204 No Content`

Le token est ajoute a la liste noire Redis jusqu'a son expiration naturelle.

### 2.6 Authentification OAuth2

```http
POST /api/v1/auth/oauth/callback
Content-Type: application/json

{
  "provider": "GOOGLE",
  "code": "4/0Adeu5BX...",
  "redirectUri": "https://app.ireg-moto.bf/auth/callback"
}
```

### 2.7 Profil utilisateur

```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

**Reponse** :

```json
{
  "id": "uuid-user",
  "email": "contact@societe-import.bf",
  "firstName": "Amadou",
  "lastName": "TRAORE",
  "fullName": "Amadou TRAORE",
  "phone": "+226 70 12 34 56",
  "roles": [
    {
      "role": "IMPORTATEUR",
      "actorId": "uuid-actor"
    }
  ],
  "permissions": [
    "actor:read",
    "actor:update",
    "vehicle:create",
    "vehicle:read",
    "sale:create",
    "report:submit",
    "compliance:read"
  ],
  "locale": "fr_BF",
  "mfaEnabled": false,
  "actor": {
    "id": "uuid-actor",
    "companyName": "Societe d'Importation Motos BF SA",
    "actorType": "IMPORTATEUR"
  }
}
```

### 2.8 Structure du JWT

```json
{
  "sub": "uuid-user",
  "email": "contact@societe-import.bf",
  "role": "IMPORTATEUR",
  "actorId": "uuid-actor",
  "permissions": ["actor:read", "sale:create", "report:submit"],
  "mfaVerified": true,
  "iat": 1718400000,
  "exp": 1718400900,
  "jti": "uuid-jwt-unique"
}
```

---

## 3. Endpoints par module

### 3.1 Auth

| Methode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/auth/login` | Authentification email/password | Public |
| POST | `/auth/refresh` | Rafraichissement token | Public |
| POST | `/auth/mfa/setup` | Configuration MFA | Bearer |
| POST | `/auth/mfa/verify` | Verification MFA | Public (temp token) |
| POST | `/auth/oauth/callback` | Callback OAuth2 | Public |
| POST | `/auth/logout` | Deconnexion | Bearer |
| GET | `/auth/me` | Profil utilisateur | Bearer |

---

### 3.2 Acteurs — Module A

#### Liste des acteurs

```http
GET /api/v1/actors?page=1&limit=20&status=ACTIVE&actorType=IMPORTATEUR&region=CENTRE&search=Societe&complianceScoreMin=70
Authorization: Bearer <token>
```

**Parametres de requete** :

| Parametre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numero de page (defaut: 1) |
| `limit` | integer | Elements par page (defaut: 20, max: 100) |
| `status` | string | `PENDING`, `ACTIVE`, `SUSPENDED`, `REVOKED`, `EXPIRED` |
| `actorType` | string | `IMPORTATEUR`, `DISTRIBUTEUR`, `ASSEMBLEUR`, `DETAILLANT`, `PRESTATAIRE` |
| `region` | string | Region du Burkina Faso |
| `search` | string | Recherche par nom, NIF, RCCM |
| `complianceScoreMin` | number | Score de conformite minimum (0-100) |
| `agreementStatus` | string | Statut d'agrement |

**Reponse** :

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "actorType": "IMPORTATEUR",
      "status": "ACTIVE",
      "companyName": "Societe d'Importation Motos BF SA",
      "tradeName": "SIMOBF",
      "nif": "000123456789",
      "rccm": "BF-OUA-2024-12345",
      "legalRepresentativeName": "Amadou TRAORE",
      "email": "contact@simobf.bf",
      "phone": "+226 70 12 34 56",
      "addressLine1": "Avenue Kwame Nkrumah, secteur 15",
      "city": "Ouagadougou",
      "region": "CENTRE",
      "agreementStatus": "APPROVED",
      "agreementNumber": "AGR-IM-2024-001234",
      "agreementExpiresAt": "2025-12-31T23:59:59Z",
      "complianceScore": 87.5,
      "complianceCountdownDays": 45,
      "createdAt": "2024-01-15T08:30:00Z",
      "updatedAt": "2024-06-10T14:22:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

#### Creer un acteur

```http
POST /api/v1/actors
Authorization: Bearer <token>
Content-Type: application/json

{
  "actorType": "IMPORTATEUR",
  "companyName": "Societe d'Importation Motos BF SA",
  "tradeName": "SIMOBF",
  "nif": "000123456789",
  "rccm": "BF-OUA-2024-12345",
  "legalRepresentativeName": "Amadou TRAORE",
  "legalRepresentativeTitle": "Directeur General",
  "legalRepresentativePhone": "+226 70 12 34 56",
  "legalRepresentativeEmail": "amadou.traore@simobf.bf",
  "email": "contact@simobf.bf",
  "phone": "+226 70 12 34 56",
  "alternatePhone": "+226 50 98 76 54",
  "addressLine1": "Avenue Kwame Nkrumah, secteur 15",
  "addressLine2": "BP 1234",
  "city": "Ouagadougou",
  "region": "CENTRE",
  "postalCode": "01",
  "gpsCoordinates": {"lat": 12.3714, "lng": -1.5197},
  "bankName": "Bank of Africa",
  "bankAccount": "12345678901",
  "bankRib": "BF1234567890123456789012345"
}
```

**Reponse** : `201 Created` avec l'objet Actor cree (statut initial : `PENDING`).

#### Detail d'un acteur

```http
GET /api/v1/actors/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Reponse** : Objet ActorDetail incluant entrepots, documents et acteur parent.

#### Modifier un acteur

```http
PATCH /api/v1/actors/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "Societe d'Importation Motos BF SA (nouveau nom)",
  "phone": "+226 70 12 34 57",
  "email": "nouveau@simobf.bf"
}
```

#### Upload de document

```http
POST /api/v1/actors/550e8400-e29b-41d4-a716-446655440000/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <fichier.pdf>
documentType: REGISTRE_COMMERCE
documentLabel: Registre de commerce 2024
issuedDate: 2024-01-01
expiryDate: 2024-12-31
```

[Image: Interface d'upload de document avec drag-and-drop]

---

### 3.3 Vehicules — Module B

#### Liste des vehicules

```http
GET /api/v1/vehicles?status=IN_STOCK&category=MOTO_LEGERE_125CC&manufacturer=YAMAHA&actorId=uuid-actor
Authorization: Bearer <token>
```

**Reponse** :

```json
{
  "data": [
    {
      "id": "uuid-vehicle",
      "vin": "JYARJ16E08A012345",
      "manufacturer": "YAMAHA",
      "model": "YBR 125",
      "modelYear": 2024,
      "category": "MOTO_LEGERE_125CC",
      "categoryLabel": "Moto legere (<= 125cc)",
      "fuelType": "ESSENCE",
      "cylinderCapacityCc": 125,
      "powerKw": 7.5,
      "color": "Noir",
      "status": "IN_STOCK",
      "qrCode": "IREG:JYARJ16E08A012345:MOTO_LEGERE_125CC:COMPLIANT",
      "homologationNumber": "HOM-2024-56789",
      "homologationValidUntil": "2026-12-31",
      "complianceStatus": "COMPLIANT",
      "importDate": "2024-03-15",
      "customsValue": 850000,
      "currentOwnerActorId": "uuid-actor",
      "currentWarehouseId": "uuid-warehouse",
      "createdAt": "2024-03-15T10:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 342, "totalPages": 18 }
}
```

#### Enregistrer un vehicule (import)

```http
POST /api/v1/vehicles
Authorization: Bearer <token>
Content-Type: application/json

{
  "vin": "JYARJ16E08A012345",
  "chassisNumber": "JYA-RJ16E-0A012345",
  "engineNumber": "E3TE123456",
  "manufacturer": "YAMAHA",
  "model": "YBR 125",
  "modelYear": 2024,
  "categoryId": "uuid-category-125cc",
  "fuelType": "ESSENCE",
  "transmission": "MANUELLE",
  "cylinderCapacityCc": 125,
  "powerKw": 7.5,
  "weightKg": 128,
  "color": "Noir",
  "importCountryCode": "JP",
  "importDeclarationNumber": "DECL-2024-001234",
  "importDate": "2024-03-15",
  "customsValue": 850000,
  "homologationNumber": "HOM-2024-56789",
  "homologationValidUntil": "2026-12-31"
}
```

**Reponse** : `201 Created` si le vehicule est conforme, `422 Unprocessable Entity` si la categorie est interdite.

#### Detail d'un vehicule par VIN

```http
GET /api/v1/vehicles/JYARJ16E08A012345
Authorization: Bearer <token>
```

**Reponse** : VehicleDetail incluant historique de propriete et statut blacklist.

#### Historique de propriete

```http
GET /api/v1/vehicles/JYARJ16E08A012345/ownership-history
Authorization: Bearer <token>
```

#### Generer un QR code

```http
POST /api/v1/vehicles/JYARJ16E08A012345/qr-generate
Authorization: Bearer <token>
```

**Reponse** :

```json
{
  "qrCode": "IREG:JYARJ16E08A012345:MOTO_LEGERE_125CC:COMPLIANT",
  "qrImageUrl": "https://s3.ireg-moto.bf/qr-codes/JYARJ16E08A012345.png",
  "generatedAt": "2024-06-15T10:30:00Z"
}
```

[Image: Exemple de QR code iReg Moto BF sur un vehicule]

---

### 3.4 Stocks — Module B

#### Mouvements de stock

```http
GET /api/v1/stocks/movements?actorId=uuid-actor&warehouseId=uuid-warehouse&movementType=IMPORT&dateFrom=2024-01-01&dateTo=2024-06-30
Authorization: Bearer <token>
```

**Reponse** :

```json
{
  "data": [
    {
      "id": "uuid-movement",
      "vehicleId": "uuid-vehicle",
      "vehicleVin": "JYARJ16E08A012345",
      "actorId": "uuid-actor",
      "warehouseId": "uuid-warehouse",
      "warehouseName": "Entrepot Principal Ouaga",
      "movementType": "IMPORT",
      "quantity": 1,
      "referenceDocument": "DECL-2024-001234",
      "unitCost": 850000,
      "currencyCode": "XOF",
      "notes": "Import lot de 150 unites YAMAHA YBR 125",
      "performedBy": "Amadou TRAORE",
      "movementDate": "2024-03-15T10:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 1245 }
}
```

#### Enregistrer un mouvement

```http
POST /api/v1/stocks/movements
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "uuid-vehicle",
  "movementType": "TRANSFER",
  "warehouseId": "uuid-warehouse-dest",
  "referenceDocument": "BL-2024-005678",
  "unitCost": 850000,
  "currencyCode": "XOF",
  "notes": "Transfert vers entrepot Bobo-Dioulasso"
}
```

#### Resumé des stocks

```http
GET /api/v1/stocks/summary?actorId=uuid-actor
Authorization: Bearer <token>
```

**Reponse** :

```json
{
  "data": [
    {
      "category": "MOTO_LEGERE_125CC",
      "categoryLabel": "Moto legere (<= 125cc)",
      "totalUnits": 342,
      "totalValue": 290700000,
      "warehouseId": "uuid-warehouse",
      "warehouseName": "Entrepot Principal Ouaga"
    },
    {
      "category": "MOTO_LOURDE_125CC_PLUS",
      "categoryLabel": "Moto lourde (> 125cc)",
      "totalUnits": 89,
      "totalValue": 115700000,
      "warehouseId": "uuid-warehouse",
      "warehouseName": "Entrepot Principal Ouaga"
    }
  ]
}
```

[Image: Tableau de bord des stocks avec graphique circulaire par categorie]

---

### 3.5 Clients — Module C

#### Liste des clients

```http
GET /api/v1/clients?status=KYC_VERIFIED&actorId=uuid-actor&search=Konate&hasPendingKYC=false
Authorization: Bearer <token>
```

#### Creer un client (KYC)

```http
POST /api/v1/clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Issouf",
  "lastName": "KONATE",
  "idDocumentType": "CNI",
  "idDocumentNumber": "B12345678901",
  "idDocumentIssuedAt": "2020-03-15",
  "idDocumentExpiresAt": "2030-03-14",
  "idDocumentIssuedBy": "CECU-Ouagadougou",
  "phone": "+226 70 98 76 54",
  "phone2": "+226 50 12 34 56",
  "email": "issouf.konate@email.bf",
  "addressLine1": "Rue 10.123, secteur 7",
  "addressLine2": "Pres du marche de Gounghin",
  "city": "Ouagadougou",
  "region": "CENTRE"
}
```

#### Verifier le KYC

```http
POST /api/v1/clients/550e8400-e29b-41d4-a716-446655440000/verify-kyc
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "KYC_VERIFIED",
  "notes": "Documents verifies : CNI valide, selfie correspondant, adresse confirmee",
  "riskLevel": "LOW"
}
```

---

### 3.6 Ventes — Module D

#### Enregistrer une vente

```http
POST /api/v1/sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "uuid-client",
  "warehouseId": "uuid-warehouse",
  "paymentMethod": "MOBILE_MONEY",
  "paymentReference": "MM-2024-00123456",
  "discountAmount": 0,
  "notes": "Vente standard avec garantie 6 mois",
  "items": [
    {
      "vehicleId": "uuid-vehicle",
      "unitPrice": 1250000,
      "quantity": 1,
      "discountAmount": 0
    }
  ],
  "saleLocation": {
    "lat": 12.3714,
    "lng": -1.5197
  }
}
```

**Reponse** : `201 Created`

```json
{
  "id": "uuid-sale",
  "actorId": "uuid-actor",
  "clientId": "uuid-client",
  "clientName": "Issouf KONATE",
  "status": "PAID",
  "paymentMethod": "MOBILE_MONEY",
  "subtotalAmount": 1250000,
  "discountAmount": 0,
  "taxAmount": 250000,
  "totalAmount": 1500000,
  "currencyCode": "XOF",
  "saleDate": "2024-06-15T14:30:00Z",
  "invoiceNumber": "F-2024-0005678",
  "itemCount": 1,
  "items": [
    {
      "id": "uuid-item",
      "vehicleId": "uuid-vehicle",
      "vehicleVin": "JYARJ16E08A012345",
      "vehicleModel": "YAMAHA YBR 125",
      "unitPrice": 1250000,
      "quantity": 1,
      "lineTotal": 1250000,
      "taxAmount": 250000,
      "marginAmount": 400000,
      "marginRate": 32.0
    }
  ],
  "invoice": {
    "id": "uuid-invoice",
    "invoiceNumber": "F-2024-0005678",
    "status": "ISSUED",
    "pdfUrl": "https://s3.ireg-moto.bf/invoices/F-2024-0005678.pdf"
  },
  "createdAt": "2024-06-15T14:30:00Z"
}
```

#### Telecharger la facture OHADA

```http
GET /api/v1/sales/uuid-sale/invoice
Authorization: Bearer <token>
Accept: application/pdf
```

**Reponse** : Fichier PDF binaire signe electroniquement, conforme normes OHADA.

[Image: Exemple de facture OHADA generee par iReg Moto BF]

---

### 3.7 Pricing — Module D

#### Analyse des marges

```http
GET /api/v1/pricing/margins?actorId=uuid-actor&groupBy=CATEGORY&dateFrom=2024-01-01&dateTo=2024-06-30
Authorization: Bearer <token>
```

**Reponse** :

```json
{
  "data": [
    {
      "groupKey": "MOTO_LEGERE_125CC",
      "groupLabel": "Moto legere (<= 125cc)",
      "avgPurchasePrice": 850000,
      "avgSellingPrice": 1250000,
      "avgMarginRate": 32.0,
      "totalSales": 245,
      "totalRevenue": 306250000,
      "anomalyCount": 3
    },
    {
      "groupKey": "MOTO_LOURDE_125CC_PLUS",
      "groupLabel": "Moto lourde (> 125cc)",
      "avgPurchasePrice": 1450000,
      "avgSellingPrice": 2100000,
      "avgMarginRate": 30.95,
      "totalSales": 87,
      "totalRevenue": 182700000,
      "anomalyCount": 1
    }
  ]
}
```

#### Detection des anomalies

```http
GET /api/v1/pricing/anomalies?actorId=uuid-actor&severity=HIGH
Authorization: Bearer <token>
```

---

### 3.8 Rapports — Module E

#### Generer un rapport trimestriel

```http
POST /api/v1/reports/quarterly/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "year": 2024,
  "quarter": "Q2"
}
```

**Reponse** : `202 Accepted`

```json
{
  "reportId": "550e8400-e29b-41d4-a716-446655440999",
  "status": "GENERATING",
  "estimatedCompletion": "2024-07-16T11:00:00Z"
}
```

Le rapport est genere de maniere asynchrone par un worker RabbitMQ.

#### Statut du rapport

```http
GET /api/v1/reports/quarterly/status/550e8400-e29b-41d4-a716-446655440999
Authorization: Bearer <token>
```

**Reponse (rapport pret)** :

```json
{
  "reportId": "550e8400-e29b-41d4-a716-446655440999",
  "status": "READY",
  "progress": 100,
  "downloadUrls": {
    "xml": "https://s3.ireg-moto.bf/reports/RPT-2024-Q2-550e8400.xml",
    "pdf": "https://s3.ireg-moto.bf/reports/RPT-2024-Q2-550e8400.pdf"
  },
  "generatedAt": "2024-07-16T10:45:32Z",
  "submittedAt": null
}
```

#### Soumettre le rapport au ministere

```http
POST /api/v1/reports/quarterly/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "reportId": "550e8400-e29b-41d4-a716-446655440999",
  "notes": "Rapport trimestriel T2 2024 — toutes les donnees sont verifiees et conformes."
}
```

**Reponse** :

```json
{
  "reportId": "550e8400-e29b-41d4-a716-446655440999",
  "status": "SUBMITTED",
  "acknowledgmentNumber": "RPT-2024-Q2-0001234",
  "submittedAt": "2024-07-16T11:00:00Z"
}
```

[Image: Interface de soumission du rapport trimestriel avec compte a rebours]

---

### 3.9 Conformite — Module F

#### Liste des regles

```http
GET /api/v1/compliance/rules?ruleType=DOCUMENT&severity=CRITICAL&isActive=true
Authorization: Bearer <token>
```

#### Lancer une evaluation

```http
POST /api/v1/compliance/checklist
Authorization: Bearer <token>
Content-Type: application/json

{
  "actorId": "uuid-actor",
  "checklistType": "SELF_ASSESSMENT"
}
```

#### Score de conformite

```http
GET /api/v1/compliance/score?actorId=uuid-actor
Authorization: Bearer <token>
```

**Reponse** :

```json
{
  "actorId": "uuid-actor",
  "overallScore": 87.5,
  "documentScore": 95.0,
  "vehicleScore": 90.0,
  "pricingScore": 82.5,
  "kycScore": 85.0,
  "reportingScore": 100.0,
  "stockScore": 80.0,
  "rulesChecked": 48,
  "rulesPassed": 42,
  "rulesFailed": 4,
  "criticalFailures": 1,
  "alertLevel": "WARNING",
  "countdownDays": 45,
  "calculatedAt": "2024-07-16T10:30:00Z"
}
```

[Image: Widget de score de conformite avec jauge multicolore]

---

### 3.10 Securite — Module G

#### Liste des alertes

```http
GET /api/v1/security/alerts?severity=HIGH&status=OPEN&actorId=uuid-actor
Authorization: Bearer <token>
```

#### Verification VIN (controleurs terrain)

```http
GET /api/v1/security/verify-vin?vin=JYARJ16E08A012345
Authorization: Bearer <token>
```

**Reponse** :

```json
{
  "vin": "JYARJ16E08A012345",
  "isRegistered": true,
  "vehicle": {
    "manufacturer": "YAMAHA",
    "model": "YBR 125",
    "category": "MOTO_LEGERE_125CC",
    "status": "SOLD"
  },
  "isBlacklisted": false,
  "blacklistInfo": null,
  "isCompliant": true,
  "complianceScore": 87.5,
  "ownerInfo": {
    "actorName": "Societe d'Importation Motos BF SA",
    "clientName": "Issouf KONATE"
  },
  "lastVerifiedAt": "2024-06-15T14:30:00Z"
}
```

[Image: Ecran de verification VIN pour controleur terrain]

---

### 3.11 Admin — Module H

#### Tableau de bord administratif

```http
GET /api/v1/admin/dashboard?period=MONTH&region=CENTRE
Authorization: Bearer <token>
```

#### Suspendre un acteur

```http
POST /api/v1/admin/actors/uuid-actor/suspend
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Non-conformite critique : absence de rapport trimestriel depuis 2 periodes consecutive. Marge anormale detectee sur 15 ventes. Refus de soumettre les documents KYC a jour.",
  "duration": 90
}
```

#### Agrégations nationales

```http
GET /api/v1/admin/aggregations?dimension=SALES_BY_REGION&dateFrom=2024-01-01&dateTo=2024-06-30&granularity=MONTH
Authorization: Bearer <token>
```

---

### 3.12 Ministere — Module H

#### Rapports soumis

```http
GET /api/v1/ministry/reports?year=2024&quarter=Q2&status=SUBMITTED&region=CENTRE
Authorization: Bearer <token>
X-API-Key: ministry-api-key
```

#### Reviser un rapport

```http
POST /api/v1/ministry/reports/uuid-report/review
Authorization: Bearer <token>
X-API-Key: ministry-api-key
Content-Type: application/json

{
  "decision": "AMENDMENT_REQUIRED",
  "notes": "Le rapport est globalement satisfaisant mais les donnees de stock page 12 ne correspondent pas aux mouvements declares. Veuillez corriger et resoumettre.",
  "amendmentRequirements": [
    "Corriger la ligne 45 du tableau de stock (ecart de 12 unites)",
    "Ajouter le justificatif de paiement des taxes T2"
  ]
}
```

---

### 3.13 Webhooks

#### Creer un webhook

```http
POST /api/v1/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://mon-erp.bf/webhooks/ireg-moto",
  "events": ["sale.recorded", "compliance.score.updated", "report.submitted"],
  "secret": "whsec_mon_secret_webhook",
  "isActive": true
}
```

#### Tester un webhook

```http
POST /api/v1/webhooks/uuid-webhook/test
Authorization: Bearer <token>
```

---

## 4. Codes d'erreur

### 4.1 Format d'erreur standard

```json
{
  "statusCode": 422,
  "message": "Le VIN fourni n'est pas valide",
  "code": "INVALID_VIN",
  "details": {
    "field": "vin",
    "value": "INVALIDVIN123",
    "pattern": "^[A-HJ-NPR-Z0-9]{17}$"
  },
  "timestamp": "2024-07-16T10:30:00Z",
  "path": "/api/v1/vehicles"
}
```

### 4.2 Codes d'erreur métier

| Code | HTTP | Description | Action recommandee |
|------|------|-------------|-------------------|
| `INVALID_VIN` | 400 | VIN invalide (format ou checksum) | Verifier le VIN sur le chassis |
| `VEHICLE_BLACKLISTED` | 422 | Vehicule sur liste noire | Contacter le support securite |
| `INSUFFICIENT_STOCK` | 422 | Stock insuffisant | Verifier les inventaires |
| `KYC_REQUIRED` | 422 | Client non verifie KYC | Completer la verification client |
| `COMPLIANCE_BLOCKER` | 422 | Regle de conformite bloquante | Consulter le score de conformite |
| `MARGIN_ANOMALY` | 422 | Marge anormale detectee | Justifier le prix ou corriger |
| `REPORT_ALREADY_SUBMITTED` | 409 | Rapport deja soumis | Attendre la periode suivante |
| `AGREMENT_EXPIRED` | 403 | Agrement expire | Renouveler l'agrement |
| `ACTOR_SUSPENDED` | 403 | Acteur suspendu | Contacter le ministere |
| `RATE_LIMIT_EXCEEDED` | 429 | Trop de requetes | Attendre et retry |

---

## 5. Rate Limiting

### 5.1 Politique de rate limiting

| Profil | Requetes | Fenetre | Burst |
|--------|----------|---------|-------|
| **Anonyme** | 20/min | 60s | 5 |
| **Standard** (acteur economique) | 100/min | 60s | 20 |
| **Premium** (gros importateur) | 300/min | 60s | 50 |
| **Admin** (ministere) | 500/min | 60s | 100 |
| **API Key** (integration systeme) | 1000/min | 60s | 200 |

### 5.2 Headers de rate limiting

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1718400960
X-RateLimit-Retry-After: 45
```

### 5.3 Depassement

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1718400960
X-RateLimit-Retry-After: 45

{
  "statusCode": 429,
  "message": "Trop de requetes. Limite : 100 requetes par minute. Reessayez dans 45 secondes.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 45
}
```

---

## 6. Webhooks

### 6.1 Evenements disponibles

| Evenement | Description | Payload |
|-----------|-------------|---------|
| `actor.created` | Nouvel acteur enregistre | Actor |
| `actor.updated` | Acteur modifie | Actor |
| `actor.suspended` | Acteur suspendu | Actor + raison |
| `vehicle.imported` | Vehicule importe | Vehicle |
| `vehicle.sold` | Vehicule vendu | Vehicle + Sale |
| `sale.recorded` | Vente enregistree | SaleDetail |
| `sale.cancelled` | Vente annulee | Sale + raison |
| `client.created` | Client cree | Client |
| `client.kyc.verified` | KYC verifie | Client |
| `compliance.score.updated` | Score mis a jour | ComplianceScore |
| `compliance.check.failed` | Controle echoue | Rule + details |
| `report.generated` | Rapport genere | Report |
| `report.submitted` | Rapport soumis | Report + numero |
| `report.reviewed` | Rapport revise | Report + decision |
| `fraud.alert.triggered` | Alerte fraude | FraudAlert |
| `blacklist.entry.added` | Entree liste noire | BlacklistEntry |

### 6.2 Format de livraison

```http
POST https://mon-erp.bf/webhooks/ireg-moto
Content-Type: application/json
X-iReg-Signature: sha256=5d41402abc4b2a76b9719d911017c592
X-iReg-Event: sale.recorded
X-iReg-Delivery-ID: 550e8400-e29b-41d4-a716-446655440001

{
  "event": "sale.recorded",
  "timestamp": "2024-07-16T10:30:00Z",
  "data": {
    "saleId": "uuid-sale",
    "actorId": "uuid-actor",
    "clientId": "uuid-client",
    "vehicleVin": "JYARJ16E08A012345",
    "totalAmount": 1500000,
    "currencyCode": "XOF",
    "invoiceNumber": "F-2024-0005678"
  }
}
```

### 6.3 Verification de signature

```typescript
const crypto = require('crypto');

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature.replace('sha256=', '')),
    Buffer.from(expectedSignature)
  );
}
```

---

## 7. GraphQL

### 7.1 Endpoint

```
POST https://api.ireg-moto.bf/graphql
Authorization: Bearer <token>
Content-Type: application/json
```

### 7.2 Exemple de requete analytique

**Requete** :

```graphql
query DashboardAnalytics($period: PeriodInput!, $region: String) {
  nationalOverview(period: $period) {
    totalActors
    totalVehicles
    totalSales
    totalRevenue
    complianceRate
    alertsOpen
  }
  salesByRegion(period: $period) {
    region
    salesCount
    revenue
    trend
  }
  complianceByActorType {
    actorType
    averageScore
    criticalCount
  }
  topActors(limit: 10, orderBy: REVENUE) {
    id
    companyName
    revenue
    complianceScore
    vehicleCount
  }
}
```

**Variables** :

```json
{
  "period": {
    "dateFrom": "2024-01-01",
    "dateTo": "2024-06-30"
  },
  "region": "CENTRE"
}
```

[Image: Interface GraphQL Playground avec requete analytics]

### 7.3 Authentification GraphQL

L'API GraphQL utilise le meme mecanisme d'authentification Bearer JWT que l'API REST. Le token est transmis dans le header `Authorization`.

---

## Annexes

### A. Postman / Insomnia

Une collection Postman complete est disponible a l'adresse : `https://api.ireg-moto.bf/postman-collection.json`

### B. SDK Clients

| Langage | Package | Installation |
|---------|---------|--------------|
| TypeScript | `@ireg-moto/sdk-ts` | `npm install @ireg-moto/sdk-ts` |
| Python | `ireg-moto-python` | `pip install ireg-moto-python` |
| PHP | `ireg-moto-php` | `composer require ireg-moto/php-sdk` |

### C. Changelog API

| Version | Date | Changements |
|---------|------|-------------|
| 1.0.0 | 2024-07-01 | Version initiale — tous les modules A-H |

---

> **Support API** : tech@ireg-moto.bf | **Statut API** : https://status.ireg-moto.bf
