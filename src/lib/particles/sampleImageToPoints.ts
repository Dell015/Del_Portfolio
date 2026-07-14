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
        // Long horizontal vortex/swirl shape across the screen
        // Particles arranged along elliptical spiral arms
        const arm = i % 3; // 3 spiral arms
        const t = i / count; // 0→1 normalized position along arm
        const armOffset = (arm / 3) * Math.PI * 2;

        // Spiral: radius grows with t, angle winds several times
        const angle = t * Math.PI * 6 + armOffset + (Math.random() - 0.5) * 0.4;
        const radius = 0.1 + t * 1.8 + (Math.random() - 0.5) * 0.15;

        // Stretch horizontally (wide vortex across screen)
        x = Math.cos(angle) * radius * 1.8;
        y = Math.sin(angle) * radius * 0.7;
        z = (Math.random() - 0.5) * 0.2 + Math.sin(angle * 2) * 0.05;
        break;
      }
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // Muted accent-ish colors for the abstract cloud
    const brightness = 0.3 + Math.random() * 0.3;
    colors[i3] = brightness * 0.95; // slight warm tint
    colors[i3 + 1] = brightness * 0.85;
    colors[i3 + 2] = brightness * 0.7;
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
