import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.garrdashpe.app',
  appName: 'GarrDash',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#0a0e1a',
  },
};

export default config;
