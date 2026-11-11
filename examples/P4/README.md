# P4 · 작은 BC 정책과 트윈·관제 평가

표준 라이브러리로 실제 시연 적합/분할 평가와 1차원 합성 폐루프를 실행합니다. [계약](SPEC.md) → 실행 → [해설](SOLUTION.md) 순서로 진행하세요. 선행 교재는 S10의 M20.06/M21.06·M25.06·M27.06·M30.05/.06·M34.01~03입니다. 언어 문법 입문은 제공하지 않습니다.

## 환경과 실행

검수 환경은 Python3.12.11/Darwin입니다. Ubuntu24.04의 Python3.12에서도 실제 버전/OS를 출력에 남겨 대조하세요. Ubuntu/실제 ROS·GPU 검증을 했다는 뜻은 아닙니다. 외부 패키지·데이터 다운로드·GPU·로봇 연결이 없습니다. 저장소에서는 `examples/P4`, ZIP에서는 풀린 `P4` 폴더에서 실행합니다.

```bash
python3 --version
python3 -m venv .venv
. .venv/bin/activate
python --version
python runner.py --output my-evaluation.json
python runner.py --policy zero --output my-zero.json
```

실행 전 Python3.12 계열인지 확인하고 실제 patch버전을 기록합니다. 정확한3.12.11이 필요하면 이미 설치된 해당 런타임으로 venv를 만드세요. 라이브러리 설치는 필요 없습니다. 결과 파일이 이미 있으면 새로운 이름을 쓰세요. runner는 입력/기존 결과를 덮지 않습니다. 경로·형식·분할 누수 오류는 exit2로 중단하며 성공 보고서를 만들지 않습니다.

입력은 `--config`, `--data`, `--cases`로 바꿀 수 있습니다. 원본을 보존한 복사본으로 바꾸고 지문을 함께 비교하세요. 새사례로의 확장은 동일 계약을 먼저 확인해야 하며 기본6개 분모를 누락하지 않습니다. 출력은 새 JSON파일 또는 `--output` 생략 시 stdout입니다. reference를 입력받아 판정문자열을 재사용하는 모드는 없습니다.

## 비교할 결과

기본4/2/2행은 서로 다른 세션의 train/validation/잠근test입니다. affine a=-0.5,b=0가validation으로선택됩니다. 이시연의validation/test MSE는0,zero는0.015625/약0.16입니다. 시험점수와모형의도착률은다른지표입니다.

기본은가상성공1/6입니다. nominal은7명령뒤x약0.133484m,shifted-dynamics는8명령뒤x1m입니다. stale/wrong-version/missing-observation은tick2에서INVALID_STOP·2명령으로끝납니다. rollback은2명령뒤x0.5625m를보존한채bundle-A/새epoch로선택을되돌리고ROLLBACK_HOLD입니다. zero정책은nominal에서도x1m라성공하지않습니다. 실패/무효/보류를분모에서제외하지마세요.

관제tick에는heartbeat,원본/변환시각·관측나이,현재/마지막값,요청/epoch·판정이유와명령/다음합성관측이있습니다. 수신신호가유효해도오래된관측이면현재값은null(미상)입니다. 실제이벤트수집/실시간3D화면이나권한/취소서버를구현한것은아닙니다.

## 수행 근거

1. 실제 환경·명령과 두 결과의 source/config/data/cases SHA,분할session/행수를 기록합니다.
2. 학습계수/validation선택·잠근test점수와zero비교,가상성공분모6을 연결합니다.
3. 세 무효 사례의tick/나이·개정/누락원인과명령수·남은tick을 비교합니다.100/200ms같은교육용수치를현장안전기준으로옮기지않습니다.
4. 롤백의새epoch/재개보류·변하지않은x와실제물리세계/GPU/ROS에서미확인인항목,다음검증을 적습니다.

reference는작성환경의실제실행예이고본인수행성과를대신하지않습니다. 기본완료는자신의실행·실패해석·분모/출처·한계가설명되는상태이며실물전이/안전숙달인증과별개입니다.
