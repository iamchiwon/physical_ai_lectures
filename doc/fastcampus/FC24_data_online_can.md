# FC24. 자율주행을 위한 차량 네트워크와 통신 CAN & UDS

- 조사일: 2026-11-02 (KST)
- 분류: 확장·차량 통신
- 공식 강의 페이지: [자율주행을 위한 차량 네트워크와 통신 CAN & UDS](<https://fastcampus.co.kr/data_online_can>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202510/144548-1893/-패스트캠퍼스--교육과정소개서-자율주행을-위한-차량-네트워크와-통신-can---uds.pdf>)
- 확인 수준: 공개 목차의 최하위 차시까지 확인. 8개 상위 묶음 / 39개 장 / 78개 CLIP 항목.
- 위 개수는 공개 목차 트리를 센 값입니다. 홍보 영역의 파트·클립 수, 영상 공개 여부, 실제 재생 가능한 수와 다를 수 있습니다.

## 과정의 활용 방향

CAN/FD·UDS·DTC·재프로그래밍·XCP/DAQ/A2L을 차량/산업 네트워크 선택 트랙으로 보존한다. 실제 ECU 쓰기는 기본 온라인 실습에 포함하지 않는다.

## 세부 커리큘럼

공식 페이지에 공개된 학습 주제의 순서를 정리했습니다. 번호·공백을 정규화했으며 강의 본문·영상·실습 해설을 재현한 자료가 아닙니다. 각 식별자는 통합안에서 원래 주제를 추적하기 위한 로컬 번호입니다.

### FC24-P01. 자율주행 시대, 통신이 더 똑똑해져야 하는 이유

#### FC24-P01-C01. 커리큘럼 소개

- `FC24-P01-C01-L001` 커리큘럼 Part 소개

#### FC24-P01-C02. 자율주행 시대, 통신이 더 똑똑해져야 하는 이유

- `FC24-P01-C02-L001` 자율주행 시대, 통신이 더 똑똑해져야 하는 이유

#### FC24-P01-C03. 이 강의, 어떻게 활용하면 좋을까요?

- `FC24-P01-C03-L001` 이 강의, 어떻게 활용하면 좋을까요?

### FC24-P02. 자동차 속 수많은 대화들: 차량 통신의 세계로 입장

#### FC24-P02-C01. 챕터 소개

- `FC24-P02-C01-L001` 챕터 소개

#### FC24-P02-C02. IVN 그리고 CAN 통신이란?

- `FC24-P02-C02-L001` IVN 그리고 CAN 통신이란?
- `FC24-P02-C02-L002` CAN 통신이란?
- `FC24-P02-C02-L003` CAN 만들어진 이유
- `FC24-P02-C02-L004` CAN의 역사
- `FC24-P02-C02-L005` CAN의 특징

#### FC24-P02-C03. 차량 내 통신 목적 분류 Normal

- `FC24-P02-C03-L001` 차량 내 통신 목적 분류 Normal

#### FC24-P02-C04. 차량 내 통신 목적 분류 Diagnostic

- `FC24-P02-C04-L001` 차량 내 통신 목적 분류 Diagnostic

#### FC24-P02-C05. 차량 내 통신 목적 분류 Reprogramming

- `FC24-P02-C05-L001` 차량 내 통신 목적 분류 Reprogramming

#### FC24-P02-C06. 차량 내 통신 목적 분류 Monitoring/Calibration

- `FC24-P02-C06-L001` 차량 내 통신 목적 분류 MonitoringCalibration

### FC24-P03. 차를 움직이는 언어, CAN의 기본 문법 익히기

#### FC24-P03-C01. 차를 움직이는 언어, CAN의 기본 문법 익히기

- `FC24-P03-C01-L001` 차를 움직이는 언어, CAN의 기본 문법 익히기 -

#### FC24-P03-C02. CAN 통신을 위한 네트워크 기본 이해: OSI 7 Layer와 프로토콜 스택

- `FC24-P03-C02-L001` OSI 7 Layer와 프로토콜 스택
- `FC24-P03-C02-L002` "왜 자동차 통신은 이렇게 복잡할까요?"
- `FC24-P03-C02-L003` 문제점 : 상호 호환성과 개발 효율 저하
- `FC24-P03-C02-L004` 해결책 : 네트워크 표준화와 계층 모델 (OSI 7 Layer)
- `FC24-P03-C02-L005` OSI 7 Layer 전체 개요

#### FC24-P03-C03. 전기 신호와 연결 (Physical Layer)

- `FC24-P03-C03-L001` CAN 통신의 물리적 세계 : 전기 신호와 연결 (Physical Layer)
- `FC24-P03-C03-L002` CAN 버스 : 단 두 가닥의 마법
- `FC24-P03-C03-L003` 차동 신호 (Differential Signal)의 원리 : 노이즈에 강한 이유

#### FC24-P03-C04. 버스 접근 규칙 (Arbitration & Addressing)

- `FC24-P03-C04-L001` CAN 트랜시버 (Transceiver)-
- `FC24-P03-C04-L002` CAN 메시지 중재와 주소 체계- 버스 접근 규칙 (Arbitration & Addressing)
- `FC24-P03-C04-L003` 메시지 ID의 심장- CAN 통신의 '이름표'이자 '우선순위'-
- `FC24-P03-C04-L004` Standard ID (11비트)와 Extended ID (29비트)- 두 가지 ID 체계-
- `FC24-P03-C04-L005` ID 값과 메시지 우선순위의 직접적인 관계 (낮은 ID = 높은 우선순위)

#### FC24-P03-C05. 메시지의 뼈대와 데이터 (CAN Framing)

- `FC24-P03-C05-L001` CAN Data Frame의 완전 해부 : 각 필드의 의미
- `FC24-P03-C05-L002` CAN 프레임의 종류 : 4가지 주요 프레임
- `FC24-P03-C05-L003` CAN Data Frame의 전체 구조 (Standard Format)
- `FC24-P03-C05-L004` SOF (Start of Frame) - 메시지의 시작을 알리는 신호
- `FC24-P03-C05-L005` Arbitration Field (ID + RTR) - 누가 먼저 말할 것인가?
- `FC24-P03-C05-L006` Control Field (IDE + r0 + DLC) - 데이터의 속성 정보
- `FC24-P03-C05-L007` Data Field - 실제 데이터가 담기는 곳
- `FC24-P03-C05-L008` CRC Field (Cyclic Redundancy Check) - 데이터 무결성 검증
- `FC24-P03-C05-L009` ACK Field (Acknowledgement Slot) - 수신 확인 및 오류 전파
- `FC24-P03-C05-L010` EOF (End of Frame) 및 IFS (Interframe Space) – 메시지의 끝과 다음 메시지 대기
- `FC24-P03-C05-L011` 클립 요약

#### FC24-P03-C06. 데이터 보호와 에러 관리 (Data Protection & Error Management)

- `FC24-P03-C06-L001` 비트 스터핑 : 에러 감지의 기본기
- `FC24-P03-C06-L002` 오류 감지 : 왜 중요한가?
- `FC24-P03-C06-L003` 비트 모니터링 (Bit Monitoring) : 송신자의 자가 진단
- `FC24-P03-C06-L004` 비트 스터핑 (Bit Stuffing)의 필요성 : 클럭 동기화 유지
- `FC24-P03-C06-L005` 비트 스터핑의 원리 : '끼워 넣기'를 통한 동기화 유지
- `FC24-P03-C06-L006` 클립 요약

#### FC24-P03-C07. 정확한 비트 판독 (Synchronization & Bit Time)

- `FC24-P03-C07-L001` Nominal Bit Rate와 샘플 포인트
- `FC24-P03-C07-L002` 동기화 (Synchronization) : 왜 필요한가?
- `FC24-P03-C07-L003` Nominal Bit Rate (명목 비트 전송률) : 통신의 속도 규약
- `FC24-P03-C07-L004` Bit Time (비트 타임)의 구성 : 4개의 세그먼트
- `FC24-P03-C07-L005` 샘플 포인트 (Sample Point) : 비트 값 판독의 핵심 시점
- `FC24-P03-C07-L006` 클립 요약

#### FC24-P03-C08. CAN FD: 더 빠르고 유연한 CAN (CAN with Flexible Datarate)

- `FC24-P03-C08-L001` CAN FD의 등장 배경과 필요성 자율주행 시대의 요구
- `FC24-P03-C08-L002` 기존 CAN의 한계 : 속도와 용량의 벽
- `FC24-P03-C08-L003` 자율주행과 ADAS : 데이터 폭발의 시대
- `FC24-P03-C08-L004` 새로운 요구사항 고속, 대용량, 그리고 유연성
- `FC24-P03-C08-L005` 클립 요약

#### FC24-P03-C09. CAN 메시지 구조 시각화 (CAN Trace with CANdb++)

- `FC24-P03-C09-L001` CAN 메시지 구조 시각화 (CAN Trace)

#### FC24-P03-C10. Quiz

- `FC24-P03-C10-L001` 퀴즈(5문제)

### FC24-P04. 자동차의 자가진단 시스템: UDS의 세계

#### FC24-P04-C01. UDS의 서막: 통합 진단 시스템의 필요성과 개요

- `FC24-P04-C01-L001` UDS의 서막 : 통합 진단 시스템의 필요성과 개요

#### FC24-P04-C02. UDS 전송 계층의 이해: ISO 15765-2

- `FC24-P04-C02-L001` UDS 전송 계층의 이해 : ISO 15765-2

#### FC24-P04-C03. UDS 통신 기본 설정: 어드레싱, 타이밍, 응답 처리

- `FC24-P04-C03-L001` UDS 통신 기본 설정 : 어드레싱, 타이밍, 응답 처리

#### FC24-P04-C04. UDS 서비스 그룹 둘러보기: ISO 14229의 주요 기능

- `FC24-P04-C04-L001` UDS 서비스 그룹 둘러보기 : ISO 14229의 주요 기능

#### FC24-P04-C05. Quiz

- `FC24-P04-C05-L001` 퀴즈(5문제)

### FC24-P05. DTC를 읽는다는 것: 고장의 흔적을 추적하다

#### FC24-P05-C01. DTC의 이해: 고장 코드의 발생과 진단

- `FC24-P05-C01-L001` DTC의 이해 : 고장 코드의 발생과 진단

#### FC24-P05-C02. DTC 정보 초기화: Clear DiagnosticInformation (0x14)

- `FC24-P05-C02-L001` DTC 정보 초기화 : Clear DiagnosticInformation (0x14)

#### FC24-P05-C03. DTC 정보 읽기: Read DTCInformation (0x19)

- `FC24-P05-C03-L001` DTC 정보 읽기 : Read DTCInformation (0x19)

#### FC24-P05-C04. DTC 제어: ControlDTCSetting(0x85)

- `FC24-P05-C04-L001` DTC 제어 : ControlDTCSetting(0x85)

#### FC24-P05-C05. Quiz

- `FC24-P05-C05-L001` 퀴즈(5문제)

### FC24-P06. ECU에 새 생명을: 다운로드 통신과 보안

#### FC24-P06-C01. 리프로그래밍의 시작: 진단 세션 및 통신 제어 그리고 보안 접근

- `FC24-P06-C01-L001` 리프로그래밍의 시작 : 진단 세션 및 통신 제어 그리고 보안 접근

#### FC24-P06-C02. ECU로 데이터 전송: 다운로드 통신 서비스

- `FC24-P06-C02-L001` ECU로 데이터 전송 : 다운로드 통신 서비스

#### FC24-P06-C03. 리프로그래밍의 마무리: 유효성 검증 및 재설정

- `FC24-P06-C03-L001` 리프로그래밍의 마무리 : 유효성 검증 및 재설정

#### FC24-P06-C04. Quiz

- `FC24-P06-C04-L001` 퀴즈(5문제)

### FC24-P07. ECU를 바라보는 또 다른 창: 실시간 데이터 모니터링의 이해

#### FC24-P07-C01. ECU와 소통하는 만능 '표준어': XCP 프로토콜의 모든 것

- `FC24-P07-C01-L001` XCP가 탄생하기까지 : CCP의 등장과 통신의 한계
- `FC24-P07-C01-L002` XCP의 3대 핵심 목적 : 모니터링, 캘리브레이션, 그리고 다운로드

#### FC24-P07-C02. 실시간 데이터 관찰의 핵심: DAQ와 폴링의 차이

- `FC24-P07-C02-L001` 실시간 데이터 관찰의 핵심 : DAQ와 폴링의 차이

#### FC24-P07-C03. ECU 데이터의 '언어 사전’: A2L 파일의 역할

- `FC24-P07-C03-L001` ECU 데이터의 '언어 사전' : A2L 파일의 역할

#### FC24-P07-C04. ECU 개발의 꽃: 캘리브레이션의 실제 활용

- `FC24-P07-C04-L001` ECU 개발의 꽃 : 캘리브레이션의 실제 활용

#### FC24-P07-C05. Quiz

- `FC24-P07-C05-L001` 퀴즈(5문제)

### FC24-P08. 툴의 세계를 훑어보기: 실무 툴 개요와 흐름

#### FC24-P08-C01. 툴의 세계를 훑어보기: 실무 툴 개요와 흐름

- `FC24-P08-C01-L001` 툴의 세계를 훑어보기 : 실무 툴 개요와 흐름
