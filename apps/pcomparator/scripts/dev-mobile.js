#!/usr/bin/env node

const qrcode = require('qrcode-terminal');
const { execSync } = require('child_process');
const os = require('os');

// Fonction pour obtenir l'adresse IP locale
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iinterface of interfaces[name]) {
      const { address, family, internal } = iinterface;
      if (family === 'IPv4' && !internal) {
        return address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
const port = 3001;
const url = `http://${localIP}:${port}`;

console.log('\n🚀 Démarrage du serveur de développement...\n');
console.log(`📱 URL pour votre téléphone: ${url}\n`);

// Générer le QR code
console.log('📋 QR Code pour accès mobile:');
qrcode.generate(url, { small: true });

console.log('\n💡 Instructions:');
console.log('   1. Assurez-vous que votre téléphone et votre Mac sont sur le même réseau WiFi');
console.log('   2. Scannez le QR code ci-dessus avec votre téléphone');
console.log('   3. Ou tapez manuellement l\'URL dans votre navigateur mobile');
console.log('\n⚡ Le serveur va maintenant démarrer...\n');

// Attendre 3 secondes pour que l'utilisateur puisse voir les informations
setTimeout(() => {
  try {
    execSync('npm run dev', { stdio: 'inherit' });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error.message);
  }
}, 3000);
