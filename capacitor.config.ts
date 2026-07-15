import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.heima.accounting',
  appName: '黑马记账',
  webDir: 'dist/mobile',
  server: {
    androidScheme: 'https'
  }
}

export default config
