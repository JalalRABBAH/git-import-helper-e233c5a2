# Résumé — Livrables QA iReg Moto BF
## Synthèse des scénarios de test complets

---

| Date de generation | 2025-06-09 |
| Auteur | Ingénieur QA Reglementaire iReg Moto BF |
| Reference reglementaire | Arrete ministeriel 05/06/2026 |

---

## Fichiers livres

| # | Fichier | Chemin | Taille | Lignes |
|---|---------|--------|--------|--------|
| 1 | Plan de test global | `/mnt/agents/output/qa/test-plan.md` | 14.6 Ko | 337 |
| 2 | Cas de test fonctionnels (155 cas) | `/mnt/agents/output/qa/test-cases-functional.md` | 47.0 Ko | 365 |
| 3 | Cas de test reglementaires (55 cas) | `/mnt/agents/output/qa/test-cases-regulatory.md` | 19.7 Ko | 194 |
| 4 | Cas de test limites et edge cases (35 cas) | `/mnt/agents/output/qa/test-cases-edge.md` | 12.2 Ko | 119 |
| 5 | Tests de performance (30 scenarios) | `/mnt/agents/output/qa/performance-tests.md` | 14.4 Ko | 241 |
| 6 | Tests de securite (40 cas) | `/mnt/agents/output/qa/security-tests.md` | 16.0 Ko | 161 |
| 7 | Tests d'accessibilite (35 cas) | `/mnt/agents/output/qa/accessibility-tests.md` | 16.0 Ko | 196 |

**Total: 7 fichiers, 140 Ko, 1613 lignes**

---

## Recapitulatif des cas de test par catégorie

### 1. Cas de test fonctionnels — 155 cas

| Module | Description | Nombre de cas | Priorite Critique | Priorite Haute | Priorite Moyenne | Priorite Faible |
|--------|-------------|---------------|-------------------|----------------|------------------|-----------------|
| A | Acteurs Economiques | 20 | 3 | 10 | 5 | 2 |
| B | Stocks | 20 | 3 | 10 | 5 | 2 |
| C | Clients | 20 | 4 | 8 | 5 | 3 |
| D | Commercial | 15 | 3 | 6 | 4 | 2 |
| E | Rapportage | 25 | 12 | 8 | 4 | 1 |
| F | Conformite | 20 | 8 | 8 | 3 | 1 |
| G | Securite (app.) | 15 | 7 | 4 | 3 | 1 |
| H | Portail Ministere | 15 | 6 | 6 | 2 | 1 |
| **TOTAL** | | **155** | **46** | **60** | **31** | **13** |

### 2. Cas de test reglementaires — 55 cas

| Exigence | Article | Cas de test | Nombre |
|----------|---------|-------------|--------|
| Delai conformite 3 mois (importateurs) | Art. 5.1 | R-01 a R-05 | 5 |
| Delai conformite 6 mois (distributeurs) | Art. 5.2 | R-06 a R-10 | 5 |
| Delai conformite 1 an (detaillants) | Art. 5.3 | R-11 a R-15 | 5 |
| Fermeture administrative si non-conforme | Art. 6 | R-16 a R-20 | 5 |
| Rapport trimestriel obligatoire | Art. 7 | R-21 a R-30 | 10 |
| Contenu obligatoire du rapport | Art. 7.1-7.8 | R-31 a R-38 | 8 |
| Format soumission XML + PDF | Art. 7.9 | R-39 a R-43 | 5 |
| Mention numero agreement sur facture | Art. 8.1 | R-44 a R-46 | 3 |
| Prix anormaux > 20% | Art. 8.2 | R-47 a R-50 | 4 |
| Vehicules interdits depuis 2022 | Art. 9 | R-51 a R-55 | 5 |
| **TOTAL** | | | **55** |

### 3. Cas de test limites et edge cases — 35 cas

| Categorie | Description | Nombre | Priorite |
|-----------|-------------|--------|----------|
| Volume | 10 000+ transactions, 100 000 VIN | 7 | 2 Critique, 5 Haute |
| Reseau | Mode offline, synchronisation, latence | 6 | 4 Haute, 2 Moyenne |
| Donnees corrompues | VIN invalide, prix negatif, incoherences | 6 | 3 Haute, 3 Moyenne |
| Fusee horaire | Minuit, changement d'heure, jour ferie | 5 | 1 Haute, 2 Moyenne, 2 Faible |
| Caracteres speciaux | Accents, UTF-8, apostrophes | 4 | 1 Haute, 3 Moyenne |
| Injection avancee | SQL, XSS, XXE, Path traversal | 4 | 4 Critique |
| Concurrence | Race conditions, double vente | 3 | 2 Critique, 1 Haute |
| **TOTAL** | | **35** | **8 Critique, 15 Haute, 10 Moyenne, 2 Faible** |

### 4. Tests de performance — 30 scenarios

| Categorie | Description | Nombre | Seuils cles |
|-----------|-------------|--------|-------------|
| Charge nominale | 2000 PV simultanes | 6 | Latence < 200ms |
| Performance API | 5 endpoints critiques | 5 | P95 < 200ms, P99 < 500ms |
| Temps chargement page | 4 pages cles | 4 | FCP < 1s, LCP < 3s |
| Montee en charge | 0 -> 2000 VU en 30 min | 3 | Pas de degradation |
| Endurance | 24h a charge nominale | 3 | Pas de fuite memoire |
| Spike (Black Friday) | 0 -> 5000 en 2 min | 4 | Recovery < 5 min |
| Stress | Jusqu'a rupture | 3 | Degradation gracieuse |
| Generation rapports | 1000 et 10 000 transactions | 2 | < 2s et < 5s |
| **TOTAL** | | **30** | |

### 5. Tests de securite — 40 cas

| Categorie | Description | Nombre | Niveau |
|-----------|-------------|--------|--------|
| Authentification JWT/MFA | Login, token, TOTP, blocage | 6 | Critique |
| RBAC | Controle d'acces par role (7 roles) | 7 | Critique |
| Injection SQL | Recherche, ID, UNION, time-based | 4 | Critique |
| XSS | Reflected, stored, DOM, PDF | 4 | Critique |
| CSRF | Token valide, manquant, invalide | 3 | Haute |
| Upload malveillant | .exe, polyglot, PDF+JS | 4 | Critique |
| Brute force / Rate limiting | Login, API, rapports, IP | 4 | Haute |
| Audit trail immuable | Creation, modification, hash, chaine | 4 | Critique |
| Cryptographie | TLS 1.3, AES-256, Argon2id, rotation | 4 | Critique |
| **TOTAL** | | **40** | **25 Critique, 15 Haute** |

### 6. Tests d'accessibilite — 35 cas

| Categorie | Criteres WCAG | Nombre |
|-----------|---------------|--------|
| Navigation clavier | 2.1.1, 2.1.2, 2.1.4, 2.4.3, 2.4.7, 2.4.11 | 6 |
| Lecteur d'ecran | 1.1.1, 4.1.2, 2.4.6, 4.1.3, 1.3.1, 2.4.4 | 6 |
| Contraste et visuel | 1.4.3, 1.4.11, 1.4.1, 1.4.12, 1.4.4 | 5 |
| Zoom et redimensionnement | 1.4.4, 1.4.10, 1.4.12 | 3 |
| Reduction mouvement | 2.2.2, 2.3.1, 2.3.3 | 3 |
| Formulaires | 1.3.5, 3.3.1, 3.3.2, 3.3.3, 3.3.4 | 5 |
| Structure et landmarks | 1.3.1, 2.4.1, 2.4.5, 4.1.1 | 4 |
| Contenu temporel | 1.2.1, 1.4.2, 2.2.1 | 3 |
| **TOTAL** | | **35** |

---

## GRAND TOTAL: 350 cas/scenarios de test

| Categorie | Nombre | % du total | Priorite Critique | Priorite Haute |
|-----------|--------|------------|-------------------|----------------|
| Fonctionnels | 155 | 44.3% | 46 | 60 |
| Reglementaires | 55 | 15.7% | 55 | 0 |
| Limites / Edge cases | 35 | 10.0% | 8 | 15 |
| Performance | 30 | 8.6% | - | - |
| Securite | 40 | 11.4% | 25 | 15 |
| Accessibilite | 35 | 10.0% | - | - |
| **TOTAL** | **350** | **100%** | **134** | **90** |

---

## Couverture reglementaire

| Exigence arrete | Cas de test associes | Statut |
|-----------------|----------------------|--------|
| Delai conformite 3 mois (importateurs) | R-01 a R-05, F-11, F-14, F-15 | Couvert |
| Delai conformite 6 mois (distributeurs) | R-06 a R-10, F-12 | Couvert |
| Delai conformite 1 an (detaillants) | R-11 a R-15, F-13 | Couvert |
| Fermeture administrative si non-conforme | R-16 a R-20, F-20 | Couvert |
| Rapport trimestriel obligatoire | R-21 a R-30, E-01 a E-25 | Couvert |
| Contenu obligatoire du rapport | R-31 a R-38, E-04, E-05 | Couvert |
| Format de soumission XML + PDF | R-39 a R-43, E-06 a E-15 | Couvert |
| Mention numero agreement sur facture | R-44 a R-46, D-07 | Couvert |
| Prix anormaux > 20% | R-47 a R-50, D-02 a D-05 | Couvert |
| Vehicules interdits depuis 2022 | R-51 a R-55, B-04, B-13, G-04, G-05 | Couvert |

**Couverture reglementaire: 100% des 10 exigences critiques de l'arrete**

---

*Document genere automatiquement — iReg Moto BF QA*
