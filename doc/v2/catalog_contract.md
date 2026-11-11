# A02 통합 카탈로그·콘텐츠 참조·준비도 계약 v1

- 확정일: 2026-11-02 / 적용 브랜치: `v2`
- 상태: A02 확정 당시 설계 계약. 현재 B01의 공유 타입·등록 데이터·준비도 구현은 [사용 안내](runtime_catalog.md)를 참고한다. 화면/정적 경로는 [B02](work_items/B02.md)·[B03](work_items/B03.md)·[B04](work_items/B04.md)에서 구현했다. 본문/활동 통합과 API·저장 이행은 후속 단계이다.
- 근거: [A01 분석](current_state_analysis.md), [기존 ID 기준선](inventory/legacy-content.json), [통합 커리큘럼](../integrated_curriculum.md)
- 검수: [작업 기록](work_items/A02.md), [사례](catalog_contract_cases.md), [축약 예시 JSON](inventory/catalog-contract-examples.json)

## 1. 목적과 기본 원칙

콘텐츠가 어디에 속하는지와 실제 무엇을 읽고 수행할 수 있는지를 분리한다. 전체 34개 모듈·204개 소주제를 먼저 보여주되 기존 본문은 관련 위치에서 열고, 부족한 부분은 TBD로 표시한다. 학습자가 이미 남긴 기록은 기존 식별자 그대로 보존한다.

- 콘텐츠 하나를 여러 학습 경로에서 참조해도 본문·문제·대화를 복제하지 않는다.
- 카탈로그의 준비 상태, 집필 작업 상태, 학습자의 완료/숙달은 서로 다른 값이다.
- 출처 목차만 있거나 파일이 생성되었다고 학습 가능한 내용으로 판정하지 않는다.
- 기존 내용을 공개한 사실은 보존하지만 새 학습 목표까지 충족했다는 판정은 A03 이후 검수 근거가 있어야 한다.
- 새 스키마는 TypeScript strict와 Zod 구현 대상이며 이 문서 자체는 컴파일 가능한 타입/운영 데이터가 아니다.

## 2. 개체와 관계

| 개체 | 필수 필드 | 관계·역할 |
|---|---|---|
| Catalog | schemaVersion, revision, areas, tracks, modules, topics, units, resources, activities, aliases | 카탈로그 스키마 버전과 편집 revision을 분리 |
| Area | id, title, moduleIds | 전체 목차의 대표 분류. 모듈은 정확히 한 대표 영역에 속함 |
| Track | id, title, description, steps | 분야별 추천 순서. steps는 안정 step ID와 unitId를 참조 |
| Module | id, title, areaId, topicIds, objectives | M00~M33. moduleId는 예전 교재 chapter 번호가 아님 |
| Topic | id, moduleId, title, unitIds, objectives | M00.01 등 204개 소주제. 단위가 분할되어도 topic ID 유지 |
| Unit | id, topicId, title, objectives, prerequisites, requirements, slots, revision | 실제로 읽고 활동하는 최소 단위. 처음에는 소주제마다 TBD 단위 하나를 두고 확장 |
| Resource | id, kind, locator, publication, revision, integrity | 실제 본문·요약·파일·그림·해설의 위치. 단원 소유 관계와 독립 |
| Activity | id, kind, resourceRefs, rubricRef, persistence, revision | 개념 실습·문제·보고서·용어 활동. 명시적으로 참조하며 chapter/파일명으로 추측하지 않음 |
| Binding | resourceId 또는 activityId, role, objectiveIds, coverage, review | 단원 슬롯과 자산 사이의 연결. 같은 원문이라도 목표 충족 범위는 단원별로 다를 수 있음 |
| Alias | kind, legacyId, canonicalId 또는 legacyUrl, targetUrl | ID/경로 호환 연결. 오래된 데이터를 재작성하지 않고 해석할 때 사용 |

대표 영역은 `area-foundations`(M00~M04), `area-robot-systems`(M05~M10), `area-perception`(M11~M16), `area-action`(M17~M22), `area-specialization`(M23~M29), `area-validation`(M30~M32), `area-optional`(M33)의 7개로 고정한다. 여러 분야와 관련된 모듈은 태그·트랙에서 재참조한다.

추천 트랙은 `track-mobile`, `track-manipulation`, `track-humanoid`, `track-embedded`, `track-autonomous-vehicle`, `track-digital-twin`의 6개이다. 선택 체험은 별도 영역이며 본선의 선수 필수로 강제하지 않는다. B01에서 원래 추천 경로를 구체적인 단위 순서로 변환하며 필요한 선수 단위를 먼저 배치한다.

### 단위와 소주제 분할

초기 unit ID는 `unit-m06-02-a`처럼 배정한다. 소주제 M06.02의 제목을 바꾸거나 정렬 순서를 바꿔도 ID를 바꾸지 않는다. 내용이 길어져 분할하면 기존 ID는 대표/기존 단위로 유지하고 `unit-m06-02-b` 등을 추가한다. 이전 내용의 의미가 달라지면 재사용하지 않고 새 ID와 명시적 대체 관계를 남긴다. 기존 완료를 새 하위 단위 전체 완료로 확장하지 않는다.

동일 학습 목표·활동이면 같은 unit을 여러 트랙에서 참조한다. 서로 다른 목표가 같은 원문을 사용하면 resource만 공유하고 각 unit의 coverage·review를 따로 평가한다. 목표가 다르면 같은 원문을 읽었다는 이유로 다른 unit을 자동 완료하지 않는다.

## 3. 식별자·원본·URL 호환

### 안정 ID 규칙

- ID는 표시 제목·정렬 위치·현재 URL에서 매번 재생성하지 않는다. module/topic 번호도 발급 이후 의미를 보존하고 순서는 배열로 관리한다.
- 기존 18 lesson ID, 137 textbook slug, 36 quickCheck ID, 126 exercise/report ID와 답안 키를 기준선대로 보존한다.
- 기존 Resource ID는 `legacy:lesson:<lessonId>`, `legacy:textbook:<slug>`, `legacy:asset:<source>`로 네임스페이스를 구분한다. 내부 resource ID를 길이 제한이 있는 API lessonId에 그대로 넣지 않는다.
- 새 Activity는 `activity-...`, 새 Resource는 `resource-...`, 단위는 `unit-...`의 불변 ID를 발급한다. Activity가 기존 문제이면 `legacy:exercise:<exerciseId>`, 요약 점검이면 `legacy:quick-check:<lessonId>:<questionId>`를 참조하고 실제 저장 키는 원형 유지.
- lesson/unit ID는 API에서 현재 허용하는 120자 이내로 유지한다. 표시명 변경을 데이터 이행으로 취급하지 않는다.

### Resource locator와 무결성

| kind | locator의 필수 정보 | 검증·표시 |
|---|---|---|
| legacy-textbook | legacyUnitId, source, legacyUrl, baselineCommit, baselineFileSha256 | 현재 내용과 고정 ID의 의미 대응 확인. chunk 순번을 새 원고에서 무조건 재계산하지 않음 |
| legacy-lesson | lessonId, legacyUrl, source=`course.ts`, baselineCommit | 요약임을 표시하고 상세 본문과 구분 |
| file/image | source, publicUrl, sha256 | 원본/다운로드/상대 이미지 위치 확인 |
| new-markdown | source, contentKey, revision | 신규 단위와 원고를 안정 contentKey로 연결 |
| activity/explanation | activityId 또는 source/contentKey | 문제·해설·루브릭·실습 종류를 명시적으로 구분 |

파일 지문이 바뀌면 새 revision의 매핑을 재검토한다. 단순 수정이 정당하면 새 무결성 근거를 승인하되 기존 ID가 같은 의미를 유지하는지 확인한다. 삭제·큰 재분할·절 이동은 alias/명시적 고정 slug 해석으로 처리하며 같은 숫자 순번의 엉뚱한 내용을 조용히 연결하지 않는다. 새 콘텐츠가 기존 자산을 대체해도 이전 URL과 사용자 기록은 보존한다.

### 경로 계약

| 경로 | V2 역할 |
|---|---|
| `/` | 통합 홈 |
| `/curriculum/` | 34모듈·204소주제 전체 목차 |
| `/modules/[moduleId]/` | 모듈 목표·소주제·준비 상태 |
| `/tracks/[trackId]/` | 추천 학습 순서·선수 보충 |
| `/study/[unitId]/` | 신규 카탈로그 단위. 준비된 자산과 TBD를 함께 표시 |
| 기존 `/learn/*`, `/textbook/*` | 계속 정적 생성·도달 가능. 신규 단위와 연결하되 원래 페이지를 없애지 않음 |
| 기존 `/textbook-assets/*` | 원고·코드·이미지 다운로드 유지 |

신규 경로는 B단계에서 구현할 계약이며 현재 운영 중이라는 뜻이 아니다. 모든 새 단위는 TBD라도 정적 params에 포함한다. `/textbook/`는 기존 본문 인덱스와 신규 목차로의 이동을 제공한다. 신규 단위에서 기존 원문으로 이동할 때 출처·관련 범위를 표시한다. 사용자가 기존 URL로 직접 들어오면 원래 읽기를 이어갈 수 있게 한다.

Alias는 순환·다중 모호한 대상·자기 참조를 허용하지 않는다. 하나의 옛 본문이 여러 unit과 관련되면 Resource→unit 역색인으로 연결 목록을 제공하고 단일 단원으로 임의 리다이렉트하지 않는다. 정적 export에서 서버 리다이렉트가 필요하다고 가정하지 않는다.

## 4. 작성 전 학습 계약과 준비 상태

Unit requirements는 작성 전에 확정한다.

- objectives: 안정 목표 ID와 관찰 가능한 수행 내용.
- prerequisites: 정확한 unit ID의 allOf/anyOf 목록, definitionStatus(pending/confirmed), 요구 이유, 보충 경로. allOf는 모두, anyOf는 하나 이상의 대안을 뜻하고 두 목록이 있으면 둘을 함께 충족하는 권장 관계이다. 비어 있으면 선수 없음으로 명시적으로 confirmed 처리한다. 모듈 전체를 무조건 선수로 강제하지 않음.
- requirements: `explanation`, `practice`, `assessment`의 required/optional/not_applicable, 사유와 필수 목표/활동.
- slots: 각 Binding과 목표 coverage(`none/partial/full`), 검수(`unreviewed/passed/needs_revision`), 검수 기록과 검토한 resource revision.
- explanation은 항상 required. assessment는 최소한 이해를 드러낼 질문+판정 기준+해설을 포함하여 required.
- practice는 코드·시뮬레이션·계산·그림 해석 등으로 선택한다. 별도 실습이 부적합하면 사전 사유와 대체 이해 확인을 정한 후 not_applicable 가능. required인 실습을 사후에 optional로 바꿔 통과시키지 않음.
- 선택 실물/GPU 심화와 참고자료는 기본 경로의 완료를 막지 않지만 그 준비 상태는 별도 표시한다.

### 원본 공개 여부·검수·coverage의 분리

Resource publication은 `published` 또는 `draft`이고 실제 존재/locator 유효 여부도 따로 검증한다. 기존 서비스의 본문은 published로 보존할 수 있지만 새 단원의 검수 상태는 unreviewed에서 시작한다. 새 초안은 작업 파일만 존재해도 학습 가능한 공개 자산으로 세지 않는다.

다음 표의 상태는 **기본 학습 경로 기준**이다.

| 슬롯 상태 | 결정 규칙 |
|---|---|
| not_applicable | requirements에서 사전에 사유가 확정된 별도 실습만 해당. 빈칸/TBD를 의미하지 않음 |
| tbd | 유효하게 공개된 연결 자산이 없음. 제목·목표만으로 준비 상태를 올리지 않음 |
| partial | 공개된 연결 자산은 있으나 필수 목표 coverage·활동·검수·revision 확인 중 하나 이상 미충족 |
| ready | 필수 목표 전체에 full+passed 연결이 있고 필수 활동/해설·기술 참조가 유효하며 검토 revision이 현재와 일치 |

필수 참조 누락·무결성 불일치·검수 탈락은 숨기지 않는다. 문제가 있는 자산은 해당 링크/활동의 실행을 막고 이유를 보여준다. 다른 유효 자산이 남으면 partial, 하나도 없으면 tbd이다. 예전 원문 전체가 폐쇄되었다는 뜻이 아니라 해당 매핑의 유효성을 보장하지 못한다는 뜻이다.

### Binding 필드와 판정의 세부 규칙

- role은 `primary` 또는 `supplement`이다. 단순 참고 다운로드·출처 링크는 supplement이며 그것만으로 단원을 partial/ready로 올리지 않는다.
- objectiveIds는 해당 unit의 목표 ID 부분집합이고, coverage는 그 목표들에 대한 none/partial/full이다. 서로 다른 부분 설명을 모았다고 자동 full로 합산하지 않는다. 통합 검수자가 목표 충족을 확인한 Binding 집합과 근거를 등록해야 한다.
- review는 `{verdict, reviewedRevision, evidenceRef}`이다. passed는 작업 검수 기록 evidenceRef와 실제 Resource/Activity revision을 필수로 요구한다. 여러 자산을 묶으면 revision 목록을 기록한다. 단순 true 플래그는 통과 근거가 아니다.
- 유효 공개 학습 자산은 primary 역할의 설명 또는 실제 수행/이해 확인 Activity이다. title·목표·예정 과제·외부 판매 링크·작업 초안은 제외한다.
- 단원 revision은 학습 목표/내용/평가 기준이 바뀔 때 증가하고, 트랙 정렬·제목 오탈자만 바뀌면 catalog revision만 갱신한다. completion의 contentRevision은 완료 당시 단원 revision을 뜻한다. Activity의 정답/루브릭 변경도 해당 단원의 검수와 revision을 재평가한다.

### Unit와 집계 상태의 산정 순서

1. requirements·목표·선수 조건 정의가 확정되지 않았으면 ready 금지. 선수 조건 없음도 명시적으로 확정해야 한다. 유효 공개 자산이 있으면 partial, 없으면 tbd.
2. applicable 필수 슬롯이 모두 ready이고 미해결 필수 결함이 없으면 unit ready.
3. 그 외 유효 공개 학습 자산이 하나 이상 있으면 unit partial, 없으면 tbd.
4. optional 슬롯이 TBD여도 기본 unit을 ready로 판정할 수 있다. 화면에는 `기본 학습 가능 / 선택 실물 심화 TBD`처럼 구분.
5. Topic/Module/Area/Track은 참조 단위의 상태를 중복 제거하여 집계한다. 필수 단위가 모두 ready이면 ready, 모두 tbd이면 tbd, 나머지는 partial. Track의 명시적 optional step은 기본 ready 산정에서 제외한다.
6. 자식이 0개이거나 필수 단위가 전혀 없는 컨테이너는 ready가 아니라 tbd이며 카탈로그 정의 오류로 기록한다.
7. 콘텐츠 변경으로 검수 근거가 낡거나 필수 결함이 발견되면 즉시 partial/tbd로 재산정하고 작업을 재개방한다. 기존 사용자 기록을 삭제하지 않는다.

예시 JSON은 아직 검수되지 않은 **기존 FK 본문 연결 후보(partial)**와 **새 RL 단원(tbd)** 두 사례만 담는다. A03에서 mapping 검수 없이 ready로 올리지 않는다.

## 5. 경로·선수 조건·탐색

Track step은 `{id, unitId, required}`이며 같은 track 안에서 동일 unit을 중복 이수시키지 않는다. 반복 실습이 필요하면 별도 Activity의 repeat 모드로 표현한다. 트랙별 순서와 전체 모듈 순서를 섞지 않는다.

- 단위 접근 URL은 안정 canonical 경로이며 `?track=<trackId>`는 탐색 문맥만 전달한다. 추적/진도 ID에 track 쿼리를 붙이지 않는다.
- 유효 track에 현재 unit이 포함되어 있으면 그 트랙의 이전/다음을 사용한다. 없거나 잘못된 track이면 unit의 topic/module 카탈로그 순서와 목차 복귀를 사용하고 다른 트랙의 다음 단위로 몰래 바꾸지 않는다.
- 다음 단위가 TBD여도 표시하되 준비 예정임을 알린다. 자동으로 건너뛰어 수료 처리하지 않는다. 별도로 `다음 학습 가능한 단위`를 제공할 때는 건너뛰는 항목과 선수 조건을 보여준다.
- 선수 조건은 잠금이 아닌 권장 학습 안내이다. 이미 아는 학습자는 학습을 열 수 있지만 이수/숙달을 자동으로 부여하지 않는다.
- 선수 그래프의 자기 참조·순환·없는 ID는 허용하지 않는다. anyOf는 대안 경로로 명시하며 순서를 맞추기 위해 prerequisites를 임의 삭제하지 않는다.
- 본문을 여러 track에서 공유해도 Activity 제출과 원본 대화는 복제하지 않는다. 트랙 총합을 사이트 전체 합계로 다시 합산하지 않는다.

### 이어 학습

신규 전역 lastLocation은 `{unitId, trackId|null, activityId|null, updatedAt}`이다. 유효한 신규 위치를 우선 복원하되 track이 제거됐으면 unit 단독으로 연다. 신규 위치가 없으면 기존 lastLessonId를 원래 `/learn/`에서 복원한다. 모호한 다대다 매핑을 임의 선택하지 않는다. 직접 본문 URL로 방문한 기록도 신규 위치로 저장하는 기능은 C04에서 구현한다.

복원 대상이 TBD/부분 준비로 바뀌었으면 그 상태의 페이지를 열고 변경 안내·목차/가능한 단원 선택지를 제공한다. 기록을 지우거나 첫 레슨으로 조용히 돌리지 않는다. 오래된 ID가 없어진 경우 alias를 확인하고 실패하면 기록을 보존한 채 복구 안내를 제공한다.

## 6. 통계·완료·평가 계약

| 값 | 규칙 |
|---|---|
| 전체 계획 | 모듈/소주제/단위 수를 구분. 초기 계획은 34/204이며 분할로 unit 수는 달라질 수 있음 |
| 준비 현황 | ready/partial/tbd 단위를 각각 표시. 모듈 하나에 본문 일부가 있다고 전체 준비로 세지 않음 |
| 예상 시간 | 실제 작성/검수된 단위의 명시적 시간만 합산. 미정은 null/TBD. 320분은 기존 요약 메타데이터로 별도 표시 |
| 문항 수 | 실제 공개 문항 ID를 중복 제거하여 집계. 계획 목표·루브릭 수를 문제 수로 세지 않음 |
| 신규 완료율 | 현재 ready 단위 중 사용자 명시적 완료 기록이 있는 단위 수 / 현재 ready 단위 수. 분모 0이면 비율 대신 학습 가능 단위 없음 표시 |
| 기존 요약 진도 | 기존 18레슨 완료·최고점은 별도 지표로 보존. 신규 완료율로 자동 환산하지 않음 |
| 모듈/트랙 완료 | 현재 필수 단위가 모두 ready이고 각각 명시적 완료된 경우만 표시. TBD가 있으면 공개분 완료와 전체 완료를 구분 |
| 숙달 | 완료 버튼과 별개. rubricVersion·activityId·근거·평가 방식으로 관리하며 미평가 상태를 허용 |

출시 후 ready 분모가 늘거나 콘텐츠가 개정되면 완료율이 바뀔 수 있음을 알린다. 과거 completion은 당시 contentRevision과 함께 보존한다. revision 변경 시 재확인 필요를 표시하며 과거 점수·완료를 삭제하지 않고 현재 버전 기준 완료율에는 재확인 전 포함하지 않는다.

부분 준비 단위에서는 읽기·활동 기록을 저장할 수 있으나 신규 단위 완료로 처리하지 않는다. 기존 레슨 완료 버튼의 의미는 기존 페이지에서 유지한다. Activity의 동일 정답/키워드 결과와 AI 피드백을 같은 숙달 증거로 취급하지 않는다. AI 평가 실패·자기 검토 모드에는 자동 통과를 부여하지 않는다.

## 7. 로컬 저장·버전·호환

### 저장 키

| 키 | 정책 |
|---|---|
| `physical-ai-study-progress-v1` | 기존 18레슨 기록을 원형 유지. 신규 ID를 이 키에 섞지 않음 |
| `physical-ai-answer-<legacyExerciseId>` | 기존 문제/보고서 답안은 기존 UI와 신규 연결 UI 모두 같은 키 사용 |
| `physical-ai:tutor:v1` | 기존 턴·메모리·학습자 갱신안 보존. 기존 chapterId를 새 moduleId로 일괄 치환하지 않음 |
| `physical-ai:learning:v2` | 신규 학습 단위 완료·Activity 근거·lastLocation·호환 메타데이터용 별도 키 |

신규 저장 문서는 `{schemaVersion:2,catalogRevision,unitProgress,activityRecords,lastLocation,migrations}`를 기본으로 한다. unitProgress는 unit ID별 viewed/completedAt/contentRevision을 구분하고, activityRecords는 같은 Activity ID/평가 revision을 공유한다. 신규 문제 답안·피드백·실습 입력 기록은 activityRecords에 저장하되 크기가 큰 원시 로그·이미지는 저장하지 않는다. 보관 상한과 사용자 안내는 C04에서 실제 크기 측정 후 설정한다. 자동으로 기존 답안을 지워 공간을 확보하지 않는다.

이 계약은 신규 활동의 필드 구조까지 런타임 구현한 것이 아니다. C04에서 Zod와 저장 어댑터·용량 예산·복구 UI를 구현한다.

### 이행 원칙

- 기존 키는 읽기/기존 기능 쓰기를 유지하며 대량 변환/삭제하지 않는다. 새 카탈로그는 명시적 legacy 참조로 기록을 해석한다.
- 새 저장소가 없을 때만 초기화하되 완료를 자동 부여하지 않는다. 동일 입력을 다시 열어도 기록을 중복 생성하지 않는 idempotent 어댑터를 사용한다.
- 새 스키마 검증·쓰기 성공을 확인하기 전에 기존 기록을 지우지 않는다. 실패·손상·미래 버전은 원문 보존, 메모리 사용 및 복구 안내로 처리한다. 파싱 실패를 빈 기록으로 덮어쓰지 않는다.
- 개인정보나 실제 대화를 저장/분석 문서에 복사하지 않는다. origin이 바뀌면 자동 이행되지 않음을 알린다.
- 대화 삭제·학습 진도 초기화·개별 답안 삭제는 독립 범위이다. 한 초기화가 다른 저장 키를 지우지 않는다. 기존 대화 확인창의 경고를 유지한다.
- 기존/신규 페이지를 함께 열어도 동일한 기존 Activity는 같은 답안 키에 저장한다. 새 저장소에 답안 복사본을 만들어 충돌시키지 않는다. 탭 간 갱신/충돌은 C04에서 확인한다.

### 대화 범위와 초기화

1. 기존 원문/요약 페이지에서 나눈 턴은 기존 `chapter-N`과 lessonId를 그대로 유지한다. 기존 현재 챕터 삭제도 그 범위를 유지한다.
2. 신규 `/study/`에서 질문할 때는 `chapterId=module-M06` 같은 안정 모듈 범위, lessonId=unit ID를 사용한다. 제목은 사용자 표시용이며 삭제 식별자가 아니다. 0~6 정규식으로 신규 자료 범위를 해석하지 않는다.
3. 신규 모듈의 현재 범위 삭제는 새 모듈 턴만 삭제하고 관련된 옛 chapter 전체를 함께 지우지 않는다. 옛 3장은 M06/M19/M20 등에 걸치므로 자동 묶음 삭제는 금지한다.
4. 확인창에 `현재 모듈의 대화` 또는 `현재 기존 챕터의 대화`와 실제 삭제 건수를 표시한다. 과거 관련 챕터 대화가 별도 범위로 남을 수 있음을 안내한다. 전체 대화는 어디서 열어도 하나로 이어진다.
5. 일부 범위 삭제 시 전역 요약을 무효화하고 남은 턴으로 학습자 상태를 다시 구성한다. 진행 중 요청 취소·늦은 응답 부활 방지·경고를 유지한다. 새 모듈에서 이전 장 이력을 읽는 것은 허용하지만 삭제 범위를 넓히는 근거로 사용하지 않는다.

## 8. AI 현재 문맥·자료 조회 계약

로컬 UI의 TutorLocation은 `{unitId, topicId, moduleId, trackId|null, title, readiness, activeResourceId|null}`로 정의한다. 실제 API lesson ID와 장 범위는 앞 절의 호환 규칙으로 전달한다.

- 현재 단위 전체 설명을 매번 넣지 않는다. 실제 공개된 연결 Resource에서 질문 관련 부분·선택 텍스트·코드 줄·주변 설명을 먼저 조회한다.
- resourceIds와 선택된 Activity의 목표/조건/파라미터/결과를 명시적으로 전달할 수 있게 한다. Activity 상태는 작은 whitelist 필드만 전달하며 원시 로그·비밀값을 보내지 않는다. 현재는 구현되지 않은 신규 계약이다.
- 추가 조회는 기존 lookupQuery 왕복을 유지하되 현재 unit의 resourceIds → 같은 module의 유효 Resource → 질문이 다른 과목을 명시한 경우 관련 카탈로그 범위 순서로 제한한다. 모든 본문을 첨부하지 않고 자료 ID·제목·관련 조각만 보낸다. 최대 추가 조회 1회와 입력 예산은 기존 기준을 유지한다.
- corpus는 빌드 시 생성하는 manifest와 문서 JSON으로 구성한다. manifest는 source chapter가 아니라 Resource ID·module/unit 참조를 색인한다. legacy chapter JSON은 이전 클라이언트 호환을 위해 유지한다.
- draft·TBD·검토 불가 자료는 검색에서 제외한다. 기존 published/unreviewed 본문을 참고할 수는 있지만 새 단원 전체의 검수 통과로 표현하지 않는다.
- 일반 개념 질문은 본문 없이 답할 수 있다. 단원 본문·코드가 없으면 해당 사실을 표시하고 일반 설명과 교재 근거를 구분한다. 존재하지 않는 코드 줄·실습 결과를 지어내지 않는다.
- 현재 파라미터가 전달되지 않았다면 실습 상태를 안다고 말하지 않는다. 사용자가 직접 선택/입력한 정보와 자동 전달 상태를 구분한다.
- 저장 턴에는 원래 lesson/chapter 정보·referenceContext를 유지한다. 신규 선택 메타데이터를 넣을 때 기존 스키마가 이를 복원 가능한지 검증하고, 기존 저장 v1을 무조건 바꾸지 않는다.

### Pages/Worker 별도 배포 호환

C05에서 `learningContext` 같은 선택적 새 메타데이터를 shared/API에 추가할 수 있으나 기존 요청 필드·답변 스키마·저장 턴의 필수 구조는 유지한다. 새 Worker는 구 클라이언트의 본문 기반 질문을 계속 처리해야 한다. 변경된 UI가 구 Worker에서 그대로 준비도/활동 상태 정책을 보장한다고 가정하지 않는다.

능력 협상(health 응답의 선택적 supportedContextVersions 등)으로 새 문맥 지원을 확인한다. 확인할 수 없으면 기존 콘텐츠 참조가 있는 질문은 기존 형식으로 제공하고, 신규 TBD의 교재/실습 근거 질문과 상태 기반 안내는 제한 안내로 처리한다. 일반 개념 질문은 일반 설명임을 명시하여 기존 형식으로 가능하다. 새 정책이 필요한 UI를 활성화하기 전에 호환 Worker를 준비하고 Pages/Worker 양쪽 조합을 C05/D에서 검수한다. 이 문서만으로 정책이 동작한다고 표시하지 않는다.

## 9. 카탈로그 검증과 후속 책임

| 규칙 | 위반 처리/검수 책임 |
|---|---|
| 34모듈·204소주제와 원안 대조, 부모-자식 양방향 일치 | B01 전수 대조; 누락·중복은 빌드 전에 발견 |
| ID 유일성·참조 존재·alias 순환 금지·선수 그래프 순환 금지 | B01/B04 데이터 검증 구현 |
| requirements와 목표·Binding coverage·review 근거 일치 | A03 매핑 및 단위 집필 검수 |
| published 링크·원본 지문·검수 revision 일치 | C01/D01 자산 확인. 불일치 시 ready 금지 |
| 기존 URL·문제 키·점수·대화 보존 | C03/C04, 실제 저장·기존/신규 페이지 왕복 확인 |
| ready/partial/tbd·통계·이동·TBD 표시 | B02~B04/D02 실제 화면 확인 |
| 명시적 실습·문제·해설 연결 | C02; 자동 기본 모형 배정 금지 |
| AI 자료 범위·준비도·구/신 Worker 호환 | C05/D02~D03 |
| 모든 단위 정적 생성·모바일·키보드·수식·코드 표시 | D02~D03 |

A02 완료는 계약을 확정했다는 뜻이다. ready 단위 수·모듈별 완성도·학습 진도는 A03의 매핑과 실제 구현/검수 이후 산출한다. [예시/사례](catalog_contract_cases.md)는 이를 구현하기 위한 판정 기준이며 운영 상태를 대신하지 않는다.
