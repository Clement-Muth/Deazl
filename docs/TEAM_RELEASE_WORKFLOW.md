# 🚀 Workflow de Release - Équipe de 7 développeurs

## 📅 Planning des Releases

### Releases automatiques (quotidiennes)
- **Branche `dev`** → Prerelease automatique (`beta`)
- **But**: Tester les features en cours de développement
- **Qui**: Tous les développeurs peuvent merger

### Releases stables (hebdomadaires)
- **Responsable rotation**: 1 dev par semaine
- **Process**: 
  1. Review collective des changelogs
  2. Tests de la version beta
  3. Exit du mode prerelease
  4. Release stable

## 🎯 Règles d'Équipe

### Changesets obligatoires
- ❌ **Pas de merge sans changeset** (sauf docs/tests)
- ✅ **Changeset par feature/fix**
- ⚠️ **Breaking changes**: Prévenir l'équipe sur Slack

### Communication
- 📢 **Breaking changes**: Annoncer 24h avant le merge
- 🔄 **Major releases**: Validation collective obligatoire
- 📝 **Changelog**: Descriptions claires et en français

### Coordination des packages
- 🎨 **@deazl/components**: Alice & Bob (UI experts)
- 🛒 **@deazl/shopping-lists**: Charlie & David (métier)
- ⚙️ **@deazl/system**: Eve & Frank (infra)
- 🔗 **@deazl/pcomparator**: Clément (lead, coordination)

## 🚨 Gestion des Urgences

### Processus Hotfix (< 1h)
```bash
# 🚀 Script automatisé
./scripts/hotfix.sh "description du bug critique"

# Ou manuellement:
# 1. Créer branche depuis main
git checkout main
git checkout -b hotfix/critical-bug-$(date +%Y%m%d-%H%M)

# 2. Fix minimal + tests
yarn test
yarn build

# 3. Changeset patch
yarn changeset add

# 4. PR express vers main (bypass dev)
# 5. Merge → Deploy automatique via hotfix.yml
```

### Critères de Hotfix
- 🔥 **Bug critique** affectant tous les utilisateurs
- 💰 **Perte financière** directe  
- 🔒 **Faille de sécurité**
- 📱 **Application inutilisable**

### Responsabilités Hotfix
- **Decision maker**: Clément (lead technique)
- **Backup**: Alice (si Clément indisponible)
- **Review obligatoire**: Minimum 1 autre dev
- **Deploy**: Automatique via GitHub Actions
- **Communication**: Slack #urgences

### Post-Hotfix (dans les 24h)
- 📊 **Post-mortem**: Root cause analysis
- 🔄 **Sync dev**: Merger main vers dev
- 📈 **Métriques**: MTTR, fréquence, success rate
- 🛡️ **Prévention**: Améliorer tests/monitoring

## 📊 Dashboard de Suivi

### Outils recommandés
- **GitHub Projects**: Suivi des features par release
- **NPM registry**: Monitoring des versions publiées  
- **Slack notifications**: Hooks GitHub pour les releases

### Métriques
- 📈 **Fréquence des releases**: Objectif 1/semaine stable
- 🐛 **Taux de hotfix**: < 5% des releases
- ⚡ **Time-to-release**: Feature → Production < 2 semaines
