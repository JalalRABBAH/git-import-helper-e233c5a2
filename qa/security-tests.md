# Tests de Securite — iReg Moto BF
## Audit Complet de Securite: Auth, RBAC, Injection, Cryptographie, Audit Trail

---

| Attribut | Valeur |
|---|---|
| Version | 1.0 |
| Date | 2025-06-09 |
| Total cas de test | 40 |
| Standard de reference | OWASP Top 10 2021, ISO 27001, RGPD/BF |

---

## S.1 — Authentification JWT/MFA [6 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| SEC-01 | Auth | Authentification JWT valide | Utilisateur "admin@ireg.bf" avec mot de passe correct | 1. POST /api/v1/auth/login {email, password} 2. Verifier la reponse | Token JWT genere avec: sub (user_id), role, iat, exp (24h), signature valide (RS256), refresh token genere | Critique |
| SEC-02 | Auth | Authentification avec mot de passe incorrect | Utilisateur existant | 1. POST /api/v1/auth/login {email, password_incorrect} 2. Repeter 3 fois 3. Verifier | Reponse 401 Unauthorized, message generique "Identifiants invalides", compte non bloque apres 3 tentatives | Haute |
| SEC-03 | Auth | Blocage compte apres 5 tentatives echouees | Utilisateur existant | 1. POST login avec mot de passe incorrect (x5) 2. Verifier le statut du compte 3. Tenter un login correct | Apres 5 echecs: compte bloque 30 minutes, message "Compte temporairement bloque — contactez l'administrateur", 6e tentative (correcte) refusee | Critique |
| SEC-04 | Auth | MFA — Activation Google Authenticator | Utilisateur avec authentification standard | 1. Activer MFA dans les parametres 2. Scanner le QR code avec Google Authenticator 3. Saisir le code TOTP 4. Valider | MFA active, backup codes generes (10 codes), message "MFA active avec succes", prochain login necessite TOTP | Critique |
| SEC-05 | Auth | MFA — Login avec code TOTP valide | Utilisateur SEC-04 avec MFA active | 1. POST /api/v1/auth/login (email, password) 2. Recevoir challenge MFA 3. POST /api/v1/auth/mfa {code_totp} 4. Verifier | Token JWT genere uniquement apres TOTP valide, code a usage unique (30s), replay impossible | Critique |
| SEC-06 | Auth | MFA — Login avec code TOTP invalide/expiré | Utilisateur SEC-04 | 1. Login standard 2. Saisir code TOTP invalide "000000" 3. Saisir code TOTP expire (ancien) | Reponse 401, message "Code MFA invalide", 3 tentatives MFA = retour a l'etape login, pas de lockout supplementaire | Haute |

---

## S.2 — RBAC (Controle d'Acces Base sur les Roles) [7 cas]

### Matrice des roles

```
+----------------------------+-----------+----------+-----------+----------+
| Permission                 | SuperAdmin| Admin    | Importateur| Distributeur| Detaillant | Ministere |
+----------------------------+-----------+----------+-----------+----------+
| Enregistrer acteur         | Oui       | Oui      | Non       | Non      | Non       | Oui       |
| Modifier acteur            | Oui       | Oui      | Lui-meme  | Lui-meme | Lui-meme  | Non       |
| Supprimer acteur           | Oui       | Non      | Non       | Non      | Non       | Non       |
| Enregistrer VIN            | Oui       | Oui      | Oui       | Oui      | Oui       | Non       |
| Vendre engin               | Oui       | Oui      | Non       | Oui      | Oui       | Non       |
| Generer rapport            | Oui       | Oui      | Oui       | Oui      | Oui       | Non       |
| Valider rapport            | Oui       | Oui      | Non       | Non      | Non       | Oui       |
| Suspendre agreement        | Oui       | Non      | Non       | Non      | Non       | Oui       |
| Voir vue nationale         | Oui       | Oui      | Non       | Non      | Non       | Oui       |
| Gerer liste noire          | Oui       | Oui      | Non       | Non      | Non       | Oui       |
| Signaler CNTI              | Oui       | Oui      | Non       | Non      | Non       | Oui       |
| Audit trail                | Oui       | Oui      | Lui-meme  | Lui-meme | Lui-meme  | Tous      |
+----------------------------+-----------+----------+-----------+----------+
```

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| SEC-07 | Auth | Acces non autorise — Detaillant tente de suspendre un agreement | Detaillant "MOTO SHOP OUAGA" connecte | 1. Detaillant tente POST /api/v1/agreements/AGR-001/suspend 2. Verifier la reponse | Reponse 403 Forbidden, message "Permission insuffisante — Role DETAILLANT ne peut pas suspendre un agreement", action non enregistree, log d'audit avec flag "Tentative acces non autorise" | Critique |
| SEC-08 | Auth | Acces non autorise — Importateur tente de voir la vue nationale | Importateur connecte | 1. Importateur tente GET /api/v1/ministry/national-dashboard 2. Verifier | Reponse 403 Forbidden, message "Acces reserve au Ministere", log d'audit enregistre | Critique |
| SEC-09 | Auth | Acces autorise — Detaillant modifie sa propre fiche | Detaillant connecte | 1. Detaillant PATCH /api/v1/actors/AGR-DET-2026-045 2. Modifier son adresse 3. Verifier | Modification acceptee (200 OK), fiche mise a jour, log d'audit enregistre | Haute |
| SEC-10 | Auth | Acces non autorise — Detaillant tente de modifier un autre detaillant | Detaillant A connecte | 1. Detaillant A PATCH /api/v1/actors/AGR-DET-2026-046 (Detaillant B) 2. Verifier | Reponse 403 Forbidden, message "Vous ne pouvez modifier que votre propre fiche", log d'audit | Critique |
| SEC-11 | Auth | Portee ministerielle — Admin ministere voit tous les rapports | Admin ministere connecte | 1. GET /api/v1/reports 2. Verifier la reponse | Liste de tous les rapports de tous les operateurs accessible, filtrage par operateur possible | Haute |
| SEC-12 | Auth | Portee operateur — Importateur ne voit que ses rapports | Importateur connecte | 1. GET /api/v1/reports 2. Verifier | Liste des rapports de l'importateur uniquement, requete SQL filtree par operateur_id | Haute |
| SEC-13 | Auth | Elevation de privilege (tentative) | Utilisateur standard | 1. Tenter de modifier le JWT pour changer le role "DETAILLANT" -> "ADMIN" 2. Soumettre la requete | Signature JWT invalide, reponse 401, message "Token invalide", log d'audit avec flag "Tentative elevation privilege" | Critique |

---

## S.3 — Injection SQL [4 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| SEC-14 | ALL | Injection SQL — champ recherche acteur | Recherche acteur accessible | 1. GET /api/v1/actors?search="' OR '1'='1" 2. Verifier | Requete parametree, aucune fuite de donnees, resultat vide (pas de match), log d'audit | Critique |
| SEC-15 | ALL | Injection SQL — champ ID (path traversal SQL) | Endpoint avec ID numerique | 1. GET /api/v1/actors/1 OR 1=1 2. Verifier | Parametre ID type-check (integer), reponse 404 si ID invalide, pas d'injection possible | Critique |
| SEC-16 | ALL | Injection SQL — UNION attack | Endpoint de recherche | 1. GET /api/v1/actors?search="' UNION SELECT username,password FROM users --" 2. Verifier | Requete parametree, resultat vide, pas d'union possible, ORM utilise (pas de SQL brut) | Critique |
| SEC-17 | ALL | Injection SQL — Time-based blind | Endpoint lent | 1. GET /api/v1/actors?search="' AND pg_sleep(10) --" 2. Mesurer le temps | Temps de reponse normal (< 200ms), timeout cote serveur, pas de sleep execute, log d'alerte | Critique |

---

## S.4 — XSS (Cross-Site Scripting) [4 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| SEC-18 | C | XSS Reflected — champ nom client | Formulaire client | 1. Saisir nom: "<script>alert('XSS')</script>" 2. Enregistrer 3. Consulter l'affichage | Script NON execute, texte affiche litteralement, balises echappees (&lt;script&gt;), Content Security Policy appliquee | Critique |
| SEC-19 | C | XSS Stored — commentaire dans fiche client | Fiche client editable | 1. Ajouter commentaire: "<img src=x onerror=alert('XSS')>" 2. Enregistrer 3. Un autre utilisateur consulte la fiche | Image cassee affichee, pas d'alerte, onerror non execute, balises HTML nettoyees (DOMPurify) | Critique |
| SEC-20 | E | XSS dans rapport PDF genere | Rapport avec donnees utilisateur | 1. Generer un rapport avec donnees contenant du JS 2. Ouvrir le PDF | PDF sans code executable, contenu nettoye, balises affichees comme texte | Haute |
| SEC-21 | ALL | XSS DOM-based — manipulation URL | Application SPA | 1. Modifier l'URL: /dashboard?tab=<script>alert(1)</script> 2. Acceder a l'URL | Script non execute, parametre URL nettoye avant insertion dans le DOM, router securise | Haute |

---

## S.5 — CSRF (Cross-Site Request Forgery) [3 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| SEC-22 | ALL | Protection CSRF — token valide | Utilisateur authentifie | 1. Effectuer une action POST avec header X-CSRF-Token valide 2. Verifier | Action executee avec succes (200 OK), token CSRF valide | Haute |
| SEC-23 | ALL | Protection CSRF — token manquant | Utilisateur authentifie | 1. Effectuer une action POST sans header X-CSRF-Token 2. Verifier | Reponse 403 Forbidden, message "Token CSRF manquant", action non executee | Critique |
| SEC-24 | ALL | Protection CSRF — token invalide | Utilisateur authentifie | 1. Effectuer une action POST avec X-CSRF-Token="INVALID" 2. Verifier | Reponse 403 Forbidden, message "Token CSRF invalide", action non executee | Critique |

---

## S.6 — Upload de Fichiers Malveillants [4 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| SEC-25 | A | Upload fichier PDF valide | Formulaire d'enregistrement acteur | 1. Uploader un PDF valide (extrait RCCM) 2. Verifier le traitement | Fichier accepte, scan antivirus negatif, stockage securise (hors webroot), nom fichier renomme (UUID) | Haute |
| SEC-26 | A | Upload fichier .exe déguisé en PDF | Formulaire upload | 1. Renommer virus.exe en document.pdf.exe 2. Uploader 3. Verifier | Fichier REJETE, message "Type de fichier non autorise", scan antivirus positif, log d'alerte securite | Critique |
| SEC-27 | A | Upload fichier PDF avec payload JS malveillant | Formulaire upload | 1. Uploader un PDF avec JavaScript embarque (alerte) 2. Verifier | Fichier accepte (PDF valide) MAIS JavaScript desactive cote serveur, pas d'execution, scan contenu effectue | Haute |
| SEC-28 | A | Upload image avec code PHP embarque (polyglot) | Formulaire upload | 1. Creer un fichier image valide avec code PHP embarque 2. Uploader 3. Tenter d'executer via URL | Fichier stocke hors webroot, pas d'execution possible, tentative d'acces direct = 404, log d'alerte | Critique |

---

## S.7 — Brute Force et Rate Limiting [4 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| SEC-29 | Auth | Rate limiting — login (10 req/minute) | Endpoint /login | 1. Effectuer 15 tentatives de login en 60 secondes 2. Mesurer les reponses | Tentatives 1-10: 200/401 normales, Tentatives 11-15: 429 Too Many Requests, header Retry-After present | Critique |
| SEC-30 | Auth | Rate limiting — API globale (100 req/minute) | Endpoint API quelconque | 1. Effectuer 120 requetes API en 60 secondes 2. Verifier | Requetes 1-100: 200 OK, Requetes 101-120: 429 Too Many Requests, pas de blocage definitif (sliding window) | Haute |
| SEC-31 | E | Rate limiting — generation rapport (5 req/heure) | Endpoint /reports/generate | 1. Lancer 10 generations de rapport en 1 heure 2. Verifier | Generations 1-5: 200 OK, Generations 6-10: 429 Too Many Requests, message "Limite de generation atteinte — reessayez dans X minutes" | Haute |
| SEC-32 | ALL | Rate limiting par IP (1000 req/heure) | Protection DDoS | 1. Simuler 1500 requetes depuis la meme IP en 1 heure 2. Verifier | Requetes 1-1000: normales, Requetes 1001-1500: 429 ou blocage WAF, log d'alerte | Haute |

---

## S.8 — Audit Trail Immuable [4 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| SEC-33 | ALL | Enregistrement audit trail — creation acteur | Aucun | 1. Creer un acteur 2. Consulter le journal d'audit | Entree d'audit: timestamp, utilisateur_id, action "CREATE", entite "Actor", id, IP, user_agent, hash SHA-256 de l'entree | Critique |
| SEC-34 | ALL | Enregistrement audit trail — modification prix | Prix existant | 1. Modifier un prix de vente 2. Consulter l'audit | Entree d'audit avec: ancienne valeur, nouvelle valeur, motif de modification, utilisateur, timestamp, hash | Critique |
| SEC-35 | ALL | Immutabilite de l'audit trail | Audit existant | 1. Tenter de modifier une entree d'audit directement en base 2. Tenter de supprimer une entree | Modification/suppression refusee au niveau base (trigger PostgreSQL), droits INSERT uniquement, pas de UPDATE/DELETE sur table audit | Critique |
| SEC-36 | ALL | Verification chaine de hash (integrite) | Audit trail avec plusieurs entrees | 1. Verifier que chaque entree contient le hash de l'entree precedente 2. Detecter toute alteration | Chaine de hash verifiable, alteration detectee (hash mismatch), alerte securite en cas d'anomalie | Critique |

---

## S.9 — Cryptographie et Protection des Donnees [4 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| SEC-37 | ALL | Chiffrement des donnees en transit (TLS 1.3) | Communication client-serveur | 1. Analyser la connexion avec Wireshark 2. Verifier le protocole TLS 3. Verifier le cipher suite | TLS 1.3 active, cipher suite: TLS_AES_256_GCM_SHA384, pas de downgrade possible, HSTS active | Critique |
| SEC-38 | C | Chiffrement des donnees sensibles au repos (KYC) | Donnees clients en base | 1. Consulter la base de donnees directement 2. Verifier le chiffrement | CNIB chiffree (AES-256), telephone chiffre, nom non chiffre (recherche necessaire), cle de chiffrement dans HSM/Vault | Critique |
| SEC-39 | Auth | Hashage des mots de passe (Argon2id) | Base utilisateurs | 1. Consulter la table users 2. Verifier le format des mots de passe | Mots de passe hashes avec Argon2id (parame`tres: memory=64MB, iterations=3, parallelism=4), pas de stockage en clair, salt unique par utilisateur | Critique |
| SEC-40 | ALL | Rotation des cles de chiffrement | Systeme en production | 1. Declencher la rotation des cles 2. Verifier le processus | Rotation automatique tous les 90 jours, re-chiffrement des donnees transparent, anciennes cles archivees (pas de perte de donnees) | Haute |

---

## Matrice de couverture OWASP Top 10 2021

```
+-------------------------------+----------+--------------------------------+
| Risque OWASP                  | Cas test | Status                         |
+-------------------------------+----------+--------------------------------+
| A01: Broken Access Control    | SEC-07/13| Couvert (7 cas)                |
| A02: Cryptographic Failures   | SEC-37/40| Couvert (4 cas)                |
| A03: Injection                | SEC-14/17| Couvert (4 cas)                |
| A04: Insecure Design          | SEC-33/36| Couvert (audit trail)          |
| A05: Security Misconfiguration| SEC-41*  | A verifier via scan            |
| A06: Vulnerable Components    | SEC-42*  | A verifier via scan SCA        |
| A07: Auth Failures            | SEC-01/06| Couvert (6 cas)                |
| A08: Data Integrity Failures  | SEC-35/36| Couvert (audit immuable)       |
| A09: Logging Failures         | SEC-33/36| Couvert (audit trail)          |
| A10: SSRF                     | SEC-43*  | A tester via scan              |
+-------------------------------+----------+--------------------------------+
* SEC-41, SEC-42, SEC-43: Tests a effectuer via outils automatises (Nessus, OWASP ZAP, Snyk)
```

---

*Document genere par l'equipe QA Reglementaire iReg Moto BF — 40 cas de test securite*
