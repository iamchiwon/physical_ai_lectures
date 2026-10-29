# Cloudflare 분리 배포 가이드

## 1. 아키텍처

```text
Cloudflare Pages (apps/web/out)
          │ HTTPS fetch
          ▼
Cloudflare Worker (apps/api)
     └─ Gemini REST 텍스트 채팅
```

학습 콘텐츠·시뮬레이션·진도 UI는 정적 Pages 자원입니다. 학습 진도와 퀴즈 점수는 브라우저 `localStorage`에만 저장되며, Worker는 Gemini `/v1/*` API 요청에만 실행됩니다.

## 2. Worker 설정

`apps/api/wrangler.jsonc`에서 다음 일반 변수를 운영 도메인에 맞게 설정합니다.

- `ALLOWED_ORIGINS`: Pages production/preview origin의 comma-separated allowlist
- `GEMINI_MODEL`: `gemini-flash-latest`

비밀키는 설정 파일에 저장하지 않습니다.

```bash
cd apps/api
npx wrangler secret put GEMINI_API_KEY
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

프리뷰 배포를 Worker CORS에서 허용하려면 예상하는 Pages preview origin을 `ALLOWED_ORIGINS`에 추가합니다. 임의 origin 허용(`*`)은 운영에서 사용하지 않습니다.

## 4. 배포 순서

1. Worker secret/vars 설정
2. Worker 배포 후 `/v1/health` 확인
3. Worker URL을 Pages의 `NEXT_PUBLIC_API_BASE_URL`에 설정
4. Pages 배포
5. Pages origin을 Worker `ALLOWED_ORIGINS`에 확정하고 Worker 재배포

## 5. 로컬 환경

`apps/api/.dev.vars`:

```dotenv
GEMINI_API_KEY=replace-with-local-key
```

`apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
```
