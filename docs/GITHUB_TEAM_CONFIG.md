# 🔐 GitHub Settings pour Release en Équipe

## Branch Protection Rules

### Branche `main` (Production)
- ✅ Require PR reviews: 2 minimum
- ✅ Require status checks: CI/CD tests
- ✅ Restrict pushes: Admins only
- ✅ Force push: Disabled

### Branche `dev` (Development)  
- ✅ Require PR reviews: 1 minimum
- ✅ Require status checks: CI/CD tests
- ⚠️ Auto-merge: Enabled pour les PR de changesets

## PR Templates

### Feature PR Template
```markdown
## 📝 Description
Brief description of changes

## 🎯 Type of Change
- [ ] Bug fix (patch)
- [ ] New feature (minor) 
- [ ] Breaking change (major)

## ✅ Changeset
- [ ] Changeset créé avec `yarn changeset add`
- [ ] Description claire du changement

## 🧪 Testing
- [ ] Tests ajoutés/modifiés
- [ ] Tests passent localement

## 📦 Packages Affected
- [ ] @deazl/components
- [ ] @deazl/shopping-lists  
- [ ] @deazl/system
- [ ] @deazl/pcomparator
```

## 🤖 GitHub Actions Permissions

### Secrets nécessaires
- `NPM_TOKEN`: Publication automatique
- `GITHUB_TOKEN`: Création de PR automatiques

### Permissions d'équipe
- **Admins**: Clément (release management)
- **Maintainers**: Alice, Bob (peuvent bypass certaines protections)
- **Contributors**: Charlie, David, Eve, Frank (PR + review)
