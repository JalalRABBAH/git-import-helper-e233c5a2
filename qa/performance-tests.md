# Tests de Performance — iReg Moto BF
## Scenarios de Charge, Stress, Endurance et Pic

---

| Attribut | Valeur |
|---|---|
| Version | 1.0 |
| Date | 2025-06-09 |
| Total scenarios | 30 |
| Critere d'acceptation global | Latence API < 200ms, Page < 3s, Rapport < 5s |

---

## P.1 — Tests de Charge Nominale [6 cas]

### P.1.1 — Charge: 2000 Points de Vente Simultanés

| ID | Module | Scenario | Configuration | Etapes | Criteres d'acceptation | Priorite |
|---|---|---|---|---|---|---|
| PERF-01 | ALL | Connexion simultanee 2000 utilisateurs | 2000 utilisateurs repartis sur 3 profils (importateur, distributeur, detaillant) | 1. Simuler 2000 connexions simultanees 2. Chaque utilisateur effectue une sequence: login -> tableau de bord -> 5 actions metier -> logout 3. Mesurer sur 15 minutes | Temps de reponse login < 500ms (P95), tableau de bord < 2s, actions metier < 200ms, taux d'erreur < 0.1%, CPU < 70%, RAM < 80% | Critique |
| PERF-02 | B | Enregistrement simultane de 2000 VIN/h | 2000 points de vente, 1 VIN/PV/heure | 1. Chaque PV enregistre 1 VIN toutes les 60 minutes 2. Mesurer le debit 3. Verifier l'integrite | Debit >= 2000 VIN/heure, temps moyen d'enregistrement < 300ms, zero perte de donnees, pas de doublon VIN | Haute |
| PERF-03 | D | 2000 transactions commerciales/heure | 2000 points de vente, 1 transaction/PV/heure | 1. Chaque PV enregistre 1 vente/heure 2. Generer la facture 3. Mettre a jour le stock | Debit >= 2000 transactions/heure, generation facture < 500ms, stock mis a jour correctement, totaux coherents | Haute |
| PERF-04 | E | Generation de 500 rapports/heure | 500 importateurs generant chacun 1 rapport | 1. Lancer la generation de 500 rapports simultanes 2. Mesurer le temps total 3. Verifier les fichiers | Tous les rapports generes en < 1h, chaque rapport < 5s pour 10 000 transactions, memoire stable (pas de fuite) | Critique |
| PERF-05 | C | Recherche client avec 50 000 enregistrements | Base de 50 000 clients, recherche par nom | 1. Effectuer 1000 recherches/minute 2. Mesurer le temps de reponse | Temps de reponse < 200ms (P95), autocompletion < 100ms, resultats pertinents | Haute |
| PERF-06 | H | Tableau de bord national avec 5000 operateurs | 5000 operateurs, agregation nationale | 1. Charger le tableau de bord national 2. Mesurer le temps 3. Verifier les calculs | Chargement < 3s, agregations correctes, graphiques interactifs fonctionnels | Haute |

---

## P.2 — Tests de Performance API [5 cas]

| ID | Endpoint | Methode | Scenario | Charge | Latence P95 | Latence P99 | Taux erreur |
|---|---|---|---|---|---|---|---|
| PERF-07 | /api/v1/actors | POST | Enregistrement acteur | 100 req/s | < 200ms | < 500ms | < 0.1% |
| PERF-08 | /api/v1/vins | POST | Enregistrement VIN | 200 req/s | < 200ms | < 400ms | < 0.1% |
| PERF-09 | /api/v1/sales | POST | Enregistrement vente | 300 req/s | < 200ms | < 400ms | < 0.1% |
| PERF-10 | /api/v1/reports/quarterly | GET | Generation rapport | 50 req/s | < 5s | < 10s | < 0.5% |
| PERF-11 | /api/v1/compliance/score | GET | Calcul score conformite | 100 req/s | < 300ms | < 600ms | < 0.1% |

### Details des scenarios API

| ID | Module | Scenario detaille | Preconditions | Etapes | Seuils d'alerte |
|---|---|---|---|---|---|
| PERF-07 | A | Enregistrement massif d'acteurs | Aucun acteur en base | 1. Simuler 100 requetes POST /api/v1/actors/seconde pendant 10 min 2. Variabiliser les donnees (RCCM, IFU) 3. Mesurer | Seuil critique: P95 > 500ms, Seuil alerte: P95 > 200ms |
| PERF-08 | B | Enregistrement massif de VIN | Importateurs crees | 1. 200 req/s POST /api/v1/vins pendant 15 min 2. Chaque VIN unique 3. Verifier les doublons | Seuil critique: P95 > 400ms, Seuil alerte: P95 > 200ms |
| PERF-09 | D | Enregistrement massif de ventes | Stock precharge | 1. 300 req/s POST /api/v1/sales pendant 15 min 2. Mettre a jour le stock 3. Generer les factures | Seuil critique: P95 > 400ms, Seuil alerte: P95 > 200ms |
| PERF-10 | E | Generation de rapports massifs | 500 importateurs avec donnees | 1. 50 req/s GET /api/v1/reports/quarterly pendant 10 min 2. Rapports avec 1000-10000 transactions 3. Verifier l'integrite | Seuil critique: P95 > 10s, Seuil alerte: P95 > 5s |
| PERF-11 | F | Calcul score conformite massif | 1000 operateurs avec donnees | 1. 100 req/s GET /api/v1/compliance/score pendant 10 min 2. Calcul sur 150 criteres 3. Verifier la coherence | Seuil critique: P95 > 600ms, Seuil alerte: P95 > 300ms |

---

## P.3 — Tests de Temps de Reponse Page [4 cas]

| ID | Page | Scenario | Charge | Temps de chargement (P95) | Temps interactif | Score Lighthouse |
|---|---|---|---|---|---|---|
| PERF-12 | /login | Page de connexion | 1000 utilisateurs simultanes | < 2s | < 2.5s | > 90 |
| PERF-13 | /dashboard | Tableau de bord operateur | 2000 utilisateurs simultanes | < 3s | < 3.5s | > 85 |
| PERF-14 | /report/generate | Page generation rapport | 500 utilisateurs simultanes | < 3s | < 4s | > 85 |
| PERF-15 | /ministry/national | Portail ministere vue nationale | 50 utilisateurs simultanes | < 3s | < 4s | > 80 |

### Details des scenarios de chargement page

| ID | Module | Scenario detaille | Preconditions | Etapes | Seuils |
|---|---|---|---|---|---|
| PERF-12 | Auth | Chargement page login sous charge | 1000 connexions simultanees | 1. Simuler 1000 utilisateurs accedant a /login 2. Mesurer: First Contentful Paint, Largest Contentful Paint, Time to Interactive 3. Verifier | FCP < 1s, LCP < 2s, TTI < 2.5s, CLS < 0.1 |
| PERF-13 | ALL | Tableau de bord operateur | 2000 utilisateurs connectes | 1. Simuler 2000 utilisateurs sur /dashboard 2. Chaque dashboard charge: widgets, graphiques, alertes, donnees en temps reel 3. Mesurer | FCP < 1.5s, LCP < 3s, TTI < 3.5s, CLS < 0.1 |
| PERF-14 | E | Page generation rapport | 500 utilisateurs generant des rapports | 1. 500 utilisateurs sur /report/generate 2. Selectionner un trimestre 3. Lancer la generation 4. Attendre le resultat | FCP < 1s, LCP < 2s, TTI < 3s, rapport affiche < 5s pour 10K transactions |
| PERF-15 | H | Portail ministere vue nationale | 50 administrateurs ministeres | 1. 50 administrateurs sur /ministry/national 2. Charger: carte, graphiques, tableaux, agregations 3. Mesurer | FCP < 1s, LCP < 2.5s, TTI < 4s, interactions carte fluides |

---

## P.4 — Test de Montee en Charge (Load Ramp) [3 cas]

| ID | Module | Scenario | Configuration | Etapes | Criteres d'acceptation |
|---|---|---|---|---|---|
| PERF-16 | ALL | Montee progressive 0 -> 2000 utilisateurs | k6: 0 -> 2000 VU en 30 minutes | 1. 0 utilisateur pendant 2 min (warmup) 2. +67 utilisateurs/min pendant 30 min 3. Plateau a 2000 pendant 15 min 4. Decharge progressive | Pas de degradation progressive, latence P95 < 300ms a 2000 VU, pas d'erreur > 0.1%, recovery < 2 min |
| PERF-17 | E | Montee progressive generation rapports | k6: 0 -> 100 req/s en 20 minutes | 1. 0 -> 100 req/s en 20 min 2. Plateau 100 req/s pendant 10 min 3. Verifier la stabilite | Generation stable a 100 req/s, latence P95 < 8s, pas de fuite memoire, garbage collection fluide |
| PERF-18 | B, D | Montee progressive transactions commerciales | k6: 0 -> 500 req/s en 25 minutes | 1. 0 -> 500 req/s en 25 min 2. Plateau 500 req/s pendant 15 min 3. Verifier la coherence stock | Stock toujours coherent (SI + Entrees - Sorties = SF), pas de race condition, latence P95 < 300ms |

---

## P.5 — Test d'Endurance (Soak Test) [3 cas]

| ID | Module | Scenario | Configuration | Duree | Criteres d'acceptation |
|---|---|---|---|---|---|
| PERF-19 | ALL | Endurance 24h a charge nominale | 1000 utilisateurs constants pendant 24h | 24 heures | Pas de fuite memoire, latence stable (ecart < 20%), pas de redemarrage serveur, logs propres |
| PERF-20 | E | Endurance generation rapports 12h | 20 req/s constants pendant 12h | 12 heures | Pas de corruption de donnees, stockage disque stable, latence P95 < 6s, pas d'erreur |
| PERF-21 | B | Endurance enregistrement VIN 24h | 50 req/s constants pendant 24h (4.3M VIN) | 24 heures | Aucun doublon VIN detecte, indexation performante, espace disque previsible, latence P95 < 300ms |

### Details du test d'endurance 24h

```yaml
perf_19_endurance_24h:
  duree: "24h"
  utilisateurs_virtuels: 1000
  scenarios:
    - login_logout: 20% (200 VU)
    - crud_vin: 30% (300 VU)
    - enregistrement_vente: 25% (250 VU)
    - generation_rapport: 10% (100 VU)
    - consultation_dashboard: 15% (150 VU)
  verifications:
    - heure_0h:  latence_P95 < 200ms
    - heure_6h:  latence_P95 < 250ms (acceptable degradation)
    - heure_12h: latence_P95 < 250ms
    - heure_18h: latence_P95 < 300ms
    - heure_24h: latence_P95 < 300ms
  monitoring:
    - memoire_heap: < 80% (pas de fuite)
    - CPU_moyen: < 70%
    - espace_disque: < 80%
    - connexions_DB: < pool_max (100)
    - threads: stable
  alertes:
    - fuite_memoire: "+20% heap en 6h"
    - degradation: "P95 > 400ms pendant 5 min"
    - erreurs: "> 1% erreurs 5xx pendant 2 min"
```

---

## P.6 — Test de Pic (Spike Test - Black Friday Style) [4 cas]

| ID | Module | Scenario | Configuration | Pic | Criteres d'acceptation |
|---|---|---|---|---|---|
| PERF-22 | ALL | Spike: 0 -> 5000 utilisateurs en 2 minutes | k6: spike brutal | 0 -> 5000 VU en 2 min, maintain 10 min, retour normal | Pas de crash, latence P95 < 1s pendant le pic, pas de perte de donnees, recovery automatique < 5 min |
| PERF-23 | D | Spike: 0 -> 1000 ventes/minute | Periode de promotion commerciale | 0 -> 1000 req/s en 1 min, maintain 5 min | Toutes les ventes enregistrees, factures generees, stock coherent, pas de double vente |
| PERF-24 | E | Spike: echeance rapport trimestriel | 500 operateurs soumettent a la meme minute | 500 soumissions simultanees, file d'attente | Toutes les soumissions traitees, files d'attente < 2 min, accuses de reception generes, pas de timeout |
| PERF-25 | H | Spike: connexion portail ministere apres publication | 100 administrateurs se connectent simultanement | 100 connexions en 30 secondes | Authentification reussie pour tous, dashboard charge < 4s, pas de rejet |

---

## P.7 — Tests de Stress [3 cas]

| ID | Module | Scenario | Configuration | Objectif | Criteres |
|---|---|---|---|---|---|
| PERF-26 | ALL | Stress test jusqu'a rupture | Augmentation progressive jusqu'a crash | Identifier le point de rupture | Systeme degrade gracieusement (pas de crash brutal), messages d'erreur comprehensibles, recovery automatique |
| PERF-27 | DB | Stress test base de donnees | 1000 connexions simultanees sur PostgreSQL | Tester les limites du pool | Pool de connexions gere (file d'attente), timeout configure, pas de deadlock |
| PERF-28 | Cache | Stress test Redis | 10000 req/s sur le cache | Tester les limites du cache | Hit rate > 90%, eviction LRU fonctionnelle, pas de saturation memoire |

---

## P.8 — Tests de Generation de Rapports Performance [2 cas]

| ID | Module | Scenario | Volume | Temps max | Priorite |
|---|---|---|---|---|---|
| PERF-29 | E | Generation rapport avec 1000 transactions | 1000 lignes | < 2 secondes | Haute |
| PERF-30 | E | Generation rapport avec 10 000 transactions | 10 000 lignes | < 5 secondes | Critique |

### Details des tests de generation de rapports

```yaml
perf_report_generation:
  scenarios:
    - id: PERF-29
      volume: 1000
      attente_temps: "< 2s"
      metriques:
        - temps_generation: "mesure en ms"
        - memoire_utilisee: "< 200MB"
        - taille_pdf: "< 5MB"
        - taille_xml: "< 2MB"
    
    - id: PERF-30
      volume: 10000
      attente_temps: "< 5s"
      metriques:
        - temps_generation: "mesure en ms"
        - memoire_utilisee: "< 1GB"
        - taille_pdf: "< 50MB"
        - taille_xml: "< 20MB"
  
  strategie_optimisation:
    - pagination: "1000 lignes par page PDF"
    - streaming_xml: "generation en streaming, pas de DOM complet"
    - cache_intermediaire: "donnees aggregees en cache Redis"
    - generation_async: "file d'attente pour les rapports > 5000 lignes"
```

---

## P.9 — Plan d'execution des tests de performance

### Calendrier type

| Jour | Activite | Scenarios |
|---|---|---|
| J1 | Preparation environnement + warmup | PERF-01 (smoke test) |
| J2 | Tests de charge nominale | PERF-01 a PERF-06 |
| J3 | Tests de performance API | PERF-07 a PERF-11 |
| J4 | Tests de temps de chargement page | PERF-12 a PERF-15 |
| J5 | Tests de montee en charge | PERF-16 a PERF-18 |
| J6-J7 | Test d'endurance 24h | PERF-19 a PERF-21 |
| J8 | Tests de pic | PERF-22 a PERF-25 |
| J9 | Tests de stress | PERF-26 a PERF-28 |
| J10 | Tests generation rapports + Analyse | PERF-29, PERF-30 + Rapport final |

### Environnement de test performance

```yaml
environnement_performance:
  description: "Repliqué à 80% de la production"
  serveurs_app: 2 (identique prod)
  base_de_donnees: PostgreSQL 15 (identique prod)
  cache: Redis Cluster (identique prod)
  CPU: 4 coeurs (identique prod)
  RAM: 16 Go (identique prod)
  reseau: 1 Gbps
  monitoring:
    - Prometheus + Grafana
    - APM (Datadog/New Relic)
    - Logs centralisés (ELK)
  injecteur:
    - k6 Cloud / k6 local
    - 10 injecteurs distribués
    - Bande passante injecteur: 10 Gbps
```

---

## P.10 — Rapport de test performance (template)

```
+----------------------------------+----------+----------+----------+----------+
| Scenario                         | P50      | P95      | P99      | Status   |
+----------------------------------+----------+----------+----------+----------+
| PERF-01: 2000 PV simultanes    | 120ms    | 180ms    | 250ms    | PASS     |
| PERF-02: 2000 VIN/h            | 150ms    | 220ms    | 350ms    | PASS     |
| PERF-03: 2000 ventes/h         | 140ms    | 195ms    | 280ms    | PASS     |
| PERF-04: 500 rapports/h        | 2.5s     | 4.2s     | 6.1s     | PASS     |
| PERF-05: Recherche 50K clients | 45ms     | 85ms     | 120ms    | PASS     |
| PERF-06: Dashboard national    | 1.2s     | 2.1s     | 2.8s     | PASS     |
| PERF-10: Rapport 10K trans.    | 3.1s     | 4.8s     | 7.2s     | PASS     |
| PERF-19: Endurance 24h         | 130ms    | 210ms    | 320ms    | PASS     |
| PERF-22: Spike 5000 users      | 180ms    | 450ms    | 890ms    | PASS     |
+----------------------------------+----------+----------+----------+----------+
```

---

*Document genere par l'equipe QA Reglementaire iReg Moto BF — 30 scenarios de test performance*
