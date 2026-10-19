import { useEffect, useRef } from 'react';
import './PointSphere.scss';

// Plain 2D canvas rather than WebGL: a few thousand dots with a perspective
// projection is cheap on the CPU, and it keeps working on machines whose
// browser can't create a WebGL context (blocklisted GPUs, virtual machines).

const AUTO_SPEED = 0.14; // rad/s around the vertical axis; positive = front moves right
const DRAG_SENSITIVITY = 0.006; // rad per dragged pixel
const INERTIA_DECAY = 2.2; // how fast a flick's spin dies down, per second
const CAMERA_DISTANCE = 3.2; // in sphere radii; smaller = stronger perspective
const DEPTH_BUCKETS = 10;

// [back, front] dot colors per theme; dots further away fade toward the
// back color and get smaller, which is what sells the depth.
const PALETTES = {
  light: [
    [168, 177, 255],
    [61, 68, 201],
  ],
  dark: [
    [74, 81, 224],
    [232, 234, 255],
  ],
};

// Uniform random points on the sphere, pushed slightly inward at random so
// the surface reads as a soft shell of dust rather than a hard wireframe.
const buildPoints = (count) => {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const z = Math.random() * 2 - 1;
    const angle = Math.random() * Math.PI * 2;
    const ring = Math.sqrt(1 - z * z);
    const radius = 0.86 + Math.random() * 0.14;
    points[i * 3] = Math.cos(angle) * ring * radius;
    points[i * 3 + 1] = z * radius;
    points[i * 3 + 2] = Math.sin(angle) * ring * radius;
  }
  return points;
};

// 3x3 rotation matrices, row-major. Rotations are applied in world space
// (left-multiplied), so dragging always spins the sphere the way the
// pointer moves, whatever its current orientation.
const multiply = (a, b) => [
  a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
  a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
  a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
  a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
  a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
  a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
  a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
  a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
  a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
];

const rotateY = (m, angle) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return multiply([c, 0, s, 0, 1, 0, -s, 0, c], m);
};

const rotateX = (m, angle) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return multiply([1, 0, 0, 0, c, -s, 0, s, c], m);
};

// Thousands of small float multiplications slowly skew the matrix; snap it
// back to a pure rotation now and then (Gram-Schmidt on the rows).
const orthonormalize = (m) => {
  const normalize = (v) => {
    const length = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / length, v[1] / length, v[2] / length];
  };
  const r0 = normalize(m.slice(0, 3));
  const r1raw = m.slice(3, 6);
  const dot = r0[0] * r1raw[0] + r0[1] * r1raw[1] + r0[2] * r1raw[2];
  const r1 = normalize([
    r1raw[0] - dot * r0[0],
    r1raw[1] - dot * r0[1],
    r1raw[2] - dot * r0[2],
  ]);
  const r2 = [
    r0[1] * r1[2] - r0[2] * r1[1],
    r0[2] * r1[0] - r0[0] * r1[2],
    r0[0] * r1[1] - r0[1] * r1[0],
  ];
  return [...r0, ...r1, ...r2];
};

const mix = (from, to, t) =>
  from.map((channel, i) => Math.round(channel + (to[i] - channel) * t));

const PointSphere = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return undefined;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const points = buildPoints(window.innerWidth < 576 ? 1100 : 2200);
    const pointCount = points.length / 3;
    const projectedX = new Float32Array(pointCount);
    const projectedY = new Float32Array(pointCount);
    const bucketOf = new Uint8Array(pointCount);

    let matrix = rotateX([1, 0, 0, 0, 1, 0, 0, 0, 1], 0.35);
    let spinX = 0;
    let spinY = 0;
    let dragging = false;
    let lastPointer = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let rafId = 0;
    let lastTime = 0;
    let visible = true;
    let dirty = true;
    let bucketStyles = [];

    const readTheme = () => {
      const palette = document.body.classList.contains('dark-theme')
        ? PALETTES.dark
        : PALETTES.light;
      bucketStyles = Array.from({ length: DEPTH_BUCKETS }, (_, bucket) => {
        const t = bucket / (DEPTH_BUCKETS - 1);
        const [r, g, b] = mix(palette[0], palette[1], t);
        const alpha = 0.18 + 0.82 * t ** 1.4;
        return {
          fill: `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`,
          size: 0.5 + 1.25 * t,
        };
      });
      dirty = true;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      dirty = true;
    };

    const draw = () => {
      const radius = Math.min(width, height) * 0.46;
      const centerX = width / 2;
      const centerY = height / 2;
      const [a, b, c, d, e, f, g, h, k] = matrix;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      for (let i = 0; i < pointCount; i += 1) {
        const x = points[i * 3];
        const y = points[i * 3 + 1];
        const z = points[i * 3 + 2];
        const rx = a * x + b * y + c * z;
        const ry = d * x + e * y + f * z;
        const rz = g * x + h * y + k * z;
        const scale = CAMERA_DISTANCE / (CAMERA_DISTANCE - rz);
        projectedX[i] = centerX + rx * scale * radius;
        projectedY[i] = centerY - ry * scale * radius;
        const depth = Math.min(Math.max((rz + 1) / 2, 0), 1);
        bucketOf[i] = Math.min(
          DEPTH_BUCKETS - 1,
          Math.floor(depth * DEPTH_BUCKETS),
        );
      }

      // One path per depth bucket, back to front, instead of a fill per dot.
      for (let bucket = 0; bucket < DEPTH_BUCKETS; bucket += 1) {
        const { fill, size } = bucketStyles[bucket];
        context.fillStyle = fill;
        context.beginPath();
        for (let i = 0; i < pointCount; i += 1) {
          if (bucketOf[i] !== bucket) continue;
          context.moveTo(projectedX[i] + size, projectedY[i]);
          context.arc(projectedX[i], projectedY[i], size, 0, Math.PI * 2);
        }
        context.fill();
      }
      dirty = false;
    };

    const tick = (time) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;

      if (!dragging) {
        const yaw = (reduceMotion ? 0 : AUTO_SPEED) + spinY;
        if (yaw !== 0) matrix = rotateY(matrix, yaw * dt);
        if (spinX !== 0) matrix = rotateX(matrix, spinX * dt);
        const decay = Math.exp(-INERTIA_DECAY * dt);
        spinX = Math.abs(spinX * decay) < 0.001 ? 0 : spinX * decay;
        spinY = Math.abs(spinY * decay) < 0.001 ? 0 : spinY * decay;
        if (yaw !== 0 || spinX !== 0) dirty = true;
      }

      frame += 1;
      if (frame % 600 === 0) matrix = orthonormalize(matrix);
      if (dirty) draw();
      rafId = visible ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (rafId) return;
      lastTime = 0;
      rafId = requestAnimationFrame(tick);
    };

    const onPointerDown = (event) => {
      dragging = true;
      spinX = 0;
      spinY = 0;
      lastPointer = {
        x: event.clientX,
        y: event.clientY,
        time: event.timeStamp,
      };
      canvas.setPointerCapture?.(event.pointerId);
      canvas.classList.add('is-dragging');
    };

    const onPointerMove = (event) => {
      if (!dragging || !lastPointer) return;
      const dx = event.clientX - lastPointer.x;
      const dy = event.clientY - lastPointer.y;
      const elapsed = Math.max(
        (event.timeStamp - lastPointer.time) / 1000,
        0.008,
      );
      matrix = rotateX(
        rotateY(matrix, dx * DRAG_SENSITIVITY),
        dy * DRAG_SENSITIVITY,
      );
      // Remembered as an angular velocity so letting go mid-drag keeps the
      // sphere spinning that way for a moment (a flick) before it settles
      // back into the slow automatic turn.
      spinY = (dx * DRAG_SENSITIVITY) / elapsed;
      spinX = (dy * DRAG_SENSITIVITY) / elapsed;
      lastPointer = {
        x: event.clientX,
        y: event.clientY,
        time: event.timeStamp,
      };
      dirty = true;
      start();
    };

    const onPointerUp = (event) => {
      if (!dragging) return;
      dragging = false;
      // A pause before letting go means the pointer was holding still.
      if (event.timeStamp - (lastPointer?.time ?? 0) > 80) {
        spinX = 0;
        spinY = 0;
      }
      lastPointer = null;
      canvas.classList.remove('is-dragging');
    };

    readTheme();
    resize();
    draw();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const themeObserver = new MutationObserver(readTheme);
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    // Off-screen, the loop stops entirely instead of redrawing unseen dots.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    visibilityObserver.observe(canvas);

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    start();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  return (
    <div className="point-sphere">
      <canvas
        ref={canvasRef}
        className="point-sphere__canvas"
        role="img"
        aria-label="A sphere of points, slowly turning. Drag to spin it."
      />
    </div>
  );
};

export default PointSphere;
