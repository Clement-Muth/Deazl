# 🚨 Guide Complet des Hotfix

## 🎯 Qu'est-ce qu'un Hotfix ?

Un **hotfix** est une correction critique qui doit être déployée immédiatement en production, en bypassant le processus normal de développement.

### Critères pour un Hotfix
- 🔥 **Bug critique** affectant tous les utilisateurs
- 💰 **Perte financière** directe
- 🔒 **Faille de sécurité**
- 📱 **Application inutilisable**

## 🚀 Processus Hotfix - 3 Étapes

### 1️⃣ **Détection & Décision** (5 min)
```bash
# ⚠️ ALERTE: Bug critique détecté
1. Évaluer la gravité (Lead technique: Clément)
2. Décision GO/NO-GO pour hotfix
3. Notification équipe (Slack #urgences)
```

### 2️⃣ **Développement Express** (30 min max)
```bash
# 🔧 Fix depuis la dernière version stable
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-$(date +%Y%m%d-%H%M)

# Faire le fix minimal
# PRINCIPES:
# - ✅ Fix minimal et ciblé
# - ❌ Pas de refactor
# - ❌ Pas de nouvelles features
# - ✅ Tests unitaires uniquement pour le fix
```

### 3️⃣ **Déploiement Immédiat** (15 min)
```bash
# Créer le changeset
yarn changeset add
# Choisir PATCH (sauf si breaking nécessaire)

# Commit et push
git add .
git commit -m "hotfix: [CRITICAL] description courte"
git push origin hotfix/critical-bug-YYYYMMDD-HHMM

# PR vers main (pas dev!)
# Review express par 1 autre dev minimum
```

## 📋 Workflow Détaillé par Scénario

### 🔥 **Scénario 1: Bug Critique en Production**

**Contexte:** L'app crash au login pour tous les utilisateurs

```bash
# 1. Investigation rapide (5 min)
git log --oneline main -10  # Derniers commits
git diff HEAD~1 HEAD        # Diff du dernier deploy

# 2. Identification du problème
# Exemple: TypeError dans le composant LoginForm

# 3. Création branche hotfix
git checkout main
git checkout -b hotfix/login-crash-20250602-1430

# 4. Fix minimal
# Éditer packages/components/src/Form/LoginForm.tsx
# Corriger seulement le bug, rien d'autre

# 5. Test local rapide
yarn test packages/components
yarn build

# 6. Changeset
yarn changeset add
```

**Dialogue Changeset:**
```
🦋  Which packages would you like to include?
✅ @deazl/components

🦋  Which type of change is this for @deazl/components?
✅ patch

🦋  Please enter a summary:
✍️  "hotfix: fix login form TypeError causing app crash"
```

```bash
# 7. Commit & Push
git add .
git commit -m "hotfix: [CRITICAL] fix login form crash"
git push origin hotfix/login-crash-20250602-1430

# 8. PR immédiate vers main
# Titre: "🚨 HOTFIX: Fix critical login crash"
# Review obligatoire mais express (< 10 min)

# 9. Merge & Deploy automatique via workflow hotfix.yml
```

### ⚡ **Scénario 2: Faille de Sécurité**

```bash
# 1. Sécurisation immédiate
git checkout main
git checkout -b hotfix/security-patch-20250602-1445

# 2. Patch de sécurité
# Exemple: Update de dépendance avec CVE

# 3. Tests de sécurité
yarn audit
yarn test

# 4. Changeset patch
yarn changeset add

# 5. Documentation du fix
git commit -m "hotfix: [SECURITY] patch CVE-2024-XXXX"

# 6. Release immédiate
# (Même process que scénario 1)
```

### 🔄 **Scénario 3: Rollback d'urgence**

```bash
# 1. Identifier la version problématique
npm view @deazl/pcomparator versions --json

# 2. Créer un revert
git checkout main
git revert <commit-hash-problématique>
git checkout -b hotfix/rollback-20250602-1500

# 3. Changeset pour la nouvelle version
yarn changeset add  # patch version

# 4. Deploy du rollback
```

## 🛡️ **Workflow GitHub Actions**

Le fichier `.github/workflows/hotfix.yml` que j'ai créé gère automatiquement:

### ✅ **Fonctionnalités:**
- **Déclenchement:** Push sur `hotfix/**` ou `main`
- **Exit prerelease:** Automatique si nécessaire
- **Tests:** Obligatoires avant publication
- **Publication:** Directe sur NPM (version stable)
- **Notification:** GitHub Release + alertes

### ⚙️ **Déclenchement manuel:**
```bash
# Via GitHub UI ou CLI
gh workflow run hotfix.yml -f reason="Critical login bug affecting all users"
```

## 🔄 **Post-Hotfix: Synchronisation avec Dev**

### ⚠️ **Problème Critique**
Un hotfix peut interférer avec le mode prerelease de l'équipe dev.

### 🎯 **Solution: Synchronisation Automatisée**

**Immédiatement après le hotfix** (< 30 min), le lead technique exécute :

```bash
# Script automatisé de synchronisation
./scripts/sync-hotfix-to-dev.sh
```

**Ce script fait :**
1. 🍒 **Cherry-pick** des commits de hotfix vers `dev`
2. 🛡️ **Préserve** le mode prerelease sur `dev`
3. 🧪 **Teste** que tout fonctionne
4. 🚀 **Push** les changements synchronisés

### 📋 **Workflow Post-Hotfix**

#### **Lead Technique (Clément)**
```bash
# 1. Vérifier que le hotfix est déployé
npm view @deazl/pcomparator@latest

# 2. Synchroniser avec dev
./scripts/sync-hotfix-to-dev.sh

# 3. Notifier l'équipe
echo "🔄 Hotfix synchronized to dev - team can continue normal work"
```

#### **Équipe Dev**
```bash
# Attendre la notification, puis:
git checkout dev
git pull origin dev

# Continuer le travail normal en mode prerelease
```

### 🚨 **En cas de conflit**

Si le script détecte des conflits :
1. **Résoudre manuellement** les conflits
2. **git add** les fichiers résolus
3. **git cherry-pick --continue**
4. **Re-exécuter** le script

## 📈 **Métriques & Monitoring**

### 🚨 **Alertes à configurer:**
- **Response time:** MTTR < 1h pour hotfix critique
- **Frequency:** Max 1 hotfix/mois (objectif)
- **Success rate:** 100% des hotfix doivent résoudre le problème

### 📊 **Dashboard recommandé:**
- **Sentry:** Monitoring des erreurs en production
- **GitHub Actions:** Status des déploiements
- **NPM:** Versions publiées et téléchargements
- **Slack:** Notifications automatiques

## ⚠️ **Checklist Hotfix (à imprimer)**

### Avant le Fix
- [ ] Problème confirmé critique
- [ ] Lead technique notifié
- [ ] Branche depuis `main` (pas `dev`)
- [ ] Équipe informée sur Slack

### Pendant le Fix  
- [ ] Fix minimal et ciblé
- [ ] Tests unitaires passent
- [ ] Build réussi
- [ ] Changeset créé (patch)
- [ ] Commit avec prefix `hotfix: [CRITICAL]`

### Après le Fix
- [ ] PR reviewed et mergée
- [ ] Deploy automatique vérifié  
- [ ] Version NPM publiée
- [ ] Problème résolu confirmé
- [ ] Post-mortem planifié
- [ ] Branch `dev` synchronisée

## 🔗 **Contacts d'urgence**

- **Lead technique:** Clément/Jonathan (responsable final)
- **Backup lead:** Jonathan (si Clément indisponible)
- **DevOps:** Clément (infrastructure)
- **Product Owner:** Émilie (validation métier si nécessaire)
