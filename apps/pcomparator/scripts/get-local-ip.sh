#!/bin/bash

# Script pour obtenir l'adresse IP locale pour tester sur mobile
echo "🔍 Recherche de votre adresse IP locale..."
echo ""

# Obtenir l'adresse IP locale (macOS)
LOCAL_IP=$(ifconfig | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}' | head -1)

if [ -n "$LOCAL_IP" ]; then
  echo "📱 Votre adresse IP locale: $LOCAL_IP"
  echo "🚀 URL pour votre téléphone: http://$LOCAL_IP:3001"
  echo ""
  echo "📋 Pour tester sur votre téléphone:"
  echo "   1. Assurez-vous que votre téléphone et votre Mac sont sur le même réseau WiFi"
  echo "   2. Lancez 'npm run dev' ou 'yarn dev'"
  echo "   3. Ouvrez http://$LOCAL_IP:3001 dans le navigateur de votre téléphone"
  echo ""
  echo "💡 Vous pouvez aussi générer un QR code avec: npm run dev:qr"
else
  echo "❌ Impossible de trouver l'adresse IP locale"
  echo "   Vérifiez votre connexion réseau"
fi
