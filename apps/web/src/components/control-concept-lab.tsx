"use client";

import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CONTROL_MODEL, CONTROL_SAMPLE_TIMES, simulateControlModel, type ControlParameters, type ControlResult } from "@/lib/control-model";

const defaults: ControlParameters = { kp: 1, ki: 1, kd: 0, sampleTime: 0.1, delaySamples: 0, antiWindup: true };
const number = (value: number) => value.toFixed(3);
function Result({ result, label }: { result: ControlResult; label: string }) {
  return <div className="min-w-0 rounded-xl border bg-white p-4"><h3 className="text-sm font-bold">{label}</h3><dl className="mt-3 grid grid-cols-2 gap-3 text-xs leading-6">
    <div><dt>최대 |e| · 전 구간</dt><dd className="text-base font-semibold">{number(result.maxAbsError)}</dd></div>
    <div><dt>4 s 이후 최대 |e|</dt><dd className="text-base font-semibold">{number(result.maxRecoveryError)}</dd></div>
    <div><dt>요청 명령 포화 시간</dt><dd className="text-base font-semibold">{result.saturationTime.toFixed(2)} s</dd></div>
    <div><dt>4 s 이후 ±0.05 첫 진입 시각 (전체 t)</dt><dd className="text-base font-semibold">{result.recoveryEntryTime === null ? "12 s 내 없음" : `${result.recoveryEntryTime.toFixed(2)} s`}</dd></div>
  </dl><details className="mt-3 text-xs leading-6"><summary className="cursor-pointer">요청 명령 포화 구간 {result.saturationIntervals.length}개</summary>{result.saturationIntervals.length ? <ol className="mt-2 max-h-40 overflow-y-auto">{result.saturationIntervals.map((interval, i) => <li key={i}>[{interval.start.toFixed(2)}, {interval.end.toFixed(2)}) s</li>)}</ol> : <p>포화 제한이 발생하지 않았습니다.</p>}</details></div>;
}
function ResponseChart({ current, comparison }: { current: ControlResult; comparison: ControlResult }) {
  const x = (time: number) => 36 + time / CONTROL_MODEL.duration * 270;
  const y = (value: number) => 18 + (1.7 - value) / 2.8 * 180;
  const path = (result: ControlResult) => [...result.points.map(p => `${x(p.time).toFixed(2)},${y(p.output).toFixed(2)}`), `${x(CONTROL_MODEL.duration)},${y(result.finalOutput)}`].join(" ");
  return <svg viewBox="0 0 320 235" className="block w-full" role="img" aria-label="12초의 계산 응답. 파란 실선은 현재 설정, 주황 파선은 반대 anti-windup 설정이며 검정 점선은 목표입니다. 수치는 아래 표와 명령 기록에서도 확인할 수 있습니다.">
    {[-1, 0, 1, 1.5].map(tick => <g key={tick}><line x1="36" x2="306" y1={y(tick)} y2={y(tick)} stroke="#e2e8f0" /><text x="30" y={y(tick) + 4} textAnchor="end" fontSize="13" fill="#475569">{tick}</text></g>)}
    {[0, 4, 8, 12].map(tick => <g key={tick}><line x1={x(tick)} x2={x(tick)} y1="18" y2="198" stroke="#e2e8f0" /><text x={x(tick)} y="216" textAnchor="middle" fontSize="13" fill="#475569">{tick}</text></g>)}
    <polyline points={`${x(0)},${y(1.5)} ${x(4)},${y(1.5)} ${x(4)},${y(0.2)} ${x(12)},${y(0.2)}`} fill="none" stroke="#334155" strokeWidth="1.6" strokeDasharray="3 4" />
    <polyline points={path(comparison)} fill="none" stroke="#c2410c" strokeWidth="2" strokeDasharray="6 4" />
    <polyline points={path(current)} fill="none" stroke="#1d4ed8" strokeWidth="2" />
    <text x="306" y="233" textAnchor="end" fontSize="12" fill="#475569">시간 (s)</text>
  </svg>;
}
export function ControlConceptLab() {
  const id = useId();
  const [parameters, setParameters] = useState<ControlParameters>(defaults);
  const current = useMemo(() => simulateControlModel(parameters), [parameters]);
  const comparison = useMemo(() => simulateControlModel({ ...parameters, antiWindup: !parameters.antiWindup }), [parameters]);
  const change = Math.round(CONTROL_MODEL.switchTime / parameters.sampleTime);
  const inspected = current.points.filter((_, index) => index < parameters.delaySamples + 3 || (index >= change - 2 && index <= change + parameters.delaySamples + 3));
  const update = (key: keyof ControlParameters, value: number | boolean) => setParameters(previous => ({ ...previous, [key]: value }));
  return <section id="control-concept-lab" aria-labelledby={`${id}-title`} className="mt-7 min-w-0 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-6">
    <h2 id={`${id}-title`} className="text-xl font-bold">선택 보충 · 브라우저 제어 개념 모형</h2>
    <p className="mt-3 text-sm leading-7 text-slate-700">정규화한 1차 plant의 12초 응답을 계산합니다. 목표는 0~4 s에 1.5, 이후 0.2입니다. 입력 한계 ±1 때문에 처음 목표는 도달할 수 없으며, 목표가 낮아진 뒤 적분 누적과 회복을 비교합니다. 화면의 시간은 계산 모형의 시간입니다.</p>
    <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-3">{([{ key: "kp", label: "비례 Kp (무차원)", max: 5, step: 0.1 }, { key: "ki", label: "적분 Ki (1/s)", max: 4, step: 0.1 }, { key: "kd", label: "미분 Kd (s)", max: 1, step: 0.05 }] as const).map(control => <label key={control.key} htmlFor={`${id}-${control.key}`} className="min-w-0 rounded-xl border bg-white p-3"><span className="flex flex-wrap justify-between gap-2 text-xs font-semibold"><span>{control.label}</span><output>{parameters[control.key].toFixed(2)}</output></span><input id={`${id}-${control.key}`} type="range" className="mt-3 w-full accent-blue-700" min={0} max={control.max} step={control.step} value={parameters[control.key]} onChange={event => update(control.key, Number(event.target.value))} /></label>)}</div>
    <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2"><label htmlFor={`${id}-sample`} className="min-w-0 rounded-xl border bg-white p-3 text-xs font-semibold">샘플 간격 Ts (s)<select id={`${id}-sample`} className="mt-2 block w-full rounded border bg-white p-2 text-sm" value={parameters.sampleTime} onChange={event => update("sampleTime", Number(event.target.value))}>{CONTROL_SAMPLE_TIMES.map(time => <option key={time} value={time}>{time.toFixed(2)} s</option>)}</select></label><label htmlFor={`${id}-delay`} className="min-w-0 rounded-xl border bg-white p-3 text-xs font-semibold"><span className="flex flex-wrap justify-between gap-2"><span>명령 지연 d</span><output>{parameters.delaySamples}샘플 · {(parameters.delaySamples * parameters.sampleTime).toFixed(2)} s</output></span><input id={`${id}-delay`} type="range" className="mt-4 w-full accent-blue-700" min={0} max={8} step={1} value={parameters.delaySamples} onChange={event => update("delaySamples", Number(event.target.value))} /></label></div>
    <label className="mt-4 flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={parameters.antiWindup} onChange={event => update("antiWindup", event.target.checked)} className="mt-1" /><span>현재 설정에 조건부 적분 anti-windup 적용</span></label>
    <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setParameters(defaults)}>보충 모형 설정 초기화</Button>
    <div className="mt-5 min-w-0 rounded-xl border bg-white p-2"><p className="px-2 pt-2 text-xs leading-6 text-slate-700">출력·목표는 정규화한 무차원 값입니다. 선은 샘플 시점의 값을 직선으로 이은 표시입니다.<br /><span className="font-semibold text-blue-800">실선: 현재 {parameters.antiWindup ? "적분 제한 적용" : "적분 제한 미적용"}</span> · <span className="text-orange-800">파선: 반대 설정</span> · 점선: 목표</p><ResponseChart current={current} comparison={comparison} /></div>
    <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2"><Result result={current} label={`현재 · 조건부 적분 ${parameters.antiWindup ? "적용" : "미적용"}`} /><Result result={comparison} label={`비교 · 조건부 적분 ${parameters.antiWindup ? "미적용" : "적용"}`} /></div>
    <p className="mt-3 text-xs leading-6 text-slate-600">포화 시간·구간은 지연 전 요청 명령 v의 |v| &gt; 1인 구간입니다. ±0.05 첫 진입은 정착 시간·지속 안정 보장이 아닙니다. 같은 모형의 조건 비교이며 anti-windup이 모든 성능·안전에서 항상 우월하다는 뜻은 아닙니다.</p>
    <details className="mt-5 rounded-xl border bg-white p-4 text-sm leading-7"><summary className="cursor-pointer font-semibold">모형식·계산 순서·검증 한계</summary><div className="mt-3 space-y-3"><p>연속 plant는 τ·dy/dt = −y + u_applied, τ=1 s입니다. y, r, u는 정규화한 무차원 값입니다. 샘플 구간 내 입력이 일정하다는 가정에서 exact ZOH를 사용합니다.</p><pre className="whitespace-pre-wrap break-words rounded bg-slate-50 p-3 text-xs leading-6">{"e[k] = r[k] − y[k]\nD[k] = −Kd · (y[k] − y[k−1]) / Ts\nI_trial = I_prev + Ki · Ts · e[k]\nv_trial = Kp · e[k] + I_trial + D[k]\nu[k] = saturation(Kp · e[k] + I[k] + D[k], −1, 1)\ny[k+1] = a · y[k] + (1−a) · u[k−d], a = exp(−Ts/τ)"}</pre><p>초기 y=0, I=0, 미분 차분=0입니다. v_trial이 상한을 넘고 e&gt;0이거나 하한을 넘고 e&lt;0이면, 조건부 적분은 이번 I 갱신을 거절합니다. 그 뒤 출력 포화·명령 지연·plant 갱신 순으로 계산합니다. 미분은 목표 오차 대신 측정값에 적용합니다.</p><p>d=0은 이번 명령을 즉시 현재 구간에 적용합니다. d&gt;0은 d개 샘플 전의 포화 후 명령을 적용하며, 시작 전 큐는 0입니다. 목표 변경 인덱스는 4/Ts입니다. 아래 기록에서 요청 명령 u와 실제 모형에 적용한 u_applied를 구별하세요.</p><p>모터·다관절 동역학, 센서 잡음·양자화, 마찰, ROS 실행기·통신의 변동 지연은 포함하지 않습니다. 실제 ROS·모터·GPU 실험이 아니며 매개변수 튜닝이나 안전 인증을 대신하지 않습니다.</p></div></details>
    <details className="mt-3 rounded-xl border bg-white p-4 text-sm leading-7"><summary className="cursor-pointer font-semibold">초기·목표 변경 전후 요청/적용 명령 기록</summary><div className="mt-3 max-w-full overflow-x-auto" tabIndex={0} role="region" aria-label="모형 샘플 기록 표, 가로로 스크롤할 수 있습니다"><table className="w-full whitespace-nowrap text-xs"><thead><tr>{["t(s)", "r", "y", "I", "v(포화 전)", "u(요청)", "u_applied"].map(title => <th key={title} className="px-2 py-1 text-right" scope="col">{title}</th>)}</tr></thead><tbody>{inspected.map(point => <tr key={point.time}><th className="px-2 py-1 text-right" scope="row">{point.time.toFixed(2)}</th>{[point.reference, point.output, point.integral, point.rawCommand, point.command, point.appliedCommand].map((value, index) => <td key={index} className="px-2 py-1 text-right">{number(value)}</td>)}</tr>)}</tbody></table></div></details>
    <p className="mt-4 text-xs leading-6 text-slate-600">선택 보충 모형은 기존 실습·세 문항을 대신하지 않습니다. 설정과 관찰 결과는 필요한 경우 답안에 직접 적으세요. 이 조작은 답안·진도·학습 완료를 자동 저장하거나 변경하지 않습니다.</p>
  </section>;
}
