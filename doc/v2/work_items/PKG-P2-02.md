# PKG-P2-02 · 환경·스타터·고정 입력·재현 절차

- 날짜: 2026-11-09 / 상태: 통과·완료(구성/기본실행만).
- 산출물: examples/P2의 runner.py·config/cases·README와reference7개.
- 사전기준: PKG-P2-01/SPEC에서정한7×5지도/관측/TF/시간·6사례/재생일치·입출력보존과실행환경을따른다. 실제ROS/Nav2/SLAM/물리/장비성능으로확대하지않는다.

## 구현/탈고

표준라이브러리 BFS·관측/변환/시간검사·순차waypoint상태·대기/차단/도착/예산종료를분리했다. nominal의8칸과두도착판정,일시막힘2회대기/해제,영구막힘3회경로없음과무효3종류를구성했다. 폐루프원관측을완전한보고서에서재생하며지도/설정지문이바뀌면거부한다. 정적지도/제공위치/경로/도착을각각검사한다.

코드재독중스텝예산마지막에서중간waypoint에도달하면미완료임에도GOAL_REACHED상태로루프가끝나는경계를발견했다. 최종미션성공을제외한예산소진은TIMEOUT/0이동으로정정해명세를유지했다. 수치/판정기준변경없음. 검수02는기본구성/실행을확인하고적대/경계회귀·개별해설은03에서확정한다.

## 실제 실행

Python3.12.11·Darwin에서직접6사례와nominal재생을실행했다. nominal은MOVING8/GOAL_REACHED1/SUCCEEDED1,일시막힘은추가WAITING2뒤8칸이동/성공,영구막힘은MOVING2/WAITING2/BLOCKED1이다. TF없음·101ms·지도개정오류는각transform_unavailable/stale_observation/map_revision_mismatch로INVALID/0이동종료다. 모든실행의Python/platform/source/config/casebookSHA와관측/결정이reference에포함된다. nominal simulate/replay결정열은같다.

사용명령과새출력파일·고정재생/폐루프차이·예상기본결과/실제환경을README에명시했다. 원입력/소스보호와배타적출력생성은구현했고03의실제오류입력회귀로확정한다. SOLUTION은아직03에서보충할준비중상태다. 웹다운로드는04~05에서연결/검수하므로P2전체완료로표시하지않는다.

기본환경/스타터/입력/실행근거구성은통과. 다음체크는정상/경계/실패회귀·해설검수다. PDF/EPUB·외부배포없음.
