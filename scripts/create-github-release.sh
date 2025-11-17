#!/bin/bash

# Script pour créer une release GitHub manuelle avec changeset (sans publication npm)
# Usage: ./scripts/create-github-release.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Script de création de release GitHub (sans publication npm)${NC}"
echo ""

# Vérifier que nous sommes dans un repo git
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo -e "${RED}❌ Erreur: Ce script doit être exécuté dans un repository git${NC}"
  exit 1
fi

# Vérifier que nous avons des changesets
if [ ! -d ".changeset" ]; then
  echo -e "${RED}❌ Erreur: Dossier .changeset non trouvé${NC}"
  exit 1
fi

# Vérifier qu'il y a des changesets en attente
CHANGESET_STATUS=$(yarn changeset status --output json 2>/dev/null || echo "[]")
if [ "$CHANGESET_STATUS" = "[]" ]; then
  echo -e "${YELLOW}⚠️  Aucun changeset en attente${NC}"
  echo -e "${BLUE}💡 Créez d'abord un changeset avec: yarn changeset:add${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Changesets trouvés${NC}"

# Demander confirmation
echo -e "${YELLOW}🤔 Que voulez-vous faire ?${NC}"
echo "1) Créer les versions (yarn changeset version)"
echo "2) Créer les tags Git et releases GitHub"
echo "3) Faire les deux (version + release)"
echo "4) Annuler"
read -p "Votre choix (1-4): " choice

case $choice in
1)
  echo -e "${BLUE}📦 Création des versions...${NC}"
  yarn changeset version
  echo -e "${GREEN}✅ Versions créées. Commitez les changements et relancez ce script avec l'option 2.${NC}"
  ;;
2)
  echo -e "${BLUE}🏷️  Création des tags et releases GitHub...${NC}"

  # Vérifier que le working directory est propre
  if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Le working directory n'est pas propre. Commitez vos changements d'abord.${NC}"
    exit 1
  fi

  # Créer les tags et releases pour chaque package
  echo -e "${BLUE}🔍 Recherche des packages versionnés...${NC}"

  # Trouver tous les packages qui ont été versionnés récemment
  versioned_packages=$(find packages -name "package.json" -exec sh -c '
      if git diff HEAD~1 "$1" 2>/dev/null | grep -q "version"; then 
        node -p "JSON.stringify({name: require(\"$1\").name, version: require(\"$1\").version})"
      fi
    ' _ {} \; | grep -v "^$")

  if [ -z "$versioned_packages" ]; then
    echo -e "${YELLOW}⚠️  Aucun package versionné trouvé dans le dernier commit${NC}"
    echo -e "${BLUE}💡 Assurez-vous d'avoir d'abord fait 'yarn changeset version' et committé${NC}"
    exit 1
  fi

  # Créer les releases pour chaque package
  echo "$versioned_packages" | while read -r package_info; do
    if [ -n "$package_info" ]; then
      package_name=$(echo "$package_info" | node -p "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).name")
      package_version=$(echo "$package_info" | node -p "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).version")
      tag_name="${package_name}@${package_version}"

      echo -e "${BLUE}📦 Création de la release pour: ${package_name}@${package_version}${NC}"

      # Créer le tag Git
      git tag "$tag_name"

      # Créer la release GitHub
      gh release create "$tag_name" \
        --title "🚀 Release: $package_name@$package_version" \
        --notes "🎉 **Release: $package_name@$package_version**
          
Cette release inclut les dernières fonctionnalités et corrections.

**Installation:**
\`\`\`bash
# Ces packages sont privés et ne sont pas publiés sur NPM
# Clonez le repository et utilisez ce tag :
git clone https://github.com/Deazl-Comparator/deazl.git
git checkout $tag_name
yarn install && yarn build
\`\`\`

**Package:** $package_name  
**Version:** $package_version

**📋 Changements:** Voir le CHANGELOG du package pour tous les détails.

**🔗 Artefacts:** Les packages compilés sont disponibles dans les GitHub Actions artifacts." \
        --latest || echo -e "${YELLOW}⚠️  Release déjà existante ou erreur lors de la création${NC}"
    fi
  done

  # Pousser tous les tags
  git push origin --tags

  echo -e "${GREEN}✅ Tags et releases créés avec succès !${NC}"
  ;;
3)
  echo -e "${BLUE}🔄 Processus complet: version + release...${NC}"

  # Créer les versions
  echo -e "${BLUE}📦 Étape 1: Création des versions...${NC}"
  yarn changeset version

  # Committer les changements
  echo -e "${BLUE}💾 Étape 2: Commit des changements...${NC}"
  git add .
  git commit -m "ci(changesets): version packages"

  # Build
  echo -e "${BLUE}🔨 Étape 3: Build des packages...${NC}"
  yarn build || echo -e "${YELLOW}⚠️  Build échoué, mais on continue...${NC}"

  # Créer les releases (comme dans l'option 2)
  echo -e "${BLUE}🏷️  Étape 4: Création des tags et releases...${NC}"

  # Rechercher les packages versionnés
  versioned_packages=$(find packages -name "package.json" -exec sh -c '
      if git diff HEAD~1 "$1" | grep -q "version"; then 
        node -p "JSON.stringify({name: require(\"$1\").name, version: require(\"$1\").version})"
      fi
    ' _ {} \; | grep -v "^$")

  if [ -n "$versioned_packages" ]; then
    echo "$versioned_packages" | while read -r package_info; do
      if [ -n "$package_info" ]; then
        package_name=$(echo "$package_info" | node -p "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).name")
        package_version=$(echo "$package_info" | node -p "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).version")
        tag_name="${package_name}@${package_version}"

        echo -e "${BLUE}📦 Création de la release pour: ${package_name}@${package_version}${NC}"

        # Créer le tag Git
        git tag "$tag_name"

        # Créer la release GitHub
        gh release create "$tag_name" \
          --title "🚀 Release: $package_name@$package_version" \
          --notes "🎉 **Release: $package_name@$package_version**
            
Cette release inclut les dernières fonctionnalités et corrections.

**Installation:**
\`\`\`bash
# Ces packages sont privés et ne sont pas publiés sur NPM
# Clonez le repository et utilisez ce tag :
git clone https://github.com/Deazl-Comparator/deazl.git
git checkout $tag_name
yarn install && yarn build
\`\`\`

**Package:** $package_name  
**Version:** $package_version

**📋 Changements:** Voir le CHANGELOG du package pour tous les détails.

**🔗 Artefacts:** Les packages compilés sont disponibles dans les GitHub Actions artifacts." \
          --latest || echo -e "${YELLOW}⚠️  Release déjà existante ou erreur lors de la création${NC}"
      fi
    done

    # Pousser tous les tags
    git push origin --tags
    git push origin $(git branch --show-current)

    echo -e "${GREEN}✅ Processus complet terminé avec succès !${NC}"
  else
    echo -e "${YELLOW}⚠️  Aucun package versionné trouvé${NC}"
  fi
  ;;
4)
  echo -e "${BLUE}👋 Annulé${NC}"
  exit 0
  ;;
*)
  echo -e "${RED}❌ Choix invalide${NC}"
  exit 1
  ;;
esac

echo ""
echo -e "${GREEN}🎉 Script terminé !${NC}"
