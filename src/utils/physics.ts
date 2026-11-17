export interface Spring2DState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  isDragging: boolean;
}

export interface SpringConfig {
  stiffness: number;
  damping: number;
  rotStiffness: number;
  rotDamping: number;
  maxOffset: number;
  maxVelocity: number;
}

export const DEFAULT_SPRING_CONFIG: SpringConfig = {
  stiffness: 150,
  damping: 14,
  rotStiffness: 120,
  rotDamping: 12,
  maxOffset: 3.5,
  maxVelocity: 28,
};

export function createSpring2DState(): Spring2DState {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    vRotX: 0,
    vRotY: 0,
    vRotZ: 0,
    isDragging: false,
  };
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Advances a 2D + rotational damped spring state toward its rest origin (0,0).
 * Uses semi-implicit Euler integration with sub-stepping for stability.
 */
export function stepSpring2D(
  state: Spring2DState,
  dt: number,
  config: SpringConfig = DEFAULT_SPRING_CONFIG
): Spring2DState {
  if (state.isDragging) {
    return state;
  }

  // Clamp dt to avoid huge jumps when tab is backgrounded
  const safeDt = clamp(dt, 0.001, 0.05);
  const steps = 2;
  const subDt = safeDt / steps;

  let { x, y, vx, vy, rotX, rotY, rotZ, vRotX, vRotY, vRotZ } = state;

  for (let i = 0; i < steps; i++) {
    const ax = -config.stiffness * x - config.damping * vx;
    const ay = -config.stiffness * y - config.damping * vy;

    vx = clamp(vx + ax * subDt, -config.maxVelocity, config.maxVelocity);
    vy = clamp(vy + ay * subDt, -config.maxVelocity, config.maxVelocity);

    x = clamp(x + vx * subDt, -config.maxOffset, config.maxOffset);
    y = clamp(y + vy * subDt, -config.maxOffset, config.maxOffset);

    const aRotX = -config.rotStiffness * rotX - config.rotDamping * vRotX;
    const aRotY = -config.rotStiffness * rotY - config.rotDamping * vRotY;
    const aRotZ = -config.rotStiffness * rotZ - config.rotDamping * vRotZ;

    vRotX += aRotX * subDt;
    vRotY += aRotY * subDt;
    vRotZ += aRotZ * subDt;

    rotX += vRotX * subDt;
    rotY += vRotY * subDt;
    rotZ += vRotZ * subDt;
  }

  // Snap to zero when energy is negligible
  if (
    Math.abs(x) < 0.0005 &&
    Math.abs(y) < 0.0005 &&
    Math.abs(vx) < 0.001 &&
    Math.abs(vy) < 0.001 &&
    Math.abs(rotX) < 0.0005 &&
    Math.abs(rotY) < 0.0005 &&
    Math.abs(rotZ) < 0.0005
  ) {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      vRotX: 0,
      vRotY: 0,
      vRotZ: 0,
      isDragging: false,
    };
  }

  return {
    x,
    y,
    vx,
    vy,
    rotX,
    rotY,
    rotZ,
    vRotX,
    vRotY,
    vRotZ,
    isDragging: false,
  };
}

/**
 * Updates the spring state while the user is actively dragging a 3D tile.
 */
export function applyDragDisplacement(
  state: Spring2DState,
  targetOffsetX: number,
  targetOffsetY: number,
  dt: number,
  config: SpringConfig = DEFAULT_SPRING_CONFIG
): Spring2DState {
  const safeDt = Math.max(0.004, Math.min(dt, 0.05));
  const clampedX = clamp(targetOffsetX, -config.maxOffset, config.maxOffset);
  const clampedY = clamp(targetOffsetY, -config.maxOffset, config.maxOffset);

  const vx = clamp((clampedX - state.x) / safeDt, -config.maxVelocity, config.maxVelocity);
  const vy = clamp((clampedY - state.y) / safeDt, -config.maxVelocity, config.maxVelocity);

  return {
    ...state,
    x: clampedX,
    y: clampedY,
    vx: vx * 0.65,
    vy: vy * 0.65,
    rotX: clamp(-clampedY * 0.45, -0.9, 0.9),
    rotY: clamp(clampedX * 0.55, -1.1, 1.1),
    rotZ: clamp(-clampedX * 0.18, -0.5, 0.5),
    vRotX: 0,
    vRotY: 0,
    vRotZ: 0,
    isDragging: true,
  };
}

/**
 * Releases a dragged or clicked 3D tile with momentum/impulse so it springs back lively.
 */
export function applyFlickImpulse(
  state: Spring2DState,
  impulseVx: number,
  impulseVy: number,
  spinImpulseY = 4.2,
  config: SpringConfig = DEFAULT_SPRING_CONFIG
): Spring2DState {
  return {
    ...state,
    vx: clamp(state.vx + impulseVx, -config.maxVelocity, config.maxVelocity),
    vy: clamp(state.vy + impulseVy, -config.maxVelocity, config.maxVelocity),
    vRotX: state.vRotX - impulseVy * 0.6,
    vRotY: state.vRotY + spinImpulseY + impulseVx * 0.8,
    vRotZ: state.vRotZ + (impulseVx - impulseVy) * 0.25,
    isDragging: false,
  };
}

/**
 * Formats a Date into Jakarta (Asia/Jakarta, GMT+7) time string `HH:MM:SS WIB`.
 */
export function formatJakartaTime(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return `${formatter.format(date)} GMT+7`;
  } catch {
    // Fallback manual UTC+7 calculation
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
    const jkt = new Date(utcMs + 7 * 3600000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(jkt.getHours())}:${pad(jkt.getMinutes())}:${pad(jkt.getSeconds())} GMT+7`;
  }
}
