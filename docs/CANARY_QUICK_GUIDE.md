# 🧪 Guide Canary Release - Prêt à utiliser

## 🚀 TL;DR - Créer une release canary

```bash
# 1. Créer un changeset
yarn changeset

# 2. Push sur canary (déclenche automatiquement le workflow)
git push origin canary
```

**C'est tout !** Le workflow GitHub Actions se charge du reste.

## 📋 Commandes disponibles

### Changeset standard
```bash
yarn changeset              # Créer un changeset
yarn changeset:version      # Versionner (manuel)
yarn changeset:status       # Voir le statut
```

### Mode canary 
```bash
yarn changeset pre enter canary  # Entrer en mode canary
yarn changeset:pre:exit          # Sortir du mode canary
```

### Tests et debugging
```bash
yarn canary:workflow       # Tester le workflow complet
yarn changeset:release     # Créer release GitHub manuellement
```

## 🔄 Workflow automatique

1. **Push sur `canary`** → Déclenche `.github/workflows/canary-release.yml`
2. **Le workflow fait**:
   - ✅ Vérifie les changesets
   - ✅ Entre en mode canary prerelease
   - ✅ Crée versions `X.X.X-canary.0`
   - ✅ Crée tags Git `@deazl/package@X.X.X-canary.0`
   - ✅ Crée releases GitHub avec flag prerelease
   - ✅ Push les changements

## 📦 Packages concernés

- `@deazl/components` (packages/components/)
- `@deazl/system` (packages/core/system/)

## 🎯 Status

**✅ Fonctionnel** - Le problème de détection des packages a été résolu.

## 🆘 En cas de problème

1. **Workflow échoue ?** → Vérifier les logs GitHub Actions
2. **Pas de packages détectés ?** → Lancer `yarn canary:test`  
3. **Tags existants ?** → Le workflow skip automatiquement
4. **Besoin de debug ?** → Utiliser `yarn canary:workflow`

## 📚 Documentation complète

- `docs/CANARY_RELEASE_STATUS.md` - Status détaillé et corrections
- `docs/CANARY_RELEASE_FIX.md` - Guide de résolution des problèmes
- `docs/GITHUB_RELEASES_WITHOUT_NPM.md` - Configuration complète
