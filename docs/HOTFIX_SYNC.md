# 🔄 Synchronisation Post-Hotfix

## 🚨 Problème à résoudre

Quand un hotfix est déployé depuis `main`, il faut synchroniser avec `dev` sans casser le mode prerelease.

## 🎯 Solutions selon le contexte

### **Solution 1: Cherry-pick (Recommandée)**

Après un hotfix, il faut intégrer les changements dans `dev` via cherry-pick :

```bash
# 1. Aller sur dev
git checkout dev
git pull origin dev

# 2. Cherry-pick seulement les commits de code (pas les changeset versions)
git cherry-pick <commit-hash-du-fix>

# 3. Créer un nouveau changeset pour dev
yarn changeset add
# Choisir le même type de change que le hotfix (généralement patch)

# 4. Push vers dev
git push origin dev
```

### **Solution 2: Merge avec résolution manuelle**

```bash
# 1. Aller sur dev
git checkout dev
git pull origin dev

# 2. Merger main dans dev
git merge main

# 3. Résoudre les conflits dans les package.json et CHANGELOG.md
# Garder les versions prerelease de dev
# Intégrer seulement le code du hotfix

# 4. Si pre.json a été supprimé, le recréer
yarn changeset pre enter beta

# 5. Commit de merge
git add .
git commit -m "chore: integrate hotfix from main while preserving prerelease mode"
git push origin dev
```

### **Solution 3: Workflow automatisé (Avancé)**

Créer un workflow qui se déclenche après un hotfix et synchronise automatiquement :

```yaml
# .github/workflows/sync-hotfix.yml
name: Sync Hotfix to Dev

on:
  workflow_run:
    workflows: ["Hotfix Release"]
    types: [completed]
    branches: [main]

jobs:
  sync:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - name: Checkout dev
        uses: actions/checkout@v4
        with:
          ref: dev
          fetch-depth: 0

      - name: Configure git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Cherry-pick hotfix commits
        run: |
          # Récupérer les commits de hotfix (exclure les commits de versioning)
          HOTFIX_COMMITS=$(git log --oneline origin/main ^HEAD --grep="hotfix:" --format="%H")
          
          for commit in $HOTFIX_COMMITS; do
            echo "Cherry-picking: $commit"
            git cherry-pick $commit || {
              echo "Conflict detected, manual intervention needed"
              exit 1
            }
          done

      - name: Create changeset for dev
        run: |
          # Créer un changeset équivalent pour dev
          # (nécessite d'analyser les changements)
          
      - name: Push to dev
        run: git push origin dev
```

## 🎯 Recommandation pour votre équipe

### **Process Recommandé**

1. **Hotfix déployé** → Rester en mode prerelease sur `dev`
2. **Post-hotfix immédiat** (< 30 min) :
   ```bash
   # Lead technique (Clément) exécute:
   ./scripts/sync-hotfix-to-dev.sh
   ```
3. **Communication équipe** : "Hotfix intégré dans dev, continuez votre travail normal"

### **Script de synchronisation**

Créons un script pour automatiser cela :

```bash
#!/bin/bash
# scripts/sync-hotfix-to-dev.sh

echo "🔄 Synchronizing hotfix from main to dev..."

# 1. Aller sur dev et s'assurer qu'on est à jour
git checkout dev
git pull origin dev

# 2. Identifier les commits de hotfix
echo "📋 Identifying hotfix commits..."
HOTFIX_COMMITS=$(git log --oneline origin/main ^HEAD --grep="hotfix" --format="%H" | tac)

if [ -z "$HOTFIX_COMMITS" ]; then
    echo "✅ No hotfix commits to sync"
    exit 0
fi

# 3. Cherry-pick chaque commit de hotfix
for commit in $HOTFIX_COMMITS; do
    echo "🍒 Cherry-picking: $commit"
    git cherry-pick $commit
    
    if [ $? -ne 0 ]; then
        echo "❌ Conflict detected. Manual resolution needed."
        echo "Resolve conflicts, then run: git cherry-pick --continue"
        exit 1
    fi
done

# 4. Vérifier que le mode prerelease est toujours actif
if [ ! -f ".changeset/pre.json" ]; then
    echo "⚠️  Prerelease mode lost, restoring..."
    yarn changeset pre enter beta
fi

# 5. Push
echo "🚀 Pushing synchronized changes to dev..."
git push origin dev

echo "✅ Hotfix successfully synchronized to dev branch"
echo "🎯 Dev team can continue working normally"
```

## 📋 Checklist Post-Hotfix

### Pour le Lead Technique (Clément)

- [ ] Hotfix déployé et fonctionnel en production
- [ ] Exécuter `./scripts/sync-hotfix-to-dev.sh`
- [ ] Vérifier que `dev` a bien le mode prerelease actif
- [ ] Notifier l'équipe que la synchronisation est terminée
- [ ] Planifier post-mortem dans les 24h

### Pour l'Équipe Dev

- [ ] Attendre notification de synchronisation
- [ ] Faire `git pull origin dev` sur vos branches
- [ ] Continuer le travail normal en mode prerelease
- [ ] Participer au post-mortem planifié

## 🔍 Monitoring

### Signaux d'alerte

- Mode prerelease perdu sur `dev` : `.changeset/pre.json` manquant
- Versions incohérentes entre packages
- Conflits lors des merges de feature branches

### Actions correctives

```bash
# Si le mode prerelease est perdu
yarn changeset pre enter beta

# Si les versions sont incohérentes
yarn changeset version
git add .
git commit -m "chore: fix version inconsistencies"
```
