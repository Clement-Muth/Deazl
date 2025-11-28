import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.deazl.app',
  appName: '@deazl/pcomparator',
  webDir: 'public',
  server: {
    url: "http://192.168.1.39:3001",
    cleartext: true,
  },
  plugins: {
    CapacitorCookies: {
      enabled: true
    },
    StatusBar: {
      style: 'dark', // ou 'light' selon votre thème
      backgroundColor: '#ffffff', // Couleur de votre hea
      overlaysWebView: false // ⚠️ Important : empêche le contenu de passer sous la status bar
    },
    SocialLogin: {
      google: {
        webClientId: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID, // Web Client ID
      },
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false
      }
    }
  },
};

export default config;
