import React, { useState, useEffect, useMemo } from 'react';

import styles from './SceneBanner.module.scss';

// ── Colour helpers ──────────────────────────────────────────────────────────
type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

function lerpN(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

// ── Time helper ─────────────────────────────────────────────────────────────
function getTotalMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

// ── Scene keyframes by minute-of-day ────────────────────────────────────────
interface Frame {
  min: number;
  skyTop: string;
  skyMid: string;
  skyHorizon: string;
  mtFarTop: string;
  mtFarBot: string;
  mtNearTop: string;
  mtNearBot: string;
  horizonGlow: string;
  starAlpha: number;
  fogAlpha: number;
}

const FRAMES: Frame[] = [
  // 00:00 midnight
  {
    min: 0,
    skyTop: '#04030d',
    skyMid: '#090720',
    skyHorizon: '#0f0c2d',
    mtFarTop: '#060510',
    mtFarBot: '#030208',
    mtNearTop: '#030208',
    mtNearBot: '#020106',
    horizonGlow: '#0f0c2d',
    starAlpha: 1,
    fogAlpha: 0,
  },
  // 05:00 pre-dawn
  {
    min: 300,
    skyTop: '#06051a',
    skyMid: '#100b32',
    skyHorizon: '#1c1240',
    mtFarTop: '#08061a',
    mtFarBot: '#04030c',
    mtNearTop: '#04030c',
    mtNearBot: '#02010a',
    horizonGlow: '#1c1040',
    starAlpha: 0.8,
    fogAlpha: 0,
  },
  // 06:00 sunrise
  {
    min: 360,
    skyTop: '#2a1460',
    skyMid: '#7a2858',
    skyHorizon: '#e86020',
    mtFarTop: '#1e0c3a',
    mtFarBot: '#0f061e',
    mtNearTop: '#130830',
    mtNearBot: '#08041c',
    horizonGlow: '#e86020',
    starAlpha: 0.05,
    fogAlpha: 0.15,
  },
  // 07:30 golden morning
  {
    min: 450,
    skyTop: '#486090',
    skyMid: '#8090b8',
    skyHorizon: '#e0c490',
    mtFarTop: '#483070',
    mtFarBot: '#281848',
    mtNearTop: '#281848',
    mtNearBot: '#150c30',
    horizonGlow: '#e0c490',
    starAlpha: 0,
    fogAlpha: 0.05,
  },
  // 12:00 noon
  {
    min: 720,
    skyTop: '#1550b8',
    skyMid: '#3878cc',
    skyHorizon: '#60a0e0',
    mtFarTop: '#50387a',
    mtFarBot: '#301858',
    mtNearTop: '#301858',
    mtNearBot: '#18103a',
    horizonGlow: '#60a0e0',
    starAlpha: 0,
    fogAlpha: 0,
  },
  // 15:30 afternoon
  {
    min: 930,
    skyTop: '#1e60b0',
    skyMid: '#4a80c4',
    skyHorizon: '#80b0da',
    mtFarTop: '#483870',
    mtFarBot: '#2a1848',
    mtNearTop: '#2a1848',
    mtNearBot: '#140c30',
    horizonGlow: '#80b0da',
    starAlpha: 0,
    fogAlpha: 0,
  },
  // 17:30 golden hour
  {
    min: 1050,
    skyTop: '#180e50',
    skyMid: '#783870',
    skyHorizon: '#f07828',
    mtFarTop: '#28143c',
    mtFarBot: '#140a24',
    mtNearTop: '#18082e',
    mtNearBot: '#0c041e',
    horizonGlow: '#f07828',
    starAlpha: 0,
    fogAlpha: 0.1,
  },
  // 19:00 sunset
  {
    min: 1140,
    skyTop: '#0e0828',
    skyMid: '#501838',
    skyHorizon: '#cc3808',
    mtFarTop: '#180a28',
    mtFarBot: '#0a0418',
    mtNearTop: '#100618',
    mtNearBot: '#060310',
    horizonGlow: '#cc3808',
    starAlpha: 0.25,
    fogAlpha: 0.05,
  },
  // 20:30 dusk
  {
    min: 1230,
    skyTop: '#060412',
    skyMid: '#0d0a24',
    skyHorizon: '#150c38',
    mtFarTop: '#080615',
    mtFarBot: '#03020a',
    mtNearTop: '#04030a',
    mtNearBot: '#020108',
    horizonGlow: '#150c38',
    starAlpha: 0.88,
    fogAlpha: 0,
  },
  // 24:00 → same as midnight
  {
    min: 1440,
    skyTop: '#04030d',
    skyMid: '#090720',
    skyHorizon: '#0f0c2d',
    mtFarTop: '#060510',
    mtFarBot: '#030208',
    mtNearTop: '#030208',
    mtNearBot: '#020106',
    horizonGlow: '#0f0c2d',
    starAlpha: 1,
    fogAlpha: 0,
  },
];

function interpolateFrame(minutes: number): Frame {
  let lo = FRAMES[0];
  let hi = FRAMES[FRAMES.length - 1];
  for (let i = 0; i < FRAMES.length - 1; i++) {
    if (minutes >= FRAMES[i].min && minutes < FRAMES[i + 1].min) {
      lo = FRAMES[i];
      hi = FRAMES[i + 1];
      break;
    }
  }
  const t = smoothstep((minutes - lo.min) / Math.max(1, hi.min - lo.min));
  return {
    min: minutes,
    skyTop: lerpColor(lo.skyTop, hi.skyTop, t),
    skyMid: lerpColor(lo.skyMid, hi.skyMid, t),
    skyHorizon: lerpColor(lo.skyHorizon, hi.skyHorizon, t),
    mtFarTop: lerpColor(lo.mtFarTop, hi.mtFarTop, t),
    mtFarBot: lerpColor(lo.mtFarBot, hi.mtFarBot, t),
    mtNearTop: lerpColor(lo.mtNearTop, hi.mtNearTop, t),
    mtNearBot: lerpColor(lo.mtNearBot, hi.mtNearBot, t),
    horizonGlow: lerpColor(lo.horizonGlow, hi.horizonGlow, t),
    starAlpha: lerpN(lo.starAlpha, hi.starAlpha, t),
    fogAlpha: lerpN(lo.fogAlpha, hi.fogAlpha, t),
  };
}

// ── Celestial body helpers ───────────────────────────────────────────────────
// Sun arc: visible 6:00 (360 min) → 19:00 (1140 min)
const SUN_RISE = 360;
const SUN_SET = 1140;

interface SunConfig {
  x: number;
  y: number;
  opacity: number;
  color: string;
  glowColor: string;
  r: number;
}

function getSun(min: number): SunConfig {
  if (min < SUN_RISE || min > SUN_SET)
    return { x: -100, y: -100, opacity: 0, color: '#fff', glowColor: '#fff', r: 0 };
  const p = (min - SUN_RISE) / (SUN_SET - SUN_RISE); // 0→1 sunrise→sunset
  const angle = Math.PI * p; // 0 → π
  const x = 300 - 205 * Math.cos(angle); // 95 → 505
  const y = 215 - 178 * Math.sin(angle); // arc peaks at ~37
  const mid = Math.abs(p - 0.5) * 2; // 1 at edges, 0 at noon
  const color = lerpColor('#f8c040', '#ffffc0', 1 - mid * 0.7);
  const glowColor = lerpColor('#f07020', '#fff080', 1 - mid * 0.8);
  let opacity = 1;
  if (min < SUN_RISE + 60) opacity = (min - SUN_RISE) / 60;
  else if (min > SUN_SET - 60) opacity = (SUN_SET - min) / 60;
  const r = lerpN(52, 44, Math.sin(Math.PI * p)); // larger at horizon, smaller at peak
  return { x, y, opacity: Math.max(0, opacity), color, glowColor, r };
}

// Moon arc: rises 19:30 (1170 min), peaks ~01:30, sets 05:30 (330 min)
const MOON_RISE_MIN = 1170; // 7:30 PM
const MOON_DURATION = 10.5 * 60; // 630 min (10.5 hours)

interface MoonConfig {
  x: number;
  y: number;
  opacity: number;
}

function getMoon(min: number): MoonConfig {
  const inWindow = min >= MOON_RISE_MIN || min <= MOON_RISE_MIN + MOON_DURATION - 1440;
  if (!inWindow) return { x: -100, y: -100, opacity: 0 };
  const elapsed = min >= MOON_RISE_MIN ? min - MOON_RISE_MIN : 1440 - MOON_RISE_MIN + min;
  if (elapsed > MOON_DURATION) return { x: -100, y: -100, opacity: 0 };
  const p = elapsed / MOON_DURATION;
  const angle = Math.PI * p;
  const x = 300 + 205 * Math.cos(angle); // right → left (opposite of sun)
  const y = 215 - 178 * Math.sin(angle);
  let opacity = 1;
  if (elapsed < 60) opacity = elapsed / 60;
  else if (elapsed > MOON_DURATION - 60) opacity = (MOON_DURATION - elapsed) / 60;
  return { x, y, opacity: Math.max(0, Math.min(1, opacity)) };
}

// ── Star positions (fixed) ───────────────────────────────────────────────────
const STARS = [
  { x: 38, y: 14, r: 1.8 },
  { x: 88, y: 6, r: 1.2 },
  { x: 145, y: 20, r: 2.2 },
  { x: 210, y: 9, r: 1.5 },
  { x: 278, y: 17, r: 1.2 },
  { x: 332, y: 5, r: 1.8 },
  { x: 388, y: 13, r: 2 },
  { x: 442, y: 7, r: 1.2 },
  { x: 492, y: 19, r: 1.8 },
  { x: 538, y: 6, r: 1.2 },
  { x: 578, y: 16, r: 1.5 },
  { x: 62, y: 40, r: 1.2 },
  { x: 122, y: 48, r: 1.8 },
  { x: 178, y: 36, r: 1.2 },
  { x: 248, y: 52, r: 1.5 },
  { x: 305, y: 40, r: 1.2 },
  { x: 362, y: 54, r: 1.2 },
  { x: 418, y: 38, r: 1.8 },
  { x: 468, y: 46, r: 1.2 },
  { x: 522, y: 34, r: 1.5 },
  { x: 562, y: 44, r: 1.2 },
  { x: 22, y: 62, r: 1.5 },
  { x: 108, y: 70, r: 1.2 },
  { x: 188, y: 66, r: 1.8 },
  { x: 262, y: 72, r: 1.2 },
  { x: 330, y: 60, r: 1.2 },
  { x: 402, y: 68, r: 1.5 },
  { x: 458, y: 60, r: 1.2 },
  { x: 508, y: 70, r: 1.8 },
  { x: 572, y: 64, r: 1.2 },
];

// ── Hook ─────────────────────────────────────────────────────────────────────
function useSceneTime() {
  const [minutes, setMinutes] = useState<number>(getTotalMinutes);

  useEffect(() => {
    const tick = () => setMinutes(getTotalMinutes());
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return minutes;
}

// ── Component ────────────────────────────────────────────────────────────────
export const SceneBanner: React.FC = () => {
  const minutes = useSceneTime();

  const scene = useMemo(() => interpolateFrame(minutes), [minutes]);
  const sun = useMemo(() => getSun(minutes), [minutes]);
  const moon = useMemo(() => getMoon(minutes), [minutes]);

  return (
    <div className={styles.wrapper}>
      <svg
        viewBox="0 0 600 280"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className={styles.svg}
      >
        <defs>
          {/* Sky gradient */}
          <linearGradient id="sb-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={scene.skyTop} />
            <stop offset="48%" stopColor={scene.skyMid} />
            <stop offset="100%" stopColor={scene.skyHorizon} />
          </linearGradient>

          {/* Far-mountain gradient */}
          <linearGradient id="sb-mf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={scene.mtFarTop} />
            <stop offset="100%" stopColor={scene.mtFarBot} />
          </linearGradient>

          {/* Near-mountain gradient */}
          <linearGradient id="sb-mn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={scene.mtNearTop} />
            <stop offset="100%" stopColor={scene.mtNearBot} />
          </linearGradient>

          {/* Sun glow */}
          <radialGradient id="sb-sg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={sun.glowColor} stopOpacity="0.55" />
            <stop offset="100%" stopColor={sun.glowColor} stopOpacity="0" />
          </radialGradient>

          {/* Moon glow */}
          <radialGradient id="sb-mg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c8d8ff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#c8d8ff" stopOpacity="0" />
          </radialGradient>

          {/* Horizon atmospheric glow */}
          <radialGradient id="sb-hg" cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor={scene.horizonGlow} stopOpacity="0.45" />
            <stop offset="100%" stopColor={scene.horizonGlow} stopOpacity="0" />
          </radialGradient>

          {/* Morning/evening fog at mountain base */}
          <linearGradient id="sb-fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity={scene.fogAlpha.toFixed(3)} />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="600" height="280" fill="url(#sb-sky)" />

        {/* Horizon atmospheric tint */}
        <ellipse cx="300" cy="215" rx="310" ry="130" fill="url(#sb-hg)" />

        {/* Stars */}
        {scene.starAlpha > 0.01 &&
          STARS.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="white"
              opacity={scene.starAlpha * (0.65 + (i % 5) * 0.07)}
            />
          ))}

        {/* Sun glow halo */}
        {sun.opacity > 0.01 && (
          <circle cx={sun.x} cy={sun.y} r={94} fill="url(#sb-sg)" opacity={sun.opacity} />
        )}
        {/* Sun disc */}
        {sun.opacity > 0.01 && (
          <circle cx={sun.x} cy={sun.y} r={sun.r} fill={sun.color} opacity={sun.opacity} />
        )}

        {/* Moon glow halo */}
        {moon.opacity > 0.01 && (
          <circle cx={moon.x} cy={moon.y} r={62} fill="url(#sb-mg)" opacity={moon.opacity} />
        )}
        {/* Moon disc */}
        {moon.opacity > 0.01 && (
          <circle cx={moon.x} cy={moon.y} r={26} fill="#dde8ff" opacity={moon.opacity} />
        )}
        {/* Crescent shadow (offset circle to carve crescent) */}
        {moon.opacity > 0.01 && (
          <circle
            cx={moon.x + 9}
            cy={moon.y - 4}
            r={22}
            fill={scene.skyMid}
            opacity={moon.opacity * 0.88}
          />
        )}

        {/* Far mountains */}
        <path
          d="M0,202 L55,132 L115,168 L198,88 L268,140 L338,96 L408,150 L478,102 L548,140 L600,118 L600,280 L0,280Z"
          fill="url(#sb-mf)"
          opacity="0.92"
        />

        {/* Near mountains */}
        <path
          d="M0,250 L65,186 L128,218 L208,166 L288,208 L368,160 L438,202 L508,170 L568,196 L600,178 L600,280 L0,280Z"
          fill="url(#sb-mn)"
        />

        {/* Morning / evening fog band at mountain base */}
        {scene.fogAlpha > 0.01 && (
          <rect x="0" y="200" width="600" height="80" fill="url(#sb-fog)" />
        )}

        {/* Pine trees — left cluster */}
        <polygon points="12,252 18,222 24,252" fill={scene.mtNearBot} />
        <polygon points="24,258 33,222 42,258" fill={scene.mtNearBot} />
        <polygon points="4,260 12,234 20,260" fill={scene.mtNearBot} />

        {/* Pine trees — right cluster */}
        <polygon points="558,246 564,216 570,246" fill={scene.mtNearBot} />
        <polygon points="570,252 579,218 588,252" fill={scene.mtNearBot} />
        <polygon points="548,256 555,230 562,256" fill={scene.mtNearBot} />
      </svg>
    </div>
  );
};
