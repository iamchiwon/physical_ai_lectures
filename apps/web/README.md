# Physical AI 로봇 제어 실무 · Web

Cloudflare Pages에 배포되는 순수 정적 Next.js 프론트엔드입니다. 18개 레슨은 빌드 시 HTML로 생성되며 AI 강사 텍스트 채팅은 별도 Hono Worker API를 호출합니다.

## 로컬 실행

저장소 루트에서 의존성을 설치하고 프론트 개발 서버를 실행합니다.

```bash
npm install
npm run dev:web
```

`apps/web/.env.local`에는 공개 가능한 Worker 주소만 설정합니다.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
```

OpenRouter API 키와 모델 설정은 프론트에 두지 않습니다. `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`은 `apps/api` Worker의 secret/variable입니다.

## 정적 빌드와 Cloudflare Pages

```bash
npm run build:web
```

빌드 결과는 `apps/web/out`에 생성됩니다. Pages Git 연동 설정은 다음과 같습니다.

- Root directory: 저장소 루트
- Build command: `npm run build:web`
- Build output directory: `apps/web/out`
- 환경 변수: `NEXT_PUBLIC_API_BASE_URL=https://<worker-domain>`

`next.config.ts`는 `output: "export"`와 `trailingSlash: true`를 사용합니다. Next.js Route Handler, SSR, Server Action은 프론트에 포함하지 않습니다.

## 런타임 데이터 흐름

- 과정 데이터와 시뮬레이션: 정적 번들
- 학습 진도·퀴즈 점수: 브라우저 `localStorage`
- 텍스트 AI 강사: `${NEXT_PUBLIC_API_BASE_URL}/v1/tutor`

장기 API 키는 브라우저 번들에 포함되지 않습니다.

## 주요 디렉터리

- `/textbook/`: 개념 설명·실습·평가 목차. 책의 본문 설명을 절 단위로 분할하며 원문 누락을 검사합니다. 머리말·표지·장 구분 페이지·이식 부록은 제외합니다. 실습 환경과 안전 수칙은 준비 과정으로, 용어집은 검색·복습 카드로 제공합니다.
- `src/components/written-exercises.tsx`: 확인문제·연습문제·프로젝트·실습 보고서의 답안 입력, 브라우저 저장, AI 평가와 해설 비교.
- `src/components/textbook-lab.tsx`: 실습별 브라우저 개념 시뮬레이션과 해설. 실제 Python/ROS 코드를 실행하지 않습니다.
- `src/lib/textbook.ts`: 빌드 시 원고를 읽고 정적 읽기 페이지·링크를 구성합니다. 런타임 서버는 필요하지 않습니다.
- `scripts/prepare-textbook.mjs`: `prebuild`/`predev`에서 그림·원고·예제 파일을 `public/textbook-assets/`로 준비합니다. 생성 자산은 Git에서 제외됩니다.

- `src/data`: 과정·레슨·자가점검 정적 데이터
- `src/components`: 학습 UI, 가상실습, 진도, AI 강사 drawer
- `src/lib/api-client.ts`: Worker API 접근 경계
- `src/app`: 빌드 시 정적으로 생성되는 App Router 페이지


AI 강사 대화는 루트 `TutorProvider`에서 공유하고 `physical-ai:tutor:v1` localStorage에 저장합니다. 챕터 이동·새로고침 후 대화가 이어지며 질문 당시 강의 정보도 유지합니다. 긴 대화는 Worker의 `/v1/tutor/summary`로 요약하고 최근 대화와 함께 전달합니다. 요약은 AI 맥락만 압축하며 화면의 원본 기록은 유지합니다.

대화 초기화에서 현재 챕터(같은 장의 교재·실습 단원 전체) 또는 전체 대화를 선택합니다. 취소를 기본 포커스로 둔 경고 팝업에서 확인한 뒤 삭제하며, 관련 내용이 남지 않도록 누적 요약도 무효화합니다. 다른 챕터 원본은 보존합니다. 이 초기화는 학습 진도·퀴즈 점수를 지우지 않습니다.
