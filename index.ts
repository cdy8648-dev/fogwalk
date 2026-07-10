import { registerRootComponent } from 'expo';

// expo(winter) 초기화 직후, 앱 코드(h3-js 등) 로드 직전에 TextDecoder 폴리필 적용
import './src/polyfills';

// 백그라운드 위치 태스크를 JS 로드 시 1회 등록 (iOS 백그라운드 재실행 대비, 최상위 필수)
import './src/tasks/locationTask';

// 브레드크럼 지오펜스 태스크 — 앱이 종료돼도 펜스 이탈 시 iOS가 재실행해 이 핸들러 실행
import './src/tasks/geofenceTask';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
