# PKG-P3-02 · 환경·스타터·고정 사건·재현 절차

- 날짜: 2026-11-09 / 상태: 통과·완료(구성/기본실행만).
- 사전기준: PKG-P3-01/SPEC의식별자/시간·예약/점유·주행/작업/수납/취소7사례와입출력보존을따른다. 실제ROS/fleet/물리/실물성과로제시하지않는다.
- 산출물: examples/P3의runner.py/config/cases/README와현재reference7개.

## 구현/탈고

고정사건감독기를작성해상호다른robot/namespace/frame/job/nav/armGoal을검사하고예약/관측점유·부분작업/취소/수납·출발준비를나눴다. 코드작성전명세독해에서저장된정지/수납상태의무기한재사용공백을발견해stateTTL1000ms를추가사전확정했다. 사건TTL100ms·lease1000ms와별도이고기존원칙을약하게바꾸지않는다. 정상18사건을교차처리해끝1700ms에서두로봇정지/수납이모두신선하다.

예상치못한진입/퇴장은unknown으로잠그고새허가하지않는다. INVALID는원사건을보존하되처리를중단하며미처리개수를따로보고한다. 이전에출발허가가있었어도최종요약은현재시각/전제로준비상태를재평가한다. 보고서의상태/부분성과는실제출발/물류성과가아니다.

## 실제 기본 실행

Python3.12.11·Darwin에서7사례를직접실행했다. nominal은18사건뒤두로봇ready/READINESS_CONFIRMED,lease-expiry는1000ms예약만료뒤점유대기와퇴장후GRANTED다. cancel/no-stow는각DENIED_CANCEL_PENDING/DENIED_NOT_STOWED로끝나며출발준비미완료다. stale/wrong-identity/old-request는각시각/identity·job검사에서INVALID_STOP/추가허가없음이다. 실제환경/소스/설정/입력SHA·원사건/결정은동봉reference에있다. `/tmp/p3-initial-execution.json`에도요약했다.

기본스타터/입력/실행근거/재현절차구성기준을충족했다. 경계/형식/상태회귀·개별해설은03에서,웹/다운로드/저장은04~05에서검수하므로P3전체완료는아니다. 다음PKG-P3-03. PDF/EPUB·외부배포없음.
