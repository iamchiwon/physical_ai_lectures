export type WheelMode = "differential" | "mecanum";
export interface BodyVelocity { vx: number; vy: number; omega: number }
export interface WheelParameters extends BodyVelocity { mode: WheelMode; radius: number; span: number; limit: number; rrOffset: number }
function bounded(value: number, min: number, max: number, name: string) {
  if (!Number.isFinite(value) || value < min || value > max) throw new RangeError(`${name} out of range`);
}
export function wheelForward(mode: WheelMode, wheels: readonly number[], radius: number, span: number): BodyVelocity {
  if (!(radius > 0) || !(span > 0) || !Number.isFinite(radius) || !Number.isFinite(span)) throw new RangeError("invalid geometry");
  if (!(["differential", "mecanum"] as string[]).includes(mode) || wheels.length !== (mode === "differential" ? 2 : 4) || !wheels.every(Number.isFinite)) throw new RangeError("invalid wheels");
  if (mode === "differential") { const [left, right] = wheels; return { vx: radius * (left! + right!) / 2, vy: 0, omega: radius * (right! - left!) / span }; }
  const [fl, fr, rl, rr] = wheels as readonly [number, number, number, number];
  return { vx: radius * (fl + fr + rl + rr) / 4, vy: radius * (-fl + fr + rl - rr) / 4, omega: radius * (-fl + fr - rl + rr) / (4 * span) };
}
export function wheelInverse(mode: WheelMode, body: BodyVelocity, radius: number, span: number): number[] {
  if ((mode !== "differential" && mode !== "mecanum") || ![body.vx, body.vy, body.omega, radius, span].every(Number.isFinite) || radius <= 0 || span <= 0) throw new RangeError("invalid inverse input");
  if (mode === "differential") {
    if (body.vy !== 0) throw new RangeError("differential vy must be zero");
    return [(body.vx - span * body.omega / 2) / radius, (body.vx + span * body.omega / 2) / radius];
  }
  return [(body.vx - body.vy - span * body.omega) / radius, (body.vx + body.vy + span * body.omega) / radius, (body.vx + body.vy - span * body.omega) / radius, (body.vx - body.vy + span * body.omega) / radius];
}
export function calculateWheelModel(p: WheelParameters) {
  if (p.mode !== "differential" && p.mode !== "mecanum") throw new RangeError("invalid mode");
  bounded(p.radius, 0.02, 0.2, "radius"); bounded(p.span, 0.1, 1, "span"); bounded(p.limit, 0.5, 20, "limit");
  bounded(p.vx, -1, 1, "vx"); bounded(p.vy, -1, 1, "vy"); bounded(p.omega, -3, 3, "omega"); bounded(p.rrOffset, -3, 3, "rrOffset");
  const desired = { vx: p.vx, vy: p.vy, omega: p.omega };
  const requested = wheelInverse(p.mode, desired, p.radius, p.span);
  const peak = Math.max(...requested.map(Math.abs));
  const scale = peak === 0 ? 1 : Math.min(1, p.limit / peak);
  const limited = requested.map(value => value * scale);
  const achieved = wheelForward(p.mode, limited, p.radius, p.span);
  const recorded = limited.map((value, index) => value + (p.mode === "mecanum" && index === 3 ? p.rrOffset : 0));
  const estimate = wheelForward(p.mode, recorded, p.radius, p.span);
  const reconstructed = wheelInverse(p.mode, estimate, p.radius, p.span);
  const residual = recorded.map((value, index) => value - reconstructed[index]!);
  const residualNorm = Math.hypot(...residual);
  const consistency = p.mode === "mecanum" ? recorded[0]! + recorded[1]! - recorded[2]! - recorded[3]! : null;
  return { desired, requested, scale, limited, achieved, recorded, estimate, reconstructed, residual, residualNorm, consistency };
}
