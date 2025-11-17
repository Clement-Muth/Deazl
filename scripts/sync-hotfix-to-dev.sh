#!/bin/bash

# 🔄 Script de synchronisation Hotfix → Dev
# Usage: ./scripts/sync-hotfix-to-dev.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Hotfix to Dev Synchronization${NC}"
echo -e "${YELLOW}=================================${NC}"

# Vérifications préliminaires
if [ ! -d ".git" ]; then
  echo -e "${RED}❌ Ce script doit être exécuté depuis la racine du projet git${NC}"
  exit 1
fi

# 1. S'assurer qu'on est sur dev et à jour
echo -e "${YELLOW}📥 Switching to dev branch and updating...${NC}"
git checkout dev
git pull origin dev
git fetch origin main

# 2. Vérifier qu'on est bien en mode prerelease
if [ ! -f ".changeset/pre.json" ]; then
  echo -e "${RED}⚠️  Warning: Dev branch is not in prerelease mode${NC}"
  read -p "Do you want to enter prerelease mode? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    yarn changeset pre enter beta
    echo -e "${GREEN}✅ Entered prerelease mode${NC}"
  fi
fi

# 3. Identifier les commits de hotfix depuis le dernier merge
echo -e "${YELLOW}🔍 Identifying hotfix commits from main...${NC}"

# Trouver le dernier commit commun entre dev et main
MERGE_BASE=$(git merge-base dev origin/main)
echo -e "   Last common commit: ${MERGE_BASE:0:8}"

# Récupérer les commits de hotfix depuis ce point
HOTFIX_COMMITS=$(git log --oneline $MERGE_BASE..origin/main --grep="hotfix" --format="%H" | tac)

if [ -z "$HOTFIX_COMMITS" ]; then
  echo -e "${GREEN}✅ No hotfix commits to sync${NC}"
  exit 0
fi

echo -e "${BLUE}📋 Found hotfix commits to sync:${NC}"
git log --oneline $MERGE_BASE..origin/main --grep="hotfix"
echo

# Confirmation
read -p "🔥 Proceed with cherry-picking these hotfix commits? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}⚠️  Synchronization cancelled${NC}"
  exit 1
fi

# 4. Cherry-pick chaque commit de hotfix
echo -e "${YELLOW}🍒 Cherry-picking hotfix commits...${NC}"

for commit in $HOTFIX_COMMITS; do
  COMMIT_MSG=$(git log --format="%s" -n 1 $commit)
  echo -e "   🍒 Cherry-picking: ${commit:0:8} - $COMMIT_MSG"

  if git cherry-pick $commit; then
    echo -e "   ${GREEN}✅ Success${NC}"
  else
    echo -e "${RED}❌ Conflict detected in commit: ${commit:0:8}${NC}"
    echo -e "${YELLOW}Please resolve conflicts manually, then:${NC}"
    echo -e "   1. git add <resolved-files>"
    echo -e "   2. git cherry-pick --continue"
    echo -e "   3. Re-run this script when done"
    exit 1
  fi
done

# 5. Vérifier l'état après cherry-pick
echo -e "${YELLOW}🔍 Verifying state after cherry-pick...${NC}"

# Vérifier que le mode prerelease est toujours actif
if [ ! -f ".changeset/pre.json" ]; then
  echo -e "${YELLOW}⚠️  Prerelease mode lost during cherry-pick, restoring...${NC}"
  yarn changeset pre enter beta
  git add .changeset/pre.json
  git commit -m "chore: restore prerelease mode after hotfix sync [skip ci]"
fi

# 6. Tests rapides
echo -e "${YELLOW}🧪 Running quick tests...${NC}"
if yarn build; then
  echo -e "${GREEN}✅ Build successful${NC}"
else
  echo -e "${RED}❌ Build failed - manual intervention needed${NC}"
  exit 1
fi

# 7. Push vers dev
echo -e "${YELLOW}🚀 Pushing synchronized changes to dev...${NC}"
git push origin dev

# 8. Résumé
echo -e "${GREEN}✅ Hotfix synchronization completed successfully!${NC}"
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "   - Cherry-picked $(echo "$HOTFIX_COMMITS" | wc -l | tr -d ' ') hotfix commits"
echo -e "   - Prerelease mode: $([ -f '.changeset/pre.json' ] && echo 'Active' || echo 'Inactive')"
echo -e "   - Build status: ✅ Successful"
echo -e "   - Dev branch updated and pushed"
echo
echo -e "${YELLOW}🎯 Next steps:${NC}"
echo -e "   1. Notify the team that sync is complete"
echo -e "   2. Team can pull and continue normal development"
echo -e "   3. Schedule post-mortem for the hotfix"
echo

# Optional: notification
if command -v osascript &>/dev/null; then
  osascript -e 'display notification "Hotfix synchronization completed" with title "Dev Sync" sound name "Submarine"'
fi
