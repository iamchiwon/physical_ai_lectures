export const CONTROL_MODEL = { tau: 1, inputLimit: 1, duration: 12, switchTime: 4, initialReference: 1.5, finalReference: 0.2, recoveryBand: 0.05 } as const;
export const CONTROL_SAMPLE_TIMES = [0.05, 0.1, 0.2, 0.4, 0.5] as const;
export interface ControlParameters { kp: number; ki: number; kd: number; sampleTime: number; delaySamples: number; antiWindup: boolean }
export interface ControlPoint { time: number; reference: number; output: number; error: number; integral: number; rawCommand: number; command: number; appliedCommand: number; saturated: boolean }
export interface ControlResult { points: ControlPoint[]; finalOutput: number; maxAbsError: number; maxRecoveryError: number; saturationTime: number; saturationIntervals: { start: number; end: number }[]; recoveryEntryTime: number | null; blockedIntegrations: number }
/** Deterministic scalar concept model. No timer, physics engine, robot IO, or learner-state writes. */
export function simulateControlModel(parameters: ControlParameters): ControlResult {
  const { kp, ki, kd, sampleTime: dt, delaySamples: delay, antiWindup } = parameters;
  if (![kp, ki, kd, dt, delay].every(Number.isFinite) || kp < 0 || kp > 5 || ki < 0 || ki > 4 || kd < 0 || kd > 1 || !CONTROL_SAMPLE_TIMES.some(value => value === dt) || !Number.isInteger(delay) || delay < 0 || delay > 8 || typeof antiWindup !== "boolean") throw Error("Control parameters outside the documented finite bounds");
  const count = Math.round(CONTROL_MODEL.duration / dt), change = Math.round(CONTROL_MODEL.switchTime / dt), a = Math.exp(-dt / CONTROL_MODEL.tau);
  const points: ControlPoint[] = [], commands: number[] = [], saturationIntervals: { start: number; end: number }[] = [];
  let output = 0, previousOutput = 0, integral = 0, maxAbsError = 0, maxRecoveryError = 0, saturationSamples = 0, blockedIntegrations = 0, recoveryEntryTime: number | null = null, interval: { start: number; end: number } | null = null;
  for (let k = 0; k < count; k++) {
    const time = k * dt, reference = k < change ? CONTROL_MODEL.initialReference : CONTROL_MODEL.finalReference, error = reference - output;
    const derivative = -kd * (output - previousOutput) / dt;
    const trialIntegral = integral + ki * dt * error, trialCommand = kp * error + trialIntegral + derivative;
    const block = antiWindup && ki > 0 && ((trialCommand > CONTROL_MODEL.inputLimit && error > 0) || (trialCommand < -CONTROL_MODEL.inputLimit && error < 0));
    if (block) blockedIntegrations++; else integral = trialIntegral;
    const rawCommand = kp * error + integral + derivative;
    const command = Math.max(-CONTROL_MODEL.inputLimit, Math.min(CONTROL_MODEL.inputLimit, rawCommand));
    commands.push(command);
    const appliedCommand = k >= delay ? commands[k - delay]! : 0, saturated = Math.abs(rawCommand) > CONTROL_MODEL.inputLimit;
    if (saturated) { saturationSamples++; if (!interval) { interval = { start: time, end: (k + 1) * dt }; saturationIntervals.push(interval); } else interval.end = (k + 1) * dt; } else interval = null;
    maxAbsError = Math.max(maxAbsError, Math.abs(error));
    if (k >= change) { maxRecoveryError = Math.max(maxRecoveryError, Math.abs(error)); if (recoveryEntryTime === null && Math.abs(error) <= CONTROL_MODEL.recoveryBand) recoveryEntryTime = time; }
    points.push({ time, reference, output, error, integral, rawCommand, command, appliedCommand, saturated });
    previousOutput = output; output = a * output + (1 - a) * appliedCommand;
  }
  const finalError = CONTROL_MODEL.finalReference - output;
  maxAbsError = Math.max(maxAbsError, Math.abs(finalError)); maxRecoveryError = Math.max(maxRecoveryError, Math.abs(finalError));
  if (recoveryEntryTime === null && Math.abs(finalError) <= CONTROL_MODEL.recoveryBand) recoveryEntryTime = count * dt;
  return { points, finalOutput: output, maxAbsError, maxRecoveryError, saturationTime: saturationSamples * dt, saturationIntervals, recoveryEntryTime, blockedIntegrations };
}
