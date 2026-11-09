"use client";

import { useId, useState } from "react";
import { TELEMETRY_SCENARIOS, telemetryView, type TelemetryScenarioId } from "@/lib/telemetry-model";

export function TelemetryConceptLab() {
  const id = useId();
  const [scenario, setScenario] = useState<TelemetryScenarioId>("fresh");
  const { frame } = TELEMETRY_SCENARIOS[scenario];
  const view = telemetryView(frame);
  return <section id="telemetry-concept-lab" aria-labelledby={`${id}-title`} className="mt-7 min-w-0 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 [overflow-wrap:anywhere] sm:p-6">
    <h2 id={`${id}-title`} className="text-xl font-bold">선택 보충 · 읽기 전용 텔레메트리 모형</h2>
    <p className="mt-3 text-sm leading-7">고정된 합성 기록의 상황을 바꾸어 연결 신호·미션·배터리의 신선도를 따로 비교합니다. 실제 로봇이나 서버에서 수집한 데이터가 아닙니다. 명령을 전송하는 기능은 없습니다.</p>
    <label htmlFor={`${id}-scenario`} className="mt-4 block text-sm font-semibold">합성 관제 상황</label>
    <select id={`${id}-scenario`} value={scenario} className="mt-2 w-full min-w-0 rounded-lg border bg-white p-3 text-sm" onChange={event => { const value = event.target.value; if (Object.hasOwn(TELEMETRY_SCENARIOS, value)) setScenario(value as TelemetryScenarioId); }}>
      {Object.entries(TELEMETRY_SCENARIOS).map(([key, value]) => <option key={key} value={key}>{value.title}</option>)}
    </select>
    <p className="mt-3 text-xs leading-6">합성 대상 r1 / bootA · ClockA · 현재 {frame.nowMs}ms · heartbeat TTL 100ms / 상태 TTL 200ms (경계 포함)</p>
    <dl aria-live="polite" className="mt-4 grid min-w-0 gap-3 sm:grid-cols-3">
      <div className="min-w-0 rounded-xl border bg-white p-3 text-sm leading-7"><dt>연결 신호</dt><dd><output aria-label="연결 신호 판정" className="font-bold">{view.heartbeatValid ? "유효" : "만료"}</output></dd><dd>신호 나이 <output aria-label="연결 신호 나이">{view.heartbeatAgeMs}</output>ms</dd></div>
      <div className="min-w-0 rounded-xl border bg-white p-3 text-sm leading-7"><dt>현재 미션 상태</dt><dd><output aria-label="현재 미션 상태" className="font-bold">{view.mission ?? "미상"}</output></dd><dd>관측 나이 {view.missionAgeMs ?? "미제공"}ms · 마지막 제공값 {view.lastMission ?? "없음"}</dd></div>
      <div className="min-w-0 rounded-xl border bg-white p-3 text-sm leading-7"><dt>현재 배터리</dt><dd><output aria-label="현재 배터리" className="font-bold">{view.batteryPct === null ? "미상" : `${view.batteryPct}%`}</output></dd><dd>관측 나이 {view.batteryAgeMs ?? "미제공"}ms · 마지막 제공값 {view.lastBatteryPct === null ? "없음" : `${view.lastBatteryPct}% @ ${view.batteryStampMs}ms`}</dd></div>
    </dl>
    <p className="mt-4 text-sm leading-7">수신 <output aria-label="수신 이벤트 수">{view.receivedEvents}</output>건 / 고유 <output aria-label="고유 이벤트 수">{view.uniqueEvents}</output>건 / 동일 중복 <output aria-label="중복 이벤트 수">{view.duplicates}</output>건 · 최신 seq <output aria-label="최신 이벤트 순서">{view.lastSeq ?? "없음"}</output></p>
    <div role="region" aria-label="합성 이벤트 도착 순서 표, 가로 스크롤 가능" tabIndex={0} className="mt-3 max-w-full overflow-x-auto rounded-xl border bg-white p-2"><table className="w-full whitespace-nowrap text-xs"><caption className="p-2 text-left">각 이벤트는 미션 전체 값입니다. 배터리는 별도 관측입니다.</caption><thead><tr>{["도착", "seq", "발생 ms", "미션", "수신 시 처리"].map(label => <th scope="col" key={label} className="p-2 text-left">{label}</th>)}</tr></thead><tbody>{view.ledger.map((row, index) => <tr key={`${row.seq}:${index}`}><th scope="row" className="p-2 text-left">{index + 1}</th><td className="p-2">{row.seq}</td><td className="p-2">{row.stampMs}</td><td className="p-2">{row.mission}</td><td className="p-2">{row.disposition === "duplicate" ? "동일 중복 제외" : row.disposition === "late" ? "늦은 사건 보존" : "상태 갱신 이력"}</td></tr>)}</tbody></table></div>
    <p className="mt-3 text-sm leading-7">미상은 현재 근거가 부족하다는 표시입니다. 마지막 관측값·시각과 현재 상태를 구분하세요. 연결 신호가 유효해도 다른 필드가 오래될 수 있습니다.</p>
    <p className="mt-4 text-xs leading-6 text-slate-600">상황 선택은 합성 화면만 바꿉니다. 답안·진도·학습 완료를 자동 저장하거나 변경하지 않습니다.</p>
  </section>;
}
