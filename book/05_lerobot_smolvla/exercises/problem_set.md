### 제5장 연습문제 및 구현 과제 {#chapter-5-problem-set}

#### 개념 문제

1. expert distribution과 learned-policy distribution을 식으로 구분하라.
2. action chunk가 오류 누적을 줄이는 측면과 open-loop 위험을 늘리는 측면을 설명하라.
3. Diffusion Policy와 flow matching action expert의 공통점과 차이를 조사하라.
4. VLA에서 language instruction이 모호하거나 잘못되었을 때 안전 계층이 해야 할 일을 설명하라.
5. LeRobotDataset v3가 episode당 파일 대신 shard를 사용하는 이유를 설명하라.
6. dataset metadata가 손상됐지만 MP4와 Parquet가 남아 있을 때 episode를 완전히 복원하기 어려운 이유는 무엇인가?
7. normalization stats도 model artifact로 versioning해야 하는 이유를 쓰라.
8. LoRA adapter와 base checkpoint revision을 함께 저장해야 하는 이유는 무엇인가?
9. temporal ensemble과 low-pass filter의 입력/의미 차이를 설명하라.
10. dataset 공개 이후 삭제 요청이 model checkpoint에 미치는 영향을 논하라.

#### 계산 문제

1. 20 Hz loop에서 capture 8 ms, preprocess 6 ms, inference 42 ms, safety 3 ms, communication 4 ms가 걸린다. deadline miss와 개선안을 계산하라.
2. `1024×1024` projection 두 개가 16 layer에 있고 rank 16 LoRA를 적용한다. full/LoRA parameter 수와 비율을 구하라.
3. 50 Hz로 20초 수집한 60 episode의 tabular row 수를 구하라.
4. chunk size 16, control 20 Hz일 때 chunk가 나타내는 시간 길이를 구하라.
5. ensemble decay \(\lambda=0.5\)이고 age가 0,1,2인 세 예측의 normalized weight를 구하라.

#### 구현 문제

1. episode group을 task variation별로 stratified split하는 함수를 작성하라.
2. timestamp gap과 역전을 보고하는 dataset audit 도구를 작성하라.
3. `TemporalEnsembler`에 최대 history와 mode-change reset 기능을 추가하라.
4. closed-loop mock에 별도 inference thread와 bounded queue를 추가하라.
5. run manifest의 SHA-256을 계산하고 checkpoint와 함께 저장하는 도구를 작성하라.

