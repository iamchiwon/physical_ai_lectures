### [SIM] 실습 4-3: rosbag2/MCAP 에피소드 기록 {#lab-4-3}

```bash
cd ebook/book/04_sensor_data_pipeline
```

#### 목표

원본 메시지를 기록하고 metadata와 품질 통계를 분리해 보존한다.

#### 절차

1. 카메라, JointState, TF, command, `/clock`을 MCAP으로 기록한다.
2. `ros2 bag info`에서 topic별 count와 duration을 저장한다.
3. `--clock`으로 재생하며 `use_sim_time` Node의 동작을 확인한다.
4. 카메라 calibration hash, software revision, task prompt, success를 YAML manifest에 작성한다.
5. `/tf_static`을 제외한 bag을 별도로 만들고 재생 시 차이를 관찰한다.

#### 주의

사람 영상이 포함되면 수집 동의, 접근 권한, 보존 기간을 먼저 정한다.

