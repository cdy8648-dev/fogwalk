# FogWalk — App Store 등록 카피 & 설문 가이드

복사해서 App Store Connect에 붙여넣으세요. (글자수 제한: 부제 30 / 키워드 100 / 프로모션 170 / 설명 4000)

---

## 🇰🇷 한국어

### 부제 (Subtitle, ≤30자)
```
걸을수록 넓어지는 나의 탐험 지도
```
대안: `걸어서 세상의 안개를 걷어내요` / `한 걸음마다 밝아지는 지도`

### 프로모션 텍스트 (Promotional Text, ≤170자 · 심사 없이 수시 변경 가능)
```
오늘도 안개 속으로 한 걸음. 걸은 만큼 지도가 밝아지고, 랜드마크·지하철·해외 여권까지 모으는 재미. 로그인 없이, 모든 기록은 내 기기에만 저장돼요.
```

### 키워드 (Keywords, ≤100자 · 쉼표로 구분, 띄어쓰기 X)
```
산책,걷기,만보기,걸음수,운동,건강,탐험,지도,발견,기록,여행,랜드마크,여권,안개,동기부여,루틴,챌린지,수집
```

### 설명 (Description)
```
FogWalk — 걸으면 세상의 안개가 걷힙니다.

처음 지도는 온통 안개로 덮여 있어요. 직접 걸어서 지나간 자리마다 안개가 걷히고, 나만의 탐험 지도가 점점 넓어집니다. 익숙한 동네도 다시 걷고 싶어지는 "포그 오브 워(fog of war)" 산책 앱이에요.

■ 걸을수록 넓어지는 내 땅
· 실제로 걸은 만큼 지도의 안개가 사라져요
· 백그라운드에서도 기록 — 주머니 속에서도 탐험은 계속됩니다

■ 모으는 재미
· 거리와 연속 산책(스트릭)으로 레벨과 뱃지를 올려요
· 지나친 랜드마크와 지하철역을 발견해 도감을 채워요
· 해외에 가면 국기가 쌓이는 여권
· 그 자리에 사진을 남겨 폴라로이드 컬렉션으로

■ 프라이버시 우선
· 로그인도, 계정도, 광고도 없어요
· 모든 기록은 오직 내 기기에만 저장됩니다

오늘 산책, 안개 너머엔 무엇이 있을까요?
```

---

## 🇺🇸 English

### Subtitle (≤30)
```
Walk to clear the fog
```

### Promotional Text (≤170)
```
Every step clears the fog. Reveal your own map as you walk, and collect landmarks, subway stations, and country stamps. No login — everything stays on your device.
```

### Keywords (≤100)
```
walk,walking,pedometer,steps,fitness,explore,map,fog,adventure,tracker,travel,landmark
```

### Description
```
FogWalk — walk, and the fog of the world lifts.

At first your map is covered in fog. As you walk in real life, the fog clears wherever you go, and your personal map of the world keeps growing. A "fog of war" walking app that makes you want to explore even your own neighborhood again.

■ Your world grows as you walk
· The fog disappears in step with how far you actually walk
· Keeps recording in the background — exploration continues from your pocket

■ Collect along the way
· Level up and earn badges from distance and walking streaks
· Discover landmarks and subway stations you pass to fill your collection
· A passport that fills with flags when you travel abroad
· Leave a photo on the spot for your polaroid collection

■ Privacy first
· No login, no account, no ads
· Everything is stored only on your device

What's beyond the fog on today's walk?
```

---

## 📋 App Privacy (개인정보 보호) 설문 답안

App Store Connect → App Privacy → "Get Started". 핵심: **위치만 "수집"으로 신고, 나머지는 수집 안 함.**
(Apple 기준 "수집" = 기기 밖으로 전송. 지도/주변정보 위해 좌표가 Mapbox·OSM로 전송되므로 위치는 수집으로 신고하는 게 안전·정확.)

**Q: Do you or your third-party partners collect data from this app?** → **Yes**

**수집하는 데이터 = "Location" 하나만 체크:**
- **Location → Precise Location** (정밀 위치) 선택
  - **Purpose**: App Functionality (앱 기능) ✅ — 이것만 체크
  - **Linked to the user's identity?** → **No** (계정·식별자 없음)
  - **Used for tracking?** → **No** (광고·추적 없음)

**나머지는 모두 체크 안 함 (수집 안 함):**
- Contact Info, Health, Financial, Contacts, User Content(사진), Browsing/Search History, Identifiers, Usage Data, Diagnostics, Purchases 등 → 전부 ❌
  - ※ 사진/카메라: 사진은 기기에만 저장되고 외부 전송이 없으므로 "User Content 수집"에 해당 안 함.
  - ※ 분석/크래시 SDK 없음 → Usage Data / Diagnostics 수집 없음.

---

## 📋 연령 등급 (Age Rating) 설문

App Store Connect → Age Rating → 모든 콘텐츠 항목 **None / 없음**, 모든 "예/아니오" → **No**.
- 폭력/성적/약물/도박/공포 등 → 전부 None
- Unrestricted Web Access(앱 내 웹 브라우징) → **No** (외부 링크는 Safari로 열림, 앱 내 브라우저 아님)
- 결과: **4+** 등급

---

## 📝 App Review Information (심사 노트) — 백그라운드 위치 설명 (중요)

심사자가 백그라운드 위치 사용 이유를 보게 "App Review Information → Notes"에 붙여넣기:
```
FogWalk is a "fog of war" walking app. The map starts covered in fog; as the
user physically walks, the fog clears along their path. Background ("Always")
location is essential so the map keeps revealing while the app is not in the
foreground (e.g., phone in pocket during a walk). All location data is stored
only on the device and is never sent to our servers (the app is fully
local-first, no account/login).

How to test: allow location ("Allow While Using" then "Change to Always"),
then walk/move ~50m+ — fog clears around your path and distance/level update.
No login required.
```
- **Sign-in required?** → No (데모 계정 불필요)
- **Contact**: cdy8648@naver.com

---

## ℹ️ 기타 필수/권장 입력
- **Privacy Policy URL** (필수): `https://frill-bandicoot-33f.notion.site/FogWalk-Privacy-Policy-3868956c411080fab3eef3cba8f23e6b`
- **Support URL** (필수): 지원 페이지 URL이 필요해요. 따로 없으면 위 Notion 페이지나 간단한 연락처 페이지를 재사용 가능.
- **Category**: Primary = Travel (여행) / Secondary(선택) = Health & Fitness
- **Screenshots** (필수): 6.7"(또는 6.9") iPhone 1세트 — Map / Collection / Profile 추천
```
