# 제6장 산출물

- `chapter.md`: Sim2Real 진단, 안전 배포, 평가, 포트폴리오 본문
- `code/`: 필터, 안전 승격 상태 머신, 성공률/지연 진단 코드와 ROS 2 예제
- `labs/`: 단계별 배포·평가 실습
- `exercises/`: 확인문제 해설과 최종 프로젝트 평가표
- `images/`: 자체 제작 SVG 도식

이 장의 코드는 교육용이다. 위험성 평가와 독립적인 비상 정지 장치를 대체하지 않으며, 실물 장비 명령을 연결하기 전에 현장 책임자의 안전 검토를 받아야 한다.

ROS 2 예제의 `workspace_guard`는 의도적으로 동일 `base_link` frame만 허용하며 source timestamp와 quaternion을 검증한다. `stamped_pose_publisher`는 이 계약을 시험하기 위한 실습 도구이지 실물 드라이버가 아니다.

