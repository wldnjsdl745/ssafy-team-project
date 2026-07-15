# SSAFY Startcamp TEAM PJT

이 프로젝트는 Vue 3 + Vite 기반의 서울 레포츠 장소 추천 웹 앱입니다.

## 팀 정보

- 팀명: SSAFY Startcamp TEAM PJT
- 참여자: 김보경, 김지원, 이주미

현재 구현된 주요 기능은 다음과 같습니다.

## ✅ 구현된 기능

- **홈 페이지**
  - 사진 배경 히어로 카드 스타일 레이아웃
  - 서울 레포츠 추천 설명 및 주요 기능 소개
  - 장소 목록, 커뮤니티, 도장 깨기 페이지로 이동하는 버튼

- **장소 목록 페이지** (`/places`)
  - 서울 레포츠 장소 데이터를 `public/data/서울_레포츠.json`에서 로드
  - 구별 필터 기능으로 장소 목록을 간편하게 탐색
  - 장소 카드에 이미지, 제목, 주소, 구 태그 표시
  - **사이드 챗봇** 통합
    - 자연어로 구/동을 입력하면 서울 구 단위로 추천 장소 반환
    - `extractDistrict`로 지역 구 추출 후, `getRandomRecommendation`으로 추천 장소 선택

- **커뮤니티 페이지** (`/community`)
  - 커뮤니티 목록 및 상세 페이지 기본 구조 제공

- **도장 깨기 페이지** (`/stamp`)
  - 서울 25개 자치구 방문 횟수 입력 UI
  - `chart.js` 기반 버블 차트로 방문 현황 시각화
  - 로컬 스토리지에 입력값 저장하여 새로고침 후에도 유지

## 🧩 기술 스택

- Vue 3
- Vite
- Vue Router
- Chart.js
- `chartjs-plugin-datalabels`

## 📁 주요 파일

- `src/views/HomeView.vue` — 홈 페이지 UI
- `src/views/PlaceListView.vue` — 장소 목록 및 챗봇 페이지
- `src/components/chatbot/Chatbot.vue` — 챗봇 UI 및 메시지 로직
- `src/api/openRouter.js` — OpenRouter API 기반 지역 추출 및 로컬 폴백
- `src/services/recommendService.js` — 추천 장소 검색 로직
- `src/views/StampView.vue` — 도장 깨기 버블 차트 뷰
- `src/router/index.js` — 라우터 설정

## 🚀 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5177` 또는 Vite가 출력하는 다른 포트로 접속하세요.

## 🔑 OpenRouter 챗봇 설정

챗봇 AI 기능은 `OpenRouter` API를 사용합니다. 로컬에서 사용하려면 프로젝트 루트에 `.env` 또는 Vite 환경 변수에 다음 값을 설정하세요.

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

API 키가 없으면 챗봇은 로컬 텍스트 기반 구 추출 방법을 사용하여 기본 추천을 제공합니다.

## 📌 주의 사항

- `chart.js`와 `chartjs-plugin-datalabels`가 설치되어 있어야 `StampView` 차트가 정상 동작합니다.
- 홈, 장소 목록, 커뮤니티, 도장 깨기 페이지는 `src/App.vue`의 네비게이션을 통해 이동할 수 있습니다.
