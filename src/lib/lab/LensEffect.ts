import { Effect } from "postprocessing";
import { Uniform, Vector2 } from "three";

/**
 * Cheap gravitational-lens warp. Pixels near `uCenter` sample the scene from a point
 * pulled toward the center, so stars and particles bend around the hole and a
 * magnified ring forms at its edge. One extra UV remap, no extra render target.
 */
const fragment = /* glsl */ `
  uniform vec2 uCenter;
  uniform float uStrength;
  uniform float uAspect;

  void mainUv(inout vec2 uv) {
    vec2 d = uv - uCenter;
    d.x *= uAspect;
    float r = length(d);
    vec2 dir = d / max(r, 1e-4);
    float a = uStrength / (r + 0.10);
    a *= exp(-r * 3.0);
    // Never fold past the center: the middle stays a clean black disc
    a = min(a, r * 0.3);
    uv -= vec2(dir.x / uAspect, dir.y) * a;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    outputColor = inputColor;
  }
`;

export class LensEffect extends Effect {
  constructor() {
    super("LensEffect", fragment, {
      uniforms: new Map<string, Uniform>([
        ["uCenter", new Uniform(new Vector2(0.7, 0.5))],
        ["uStrength", new Uniform(0.05)],
        ["uAspect", new Uniform(1.7)],
      ]),
    });
  }

  setCenter(x: number, y: number) {
    (this.uniforms.get("uCenter")!.value as Vector2).set(x, y);
  }

  setAspect(a: number) {
    this.uniforms.get("uAspect")!.value = a;
  }

  setStrength(s: number) {
    this.uniforms.get("uStrength")!.value = s;
  }
}
