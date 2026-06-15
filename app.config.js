// app.json 의 정적 설정을 읽어와, 민감한 토큰만 .env(환경변수)에서 주입한다.
// Expo CLI 가 expo / eas 명령 실행 시 .env 파일을 자동으로 process.env 에 로드한다.
const appJson = require('./app.json');

module.exports = () => {
  const config = appJson.expo;

  return {
    ...config,
    plugins: [
      'expo-sqlite',
      [
        '@rnmapbox/maps',
        {
          // Mapbox SDK 다운로드용 시크릿 토큰(sk....). 빌드 시점에만 사용.
          RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOAD_TOKEN ?? '',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            '백그라운드 이동 기록을 위해 위치를 사용합니다',
        },
      ],
    ],
    extra: {
      ...config.extra,
      // 런타임에서 Constants.expoConfig.extra.mapboxPublicToken 으로 읽는 퍼블릭 토큰(pk....).
      mapboxPublicToken: process.env.MAPBOX_PUBLIC_TOKEN ?? '',
    },
  };
};
