# Physical AI Learning API

## Gemini 진단 로그

`observability`가 활성화되어 있으며 요청 본문을 기록하지 않는 구조화 로그를 사용합니다. 질문·답안·교재 맥락·생성 답변·API 키·헤더·IP·사용자 ID·Gemini 원문 오류 메시지 및 스택은 커스텀 로그에 기록하지 않습니다. 기본 요청별 invocation log도 비활성화했습니다. Cloudflare 자체가 추가하는 요청 식별 메타데이터는 플랫폼 정책을 따릅니다.

- `gemini_key_missing`: 런타임 키 미설정. API 키 값은 기록하지 않습니다.
- `gemini_request_failed`: `operation`, 임의의 `requestId`, 허용된 형식의 모델명, 처리 단계·시간, upstream HTTP 상태, 고정된 오류 분류와 힌트만 기록합니다.
- `gemini_request_completed`: 처리 시간·종료 사유. `MAX_TOKENS`는 warning으로 기록합니다.

실패 분류는 `UPSTREAM_HTTP_ERROR`, `REQUEST_TIMEOUT`, `EMPTY_TEXT_RESPONSE`, `INVALID_JSON_RESPONSE`, `NETWORK_OR_RUNTIME_ERROR`입니다. provider 상태·reason은 허용 목록만 출력하며 `hints`는 오류 본문을 고정 문구로 분류한 값입니다. 원문 오류 메시지는 요청 내용을 되비출 수 있어 기록하지 않습니다. API 키 존재 여부만 기록하며 값·길이·접두사·해시는 기록하지 않습니다.

`GET /v1/health`의 `diagnosticsVersion`이 `2026-10-30.1`이면 이번 로그 변경이 배포된 것입니다. 기존 요청은 소급 기록되지 않으므로 배포 후 질문을 다시 보내고 같은 Worker invocation의 커스텀 로그를 확인하세요.

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
- `POST /v1/assessment`: 문제·답안·교재 해설을 바탕으로 학습 피드백을 반환합니다. API 키가 없으면 AI 평가 대신 자기 점검 안내를 반환합니다.

## 운영 설정

`wrangler.jsonc`의 `ALLOWED_ORIGINS`는 기본 Pages 프로젝트 `https://physical-ai-learning-web.pages.dev`로 설정되어 있습니다. 커스텀 도메인·미리보기를 사용하면 쉼표 구분 allowlist로 바꾸고 Gemini 키는 secret으로 등록합니다. `npm run dev`는 로컬 origin을 별도로 override합니다.

```bash
npx wrangler secret put GEMINI_API_KEY
npm run deploy
```

`GEMINI_MODEL`은 일반 Worker 변수이며 기본값은 `gemini-flash-latest`입니다.
