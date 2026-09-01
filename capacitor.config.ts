import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nishaantech.exploreindia',
  appName: 'India Explorer',
  webDir: 'dist/client',
  android: {
    preferredStatusBarStyle: 'dark',
    backgroundColor: '#FFFFFF'
  },
  plugins: {
    StatusBar: {
      style: 'DARK'
    }
  }
};

export default config;
