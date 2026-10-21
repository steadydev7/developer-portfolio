import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './SkillGlobe.scss';

// A turning globe carrying every skill as a chip. The dots, latitude /
// longitude lines and outline are drawn on a 2D canvas (no WebGL, so it
// works on any machine); the chips are real elements on top, so their text
// stays crisp and they can be hovered.

const AUTO_SPEED = 0.16; // rad/s; positive = the front moves right
const DRAG_SENSITIVITY = 0.006; // rad per dragged pixel
const INERTIA_DECAY = 2.4; // how fast a flick's spin dies down, per second
const REST_PITCH = 0.32; // seen slightly from above
const MAX_PITCH = 0.8;
const CAMERA_DISTANCE = 3.4; // in globe radii; smaller = stronger perspective
const DEPTH_BUCKETS = 8;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
// Chips stay between about ±53° latitude so none bunch up at the poles.
const CHIP_BAND = 0.8;
// Dots within this angle of a chip take its area's colour.
const TINT_RADIUS = Math.cos(0.34);

// One colour per area, in the order the areas appear in the data; [dark
// theme, light theme] RGB. A seventh area would reuse the first colour.
const AREA_COLORS = [
  [
    [139, 147, 255],
    [79, 87, 217],
  ],
  [
    [192, 132, 252],
    [147, 51, 234],
  ],
  [
    [56, 189, 248],
    [2, 132, 199],
  ],
  [
    [52, 211, 153],
    [5, 150, 105],
  ],
  [
    [251, 191, 36],
    [180, 83, 9],
  ],
  [
    [251, 113, 133],
    [225, 29, 72],
  ],
];

// [back, front] colours of the plain dots and the grid lines per theme.
const PALETTES = {
  dark: {
    dots: [
      [74, 81, 224],
      [220, 222, 255],
    ],
    grid: [150, 156, 255],
  },
  light: {
    dots: [
      [178, 184, 255],
      [70, 77, 205],
    ],
    grid: [79, 87, 217],
  },
};

const areaColor = (area, dark) =>
  AREA_COLORS[area % AREA_COLORS.length][dark ? 0 : 1];
const rgb = ([r, g, b], alpha = 1) => `rgba(${r}, ${g}, ${b}, ${alpha})`;
const mix = (from, to, t) => from.map((c, i) => c + (to[i] - c) * t);
// "Languages & Runtimes" -> "Languages", "AI / ML" stays.
const shortName = (area) => area.split(' & ')[0];

// Skills taken round-robin across the areas (Python, Generative AI, React,
// FastAPI…), so every part of the globe mixes areas and the first skill of
// each area — its headline — lands near the equator.
const flattenSkills = (skills) => {
  const groups = Object.entries(skills);
  const longest = Math.max(0, ...groups.map(([, items]) => items.length));
  const flat = [];
  for (let i = 0; i < longest; i += 1) {
    groups.forEach(([, items], area) => {
      if (i < items.length) flat.push({ ...items[i], area });
    });
  }
  return flat;
};

// Evenly spread points (a Fibonacci lattice) between ±band latitude,
// equator first.
const latticePoints = (count, band) =>
  Array.from({ length: count }, (_, i) => {
    const y = band * (1 - ((i + 0.5) / count) * 2);
    const ring = Math.sqrt(1 - y * y);
    const theta = i * GOLDEN_ANGLE;
    return [Math.sin(theta) * ring, y, Math.cos(theta) * ring];
  }).sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]));

// Six great circles through the poles (twelve meridians) and five parallels.
const buildGrid = () => {
  const steps = 72;
  const circle = (point) =>
    Float32Array.from(
      Array.from({ length: steps + 1 }, (_, s) =>
        point((s / steps) * Math.PI * 2),
      ).flat(),
    );
  const meridians = Array.from({ length: 6 }, (_, k) => {
    const lon = (k * Math.PI) / 6;
    return circle((a) => [
      Math.cos(a) * Math.sin(lon),
      Math.sin(a),
      Math.cos(a) * Math.cos(lon),
    ]);
  });
  const parallels = [-60, -30, 0, 30, 60].map((deg) => {
    const lat = (deg * Math.PI) / 180;
    return circle((a) => [
      Math.sin(a) * Math.cos(lat),
      Math.sin(lat),
      Math.cos(a) * Math.cos(lat),
    ]);
  });
  return [...meridians, ...parallels];
};

const SkillGlobe = ({ skills }) => {
  const chips = useMemo(() => flattenSkills(skills), [skills]);
  const areas = useMemo(
    () =>
      Object.entries(skills).map(([name, items]) => ({
        name,
        count: items.length,
      })),
    [skills],
  );
  const largestArea = useMemo(
    () =>
      areas.reduce(
        (best, area, i) => (area.count > areas[best].count ? i : best),
        0,
      ),
    [areas],
  );

  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const chipRefs = useRef([]);
  const [dark, setDark] = useState(
    () =>
      typeof document === 'undefined' ||
      !document.body.classList.contains('light-theme'),
  );
  const [hovered, setHovered] = useState(null);
  const [focusArea, setFocusArea] = useState(null);
  // The animation loop reads these without re-subscribing.
  const live = useRef({ dark, hovered, focusArea, dragging: false });
  const dirtyRef = useRef(true);

  useEffect(() => {
    live.current.dark = dark;
    live.current.hovered = hovered;
    live.current.focusArea = focusArea;
    dirtyRef.current = true;
  }, [dark, hovered, focusArea]);

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setDark(!document.body.classList.contains('light-theme')),
    );
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || chips.length === 0) return undefined;
    // jsdom (tests) has no canvas; the chips still get placed.
    let context = null;
    try {
      context = canvas.getContext('2d');
    } catch {
      context = null;
    }

    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const chipPoints = latticePoints(chips.length, CHIP_BAND);
    const dots = latticePoints(window.innerWidth < 576 ? 700 : 1300, 0.999);
    const dotArea = Int8Array.from(dots, (dot) => {
      let best = -1;
      let bestDot = TINT_RADIUS;
      chipPoints.forEach((point, i) => {
        const d = dot[0] * point[0] + dot[1] * point[1] + dot[2] * point[2];
        if (d > bestDot) {
          bestDot = d;
          best = chips[i].area;
        }
      });
      return best;
    });
    const grid = buildGrid();
    const areaCount = areas.length;
    const dotX = new Float32Array(dots.length);
    const dotY = new Float32Array(dots.length);
    // Dots are grouped by depth bucket and colour (plain + one per area) and
    // drawn back to front, one fillStyle change per group.
    const groupsPerBucket = areaCount + 1;
    const groupCount = DEPTH_BUCKETS * groupsPerBucket;
    const dotGroup = new Uint16Array(dots.length);
    const groupStart = new Uint32Array(groupCount + 1);
    const groupCursor = new Uint32Array(groupCount);
    const dotOrder = new Uint32Array(dots.length);

    // Start with the biggest area's headline skill facing the viewer.
    const lead = chipPoints[chips.findIndex((c) => c.area === largestArea)];
    let yaw = lead ? -Math.atan2(lead[0], lead[2]) : 0;
    let pitch = REST_PITCH;
    let spin = 0;
    let autoSpeed = reduceMotion ? 0 : AUTO_SPEED;
    let lastPointer = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let lastTime = 0;
    let visible = true;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      if (context) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      const radius = Math.min(width, height) * 0.4;
      stage.style.setProperty(
        '--globe-k',
        Math.min(Math.max(radius / 230, 0.74), 1.06).toFixed(3),
      );
      dirtyRef.current = true;
    };

    const draw = () => {
      const { dark: isDark, hovered: hover, focusArea: focus } = live.current;
      const radius = Math.min(width, height) * 0.4;
      const cx = width / 2;
      const cy = height / 2;
      const cy0 = Math.cos(yaw);
      const sy0 = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      // Turn around the globe's own axis (yaw), then tilt it (pitch).
      const project = (x, y, z) => {
        const rx = x * cy0 + z * sy0;
        const z1 = -x * sy0 + z * cy0;
        const ry = y * cp - z1 * sp;
        const rz = y * sp + z1 * cp;
        const scale = CAMERA_DISTANCE / (CAMERA_DISTANCE - rz);
        return [cx + rx * scale * radius, cy - ry * scale * radius, rz];
      };

      if (context) {
        const palette = isDark ? PALETTES.dark : PALETTES.light;
        // Smaller globes (phones) get finer dots.
        const dotScale = Math.min(Math.max(radius / 230, 0.6), 1);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, width, height);

        const limb =
          (radius * CAMERA_DISTANCE) / Math.sqrt(CAMERA_DISTANCE ** 2 - 1);
        const body = context.createRadialGradient(
          cx - limb * 0.3,
          cy - limb * 0.35,
          limb * 0.1,
          cx,
          cy,
          limb,
        );
        body.addColorStop(0, rgb(palette.grid, isDark ? 0.16 : 0.1));
        body.addColorStop(1, rgb(palette.grid, isDark ? 0.03 : 0.02));
        context.fillStyle = body;
        context.beginPath();
        context.arc(cx, cy, limb, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = rgb(palette.grid, isDark ? 0.32 : 0.28);
        context.lineWidth = 1;
        context.stroke();

        const back = new Path2D();
        const front = new Path2D();
        grid.forEach((line) => {
          let previous = project(line[0], line[1], line[2]);
          for (let i = 3; i < line.length; i += 3) {
            const point = project(line[i], line[i + 1], line[i + 2]);
            const path = previous[2] + point[2] >= 0 ? front : back;
            path.moveTo(previous[0], previous[1]);
            path.lineTo(point[0], point[1]);
            previous = point;
          }
        });
        context.strokeStyle = rgb(palette.grid, isDark ? 0.07 : 0.07);
        context.stroke(back);
        context.strokeStyle = rgb(palette.grid, isDark ? 0.2 : 0.2);
        context.stroke(front);

        groupStart.fill(0);
        for (let i = 0; i < dots.length; i += 1) {
          const [x, y, z] = dots[i];
          const rx = x * cy0 + z * sy0;
          const z1 = -x * sy0 + z * cy0;
          const ry = y * cp - z1 * sp;
          const rz = y * sp + z1 * cp;
          const scale = (CAMERA_DISTANCE / (CAMERA_DISTANCE - rz)) * radius;
          dotX[i] = cx + rx * scale;
          dotY[i] = cy - ry * scale;
          const bucket = Math.min(
            DEPTH_BUCKETS - 1,
            Math.floor(((rz + 1) / 2) * DEPTH_BUCKETS),
          );
          dotGroup[i] = bucket * groupsPerBucket + dotArea[i] + 1;
          groupStart[dotGroup[i] + 1] += 1;
        }
        for (let g = 0; g < groupCount; g += 1) {
          groupStart[g + 1] += groupStart[g];
          groupCursor[g] = groupStart[g];
        }
        for (let i = 0; i < dots.length; i += 1) {
          dotOrder[groupCursor[dotGroup[i]]] = i;
          groupCursor[dotGroup[i]] += 1;
        }

        for (let g = 0; g < groupCount; g += 1) {
          if (groupStart[g] === groupStart[g + 1]) continue;
          const t = Math.floor(g / groupsPerBucket) / (DEPTH_BUCKETS - 1);
          const area = (g % groupsPerBucket) - 1;
          const color =
            area < 0
              ? mix(palette.dots[0], palette.dots[1], t)
              : areaColor(area, isDark);
          let alpha = (area < 0 ? 0.14 : 0.22) + 0.78 * t ** 1.5;
          if (focus !== null && area !== focus) alpha *= 0.3;
          // Squares, not circles: at 1-2.5 px they look the same and fill
          // far faster.
          const size =
            dotScale *
            ((area < 0 ? 0.9 : 1.3) +
              (area < 0 ? 1.7 : 2.1) * t +
              (focus !== null && area === focus ? 0.9 : 0));
          const half = size / 2;
          context.fillStyle = rgb(color.map(Math.round), alpha.toFixed(3));
          for (let j = groupStart[g]; j < groupStart[g + 1]; j += 1) {
            const i = dotOrder[j];
            context.fillRect(dotX[i] - half, dotY[i] - half, size, size);
          }
        }
      }

      chipPoints.forEach(([x, y, z], i) => {
        const el = chipRefs.current[i];
        if (!el) return;
        const [px, py, rz] = project(x, y, z);
        const t = (rz + 1) / 2;
        let opacity = 0.1 + 0.9 * t ** 2;
        let scale = 0.6 + 0.45 * t;
        let layer = Math.round(t * 100);
        if (focus !== null) {
          opacity =
            chips[i].area === focus ? Math.max(opacity, 0.4) : opacity * 0.18;
        }
        if (hover === i) {
          opacity = 1;
          scale = Math.max(scale, 1.08);
          layer = 200;
        }
        el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(
          1,
        )}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.zIndex = String(layer);
        el.style.pointerEvents = t > 0.6 ? 'auto' : 'none';
      });
      dirtyRef.current = false;
    };

    const tick = (time) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      const { hovered: hover, dragging } = live.current;

      if (!dragging) {
        // Eases to a stop under a hovered chip and back up afterwards.
        const target = reduceMotion || hover !== null ? 0 : AUTO_SPEED;
        autoSpeed += (target - autoSpeed) * (1 - Math.exp(-4 * dt));
        if (Math.abs(autoSpeed) < 1e-4) autoSpeed = 0;
        const turn = (autoSpeed + spin) * dt;
        spin *= Math.exp(-INERTIA_DECAY * dt);
        if (Math.abs(spin) < 1e-3) spin = 0;
        // Settles back to the resting tilt after a vertical drag.
        const tilt = (REST_PITCH - pitch) * (1 - Math.exp(-1.6 * dt));
        if (turn !== 0 || Math.abs(tilt) > 1e-4) {
          yaw += turn;
          pitch += tilt;
          dirtyRef.current = true;
        }
      }

      if (dirtyRef.current) draw();
      rafId = visible ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (rafId) return;
      lastTime = 0;
      rafId = requestAnimationFrame(tick);
    };

    const onPointerDown = (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      live.current.dragging = true;
      spin = 0;
      lastPointer = {
        x: event.clientX,
        y: event.clientY,
        time: event.timeStamp,
      };
      stage.setPointerCapture?.(event.pointerId);
      stage.classList.add('is-dragging');
      setHovered(null);
    };

    const onPointerMove = (event) => {
      if (!live.current.dragging || !lastPointer) return;
      const dx = event.clientX - lastPointer.x;
      const dy = event.clientY - lastPointer.y;
      const elapsed = Math.max(
        (event.timeStamp - lastPointer.time) / 1000,
        0.008,
      );
      yaw += dx * DRAG_SENSITIVITY;
      pitch = Math.min(
        Math.max(pitch + dy * DRAG_SENSITIVITY, -MAX_PITCH),
        MAX_PITCH,
      );
      // Kept as a velocity, so letting go mid-drag flicks the globe on.
      spin = reduceMotion ? 0 : (dx * DRAG_SENSITIVITY) / elapsed;
      lastPointer = {
        x: event.clientX,
        y: event.clientY,
        time: event.timeStamp,
      };
      dirtyRef.current = true;
      start();
    };

    const onPointerUp = (event) => {
      if (!live.current.dragging) return;
      live.current.dragging = false;
      // A pause before letting go means the pointer was holding still.
      if (event.timeStamp - (lastPointer?.time ?? 0) > 80) spin = 0;
      lastPointer = null;
      stage.classList.remove('is-dragging');
    };

    resize();
    draw();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    // Off-screen, the loop stops instead of redrawing an unseen globe.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    visibilityObserver.observe(stage);

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerUp);
    start();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointercancel', onPointerUp);
    };
  }, [chips, areas.length, largestArea]);

  if (chips.length === 0) return null;

  const hoveredChip = hovered === null ? null : chips[hovered];
  const hint = hoveredChip
    ? `${hoveredChip.name} · ${areas[hoveredChip.area].name}`
    : focusArea !== null
      ? `${areas[focusArea].name} · ${areas[focusArea].count} skills`
      : `Drag to spin · ${chips.length} skills across ${areas.length} areas`;

  return (
    <figure className="skill-globe">
      <div
        ref={stageRef}
        className="skill-globe__stage"
        role="img"
        aria-label={`A globe of ${chips.length} skills, slowly turning: ${chips
          .map((chip) => chip.name)
          .join(', ')}. Drag to spin it.`}
      >
        <canvas ref={canvasRef} className="skill-globe__canvas" />
        {chips.map((chip, i) => (
          <span
            key={`${chip.area}-${chip.name}`}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            className={`skill-globe__chip${
              focusArea === chip.area ? ' is-focused' : ''
            }${hovered === i ? ' is-hovered' : ''}`}
            style={{ '--area': rgb(areaColor(chip.area, dark)) }}
            onPointerEnter={() => {
              if (!live.current.dragging) setHovered(i);
            }}
            onPointerLeave={() =>
              setHovered((current) => (current === i ? null : current))
            }
          >
            {chip.icon && (
              <FontAwesomeIcon icon={chip.icon} aria-hidden="true" />
            )}
            {chip.name}
          </span>
        ))}
      </div>

      <figcaption className="skill-globe__caption">
        <span className="skill-globe__hint">{hint}</span>
        <span
          className="skill-globe__areas"
          role="group"
          aria-label="Highlight skills by area"
        >
          {areas.map((area, i) => (
            <button
              key={area.name}
              type="button"
              className="skill-globe__area"
              style={{ '--area': rgb(areaColor(i, dark)) }}
              aria-pressed={focusArea === i}
              title={area.name}
              onClick={() =>
                setFocusArea((current) => (current === i ? null : i))
              }
            >
              <span className="skill-globe__swatch" aria-hidden="true" />
              {shortName(area.name)}
            </button>
          ))}
        </span>
      </figcaption>
    </figure>
  );
};

SkillGlobe.propTypes = {
  skills: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        icon: PropTypes.object,
      }),
    ),
  ).isRequired,
};

export default SkillGlobe;
