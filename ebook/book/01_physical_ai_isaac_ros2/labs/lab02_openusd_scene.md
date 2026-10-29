### [SIM] 실습 1-2: OpenUSD 장면과 비파괴 Override {#lab-1-2}

```bash
cd ebook/book/01_physical_ai_isaac_ros2
```

#### 목표

Stage, Layer, Prim, Attribute, Relationship을 코드로 생성하고 합성 강도를 관찰한다.

#### 절차

1. OpenUSD Python 환경에서 `python3 code/create_usd_scene.py`를 실행한다.
2. 생성된 USDA에서 `/World/Target`을 찾는다.
3. Session Layer override가 파일에 저장되지 않지만 합성 결과에는 나타나는 이유를 설명한다.
4. 별도 `experiment.usda`를 만들고 target 위치에 더 강한 의견을 작성한다.
5. target에 `robotics:taskId` Attribute를 추가한다.
6. 카메라 두 대를 만들고 Relationship target을 복수로 설정한다.

#### 예상 결과 예시

```text
root layer color: blue
session composed color: red
relationship targets: [/World/Camera, /World/WristCamera]
```

#### 제출물

- USDA 2개
- Layer stack과 최종 값 설명
- Prim 경로 설계 원칙 3개

