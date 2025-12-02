import type { CapacitorConfig } from "@capacitor/cli";

// =============================================================================
// CONFIGURATION MOBILE CAPACITOR
// =============================================================================
// 
// Pour le DÉVELOPPEMENT local, décommente la ligne server ci-dessous avec ton IP:
// server: { url: "http://192.168.1.XXX:3001", cleartext: true },
//
// Pour STAGING/PRODUCTION, utilise:
// server: { url: "https://staging.deazl.com" },
//
// IMPORTANT: Après modification, lance: yarn cap:sync && yarn android:run
// =============================================================================

const config: CapacitorConfig = {
  appId: "com.deazl.app",
  appName: "Deazl",
  webDir: "public",
  
  // 🔧 DÉCOMMENTE ET MODIFIE selon ton environnement:
  server: {
    url: "http://192.168.1.39:3001", //"https://staging.deazl.fr",  // ← Remplace par ton IP (yarn mobile:ip)
    cleartext: true
  },
  
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "Deazl"
  },
  android: {
    allowMixedContent: true
  },
  plugins: {
    CapacitorCookies: {
      enabled: true
    },
    StatusBar: {
      style: 'dark', 
      backgroundColor: '#ffffff',
      overlaysWebView: false
    },
    SocialLogin: {
      google: {
        webClientId: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      },
      providers: {
        google: true,
        facebook: false,
        apple: true,
        twitter: false
      }
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#eef2ff",
      showSpinner: false
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true
    }
  }
};

export default config;
