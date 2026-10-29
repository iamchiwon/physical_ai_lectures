### [SIM] [SAFETY] 실습 3-2: Leader-Follower 안전 필터 {#lab-3-2}

```bash
cd ebook/book/03_so101_kinematics_teleop
```

#### 목표

- 이름 기반 관절 매핑, soft limit, slew-rate limit, watchdog을 실험한다.
- 정상 운전과 HOLD/FAULT 전이를 구분한다.

#### 안전 경계

이 실습은 `code/safe_teleop_core.py`의 메모리 내 숫자만 처리한다. 모터 송신 코드를 추가하지 않는다.

#### 절차

1. `python code/safe_teleop_core.py`를 실행한다.
2. Leader의 `shoulder_pan` 목표를 상한보다 크게 바꾸고 clamp 결과를 확인한다.
3. 한 관절을 삭제한 dict를 입력해 `FAULT`가 되는지 확인한다.
4. 한 값을 `float("nan")`으로 바꿔 프레임 거부를 확인한다.
5. `deadman=False`로 호출해 측정 자세를 유지하는지 확인한다.
6. timeout을 0.05 s로 줄이고 워치독을 실험한다.
7. `MAX_RATE`를 높였을 때 첫 프레임의 변화량과 위험을 설명한다.

#### 설계 확장

- `FAULT` 이후에는 새 프레임만으로 자동 복구되지 않고 `reset_fault()`를 요구하도록 바꾼다.
- 캘리브레이션 ID와 URDF 해시를 입력 계약에 추가한다.
- 관절 clamp가 연속 5회 발생하면 작업 공간 명령을 거부하도록 한다.

#### 제출물

- 상태 전이표
- 각 실패 입력에 대한 예상 상태와 실제 상태
- 실물 적용 전 추가해야 할 하드웨어 독립 안전장치 목록

