# 🏷️ Releases GitHub sans Publication NPM

## Problème résolu

Ce guide explique comment utiliser Changeset pour créer des releases GitHub **sans publier sur NPM**, car votre monorepo est privé.

## Configuration

### 1. Configuration Changeset

Le fichier `.changeset/config.json` a été configuré avec :
```json
{
  "privatePackages": {
    "version": true,
    "tag": true
  }
}
```

### 2. Workflow GitHub Actions

Le workflow `.github/workflows/release.yml` utilise maintenant :
```yaml
- name: Create Release Pull Request or Release
  uses: changesets/action@v1
  with:
    createGithubReleases: true  # 👈 Active la création de releases GitHub
```

## Utilisation

### Option 1: Automatique via GitHub Actions

1. **Créez des changesets** :
   ```bash
   yarn changeset:add
   ```

2. **Pushez vers la branche `canary`** :
   ```bash
   git add .
   git commit -m "feat: nouvelle fonctionnalité"
   git push origin canary
   ```

3. **GitHub Actions va automatiquement** :
   - Créer une PR "Version Packages" OU
   - Créer directement les releases GitHub si les packages ont été versionnés

### Option 2: Manuelle avec le script

Utilisez le nouveau script intégré :

```bash
# Script interactif pour créer les releases
yarn changeset:release
```

Le script propose :
1. **Créer les versions** seulement
2. **Créer les tags et releases GitHub** seulement  
3. **Processus complet** (version + release)

### Option 3: Commandes manuelles

```bash
# 1. Créer les versions (consomme les changesets)
yarn changeset version

# 2. Committer les changements
git add .
git commit -m "ci(changesets): version packages"

# 3. Build (optionnel)
yarn build

# 4. Créer les tags et releases GitHub manuellement
git tag "@deazl/shopping-lists@1.0.5"
gh release create "@deazl/shopping-lists@1.0.5" \
  --title "🚀 Release: @deazl/shopping-lists@1.0.5" \
  --notes "Description des changements..."
```

## Types de releases créées

### Releases normales (branche canary)
- **Tag** : `@package/name@1.0.0`
- **Titre** : `🚀 Release: @package/name@1.0.0`
- **Status** : Latest release

### Prereleases (autres branches)
- **Tag** : `@package/name@1.0.0-beta.1`
- **Titre** : `🧪 Beta Release: @package/name@1.0.0-beta.1`
- **Status** : Prerelease

## Contenu des releases

Chaque release GitHub contient :

✅ **Description automatique** des changements  
✅ **Instructions d'installation** (via git clone)  
✅ **Informations sur le package** et la version  
✅ **Liens vers les CHANGELOGs**  
✅ **Artefacts de build** (si disponibles)  

## Exemple de release créée

```markdown
🎉 **Release: @deazl/shopping-lists@1.0.5**

Cette release inclut les dernières fonctionnalités et corrections.

**Installation:**
```bash
# Ces packages sont privés et ne sont pas publiés sur NPM
# Clonez le repository et utilisez ce tag :
git clone https://github.com/Deazl-Comparator/deazl.git
git checkout @deazl/shopping-lists@1.0.5
yarn install && yarn build
```

**Package:** @deazl/shopping-lists  
**Version:** 1.0.5

**📋 Changements:** Voir le CHANGELOG du package pour tous les détails.
```

## Avantages de cette approche

✅ **Aucune publication npm** involontaire  
✅ **Releases GitHub automatiques** avec changesets  
✅ **Historique des versions** préservé  
✅ **CHANGELOGs automatiques** générés  
✅ **Tags Git** créés automatiquement  
✅ **Compatible avec les workflows existants**  
✅ **Script de fallback** pour les cas manuels  

## Vérification

Pour vérifier que tout fonctionne :

```bash
# 1. Créer un changeset de test
yarn changeset:add

# 2. Utiliser le script
yarn changeset:release

# 3. Vérifier sur GitHub
# Les releases apparaîtront dans la section "Releases" de votre repo
```

## Support

- 📖 [Documentation Changeset](https://github.com/changesets/changesets)
- 🔧 Script interactif : `yarn changeset:release`
- 📚 Guides existants dans `docs/`
