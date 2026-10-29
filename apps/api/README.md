# Physical AI Learning API

Cloudflare Workers에서 실행되는 Hono API입니다. 정적 프론트엔드와 분리해 배포하며 Gemini 비밀키는 Worker secret으로만 관리합니다.

## 로컬 준비

```bash
cp .dev.vars.example .dev.vars
npm run dev
```

`.dev.vars`는 커밋하지 않습니다. 로컬 Worker 기본 주소는 `http://localhost:8787`이며 API prefix는 `/v1`입니다.

## API

- `GET /v1/health`
- `POST /v1/tutor`

## 운영 설정

`wrangler.jsonc`의 `ALLOWED_ORIGINS`는 기본 Pages 프로젝트 `https://physical-ai-learning-web.pages.dev`로 설정되어 있습니다. 커스텀 도메인·미리보기를 사용하면 쉼표 구분 allowlist로 바꾸고 Gemini 키는 secret으로 등록합니다. `npm run dev`는 로컬 origin을 별도로 override합니다.

```bash
npx wrangler secret put GEMINI_API_KEY
npm run deploy
```

`GEMINI_MODEL`은 일반 Worker 변수이며 기본값은 `gemini-flash-latest`입니다.
