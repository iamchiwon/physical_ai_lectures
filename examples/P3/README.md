# P3 · 물류 작업과 다중 로봇 통합

두 로봇의 합성 사건을 읽어 예약/실제점유,주행/정지·작업/물체확인·수납/다음주행허가를분리한다. Python3.12.11 표준라이브러리만사용한다. 일반언어/문법은설명하지않는다. [SPEC](SPEC.md)의계약과[해설](SOLUTION.md)을함께읽는다.

제공 reference는Python3.12.11·Darwin에서직접실행했다. 이기본활동은**고정사건의감독/재생**이며새물리관측을생성하는폐루프·실제ROS/fleet/주행/팔/물류/안전실증은아니다. 출력의DEPART_ALLOWED와all_ready_to_depart를실제출발/도착으로읽지않는다.

## 실행

이디렉터리에서Python3.12.11을선택해실행한다. 외부패키지·모델다운로드·네트워크·장비가필요없다.

```sh
python --version
python runner.py --scenario nominal --output nominal.json
python runner.py --scenario lease-expiry --output lease.json
python runner.py --scenario cancel --output cancel.json
python runner.py --scenario no-stow --output no-stow.json
python runner.py --scenario stale --output stale.json
python runner.py --scenario wrong-identity --output wrong-identity.json
python runner.py --scenario old-request --output old-request.json
```

출력은새파일만생성하며원입력/설정/소스·기존보고서를덮어쓰지않는다. `--output`이없으면JSON을화면에표시한다. 입력파일로출력리다이렉션하지않는다. `--input`/`--config`의기본은동봉cases.json/config.json이며원본복사본을변경해조건을비교할경우새지문과범위를기록한다.

## 기본 관찰

- nominal은두로봇의출발준비판정만완료한다. 예약/점유는마지막에비어있고두작업·수납/정지관측이유효하다.
- lease-expiry는예약이만료되어도r1점유가남아r2가대기한다. r1퇴장관측뒤에만r2가새예약을얻는다.
- cancel은취소수락을실제정지/수납으로만들지않고출발을차단한다. no-stow는작업/물체확인성공을보존하지만수납확인없이는출발하지않는다.
- stale/wrong-identity/old-request는형식/시각/세대의다른이유로INVALID_STOP이다. 유효성실패후추가허가를내리지않고원사건/처리접두열·미처리개수를보존한다.
- TTL100ms는사건의신선도,별도stateTTL1000ms는저장된정지/수납관측의신선도다. lease1000ms와같은숫자여도다른계약이다.

reference의source/config/input SHA·환경과자신의출력을비교한다. reference를자신의실행으로제출하지않는다. 근거에는예약/점유·취소/부분성과·수납/현재준비·미확인실물범위를각각적는다.
