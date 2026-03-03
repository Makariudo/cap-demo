# Rule: Playwright-CLI & Semantic Testing Policy

## 📋 Directives Générales
- **CLI-First** : La manipulation du navigateur se fait exclusivement via `npx playwright`.
- **Zéro HTML** : Interdiction de fournir le DOM complet aux agents. Utiliser les snapshots YAML/AOM pour l'analyse de structure.
- **Authentification** : Utilisation obligatoire du `storageState` (`auth.json`) pour éviter les flux de login redondants.

## 🛠 Standards de Code
- **Accessibilité** : Priorité absolue aux sélecteurs `getByRole`.
- **Stabilité** : Assertions asynchrones (`expect`) obligatoires.