# Tests d'Accessibilite — iReg Moto BF
## Conformite WCAG 2.1 AA

---

| Attribut | Valeur |
|---|---|
| Version | 1.0 |
| Date | 2025-06-09 |
| Total cas de test | 35 |
| Standard | WCAG 2.1 AA (Web Content Accessibility Guidelines) |
| Outils | axe-core, Lighthouse, NVDA/VoiceOver, clavier |

---

## A.1 — Navigation Clavier [6 cas]

| ID | Criteres WCAG | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|---|
| A11Y-01 | 2.1.1 (Clavier) | ALL | Navigation complete au clavier | Page chargee | 1. Debrancher la souris 2. Naviguer avec Tab uniquement 3. Atteindre chaque element interactif | Tous les elements interactifs (liens, boutons, champs, menus) accessibles via Tab, ordre de tabulation logique, pas d'element bloquant | Critique |
| A11Y-02 | 2.1.2 (Pas de piege) | ALL | Pas de piege au clavier | Page avec formulaire | 1. Tabuler dans un champ 2. Verifier qu'on peut en sortir avec Tab ou Shift+Tab | Pas de blocage: l'utilisateur peut toujours quitter un element avec Tab/Shift+Tab/Echap, pas de piege clavier | Critique |
| A11Y-03 | 2.1.4 (Raccourcis) | ALL | Raccourcis clavier configurables | Application avec raccourcis | 1. Lister les raccourcis clavier 2. Verifier qu'ils sont configurables ou utilisent des modificateurs | Raccourcis utilisent Ctrl/Alt/ Cmd, utilisateur peut desactiver ou modifier les raccourcis | Moyenne |
| A11Y-04 | 2.4.3 (Ordre de focus) | ALL | Ordre de tabulation logique | Page avec formulaire multi-champs | 1. Tabuler a travers le formulaire 2. Verifier l'ordre | Ordre de tabulation: haut->bas, gauche->droite, conforme a la lecture visuelle, pas de saut | Haute |
| A11Y-05 | 2.4.7 (Focus visible) | ALL | Indicateur de focus visible | Page chargee | 1. Tabuler sur chaque element interactif 2. Verifier la visibilite du focus | Chaque element focus a un contour visible (outline >= 2px, couleur contrastee), focus non masque par d'autres elements | Haute |
| A11Y-06 | 2.4.11 (Focus masque) | ALL | Focus non masque par contenu sticky | Page avec header fixe | 1. Tabuler vers le bas de la page 2. Verifier que le focus reste visible | Element focusé toujours visible, header ne masque pas le focus, defilement automatique si necessaire | Moyenne |

---

## A.2 — Lecteur d'Ecran (NVDA/VoiceOver) [6 cas]

| ID | Criteres WCAG | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|---|
| A11Y-07 | 1.1.1 (Textes alternatifs) | ALL | Images avec textes alternatifs | Page avec images | 1. Activer NVDA/VoiceOver 2. Naviguer vers chaque image 3. Verifier l'annonce | Chaque image a un attribut alt descriptif (pas de "image" generique), images decoratives en aria-hidden="true" | Critique |
| A11Y-08 | 4.1.2 (Nom, Role, Valeur) | ALL | Composants interactifs avec ARIA | Page avec boutons, liens, formulaires | 1. Activer le lecteur d'ecran 2. Naviguer vers chaque composant 3. Verifier l'annonce | Chaque composant annonce: nom (label), role (button/link), valeur (etat actuel), etat (expanded/checked) | Critique |
| A11Y-09 | 2.4.6 (En-tetes) | E, H | Titres de page et sections hierarchiques | Page rapport/portail | 1. Naviguer avec le lecteur (touches H) 2. Verifier la hierarchie | H1 unique par page, H2->H3 hierarchiques, pas de saut (H1->H3), titres descriptifs | Haute |
| A11Y-10 | 4.1.3 (Messages statut) | ALL | Annonces de statut sans focus | Page avec notifications | 1. Declencher une notification (succes/erreur) 2. Verifier l'annonce lecteur | Message annonce via aria-live="polite/assertive", pas de changement de focus, utilisateur informe | Haute |
| A11Y-11 | 1.3.1 (Info et relations) | B, C | Tableaux de donnees avec en-tetes | Page avec tableaux (liste VIN, clients) | 1. Naviguer dans le tableau avec le lecteur 2. Verifier les annonces | Tableaux avec th (scope="col/row"), en-tetes associees aux cellules via headers/id, caption presente | Haute |
| A11Y-12 | 2.4.4 (Lien dans le contexte) | ALL | Liens avec texte descriptif | Page avec liens | 1. Naviguer vers les liens 2. Verifier le texte | Pas de "cliquez ici" ni "lire la suite", texte descriptif du lien comprehensible hors contexte | Haute |

---

## A.3 — Contraste et Visuel [5 cas]

| ID | Criteres WCAG | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|---|
| A11Y-13 | 1.4.3 (Contraste texte) | ALL | Texte sur fond avec contraste suffisant | Page chargee | 1. Mesurer le contraste avec axe-core/Lighthouse 2. Verifier chaque combinaison | Ratio de contraste >= 4.5:1 pour le texte normal, >= 3:1 pour le texte > 18pt ou gras > 14pt | Critique |
| A11Y-14 | 1.4.11 (Contraste non-texte) | ALL | Elements graphiques avec contraste | Page avec icones, graphiques | 1. Mesurer le contraste des elements non-texte 2. Verifier | Ratio de contraste >= 3:1 pour: icones, boutons, bordures de champs, graphiques informatifs | Haute |
| A11Y-15 | 1.4.1 (Utilisation couleur) | ALL | Information non transmise uniquement par couleur | Page avec alertes (rouge/orange/vert) | 1. Desactiver les couleurs (mode noir/blanc) 2. Verifier la comprehension | Information aussi transmise par: texte, icone, forme — alerte rouge = "Erreur" + icone X, pas seulement couleur | Critique |
| A11Y-16 | 1.4.12 (Espacement texte) | ALL | Adaptation de l'espacement du texte | Page chargee | 1. Appliquer: line-height 1.5, spacing paragraph 2x, letter-spacing 0.12em, word-spacing 0.16em 2. Verifier | Pas de perte de contenu, pas de chevauchement, fonctionnalite preservee, pas de scroll horizontal | Moyenne |
| A11Y-17 | 1.4.4 (Redimensionnement texte) | ALL | Texte lisible a 200% | Page chargee | 1. Zoomer a 200% dans le navigateur 2. Verifier l'affichage | Texte lisible sans perte d'information, pas de scroll horizontal (responsive), fonctionnalite preservee | Haute |

---

## A.4 — Redimensionnement et Zoom [3 cas]

| ID | Criteres WCAG | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|---|
| A11Y-18 | 1.4.4 (Zoom 200%) | ALL | Zoom a 200% sans perte | Page chargee | 1. Zoomer a 200% (Ctrl++) 2. Naviguer sur toutes les pages 3. Tester les fonctionnalites | Tout le contenu visible et fonctionnel, pas de scroll horizontal excessif, boutons cliquables, formulaires utilisables | Haute |
| A11Y-19 | 1.4.10 (Reflow 320px) | ALL | Reflow a 320px de large | Page chargee | 1. Redimensionner a 320px de large 2. Verifier le contenu | Contenu visible sans scroll horizontal, vertical seulement, pas de perte d'information, menu adapte (hamburger) | Haute |
| A11Y-20 | 1.4.12 (Zoom 400%) | ALL | Zoom a 400% (mobile) | Page chargee | 1. Zoomer a 400% 2. Verifier le contenu | Contenu adapte, pas de chevauchement, mode colonne unique, navigation accessible | Moyenne |

---

## A.5 — Reduction de Mouvement et Animation [3 cas]

| ID | Criteres WCAG | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|---|
| A11Y-21 | 2.2.2 (Pause, arret, masque) | ALL | Animations controlables | Page avec animations (loader, notifications) | 1. Verifier que les animations peuvent etre pausees 2. Ou qu'elles s'arretent apres 5 secondes | Animations s'arretent apres 5s OU bouton pause visible, pas de distraction continue | Moyenne |
| A11Y-22 | 2.3.1 (Flash) | ALL | Pas de flash 3 fois/seconde | Page chargee | 1. Analyser avec outil de detection de flash 2. Verifier | Pas de contenu clignotant > 3 flashes/seconde, pas de risque epilepsie photosensible | Haute |
| A11Y-23 | 2.3.3 (Mouvement) | ALL | Respect prefers-reduced-motion | Navigateur avec prefers-reduced-motion: reduce | 1. Activer "Reduire les mouvements" dans le systeme 2. Charger l'application 3. Verifier | Animations desactivees ou reduites, transitions instantanees, pas de mouvement inutile | Haute |

---

## A.6 — Formulaires et Saisie [5 cas]

| ID | Criteres WCAG | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|---|
| A11Y-24 | 1.3.5 (Identifiant input) | A, C | Champs de formulaire avec autocomplete | Formulaire d'enregistrement | 1. Verifier les attributs autocomplete sur chaque champ | Champs avec autocomplete pertinent: name, email, tel, address-line1, postal-code, etc. | Moyenne |
| A11Y-25 | 3.3.1 (Identification erreur) | ALL | Messages d'erreur clairs | Formulaire avec validation | 1. Soumettre un formulaire invalide 2. Verifier les messages d'erreur | Erreur identifiee en texte, champ en erreur signale (aria-invalid="true"), message associe via aria-describedby | Haute |
| A11Y-26 | 3.3.2 (Etiquettes instructions) | ALL | Labels associes aux champs | Formulaire charge | 1. Verifier que chaque champ a un label 2. Verifier l'association | Chaque input a un label (ou aria-label/aria-labelledby), association via for/id | Haute |
| A11Y-27 | 3.3.3 (Suggestion erreur) | ALL | Suggestions de correction | Formulaire en erreur | 1. Soumettre un email invalide "test@test" 2. Verifier le message | Message: "Format email invalide — attendu: exemple@domaine.bf", suggestion de correction | Moyenne |
| A11Y-28 | 3.3.4 (Prevention erreur) | D, E | Confirmation avant action critique | Page avec actions destructrices | 1. Cliquer "Supprimer" sur une vente 2. Verifier la confirmation | Boite de dialogue de confirmation avec focus sur "Annuler", action explicite requise | Haute |

---

## A.7 — Structure et Landmarks [4 cas]

| ID | Criteres WCAG | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|---|
| A11Y-29 | 1.3.1 (Landmarks ARIA) | ALL | Landmarks de page definis | Page chargee | 1. Verifier les landmarks avec axe-core 2. Naviguer avec lecteur d'ecran (touches D) | Landmarks presents: <header> (banner), <nav> (navigation), <main> (main), <footer> (contentinfo), pas de landmark duplique | Haute |
| A11Y-30 | 2.4.1 (Contournement bloc) | ALL | Lien d'evitement | Page chargee | 1. Appuyer sur Tab au chargement 2. Verifier le lien d'evitement | Premier Tab = "Aller au contenu principal" visible, lien fonctionnel, saute la navigation | Haute |
| A11Y-31 | 2.4.5 (Multiples chemins) | ALL | Plusieurs facons de naviguer | Application complete | 1. Verifier: menu navigation, recherche, fil d'Ariane, plan du site | Plusieurs moyens d'acceder au contenu: menu, recherche, liens contextuels, fil d'Ariane | Faible |
| A11Y-32 | 4.1.1 (Parsing) | ALL | HTML valide | Page chargee | 1. Valider le HTML avec W3C Validator 2. Verifier | HTML5 valide, balises fermees correctement, IDs uniques, attributs valides | Moyenne |

---

## A.8 — Contenu Temporel et Multimedia [3 cas]

| ID | Criteres WCAG | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|---|
| A11Y-33 | 1.2.1 (Contenu audio/video) | ALL | Videos avec sous-titres/transcription | Page avec video tutoriel | 1. Verifier la presence de sous-titres 2. Verifier la transcription | Sous-titres synchronises (WebVTT), transcription textuelle disponible, contenu accessible sans le son | Faible |
| A11Y-34 | 1.4.2 (Controle audio) | ALL | Audio controllable | Page avec notifications sonores | 1. Verifier le controle du volume 2. Verifier la desactivation | Bouton de controle du volume, notifications sonores desactivables, pas de son automatique > 3s | Faible |
| A11Y-35 | 2.2.1 (Limitation temps) | ALL | Session avec limite de temps | Session utilisateur active | 1. Attendre l'alerte de fin de session 2. Verifier le comportement | Alerte avant expiration (5 min), possibilite d'etendre la session, donnees conservees | Haute |

---

## Matrice de Couverture WCAG 2.1 AA

```
+----------------------------------+---------+----------+--------------------------------+
| Principe WCAG                    | Niveau A| Niveau AA| Cas de test                    |
+----------------------------------+---------+----------+--------------------------------+
| 1. Perceptible                   |         |          |                                |
|   1.1 Textes alternatifs         | X       |          | A11Y-07                        |
|   1.2 Media temporels            | X       |          | A11Y-33, 34                    |
|   1.3 Adaptable                  | X       |          | A11Y-09, 11, 24, 29            |
|   1.4 Distinguable               | X       | X        | A11Y-13, 14, 15, 16, 17, 18    |
|                                  |         |          | 19, 20, 21, 22, 23             |
+----------------------------------+---------+----------+--------------------------------+
| 2. Utilisable                    |         |          |                                |
|   2.1 Accessible clavier         | X       |          | A11Y-01, 02, 03                |
|   2.2 Suffisamment de temps      | X       |          | A11Y-21, 35                    |
|   2.3 Convulsions                 | X       | X        | A11Y-22, 23                    |
|   2.4 Navigable                  | X       | X        | A11Y-04, 05, 06, 10, 12, 30    |
|                                  |         |          | 31                             |
|   2.5 Modalites input            | X       | X        | A11Y-03 (cible)                |
+----------------------------------+---------+----------+--------------------------------+
| 3. Comprehensible                |         |          |                                |
|   3.1 Lisible                    | X       |          | (Langue francaise par defaut)  |
|   3.2 Predictible                | X       |          | A11Y-28                        |
|   3.3 Assistance saisie          | X       | X        | A11Y-25, 26, 27, 28            |
+----------------------------------+---------+----------+--------------------------------+
| 4. Robuste                       |         |          |                                |
|   4.1 Compatible                 | X       |          | A11Y-08, 29, 32                |
+----------------------------------+---------+----------+--------------------------------+
```

---

## Plan d'execution des tests d'accessibilite

### Outils et configuration

```yaml
tools_accessibility:
  automatises:
    - name: "axe-core"
      usage: "Tests automatises dans Cypress/Playwright"
      coverage: "~30% des criteres"
      frequency: "Chaque build"
    
    - name: "Lighthouse"
      usage: "Audit score accessibilite"
      coverage: "Score global + detection erreurs"
      frequency: "Chaque build"
      target_score: ">= 90"
    
    - name: "WAVE"
      usage: "Audit visuel manuel"
      coverage: "Detection visuelle des problemes"
      frequency: "Chaque sprint"
  
  manuels:
    - name: "NVDA (Windows)"
      usage: "Test lecteur d'ecran"
      version: "2024.x"
      pages_test: "Toutes les pages critiques"
    
    - name: "VoiceOver (macOS)"
      usage: "Test lecteur d'ecran alternatif"
      version: "macOS Sonoma"
    
    - name: "Navigation clavier"
      usage: "Test sans souris"
      methode: "Tab, Shift+Tab, Enter, Espace, Fleches"
```

### Pages a tester

| Priorite | Page | Modules | WCAG cible |
|---|---|---|---|
| P1 | Page de connexion | Auth | Tous |
| P1 | Tableau de bord operateur | A-H | Tous |
| P1 | Formulaire enregistrement acteur | A | Formulaires |
| P1 | Formulaire enregistrement VIN | B | Formulaires |
| P1 | Formulaire vente + generation facture | C, D | Formulaires |
| P1 | Generation rapport trimestriel | E | Formulaires, telechargement |
| P1 | Vue conformite + plan d'action | F | Tableaux, formulaires |
| P1 | Portail ministere vue nationale | H | Tableaux, graphiques |
| P2 | Liste noire modeles | G | Tableaux |
| P2 | Historique propriete | C | Navigation |
| P2 | Parametres utilisateur | Auth | Formulaires |

---

*Document genere par l'equipe QA Reglementaire iReg Moto BF — 35 cas de test accessibilite*
