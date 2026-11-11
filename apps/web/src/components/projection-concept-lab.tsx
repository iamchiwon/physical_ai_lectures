"use client";

import { useId, useMemo, useState } from "react";
import { calculateProjection, type ProjectionParameters } from "@/lib/projection-model";

const defaults: ProjectionParameters = { fx: 400, fy: 400, cx: 320, cy: 240, x: 0.1, y: 0.05, z: 1, vx: 0.2, deltaTime: 0.05 };
const controls = [
  { key: "fx", label: "초점 거리 f_x (px)", min: 50, max: 800, step: 50 },
  { key: "fy", label: "초점 거리 f_y (px)", min: 50, max: 800, step: 50 },
  { key: "cx", label: "주점 c_x (px)", min: 0, max: 640, step: 10 },
  { key: "cy", label: "주점 c_y (px)", min: 0, max: 480, step: 10 },
  { key: "x", label: "점 X (m) · 오른쪽 +", min: -1, max: 1, step: 0.05 },
  { key: "y", label: "점 Y (m) · 아래 +", min: -1, max: 1, step: 0.05 },
  { key: "z", label: "축 깊이 Z (m) · 앞 +", min: 0.1, max: 5, step: 0.1 },
  { key: "vx", label: "상대속도 v_x (m/s)", min: -1, max: 1, step: 0.05 },
  { key: "deltaTime", label: "같은 clock의 Δt (s)", min: -0.2, max: 0.2, step: 0.01 },
] as const;
const number = (value: number) => (Math.abs(value) < 0.00005 ? 0 : value).toFixed(4);
export function ProjectionConceptLab() {
  const id = useId(), clip = `${id}-clip`;
  const [parameters, setParameters] = useState<ProjectionParameters>(defaults);
  const result = useMemo(() => calculateProjection(parameters), [parameters]);
  return <section id="projection-concept-lab" aria-labelledby={`${id}-title`} className="mt-7 min-w-0 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 [overflow-wrap:anywhere] sm:p-6">
    <h2 id={`${id}-title`} className="text-xl font-bold">선택 보충 · 핀홀 투영과 시각 차이</h2>
    <p className="mt-3 text-sm leading-7">optical 좌표의 x 오른쪽·y 아래·z 앞을 사용합니다. 점은 Z&gt;0이며 상대 x속도가 일정하고 두 시각의 깊이는 같습니다. 같은 clock에서 Δt&gt;0은 나중, Δt&lt;0은 이전 시각입니다. 왜곡 없는 핀홀의 연속 이미지 좌표를 계산합니다.</p>
    <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-3">{controls.map(control => <label key={control.key} htmlFor={`${id}-${control.key}`} className="min-w-0 rounded-xl border bg-white p-3"><span className="flex flex-wrap justify-between gap-2 text-xs font-semibold"><span>{control.label}</span><output>{number(parameters[control.key])}</output></span><input id={`${id}-${control.key}`} type="range" className="mt-3 w-full accent-blue-700" min={control.min} max={control.max} step={control.step} value={parameters[control.key]} onChange={event => setParameters(previous => ({ ...previous, [control.key]: Number(event.target.value) }))} /></label>)}</div>
    <button type="button" className="mt-3 rounded border bg-white px-3 py-2 text-sm font-semibold" onClick={() => setParameters(defaults)}>투영 모형 설정 초기화</button>
    <figure className="mt-4 min-w-0 rounded-xl border bg-white p-3"><figcaption className="text-xs leading-6">640×480 가상 이미지 · 왼쪽 위 (0,0), 오른쪽 u+, 아래 v+. 파란 원: 기준 시각, 주황 마름모: t+Δt. 점이 겹치면 마름모 안에 원이 보입니다. 프레임 밖 점·선은 그림에서 잘리며 수치는 제한하지 않습니다.</figcaption><svg viewBox="0 0 640 480" className="mt-2 block w-full border bg-slate-50" role="img" aria-label={`기준 (${number(result.original.u)}, ${number(result.original.v)})에서 비교 (${number(result.shifted.u)}, ${number(result.shifted.v)})로 투영. 가로 차이는 ${number(result.deltaU)} 픽셀입니다.`}><defs><clipPath id={clip}><rect x="0" y="0" width="640" height="480" /></clipPath></defs><g clipPath={`url(#${clip})`}><line x1="0" x2="640" y1={parameters.cy} y2={parameters.cy} stroke="#cbd5e1" /><line x1={parameters.cx} x2={parameters.cx} y1="0" y2="480" stroke="#cbd5e1" /><line x1={result.original.u} y1={result.original.v} x2={result.shifted.u} y2={result.shifted.v} stroke="#334155" strokeWidth="3" /><path d={`M ${result.shifted.u} ${result.shifted.v - 12} l 12 12 -12 12 -12 -12 Z`} fill="none" stroke="#c2410c" strokeWidth="3" /><circle cx={result.original.u} cy={result.original.v} r="6" fill="#1d4ed8" /></g></svg></figure>
    <div className="mt-4 space-y-3 rounded-xl border bg-white p-3 text-sm leading-7"><p>기준 투영 (u,v) = ({number(result.original.u)}, {number(result.original.v)}) px · {result.original.inside ? "프레임 안" : "프레임 밖"}</p><p>t+Δt 투영 (u,v) = ({number(result.shifted.u)}, {number(result.shifted.v)}) px · {result.shifted.inside ? "프레임 안" : "프레임 밖"}</p><p>부호 있는 Δu = {number(result.deltaU)} px, ΔX = {number(result.deltaX)} m. v의 변화는 0 px입니다.</p><p>축 깊이 Z = {number(parameters.z)} m. 기준 유클리드 거리 = {number(result.range)} m, 비교 거리 = {number(result.shiftedRange)} m. 광선 거리와 z축 깊이는 같은 양이 아닙니다.</p></div>
    <details className="mt-4 rounded-xl border bg-white p-3 text-sm leading-7"><summary className="cursor-pointer font-semibold">식·단위·프레임 경계와 검증 한계</summary><pre className="mt-3 whitespace-pre-wrap break-words rounded bg-slate-50 p-2 text-xs leading-6">{"u = fx·X/Z + cx, v = fy·Y/Z + cy\nX' = X + vx·Δt, Y' = Y, Z' = Z\nΔu = fx·vx·Δt/Z (px)\nΔX = vx·Δt = (Z/fx)·Δu (m)\nrange = sqrt(X² + Y² + Z²) (m)"}</pre><p className="mt-3">X,Y,Z는 m, v_x는 m/s, Δt는 s, f_x,f_y,c_x,c_y는 px 단위입니다. f_x/f_y와 Z는 양수입니다. 픽셀당 m 비율 Z/f_x는 현재 깊이의 수평 방향에만 적용됩니다. 깊이를 모르면 픽셀 차이만으로 m를 확정할 수 없습니다.</p><p className="mt-3">프레임 안 규칙은 0≤u&lt;640, 0≤v&lt;480입니다. u=640 또는 v=480은 밖입니다. 밖에서도 수학적 투영은 유효하지만 실제 영상 픽셀을 선택할 수 있다는 뜻은 아닙니다. 반올림한 표시가 경계와 같아 보여도 판정은 반올림 전 값을 사용합니다.</p><p className="mt-3">두 clock의 오프셋 추정, 깊이 변화·6DoF 운동, 렌즈 왜곡·rolling shutter·가림·검출 오차는 포함하지 않습니다. 실제 CV·카메라·센서 실행이나 보정 결과가 아니며 관측의 타당성을 증명하지 않습니다.</p></details>
    <p className="mt-4 text-xs leading-6 text-slate-600">이 선택 보충은 본문·실습·세 문항과 별도입니다. 조작은 답안·진도·학습 완료를 자동 저장하거나 변경하지 않습니다.</p>
  </section>;
}
