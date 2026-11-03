"use client";

import { useId, useMemo, useState } from "react";
import { calculateWheelModel, type BodyVelocity, type WheelParameters } from "@/lib/wheel-model";

const defaults: WheelParameters = { mode: "mecanum", radius: 0.1, span: 0.4, vx: 0.2, vy: 0.1, omega: 0, limit: 2, rrOffset: 1 };
const number = (value: number) => (Math.abs(value) < 0.00005 ? 0 : value).toFixed(4);
function Velocity({ value }: { value: BodyVelocity }) {
  return <span>v_x {number(value.vx)} m/s · v_y {number(value.vy)} m/s · Ω {number(value.omega)} rad/s</span>;
}
export function WheelConceptLab() {
  const id = useId();
  const [parameters, setParameters] = useState<WheelParameters>(defaults);
  const result = useMemo(() => calculateWheelModel(parameters), [parameters]);
  const mecanum = parameters.mode === "mecanum";
  const labels = mecanum ? ["FL 앞왼쪽", "FR 앞오른쪽", "RL 뒤왼쪽", "RR 뒤오른쪽"] : ["L 왼쪽", "R 오른쪽"];
  const controls = [
    { key: "radius", label: "바퀴 반지름 r (m)", min: 0.02, max: 0.2, step: 0.01 },
    { key: "span", label: mecanum ? "k = l_x + l_y (m)" : "전체 바퀴 간격 b (m)", min: 0.1, max: 1, step: 0.05 },
    { key: "vx", label: "몸체 전진 v_x (m/s)", min: -1, max: 1, step: 0.05 },
    ...(mecanum ? [{ key: "vy", label: "몸체 왼쪽 v_y (m/s)", min: -1, max: 1, step: 0.05 }] as const : []),
    { key: "omega", label: "몸체 반시계 Ω (rad/s)", min: -3, max: 3, step: 0.1 },
    { key: "limit", label: "공통 바퀴 속도 한계 (rad/s)", min: 0.5, max: 20, step: 0.5 },
    ...(mecanum ? [{ key: "rrOffset", label: "별도 가상 기록 RR 편차 δ (rad/s)", min: -3, max: 3, step: 0.25 }] as const : []),
  ] as const;
  return <section id="wheel-concept-lab" aria-labelledby={`${id}-title`} className="mt-7 min-w-0 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 [overflow-wrap:anywhere] sm:p-6">
    <h2 id={`${id}-title`} className="text-xl font-bold">선택 보충 · 브라우저 바퀴 운동학 계산기</h2>
    <p className="mt-3 text-sm leading-7">M06.05 본문의 가상 배치와 SI 단위를 사용합니다. 몸체 x는 앞, y는 왼쪽, 양의 Ω는 반시계입니다. 양의 바퀴 회전은 모두 전진에 기여합니다. 정규화한 값이나 실제 모터 명령이 아닙니다.</p>
    <label htmlFor={`${id}-mode`} className="mt-4 block text-sm font-semibold">바퀴 모델<select id={`${id}-mode`} value={parameters.mode} className="mt-2 block w-full rounded border bg-white p-2" onChange={event => setParameters(previous => ({ ...previous, mode: event.target.value === "differential" ? "differential" : "mecanum", vy: 0 }))}><option value="mecanum">4메카넘 · FL / FR / RL / RR</option><option value="differential">차동 · L / R</option></select></label>
    {!mecanum ? <p className="mt-3 text-sm leading-7">차동은 같은 축 위의 일반 바퀴 두 개이며 v_y=0 제약이 있습니다. 모드를 바꾸면 v_y를 0으로 초기화합니다. 전진·회전으로 옆 위치에 가는 것과 순간 횡속도 요구는 다릅니다.</p> : <p className="mt-3 text-sm leading-7">메카넘은 본문의 45도 롤러 부호 계약입니다. 실제 장착이 다르면 이 식을 그대로 적용할 수 없습니다.</p>}
    <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">{controls.map(control => <label key={control.key} htmlFor={`${id}-${control.key}`} className="min-w-0 rounded-xl border bg-white p-3"><span className="flex flex-wrap justify-between gap-2 text-xs font-semibold"><span>{control.label}</span><output>{number(parameters[control.key])}</output></span><input id={`${id}-${control.key}`} type="range" className="mt-3 w-full accent-blue-700" min={control.min} max={control.max} step={control.step} value={parameters[control.key]} onChange={event => setParameters(previous => ({ ...previous, [control.key]: Number(event.target.value) }))} /></label>)}</div>
    <button type="button" className="mt-3 rounded border bg-white px-3 py-2 text-sm font-semibold" onClick={() => setParameters(defaults)}>계산기 설정 초기화</button>
    <div className="mt-4 space-y-3 rounded-xl border bg-white p-3 text-sm leading-7"><p>요구 몸체 속도: <Velocity value={result.desired} /></p><p>공통 축소 α = min(1, 한계 / max|ω|) = <strong>{number(result.scale)}</strong>. 바퀴를 각각 자르지 않고 모두 같은 비율로 줄입니다. 요구가 0이면 α=1입니다.</p><p>축소 후 순계산: <Velocity value={result.achieved} /></p></div>
    <div className="mt-4 max-w-full overflow-x-auto rounded-xl border bg-white p-2" tabIndex={0} role="region" aria-label="바퀴 각속도 표, 가로로 스크롤할 수 있습니다"><table className="w-full whitespace-nowrap text-xs"><caption className="py-2 text-left">바퀴 각속도 (rad/s) · 음수는 정한 양의 방향의 반대</caption><thead><tr>{["바퀴", "요구", "공통 축소 후"].map(label => <th key={label} scope="col" className="p-2 text-right">{label}</th>)}</tr></thead><tbody>{labels.map((label, index) => <tr key={label}><th scope="row" className="p-2 text-right">{label}</th><td className="p-2 text-right">{number(result.requested[index]!)}</td><td className="p-2 text-right">{number(result.limited[index]!)}</td></tr>)}</tbody></table></div>
    {mecanum ? <details open className="mt-4 min-w-0 rounded-xl border bg-white p-3 text-sm leading-7"><summary className="cursor-pointer font-semibold">별도 가상 기록 · RR 편차와 일관성 잔차</summary><p className="mt-3">축소 후 바퀴 값의 RR에만 δ를 더한 별도 기록입니다. 명령 한계 적용과 기록 편차는 독립이며 이 기록에는 한계를 다시 적용하지 않습니다. 기록 자체가 명령 한계 안에 있다는 보장은 없습니다. 기록−재구성 잔차는 rad/s입니다.</p><p className="mt-2">본문의 기록 (1,3,3,2)는 기본 기하·요구에서 한계를 3 rad/s 이상, δ를 1로 설정하면 재현됩니다. 기본 한계 2에서는 먼저 공통 축소하므로 기록과 추정 몸체 속도가 본문 예시와 달라집니다.</p><p className="mt-2">같은 가중치의 순추정: <Velocity value={result.estimate} /></p><p className="mt-2">기록−재구성 잔차의 유클리드 노름: {number(result.residualNorm)} rad/s</p><p className="mt-2">ω_FL + ω_FR − ω_RL − ω_RR = <strong>{number(result.consistency!)} rad/s</strong>. 이상 모델에서 0이어야 합니다. 작은 표시값은 반올림되므로 아래 수치가 0으로 보이는 것만으로 실제 타당성을 판단하지 마세요.</p><div className="mt-3 max-w-full overflow-x-auto" tabIndex={0} role="region" aria-label="메카넘 가상 기록과 재구성 잔차 표, 가로로 스크롤할 수 있습니다"><table className="w-full whitespace-nowrap text-xs"><thead><tr>{["바퀴", "가상 기록", "재구성", "잔차"].map(label => <th key={label} scope="col" className="p-2 text-right">{label}</th>)}</tr></thead><tbody>{labels.map((label, index) => <tr key={label}><th scope="row" className="p-2 text-right">{label}</th>{[result.recorded[index]!, result.reconstructed[index]!, result.residual[index]!].map((value, column) => <td key={column} className="p-2 text-right">{number(value)}</td>)}</tr>)}</tbody></table></div><p className="mt-3">잔차는 단위·번호·시각·접촉·미끄럼·센서 오류 등 여러 원인과 관련될 수 있습니다. 잔차만으로 원인을 확정할 수 없고, 0이어도 실제 이동을 증명하지 않습니다. 독립적인 베이스 운동 관측과 바퀴 기록·장착 확인이 필요합니다.</p></details> : null}
    <details className="mt-4 rounded-xl border bg-white p-3 text-sm leading-7"><summary className="cursor-pointer font-semibold">계산식·배치·모형의 한계</summary><pre className="mt-3 whitespace-pre-wrap break-words rounded bg-slate-50 p-2 text-xs leading-6">{mecanum ? "ω = (vx−vy−kΩ, vx+vy+kΩ, vx+vy−kΩ, vx−vy+kΩ) / r\n순서: FL, FR, RL, RR\nvx = r(FL+FR+RL+RR)/4\nvy = r(−FL+FR+RL−RR)/4\nΩ = r(−FL+FR−RL+RR)/(4k)" : "ωL = (vx−bΩ/2)/r, ωR = (vx+bΩ/2)/r\nvx = r(ωL+ωR)/2, vy = 0\nΩ = r(ωR−ωL)/b"}</pre><p className="mt-3">반지름은 모두 같고 이상적인 무미끄럼 운동학을 가정합니다. 몸체 프레임의 순간 속도만 계산하며 세계 자세·이동 궤적, 힘·가속·하중·마찰·실제 제어를 계산하지 않습니다. 공통 축소는 이 선형 모형에서 속도 비율을 유지하지만 실제 주행이나 안전의 충분 조건이 아닙니다.</p></details>
    <p className="mt-4 text-xs leading-6 text-slate-600">종이 실습의 차동·3옴니·메카넘 계산과 네 답안 흐름은 별도입니다. 이 브라우저 계산은 답안·진도·완료를 자동 저장하거나 변경하지 않습니다. 관찰은 필요한 경우 답안에 직접 적으세요.</p>
  </section>;
}
