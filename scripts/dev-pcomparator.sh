#!/bin/bash

# Script pour lancer l'app pcomparator depuis n'importe quel dossier du monorepo
# Usage: ./scripts/dev-pcomparator.sh [port]

set -e

# Aller à la racine du monorepo
cd "$(dirname "$0")/.."

PORT=${1:-3001}

echo "🚀 Lancement de l'app pcomparator sur le port $PORT..."
echo "📁 Depuis la racine: $(pwd)"

# Lancer l'app
yarn workspace @deazl/pcomparator dev --port=$PORT
