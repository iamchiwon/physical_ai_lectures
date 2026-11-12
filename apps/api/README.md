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

`wrangler.jsonc`의 `ALLOWED_ORIGINS`는 기본 Pages 프로젝트 `https://physical-ai-learning-web.pages.dev`와 커스텀 도메인 `https://physical-ai.teachself.fun`을 함께 허용합니다. 추가 도메인·미리보기를 사용하면 기존 값을 유지하고 쉼표 구분 allowlist에 추가하세요. `npm run dev`는 로컬 origin을 별도로 override합니다.

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

`GET /v1/health`의 `diagnosticsVersion`이 `2026-11-02.4`이면 이번 변경이 배포된 것입니다.


## 챕터를 넘나드는 대화와 요약

대화 원본과 누적 요약은 프론트엔드의 `localStorage` 키 `physical-ai:tutor:v1`에 저장합니다. Worker에는 세션·사용자 DB가 없습니다. 각 요청에서 브라우저가 요약과 최근 대화를 전달하고, Worker는 `user`/`assistant` 순서로 모델에 전달합니다. 요청 당시 강의 정보와 현재 강의를 구분합니다.

- `POST /v1/tutor`의 선택 필드: `history`(최대 24회 질문·답변), `summary`(최대 6,000자). 기존 클라이언트도 호출할 수 있습니다.
- `POST /v1/tutor/summary`: `previousSummary`와 오래된 `turns`를 받아 `{summary}`를 반환합니다. 추가 무료 모델 호출 1회를 사용합니다. 요청당 복구 요약 작업은 최대 2회입니다.
- 추정 입력 예산 12,000토큰, 요약 1,500토큰, 현재 교재 맥락 2,500토큰, 답변 출력 최대 4,096토큰입니다. 요약 입력 자체도 10,000 추정 토큰 이내로 제한합니다. 최근 4회 대화를 우선 원문으로 보존하되 긴 답변은 예산에 맞춰 일부만 전달할 수 있습니다.
- 토큰 추정은 ASCII 3자당 1토큰, 비ASCII 문자당 2토큰과 메시지 여유분을 사용합니다. 모델별 실제 토큰 수를 보장하는 토크나이저는 아닙니다. 교재 원문과 전체 대화가 매번 모델에 전송되는 것은 아닙니다.
- 요약은 성공한 뒤에만 처리 위치를 갱신합니다. 실패·빈 응답·출력 잘림은 체크포인트를 이동하지 않습니다. 실패 시 기존 요약과 최근 대화로 답하고 UI에 맥락 제한을 알립니다. 원본 대화는 삭제하지 않습니다.
- 데모·실패·응답 대기 질문은 AI 이력과 요약에 포함하지 않습니다. 새로고침으로 끊긴 질문은 실패 상태로 복원합니다.
- `summary` 작업의 로그도 원문을 기록하지 않습니다. 질문·답변·요약을 담은 공급자 오류 본문도 기록하지 않습니다.

현재 챕터 초기화는 같은 `chapter-N`에 속한 교재·자가 점검 단원의 대화를 모두 제거합니다. 전체 초기화는 모든 대화를 제거합니다. 두 작업 모두 경고 확인 후 실행하며, 기존 누적 요약을 무효화해 삭제한 챕터 내용이 AI 맥락에 남지 않도록 합니다. 다른 챕터의 원본은 보존되므로 다음 질문에서 다시 요약할 수 있습니다. 진행 중 요청은 취소하고 오래된 응답은 무시합니다.

저장 형식을 검사하며 저장 용량·접근 제한은 UI에 경고합니다. 다른 탭의 저장 변경도 반영하고 진행 중 요청을 취소합니다. 동시 탭에서 정확히 동시에 수정하면 마지막 저장을 따릅니다. 다른 브라우저·기기·도메인 간 동기화는 제공하지 않습니다.

회귀 검증: 저장소 루트에서 `npm run test:tutor`.


## 적응형 AI 강사

페르소나와 지침은 `packages/shared/src/tutor-prompts.ts`의 `TUTOR_INSTRUCTIONS`에서 관리합니다. 친절하고 간결한 1타 강사 말투, 항상 존대말, 이모지 금지이며 비유·유도 질문·정리를 매번 강제하지 않습니다. 컴공 졸업은 초기 기준으로만 사용하고 개념별 이해 수준과 현재 질문에 맞춰 설명합니다.

강사 요청은 `response_format: json_schema`와 `require_parameters:true`를 사용해 구조화 출력을 지원하는 무료 공급자만 대상으로 합니다. [구조화 출력](https://openrouter.ai/docs/guides/features/structured-outputs), [무료 라우터 기능 필터](https://openrouter.ai/docs/guides/routing/routers/free-router).

강사 호출은 같은 무료 모델 요청 1회에서 `{answer, learnerUpdates}` JSON을 생성합니다. `answer`만 말풍선에 표시합니다. 모델이 일반 Markdown으로 답하면 답변을 유지하고 상태를 갱신하지 않습니다. JSON의 상태 형식이 잘못되거나 근거가 없으면 해당 갱신안을 버립니다. 잘린/깨진 JSON은 내부 평가를 노출하지 않고 데모 응답으로 처리하며 `tutor_output_format_invalid` 이벤트만 기록합니다. 형식 실패로 유료 모델이나 추가 AI 호출을 사용하지 않습니다.

`learnerUpdates`는 개념별 이해 상태(미확인·처음 접함·도움받아 이해·독립 적용), 확인된 지식, 어려움·오개념, 설명 전략, 확실성, 근거 종류·인용문을 담습니다. 갱신은 최대 3개이고 근거 인용이 **이번 질문에 실제 포함된 경우**만 수용합니다. 질문만으로 추정한 상태는 코드에서 미확인·낮은 확실성으로 제한합니다. AI가 설명했다는 사실은 이해의 증거가 아닙니다. 모델의 의미 판단 자체가 정확함을 보장하는 것은 아니므로 현재 학습자의 정정이 우선합니다.

검증한 상태 갱신안은 근거가 된 로컬 대화에 함께 저장하고 복원 시 상태를 재구성합니다. 요청의 `learnerState`(선택, 최대 12개 개념)를 서버가 검증하고 현재 단원·질문과 관련된 상태를 우선하여 추정 800토큰 이내로 조립합니다. 이 공간도 전체 입력 12,000토큰에 포함됩니다. 서버와 브라우저가 같은 시스템 지침으로 길이를 계산하고 구조화 출력 스키마용으로 1,000 추정 토큰을 추가 예약합니다.

현재 챕터 초기화 시 그 대화에 근거한 상태를 제거하고 남은 대화에서 다시 구성합니다. 전체 초기화는 상태도 지웁니다. 대화 요약과 별도로 근거를 보존하므로 요약 처리 후에도 학습 상태가 유지됩니다. 과거 버전의 저장 데이터는 상태 없이 복원할 수 있습니다. 질문·답변·근거 인용·학습자 상태 원문은 로그에 기록하지 않습니다.


실제 무료 모델 호출에서 `finish_reason=length`와 빈 답변이 관찰되어 `reasoning: {effort:"low", exclude:true}`를 적용합니다. 추론 토큰도 출력 예산에 포함될 수 있으므로 최종 답변 공간을 확보하려는 설정입니다. 공급자별 적용 여부는 다를 수 있습니다. 진단에는 숫자로 된 완료·추론 토큰 수만 추가하고 추론 원문은 기록하지 않습니다. [OpenRouter 추론 토큰 문서](https://openrouter.ai/docs/guides/best-practices/reasoning-tokens)


## 질문 기반 본문 조회

현재 챕터의 요약을 항상 첨부하지 않습니다. 위치 정보(ID·제목), 학습자 상태, 대화 기억을 기본으로 보내고 브라우저에서 현재 단원 전체를 검색해 관련 코드·문장만 `lesson.contextSummary`에 넣습니다. 이 필드는 호환성을 위해 이름을 유지하지만 새 프론트엔드에서는 요약이 아니라 검색 발췌입니다. 본문에 관련이 없는 질문에는 비웁니다.

선택한 본문과 화면에 뚜렷하게 보이는 코드를 우선하고, 제목·함수명·용어로 검색합니다. 코드에는 빈 줄을 포함한 줄 번호, 절 제목, 코드 번호를 붙입니다. 후보가 여러 개면 지칭 불명확 상태를 전달하여 임의의 코드를 설명하지 않게 합니다. 3,900자 뒤쪽도 검색 대상이며 전체 본문·코드를 매 요청 전송하지 않습니다.

자료가 부족하면 모델은 `lookupQuery`를 반환합니다. 프론트엔드가 고정된 같은-origin `/tutor-content/chapter-N.json`을 불러와 해당 챕터에서 추가 검색하고 `lookupComplete:true`로 한 번 더 요청합니다. 중간 답변은 대화창에 저장하지 않습니다. 모델이 임의 URL이나 실행 명령을 정할 수 없으며 DB·벡터 서비스·별도 검색 AI 호출은 없습니다. 메모리 요약을 제외한 답변 요청은 최대 2회입니다. 추가 조회 후에도 대상을 못 찾으면 확인 질문으로 종료합니다.

검색 발췌는 최대 4,000자·추정 2,000토큰으로 제한합니다. 긴 코드는 질문한 줄 주변을 먼저 담습니다. 실제 답변에 사용한 발췌는 대화에 저장해 다음 질문과 요약에서도 출처 맥락을 유지합니다. 검색은 키워드·지칭 대상 기반이며 임의의 의미 유사성을 완벽히 판별하는 검색기는 아닙니다. 실습 장비·시뮬레이션 실행 상태는 이번 조회 범위에 포함하지 않습니다.

## 주제 범위 제어: 점검 결과와 구현 제안 (미적용)

현재 강사 역할·로봇 안전·자료 안의 지시를 따르지 않는 규칙은 있습니다. 그러나 주제 이탈을 명시적으로 분류·거절하는 서버 정책은 없으며, Zod는 형식·길이만 검사합니다. 무관한 대화도 요약·학습자 상태에 포함될 수 있습니다. CORS는 브라우저 origin 설정이지 사용자 인증이나 직접 API 호출 방지 수단은 아닙니다.

제안은 `course`(강의 직접 관련), `prerequisite`(연결된 Python/C++·수학·물리·Linux 등 선수 지식), `learning_support`(학습 방법·진행 지원), `off_topic`(무관한 일상·정치·오락 등), `instruction_override`(역할·제약 우회 시도)를 구분하는 것입니다. 현재 챕터와 무관해도 사이트 전체 교육 범위라면 허용하고, 단순 키워드 차단으로 선수 지식을 막지 않습니다.

답변 JSON에 분류·근거 코드를 함께 받아 서버가 검증하고, 범위 밖이면 모델의 자유 답변을 버리고 고정된 짧은 존대말 안내와 학습 주제로의 복귀 제안을 반환하는 안을 권합니다. 해당 대화는 화면에 남겨도 향후 요약·학습자 상태·검색에서 제외해야 합니다. 모호한 질문은 연결 의도를 확인하도록 합니다. 모델 분류만으로 완전한 차단은 보장되지 않으므로 우회·경계 사례 테스트와 별도의 호출 제한/필요시 Turnstile을 함께 검토해야 합니다. 이 범위 정책과 호출 제한은 이번 변경에서 구현하지 않았습니다.
