# 📱 Guide de Développement Mobile - PComparator

Ce guide vous explique comment tester votre application PComparator en temps réel sur votre téléphone pendant le développement.

## 🚀 Méthodes Disponibles

### 1. **Réseau Local (Recommandé)** 
```bash
npm run dev:qr
# ou
yarn dev:qr
```

**Avantages :**
- ✅ Rapide et simple
- ✅ Pas de configuration supplémentaire
- ✅ QR code automatique pour connexion facile
- ✅ Idéal pour le développement quotidien

**Prérequis :**
- Votre téléphone et Mac doivent être sur le même réseau WiFi

### 2. **HTTPS Local**
```bash
npm run dev:https
# ou
yarn dev:https
```

**Avantages :**
- ✅ Support HTTPS pour tester les fonctionnalités PWA
- ✅ Idéal pour tester les certificats SSL
- ✅ Compatible avec les APIs qui nécessitent HTTPS

**Note :** Utilise les certificats dans le dossier `certs/`

### 3. **Tunnel Public (ngrok)**
```bash
npm run dev:tunnel
# ou
yarn dev:tunnel
```

**Avantages :**
- ✅ Accès depuis n'importe où dans le monde
- ✅ Parfait pour tester sur des réseaux différents
- ✅ Idéal pour partager avec d'autres développeurs
- ✅ Fonctionne même sans être sur le même WiFi

**Configuration (optionnelle) :**
1. Créez un compte gratuit sur [ngrok.com](https://ngrok.com)
2. Obtenez votre token d'authentification
3. Définissez-le dans votre environnement :
   ```bash
   export NGROK_AUTH_TOKEN=votre_token_ici
   ```

## 🛠️ Scripts Utilitaires

### Obtenir votre IP locale
```bash
npm run local-ip
# ou
yarn local-ip
```

### Développement standard (avec accès réseau)
```bash
npm run dev
# ou
yarn dev
```

Le serveur sera accessible sur `http://votre-ip-locale:3001`

## 📋 Instructions Détaillées

### Pour la méthode QR Code (Recommandée)

1. **Lancez le serveur avec QR code :**
   ```bash
   yarn dev:qr
   ```

2. **Scannez le QR code** qui apparaît dans votre terminal avec l'appareil photo de votre téléphone

3. **Ouvrez le lien** qui s'affiche

4. **Commencez à développer !** Les changements se synchronisent automatiquement

### Pour la méthode manuelle

1. **Obtenez votre IP locale :**
   ```bash
   yarn local-ip
   ```

2. **Notez l'adresse IP** affichée (ex: `192.168.1.100`)

3. **Lancez le serveur :**
   ```bash
   yarn dev
   ```

4. **Ouvrez votre navigateur mobile** et allez à :
   ```
   http://192.168.1.100:3001
   ```

## 🔧 Dépannage

### Problèmes de connexion
- ✅ Vérifiez que votre Mac et téléphone sont sur le même réseau WiFi
- ✅ Désactivez temporairement votre firewall si nécessaire
- ✅ Essayez de redémarrer votre router WiFi

### Problèmes avec ngrok
- ✅ Vérifiez votre connexion Internet
- ✅ Assurez-vous d'avoir un token valide
- ✅ Essayez de redémarrer le tunnel

### Certificats HTTPS
- ✅ Vérifiez que les fichiers `certs/cert.pem` et `certs/key.pem` existent
- ✅ Acceptez le certificat auto-signé sur votre téléphone

## 💡 Conseils Pro

1. **Utilisez `dev:qr`** pour un développement quotidien rapide
2. **Utilisez `dev:tunnel`** pour partager avec des collègues ou tester sur différents réseaux
3. **Utilisez `dev:https`** pour tester les fonctionnalités PWA ou SSL
4. **Gardez votre terminal ouvert** pour voir les logs en temps réel
5. **Utilisez les DevTools** de votre navigateur mobile pour déboguer

## 🎯 Fonctionnalités Testables

Avec cette configuration, vous pouvez tester en temps réel :
- ✅ Responsive design sur différentes tailles d'écran
- ✅ Fonctionnalités PWA (Progressive Web App)
- ✅ Géolocalisation et APIs natives
- ✅ Performances sur mobile
- ✅ Interactions tactiles
- ✅ Caméra et scanner de codes-barres
- ✅ Notifications push

## 🔄 Hot Reload

Tous les scripts supportent le **hot reload** automatique :
- Les changements CSS/JS se reflètent instantanément
- Pas besoin de rafraîchir manuellement la page
- Synchronisation automatique entre développement et aperçu mobile

---

**🎉 Bon développement mobile !**
