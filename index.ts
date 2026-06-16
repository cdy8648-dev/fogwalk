import { registerRootComponent } from 'expo';

// expo(winter) 초기화 직후, 앱 코드(h3-js 등) 로드 직전에 TextDecoder 폴리필 적용
import './src/polyfills';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
