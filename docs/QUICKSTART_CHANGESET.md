# Guide de Démarrage Rapide - Releases avec Changeset

## 🚀 Configuration terminée !

Votre monorepo est maintenant configuré pour gérer les releases et prereleases avec Changeset.

## 📦 Package configuré

- **@deazl/shopping-lists** : `packages/applications/shopping-lists`

## ⚡ Actions rapides

### 1. Créer un changeset (obligatoire avant chaque release)

```bash
yarn changeset:add
```

Cela vous demandera :
- Quel package est affecté
- Le type de changement (patch/minor/major)
- Une description du changement

### 2. Voir les changements en attente

```bash
yarn changeset:status
```

### 3. Créer une prerelease beta

```bash
# Option 1: Manuelle
yarn changeset:beta       # Entrer en mode beta
yarn changeset:version    # Appliquer les versions
yarn changeset:publish --dry-run  # Simuler la publication

# Option 2: Automatique
yarn release:beta
```

### 4. Créer une release normale

```bash
yarn changeset:version    # Met à jour les versions
yarn changeset:publish --dry-run  # Simuler la publication
```

## 🔄 Workflow recommandé

### Pour le développement quotidien :

1. **Développez votre feature**
2. **Créez un changeset** : `yarn changeset:add`
3. **Committez tout** : `git add . && git commit -m "feat: nouvelle feature"`
4. **Testez avec une prerelease** : `yarn release:beta`

### Pour une release stable :

1. **Mergez sur master**
2. **GitHub Actions** se charge automatiquement du reste !

## 🛠️ Scripts disponibles

- `yarn changeset:test` - Affiche toutes les options disponibles
- `yarn changeset:add` - Créer un changeset
- `yarn changeset:status` - Voir le statut
- `yarn changeset:version` - Appliquer les versions
- `yarn changeset:publish` - Publier (ajoutez `--dry-run` pour simuler)
- `yarn release:beta/alpha/canary` - Prereleases automatiques
- `yarn release` - Release normale

## 🎯 Test rapide

Essayez maintenant :

```bash
# Tester le système
yarn changeset:test

# Créer un changeset d'exemple
yarn changeset:add

# Voir le statut
yarn changeset:status
```

## 📚 Documentation complète

Consultez `docs/CHANGESET_GUIDE.md` pour tous les détails.
