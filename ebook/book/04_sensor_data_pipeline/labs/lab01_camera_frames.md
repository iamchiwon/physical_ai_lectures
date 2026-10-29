### [SIM] 실습 4-1: 카메라 투영과 프레임 정합 {#lab-4-1}

```bash
cd ebook/book/04_sensor_data_pipeline
```

#### 목표

내부 파라미터로 3D 점을 투영하고 ROS body/optical frame 변환을 검증한다.

#### 절차

1. `python3 code/camera_geometry.py`를 실행한다.
2. \(f_x,f_y\)를 20% 변경하고 픽셀 이동을 기록한다.
3. optical depth와 Euclidean range를 같은 값으로 넣었을 때 화면 가장자리의 3D 복원 오차를 계산한다.
4. x, y, z 단위 벡터에 `R_opt_body`를 곱하고 축 의미를 표로 작성한다.
5. 의도적으로 한 축의 부호를 바꾸고 determinant가 -1이 되는지 확인한다.

#### 제출물

- 투영/역투영 round-trip 오차
- 좌표 프레임 표
- reflection과 rotation의 차이 설명

