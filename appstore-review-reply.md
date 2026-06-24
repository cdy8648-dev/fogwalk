# App Store 심사 답변 (Guideline 2.1 - Information Needed)

Resolution Center에 답글로 보내고, **App Review Information → Notes** 칸에도 붙여넣으세요.
(영문으로 작성 — 심사자는 영어로 읽습니다. `[ ]` 부분만 실제 값으로 채우세요.)

---

Thank you for reviewing FogWalk. Please find the requested information below.

**1. Screen recording**
A screen recording captured on a physical iPhone running the latest iOS is attached. It shows: launching the app → the Location permission prompt ("Allow While Using", then upgrading to "Always") → the map's fog clearing around the user's location → walking revealing more of the map and updating stats and earning a badge → the Camera permission prompt and taking an in-app photo pinned to the current location → the Collection tab (badges, country passport, discovered landmarks/stations, photos) → the Profile tab (level, monthly activity calendar, history, and Info/Credits).
The app has no account, login, in-app purchases, or subscriptions.

**2. Devices and OS tested**
- iPhone [모델명 입력, 예: iPhone 14], iOS [버전 입력, 예: 18.5]
The app was tested on this physical device before submission.

**3. Purpose and target audience**
FogWalk is a "fog of war" walking and exploration app. The map starts entirely covered in fog; as the user physically walks, the fog clears along their path, revealing a personal map of everywhere they have been. It turns everyday walking into discovery: revealing land, finding nearby landmarks and subway stations, collecting country "passport" stamps while traveling, leveling up from distance and streaks, and pinning photos to places.
Target audience: general users of all ages (rated 4+) who want a fun, gentle motivation to walk and explore their surroundings. The problem it solves: walking can feel monotonous — FogWalk adds a game-like discovery and collection layer to make it engaging, while keeping all data on the device for privacy.

**4. Setup and accessing the main features (no login required)**
There is no account or login and no demo credentials or sample files are needed.
1. Launch the app. On the Map tab, allow Location access — choose "Allow While Using", then "Always" when prompted — so the map can reveal as you move, including in the background.
2. Walk or move ~50m or more. The fog clears around your path and the "land revealed", level, and streak update. Passing within ~150m of a landmark or subway station marks it as discovered.
3. Tap the camera button (bottom-right) and allow Camera access to take a photo pinned to your current location.
4. Collection tab: view badges, the country passport, discovered landmarks/stations, and photos. Tap a section to see its detail page.
5. Profile tab: level/XP, a monthly activity calendar, history, and an "Info / Credits" screen with data attributions.

**5. External services used to deliver core functionality**
- Mapbox — renders the map tiles. The app sends the device's coordinates to load map tiles around the user. Used via a Mapbox account access token.
- OpenStreetMap / Overpass API — looks up nearby landmarks and subway stations by coordinates. Data © OpenStreetMap contributors (ODbL); attribution is shown in the app's Info/Credits screen.
There are no authentication services, payment processors, advertising SDKs, or AI services. The app has no backend server of its own — all user data (location history, photos, progress) is stored only on the device.

**6. Regional differences**
The app functions consistently across all regions; there are no region-locked features or content. Map tiles (Mapbox) and landmark/station data (OpenStreetMap) are available worldwide — the number of discoverable landmarks/stations naturally depends on OpenStreetMap coverage in a given area. Country detection for the passport feature uses Apple's on-device reverse geocoding. The interface is primarily in Korean with some English labels.

**7. Regulated industry / protected third-party material**
FogWalk does not operate in a regulated industry. Map data is provided through a Mapbox account (token-authorized) and OpenStreetMap (ODbL), with attribution shown in the app. No other protected third-party material is used.

---

## ✅ 네가 직접 해야 할 것

1. **위 [ ] 두 곳 채우기**: 테스트한 아이폰 **모델명 + iOS 버전**.
2. **시연 영상 녹화** (가장 중요):
   - 아이폰 제어센터 → 화면 기록으로 촬영.
   - **순서대로 보이게**: 앱 실행 → (위치 권한 팝업 허용: 사용 중 → 항상) → 지도 안개 걷힘 → 조금 걸어서 안개/통계 변화·뱃지 → 카메라 버튼 → (카메라 권한 팝업 허용) → 사진 촬영·핀 → Collection 탭(뱃지/여권/발견/사진) → Profile 탭(레벨/캘린더/정보·저작권).
   - **권한 팝업이 영상에 꼭 보이게** (Apple이 위치·카메라 프롬프트 확인하려는 것).
   - 길이 30초~1분이면 충분. 야외에서 실제로 조금 걸으며 찍으면 베스트.
3. **Resolution Center에 답글** + **영상 첨부**(또는 클라우드 링크), 그리고 같은 내용을 **App Review Information → Notes**에도 저장.
4. 답변 후 **다시 제출**(별도 빌드 없이 가능 — 정보 보강만이면 같은 빌드로 재심사).
