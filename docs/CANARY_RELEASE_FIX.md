# 🔧 Résolution du Problème de Release Canary

## Problème identifié

L'erreur rencontrée était :
```bash
🦋  warn No unreleased changesets found, exiting.
🦋  error Releasing under custom tag is not allowed in pre mode
```

## Causes du problème

1. **Condition logique incorrecte** : Le workflow s'exécutait même sans changesets
2. **Conflit de modes prerelease** : Mélange entre mode canary et commandes normales
3. **Gestion incorrecte du mode pre** : Les commandes `changeset pre enter` et `changeset publish` se battaient

## Solutions appliquées

### 1. Simplification du workflow `release.yml`

**Avant** :
```yaml
- name: Create canary release
  if: steps.changesets.outputs.published != 'true' && steps.changesets.outputs.hasChangesets == 'false'
```

**Après** :
```yaml
# Plus de step "Create canary release" - laissons changesets/action gérer
```

**Pourquoi** : La condition était inversée et créait des conflits.

### 2. Correction des scripts package.json

**Avant** :
```json
"release:canary": "changeset pre enter canary && changeset version && changeset publish --tag canary && changeset pre exit"
```

**Après** :
```json
"release:canary": "changeset publish --tag canary"
```

**Pourquoi** : Évite les conflits de mode prerelease dans un seul script.

### 3. Nouveau workflow dédié `canary-release.yml`

Créé un workflow spécialisé pour les releases canary avec :
- ✅ Vérification des changesets avant exécution
- ✅ Gestion propre du mode prerelease
- ✅ Création automatique des releases GitHub
- ✅ Pas de conflit avec l'action changesets

## Workflow corrigé

### Release normale (release.yml)
- Utilise `changesets/action@v1` avec `createGithubReleases: true`
- Pas de gestion manuelle du mode prerelease
- Laisse changeset gérer la logique

### Release canary (canary-release.yml)
- Vérifie d'abord s'il y a des changesets
- Gère le mode prerelease manuellement
- Crée les releases GitHub manuellement
- Évite les conflits

## Tests de validation

Pour tester la correction :

```bash
# 1. Créer un changeset
yarn changeset:add

# 2. Push vers canary
git add .
git commit -m "feat: test canary release"
git push origin canary

# 3. Vérifier que le workflow fonctionne sans erreur
```

## Résultats attendus

✅ **Avec changesets** : Release canary créée avec tags et releases GitHub  
✅ **Sans changesets** : Workflow skip sans erreur  
✅ **Mode prerelease** : Géré correctement sans conflits  
✅ **Releases GitHub** : Créées automatiquement avec bonnes informations  

## Monitoring

Surveillez les workflows pour s'assurer que :
- Les builds passent sans l'erreur "custom tag not allowed"
- Les releases GitHub sont créées quand attendu
- Le mode prerelease est géré correctement

## Fallback manuel

Si problème, utilisez le script manuel :
```bash
yarn changeset:release
```

Ce script évite tous les conflits de workflow.
