# P2 · 지도 기반 이송과 장애물 대응

지도로드·제공위치/TF·경로·관측된도착/미션완료를분리하는작은격자모형이다. Python3.12.11 표준라이브러리만사용한다. 일반언어/문법은설명하지않는다. 실제ROS/Gazebo/Nav2·SLAM/물리/실물안전실증은아니다. [SPEC.md](SPEC.md)의계약과[해설](SOLUTION.md)을함께읽는다.

## 실행

Python3.12.11을선택하고이디렉터리에서실행한다. reference는검수자실행예이며자신의수행보고로제출하지않는다. 보고서의Python/platform·소스/설정/입력SHA를자신의환경과비교한다.

```sh
python --version
python runner.py --mode simulate --scenario nominal --output nominal.json
python runner.py --mode replay --input nominal.json --output replay.json
python runner.py --mode simulate --scenario temporary-block --output temporary.json
python runner.py --mode simulate --scenario permanent-block --output blocked.json
python runner.py --mode simulate --scenario missing-tf --output missing-tf.json
python runner.py --mode simulate --scenario stale --output stale.json
python runner.py --mode simulate --scenario wrong-map --output wrong-map.json
```

출력은새파일만만들며기존결과/입력/설정/소스를덮어쓰지않는다. `--output`없이는JSON을화면에출력한다. 입력파일로출력리다이렉션하지않는다. 재생은완전한simulate보고서의원관측을요구하며지도/설정지문이달라지면거부한다.

## 비교할 근거

- nominal:8칸이동·두waypoint의관측된도착후SUCCEEDED다. 지도로드/경로계산을미션성공으로세지않는다.
- temporary-block:tick2/3에서경로없음으로0이동,4에서해제후재계획해성공한다.
- permanent-block:3회연속경로없음에서BLOCKED다. 출력상태는WAITING2개와BLOCKED1개이며종료명령은0이다.
- missing-tf/stale/wrong-map:각변환없음/101ms초과/지도개정오류를분리해INVALID·0이동으로종료한다.
- simulate의결정이새모형위치를만드는것과replay가원관측열에같은결정을내리는범위를분리한다. 재생결정열은동일조건의simulate와같아야한다.

초기odom좌표(-1,2)는정상이며제공T_map_odom(+1,0)로map(0,2)가된다. 제공pose/점유는실제위치추정/검출의성능결과가아니다. 모형시각100ms스텝과한칸전이를실제운전속도로변환하지않는다.
