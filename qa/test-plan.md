# Plan de Test Global — iReg Moto BF
## Plateforme de Regulation des Engins Motorises du Burkina Faso

---

| Attribut | Valeur |
|---|---|
| Version | 1.0 |
| Date | 2025-06-09 |
| Responsable | Equipe QA Reglementaire iReg Moto BF |
| Referentiel | Arrete ministeriel 05/06/2026 |
| Niveau criticite | Critique (systeme reglementaire d'Etat) |

---

## 1. Objectifs des Tests

### 1.1 Objectifs principaux

L'objectif principal est de valider que la plateforme **iReg Moto BF** repond exactement aux exigences de l'arrete ministeriel 05/06/2026 et garantit la conformite de l'ensemble des acteurs de la chaine de distribution des engins motorises au Burkina Faso.

### 1.2 Objectifs detailles

| # | Objectif | Description | Mesure de succes |
|---|---|---|---|
| O1 | Conformite reglementaire | Valider que chaque fonctionnalite respecte les dispositions de l'arrete | 100% des cas reglementaires passes |
| O2 | Integrite des donnees | Garantir l'exactitude et la tracabilite de toutes les donnees reglementaires | Zero erreur de donnees critiques |
| O3 | Disponibilite | Assurer une disponibilite de 99.9% pour les operations commerciales | SLA respecte sur 30 jours |
| O4 | Performance | Valider les performances sous charge nominale et de pointe | Latences < seuils definis |
| O5 | Securite | Proteger les donnees sensibles et prevenir les acces non autorises | Zero vulnerabilite critique |
| O6 | Cohabitation | Valider l'interoperabilite avec le portail du ministere | Echanges XML valides |
| O7 | Resilience | Garantir la continuite d'activite en cas de defaillance | RPO < 1h, RTO < 4h |

---

## 2. Perimetre des Tests

### 2.1 Modules a tester (Modules A - H)

```
+------------------+---------+----------------------------------+-------------+
| Module           | Code    | Description                      | Complexite  |
+------------------+---------+----------------------------------+-------------+
| Acteurs Economiques | A    | Gestion des importateurs,        | Elevee      |
|                  |         | distributeurs, detaillants       |             |
+------------------+---------+----------------------------------+-------------+
| Stocks           | B       | Suivi des mouvements de stock,   | Elevee      |
|                  |         | inventaires, alertes             |             |
+------------------+---------+----------------------------------+-------------+
| Clients          | C       | Enregistrement KYC, historique   | Moyenne     |
|                  |         | propriete, liaison acheteur      |             |
+------------------+---------+----------------------------------+-------------+
| Commercial       | D       | Prix, marges, facturation OHADA  | Moyenne     |
+------------------+---------+----------------------------------+-------------+
| Rapportage       | E       | Rapports trimestriels, XML, PDF  | Critique    |
+------------------+---------+----------------------------------+-------------+
| Conformite       | F       | Score conformite, checklists,    | Critique    |
|                  |         | inspection, plan d'action        |             |
+------------------+---------+----------------------------------+-------------+
| Securite (app.)  | G       | Transactions suspectes, CNTI,    | Elevee      |
|                  |         | blacklist, saisies               |             |
+------------------+---------+----------------------------------+-------------+
| Portail Ministere| H       | Vue nationale, agrements,        | Critique    |
|                  |         | sanctions, publications          |             |
+------------------+---------+----------------------------------+-------------+
```

### 2.2 Hors perimetre

- Infrastructure reseau physique (deja validee par le prestataire)
- Authentification gouvernementale centralisee (API externe mock)
- Paiement electronique (hors scope v1)

### 2.3 Matrice de tracabilite exigences/fonctionnalites

| Exigence arrete | Module(s) | Priorite QA |
|---|---|---|
| Delai conformite 3 mois (importateurs) | A, F | Critique |
| Delai conformite 6 mois (distributeurs) | A, F | Critique |
| Delai conformite 1 an (detaillants) | A, F | Critique |
| Rapport trimestriel obligatoire | E, H | Critique |
| Format XML + PDF | E | Critique |
| Mention numero agreement sur facture | D, H | Haute |
| Prix anormaux > 20% | D | Haute |
| Vehicules interdits depuis 2022 | B, G | Haute |
| Fermeture administrative si non-conforme | F, H | Critique |
| KYC obligatoire vente | C | Haute |

---

## 3. Strategie de Test

### 3.1 Pyramide de test

```
                    /\
                   /  \     E2E (5%) — Scenarios metier complets
                  / E2E\    15 scenarios critiques
                 /--------\
                /          \   Integration (15%) — Flux inter-modules
               / Integration \  60 cas de test
              /----------------\
             /                  \  Unitaire (50%) — Fonctions, regles metier
            /   Unitaire          \ 500+ tests unitaires
           /-----------------------\
          /                          \  Performance (15%) — Charge, stress
         /     Performance            \ 30 scenarios
        /-----------------------------\
       /                                \  Securite + Accessibilite (15%)
      /   Securite, Accessibilite,       \ 40 scenarios
     /            RGPD                    \
    /-------------------------------------\
```

### 3.2 Types de tests par module

| Type de test | Modules concernes | Outil preconise | Responsable |
|---|---|---|---|
| Tests unitaires | A-H | Jest / pytest | Devs |
| Tests d'integration | A-H | Postman / Newman | QA |
| Tests E2E | A-H | Cypress / Playwright | QA |
| Tests de performance | E, B, H | k6 / JMeter | Perf QA |
| Tests de securite | G, H, Auth | OWASP ZAP | SecOps |
| Tests d'accessibilite | A-H | Axe / Lighthouse | QA |
| Tests de conformite | A, E, F | Tests manuels + auto | QA Reglementaire |
| Tests de charge | E, B | k6 + infrastructure | Perf QA |

### 3.3 Approche BDD

Les scenarios de test sont ecrits en langage Gherkin (Given/When/Then) pour les modules critiques E et F :

```gherkin
Feature: Rapport trimestriel obligatoire
  Scenario: Generation d'un rapport complet avec toutes les donnees
    Given un importateur "MOTO IMPORT BF" avec numero agreement "AGR-001-BF"
    And des transactions sur le trimestre T1-2026
    When l'importateur genere le rapport trimestriel
    Then le rapport contient toutes les sections obligatoires
    And le format XML est conforme au schema XSD du ministere
    And le PDF signe est genere avec la signature numerique
```

---

## 4. Environnements de Test

### 4.1 Topologie des environnements

```
+---------------+    +---------------+    +---------------+    +---------------+
|   Local/Dev   | -> |     CI        | -> |    Staging    | -> |   Production  |
|  (docker)     |    |  (automatise) |    |  (pre-prod)   |    |   (live)      |
+---------------+    +---------------+    +---------------+    +---------------+
     Devs               Pipeline            QA + UAT              Monitoring
```

### 4.2 Details des environnements

| Environnement | URL | Donnees | Acces | SLA |
|---|---|---|---|---|
| Local | localhost | Mock + seed | Devs uniquement | Aucun |
| CI/CD | ci.ireg.internal | Reset a chaque build | Pipeline | Aucun |
| Staging | staging.ireg.bf | Anonymisees (snapshot prod-like) | QA + PO + Ministere | 99% |
| UAT | uat.ireg.bf | Jeu de donnees validation | Ministere + Utilisateurs pilotes | 99.9% |
| Production | www.ireg.bf | Donnees reelles | Utilisateurs finaux | 99.9% |

### 4.3 Configuration technique Staging

```yaml
environnement_staging:
  serveurs_app: 2 (HA)
  base_de_donnees: PostgreSQL 15 (replica)
  cache: Redis Cluster
  stockage_fichiers: MinIO (S3-compatible)
  cpu: 4 coeurs / instance
  ram: 16 Go / instance
  reseau: 100 Mbps
  ssl: Let's Encrypt
  backup: Toutes les 4h (RPO = 4h)
```

---

## 5. Criteres d'Entree et de Sortie

### 5.1 Criteres d'entree (Entry Criteria)

Les tests ne peuvent commencer que si :

| # | Critere | Verification |
|---|---|---|
| CE1 | Toutes les user stories du sprint sont "Ready for QA" | Revue PO |
| CE2 | Les tests unitaires couvrent > 80% du code | Rapport coverage |
| CE3 | Aucun bug bloquant ou critique ouvert sur le module | JIRA/Bug tracker |
| CE4 | L'environnement de staging est deploye et accessible | Health check |
| CE5 | Les donnees de test sont chargees et valides | Script de validation |
| CE6 | La documentation technique est a jour | Wiki technique |

### 5.2 Criteres de sortie (Exit Criteria)

La recette est consideree comme reussie si :

| # | Critere | Seuil |
|---|---|---|
| CS1 | Taux de succes des tests fonctionnels | >= 98% |
| CS2 | Taux de succes des tests reglementaires | = 100% |
| CS3 | Taux de succes des tests de securite critiques | = 100% |
| CS4 | Bugs critiques ouverts | 0 |
| CS5 | Bugs majeurs ouverts | <= 2 (avec plan de correction) |
| CS6 | Couverture de code (tests unitaires) | >= 85% |
| CS7 | Performance API (P95) | < 200ms |
| CS8 | Score Lighthouse accessibilite | >= 90 |
| CS9 | Audit de securite (OWASP Top 10) | 0 critique, 0 haute |
| CS10 | Validation par le ministere (UAT) | Sign-off formel |

---

## 6. Ressources et Planning

### 6.1 Equipe QA

| Role | Profil | Nb | Responsabilites |
|---|---|---|---|
| Lead QA Reglementaire | Expert domaine + test | 1 | Plan de test, conformite, validation ministerielle |
| QA Automatisation | DevOps + test auto | 2 | Tests auto, CI/CD, performance |
| QA Fonctionnel | Testeur fonctionnel | 2 | Tests manuels, recette, UAT |
| QA Securite | SecOps + test | 1 | Audit securite, tests d'intrusion |
| QA Performance | Performance engineer | 1 | Tests de charge, optimisation |

### 6.2 Planning type (par sprint de 2 semaines)

| Semaine | Activite | Livrable |
|---|---|---|
| S1-J1/2 | Analyse des exigences + Ecriture cas de test | Cas de test v1 |
| S1-J3/4 | Preparation donnees de test + Environnement | Jeu de donnees |
| S1-J5 | Revue des cas de test avec PO + Ministere | Cas de test valides |
| S2-J1/3 | Execution tests fonctionnels | Rapport execution |
| S2-J4 | Execution tests non-fonctionnels | Rapport perf/secu |
| S2-J5 | Analyse des ecarts + Rapport de recette | Decision GO/NO-GO |

### 6.3 Outils

| Categorie | Outil | Usage |
|---|---|---|
| Gestion des tests | TestRail | Organisation et execution des cas de test |
| Bug tracking | JIRA | Suivi des anomalies |
| Automatisation E2E | Cypress | Tests de bout en bout |
| Automatisation API | Postman + Newman | Tests d'integration |
| Performance | k6 | Tests de charge |
| Securite | OWASP ZAP | Scan de vulnerabilites |
| Accessibilite | axe-core + Lighthouse | Audit a11y |
| CI/CD | GitLab CI | Pipeline de test |
| Rapports | Allure | Reporting visuel |
| Mock | WireMock / json-server | Simulation APIs externes |

---

## 7. Risques et Mitigation

### 7.1 Matrice des risques

| # | Risque | Probabilite | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Changement de la reglementation pendant le projet | Moyenne | Critique | Veille juridique, tests parametres, architecture extensible |
| R2 | Non-disponibilite de l'environnement ministeriel pour les tests d'integration | Elevee | Majeur | Mock serveur, simulation XML, tests en isolation |
| R3 | Donnees de test insuffisantes (volume) | Moyenne | Majeur | Generateur de donnees synthetiques, anonymisation |
| R4 | Performance insuffisante sur les rapports trimestriels | Moyenne | Critique | Tests de charge precoces, optimisation base de donnees |
| R5 | Non-validation par le ministere en UAT | Faible | Critique | Implication ministerielle des la conception, revues regulieres |
| R6 | Conflits de synchronisation en mode offline | Moyenne | Majeur | Tests de synchronisation exhaustifs, gestion de conflits |
| R7 | Fuite de donnees personnelles (KYC) | Faible | Critique | Chiffrement, audit securite, anonymisation tests |
| R8 | Indisponibilite pendant les echéances reglementaires | Faible | Critique | Haute disponibilite, maintenance planifiee hors periode critique |
| R9 | Complexite des calculs de conformite (150 points) | Moyenne | Majeur | Tests unitaires exhaustifs, tableau de decision |
| R10 | Migration des donnees depuis les systemes existants | Elevee | Majeur | Plan de migration, tests de migration, rollback plan |

### 7.2 Plan de contingence

| Scenario | Action immediate | Communication |
|---|---|---|
| Bug critique en production | Rollback automatique, hotfix | PO + Tech Lead + Ministere sous 1h |
| Non-conformite decouverte post-deploiement | Audit immediat, plan correctif | Ministere sous 4h, utilisateurs sous 24h |
| Incident de securite | Isolement, forensic, patch | DPO + Autorites sous 72h (RGPD) |
| Environnement ministeriel indisponible | Bascule sur mock, file d'attente | Equipe infra + Ministere |

---

## 8. Gouvernance et Reporting

### 8.1 Indicateurs de suivi (KPIs)

| KPI | Cible | Frequence |
|---|---|---|
| Taux de reussite des tests | >= 98% | Quotidien |
| Couverture de code | >= 85% | Par build |
| Nombre de bugs critiques | 0 | Quotidien |
| MTTR (Mean Time To Repair) | < 4h | Hebdomadaire |
| Satisfaction utilisateurs UAT | >= 4/5 | Par sprint |
| Conformite reglementaire | 100% | Par release |

### 8.2 Canaux de communication

| Evenement | Participants | Frequence |
|---|---|---|
| Daily QA | Equipe QA + Tech Lead | Quotidien |
| Revue de recette | QA + PO + Ministere | Par sprint |
| Comite de conformite | Tous + Representant ministere | Mensuel |
| Post-mortem incident | Tous | Apres chaque incident |

---

## 9. Annexes

### 9.1 References reglementaires

- Arrete ministeriel n°2026-05-06 du Burkina Faso
- Directive OHADA sur la comptabilite (SYSCOHADA revise)
- Loi n°010-2019/AN sur la protection des donnees personnelles
- Reglement CEMAC/UEMAC sur les transactions financieres suspectes

### 9.2 Glossaire

| Terme | Definition |
|---|---|
| AGR | Agreement de distribution des engins motorises |
| CNTI | Cellule Nationale de Traitement des Informations (surveillance) |
| KYC | Know Your Customer (verification d'identite) |
| OHADA | Organisation pour l'Harmonisation en Afrique du Droit des Affaires |
| RCCM | Registre du Commerce et du Credit Mobilier |
| VIN | Vehicle Identification Number |
| XSD | XML Schema Definition |

### 9.3 Jeux de donnees de test

Voir le fichier `test-data.md` pour l'ensemble des donnees de test mock (importateurs, vehicules, clients, transactions).

---

*Document genere par l'equipe QA Reglementaire iReg Moto BF — Version 1.0*
