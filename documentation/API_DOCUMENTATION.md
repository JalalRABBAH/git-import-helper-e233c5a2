# Documentation API — iReg Moto BF

**Version : 1.0.0** | **Base URL : `https://api.ireg-moto-bf.gov.bf`** | **Format : JSON**

Cette documentation decrit l'ensemble des endpoints de l'API REST iReg Moto BF, l'authentification, les codes d'erreur, le rate limiting et les webhooks.

---

## Table des matieres

1. [Authentification](#1-authentification)
2. [Endpoints par module](#2-endpoints-par-module)
3. [Codes d'erreur](#3-codes-derreur)
4. [Rate Limiting](#4-rate-limiting)
5. [Webhooks](#5-webhooks)

---

## 1. Authentification

L'API utilise une authentification a deux facteurs (JWT + MFA TOTP) avec controle d'acces base sur les roles (RBAC).

### 1.1 Flux d'authentification complet

```
Client                                     API iReg Moto BF
  |                                                |
  |-- POST /auth/login ---------------------------->|
  |    { email, password }                         |
  |                                                |
  |<------------------ 200 OK ----------------------|
  |    { requiresMfa: true, tempToken: "..." }     |
  |                                                |
  |-- POST /auth/mfa/verify ---------------------->|
  |    { tempToken, mfaCode }                      |
  |                                                |
  |<------------------ 200 OK ----------------------|
  |    { accessToken, refreshToken, user: {...} }  |
  |                                                |
  |-- GET /api/v1/stock (Header: Authorization ---->|
  |    Bearer eyJhbGciOiJIUzI1NiIs...)             |
  |                                                |
  |<------------------ 200 OK ----------------------|
  |    { data: [...] }                             |
```

### 1.2 Login — Premier facteur

```http
POST /api/v1/auth/login
Content-Type: application/json
```

**Corps de la requete** :

```json
{
  "email": "importateur@suzuki-bf.bf",
  "password": "Test@123456"
}
```

**Reponses** :

**200 OK — MFA requis** :
```json
{
  "success": true,
  "requiresMfa": true,
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.temp",
  "expiresIn": 300,
  "message": "Veuillez saisir votre code MFA"
}
```

**200 OK — Sans MFA (compte de service)** :
```json
{
  "success": true,
  "requiresMfa": false,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh",
  "expiresIn": 900,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "importateur@suzuki-bf.bf",
    "firstName": "Amadou",
    "lastName": "KONE",
    "role": "IMPORTER",
    "tenantId": "tenant-suzuki-bf",
    "permissions": ["stock.read", "stock.write", "sale.create", "report.read"]
  }
}
```

**401 Unauthorized** :
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Email ou mot de passe incorrect",
    "details": null
  }
}
```

**403 Forbidden — Compte bloque** :
```json
{
  "success": false,
  "error": {
    "code": "AUTH_ACCOUNT_LOCKED",
    "message": "Compte bloque suite a 5 tentatives echouees. Reessayez dans 30 minutes.",
    "lockedUntil": "2026-06-25T16:30:00Z"
  }
}
```

### 1.3 Verification MFA — Second facteur

```http
POST /api/v1/auth/mfa/verify
Content-Type: application/json
```

**Corps de la requete** :

```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.temp",
  "mfaCode": "123456"
}
```

**Reponse 200 OK** :

```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "tokenType": "Bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "importateur@suzuki-bf.bf",
    "firstName": "Amadou",
    "lastName": "KONE",
    "role": "IMPORTER",
    "tenantId": "tenant-suzuki-bf",
    "tenantName": "Suzuki Burkina Faso",
    "permissions": ["stock.read", "stock.write", "sale.create", "client.read", "client.write", "report.read", "report.write", "compliance.read"]
  }
}
```

**Reponse 401 — Code MFA invalide** :

```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_MFA",
    "message": "Code MFA invalide ou expire",
    "remainingAttempts": 2
  }
}
```

### 1.4 Rafraichissement du token

```http
POST /api/v1/auth/refresh
Content-Type: application/json
```

**Corps de la requete** :

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Reponse 200 OK** :

```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new",
  "expiresIn": 900
}
```

### 1.5 Deconnexion

```http
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Corps de la requete** :

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Reponse 200 OK** :

```json
{
  "success": true,
  "message": "Deconnexion reussie"
}
```

### 1.6 Mot de passe oublie

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json
```

```json
{
  "email": "importateur@suzuki-bf.bf"
}
```

**Reponse 200 OK** :

```json
{
  "success": true,
  "message": "Si un compte existe avec cet email, un lien de reinitialisation a ete envoye"
}
```

### 1.7 Reinitialisation du mot de passe

```http
POST /api/v1/auth/reset-password
Content-Type: application/json
```

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NouveauMotDePasse@2026",
  "confirmPassword": "NouveauMotDePasse@2026"
}
```

### 1.8 Configuration MFA (QR Code)

```http
GET /api/v1/auth/mfa/setup
Authorization: Bearer {accessToken}
```

**Reponse 200 OK** :

```json
{
  "success": true,
  "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "secret": "JBSWY3DPEHPK3PXP",
  "backupCodes": [
    "A1B2-C3D4-E5F6",
    "G7H8-I9J0-K1L2",
    "M3N4-O5P6-Q7R8",
    "S9T0-U1V2-W3X4",
    "Y5Z6-A7B8-C9D0",
    "E1F2-G3H4-I5J6",
    "K7L8-M9N0-O1P2",
    "Q3R4-S5T6-U7V8"
  ]
}
```

### 1.9 Headers requis pour les requetes authentifiees

| Header | Valeur | Description |
|---|---|---|
| `Authorization` | `Bearer {accessToken}` | Token JWT d'acces |
| `X-Request-ID` | UUID unique | ID de correlation pour le tracing |
| `X-Tenant-ID` | `tenant-{id}` | ID du tenant (entreprise) — auto-derive du token |
| `Content-Type` | `application/json` | Format du corps |
| `Accept-Language` | `fr` ou `en` | Langue de la reponse |

---

## 2. Endpoints par module

### 2.1 Module Stock — Gestion des stocks

| Methode | Route | Description | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/v1/stock` | Lister les vehicules en stock | JWT | All entreprises |
| `GET` | `/api/v1/stock/{id}` | Detail d'un vehicule | JWT | All entreprises |
| `POST` | `/api/v1/stock` | Ajouter un vehicule | JWT | Importateur, Distributeur, Assembleur |
| `PUT` | `/api/v1/stock/{id}` | Modifier un vehicule | JWT | Importateur, Distributeur, Assembleur |
| `DELETE` | `/api/v1/stock/{id}` | Supprimer un vehicule | JWT | Admin |
| `POST` | `/api/v1/stock/import-csv` | Importer un lot CSV | JWT | Importateur, Distributeur, Assembleur |
| `POST` | `/api/v1/stock/{id}/qr-code` | Generer un QR code | JWT | Importateur, Distributeur, Assembleur |
| `GET` | `/api/v1/stock/{id}/history` | Historique du vehicule | JWT | All entreprises |
| `GET` | `/api/v1/stock/stats` | Statistiques de stock | JWT | All entreprises |
| `POST` | `/api/v1/stock/transfer` | Transferer du stock | JWT | Importateur, Distributeur |

#### GET /api/v1/stock

```http
GET /api/v1/stock?page=1&limit=25&status=AVAILABLE&brand=YAMAHA&category=MOTO
Authorization: Bearer {accessToken}
```

**Parametres de requete** :

| Parametre | Type | Obligatoire | Description |
|---|---|---|---|
| `page` | integer | Non | Numero de page (defaut : 1) |
| `limit` | integer | Non | Elements par page (defaut : 25, max : 100) |
| `status` | string | Non | `AVAILABLE`, `RESERVED`, `SOLD`, `IN_TRANSIT` |
| `brand` | string | Non | Filtrer par marque |
| `model` | string | Non | Filtrer par modele |
| `category` | string | Non | `MOTO`, `SCOOTER`, `TRICYCLE` |
| `search` | string | Non | Recherche textuelle (VIN, QR code) |
| `dateFrom` | date | Non | Date d'entree minimum (YYYY-MM-DD) |
| `dateTo` | date | Non | Date d'entree maximum (YYYY-MM-DD) |

**Reponse 200 OK** :

```json
{
  "success": true,
  "data": [
    {
      "id": "veh-001-uuid",
      "vin": "ML8DCRKP0N0001234",
      "qrCode": "IREG-BF-2026-0001234",
      "brand": "YAMAHA",
      "model": "YBR 125",
      "category": "MOTO",
      "engineType": "4_STROKE",
      "displacement": 125,
      "color": "Rouge",
      "year": 2025,
      "countryOfOrigin": "Japon",
      "engineNumber": "ET1234567890",
      "status": "AVAILABLE",
      "entryDate": "2026-03-15T10:30:00Z",
      "certificates": {
        "origin": "https://minio.ireg-moto-bf.gov.bf/documents/cert-origin-001.pdf",
        "conformity": "https://minio.ireg-moto-bf.gov.bf/documents/cert-conformity-001.pdf"
      },
      "createdAt": "2026-03-15T10:30:00Z",
      "updatedAt": "2026-03-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 247,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### POST /api/v1/stock

```http
POST /api/v1/stock
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Corps de la requete** :

```json
{
  "vin": "ML8DCRKP0N0001234",
  "brand": "YAMAHA",
  "model": "YBR 125",
  "category": "MOTO",
  "engineType": "4_STROKE",
  "displacement": 125,
  "color": "Rouge",
  "year": 2025,
  "countryOfOrigin": "Japon",
  "engineNumber": "ET1234567890",
  "documents": {
    "originCertificate": "base64encoded...",
    "purchaseInvoice": "base64encoded...",
    "conformityCertificate": "base64encoded..."
  }
}
```

**Reponse 201 Created** :

```json
{
  "success": true,
  "message": "Vehicule cree avec succes",
  "data": {
    "id": "veh-001-uuid",
    "vin": "ML8DCRKP0N0001234",
    "qrCode": "IREG-BF-2026-0001234",
    "qrCodeImage": "data:image/png;base64,iVBORw0KGgo...",
    "status": "AVAILABLE",
    "createdAt": "2026-06-25T10:00:00Z"
  }
}
```

### 2.2 Module Client — Gestion des clients (KYC)

| Methode | Route | Description | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/v1/clients` | Lister les clients | JWT | All entreprises |
| `GET` | `/api/v1/clients/{id}` | Detail d'un client | JWT | All entreprises |
| `POST` | `/api/v1/clients` | Creer un client (KYC) | JWT | All entreprises |
| `PUT` | `/api/v1/clients/{id}` | Modifier un client | JWT | All entreprises |
| `DELETE` | `/api/v1/clients/{id}` | Supprimer un client | JWT | Admin |
| `GET` | `/api/v1/clients/{id}/purchases` | Achats du client | JWT | All entreprises |
| `GET` | `/api/v1/clients/search` | Recherche avancee | JWT | All entreprises |
| `GET` | `/api/v1/clients/{id}/kyc-status` | Statut KYC | JWT | All entreprises |

#### POST /api/v1/clients

```http
POST /api/v1/clients
Authorization: Bearer {accessToken}
Content-Type: application/json
```

```json
{
  "firstName": "Sophie",
  "lastName": "KABORE",
  "dateOfBirth": "1990-05-15",
  "placeOfBirth": "Ouagadougou, Burkina Faso",
  "nationality": "Burkinabe",
  "gender": "F",
  "identityDocument": {
    "type": "CNIB",
    "number": "B0012345678",
    "issueDate": "2020-01-10",
    "expiryDate": "2025-01-09",
    "issuingAuthority": "CNIB Burkina Faso",
    "frontImage": "base64encoded...",
    "backImage": "base64encoded...",
    "holderPhoto": "base64encoded..."
  },
  "contact": {
    "primaryPhone": "+22670112233",
    "secondaryPhone": "+22671223344",
    "email": "sophie.kabore@email.bf",
    "address": "Rue du Marche, secteur 10",
    "region": "CENTRE",
    "province": "OUAGADOUGOU",
    "profession": "Commercante"
  }
}
```

**Reponse 201 Created** :

```json
{
  "success": true,
  "message": "Client cree avec succes",
  "data": {
    "id": "cli-001-uuid",
    "kycStatus": "COMPLETE",
    "firstName": "Sophie",
    "lastName": "KABORE",
    "createdAt": "2026-06-25T10:00:00Z"
  }
}
```

### 2.3 Module Vente — Enregistrement des ventes

| Methode | Route | Description | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/v1/sales` | Lister les ventes | JWT | All entreprises |
| `GET` | `/api/v1/sales/{id}` | Detail d'une vente | JWT | All entreprises |
| `POST` | `/api/v1/sales` | Creer une vente | JWT | Detallant, Distributeur |
| `GET` | `/api/v1/sales/stats` | Statistiques de ventes | JWT | All entreprises |
| `GET` | `/api/v1/sales/{id}/invoice` | Telecharger la facture PDF | JWT | All entreprises |
| `GET` | `/api/v1/sales/{id}/certificate` | Attestation immatriculation | JWT | All entreprises |

#### POST /api/v1/sales

```http
POST /api/v1/sales
Authorization: Bearer {accessToken}
Content-Type: application/json
```

```json
{
  "vehicleId": "veh-001-uuid",
  "clientId": "cli-001-uuid",
  "saleDate": "2026-06-25",
  "price": 1250000,
  "paymentMethod": "CASH",
  "discount": 0,
  "comments": "Vente standard"
}
```

**Reponse 201 Created** :

```json
{
  "success": true,
  "message": "Vente enregistree avec succes",
  "data": {
    "id": "sale-001-uuid",
    "reference": "VT-2026-001847",
    "vehicle": {
      "vin": "ML8DCRKP0N0001234",
      "brand": "YAMAHA",
      "model": "YBR 125",
      "qrCode": "IREG-BF-2026-0001234"
    },
    "client": {
      "firstName": "Sophie",
      "lastName": "KABORE",
      "identityDocumentNumber": "B0012345678"
    },
    "price": 1250000,
    "totalTTC": 1250000,
    "saleDate": "2026-06-25T10:00:00Z",
    "invoiceUrl": "https://minio.ireg-moto-bf.gov.bf/invoices/VT-2026-001847.pdf",
    "registrationCertificateUrl": "https://minio.ireg-moto-bf.gov.bf/certificates/REG-2026-001847.pdf",
    "createdAt": "2026-06-25T10:00:00Z"
  }
}
```

### 2.4 Module Rapport — Rapports trimestriels

| Methode | Route | Description | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/v1/reports` | Lister les rapports | JWT | All (filtre par tenant) |
| `GET` | `/api/v1/reports/{id}` | Detail d'un rapport | JWT | All |
| `POST` | `/api/v1/reports` | Creer un rapport | JWT | All entreprises |
| `PUT` | `/api/v1/reports/{id}` | Modifier un rapport (brouillon) | JWT | Proprietaire |
| `POST` | `/api/v1/reports/{id}/submit` | Soumettre un rapport | JWT | Proprietaire |
| `POST` | `/api/v1/reports/{id}/validate` | Valider un rapport (autorite) | JWT | Admin Commerce |
| `POST` | `/api/v1/reports/{id}/request-changes` | Demander des modifications | JWT | Admin Commerce |
| `GET` | `/api/v1/reports/pending-validation` | Rapports en attente | JWT | Admin Commerce |

#### POST /api/v1/reports

```http
POST /api/v1/reports
Authorization: Bearer {accessToken}
Content-Type: application/json
```

```json
{
  "year": 2026,
  "quarter": 2,
  "salesSummary": {
    "totalVehicles": 42,
    "totalRevenue": 42500000,
    "byCategory": {
      "MOTO": 30,
      "SCOOTER": 10,
      "TRICYCLE": 2
    },
    "byBrand": {
      "YAMAHA": 20,
      "HONDA": 12,
      "SUZUKI": 8,
      "OTHERS": 2
    }
  },
  "stockSummary": {
    "openingStock": 215,
    "closingStock": 198,
    "transfersReceived": 25
  },
  "incidents": [
    {
      "date": "2026-04-15",
      "type": "DELAYED_DELIVERY",
      "description": "Retard de livraison fournisseur",
      "status": "RESOLVED"
    },
    {
      "date": "2026-05-02",
      "type": "DEFECTIVE_PART",
      "description": "Piece defectueuse detectee",
      "status": "IN_PROGRESS"
    }
  ],
  "correctiveActions": "Changement de fournisseur, renforcement controle qualite",
  "documents": [
    "doc-001-uuid",
    "doc-002-uuid"
  ]
}
```

### 2.5 Module Agrement — Gestion des agrements

| Methode | Route | Description | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/v1/agreements` | Lister les agrements | JWT | Admin Commerce |
| `GET` | `/api/v1/agreements/{id}` | Detail d'un agrement | JWT | Admin Commerce |
| `POST` | `/api/v1/agreements` | Creer un agrement | JWT | Admin Commerce |
| `PUT` | `/api/v1/agreements/{id}` | Modifier un agrement | JWT | Admin Commerce |
| `POST` | `/api/v1/agreements/{id}/suspend` | Suspendre | JWT | Admin Commerce |
| `POST` | `/api/v1/agreements/{id}/revoke` | Revoquer | JWT | Admin Commerce |
| `POST` | `/api/v1/agreements/{id}/renew` | Renouveler | JWT | Admin Commerce |
| `GET` | `/api/v1/agreements/pending` | Demandes en attente | JWT | Admin Commerce |

### 2.6 Module Inspection — Inspections

| Methode | Route | Description | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/v1/inspections` | Lister les inspections | JWT | Inspecteur, Admin |
| `GET` | `/api/v1/inspections/{id}` | Detail d'une inspection | JWT | Inspecteur, Admin |
| `POST` | `/api/v1/inspections` | Planifier une inspection | JWT | Admin Commerce |
| `PUT` | `/api/v1/inspections/{id}` | Modifier | JWT | Admin Commerce |
| `POST` | `/api/v1/inspections/{id}/complete` | Finaliser | JWT | Inspecteur |
| `GET` | `/api/v1/inspections/{id}/report` | Rapport PDF | JWT | Inspecteur, Admin |
| `GET` | `/api/v1/inspections/my-assignments` | Mes inspections | JWT | Inspecteur |

### 2.7 Module Fraude — Detection des fraudes

| Methode | Route | Description | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/v1/fraud/alerts` | Lister les alertes | JWT | Admin, Controleur |
| `GET` | `/api/v1/fraud/alerts/{id}` | Detail d'une alerte | JWT | Admin, Controleur |
| `POST` | `/api/v1/fraud/alerts` | Creer une alerte manuelle | JWT | All autorites |
| `POST` | `/api/v1/fraud/alerts/{id}/assign` | Assigner un investigateur | JWT | Admin |
| `POST` | `/api/v1/fraud/alerts/{id}/close` | Cloturer | JWT | Admin, Controleur |
| `GET` | `/api/v1/fraud/stats` | Statistiques de fraude | JWT | Admin |

### 2.8 Module Conformite — Scoring

| Methode | Route | Description | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/v1/compliance/score` | Obtenir son scoring | JWT | All entreprises |
| `GET` | `/api/v1/compliance/criteria` | Liste des criteres | JWT | All |
| `GET` | `/api/v1/compliance/history` | Historique du scoring | JWT | All entreprises |
| `GET` | `/api/v1/compliance/national` | Scoring national agregé | JWT | Admin |
| `GET` | `/api/v1/compliance/action-plan` | Plan d'action | JWT | All entreprises |

#### GET /api/v1/compliance/score

```http
GET /api/v1/compliance/score
Authorization: Bearer {accessToken}
```

**Reponse 200 OK** :

```json
{
  "success": true,
  "data": {
    "totalScore": 142,
    "maxScore": 150,
    "percentage": 94.7,
    "status": "COMPLIANT",
    "criteria": [
      {
        "id": "AGR-001",
        "name": "Agrement en cours de validite",
        "score": 15,
        "maxScore": 15,
        "weight": 1.0,
        "status": "PASSED",
        "recommendation": null
      },
      {
        "id": "STK-001",
        "name": "Enregistrement des stocks",
        "score": 12,
        "maxScore": 15,
        "weight": 1.0,
        "status": "WARNING",
        "recommendation": "3 vehicules non enregistres avec VIN complet"
      }
    ],
    "evaluatedAt": "2026-06-25T00:00:00Z",
    "nextEvaluation": "2026-07-25T00:00:00Z"
  }
}
```

### 2.9 Module Dashboard — KPIs et statistiques

| Methode | Route | Description | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/v1/dashboard/enterprise` | KPIs entreprise | JWT | All entreprises |
| `GET` | `/api/v1/dashboard/national` | KPIs nationaux | JWT | Admin |
| `GET` | `/api/v1/dashboard/regional` | KPIs par region | JWT | Admin |
| `GET` | `/api/v1/dashboard/alerts` | Alertes actives | JWT | All |
| `GET` | `/api/v1/dashboard/sales-trend` | Tendance des ventes | JWT | All |

#### GET /api/v1/dashboard/national

```http
GET /api/v1/dashboard/national?month=2026-06&region=ALL
Authorization: Bearer {accessToken}
```

**Reponse 200 OK** :

```json
{
  "success": true,
  "data": {
    "period": "2026-06",
    "region": "ALL",
    "agreedCompanies": 847,
    "newCompaniesThisMonth": 23,
    "totalSales": 12847,
    "salesGrowth": 8.2,
    "averageCompliance": 87.3,
    "vehiclesInCirculation": 284521,
    "pendingReports": 47,
    "activeFraudAlerts": 12,
    "salesByBrand": [
      { "brand": "YAMAHA", "count": 4521, "percentage": 35.2 },
      { "brand": "HONDA", "count": 3847, "percentage": 29.9 },
      { "brand": "SUZUKI", "count": 2134, "percentage": 16.6 },
      { "brand": "TVS", "count": 987, "percentage": 7.7 },
      { "brand": "AUTRES", "count": 358, "percentage": 2.8 }
    ],
    "salesByRegion": [
      { "region": "CENTRE", "count": 4521 },
      { "region": "HAUTS_BASSINS", "count": 2847 },
      { "region": "BOUCLE_DU_MOUHOUN", "count": 1876 }
    ],
    "monthlyTrend": [
      { "month": "2026-01", "sales": 10234 },
      { "month": "2026-02", "sales": 10876 },
      { "month": "2026-03", "sales": 11543 },
      { "month": "2026-04", "sales": 11987 },
      { "month": "2026-05", "sales": 12456 },
      { "month": "2026-06", "sales": 12847 }
    ]
  }
}
```

### 2.10 Module Regulation — Textes reglementaires

| Methode | Route | Description | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/v1/regulations` | Lister les textes | JWT | All |
| `GET` | `/api/v1/regulations/{id}` | Detail d'un texte | JWT | All |
| `POST` | `/api/v1/regulations` | Publier un texte | JWT | Admin Commerce |
| `PUT` | `/api/v1/regulations/{id}` | Modifier | JWT | Admin Commerce |
| `DELETE` | `/api/v1/regulations/{id}` | Supprimer | JWT | Super Admin |

### 2.11 Module Prohibition — Interdictions (blacklist)

| Methode | Route | Description | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/v1/prohibitions` | Lister les interdictions | JWT | All |
| `GET` | `/api/v1/prohibitions/{id}` | Detail | JWT | All |
| `POST` | `/api/v1/prohibitions` | Creer une interdiction | JWT | Admin Commerce |
| `PUT` | `/api/v1/prohibitions/{id}` | Modifier | JWT | Admin Commerce |
| `POST` | `/api/v1/prohibitions/{id}/lift` | Lever | JWT | Admin Commerce |
| `GET` | `/api/v1/prohibitions/check` | Verifier si un vehicule est interdit | JWT | All |

#### GET /api/v1/prohibitions/check

```http
GET /api/v1/prohibitions/check?vin=ML8DCRKP0N0001234&brand=YAMAHA&model=YBR%20125
Authorization: Bearer {accessToken}
```

**Reponse 200 OK — Vehicule autorise** :

```json
{
  "success": true,
  "data": {
    "isProhibited": false,
    "vehicle": {
      "vin": "ML8DCRKP0N0001234",
      "brand": "YAMAHA",
      "model": "YBR 125"
    },
    "checkedAt": "2026-06-25T10:00:00Z"
  }
}
```

**Reponse 200 OK — Vehicule interdit** :

```json
{
  "success": true,
  "data": {
    "isProhibited": true,
    "prohibition": {
      "id": "prhb-001-uuid",
      "reference": "INT-2026-0015",
      "type": "MODEL",
      "object": "YAMAHA FAKE-125",
      "reason": "Contrefaçon detectee — vehicule non conforme aux normes de securite",
      "effectiveDate": "2026-05-01",
      "regulatoryReference": "Arrete 05/06/2026, Article 12",
      "lifted": false
    },
    "checkedAt": "2026-06-25T10:00:00Z"
  }
}
```

### 2.12 Module Utilisateur — Gestion des utilisateurs

| Methode | Route | Description | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/v1/users` | Lister les utilisateurs | JWT | Admin tenant |
| `GET` | `/api/v1/users/{id}` | Detail | JWT | Admin tenant |
| `POST` | `/api/v1/users` | Creer un utilisateur | JWT | Admin tenant |
| `PUT` | `/api/v1/users/{id}` | Modifier | JWT | Admin tenant |
| `DELETE` | `/api/v1/users/{id}` | Supprimer | JWT | Admin tenant |
| `POST` | `/api/v1/users/{id}/reset-mfa` | Reset MFA | JWT | Super Admin |
| `POST` | `/api/v1/users/{id}/toggle-active` | Activer/desactiver | JWT | Admin tenant |

---

## 3. Codes d'erreur

L'API utilise un format d'erreur standardise avec un code machine-readable et un message comprehensible.

### Format d'erreur standard

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description lisible de l'erreur",
    "details": {
      "field": "nom_du_champ",
      "issue": "description_du_probleme"
    },
    "timestamp": "2026-06-25T10:00:00Z",
    "requestId": "req-uuid-1234"
  }
}
```

### Codes d'erreur par categorie

#### Authentification (AUTH_*)

| Code | Statut HTTP | Description |
|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | 401 | Email ou mot de passe incorrect |
| `AUTH_INVALID_MFA` | 401 | Code MFA invalide ou expire |
| `AUTH_MFA_REQUIRED` | 403 | Authentification MFA obligatoire |
| `AUTH_TOKEN_EXPIRED` | 401 | Token JWT expire |
| `AUTH_TOKEN_INVALID` | 401 | Token JWT invalide ou altere |
| `AUTH_REFRESH_EXPIRED` | 401 | Refresh token expire |
| `AUTH_ACCOUNT_LOCKED` | 403 | Compte bloque apres tentatives echouees |
| `AUTH_ACCOUNT_DISABLED` | 403 | Compte desactive |
| `AUTH_INSUFFICIENT_PERMISSIONS` | 403 | Permissions insuffisantes |
| `AUTH_INVALID_TENANT` | 403 | Tenant non autorise |

#### Validation (VAL_*)

| Code | Statut HTTP | Description |
|---|---|---|
| `VAL_INVALID_INPUT` | 400 | Donnees d'entree invalides |
| `VAL_MISSING_FIELD` | 400 | Champ obligatoire manquant |
| `VAL_INVALID_FORMAT` | 400 | Format de donnee incorrect |
| `VAL_INVALID_DATE` | 400 | Date invalide ou incoherente |
| `VAL_INVALID_VIN` | 400 | VIN invalide (17 caracteres requis) |
| `VAL_DUPLICATE_VIN` | 409 | VIN deja existant en base |
| `VAL_INVALID_PHONE` | 400 | Format de telephone invalide |
| `VAL_INVALID_EMAIL` | 400 | Format d'email invalide |
| `VAL_FILE_TOO_LARGE` | 400 | Fichier depasse la taille maximale (10 Mo) |
| `VAL_INVALID_FILE_TYPE` | 400 | Type de fichier non accepte |

#### Ressource (RES_*)

| Code | Statut HTTP | Description |
|---|---|---|
| `RES_NOT_FOUND` | 404 | Ressource non trouvee |
| `RES_ALREADY_EXISTS` | 409 | Ressource deja existante |
| `RES_CONFLICT` | 409 | Conflit d'etat |
| `RES_DELETED` | 410 | Ressource supprimee |
| `RES_FORBIDDEN` | 403 | Acces a la ressource refuse |

#### Metier (BUS_*)

| Code | Statut HTTP | Description |
|---|---|---|
| `BUS_VEHICLE_SOLD` | 409 | Vehicule deja vendu |
| `BUS_VEHICLE_RESERVED` | 409 | Vehicule reserve |
| `BUS_CLIENT_KYC_INCOMPLETE` | 422 | KYC client incomplet |
| `BUS_SALE_CANCELLED` | 409 | Vente annulee, operation impossible |
| `BUS_REPORT_ALREADY_SUBMITTED` | 409 | Rapport deja soumis |
| `BUS_REPORT_DEADLINE_PASSED` | 422 | Date limite de soumission depassee |
| `BUS_AGREEMENT_EXPIRED` | 403 | Agrement expire |
| `BUS_AGREEMENT_SUSPENDED` | 403 | Agrement suspendu |
| `BUS_PROHIBITED_VEHICLE` | 422 | Vehicule interdit a la vente |
| `BUS_COMPLIANCE_TOO_LOW` | 422 | Score de conformite insuffisant |
| `BUS_INSPECTION_ALREADY_SCHEDULED` | 409 | Inspection deja planifiee |

#### Systeme (SYS_*)

| Code | Statut HTTP | Description |
|---|---|---|
| `SYS_INTERNAL_ERROR` | 500 | Erreur interne du serveur |
| `SYS_DATABASE_ERROR` | 500 | Erreur de base de donnees |
| `SYS_SERVICE_UNAVAILABLE` | 503 | Service temporairement indisponible |
| `SYS_TIMEOUT` | 504 | Delai de reponse depasse |
| `SYS_RATE_LIMITED` | 429 | Trop de requetes (rate limiting) |

---

## 4. Rate Limiting

L'API implemente un rate limiting par tier pour proteger la plateforme contre les abus.

### Limites par tier

| Tier | Requetes/minute | Requetes/heure | Requetes/jour | Authentification |
|---|---|---|---|---|
| **Tier 1** — Entreprises standard | 100 | 5 000 | 50 000 | JWT + MFA |
| **Tier 2** — Autorites | 200 | 10 000 | 100 000 | JWT + MFA |
| **Tier 3** — Comptes de service / Integrations | 500 | 25 000 | 250 000 | JWT (API Key) |
| **Tier 4** — Super Admin | 300 | 15 000 | 150 000 | JWT + MFA |

### Headers de rate limiting

Chaque reponse inclut les headers suivants :

| Header | Description |
|---|---|
| `X-RateLimit-Limit` | Limite de requetes pour la fenetre courante |
| `X-RateLimit-Remaining` | Requetes restantes dans la fenetre |
| `X-RateLimit-Reset` | Timestamp (Unix) de reinitialisation du compteur |
| `X-RateLimit-Retry-After` | Secondes a attendre (present uniquement en 429) |

### Reponse 429 Too Many Requests

```json
{
  "success": false,
  "error": {
    "code": "SYS_RATE_LIMITED",
    "message": "Trop de requetes. Veuillez patienter 45 secondes.",
    "retryAfter": 45,
    "limit": 100,
    "window": "60s"
  }
}
```

### Endpoints avec limites specifiques

| Endpoint | Limite specifique | Description |
|---|---|---|
| `POST /auth/login` | 5 req / 15 min | Protection contre le brute force |
| `POST /auth/mfa/verify` | 3 req / 5 min | Protection contre le brute force MFA |
| `POST /auth/forgot-password` | 3 req / heure | Limitation des demandes de reset |
| `POST /stock/import-csv` | 1 req / 2 min | Imports lourds |
| `GET /dashboard/national` | 30 req / minute | Donnees agregées couteuses |

---

## 5. Webhooks

Les webhooks permettent de recevoir des notifications en temps reel lors d'evenements importants sur la plateforme.

### 5.1 Configuration des webhooks

Les webhooks sont configures dans l'interface d'administration ou via l'API :

```http
POST /api/v1/webhooks
Authorization: Bearer {accessToken}
Content-Type: application/json
```

```json
{
  "url": "https://mon-systeme.bf/webhook/ireg-moto",
  "events": ["sale.created", "stock.updated", "report.submitted"],
  "secret": "whsec_votre_secret_de_signature",
  "active": true,
  "description": "Integration ERP interne"
}
```

### 5.2 Evenements disponibles

| Evenement | Description | Payload |
|---|---|---|
| `sale.created` | Nouvelle vente enregistree | Vente complete avec vehicule et client |
| `sale.cancelled` | Vente annulee | ID de la vente et motif |
| `stock.created` | Vehicule ajoute au stock | Vehicule avec QR code |
| `stock.updated` | Vehicule modifie | Champs modifies |
| `stock.transferred` | Transfert de stock effectue | Details du transfert |
| `client.created` | Nouveau client KYC | Fiche client complete |
| `report.submitted` | Rapport trimestriel soumis | Resume du rapport |
| `report.validated` | Rapport valide par autorite | ID rapport et commentaire |
| `agreement.approved` | Agrement approuve | Details de l'agrement |
| `agreement.suspended` | Agrement suspendu | Motif et duree |
| `agreement.revoked` | Agrement revoque | Motif et reference |
| `inspection.scheduled` | Inspection planifiee | Date, entreprise, inspecteur |
| `inspection.completed` | Inspection terminee | Rapport et score |
| `fraud.alert.created` | Alerte de fraude creee | Details de l'alerte |
| `compliance.score.updated` | Scoring mis a jour | Nouveau score et ecarts |
| `prohibition.created` | Interdiction publiee | Details de l'interdiction |
| `user.created` | Utilisateur cree | Informations de l'utilisateur |

### 5.3 Format du payload webhook

```json
{
  "event": "sale.created",
  "timestamp": "2026-06-25T10:00:00Z",
  "webhookId": "wh-001-uuid",
  "data": {
    "id": "sale-001-uuid",
    "reference": "VT-2026-001847",
    "vehicle": {
      "vin": "ML8DCRKP0N0001234",
      "brand": "YAMAHA",
      "model": "YBR 125"
    },
    "client": {
      "id": "cli-001-uuid",
      "firstName": "Sophie",
      "lastName": "KABORE"
    },
    "price": 1250000,
    "saleDate": "2026-06-25T10:00:00Z",
    "tenantId": "tenant-suzuki-bf"
  }
}
```

### 5.4 Securite des webhooks

Chaque webhook est signe avec un secret partage pour verifier l'authenticite :

**Header de signature** :
```
X-Webhook-Signature: sha256=5d41402abc4b2a76b9719d911017c592
```

**Verification de la signature** (exemple Node.js) :
```javascript
const crypto = require('crypto');

const secret = 'whsec_votre_secret_de_signature';
const payload = JSON.stringify(req.body);
const signature = req.headers['x-webhook-signature'];

const expected = 'sha256=' + crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (signature !== expected) {
  throw new Error('Signature webhook invalide');
}
```

### 5.5 Garanties de livraison

| Garantie | Description |
|---|---|
| **Tentatives de retry** | 5 tentatives en cas d'echec (delais : 1s, 5s, 25s, 125s, 625s) |
| **Timeout** | 10 secondes pour la reponse du endpoint |
| **Ordre** | Les evenements sont envoyes dans l'ordre chronologique |
| **Idempotence** | Chaque webhook inclut un `webhookId` unique pour eviter les doublons |

### 5.6 Reponses attendues

Votre endpoint webhook doit repondre avec :

| Code HTTP | Signification |
|---|---|
| `2xx` | Succes — Le webhook est marque comme livre |
| `4xx` | Erreur client — Le webhook est marque comme echec permanent |
| `5xx` | Erreur serveur — Les retries seront effectues |

### 5.7 Logs des webhooks

Consultez les logs de livraison des webhooks :

```http
GET /api/v1/webhooks/{webhookId}/logs
Authorization: Bearer {accessToken}
```

```json
{
  "success": true,
  "data": [
    {
      "event": "sale.created",
      "status": "DELIVERED",
      "httpStatus": 200,
      "responseTime": 245,
      "deliveredAt": "2026-06-25T10:00:01Z",
      "attempts": 1
    },
    {
      "event": "report.submitted",
      "status": "FAILED",
      "httpStatus": 500,
      "responseTime": 10000,
      "deliveredAt": null,
      "attempts": 5,
      "lastError": "Timeout"
    }
  ]
}
```

---

## Annexes

### A. Swagger UI

La documentation interactive Swagger est accessible a l'URL :

```
https://api.ireg-moto-bf.gov.bf/docs
```

Elle permet d'explorer tous les endpoints, de voir les schemas de requetes/reponses, et de tester les API directement depuis le navigateur.

### B. Versions de l'API

| Version | Statut | Base URL |
|---|---|---|
| `v1` | Stable | `https://api.ireg-moto-bf.gov.bf/api/v1` |
| `v2` | En developpement | — |

### C. Changelog

| Date | Version | Changements |
|---|---|---|
| 2026-01-15 | 1.0.0 | Version initiale — Tous modules operationnels |
| 2026-03-20 | 1.0.1 | Correction rate limiting, ajout endpoint `prohibitions/check` |
| 2026-05-10 | 1.0.2 | Ajout webhooks `compliance.score.updated` et `prohibition.created` |
| 2026-06-01 | 1.1.0 | Nouveau endpoint `dashboard/regional`, amelioration performances |

### D. Contact API

Pour toute question relative a l'API :

- **Email technique** : api-support@ireg-moto-bf.gov.bf
- **Documentation** : https://api.ireg-moto-bf.gov.bf/docs
- **Status page** : https://status.ireg-moto-bf.gov.bf
