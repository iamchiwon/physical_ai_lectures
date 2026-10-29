### 실습 2-A: 좌표 변환 체인과 쿼터니언 {#lab-2-a}

**[SIM]** 아래 명령은 저장소 루트가 아니라 `ebook/book/02_physx_simulation` 장 루트에서 실행한다.

#### 목표

- 변환 행렬의 곱셈 순서를 검증한다.
- Euler convention과 quaternion 성분 순서를 명시한다.
- round-trip 오차를 수치로 평가한다.

#### 준비

```bash
cd ebook/book/02_physx_simulation
python3 -m venv .venv
source .venv/bin/activate
python -m pip install numpy
python code/transforms.py
```

#### 절차

1. `world_from_table`, `table_from_object`의 translation을 그림으로 그린다.
2. `world_from_object = world_from_table.compose(table_from_object)` 결과를 기록한다.
3. 다음 검사를 코드에 추가한다.

```python
identity = world_from_object.inverse().compose(world_from_object).matrix()
print(np.max(np.abs(identity - np.eye(4))))
```

4. `table_from_object.compose(world_from_table)`처럼 순서를 바꿔 결과가 왜 달라지는지 설명한다.
5. yaw만 0°, 30°, 90°로 바꾸고 object 원점의 world 좌표를 표로 작성한다.
6. pitch를 89°, 90°, 91°로 바꾸고 matrix/quaternion이 연속적으로 변하는지 확인한다.
7. quaternion을 다른 API로 전달한다고 가정하고 `(xyzw) -> (wxyz)` adapter를 작성한다.

#### 기록표

| 조건 | world position | quaternion xyzw | round-trip max error |
|---|---|---|---:|
| yaw 0° | | | |
| yaw 30° | | | |
| yaw 90° | | | |

#### 토의

1. 행렬 원소 오차가 0이 아닌 이유는 무엇인가?
2. Euler angle이 불연속적으로 보이더라도 실제 회전은 연속적일 수 있는 이유는 무엇인가?
3. 좌표계 이름을 변수명에 포함시키면 어떤 종류의 결함을 예방하는가?

#### 완료 조건

- 변환 방향과 convention을 보고서에 명시했다.
- inverse/compose round-trip 오차를 수치로 제시했다.
- 잘못된 quaternion 순서가 만드는 오류 사례를 하나 제시했다.

