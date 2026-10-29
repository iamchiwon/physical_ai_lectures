### 실습 5-C: SmolVLA LoRA 학습 설계 {#lab-5-c}

#### 목표

- 재현 가능한 baseline과 LoRA ablation을 설계한다.
- trainable parameter와 VRAM/성능 trade-off를 기록한다.

#### 사전 기록

```bash
git -C lerobot rev-parse HEAD
python -c "import torch; print(torch.__version__, torch.version.cuda)"
nvidia-smi
lerobot-train --help > train-help.txt
```

#### 실험 행렬

| run | method | rank | alpha | target | batch/effective | seed |
|---|---|---:|---:|---|---:|---:|
| B0 | full 또는 공식 baseline | - | - | | | 7 |
| L8 | LoRA | 8 | 16 | default | | 7 |
| L16 | LoRA | 16 | 32 | default | | 7 |
| L32 | LoRA | 32 | 64 | default | | 7 |

#### LoRA 예

```bash
lerobot-train \
  --policy.path=lerobot/smolvla_base \
  --dataset.repo_id=${HF_USER}/my_so101_dataset \
  --dataset.revision=${DATASET_COMMIT_SHA} \
  --steps=20000 \
  --batch_size=16 \
  --peft.method_type=LORA \
  --peft.r=16 \
  --peft.lora_alpha=32 \
  --output_dir=outputs/train/lora_r16
```

설치한 commit의 `--help`와 다르면 해당 버전의 flag를 사용하고 차이를 기록한다.

#### 측정

- trainable/total parameter
- dataset/base model/adapter revision과 train-only stats hash
- peak VRAM
- 1,000 step wall time
- validation loss
- action limit violation rate
- 20회 closed-loop success

#### 중단 조건

- NaN loss
- 반복되는 action limit violation
- dataset/video decode error
- GPU thermal/power 이상
- evaluation 중 safety intervention

