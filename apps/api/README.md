# Physical AI Learning API

Cloudflare Workers에서 실행되는 Hono API입니다. 정적 프론트엔드와 분리해 배포하며 OpenRouter 비밀키는 Worker 런타임 secret으로만 관리합니다. AI 강사와 답안 평가 모두 OpenRouter Chat Completions API를 사용합니다.

## 무료 모델

기본 `OPENROUTER_MODEL=openrouter/free`는 사용 가능한 무료 모델을 자동 선택합니다. 특정 모델에 고정하려면 OpenRouter에서 현재 제공하는 `provider/model:free` ID를 설정하세요. 코드가 무료 라우터 또는 `:free` 접미사만 허용하고, 요청의 `provider.max_price`도 입력·출력 토큰 모두 0으로 제한합니다. 유료 모델이나 Gemini로 자동 전환하지 않습니다.

무료 모델은 응답 품질·지연·가용성이 달라질 수 있으며, 계정 전체에 호출 한도가 적용됩니다. AI 강사와 답안 평가는 같은 한도를 사용합니다. 한도 초과나 공급자 장애 시 기존 정책대로 강사는 명시적인 데모 답변을, 평가는 재시도 오류를 반환합니다. 키가 없으면 강사는 데모, 평가는 자기 점검 안내입니다.

- [무료 모델 라우터](https://openrouter.ai/openrouter/free)
- [호출 한도](https://openrouter.ai/docs/api_reference/limits)
- [공급자 가격 상한](https://openrouter.ai/docs/guides/routing/provider-selection)

## 로컬 준비

저장소 루트에서 의존성을 설치한 뒤 `apps/api`에서:

```bash
cp .dev.vars.example .dev.vars
# .dev.vars의 OPENROUTER_API_KEY에 OpenRouter 발급 키 입력
npm run dev
```

기존 `.dev.vars`가 있으면 덮어쓰지 말고 `OPENROUTER_API_KEY`를 추가하세요. `GEMINI_API_KEY`는 더 이상 읽지 않습니다. `.dev.vars`는 커밋하지 않습니다. 로컬 Worker 기본 주소는 `http://localhost:8787`이며 API prefix는 `/v1`입니다.

## API

- `GET /v1/health`
- `POST /v1/tutor`: 성공 시 `mode: "openrouter"`, `model`은 공급자가 반환한 실제 모델 ID입니다.
- `POST /v1/assessment`: 문제·답안·교재 해설을 바탕으로 학습 피드백을 반환합니다. 성공 시 `mode: "openrouter"`입니다.

## 운영 설정

`wrangler.jsonc`의 `ALLOWED_ORIGINS`는 기본 Pages 프로젝트 `https://physical-ai-learning-web.pages.dev`로 설정되어 있습니다. 커스텀 도메인·미리보기를 사용하면 쉼표 구분 allowlist로 바꾸세요. `npm run dev`는 로컬 origin을 별도로 override합니다.

`apps/api`에서:

```bash
npx wrangler secret put OPENROUTER_API_KEY
npm run deploy
```

`OPENROUTER_MODEL`은 일반 Worker 런타임 변수이며 기본값은 `openrouter/free`입니다. 키는 Pages 환경변수나 프론트엔드 코드에 넣지 않습니다. 배포 전환 시 새 `mode`를 인식하도록 Pages를 먼저 배포하고 Worker를 배포하세요. 새 Pages는 이전 Gemini 응답도 읽을 수 있습니다. 전환 확인 후 이전 `GEMINI_API_KEY`, `GEMINI_MODEL`은 삭제해도 됩니다.

## 진단 로그

`observability`가 활성화되어 있으며 요청 본문을 기록하지 않는 구조화 로그를 사용합니다. 질문·답안·교재 맥락·생성 답변·추론 내용·API 키·헤더·IP·사용자 ID·공급자 원문 오류 메시지 및 스택은 커스텀 로그에 기록하지 않습니다. 기본 요청별 invocation log도 비활성화했습니다. Cloudflare 자체 요청 메타데이터는 플랫폼 정책을 따릅니다.

- `openrouter_key_missing`: 런타임 키 미설정. 키 존재 여부만 기록합니다.
- `openrouter_request_failed`: 작업 종류, 임의 요청 ID, 형식 검사한 설정 모델명, 처리 단계·시간, HTTP 상태, 고정 오류 분류와 힌트만 기록합니다.
- `openrouter_request_completed`: 처리 시간·종료 사유. `length`는 warning입니다.

실패 분류는 `NON_FREE_MODEL_BLOCKED`, `UPSTREAM_HTTP_ERROR`, `REQUEST_TIMEOUT`, `EMPTY_OR_FAILED_TEXT_RESPONSE`, `INVALID_JSON_RESPONSE`, `NETWORK_OR_RUNTIME_ERROR`입니다. 401은 키, 402는 계정 잔액, 429는 무료 호출 한도, 503은 무료 모델 가용성을 확인하세요. 응답 본문에 오류가 있는 HTTP 200도 실패로 처리합니다.

`GET /v1/health`의 `diagnosticsVersion`이 `2026-11-02.1`이면 이번 변경이 배포된 것입니다.
