# B01 공유 카탈로그 사용·검수 안내

- 등록 revision: `B01-2026-11-02.1`, `schemaVersion: 1`
- 근거: [A02 계약](catalog_contract.md), [A03 매핑](inventory/content-mapping.json), [커리큘럼](../integrated_curriculum.md)
- 작업 기록: [B01](work_items/B01.md). B01은 데이터 등록 단계이며 화면·라우트 연결은 B02~B04에서 진행한다.

## 1. 코드와 사용

| 파일 | 역할 |
|---|---|
| [catalog-data.ts](../../packages/shared/src/catalog-data.ts) | 명시적으로 등록한 7영역·6트랙·34모듈·204소주제·204단위·333 Resource·191 Activity·317 alias |
| [catalog-schema.ts](../../packages/shared/src/catalog-schema.ts) | strict Zod 타입, 부모/자식·참조·목표·선수 그래프·트랙 순서·alias 검증 |
| [catalog-readiness.ts](../../packages/shared/src/catalog-readiness.ts) | 연결 유효성·검수 revision·슬롯·단위·중복 제거 집계 |
| [catalog.ts](../../packages/shared/src/catalog.ts) | 데이터 등록 시 스키마 검증과 공개 진입점 |
| [catalog.test.mjs](../../tests/catalog.test.mjs) | 원안/A03/기준선 전수 대조·실제 파일 지문·실패 입력·준비도 회귀 테스트 |

```ts
import { catalog, catalogReadiness, indexCatalog, unitReadiness, bindingAvailability }
  from "@physical-ai/shared/catalog";

const index = indexCatalog(catalog);
const unit = index.units.get("unit-m06-02-a");
if (unit) {
  const readiness = unitReadiness(unit, index); // partial, 슬롯별 판정 포함
  const links = unit.slots.explanation.map(binding => ({
    binding, ...bindingAvailability(binding, index),
  })); // available=false인 연결은 실행을 막고 reason 표시
}
const summary = catalogReadiness(catalog); // 전체/영역/모듈/소주제/트랙 집계
```

큰 카탈로그를 기존 API/AI 공유 진입점에 포함하지 않도록 별도 export subpath를 사용한다. 런타임에서 문서 JSON·fs·교재 원문을 읽지 않는다. 본문은 복제하지 않고 기존 slug·파일·URL을 참조한다. 새 단위 정적 URL 생성과 화면 표시 코드는 후속 작업이다.

`npm run test:catalog`로 카탈로그 검수를 수행한다. 전체 `npm run build`의 prebuild에도 연결해 오류가 있으면 빌드를 중단한다. `build:web`만 실행하는 기존 배포 설정에는 이 prebuild가 적용되지 않으므로 이후 카탈로그 화면의 배포 검사에서 명시적으로 함께 실행한다.

## 2. 목표·선수 조건과 추천 경로

모든 단위에 안정 목표 ID·관찰 가능한 설명/진단 목표 초안과 explanation/practice/assessment 필수 요구 초안을 넣었다. `definitionStatus: pending`이므로 상세 집필 전 확정해야 하며 준비도 ready의 근거가 아니다. `estimatedMinutes`는 모두 null이다. 기존 320분 요약 시간을 신규 과정 시간으로 전용하지 않는다.

선수는 정확한 단위 ID의 allOf/anyOf 및 보충 목록으로 등록한다. 관련 모듈 전체를 선수로 일괄 참조하지 않고 진입에 필요한 소주제를 고른 뒤 모듈 내부 순서를 둔다. 선수 없는 M00.01만 명시적으로 confirmed이며 다른 조건은 단위 집필에서 재확인할 pending 초안이다. 선수는 접근 잠금이 아니다.

- M14.01 카메라 보정과 M14.03 시간 정합은 M13 점군 심화 없이 진행한다. M14.02·05 점군 융합에는 M13 기초를 보충한다.
- M15.01에는 Gazebo 로그(M09.05) 또는 ROS 시간/로그 기초(M05.06)의 대안을 둔다. 동등 로그의 실제 공급·활동은 집필에서 검수한다.
- M20.01에는 Isaac 기초(M10.01) 또는 MuJoCo 입문(M20.02)의 대안을 둔다. M20.02를 독립 입문으로 배치해 순환을 방지한다.
- M27은 모방학습/VLA/RL 중 하나, M30·31은 해당 트랙의 정책/제어 경험 중 하나를 추천한다.
- M32.01~04는 서로 다른 프로젝트 선택지로 다루며 서로를 선수로 강제하지 않는다. M32.02는 티칭/비전 또는 모방학습 경로, M32.04는 휴머노이드 또는 밸런싱 경로를 허용한다. M32.05~06은 공통 실증/설명 단계이다.
- M33은 본선 필수에 넣지 않는다. M31 전체 자동화 학습도 본선 필수로 강제하지 않으며 초기 재현/검토 습관은 후속 집필에서 짧게 적용한다.

트랙은 원안 순서를 바탕으로 선수 단위를 먼저 삽입한 명시적 step 배열이다. 같은 트랙에서 동일 단위를 두 번 이수하지 않는다. 선택 심화에는 추가 선수도 선택 step으로 앞에 넣으며, 선택 step이 본선의 필수 선수를 대신할 수 없다.

| 트랙 | 필수 단위 | 선택 단위 |
|---|---:|---:|
| 모바일 | 91 | 34 |
| 로봇팔·Physical AI | 113 | 0 |
| 휴머노이드·RL | 91 | 0 |
| 임베디드·제작 | 72 | 6 |
| 자율주행 차량 | 104 | 16 |
| 디지털 트윈·비전 | 101 | 6 |

트랙 수를 합산하여 전체 강의 수로 표시하지 않는다. 모든 트랙에서 같은 FK 단위/원문 ID를 재사용한다.

## 3. 보존 자산과 준비도

Resource 333개는 본문 137·요약 18·책 원본 파일 142·요약 점검 인라인 해설 36개이다. 원본 파일에는 예제/설정 49·그림·해설·루브릭·용어집·운영 문서가 포함된다. 본선 목차에 넣지 않는 파일에도 보존 사유와 지문을 남긴다.

Activity 191개는 서술/보고서 126·요약 점검 36·실습 원고 21·브라우저 모형 7·용어 복습 1개이다. 코드 다운로드는 supplement이며 실행 활동으로 세지 않는다. 브라우저 모형과 실습 원고는 서로 다른 수행 범위·한계를 표시한다. 기존 문제 ID·126개 답안 저장 키·평가 참조 hash를 그대로 유지한다. 보고서 입력 화면이나 context-only 해설을 개별 루브릭이 완성된 것으로 취급하지 않는다.

현재 준비도는 **ready 0 / partial 98 / tbd 106**이다. A03의 의미 매핑 통과를 단위 품질 검수로 승격하지 않아 모든 Binding은 unreviewed이다. Mobile ALOHA처럼 배경 참고만 있는 단위는 TBD를 유지한다.

- 유효 공개 primary 학습 자산이 없으면 tbd, 있으나 필수 요구/목표/선수 정의·검수에 공백이 있으면 partial.
- required 슬롯이 모두 full+passed+현재 revision이고, 평가 Activity에 판정/해설 근거가 있어야 ready. 부분 coverage의 단순 합산으로 full을 만들지 않는다.
- Activity 검수 지문은 자체 revision과 모든 본문·해설·루브릭 Resource revision을 함께 묶는다. 해설만 개정되어도 이전 검수는 낡은 것으로 처리한다. 검수 기록의 `reviewedRevision`에는 `bindingRevision` 반환값을 기록한다.
- draft·지문 불일치·없는 참조·needs_revision 연결은 사용 불가로 보고한다. 다른 유효 자료가 있어도 미해결 primary 결함은 ready를 막는다.
- 선택 step은 트랙 기본 집계에서 제외하며, 빈 필수 경로는 tbd와 정의 오류로 처리한다. 같은 unit ID는 중복 제거한다.

`integrity: matched`는 등록 당시 원본/구현 대조 결과이다. 클라이언트가 디스크를 실시간 검사한 값이 아니다. 배포 전 테스트의 실제 파일 지문 대조를 유지하고, 자산을 수정하면 revision·매핑·검수 근거를 함께 재평가한다. 런타임에서 파일 삭제·배포 누락 탐지는 후속 자산 연결/배포 검수에서도 확인해야 한다.

저장소 이행·완료율·AI 조회·새 본문 렌더링은 이 모듈에 포함하지 않는다. 기존 진도/답안/대화는 읽거나 수정하지 않았다.
