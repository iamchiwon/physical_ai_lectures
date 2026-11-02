# Cloudflare 분리 배포 가이드

## 1. 아키텍처

```text
Cloudflare Pages (apps/web/out)
          │ HTTPS fetch
          ▼
Cloudflare Worker (apps/api)
     └─ OpenRouter REST 텍스트 채팅
```

학습 콘텐츠·시뮬레이션·진도 UI는 정적 Pages 자원입니다. 학습 진도와 퀴즈 점수는 브라우저 `localStorage`에만 저장되며, Worker는 사이트의 `/v1/*` API 요청을 처리하고 OpenRouter를 호출합니다.

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

Gemini에서 전환할 때는 새 응답 형식을 지원하는 Pages를 먼저 배포한 뒤 Worker를 배포하세요. 새 Pages는 이전 Gemini 응답도 읽습니다. `OPENROUTER_API_KEY`는 Worker의 **런타임 변수 및 시크릿**에 Secret으로 등록합니다. 기존 `GEMINI_API_KEY`와 `GEMINI_MODEL`은 전환 후 삭제할 수 있습니다.

무료 모델 기본값은 `openrouter/free`입니다. 특정 무료 모델은 `provider/model:free`로 지정할 수 있습니다. 유료 모델 설정은 코드에서 차단하며, 무료 한도·가용성 제한 시 유료 모델로 전환하지 않습니다. [OpenRouter 무료 라우터](https://openrouter.ai/openrouter/free), [호출 한도](https://openrouter.ai/docs/api_reference/limits)를 확인하세요.

Pages 빌드 감시 Include paths에는 `apps/web/*`, `packages/shared/*`, `ebook/book/*`, `package.json`, `package-lock.json`, `tsconfig.base.json`을 등록합니다. 교재 본문과 그림은 빌드 시 `ebook/book/`에서 가져오므로 원고 변경도 웹 재빌드 대상입니다.

1. Worker secret/vars 설정
2. Worker 배포 후 `/v1/health` 확인
3. Worker URL을 Pages의 `NEXT_PUBLIC_API_BASE_URL`에 설정
4. Pages 배포
5. Pages origin을 Worker `ALLOWED_ORIGINS`에 확정하고 Worker 재배포

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

추가 DB·환경변수는 필요하지 않습니다. 같은 `OPENROUTER_API_KEY`로 답변과 요약을 수행합니다. 이번 기능은 **Worker를 먼저 배포**해 `/v1/tutor/summary`와 이전 대화 필드를 지원한 뒤 Pages를 배포하세요. 기존 Pages의 단일 질문 요청도 Worker가 계속 받습니다. `/v1/health`의 `diagnosticsVersion`은 `2026-11-02.2`입니다.

브라우저 저장은 origin별로 나뉘므로 localhost·Pages 기본 도메인·커스텀 도메인의 대화는 서로 공유되지 않습니다. 요약은 길이 임계치에 도달할 때만 추가 호출하며, 복구 요약은 질문당 최대 2회입니다. AI 강사·평가·요약은 같은 OpenRouter 무료 계정 호출 한도를 공유합니다.
