export interface ProjectionParameters { fx: number; fy: number; cx: number; cy: number; x: number; y: number; z: number; vx: number; deltaTime: number }
export const PROJECTION_FRAME = { width: 640, height: 480 } as const;
export function calculateProjection(p: ProjectionParameters) {
  const bounds: Record<keyof ProjectionParameters, readonly [number, number]> = { fx: [50, 800], fy: [50, 800], cx: [0, 640], cy: [0, 480], x: [-1, 1], y: [-1, 1], z: [0.1, 5], vx: [-1, 1], deltaTime: [-0.2, 0.2] };
  for (const key of Object.keys(bounds) as (keyof ProjectionParameters)[]) {
    const [min, max] = bounds[key];
    if (!Number.isFinite(p[key]) || p[key] < min || p[key] > max) throw new RangeError(`${key} out of range`);
  }
  const project = (x: number) => {
    const u = p.fx * x / p.z + p.cx, v = p.fy * p.y / p.z + p.cy;
    return { u, v, inside: u >= 0 && u < PROJECTION_FRAME.width && v >= 0 && v < PROJECTION_FRAME.height };
  };
  const deltaX = p.vx * p.deltaTime;
  const original = project(p.x), shifted = project(p.x + deltaX);
  return { original, shifted, deltaX, deltaU: p.fx * deltaX / p.z, range: Math.hypot(p.x, p.y, p.z), shiftedRange: Math.hypot(p.x + deltaX, p.y, p.z) };
}
