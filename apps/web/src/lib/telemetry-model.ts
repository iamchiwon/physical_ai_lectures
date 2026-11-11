export type TelemetryMission = "RUNNING" | "ERROR";
export interface TelemetryEvent { readonly robotId: string; readonly bootId: string; readonly seq: number; readonly stampMs: number; readonly mission: TelemetryMission }
export interface TelemetryFrame {
  readonly robotId: string; readonly bootId: string; readonly clockId: string; readonly nowMs: number; readonly heartbeatMs: number;
  readonly snapshot: { readonly stampMs: number; readonly batteryPct: number } | null;
  readonly events: readonly TelemetryEvent[];
}
export const TELEMETRY_TTL = { heartbeatMs: 100, stateMs: 200 } as const;
const initialEvent: TelemetryEvent = { robotId: "r1", bootId: "bootA", seq: 10, stampMs: 900, mission: "RUNNING" };
const initialSnapshot = { stampMs: 900, batteryPct: 80 } as const;
export const TELEMETRY_SCENARIOS = {
  fresh: { title: "정상 관측", frame: { robotId: "r1", bootId: "bootA", clockId: "ClockA", nowMs: 1000, heartbeatMs: 995, snapshot: initialSnapshot, events: [initialEvent] } },
  stale: { title: "연결 신호 유효·로봇 관측 지연", frame: { robotId: "r1", bootId: "bootA", clockId: "ClockA", nowMs: 1150, heartbeatMs: 1145, snapshot: initialSnapshot, events: [initialEvent] } },
  offline: { title: "연결 신호와 로봇 관측 모두 만료", frame: { robotId: "r1", bootId: "bootA", clockId: "ClockA", nowMs: 1400, heartbeatMs: 1145, snapshot: initialSnapshot, events: [initialEvent] } },
  events: { title: "순서 역전·중복 이벤트", frame: { robotId: "r1", bootId: "bootA", clockId: "ClockA", nowMs: 1200, heartbeatMs: 1195, snapshot: initialSnapshot, events: [initialEvent,
    { robotId: "r1", bootId: "bootA", seq: 12, stampMs: 1140, mission: "ERROR" },
    { robotId: "r1", bootId: "bootA", seq: 11, stampMs: 1100, mission: "RUNNING" },
    { robotId: "r1", bootId: "bootA", seq: 12, stampMs: 1140, mission: "ERROR" },
  ] } },
} satisfies Record<string, { title: string; frame: TelemetryFrame }>;
export type TelemetryScenarioId = keyof typeof TELEMETRY_SCENARIOS;
export function telemetryView(frame: TelemetryFrame) {
  const age = (stamp: number) => {
    if (!Number.isSafeInteger(frame.nowMs) || !Number.isSafeInteger(stamp) || stamp < 0 || frame.nowMs < stamp) throw new RangeError("Invalid telemetry time");
    return frame.nowMs - stamp;
  };
  if (frame.robotId !== "r1" || frame.bootId !== "bootA") throw new Error("Telemetry frame identity mismatch");
  if (frame.clockId !== "ClockA") throw new Error("Telemetry clock mismatch");
  const heartbeatAgeMs = age(frame.heartbeatMs);
  const batteryAgeMs = frame.snapshot ? age(frame.snapshot.stampMs) : null;
  if (frame.snapshot && (!Number.isFinite(frame.snapshot.batteryPct) || frame.snapshot.batteryPct < 0 || frame.snapshot.batteryPct > 100)) throw new RangeError("Invalid battery observation");
  const unique = new Map<number, TelemetryEvent>();
  let latest: TelemetryEvent | null = null, duplicates = 0;
  const ledger = frame.events.map(event => {
    age(event.stampMs);
    if (event.robotId !== "r1" || event.bootId !== "bootA" || !Number.isSafeInteger(event.seq) || event.seq < 1 || !["RUNNING", "ERROR"].includes(event.mission)) throw new Error("Telemetry identity or event mismatch");
    const previous = unique.get(event.seq);
    if (previous) {
      if (previous.stampMs !== event.stampMs || previous.mission !== event.mission) throw new Error("Conflicting duplicate event");
      duplicates++; return { ...event, disposition: "duplicate" as const };
    }
    unique.set(event.seq, event);
    const newer = latest === null || event.seq > latest.seq;
    if (newer) latest = event;
    return { ...event, disposition: newer ? "update" as const : "late" as const };
  });
  const ordered = [...unique.values()].sort((a, b) => a.seq - b.seq);
  for (let i = 1; i < ordered.length; i++) if (ordered[i]!.stampMs < ordered[i - 1]!.stampMs) throw new Error("Telemetry source time regressed");
  // Each event carries a complete mission value; other fields keep their own observation time.
  const newest = ordered.at(-1), missionAgeMs = newest ? age(newest.stampMs) : null;
  return {
    heartbeatAgeMs, heartbeatValid: heartbeatAgeMs <= TELEMETRY_TTL.heartbeatMs,
    batteryAgeMs, batteryPct: frame.snapshot && batteryAgeMs! <= TELEMETRY_TTL.stateMs ? frame.snapshot.batteryPct : null,
    lastBatteryPct: frame.snapshot?.batteryPct ?? null, batteryStampMs: frame.snapshot?.stampMs ?? null,
    missionAgeMs, mission: newest && missionAgeMs! <= TELEMETRY_TTL.stateMs ? newest.mission : null,
    lastMission: newest?.mission ?? null, lastSeq: newest?.seq ?? null,
    receivedEvents: frame.events.length, uniqueEvents: unique.size, duplicates, ledger,
  };
}
