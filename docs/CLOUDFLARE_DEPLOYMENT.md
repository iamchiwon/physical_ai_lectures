# Cloudflare 분리 배포 가이드

## 1. 아키텍처

```text
Cloudflare Pages (apps/web/out)
          │ HTTPS fetch
          ▼
Cloudflare Worker (apps/api)
     └─ OpenRouter REST 텍스트 채팅
```

학습 콘텐츠·브라우저 계산 모형·진도 UI는 정적 Pages 자원입니다. 기존 요약 진도·퀴즈 점수·답안·대화와 신규 단위의 읽기·이어 학습 기록은 브라우저 `localStorage`에 저장됩니다. Worker는 별도 origin의 `/v1/*` API 요청을 처리하고 OpenRouter를 호출합니다. 브라우저 계산 모형은 실제 ROS·물리 엔진·GPU·장비 실행을 대신하지 않습니다.

## 2. Worker 설정

`apps/api/wrangler.jsonc`에서 다음 일반 변수를 운영 도메인에 맞게 설정합니다.

- `ALLOWED_ORIGINS`: Pages production/preview origin의 comma-separated allowlist
- `OPENROUTER_MODEL`: `openrouter/free`

비밀키는 설정 파일에 저장하지 않습니다.

```bash
cd apps/api
npx wrangler secret put OPENROUTER_API_KEY
```

이후 루트에서 Worker를 배포합니다.

```bash
npm run deploy:api
```

## 3. Pages 설정

Cloudflare Pages에 Git 저장소를 연결하고 다음과 같이 설정합니다.

| 항목 | 값 |
|---|---|
| Root directory | repository root |
| Build command | `npm run build:web` |
| Build output directory | `apps/web/out` |
| Production variable | `NEXT_PUBLIC_API_BASE_URL=https://<worker-domain>` |

패키지 관리자는 npm이며 루트 `package-lock.json`을 사용합니다. `pnpm-lock.yaml`이나 `pnpm-workspace.yaml`을 함께 커밋하면 Cloudflare가 pnpm을 선택할 수 있으므로 포함하지 않습니다. 의존성은 저장소 루트에서 설치해야 `apps/web`과 `packages/shared`까지 설치됩니다.

프리뷰 배포를 Worker CORS에서 허용하려면 예상하는 Pages preview origin을 `ALLOWED_ORIGINS`에 추가합니다. 임의 origin 허용(`*`)은 운영에서 사용하지 않습니다.

## 4. 배포 순서

현재 버전은 **Worker → Pages** 순서로 배포합니다. 신규 Worker는 기존 요청도 수용하고, 신규 Pages는 health의 `supportedContextVersions: [1]`로 신규 단위 문맥 지원 여부를 확인합니다. 구 Worker 또는 health 조회 실패 시 신규 TBD의 교재 근거 질문·실습 상태 질문을 제한하고 기존 자료 화면 또는 명시적인 일반 개념 질문을 안내합니다.

`OPENROUTER_API_KEY`는 Worker의 **런타임 변수 및 시크릿**에 Secret으로 등록합니다. 이 키를 `NEXT_PUBLIC_*`, Pages 빌드 환경 또는 Git 추적 파일에 넣지 않습니다.

무료 모델 기본값은 `openrouter/free`입니다. 특정 무료 모델은 `provider/model:free`로 지정할 수 있습니다. 유료 모델 설정은 코드에서 차단하며, 무료 한도·가용성 제한 시 유료 모델로 전환하지 않습니다. [OpenRouter 무료 라우터](https://openrouter.ai/openrouter/free), [호출 한도](https://openrouter.ai/docs/api_reference/limits)를 확인하세요.

Pages 빌드 감시 Include paths에는 `apps/web/*`, `packages/shared/*`, `ebook/book/*`, `package.json`, `package-lock.json`, `tsconfig.base.json`을 등록합니다. 교재 본문과 그림은 빌드 시 `ebook/book/`에서 가져오므로 원고 변경도 웹 재빌드 대상입니다.

1. Worker secret/vars 설정
2. Worker 배포 후 `/v1/health`의 `status: "ok"`와 `supportedContextVersions: [1]` 확인
3. Worker URL을 Pages의 `NEXT_PUBLIC_API_BASE_URL`에 설정
4. Pages 배포
5. Pages origin을 Worker `ALLOWED_ORIGINS`에 확정하고 필요한 경우 Worker 재배포
6. Pages의 신규 단위·기존 원문·아래 AI 정적 JSON과 단위 복귀/이어 학습을 확인

## 5. 로컬 환경

`apps/api/.dev.vars`:

```dotenv
OPENROUTER_API_KEY=replace-with-local-key
OPENROUTER_MODEL=openrouter/free
```

`apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
```


## 대화 저장·요약 기능 배포

추가 DB·환경변수는 필요하지 않습니다. 같은 `OPENROUTER_API_KEY`로 답변과 요약을 수행합니다. 이번 기능은 **Worker를 먼저 배포**해 `/v1/tutor/summary`와 이전 대화 필드를 지원한 뒤 Pages를 배포하세요. 기존 Pages의 단일 질문 요청도 Worker가 계속 받습니다. `/v1/health`의 `diagnosticsVersion`은 `2026-11-02.4`입니다.

브라우저 저장은 origin별로 나뉘므로 localhost·Pages 기본 도메인·커스텀 도메인의 대화는 서로 공유되지 않습니다. 요약은 길이 임계치에 도달할 때만 추가 호출하며, 복구 요약은 질문당 최대 2회입니다. AI 강사·평가·요약은 같은 OpenRouter 무료 계정 호출 한도를 공유합니다.


적응형 강사 변경도 Worker → Pages 순서로 배포합니다. 추가 환경변수·DB는 없습니다. 기존 요청은 `learnerState` 없이도 동작하며 이전 클라이언트는 새 응답의 추가 필드를 무시할 수 있습니다. 새 Pages는 이전 응답에 `learnerUpdates`가 없으면 상태를 유지합니다.


질문 기반 본문 조회도 Worker → Pages 순서로 배포합니다. 기존 장 기반 조회는 Pages prebuild가 `apps/web/public/tutor-content/chapter-N.json`을 생성합니다. 신규 단위 기반 조회는 Next 정적 export가 다음 파일을 생성합니다.

| 요청 URL | 산출물 | 확인 사항 |
|---|---|---|
| `/tutor-study/manifest` | `apps/web/out/tutor-study/manifest` | version 1, 204개 단위의 module/resource ID 색인 |
| `/tutor-study/unit-m06-02-a` | `apps/web/out/tutor-study/unit-m06-02-a` | 실제 단위 ID와 해당 단위·모듈의 공개 자료 |
| `/tutor-content/chapter-3.json` | `apps/web/out/tutor-content/chapter-3.json` | 기존 장 기반 클라이언트 호환 |

신규 JSON의 요청 URL에는 끝 슬래시가 없습니다. HTML 페이지의 trailing slash 규칙과 구분합니다. 정적 산출물은 확장자 없는 일반 파일이며 배포 후 URL에서 JSON을 읽을 수 있어야 합니다. 204개 단위의 JSON과 manifest를 함께 배포하고 일부 파일만 교체하지 않습니다.

신규 단위의 AI 조회는 해당 단위의 공개 자료에서 시작하고 추가 조회 1회에서 같은 모듈의 공개 자료까지 확장합니다. TBD·일부 준비 상태와 미작성 범위, 현재 전달되지 않은 실습 파라미터/결과를 함께 알립니다. 기존 장 기반 corpus는 이전 화면을 위해 유지합니다. 새 환경변수·DB는 필요하지 않습니다.

## 배포 전 로컬 확인

저장소 루트에서 `npm test`, `npm run check`, `npm run lint`, `npm run build`를 수행합니다. `build`의 Worker 단계는 `wrangler deploy --dry-run`이며 실제 배포하지 않습니다. Pages에서는 `apps/web/out`만 업로드하고 `.env.local`, `.dev.vars`, Worker dist 및 저장소 전체를 정적 루트로 업로드하지 않습니다. `NEXT_PUBLIC_API_BASE_URL`은 공개 API 주소이며 빌드 시 고정되므로 변경하면 Pages를 다시 빌드합니다.

로컬 파일·HTTP 검수는 운영 도메인의 CORS·캐시·배포 라우팅까지 확인했다는 뜻은 아닙니다. 실제 배포 시 위 URL·health·허용 origin 조합을 다시 확인합니다.

## 검색 노출 설정

대표 주소는 `NEXT_PUBLIC_SITE_URL`로 고정합니다(기본 `https://physical-ai-learning-web.pages.dev`). `SEO_PRODUCTION_BRANCH`는 main이 기본이며 다른 브랜치의 CF Pages 빌드는 noindex 처리됩니다. 소유확인 태그는 발급된 `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_NAVER_SITE_VERIFICATION`의 content 값으로 설정할 수 있습니다. 값 변경은 재빌드가 필요합니다.

`npm run build:web`은 canonical·사이트맵·메타데이터·H1·JSON-LD 전수 검사를 포함합니다. 배포 후 사이트맵 제출과 실제 HTTP 헤더/봇 접근 검증은 [SEO 점검 기록](SEO_REVIEW.md)의 절차를 따릅니다.
