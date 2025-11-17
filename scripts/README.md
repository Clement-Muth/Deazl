# Scripts Changeset

Ce dossier contient des scripts utilitaires pour gérer les releases avec Changeset.

## Scripts disponibles

### `changeset-test.sh`
- **Usage**: `yarn changeset:test` ou `./scripts/changeset-test.sh`
- **Description**: Affiche toutes les commandes disponibles et le statut actuel
- **Idéal pour**: Découvrir les fonctionnalités disponibles

### `test-full-workflow.sh`
- **Usage**: `yarn changeset:workflow` ou `./scripts/test-full-workflow.sh`
- **Description**: Script interactif pour tester un workflow complet de release
- **Fonctionnalités**:
  - Création automatique d'un changeset de test
  - Test d'une prerelease beta
  - Simulation de publication
  - Nettoyage automatique
- **Idéal pour**: Tester le système avant la première utilisation

## Exemples d'utilisation

```bash
# Voir toutes les options disponibles
yarn changeset:test

# Tester un workflow complet (interactif)
yarn changeset:workflow

# Utilisation directe
./scripts/changeset-test.sh
./scripts/test-full-workflow.sh
```

## Sécurité

Ces scripts sont conçus pour être sûrs :
- Le script de workflow teste tout en mode `--dry-run`
- Possibilité de nettoyer automatiquement les fichiers de test
- Sauvegarde et restauration des états

## Personnalisation

Vous pouvez modifier ces scripts selon vos besoins spécifiques ou en créer de nouveaux pour automatiser vos workflows de release.
