### 최종 프로젝트 평가 기준 {#chapter-6-project-rubric}

총점 100점이다.

| 항목 | 배점 | 우수 기준 |
|---|---:|---|
| 과업 계약 | 10 | 성공/실패, timeout, reset, 조건을 사전 정의 |
| 안전 승격 | 20 | dry-run→저속→bounded→nominal 증거와 강등 조건 |
| 독립 안전 | 10 | E-stop/전원 차단, latched fault, 수동 재승인 |
| Reality Gap 진단 | 15 | 지연·기하·마찰·백래시 중 3개 이상 정량 분석 |
| 정책 배포 | 10 | 버전/해시, action chunk, filter, 주기 계약 |
| 실험 설계 | 15 | 조건별 반복, 순서 무작위화, 누락 없는 episode |
| 통계 보고 | 10 | 성공률 + Wilson CI + latency p50/p95/p99 |
| 재현성과 포트폴리오 | 10 | 코드·설정·실패 사례·라이선스·한계 공개 |

다음 중 하나라도 있으면 안전 승격 항목은 0점이다.

- workspace/joint limit 없이 실물 실행
- `PoseStamped.frame_id`를 무시하거나 좌표 변환 없이 `base_link`로 재표기
- stale target 또는 유효하지 않은 quaternion을 실행 경로에서 허용
- E-stop 뒤 자동 NOMINAL 복귀
- timeout 뒤 마지막 명령 무기한 유지
- 실패 episode 삭제 또는 성공 기준 사후 변경
- 자연어 명령으로 안전 제한 해제 가능

