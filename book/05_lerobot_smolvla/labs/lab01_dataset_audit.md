### 실습 5-A: LeRobotDataset v3 무결성 감사 {#lab-5-a}

#### 목표

- storage shard와 logical episode를 구분한다.
- schema, timestamp, video, task, stats의 불일치를 찾는다.
- 공개 전 개인정보와 라이선스를 점검한다.

#### 절차

1. dataset repository의 exact revision을 기록한다.
2. `meta/info.json`에서 codebase version, fps, feature schema, path template을 확인한다.
3. `meta/episodes`를 API로 읽고 episode length 분포를 그린다.
4. episode 0, 중간, 마지막을 선택해 첫/마지막 frame과 action을 확인한다.
5. 각 camera stream의 frame 수, resolution, timestamp gap을 확인한다.
6. state/action에서 NaN, Inf, joint limit 초과, 순간 jump를 찾는다.
7. task string을 영상과 대조한다.
8. `stats.json`의 mean/std/min/max를 raw sample에서 다시 산출한 값과 비교한다.
9. dataset card의 license, 수집 동의, 공개 범위, 삭제 절차를 검토한다.
10. 얼굴·이름표·모니터·문서·음성 등 개인정보 노출을 sample과 무작위 episode에서 검수한다.

#### 실행 예

```bash
python code/inspect_lerobot_v3.py \
  --repo-id USER/my_so101_dataset \
  --revision DATASET_COMMIT_SHA \
  --episode 0
```

#### 감사표

| 검사 | 기대 | 관찰 | 판정 | 조치 |
|---|---|---|---|---|
| codebase version | v3 호환 | | | |
| camera frame gap | 정의한 tolerance 이내 | | | |
| action finite | 전부 finite | | | |
| task/video 일치 | 전부 일치 | | | |
| privacy | 식별정보 없음 | | | |

#### 완료 조건

- 최소 3개 episode를 시작부터 끝까지 확인했다.
- 이동하는 branch가 아니라 exact dataset commit SHA를 기록했다.
- critical/major/minor issue를 구분했다.
- 공개 차단 조건과 재수집 조건을 명시했다.

