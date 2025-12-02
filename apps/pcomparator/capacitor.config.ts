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
    url: process.env.PCOMPARATOR_PUBLIC_URL,  // ← Remplace par ton IP (yarn mobile:ip)
    cleartext: process.env.NODE_ENV === "development" ? true : false
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
        webClientId: process.env.AUTH_GOOGLE_ID,
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
