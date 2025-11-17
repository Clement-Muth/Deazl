# 🚀 Configuration Yarn Zero-Install Optimisée

Ce projet utilise une configuration **Yarn Zero-Install hybride** qui améliore significativement les performances d'installation tout en gardant la compatibilité avec l'écosystème existant.

## 🎯 Avantages

- ⚡ **Installation ultra-rapide** : Les packages sont mis en cache dans `.yarn/cache/`
- 🔄 **Pas de `yarn install` après git pull** : Les dépendances sont déjà disponibles
- 🏗️ **Compatible avec Next.js/Prisma** : Contrairement au PnP pur, garde `node_modules`
- 🚀 **CI/CD optimisé** : Réduction drastique du temps de build en CI

## ⚙️ Configuration

### `.yarnrc.yml`
```yaml
# Cache local au lieu du cache global
enableGlobalCache: false
cacheFolder: .yarn/cache

# Optimisations
nmMode: hardlinks-local
nmHoistingLimits: workspaces
```

### `.gitignore`
```gitignore
# Yarn Zero-Install - garde le cache, ignore l'état d'installation
.yarn/*
!.yarn/cache
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions
```

## 📋 Utilisation

### Pour les développeurs
```bash
# Après un git clone ou git pull, plus besoin de yarn install
git clone <repo>
cd <repo>
yarn build  # Fonctionne directement !

# Pour forcer une vérification
yarn install --check-cache
```

### Commandes utiles
```bash
# Tester la configuration
./scripts/test-zero-install.sh

# Nettoyer complètement
yarn clean

# Vérifier l'intégrité du cache
yarn install --check-cache
```

## 🔧 Résolution de problèmes

### Cache corrompu
```bash
rm -rf .yarn/cache node_modules
yarn install
```

### Problèmes de permissions
```bash
yarn config set nmMode hardlinks-local
```

## 📈 Performances attendues

- **Fresh install** : ~2-3 minutes (première fois)
- **Avec cache** : ~30-60 secondes
- **Post git-pull** : ~5-10 secondes (validation uniquement)

## 🚀 Migration depuis le mode classique

1. La configuration est déjà appliquée
2. Le cache sera créé progressivement
3. Commitez `.yarn/cache/` pour activer le Zero-Install complet
4. Les autres développeurs bénéficieront immédiatement des améliorations
