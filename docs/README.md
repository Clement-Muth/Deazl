# 📚 Documentation Index - Releases & Changesets

## 🎯 SETUP TERMINÉ - [Voir résumé complet](./SETUP_COMPLETE.md)

## 🚀 Guides principaux

### Pour les utilisateurs
- **[🧪 CANARY_QUICK_GUIDE.md](./CANARY_QUICK_GUIDE.md)** - Guide rapide canary release
- **[📋 QUICKSTART_CHANGESET.md](./QUICKSTART_CHANGESET.md)** - Démarrage rapide changesets

### Pour les développeurs  
- **[🔧 GITHUB_RELEASES_WITHOUT_NPM.md](./GITHUB_RELEASES_WITHOUT_NPM.md)** - Configuration complète
- **[🔄 TEAM_RELEASE_WORKFLOW.md](./TEAM_RELEASE_WORKFLOW.md)** - Workflow équipe

### Troubleshooting
- **[🆘 CANARY_RELEASE_FIX.md](./CANARY_RELEASE_FIX.md)** - Résolution problèmes canary
- **[🛠️ TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Dépannage général

### Status & Historique
- **[✅ SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - **Résumé final du projet**
- **[📦 CHANGESET_SETUP_COMPLETE.md](./CHANGESET_SETUP_COMPLETE.md)** - Setup initial

## 🎯 Commandes essentielles

```bash
# Canary release (production)
yarn changeset
git push origin canary

# Test
yarn canary:workflow

# Release manuelle
yarn changeset:release
```

## 📁 Autres documents

- `HOTFIX_*.md` - Guides hotfix
- `RELEASE.md` - Releases générales
- `YARN_ZERO_INSTALL.md` - Configuration Yarn
