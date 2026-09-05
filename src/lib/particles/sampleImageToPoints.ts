/**
 * Samples an image at a grid interval and returns a PointCloud.
 * Each sampled pixel becomes a particle with position (from pixel coordinates)
 * and color (from pixel RGB).
 *
 * Positions are normalized to a [-1, 1] range centered on the image.
 * Alpha < threshold pixels are skipped (background removal).
 */

export interface PointCloud {
  positions: Float32Array; // xyz per particle (stride 3)
  colors: Float32Array; // rgb per particle (stride 3)
  count: number;
  /**
   * Distance between neighbouring particles, in the same normalised units as
   * `positions`. Consumers need this to size point sprites: a point much smaller
   * than the spacing leaves visible gaps, much larger and the cloud turns to mush.
   * Since it travels with the cloud, point size stays correct across any source
   * resolution, grid interval, or subsample ratio.
   */
  gridStep?: number;
}

interface SampleOptions {
  /** Grid spacing in pixels (lower = more particles, slower) */
  gridInterval?: number;
  /** Minimum alpha value (0-255) to include a pixel */
  alphaThreshold?: number;
  /** Target particle count — if set, adjusts gridInterval to approximate this count */
  targetCount?: number;
}

/**
 * Load an image and sample it into a point cloud.
 * Runs in the browser (uses canvas for pixel access).
 */
export async function sampleImageToPoints(
  imageSrc: string,
  options: SampleOptions = {}
): Promise<PointCloud> {
  const { alphaThreshold = 20, targetCount } = options;
  let { gridInterval = 4 } = options;

  // Load image
  const img = await loadImage(imageSrc);
  const { width, height } = img;

  // If targetCount is specified, estimate gridInterval
  if (targetCount) {
    const totalPixels = width * height;
    const ratio = Math.sqrt(totalPixels / targetCount);
    gridInterval = Math.max(1, Math.round(ratio));
  }

  // Draw to canvas and extract pixel data
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  // First pass: count valid particles
  const tempPositions: number[] = [];
  const tempColors: number[] = [];

  const halfW = width / 2;
  const halfH = height / 2;
  const scale = 1 / Math.max(halfW, halfH); // normalize to ~[-1, 1]

  for (let y = 0; y < height; y += gridInterval) {
    for (let x = 0; x < width; x += gridInterval) {
      const i = (y * width + x) * 4;
      const a = pixels[i + 3];

      if (a < alphaThreshold) continue;

      // Position: centered, y-flipped, small z jitter for depth
      const px = (x - halfW) * scale;
      const py = -(y - halfH) * scale; // flip Y so image is upright
      const pz = (Math.random() - 0.5) * 0.02; // tiny z spread

      tempPositions.push(px, py, pz);

      // Color: normalized to [0, 1]
      tempColors.push(pixels[i] / 255, pixels[i + 1] / 255, pixels[i + 2] / 255);
    }
  }

  const count = tempPositions.length / 3;

  return {
    positions: new Float32Array(tempPositions),
    colors: new Float32Array(tempColors),
    count,
    // One grid step in normalised units — the on-screen spacing of neighbouring
    // particles once the cloud is scaled.
    gridStep: gridInterval * scale,
  };
}

/**
 * Generate a procedural point cloud (no image needed).
 * Useful as a placeholder for cloudB (abstract/silhouette shape).
 * Creates a circular scatter pattern.
 */
export function generateProceduralCloud(
  count: number,
  shape: "scatter" | "ring" | "grid" = "scatter"
): PointCloud {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    let x: number, y: number, z: number;

    switch (shape) {
      case "ring": {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const radius = 0.7 + (Math.random() - 0.5) * 0.3;
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        z = (Math.random() - 0.5) * 0.1;
        break;
      }
      case "grid": {
        const cols = Math.ceil(Math.sqrt(count));
        const col = i % cols;
        const row = Math.floor(i / cols);
        x = (col / cols) * 2 - 1;
        y = (row / cols) * 2 - 1;
        z = (Math.random() - 0.5) * 0.05;
        break;
      }
      case "scatter":
      default: {
        // Flowing wave ribbon across the screen
        const t = i / count;
        const layer = i % 4;

        // Horizontal span
        x = (t - 0.5) * 4.5;

        // Wave: moderate amplitude — fills vertical space without being too tall
        const wave1 = Math.sin(t * Math.PI * 2.5 + layer * 0.5) * 0.55;
        const wave2 = Math.sin(t * Math.PI * 6 + layer * 1.2) * 0.2;
        const wave3 = Math.sin(t * Math.PI * 11 + layer * 0.8) * 0.08;
        y = wave1 + wave2 + wave3;

        // Ribbon thickness
        y += (Math.random() - 0.5) * 0.15;
        x += (Math.random() - 0.5) * 0.04;

        z = (Math.random() - 0.5) * 0.08 + Math.sin(t * Math.PI * 4) * 0.03;
        break;
      }
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // Rich color palette: analogous warm spectrum (red → orange → rose)
    // with occasional cool accent for contrast
    const colorRand = Math.random();
    if (colorRand < 0.35) {
      // Deep red / crimson (primary)
      colors[i3] = 0.6 + Math.random() * 0.3;
      colors[i3 + 1] = 0.05 + Math.random() * 0.1;
      colors[i3 + 2] = 0.05 + Math.random() * 0.12;
    } else if (colorRand < 0.6) {
      // Warm orange / amber
      colors[i3] = 0.7 + Math.random() * 0.25;
      colors[i3 + 1] = 0.25 + Math.random() * 0.2;
      colors[i3 + 2] = 0.02 + Math.random() * 0.06;
    } else if (colorRand < 0.8) {
      // Soft rose / pink
      colors[i3] = 0.55 + Math.random() * 0.25;
      colors[i3 + 1] = 0.1 + Math.random() * 0.12;
      colors[i3 + 2] = 0.2 + Math.random() * 0.15;
    } else {
      // Cool pale highlight (adds sparkle / depth contrast)
      colors[i3] = 0.7 + Math.random() * 0.25;
      colors[i3 + 1] = 0.55 + Math.random() * 0.2;
      colors[i3 + 2] = 0.45 + Math.random() * 0.2;
    }
  }

  return { positions, colors, count };
}

/**
 * Pad or truncate a cloud to match a target count.
 * Required because cloudA and cloudB must have identical particle counts for lerp.
 */
export function normalizeCloudCount(
  cloud: PointCloud,
  targetCount: number
): PointCloud {
  if (cloud.count === targetCount) return cloud;

  const positions = new Float32Array(targetCount * 3);
  const colors = new Float32Array(targetCount * 3);

  for (let i = 0; i < targetCount; i++) {
    const srcIdx = i < cloud.count ? i : i % cloud.count;
    const i3 = i * 3;
    const s3 = srcIdx * 3;

    positions[i3] = cloud.positions[s3];
    positions[i3 + 1] = cloud.positions[s3 + 1];
    positions[i3 + 2] = cloud.positions[s3 + 2];

    colors[i3] = cloud.colors[s3];
    colors[i3 + 1] = cloud.colors[s3 + 1];
    colors[i3 + 2] = cloud.colors[s3 + 2];
  }

  return { positions, colors, count: targetCount };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${src} — ${e}`));
    img.src = src;
  });
}

// ─── Cloud transforms ─────────────────────────────────────────────────────────
//
// Used by the hand-reveal section. A sampled cloud is normalised against its
// SOURCE IMAGE frame, so where the subject sits inside that frame leaks into the
// cloud's position. The two hand crops are framed differently from each other,
// which means "put them 70px apart" is meaningless until each cloud is anchored
// to a feature rather than to its frame.

export interface CloudBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function getCloudBounds(cloud: PointCloud): CloudBounds {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < cloud.count; i++) {
    const x = cloud.positions[i * 3];
    const y = cloud.positions[i * 3 + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return { minX, maxX, minY, maxY };
}

/** In-place translation. Returns the same object for chaining. */
export function translateCloud(
  cloud: PointCloud,
  dx: number,
  dy: number,
  dz = 0,
): PointCloud {
  for (let i = 0; i < cloud.count; i++) {
    cloud.positions[i * 3] += dx;
    cloud.positions[i * 3 + 1] += dy;
    cloud.positions[i * 3 + 2] += dz;
  }
  return cloud;
}

/** In-place rotation about the Z axis (radians). Used to stand the hands upright
 *  in portrait, where they approach from top and bottom instead of diagonally. */
export function rotateCloudZ(cloud: PointCloud, radians: number): PointCloud {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  for (let i = 0; i < cloud.count; i++) {
    const x = cloud.positions[i * 3];
    const y = cloud.positions[i * 3 + 1];
    cloud.positions[i * 3] = x * cos - y * sin;
    cloud.positions[i * 3 + 1] = x * sin + y * cos;
  }
  return cloud;
}

/**
 * Translates the cloud so its *fingertip* sits at the origin.
 *
 * The tip is the extreme point along `axis` in `direction`. Rather than trusting
 * a single extreme point — which could be a stray semi-transparent pixel that
 * survived the alpha threshold — this takes the extreme 1% of points and uses
 * their median on the perpendicular axis. That keeps the anchor on the actual
 * fingertip mass instead of an outlier.
 *
 * Anchoring here is what makes the fingertip gap exact: once both tips are at
 * their own origin, placing them at ±gap/2 puts them precisely `gap` apart, no
 * matter how each crop was framed.
 */
export function alignCloudTipToOrigin(
  cloud: PointCloud,
  axis: "x" | "y",
  direction: "min" | "max",
): PointCloud {
  const primary = axis === "x" ? 0 : 1;
  const secondary = axis === "x" ? 1 : 0;

  let extreme = direction === "min" ? Infinity : -Infinity;
  for (let i = 0; i < cloud.count; i++) {
    const v = cloud.positions[i * 3 + primary];
    if (direction === "min" ? v < extreme : v > extreme) extreme = v;
  }

  // Collect the perpendicular coordinates of points nearest the extreme.
  const band = 0.04; // ~2% of the normalised [-1,1] span
  const perp: number[] = [];
  for (let i = 0; i < cloud.count; i++) {
    const v = cloud.positions[i * 3 + primary];
    if (Math.abs(v - extreme) <= band) {
      perp.push(cloud.positions[i * 3 + secondary]);
    }
  }
  perp.sort((a, b) => a - b);
  const medianPerp = perp.length > 0 ? perp[Math.floor(perp.length / 2)] : 0;

  return axis === "x"
    ? translateCloud(cloud, -extreme, -medianPerp)
    : translateCloud(cloud, -medianPerp, -extreme);
}

/**
 * Builds the dispersed "not yet formed" companion positions for a cloud.
 *
 * Each particle gets a position pushed outward from the cloud's own shape plus a
 * random offset, so the collapse into the hand reads as the shape gathering
 * itself rather than a cloud sliding into place. Deliberately derived from the
 * shape (not pure noise) so the silhouette is faintly legible even while loose.
 */
export function buildScatterPositions(
  cloud: PointCloud,
  spread = 1.9,
  jitter = 0.75,
): Float32Array {
  const out = new Float32Array(cloud.count * 3);

  for (let i = 0; i < cloud.count; i++) {
    const i3 = i * 3;

    // Random point on a sphere, radius biased toward the surface.
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = jitter * (0.35 + Math.random() * 0.65);

    out[i3] = cloud.positions[i3] * spread + r * Math.sin(phi) * Math.cos(theta);
    out[i3 + 1] =
      cloud.positions[i3 + 1] * spread + r * Math.sin(phi) * Math.sin(theta);
    out[i3 + 2] = cloud.positions[i3 + 2] * spread + r * Math.cos(phi) * 0.5;
  }

  return out;
}

/** Per-particle speed variation, matching the hero's 0.3–1.7 range. */
export function buildSpeedAttribute(count: number): Float32Array {
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    speeds[i] = 0.3 + Math.random() * 1.4;
  }
  return speeds;
}

/** Small deterministic PRNG so a given cloud always subsamples identically. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Reduces a cloud to `target` points without distorting its shape.
 *
 * Do NOT use `normalizeCloudCount` for this. It keeps the first N points, and the
 * sampler emits points in top-to-bottom scan order — so on a 30,793-point hand
 * capped at 22,000 it silently discarded the bottom 84px of a 180px-tall hand,
 * i.e. just under half the subject. That is a shape change disguised as a budget.
 *
 * A partial Fisher–Yates selection takes a spatially unbiased subset, and avoids
 * the diagonal moiré a fixed stride would produce on a pixel grid.
 */
export function subsampleCloud(
  cloud: PointCloud,
  target: number,
  seed = 0x9e3779b9,
): PointCloud {
  if (target >= cloud.count) return cloud;

  const rand = mulberry32(seed);
  const indices = new Uint32Array(cloud.count);
  for (let i = 0; i < cloud.count; i++) indices[i] = i;

  // Only the first `target` slots need to be settled.
  for (let i = 0; i < target; i++) {
    const j = i + Math.floor(rand() * (cloud.count - i));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }

  const positions = new Float32Array(target * 3);
  const colors = new Float32Array(target * 3);

  for (let i = 0; i < target; i++) {
    const src = indices[i] * 3;
    const dst = i * 3;
    positions[dst] = cloud.positions[src];
    positions[dst + 1] = cloud.positions[src + 1];
    positions[dst + 2] = cloud.positions[src + 2];
    colors[dst] = cloud.colors[src];
    colors[dst + 1] = cloud.colors[src + 1];
    colors[dst + 2] = cloud.colors[src + 2];
  }

  return {
    positions,
    colors,
    count: target,
    // Removing points spreads the survivors out: area per particle grows by
    // count/target, so spacing grows by its square root. Keeping this accurate is
    // what lets point size stay correct after subsampling.
    gridStep:
      cloud.gridStep !== undefined
        ? cloud.gridStep * Math.sqrt(cloud.count / target)
        : undefined,
  };
}

/** Structural clone — transforms here mutate in place, so callers that need the
 *  pristine sample (e.g. re-deriving a portrait layout) clone first. */
export function cloneCloud(cloud: PointCloud): PointCloud {
  return {
    positions: new Float32Array(cloud.positions),
    colors: new Float32Array(cloud.colors),
    count: cloud.count,
    gridStep: cloud.gridStep,
  };
}
