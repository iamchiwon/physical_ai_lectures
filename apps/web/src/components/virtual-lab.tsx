"use client";

import * as React from "react";
import {
  Activity,
  CircleGauge,
  FlaskConical,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type LabKind = "closed-loop" | "arm" | "sensor-sync";

const armLessons = new Set([
  "openusd-scene-model",
  "frames-and-transforms",
  "kinematic-model-and-fk",
  "dls-inverse-kinematics",
  "safe-leader-follower",
]);

const sensorLessons = new Set([
  "ros2-interface-contracts",
  "camera-geometry",
  "tf2-frame-contract",
  "multirate-alignment",
  "behavior-cloning-data",
  "dataset-and-finetuning",
  "evaluation-and-evidence",
]);

function labKindForLesson(lessonId: string): LabKind {
  if (armLessons.has(lessonId)) return "arm";
  if (sensorLessons.has(lessonId)) return "sensor-sync";
  return "closed-loop";
}

export function VirtualLab({ lessonId }: { lessonId: string }) {
  const kind = labKindForLesson(lessonId);

  return (
    <section id="virtual-lab" className="mt-12 scroll-mt-24" aria-labelledby="virtual-lab-title">
      <div className="mb-5">
        <p className="text-sm font-semibold text-blue-700">장비 없이 먼저 해보기</p>
        <h2 id="virtual-lab-title" className="mt-1 flex items-center gap-2 text-2xl font-bold">
          <FlaskConical className="size-6 text-blue-600" /> 가상실습
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          실제 장비의 정밀한 동작을 재현하는 대신, 제어값을 바꾸고 결과를 관찰하는 실습 흐름을 안전하게 연습합니다.
        </p>
      </div>
      {kind === "closed-loop" ? <ClosedLoopLab /> : null}
      {kind === "arm" ? <ArmKinematicsLab /> : null}
      {kind === "sensor-sync" ? <SensorSyncLab /> : null}
    </section>
  );
}

function LabShell({
  title,
  description,
  task,
  children,
}: {
  title: string;
  description: string;
  task: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
      <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Browser simulation</p>
            <h3 className="mt-2 text-xl font-bold text-slate-950">{title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800">
            <ShieldCheck className="size-4" /> 개념 모형
          </span>
        </div>
        <div className="mt-4 rounded-xl border border-blue-100 bg-white/80 p-3 text-sm leading-6 text-blue-950">
          <strong>실습 과제:</strong> {task}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
      <div className="border-t border-amber-100 bg-amber-50 px-5 py-3 text-xs leading-5 text-amber-900 sm:px-6">
        단순화 안내: 지연, 마찰, 백래시, 센서 비선형성 등 실제 장비의 모든 특성을 재현하지 않습니다. 실물 적용 전에는 저속·제한된 작업공간·비상 정지 조건에서 다시 검증하세요.
      </div>
    </div>
  );
}

function ClosedLoopLab() {
  const [running, setRunning] = React.useState(false);
  const [position, setPosition] = React.useState(12);
  const [goal, setGoal] = React.useState(78);
  const [gain, setGain] = React.useState(1.2);
  const [noise, setNoise] = React.useState(0.8);
  const [, setTick] = React.useState(0);
  const [logs, setLogs] = React.useState<string[]>(["대기: 목표와 게인을 정한 뒤 실행하세요."]);

  React.useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setTick((currentTick) => {
        const nextTick = currentTick + 1;
        setPosition((currentPosition) => {
          const error = goal - currentPosition;
          const command = Math.max(-8, Math.min(8, error * gain * 0.08));
          const disturbance = Math.sin(nextTick * 0.8) * noise * 0.35;
          const next = Math.max(0, Math.min(100, currentPosition + command + disturbance));
          if (nextTick % 5 === 0) {
            const entry = `t=${(nextTick * 0.12).toFixed(1)}s · 오차 ${Math.abs(goal - next).toFixed(1)} · 입력 ${command.toFixed(2)}`;
            setLogs((current) => [entry, ...current].slice(0, 5));
          }
          return next;
        });
        return nextTick;
      });
    }, 120);
    return () => window.clearInterval(timer);
  }, [gain, goal, noise, running]);

  const error = goal - position;
  const command = Math.max(-8, Math.min(8, error * gain * 0.08));
  const settled = Math.abs(error) < 2;

  const reset = () => {
    setRunning(false);
    setPosition(12);
    setTick(0);
    setLogs(["초기화: 로봇을 시작 위치로 되돌렸습니다."]);
  };

  return (
    <LabShell
      title="폐루프 이동 로봇"
      description="목표 위치와 제어 게인(gain)을 바꾸며 오차가 제어 입력과 다음 관측으로 이어지는 과정을 확인합니다."
      task="게인을 0.4, 1.2, 2.4로 바꾸어 목표에 도달하는 속도와 흔들림을 비교해 보세요."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]">
        <div>
          <div className="relative h-48 overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(#eff6ff_1px,transparent_1px),linear-gradient(90deg,#eff6ff_1px,transparent_1px)] bg-[size:24px_24px]" role="img" aria-label={`이동 로봇 위치 ${position.toFixed(1)}, 목표 ${goal}`}>
            <div className="absolute inset-x-5 bottom-12 h-1 rounded-full bg-slate-300" />
            <div className="absolute bottom-8 h-16 w-1 bg-emerald-500" style={{ left: `calc(${goal}% - 2px)` }}><span className="absolute -left-8 -top-7 whitespace-nowrap text-xs font-bold text-emerald-700">목표 {goal}</span></div>
            <div className="absolute bottom-10 -translate-x-1/2 transition-[left] duration-100" style={{ left: `${position}%` }}>
              <div className="grid h-10 w-14 place-items-center rounded-xl border-2 border-blue-700 bg-blue-500 text-xs font-black text-white shadow-lg">BOT</div>
              <div className="mt-0.5 flex justify-around"><span className="size-3 rounded-full bg-slate-800" /><span className="size-3 rounded-full bg-slate-800" /></div>
            </div>
            <div className="absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">관측 → 오차 계산 → 제한된 입력 → 이동</div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Metric label="관측 위치" value={position.toFixed(1)} unit="%" />
            <Metric label="목표 오차" value={Math.abs(error).toFixed(1)} unit="%" tone={settled ? "good" : "normal"} />
            <Metric label="제어 입력" value={command.toFixed(2)} unit="u" />
          </div>
        </div>

        <div className="space-y-5">
          <RangeControl label="목표 위치" value={goal} min={15} max={90} step={1} unit="%" onChange={setGoal} />
          <RangeControl label="제어 게인 Kp" value={gain} min={0.2} max={3} step={0.1} onChange={setGain} />
          <RangeControl label="센서 노이즈" value={noise} min={0} max={3} step={0.1} onChange={setNoise} />
          <LabButtons running={running} onToggle={() => setRunning((value) => !value)} onReset={reset} />
          <StatusPanel title={settled ? "목표 범위에 정착" : running ? "폐루프 제어 중" : "일시 정지"} good={settled} logs={logs} />
        </div>
      </div>
    </LabShell>
  );
}

function ArmKinematicsLab() {
  const [running, setRunning] = React.useState(false);
  const [q1, setQ1] = React.useState(25);
  const [q2, setQ2] = React.useState(40);
  const [targetX, setTargetX] = React.useState(120);
  const [targetY, setTargetY] = React.useState(55);
  const [logs, setLogs] = React.useState<string[]>(["대기: 목표점을 정하고 추종을 실행하세요."]);
  const l1 = 78;
  const l2 = 64;

  const solveIk = React.useCallback(() => {
    const r2 = targetX ** 2 + targetY ** 2;
    const c2 = Math.max(-1, Math.min(1, (r2 - l1 ** 2 - l2 ** 2) / (2 * l1 * l2)));
    const nextQ2 = Math.acos(c2);
    const nextQ1 = Math.atan2(targetY, targetX) - Math.atan2(l2 * Math.sin(nextQ2), l1 + l2 * Math.cos(nextQ2));
    return [nextQ1 * 180 / Math.PI, nextQ2 * 180 / Math.PI] as const;
  }, [targetX, targetY]);

  React.useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const [desiredQ1, desiredQ2] = solveIk();
      setQ1((value) => value + (desiredQ1 - value) * 0.16);
      setQ2((value) => value + (desiredQ2 - value) * 0.16);
    }, 100);
    return () => window.clearInterval(timer);
  }, [running, solveIk]);

  const a1 = q1 * Math.PI / 180;
  const a2 = (q1 + q2) * Math.PI / 180;
  const jointX = l1 * Math.cos(a1);
  const jointY = l1 * Math.sin(a1);
  const endX = jointX + l2 * Math.cos(a2);
  const endY = jointY + l2 * Math.sin(a2);
  const error = Math.hypot(targetX - endX, targetY - endY);
  const reachable = Math.hypot(targetX, targetY) <= l1 + l2;

  const reset = () => {
    setRunning(false);
    setQ1(25);
    setQ2(40);
    setTargetX(120);
    setTargetY(55);
    setLogs(["초기화: 관절과 목표를 기본 자세로 되돌렸습니다."]);
  };

  const toggleTracking = () => {
    if (!running) {
      setLogs((current) => [`추종 시작: 목표 (${targetX}, ${targetY})mm`, ...current].slice(0, 5));
    }
    setRunning((value) => !value);
  };

  return (
    <LabShell
      title="2링크 로봇팔 기구학"
      description="관절각을 직접 바꾸어 순기구학을 관찰하거나, 목표점을 정해 단순 역기구학 추종을 실행합니다."
      task="관절각을 바꿔 말단 위치를 예측한 뒤, 목표점을 이동하고 역기구학 추종 결과와 비교하세요."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]">
        <div>
          <div className="grid min-h-72 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <svg viewBox="-165 -155 330 310" className="h-full min-h-72 w-full" role="img" aria-label={`두 관절 로봇팔, 말단 오차 ${error.toFixed(1)}`}>
              <defs><pattern id="lab-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#dbeafe" strokeWidth="1" /></pattern></defs>
              <rect x="-165" y="-155" width="330" height="310" fill="url(#lab-grid)" />
              <circle cx={targetX} cy={-targetY} r="8" fill="#10b981" opacity=".25" />
              <circle cx={targetX} cy={-targetY} r="3" fill="#059669" />
              <line x1="0" y1="0" x2={jointX} y2={-jointY} stroke="#2563eb" strokeWidth="12" strokeLinecap="round" />
              <line x1={jointX} y1={-jointY} x2={endX} y2={-endY} stroke="#0ea5e9" strokeWidth="10" strokeLinecap="round" />
              <circle cx="0" cy="0" r="11" fill="#1e3a8a" />
              <circle cx={jointX} cy={-jointY} r="9" fill="#1d4ed8" />
              <circle cx={endX} cy={-endY} r="8" fill="#f97316" />
              <text x="-155" y="-135" fill="#475569" fontSize="11">초록: 목표 · 주황: 말단</text>
            </svg>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Metric label="말단 X" value={endX.toFixed(1)} unit="mm" />
            <Metric label="말단 Y" value={endY.toFixed(1)} unit="mm" />
            <Metric label="위치 오차" value={error.toFixed(1)} unit="mm" tone={error < 3 ? "good" : "normal"} />
          </div>
        </div>
        <div className="space-y-4">
          <RangeControl label="관절 q₁" value={q1} min={-80} max={120} step={1} unit="°" onChange={setQ1} />
          <RangeControl label="관절 q₂" value={q2} min={-130} max={145} step={1} unit="°" onChange={setQ2} />
          <div className="grid grid-cols-2 gap-3">
            <RangeControl label="목표 X" value={targetX} min={15} max={140} step={1} unit="mm" onChange={setTargetX} />
            <RangeControl label="목표 Y" value={targetY} min={-100} max={130} step={1} unit="mm" onChange={setTargetY} />
          </div>
          <LabButtons running={running} onToggle={toggleTracking} onReset={reset} disabled={!reachable} />
          <StatusPanel title={!reachable ? "도달할 수 없는 목표" : error < 3 ? "목표점 도달" : running ? "역기구학 추종 중" : "수동 관절 조작"} good={reachable && error < 3} logs={logs} />
        </div>
      </div>
    </LabShell>
  );
}

function SensorSyncLab() {
  const [running, setRunning] = React.useState(false);
  const [cameraHz, setCameraHz] = React.useState(15);
  const [jointHz, setJointHz] = React.useState(50);
  const [offset, setOffset] = React.useState(42);
  const [tolerance, setTolerance] = React.useState(30);
  const [tick, setTick] = React.useState(0);
  const [logs, setLogs] = React.useState<string[]>(["대기: 허용 오차와 timestamp offset을 비교하세요."]);

  React.useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setTick((value) => {
        const next = value + 1;
        if (next % 4 === 0) {
          const jitter = Math.round(Math.sin(next * 1.7) * 6);
          const delta = Math.abs(offset + jitter);
          setLogs((current) => [`pair ${next}: Δt ${delta}ms · ${delta <= tolerance ? "채택" : "폐기"}`, ...current].slice(0, 6));
        }
        return next;
      });
    }, 180);
    return () => window.clearInterval(timer);
  }, [offset, running, tolerance]);

  const jitter = Math.round(Math.sin(tick * 1.7) * 6);
  const delta = Math.abs(offset + jitter);
  const matched = delta <= tolerance;
  const cameraPhase = (tick * cameraHz * 3) % 100;
  const jointPhase = (tick * jointHz) % 100;

  const reset = () => {
    setRunning(false);
    setTick(0);
    setCameraHz(15);
    setJointHz(50);
    setOffset(42);
    setTolerance(30);
    setLogs(["초기화: 센서 clock과 허용 오차를 기본값으로 되돌렸습니다."]);
  };

  return (
    <LabShell
      title="멀티레이트 센서 시간 정합"
      description="서로 다른 주기의 카메라와 관절 상태 메시지를 timestamp 기준으로 짝지어 데이터셋에 넣을지 판단합니다."
      task="offset을 줄이거나 허용 오차를 조절하여 채택률을 높이고, 너무 큰 허용 오차가 데이터 의미를 흐릴 수 있는 이유를 설명해 보세요."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)]">
        <div>
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
            <SignalTrack label={`Camera ${cameraHz} Hz`} phase={cameraPhase} color="bg-cyan-400" />
            <SignalTrack label={`Joint ${jointHz} Hz`} phase={jointPhase} color="bg-blue-500" />
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 pt-2">
              <div className="rounded-xl bg-slate-800 p-3 text-center"><p className="text-xs text-slate-400">image stamp</p><p className="mt-1 font-mono font-bold">{(tick * 0.18).toFixed(3)}s</p></div>
              <div className={`grid size-12 place-items-center rounded-full ${matched ? "bg-emerald-500" : "bg-rose-500"}`}><TimerReset className="size-5" /></div>
              <div className="rounded-xl bg-slate-800 p-3 text-center"><p className="text-xs text-slate-400">joint stamp</p><p className="mt-1 font-mono font-bold">{(tick * 0.18 + delta / 1000).toFixed(3)}s</p></div>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Metric label="현재 Δt" value={delta.toString()} unit="ms" tone={matched ? "good" : "bad"} />
            <Metric label="허용 오차" value={tolerance.toString()} unit="ms" />
            <Metric label="정합 판정" value={matched ? "채택" : "폐기"} tone={matched ? "good" : "bad"} />
          </div>
        </div>
        <div className="space-y-5">
          <RangeControl label="카메라 주기" value={cameraHz} min={5} max={30} step={1} unit="Hz" onChange={setCameraHz} />
          <RangeControl label="관절 상태 주기" value={jointHz} min={10} max={100} step={5} unit="Hz" onChange={setJointHz} />
          <RangeControl label="clock offset" value={offset} min={-100} max={100} step={2} unit="ms" onChange={setOffset} />
          <RangeControl label="허용 오차" value={tolerance} min={5} max={100} step={5} unit="ms" onChange={setTolerance} />
          <LabButtons running={running} onToggle={() => setRunning((value) => !value)} onReset={reset} />
          <StatusPanel title={matched ? "동기화 범위 안" : "동기화 범위 밖"} good={matched} logs={logs} />
        </div>
      </div>
    </LabShell>
  );
}

function RangeControl({ label, value, min, max, step, unit = "", onChange }: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (value: number) => void }) {
  return (
    <label className="block rounded-xl border border-slate-200 bg-slate-50 p-3">
      <span className="flex items-center justify-between gap-3 text-xs font-bold text-slate-600"><span>{label}</span><output>{Number.isInteger(step) ? value : value.toFixed(1)}{unit}</output></span>
      <input className="mt-3 h-2 w-full cursor-pointer accent-blue-600" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Metric({ label, value, unit = "", tone = "normal" }: { label: string; value: string; unit?: string; tone?: "normal" | "good" | "bad" }) {
  const color = tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-rose-700" : "text-slate-900";
  return <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-xs font-medium text-slate-500">{label}</p><p className={`mt-1 text-xl font-black tabular-nums ${color}`}>{value}<span className="ml-1 text-xs font-semibold text-slate-400">{unit}</span></p></div>;
}

function LabButtons({ running, onToggle, onReset, disabled = false }: { running: boolean; onToggle: () => void; onReset: () => void; disabled?: boolean }) {
  return (
    <div className="flex gap-2">
      <Button type="button" onClick={onToggle} disabled={disabled} className="flex-1">{running ? <Pause className="size-4" /> : <Play className="size-4" />}{running ? "일시 정지" : "실행"}</Button>
      <Button type="button" variant="outline" onClick={onReset} aria-label="가상실습 초기화"><RotateCcw className="size-4" />초기화</Button>
    </div>
  );
}

function StatusPanel({ title, good, logs }: { title: string; good: boolean; logs: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 text-slate-100" aria-live="polite">
      <p className="flex items-center gap-2 text-sm font-bold"><CircleGauge className={`size-4 ${good ? "text-emerald-400" : "text-blue-400"}`} />{title}</p>
      <ul className="mt-3 space-y-1.5 font-mono text-[11px] leading-4 text-slate-400">
        {logs.map((log, index) => <li key={`${log}-${index}`} className="flex gap-2"><span className="text-blue-400">›</span><span>{log}</span></li>)}
      </ul>
    </div>
  );
}

function SignalTrack({ label, phase, color }: { label: string; phase: number; color: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400"><span className="flex items-center gap-2"><Activity className="size-3.5" />{label}</span><span>timestamp stream</span></div>
      <div className="relative h-7 overflow-hidden rounded-lg bg-slate-800">
        {Array.from({ length: 9 }, (_, index) => <span key={index} className={`absolute top-1 h-5 w-1.5 rounded-full ${color}`} style={{ left: `${(index * 15 + phase) % 115 - 8}%` }} />)}
      </div>
    </div>
  );
}
