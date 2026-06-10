# Cas de Test Reglementaires — iReg Moto BF
## Tests Bases sur l'Arrete Ministeriel 05/06/2026

---

| Attribut | Valeur |
|---|---|
| Version | 1.0 |
| Date | 2025-06-09 |
| Total cas de test | 55 |
| Reference | Arrete ministeriel n°2026-05-06 |
| Statut | Pret pour execution |

---

## Cartographie des exigences reglementaires aux cas de test

```
+----------------------------------+---------------+----------+
| Exigence reglementaire           | Article       | Cas test |
+----------------------------------+---------------+----------+
| Delai conformite 3 mois (import) | Art. 5.1      | R-01/05  |
| Delai conformite 6 mois (distrib)| Art. 5.2      | R-06/10  |
| Delai conformite 1 an (detail)   | Art. 5.3      | R-11/15  |
| Fermeture admin. si non-conforme | Art. 6        | R-16/20  |
| Rapport trimestriel obligatoire  | Art. 7        | R-21/30  |
| Contenu obligatoire du rapport   | Art. 7.1-7.8  | R-31/38  |
| Format soumission XML + PDF      | Art. 7.9      | R-39/43  |
| Mention numero agreement facture | Art. 8.1      | R-44/46  |
| Prix anormaux > 20%              | Art. 8.2      | R-47/50  |
| Vehicules interdits depuis 2022  | Art. 9        | R-51/55  |
+----------------------------------+---------------+----------+
```

---

## R.1 — Delai de Conformite 3 Mois (Importateurs) [5 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| R-01 | F, A | Compte a rebours 90 jours a l'enregistrement | Nouvel importateur "NOUVEAU IMPORT BF" enregistre le 01/01/2026 | 1. Enregistrer l'importateur 2. Consulter son tableau de bord conformite 3. Verifier le compte a rebours | Compte a rebours affiche "90 jours restants", date d'echeance calculee au 01/04/2026, statut "Delai en cours" | Critique |
| R-02 | F, A | Conformite atteinte dans les 90 jours | Importateur R-01 enregistre, delai court | 1. Completer toutes les exigences (documents, stock, KYC) 2. Soumettre le rapport trimestriel 3. Atteindre score >= 120/150 avant le 01/04/2026 | Statut "Conforme", compte a rebours remplace par "Conformite validee", agreement confirme | Critique |
| R-03 | F, A | Non-conformite a J-7 (alerte critique) | Importateur R-01, date actuelle: 25/03/2026 | 1. Verifier les notifications 2. Consulter le tableau de bord | Alerte rouge "7 jours avant expiration du delai de conformite", notification email + SMS, compte a rebours clignotant en rouge | Critique |
| R-04 | F, H | Non-conformite au bout de 90 jours (suspension) | Importateur R-01, date: 02/04/2026, score < 100 | 1. Executer le batch quotidien de verification des delais 2. Verifier le statut de l'importateur | Statut passe a "Non conforme — delai expire", agreement suspendu, notification au ministere, operations bloquees, procedure de fermeture initiee | Critique |
| R-05 | F, H | Derogation ministerielle (exception) | Importateur R-01, delai expire, demande de derogation | 1. L'importateur soumet une demande de derogation avec motif force majeure 2. Le ministere examine la demande 3. Le ministere accorde une derogation de 30 jours | Derogation enregistree, nouveau delai fixe, compte a rebours mis a jour, statut "Derogation accordee" | Haute |

---

## R.2 — Delai de Conformite 6 Mois (Distributeurs) [5 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| R-06 | F, A | Compte a rebours 180 jours a l'enregistrement | Nouveau distributeur enregistre le 01/01/2026 | 1. Enregistrer le distributeur 2. Consulter le tableau de bord conformite | Compte a rebours affiche "180 jours restants", echeance calculee au 01/07/2026 | Critique |
| R-07 | F | Points de conformite distributeur (checklist) | Distributeur enregistre | 1. Consulter la checklist de conformite 2. Verifier les criteres obligatoires | Checklist affiche: contrat avec importateur agree (obligatoire), localisation geographique (obligatoire), capacite logistique (obligatoire), systeme de tracabilite (obligatoire) | Critique |
| R-08 | F, H | Verification rattachement importateur agree | Distributeur tente d'obtenir l'agreement sans importateur | 1. Enregistrer un distributeur sans lien avec un importateur 2. Tenter de demander l'agreement | Message d'erreur "Rattachement a un importateur agree obligatoire — Article 4.2 de l'arrete", demande bloquee | Critique |
| R-09 | F | Score conformite distributeur (calcul specifique) | Distributeur avec donnees partielles | 1. Calculer le score de conformite 2. Verifier la ponderation | Score calcule sur 150 points avec ponderation: documents (25pts), importateur (25pts), stocks (25pts), KYC (25pts), rapports (25pts), securite (25pts) | Haute |
| R-10 | F, H | Non-conformite distributeur apres 6 mois | Distributeur, date: 02/07/2026, score < 100 | 1. Executer le batch de verification 2. Verifier le statut | Agreement suspendu, importateur notifie, retrait de la liste des distributeurs agreees, stocks a transferer dans 30 jours | Critique |

---

## R.3 — Delai de Conformite 1 An (Detaillants) [5 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| R-11 | F, A | Compte a rebours 365 jours a l'enregistrement | Nouveau detaillant enregistre le 01/01/2026 | 1. Enregistrer le detaillant 2. Consulter le tableau de bord conformite | Compte a rebours affiche "365 jours restants", echeance calculee au 01/01/2027 | Critique |
| R-12 | F | Points de conformite detaillant (checklist specifique) | Detaillant enregistre | 1. Consulter la checklist 2. Verifier les criteres | Checklist avec: permis d'ouvrir (25pts), agreement distributeur (25pts), KYC clients (30pts), facturation OHADA (25pts), rapports (20pts), securite (25pts) | Critique |
| R-13 | F | Detaillant vendeur sans KYC client (blocage) | Client sans piece d'identite | 1. Tenter d'enregistrer une vente sans KYC complet 2. Valider | Vente bloquee, message "Vente interdite sans verification d'identite — Article 12 de l'arrete", alerte enregistree | Critique |
| R-14 | F | Detaillant avec localisation geographique obligatoire | Detaillant sans coordonnees GPS | 1. Verifier la checklist conformite 2. Constater l'absence de coordonnees | Critere "Localisation GPS" en rouge, score impacte, detaillant invite a completer | Haute |
| R-15 | F, H | Non-conformite detaillant apres 1 an | Detaillant, date: 02/01/2027, score < 100 | 1. Executer le batch de verification 2. Verifier le statut | Agreement suspendu, fermeture administrative possible, notification au proprietaire et au ministere | Critique |

---

## R.4 — Fermeture Administrative si Non-Conforme [5 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| R-16 | H, F | Procedure de fermeture administrative (importateur) | Importateur avec score 60/150, delai expire depuis 30 jours | 1. Le ministere initie la procedure 2. Notification de mise en demeure envoyee (J0) 3. Attendre 15 jours sans correction 4. Prononcer la fermeture | Fermeture administrative enregistree, agreement revoque, publication au Journal Officiel, blocage immediat des operations | Critique |
| R-17 | H, F | Procedure de fermeture (distributeur) | Distributeur non-conforme, delai expire | 1. Mise en demeure (J0) 2. Delai de 15 jours 3. Fermeture si pas de correction | Fermeture enregistree, retrait de la liste, importateur source notifie pour reprise des stocks | Critique |
| R-18 | H, F | Procedure de fermeture (detaillant) | Detaillant non-conforme, delai expire | 1. Mise en demeure (J0) 2. Delai de 15 jours 3. Fermeture si pas de correction | Fermeture enregistree, retrait de la liste, distributeur source notifie | Critique |
| R-19 | H | Recours contre la fermeture administrative | Operateur R-16 fait un recours | 1. L'operateur depose un recours dans les 15 jours 2. Le ministere examine le recours 3. Decision: maintenir ou annuler la fermeture | Recours enregistre avec reference, procedure de recours suivie, decision motivee notifiee | Haute |
| R-20 | H | Execution de la fermeture (constat) | Fermeture R-16 confirmee | 1. Envoi des agents pour constat de fermeture 2. Enregistrement du constat 3. Cloture dans le systeme | Constat enregistre avec photos, date, agents, reference procedure, statut "Fermeture executee" | Critique |

---

## R.5 — Rapport Trimestriel Obligatoire [10 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| R-21 | E | Echeance rapport trimestriel Q1 (15 avril) | Annee 2026, operateurs actifs | 1. Verifier les echeances dans le systeme 2. Constater la date du 15/04/2026 | Echeance "T1-2026" affichee pour tous les operateurs actifs, compte a rebours actif | Critique |
| R-22 | E | Echeance rapport trimestriel Q2 (15 juillet) | Operateurs actifs | 1. Verifier les echeances | Echeance "T2-2026" au 15/07/2026 affichee | Critique |
| R-23 | E | Echeance rapport trimestriel Q3 (15 octobre) | Operateurs actifs | 1. Verifier les echeances | Echeance "T3-2026" au 15/10/2026 affichee | Critique |
| R-24 | E | Echeance rapport trimestriel Q4 (15 janvier 2027) | Operateurs actifs | 1. Verifier les echeances | Echeance "T4-2026" au 15/01/2027 affichee | Critique |
| R-25 | E | Soumission dans les delais | Operateur avec rapport pret avant le 15/04/2026 | 1. Generer le rapport 2. Le soumettre le 10/04/2026 | Rapport soumis dans les delais, statut "Soumis a temps", pas de penalite | Critique |
| R-26 | E | Soumission en retard (penalite) | Operateur soumet le 20/04/2026 | 1. Soumettre le rapport 2. Verifier le calcul de la penalite | Rapport accepte, penalite calculee: 5 jours de retard × X FCFA/jour, montant du, notification de penalite | Critique |
| R-27 | E | Non-soumission (procedure de sanction) | Operateur ne soumet pas le rapport T1-2026 | 1. Attendre le 16/04/2026 2. Executer le batch de verification 3. Verifier les actions | Alerte au ministere, procedure de sanction initiee, score conformite impacte (-30 points), notification de mise en demeure | Critique |
| R-28 | E | Rapport soumis mais incomplet (rejet) | Operateur soumet un rapport avec donnees manquantes | 1. Soumettre le rapport 2. Le ministere verifie 3. Rejeter pour incompletude | Rapport rejete, motif detaille des manquements, operateur invite a completer et resoumettre | Critique |
| R-29 | E | Rapport soumis par operateur suspendu | Operateur avec agreement suspendu | 1. Tenter de soumettre un rapport 2. Verifier la reponse | Message d'erreur "Soumission impossible — operateur suspendu. Regulariser votre situation d'abord." | Haute |
| R-30 | E | Consolidation nationale des rapports | Tous les rapports T1-2026 soumis | 1. Le ministere genere le rapport national 2. Verifier le contenu | Rapport national avec: total des ventes, total des stocks, total des operateurs, taux de conformite global, alertes | Haute |

---

## R.6 — Contenu Obligatoire du Rapport [8 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| R-31 | E | Section 1: Identification de l'operateur | Rapport en cours de generation | 1. Verifier la section identification | Contient: denomination sociale, RCCM, IFU, numero agreement, adresse, telephone, email, type d'operateur | Critique |
| R-32 | E | Section 2: Stock initial | Rapport en cours | 1. Verifier la section stock initial | Contient: nombre d'engins en stock au debut du trimestre, liste des VIN, valeur du stock | Critique |
| R-33 | E | Section 3: Entrees de stock | Rapport en cours | 1. Verifier la section entrees | Contient: nombre d'engins recus, liste des VIN, dates de reception, origine (importateur/fabricant) | Critique |
| R-34 | E | Section 4: Sorties de stock | Rapport en cours | 1. Verifier la section sorties | Contient: nombre d'engins vendus/transférés, liste des VIN, dates, destinataires | Critique |
| R-35 | E | Section 5: Stock final | Rapport en cours | 1. Verifier la section stock final | Contient: nombre d'engins en stock fin trimestre, liste des VIN, verification: SI + Entrees - Sorties = SF | Critique |
| R-36 | E | Section 6: Ventes detaillees | Rapport en cours | 1. Verifier la section ventes | Contient: pour chaque vente — date, VIN, modele, prix de vente, acheteur (nom, CNIB), numero facture | Critique |
| R-37 | E | Section 7: Liste des clients | Rapport en cours | 1. Verifier la section clients | Contient: nombre de clients uniques, liste avec nom, CNIB, telephone, nombre d'achats | Critique |
| R-38 | E | Section 8: Etat de conformite | Rapport en cours | 1. Verifier la section conformite | Contient: score conformite /150, details par critere, plan d'action si non-conforme | Critique |

---

## R.7 — Format de Soumission XML + PDF [5 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| R-39 | E | Validation XML contre schema XSD ministeriel | Fichier XML genere | 1. Soumettre le XML au validateur 2. Verifier le resultat | XML valide: structure conforme, balises obligatoires presentes, types de donnees respectes, encodage UTF-8 | Critique |
| R-40 | E | Structure XML obligatoire (racine et sections) | Fichier XML en cours de validation | 1. Verifier la racine: <rapport-trimestriel> 2. Verifier les sections filles | Racine correcte, sections: <identification>, <stock-initial>, <entrees>, <sorties>, <stock-final>, <ventes>, <clients>, <conformite> | Critique |
| R-41 | E | Signature numerique XML (XAdES) | Fichier XML valide | 1. Verifier la signature numerique 2. Controler le certificat | Signature XAdES valide, certificat de l'operateur verifie, horodatage present, non-repudiation assuree | Critique |
| R-42 | E | PDF avec mise en page ministerielle | PDF genere | 1. Verifier la mise en page 2. Verifier les mentions obligatoires | En-tete "Republique du Burkina Faso — Ministere du Commerce", logo officiel, numero de page, date de generation | Haute |
| R-43 | E | Archivage reglementaire (10 ans) | Rapport soumis et valide | 1. Verifier l'archivage 2. Verifier la duree | Rapport archive avec reference unique, accessible pendant 10 ans, integrite garantie (hash SHA-256), immuable | Critique |

---

## R.8 — Mention Numero Agreement sur Facture [3 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| R-44 | D | Mention agreement obligatoire sur facture | Detaillant "MOTO SHOP OUAGA" avec agreement "AGR-DET-2026-045" | 1. Generer une facture de vente 2. Verifier le contenu | Facture contient en bas de page: "Operateur agree sous le numero AGR-DET-2026-045 conformement a l'arrete ministeriel 05/06/2026" | Critique |
| R-45 | D | Absence de mention = facture non conforme | Operateur sans agreement (suspension) | 1. Tenter de generer une facture 2. Verifier | Generation bloquee ou facture avec mention "NON CONFORME — operateur non agree", alerte au ministere | Critique |
| R-46 | D | Verification OCR de la mention (controle) | Facture scannee | 1. Scanner la facture avec OCR 2. Extraire le numero d'agreement | Numero "AGR-DET-2026-045" detecte, correspondance avec le registre verifiee, facture conforme confirmee | Haute |

---

## R.9 — Prix Anormaux > 20% [4 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| R-47 | D | Detection marge > 20% (alerte) | Prix revient = 1 800 000 FCFA, prix vente = 2 500 000 FCFA | 1. Enregistrer le prix de vente 2. Calculer la marge | Marge = 38.9%, alerte "Marge superieure au seuil reglementaire de 20%", champ justification obligatoire | Critique |
| R-48 | D | Marge > 20% avec justification valide | Alerte R-47 active | 1. Saisir la justification "Modele edition limitee, cout de certification supplementaire" 2. Uploader justificatif 3. Soumettre | Alerte archivee avec justification, signalement au ministere pour information, vente autorisee | Haute |
| R-49 | D | Marge > 20% sans justification (blocage) | Alerte R-47 active | 1. Ne pas fournir de justification 2. Tenter de valider la vente | Vente bloquee, message "Justification obligatoire pour marge > 20% — Article 8.2 de l'arrete", alerte au ministere | Critique |
| R-50 | D | Sous-evaluation (prix < prix revient) | Prix revient = 1 800 000 FCFA, prix vente = 1 200 000 FCFA | 1. Enregistrer le prix de vente 2. Verifier l'alerte | Alerte "Sous-evaluation detectee — prix de vente inferieur au prix de revient", blocage vente, signalement CNTI | Critique |

---

## R.10 — Vehicules Interdits depuis 2022 [5 cas]

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| R-51 | B, G | Modele interdit en stock (detection) | Modele "MOTO-BAN-2022-XYZ" date de 2021 en stock | 1. Executer le batch de verification des modeles 2. Verifier les alertes | Alerte critique "Modele interdit detecte en stock — Reference: MOTO-BAN-2022-XYZ, Date d'interdiction: 01/01/2022", signalement au ministere | Critique |
| R-52 | B, G | Blocage vente modele interdit | Client veut acheter un modele interdit | 1. Tenter d'enregistrer la vente 2. Valider | Message d'erreur "Vente interdite — ce modele est interdit a la vente depuis le 01/01/2022 (Article 9 de l'arrete)", transaction bloquee | Critique |
| R-53 | B, G | Blocage importation modele interdit | Importateur tente d'importer un modele interdit | 1. Tenter d'enregistrer l'arrivee du stock 2. Valider | Message d'erreur "Importation interdite — modele sur liste noire", enregistrement bloque, alerte douane + ministere | Critique |
| R-54 | G | Mise a jour liste noire ministerielle | Nouvel arrete interdit un modele supplementaire | 1. Le ministere publie la mise a jour 2. Le systeme importe la nouvelle liste 3. Verifier la detection | Nouveau modele detecte dans les stocks existants, alertes generees pour chaque occurrence, plan de retrait requis | Critique |
| R-55 | G | Rapport annuel des modeles interdits detectes | Annee 2026 close | 1. Le ministere genere le rapport annuel 2. Verifier le contenu | Rapport avec: nombre de modeles interdits detectes, nombre d'engins concernes, actions menees, operateurs sanctionnes | Haute |

---

## Annexe — Methodologie de Test Reglementaire

### Niveaux de verification

```
+----------+----------------------------------+-------------+
| Niveau   | Methode                          | Outil       |
+----------+----------------------------------+-------------+
| Niveau 1 | Verification automatisee (batch) | Tests auto  |
| Niveau 2 | Revue manuelle par expert metier | Checklist   |
| Niveau 3 | Validation par le ministere      | UAT         |
| Niveau 4 | Audit externe independant        | Auditeur    |
+----------+----------------------------------+-------------+
```

### Donnees de test reglementaires specifiques

| Parametre | Valeur test | Article reference |
|---|---|---|
| Delai importateur | 90 jours calendaires | Art. 5.1 |
| Delai distributeur | 180 jours calendaires | Art. 5.2 |
| Delai detaillant | 365 jours calendaires | Art. 5.3 |
| Echeance rapport | 15 du mois suivant le trimestre | Art. 7 |
| Seuil marge anormale | 20% | Art. 8.2 |
| Date interdiction modeles | 01/01/2022 | Art. 9 |
| Delai mise en demeure avant fermeture | 15 jours | Art. 6 |
| Penalite retard rapport | X FCFA/jour | Art. 7.10 |
| Duree archivage | 10 ans | Art. 7.9 |
| Mention agreement facture | Obligatoire | Art. 8.1 |

---

*Document genere par l'equipe QA Reglementaire iReg Moto BF — 55 cas de test reglementaires*
