#!/bin/bash

# Script pour tester l'efficacité du Zero-Install
set -e

echo "🧪 Test de la configuration Zero-Install optimisée"
echo "=================================================="

# Mesurer le temps d'installation depuis un état propre
echo "📊 Test 1: Installation depuis zéro (simulation fresh clone)"
rm -rf node_modules
time yarn install

echo ""
echo "📊 Test 2: Installation avec cache (simulation post-pull)"
rm -rf node_modules
time yarn install

echo ""
echo "📊 Test 3: Vérification que le build fonctionne"
time yarn build:fast

echo ""
echo "✅ Tests terminés!"
echo ""
echo "💡 Conseils pour optimiser davantage:"
echo "  - Commitez le dossier .yarn/cache pour le vrai Zero-Install"
echo "  - Les développeurs n'auront plus besoin de yarn install après un git pull"
echo "  - Utilisez 'yarn install --check-cache' pour valider l'intégrité"
