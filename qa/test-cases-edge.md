# Cas de Test Limites et Edge Cases — iReg Moto BF
## Tests de Robustesse, Volume, Reseau et Securite Avancee

---

| Attribut | Valeur |
|---|---|
| Version | 1.0 |
| Date | 2025-06-09 |
| Total cas de test | 35 |
| Statut | Pret pour execution |

---

## E.1 — Tests de Volume et Charge [7 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| ED-01 | B, D | Volume: 10 000 transactions enregistrees en 1 heure | Systeme en production, 2000 points de vente simultanes | 1. Simuler 2000 points de vente 2. Chaque PV enregistre 5 transactions/heure 3. Mesurer le temps de reponse | Toutes les transactions enregistrees, temps de reponse moyen < 200ms, aucune perte de donnee, pas d'erreur 500 | Critique |
| ED-02 | B | Volume: 100 000 VIN en base | Base de donnees avec 100 000 engins | 1. Importer 100 000 VIN 2. Effectuer une recherche par VIN 3. Mesurer le temps | Recherche < 500ms, resultats corrects, pagination fonctionnelle, pas de timeout | Haute |
| ED-03 | E | Volume: Generation rapport avec 10 000 transactions | Importateur avec 10 000 transactions sur le trimestre | 1. Lancer la generation du rapport 2. Mesurer le temps 3. Verifier l'integrite | Rapport genere en < 5 secondes, toutes les transactions presentes, totaux corrects, pas de corruption | Critique |
| ED-04 | C | Volume: 50 000 clients en base | Base avec 50 000 clients KYC | 1. Effectuer une recherche client par nom 2. Mesurer le temps 3. Tester l'autocompletion | Recherche < 300ms, autocompletion < 100ms, resultats pertinents | Haute |
| ED-05 | H | Volume: Vue nationale avec 5000 operateurs | 5000 operateurs enregistres | 1. Charger le tableau de bord national 2. Mesurer le temps 3. Verifier les agregations | Chargement < 3 secondes, agregations correctes, graphiques affiches, pas de degradation | Haute |
| ED-06 | E | Volume: Soumission simultanee de 500 rapports | 500 operateurs soumettent a la meme heure | 1. Simuler 500 soumissions simultanees 2. Mesurer le temps de traitement 3. Verifier les accuses | Tous les rapports traites, pas de rejet injustifie, files d'attente gerees, accuses de reception generes | Critique |
| ED-07 | G | Volume: 10 000 alertes securite en 24h | Periode de forte activite suspecte | 1. Generer 10 000 alertes 2. Verifier la detection 3. Verifier l'affichage | Toutes les alertes enregistrees, batch de detection fonctionne, tableau de bord securite charge en < 3s | Haute |

---

## E.2 — Tests de Reseau et Connectivite [6 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| ED-08 | ALL | Mode offline — enregistrement transaction | Connexion intermittente simulee (3G instable) | 1. Simuler perte de connexion 2. Enregistrer une transaction en mode offline 3. Verifier le stockage local | Transaction stockee localement, message "Mode offline — synchronisation automatique a la reconnexion", pas de perte de donnees | Haute |
| ED-09 | ALL | Synchronisation apres reconnexion | Transactions ED-08 en attente | 1. Retablir la connexion 2. Declencher la synchronisation 3. Verifier le serveur | Toutes les transactions synchronisees dans l'ordre, conflits detectes et resolus, confirmations recues | Haute |
| ED-10 | ALL | Conflit de synchronisation (modification simultanee) | Deux utilisateurs modifient le meme enregistrement | 1. Utilisateur A modifie le prix offline 2. Utilisateur B modifie le prix offline 3. Les deux se reconnectent | Conflit detecte, regle de resolution appliquee (dernier modificateur ou version la plus recente), alerte generee | Haute |
| ED-11 | ALL | Latence reseau elevee (satellite rural) | Latence simulee a 2000ms | 1. Simuler latence 2000ms 2. Effectuer des operations CRUD 3. Mesurer l'UX | Operations fonctionnent, indicateur de chargement affiche, timeout configure a 10s, pas de blocage | Moyenne |
| ED-12 | ALL | Deconnexion pendant soumission rapport | Rapport en cours d'envoi | 1. Lancer la soumission d'un rapport 2. Couper la connexion a 50% 3. Verifier | Soumission en pause, reprise automatique apres reconnexion (resume), pas de corruption du fichier | Haute |
| ED-13 | ALL | Bande passante limitee (2G) | Bande passante simulee a 100 kbps | 1. Simuler 2G 2. Charger la page d'accueil 3. Essayer d'uploader un document | Page optimisee chargee (< 1MB), compression activee, upload fragmente avec reprise possible | Moyenne |

---

## E.3 — Tests de Donnees Corrompues et Invalides [6 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| ED-14 | B | VIN avec caractere de remplacement (?) | Fichier d'import corrompu | 1. Importer un fichier avec VIN "ML8BCE7H?KJ123456" 2. Verifier le traitement | Ligne rejetee, message d'erreur detaille "Caractere invalide en position 8", rapport d'erreur d'import genere | Haute |
| ED-15 | C | CNIB avec format invalide (ancienne version) | Client avec ancienne CNIB non numerisee | 1. Saisir numero CNIB "OLD123" (format ancien) 2. Valider | Message d'information "Format ancien detecte — mise a jour de la CNIB recommandee", enregistrement possible avec warning | Moyenne |
| ED-16 | D | Prix negatif saisi (erreur de saisie) | Formulaire prix ouvert | 1. Saisir prix de vente "-5000" 2. Valider | Message d'erreur "Prix negatif impossible — verifier la saisie", champ refuse | Moyenne |
| ED-17 | D | Prix avec 10 decimales (precision excessive) | Formulaire prix ouvert | 1. Saisir prix "1250.1234567890" 2. Valider | Prix arrondi a 2 decimales "1250.12", message "Prix arrondi a 2 decimales" | Faible |
| ED-18 | E | Rapport avec donnees incoherentes (SF incorrect) | Donnees corrompues en base | 1. Generer un rapport avec SI=100, Entrees=50, Sorties=30, SF declare=500 2. Verifier | Alerte "Incoherence detectee: Stock final calcule (120) != Stock final declare (500)", rapport bloque, audit requis | Haute |
| ED-19 | ALL | Injection de donnees JSON mal forme | API exposee | 1. Envoyer un payload JSON mal forme 2. Verifier la reponse | Reponse 400 Bad Request, message "Format JSON invalide", aucune donnee traitee, pas d'erreur 500 | Haute |

---

## E.4 — Tests de Fusee Horaire et Dates [5 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| ED-20 | ALL | Transaction a minuit (00:00) | Date de transition | 1. Enregistrer une transaction a 00:00 2. Verifier la date attribuee | Transaction enregistree avec la date correcte, pas d'attribution a la veille | Moyenne |
| ED-21 | ALL | Changement d'heure (ete/hiver) | Periode de changement d'heure | 1. Enregistrer des transactions autour du changement d'heure 2. Verifier les horodatages | Horodatages coherents, pas de doublon ni de trou horaire, UTC utilise en interne | Faible |
| ED-22 | F | Calcul delai avec jour ferie | Delai expire pendant un jour ferie | 1. Calculer un delai qui expire un jour ferie 2. Verifier le report | Delai reporte au prochain jour ouvrable, conformement aux usages administratifs | Moyenne |
| ED-23 | F | Annee bissextile (29 fevrier) | Date: 29/02/2028 | 1. Enregistrer une transaction le 29/02/2028 2. Calculer un delai de 30 jours | Transaction correctement enregistree, delai calcule correctement (29/03/2028) | Faible |
| ED-24 | E | Rapport trimestriel chevauchement annee (T4 2026 -> T1 2027) | Transition decembre/janvier | 1. Generer le rapport T4-2026 (oct-dec) 2. Generer T1-2027 (jan-mar) 3. Verifier les chevauchements | Aucun doublon, chaque transaction dans le bon trimestre, totaux coherents | Haute |

---

## E.5 — Tests de Caracteres Speciaux et Internationalisation [4 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| ED-25 | C | Nom client avec accents (KABORE → Kaboré) | Formulaire client ouvert | 1. Saisir nom "Kaboré" 2. Saisir prenom "Amadou" 3. Enregistrer | Client enregistre correctement, accents preserves, recherche par "Kabore" fonctionne (normalisation) | Moyenne |
| ED-26 | C | Nom client avec caractere apostrophe | Formulaire client ouvert | 1. Saisir nom "Ouedraogo-Ouedraog" 2. Enregistrer | Client enregistre sans erreur, apostrophe correctement echappee en base | Moyenne |
| ED-27 | B | Modele vehicule avec caracteres speciaux | Formulaire engin ouvert | 1. Saisir modele "MOTO XR 150L (Edition Spéciale)" 2. Enregistrer | Modele enregistre avec caracteres speciaux, pas de troncature, affichage correct | Faible |
| ED-28 | E | Generation rapport avec donnees UTF-8 complets | Donnees avec accents, symboles | 1. Generer un rapport PDF 2. Verifier l'affichage des caracteres speciaux | PDF affiche correctement tous les caracteres (accents, symboles monetaires FCFA/€), pas de carre blanc ni de ? | Haute |

---

## E.6 — Tests d'Injection et Securite Avancee [4 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| ED-29 | ALL | Injection SQL dans champ recherche | Champ de recherche accessible | 1. Saisir dans recherche: "'; DROP TABLE clients; --" 2. Valider | Recherche traitee comme chaine litterale, aucune table supprimee, message "Aucun resultat trouve", log d'audit enregistre | Critique |
| ED-30 | ALL | XSS dans champ commentaire | Formulaire avec champ commentaire | 1. Saisir: "<script>alert('XSS')</script>" 2. Enregistrer 3. Consulter l'affichage | Script non execute, affiche comme texte litteral, balises echappees, pas d'alerte JS | Critique |
| ED-31 | ALL | Injection XML/XXE dans upload | Upload de fichier XML autorise | 1. Uploader un XML avec entity externe: <!ENTITY xxe SYSTEM "file:///etc/passwd"> 2. Verifier | Parseur XML securise (XXE desactive), entite externe ignoree, message "Fichier traite avec succes" (sans injection), alerte securite | Critique |
| ED-32 | ALL | Path traversal dans telechargement | Endpoint de telechargement de fichier | 1. Modifier l'URL: /download?file=../../../etc/passwd 2. Executer | Acces refuse, message "Fichier non autorise", log d'audit enregistre avec IP et identifiant | Critique |

---

## E.7 — Tests de Concurrence et Race Conditions [3 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| ED-33 | B, D | Double vente simultanee (race condition) | Deux vendeurs, un seul engin | 1. Vendeur A et Vendeur B consultent le meme engin en meme temps 2. Les deux cliquent "Vendre" simultanement (delta < 50ms) | Une seule vente reussit, l'autre recoit "Engin deja vendu", stock = 0, pas de double facturation | Critique |
| ED-34 | E | Double soumission de rapport (clic double) | Utilisateur clique 2 fois rapidement | 1. Clic sur "Soumettre" 2. Clic de nouveau avant la reponse 3. Verifier | Une seule soumission traitee, la deuxieme est ignoree avec message "Soumission deja en cours", un seul accuse de reception | Haute |
| ED-35 | B | Mise a jour stock concurrente (import + vente) | Batch d'import et vente simultanes | 1. Batch d'import de 100 engins en cours 2. Vente d'un engin en cours 3. Verifier la coherence | Stock final coherent, transaction de vente enregistree, import complete, pas de perte ni de duplication | Haute |

---

## Annexe — Matrice des Tests Limites

```
+------------+----------+--------+---------+----------+
| Categorie  | Nombre   | Critique | Haute   | Moyenne  |
+------------+----------+--------+---------+----------+
| Volume     | 7        | 2      | 5       | 0        |
| Reseau     | 6        | 0      | 4       | 2        |
| Donnees    | 6        | 0      | 3       | 3        |
| Dates      | 5        | 0      | 1       | 2        |
| I18n       | 4        | 0      | 1       | 3        |
| Injection  | 4        | 4      | 0       | 0        |
| Concurrence| 3        | 2      | 1       | 0        |
+------------+----------+--------+---------+----------+
| TOTAL      | 35       | 8      | 15      | 10       |
+------------+----------+--------+---------+----------+
```

---

*Document genere par l'equipe QA Reglementaire iReg Moto BF — 35 cas de test limites et edge cases*
