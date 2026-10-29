# Cloudflare 분리 배포 가이드

## 1. 아키텍처

```text
Cloudflare Pages (apps/web/out)
          │ HTTPS fetch
          ▼
Cloudflare Worker (apps/api)
     ├─ Gemini REST / Live ephemeral token
     └─ D1 learning progress
```

학습 콘텐츠·시뮬레이션·진도 UI는 정적 Pages 자원입니다. Worker는 `/v1/*` API 요청에만 실행됩니다. 브라우저 진도는 localStorage를 우선 사용하고 API가 연결되면 D1과 best-effort로 동기화합니다.

## 2. D1 생성과 migration

```bash
npx wrangler login
npx wrangler d1 create physical-ai-learning
```

출력된 `database_id`를 `apps/api/wrangler.jsonc`의 placeholder와 교체합니다.

```bash
npm run db:generate
npm run db:migrate:local
npm run db:migrate:remote
```

`learner_id`는 브라우저가 생성하는 익명 ID이며 인증 수단이 아닙니다. D1에는 레슨 완료, 최고 점수, 응시 기록 외의 개인·민감 정보를 저장하지 않습니다.

## 3. Worker 설정

`apps/api/wrangler.jsonc`에서 다음 일반 변수를 운영 도메인에 맞게 설정합니다.

- `ALLOWED_ORIGINS`: Pages production/preview origin의 comma-separated allowlist
- `GEMINI_MODEL`: `gemini-flash-latest`
- `GEMINI_LIVE_MODEL`: `gemini-3.8-live`

비밀키는 설정 파일에 저장하지 않습니다.

```bash
cd apps/api
npx wrangler secret put GEMINI_API_KEY
```

이후 루트에서 Worker를 배포합니다.

```bash
npm run deploy:api
```

## 4. Pages 설정

Cloudflare Pages에 Git 저장소를 연결하고 다음과 같이 설정합니다.

| 항목 | 값 |
|---|---|
| Root directory | repository root |
| Build command | `npm run build:web` |
| Build output directory | `apps/web/out` |
| Production variable | `NEXT_PUBLIC_API_BASE_URL=https://<worker-domain>` |

프리뷰 배포를 Worker CORS에서 허용하려면 예상하는 Pages preview origin을 `ALLOWED_ORIGINS`에 추가합니다. 임의 origin 허용(`*`)은 운영에서 사용하지 않습니다.

## 5. 배포 순서

1. D1 생성 및 remote migration
2. Worker secret/vars 설정
3. Worker 배포 후 `/v1/health` 확인
4. Worker URL을 Pages의 `NEXT_PUBLIC_API_BASE_URL`에 설정
5. Pages 배포
6. Pages origin을 Worker `ALLOWED_ORIGINS`에 확정하고 Worker 재배포

## 6. 로컬 환경

`apps/api/.dev.vars`:

```dotenv
GEMINI_API_KEY=replace-with-local-key
```

`apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
```

Wrangler의 local D1은 `apps/api/.wrangler/state` 아래에 유지됩니다.
