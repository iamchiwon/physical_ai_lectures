"use client";

import * as React from "react";
import { VirtualLab } from "@/components/virtual-lab";
import { Button } from "@/components/ui/button";

type Model = "budget" | "physics" | "dataset" | "safety";
const configurations: Record<Model, { title: string; task: string; controls: { label: string; min: number; max: number; value: number; unit: string }[] }> = {
  budget: { title: "지연 예산과 마감 시각", task: "평균 처리 시간은 같게 두고 지터를 키워 보세요. 평균만 보면 안전해 보이는 조건에서도 마감 시각을 넘는지 비교합니다.", controls: [
    { label: "제어 주기", min: 10, max: 150, value: 50, unit: "ms" }, { label: "센서·전처리", min: 1, max: 60, value: 16, unit: "ms" }, { label: "추론", min: 1, max: 100, value: 26, unit: "ms" }, { label: "통신·안전", min: 1, max: 30, value: 5, unit: "ms" }, { label: "최대 추가 지연", min: 0, max: 60, value: 0, unit: "ms" },
  ] },
  physics: { title: "시간 간격·충돌과 마찰", task: "물리 주파수를 낮추거나 속도를 올려 1 step 이동 거리가 얇은 벽을 넘는 조건을 찾아보세요. 경사각과 마찰계수도 바꾸어 미끄러짐 조건을 비교합니다.", controls: [
    { label: "물리 주파수", min: 30, max: 240, value: 120, unit: "Hz" }, { label: "속도", min: 1, max: 100, value: 40, unit: "0.1 m/s" }, { label: "벽 두께", min: 1, max: 100, value: 10, unit: "mm" }, { label: "경사각", min: 0, max: 60, value: 30, unit: "°" }, { label: "마찰계수", min: 0, max: 100, value: 60, unit: "×0.01" },
  ] },
  dataset: { title: "수집·분할·행동 청크 설계", task: "episode 수와 길이, 수집 주파수로 데이터 행 수를 계산하세요. 행동 청크가 길어질수록 환경 변화에 대응하지 못하는 구간이 얼마나 길어지는지 확인합니다.", controls: [
    { label: "Episode 수", min: 10, max: 200, value: 60, unit: "개" }, { label: "Episode 길이", min: 5, max: 120, value: 20, unit: "초" }, { label: "수집 주파수", min: 10, max: 100, value: 50, unit: "Hz" }, { label: "검증 Episode 비율", min: 10, max: 50, value: 20, unit: "%" }, { label: "Action chunk 크기", min: 1, max: 40, value: 16, unit: "step" },
  ] },
  safety: { title: "안전 게이트와 오래된 명령", task: "명령의 나이를 TTL보다 크게 만들어 보세요. 속도 제한과 비상 정지가 각각 출력에 어떤 영향을 주는지 확인하고, 재개 조건을 보고서에 설명합니다.", controls: [
    { label: "명령 나이", min: 0, max: 500, value: 40, unit: "ms" }, { label: "Watchdog TTL", min: 10, max: 300, value: 100, unit: "ms" }, { label: "요청 속도", min: 0, max: 100, value: 70, unit: "×0.01 rad/s" }, { label: "최대 속도", min: 1, max: 100, value: 30, unit: "×0.01 rad/s" },
  ] },
};

export function TextbookLab({ source, chapter }: { source: string; chapter: number }) {
  if (/transform|fk_ik|openusd/.test(source)) return <><VirtualLab lessonId="kinematic-model-and-fk" /><LabExplanation text="관절각 변경이 말단 위치에 주는 영향을 관찰합니다. 좌표계·회전 순서·링크 길이를 구분하고 목표에 도달하지 못하면 도달 가능 범위와 특이점을 확인하세요. OpenUSD 장면 편집이나 실제 로봇의 모든 관절을 재현하지는 않습니다." /></>;
  if (chapter === 4 || /tf_sync|interfaces/.test(source)) return <><VirtualLab lessonId="multirate-alignment" /><LabExplanation text="센서 주기와 시간 오프셋을 달리해 같은 시각의 표본이 언제 사라지는지 관찰하세요. 허용 시간 차이를 키우면 매칭 수는 늘어도 서로 다른 순간의 데이터를 묶을 위험이 커집니다. 실제 센서 좌표 변환과 rosbag 기록 전체를 재현하는 도구는 아닙니다." /></>;
  if (chapter === 3 && /teleop/.test(source)) return <><VirtualLab lessonId="safe-leader-follower" /><LabExplanation text="관절각과 목표 위치의 관계를 먼저 확인하세요. 이 기구학 모형만으로 안전한 텔레오퍼레이션이 보장되지는 않습니다. 아래 보고서에서는 정렬, timeout, 속도 제한, 자동 재개 금지 조건을 별도로 설명하세요." /></>;
  return <ParameterLab model={chapter === 2 ? "physics" : chapter === 5 ? "dataset" : chapter >= 3 ? "safety" : "budget"} />;
}

function LabExplanation({ text }: { text: string }) {
  return <details className="mt-4 rounded-xl border bg-white p-4"><summary className="cursor-pointer font-bold">가상실습 해설과 적용 범위</summary><p className="mt-3 leading-7 text-slate-700">{text}</p></details>;
}

function ParameterLab({ model }: { model: Model }) {
  const config = configurations[model];
  const [values, setValues] = React.useState(config.controls.map((control) => control.value));
  const [emergency, setEmergency] = React.useState(false);
  const [ran, setRan] = React.useState(false);
  const [faultLatched, setFaultLatched] = React.useState(false);
  const [a, b, c, d, e] = values as [number, number, number, number, number];
  const result = model === "budget" ? `기본 지연 ${b + c + d} ms / 최대 지연 ${b + c + d + e} ms / 남은 예산 ${a - b - c - d - e} ms. ${b + c + d + e > a ? "마감 시각 초과: 명령 폐기·주기 조정·추론 최적화를 검토하세요." : "설정한 범위에서 마감 시각 이내입니다."}`
    : model === "physics" ? `1 step 이동 ${(b / 10 / a * 1000).toFixed(1)} mm, 벽 ${c} mm: ${b / 10 / a * 1000 > c ? "벽보다 길게 이동하여 이산 충돌 검출 누락 가능성이 있습니다." : "이동 거리가 벽 두께 이하입니다."} 경사 미끄러짐 조건 tan(θ)=${Math.tan(d * Math.PI / 180).toFixed(3)}, μ=${(e / 100).toFixed(2)} → ${Math.tan(d * Math.PI / 180) > e / 100 ? "미끄러짐 예상" : "정지 마찰로 버팀 예상"}.`
      : model === "dataset" ? `총 ${a * b * c}행. 검증 Episode ${Math.round(a * d / 100)}개, 학습 Episode ${a - Math.round(a * d / 100)}개. 20 Hz 제어에서 chunk ${e}개는 ${(e / 20).toFixed(2)}초의 행동을 제안합니다.`
        : `안전 상태: ${emergency ? "E-STOP" : a > b ? "STALE / HOLD" : faultLatched ? "HOLD / 재승인 대기" : "속도 제한 적용"}. 출력 속도 ${emergency || a > b || faultLatched ? 0 : Math.min(c, d) / 100} rad/s. ${emergency ? "비상 정지 중에는 재개를 허용하면 안 됩니다." : a > b ? "오래된 명령은 실행하지 않습니다." : faultLatched ? "원인을 해소한 뒤 명시적으로 재승인해야 합니다." : "유효한 명령도 속도 상한을 넘지 못합니다."}`;
  const explanation = model === "budget" ? "마감 시각은 각 단계 지연의 합으로 결정됩니다. 평균뿐 아니라 지터와 p95/p99를 관찰해야 합니다. 실제 시스템에서는 단계 간 중첩과 큐 대기도 측정해야 합니다."
    : model === "physics" ? "이동 거리가 벽 두께보다 길면 tunneling 위험이 커지지만 반드시 충돌이 누락되는 것은 아닙니다. CCD, 충돌 형상, 접촉 오프셋도 영향을 줍니다. 경사면 모델은 tan(θ)>μ인 단순 정지 마찰 조건을 사용합니다."
      : model === "dataset" ? "행 수는 episode 수×길이×수집 주파수입니다. 인접 프레임을 무작위 분할하면 누출될 수 있어 episode 단위로 나눕니다. chunk 길이는 새 관측을 반영하는 빈도와 구분해야 합니다."
        : "안전 게이트는 유효 시간, 비상 정지, 속도 제한을 독립적으로 검사합니다. 이 단순 모형은 관절 제한·충돌·상태 머신 전체를 재현하지 않습니다. 실제 장비는 E-stop 해제만으로 자동 재개해서는 안 됩니다.";
  return <section className="mt-8 rounded-2xl border border-blue-200 bg-white p-5" aria-label="브라우저 가상실습"><h2 className="text-2xl font-bold">가상실습: {config.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">장비 없이 변수를 조절해 결과를 관찰하는 단순 개념 모형입니다.</p><p className="mt-4 rounded-xl bg-blue-50 p-4">{config.task}</p><div className="mt-5 grid gap-5 sm:grid-cols-2">{config.controls.map((control, index) => <label key={control.label} className="text-sm font-semibold">{control.label}: {values[index]} {control.unit}<input className="mt-2 block w-full" type="range" min={control.min} max={control.max} value={values[index]} onChange={(event) => { const value = Number(event.target.value); setValues((current) => current.map((item, i) => i === index ? value : item)); setRan(false); }} /></label>)}</div>{model === "safety" ? <label className="mt-5 flex gap-2"><input type="checkbox" checked={emergency} onChange={(event) => { setEmergency(event.target.checked); setRan(false); }} />비상 정지 활성화</label> : null}<Button className="mt-5" onClick={() => { if (model === "safety" && (emergency || a > b)) setFaultLatched(true); setRan(true); }}>설정으로 실행·계산</Button>{model === "safety" && faultLatched ? <Button className="ml-3 mt-5" variant="outline" disabled={emergency || a > b} onClick={() => { setFaultLatched(false); setRan(false); }}>원인 해소 확인·재승인</Button> : null}{ran ? <div role="status" className="mt-4 rounded-xl bg-blue-50 p-4 leading-7">{result}</div> : null}<details className="mt-5 rounded-xl border p-4"><summary className="cursor-pointer font-bold">결과 해설과 실제 환경에서 확인할 점</summary><p className="mt-3 leading-7 text-slate-700">{explanation}</p></details></section>;
}
