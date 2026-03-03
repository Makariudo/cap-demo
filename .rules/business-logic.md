# Business Logic: AllureCap Engine

## 🎯 Vision Métier
AllureCap est un outil de précision pour athlètes. L'erreur n'est pas une option : une seconde d'écart sur une allure de seuil peut fausser tout un plan d'entraînement.

## 🧮 Logique de Calcul (Règles Critiques)
1. **Source de Vérité** : L'utilisateur peut piloter le tableau via deux entrées mutuellement exclusives :
   - **VMA** (Vitesse Maximale Aérobie) en km/h.
   - **Performance de Référence** (Distance + Temps).
2. **Calcul des Allures** : L'allure (min/km) est l'inverse de la vitesse. 
   - *Formule* : `Allure = 60 / Vitesse`.
   - *Exigence* : L'affichage doit arrondir à la seconde inférieure pour ne pas surestimer l'athlète.
3. **Tableau de Projection** : 
   - Les colonnes (400m, 1000m, 10km, etc.) doivent se mettre à jour en temps réel sans rechargement de page.
   - Les temps de passage doivent être calculés linéairement par rapport au % de VMA choisi.

## 🎨 Système de Zones (Color-Coding)
L'agent QA doit valider l'application des background-color basées sur les zones cibles lorsque le bouton "Enable color mode" est enclenché. Les couleurs sont les suivantes :
Vert pour un objectif raisonnable jusqu'à rouge pour un objectif ambitieux. Avec un dégradé de couleurs entre les deux.

## ⚙️ Options d'Affichage
- L'utilisateur peut masquer/afficher des distances spécifiques.
- **Règle** : Si une distance est masquée, elle ne doit plus être présente dans l'AOM (Accessibility Object Model) pour éviter toute confusion pour l'agent de test.