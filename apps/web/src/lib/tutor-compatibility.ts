import type { LearningContext } from "@physical-ai/shared";
/** Old Workers cannot guarantee the new readiness and live-state policy. */
export function tutorCompatibility(supported: boolean, context: LearningContext | undefined, question: string) {
  if (!context || supported) return { allowed: true, notice: "" };
  const stateQuestion = /실습.*(?:상태|결과|파라미터)|준비.*상태/.test(question);
  const tbdReference = context.readiness === "tbd" && !/^일반\s*개념[ :：]/.test(question);
  return { allowed: !stateQuestion && !tbdReference, notice: "[구 서버 호환 모드: 일반 개념 설명과 실제 연결된 기존 자료만 참고합니다.]\n" };
}
