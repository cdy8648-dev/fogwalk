# FogWalk 해외 지역팩 (다운로드 배포용)

앱이 **첫 방문 국가의 ADM1(주/도/현) 지역팩**을 여기서 받아 로컬 캐시한다.
KR(시군구까지)만 앱에 번들(`src/constants/regionPacks/kr.json`), 나머지는 전부 다운로드.

## 호스팅
GitHub raw로 서빙. 클라이언트 상수: `CONFIG.REGION_PACK_HOST`
= `https://raw.githubusercontent.com/cdy8648-dev/fogwalk/master/packs`
→ **이 `packs/` 디렉터리를 리포에 커밋·푸시하면 그대로 배포됨.** (리포 public 필요)
브랜치를 바꾸려면 config의 URL과 실제 커밋 브랜치를 맞출 것.

## 동작
- `manifest.json` = `{ "JP": {"bytes":N,"regions":47}, ... }` — 클라가 먼저 읽어 팩 존재·크기 판단.
- 소형(`REGION_PACK_AUTO_MAX_BYTES` 미만): 첫 방문 시 무음 자동 다운로드.
- 대형(미국 등): 사용자 탭 유도(지도 칩) — 로밍 데이터 방어. WiFi면 어차피 가벼움.
- GitHub raw는 전송 gzip이라 실제 통신량은 파일 크기의 ~1/3.

## 팩 추가/재생성
```sh
node scripts/fetch-adm1.js <ISO3>          # geoBoundaries gbOpen ADM1(simplified) 받기
node scripts/gen-global-pack.js <ISO3> <cc> # → packs/<cc>.json (ADM1 전용, res7)
node scripts/gen-pack-manifest.js          # packs/*.json → manifest.json (매번 마지막에)
```
예: `node scripts/fetch-adm1.js JPN && node scripts/gen-global-pack.js JPN jp`

## 한계 / TODO
- 지역명이 영문/현지어(shapeName). 한글 오버레이는 국가별 localization으로 추후.
- geoBoundaries에 gbOpen ADM1이 없는 지역(예: 홍콩)은 팩 없음 → 국가 스탬프만(역지오코딩 폴백).
- res7(~5km) 경계 정밀도 — 주/도 단위엔 충분, 초소형 지역엔 성길 수 있음.
- 경계 vintage는 국가별 상이(geoBoundaries gbOpen). attribution은 각 팩에 기록.
