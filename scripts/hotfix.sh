#!/bin/bash

# 🚨 Script d'aide pour Hotfix
# Usage: ./scripts/hotfix.sh "description du bug"

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
HOTFIX_PREFIX="hotfix"
MAIN_BRANCH="main"
SLACK_WEBHOOK="" # À configurer avec votre webhook Slack

echo -e "${RED}🚨 HOTFIX EMERGENCY SCRIPT${NC}"
echo -e "${YELLOW}================================${NC}"

# Vérification des arguments
if [ $# -eq 0 ]; then
  echo -e "${RED}❌ Usage: ./scripts/hotfix.sh \"description du bug critique\"${NC}"
  exit 1
fi

DESCRIPTION="$1"
TIMESTAMP=$(date +%Y%m%d-%H%M)
BRANCH_NAME="${HOTFIX_PREFIX}/${DESCRIPTION// /-}-${TIMESTAMP}"

echo -e "${YELLOW}📋 Informations du hotfix:${NC}"
echo -e "   Description: ${DESCRIPTION}"
echo -e "   Branche: ${BRANCH_NAME}"
echo -e "   Timestamp: ${TIMESTAMP}"
echo ""

# Confirmation
read -p "🔥 Confirmer que c'est un hotfix CRITIQUE ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}⚠️  Hotfix annulé. Pour les bugs non-critiques, utilisez le processus normal.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Démarrage du hotfix...${NC}"

# Étape 1: Vérifier qu'on est sur main et à jour
echo -e "${YELLOW}📥 Synchronisation avec ${MAIN_BRANCH}...${NC}"
git checkout ${MAIN_BRANCH}
git pull origin ${MAIN_BRANCH}

# Étape 2: Créer la branche de hotfix
echo -e "${YELLOW}🌱 Création de la branche hotfix...${NC}"
git checkout -b "${BRANCH_NAME}"

echo -e "${GREEN}✅ Branche hotfix créée: ${BRANCH_NAME}${NC}"
echo ""
echo -e "${YELLOW}📝 PROCHAINES ÉTAPES:${NC}"
echo -e "   1. 🔧 Effectuer le fix minimal"
echo -e "   2. 🧪 Tester localement: yarn test"
echo -e "   3. 🏗️  Build: yarn build"
echo -e "   4. 📝 Créer changeset: yarn changeset add"
echo -e "   5. 💾 Commit: git add . && git commit -m \"hotfix: [CRITICAL] ${DESCRIPTION}\""
echo -e "   6. 🚀 Push: git push origin ${BRANCH_NAME}"
echo -e "   7. 🔗 Créer PR vers ${MAIN_BRANCH}"
echo ""
echo -e "${RED}⚠️  RAPPELS IMPORTANTS:${NC}"
echo -e "   - Fix MINIMAL uniquement"
echo -e "   - PAS de refactor"
echo -e "   - PAS de nouvelles features"
echo -e "   - Tests obligatoires"
echo -e "   - Review obligatoire mais express"
echo ""

# Notification Slack (optionnelle)
if [ ! -z "$SLACK_WEBHOOK" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚨 HOTFIX STARTED\\nDeveloper: $(git config user.name)\\nBranch: ${BRANCH_NAME}\\nDescription: ${DESCRIPTION}\"}" \
    $SLACK_WEBHOOK
fi

echo -e "${GREEN}🎯 Hotfix initialisé avec succès!${NC}"
echo -e "${YELLOW}Vous êtes maintenant sur la branche: ${BRANCH_NAME}${NC}"
