"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./LiquidEther.css";

export interface LiquidEtherProps {
  mouseForce?: number;
  cursorSize?: number;
  isViscous?: boolean;
  viscous?: number;
  iterationsViscous?: number;
  iterationsPoisson?: number;
  dt?: number;
  BFECC?: boolean;
  resolution?: number;
  isBounce?: boolean;
  colors?: string[];
  style?: React.CSSProperties;
  className?: string;
  autoDemo?: boolean;
  autoSpeed?: number;
  autoIntensity?: number;
  takeoverDuration?: number;
  autoResumeDelay?: number;
  autoRampDuration?: number;
}

// Shader sources
const FACE_VERT = `attribute vec3 position;uniform vec2 px;uniform vec2 boundarySpace;varying vec2 uv;precision highp float;void main(){vec3 pos=position;vec2 scale=1.0-boundarySpace*2.0;pos.xy=pos.xy*scale;uv=vec2(0.5)+(pos.xy)*0.5;gl_Position=vec4(pos,1.0);}`;
const LINE_VERT = `attribute vec3 position;uniform vec2 px;precision highp float;varying vec2 uv;void main(){vec3 pos=position;uv=0.5+pos.xy*0.5;vec2 n=sign(pos.xy);pos.xy=abs(pos.xy)-px*1.0;pos.xy*=n;gl_Position=vec4(pos,1.0);}`;
const MOUSE_VERT = `precision highp float;attribute vec3 position;attribute vec2 uv;uniform vec2 center;uniform vec2 scale;uniform vec2 px;varying vec2 vUv;void main(){vec2 pos=position.xy*scale*2.0*px+center;vUv=uv;gl_Position=vec4(pos,0.0,1.0);}`;
const ADVECTION_FRAG = `precision highp float;uniform sampler2D velocity;uniform float dt;uniform bool isBFECC;uniform vec2 fboSize;uniform vec2 px;varying vec2 uv;void main(){vec2 ratio=max(fboSize.x,fboSize.y)/fboSize;if(isBFECC==false){vec2 vel=texture2D(velocity,uv).xy;vec2 uv2=uv-vel*dt*ratio;vec2 nv=texture2D(velocity,uv2).xy;gl_FragColor=vec4(nv,0.0,0.0);}else{vec2 sn=uv;vec2 vo=texture2D(velocity,uv).xy;vec2 so=sn-vo*dt*ratio;vec2 vn1=texture2D(velocity,so).xy;vec2 sn2=so+vn1*dt*ratio;vec2 err=sn2-sn;vec2 sn3=sn-err/2.0;vec2 v2=texture2D(velocity,sn3).xy;vec2 so2=sn3-v2*dt*ratio;vec2 nv2=texture2D(velocity,so2).xy;gl_FragColor=vec4(nv2,0.0,0.0);}}`;
const COLOR_FRAG = `precision highp float;uniform sampler2D velocity;uniform sampler2D palette;uniform vec4 bgColor;varying vec2 uv;void main(){vec2 vel=texture2D(velocity,uv).xy;float lenv=clamp(length(vel),0.0,1.0);vec3 c=texture2D(palette,vec2(lenv,0.5)).rgb;vec3 outRGB=mix(bgColor.rgb,c,lenv);float outA=mix(bgColor.a,1.0,lenv);gl_FragColor=vec4(outRGB,outA);}`;
const DIVERGENCE_FRAG = `precision highp float;uniform sampler2D velocity;uniform float dt;uniform vec2 px;varying vec2 uv;void main(){float x0=texture2D(velocity,uv-vec2(px.x,0.0)).x;float x1=texture2D(velocity,uv+vec2(px.x,0.0)).x;float y0=texture2D(velocity,uv-vec2(0.0,px.y)).y;float y1=texture2D(velocity,uv+vec2(0.0,px.y)).y;float d=(x1-x0+y1-y0)/2.0;gl_FragColor=vec4(d/dt);}`;
const EXTERNAL_FORCE_FRAG = `precision highp float;uniform vec2 force;uniform vec2 center;uniform vec2 scale;uniform vec2 px;varying vec2 vUv;void main(){vec2 circle=(vUv-0.5)*2.0;float d=1.0-min(length(circle),1.0);d*=d;gl_FragColor=vec4(force*d,0.0,1.0);}`;
const POISSON_FRAG = `precision highp float;uniform sampler2D pressure;uniform sampler2D divergence;uniform vec2 px;varying vec2 uv;void main(){float p0=texture2D(pressure,uv+vec2(px.x*2.0,0.0)).r;float p1=texture2D(pressure,uv-vec2(px.x*2.0,0.0)).r;float p2=texture2D(pressure,uv+vec2(0.0,px.y*2.0)).r;float p3=texture2D(pressure,uv-vec2(0.0,px.y*2.0)).r;float div=texture2D(divergence,uv).r;float nP=(p0+p1+p2+p3)/4.0-div;gl_FragColor=vec4(nP);}`;
const PRESSURE_FRAG = `precision highp float;uniform sampler2D pressure;uniform sampler2D velocity;uniform vec2 px;uniform float dt;varying vec2 uv;void main(){float step=1.0;float p0=texture2D(pressure,uv+vec2(px.x*step,0.0)).r;float p1=texture2D(pressure,uv-vec2(px.x*step,0.0)).r;float p2=texture2D(pressure,uv+vec2(0.0,px.y*step)).r;float p3=texture2D(pressure,uv-vec2(0.0,px.y*step)).r;vec2 v=texture2D(velocity,uv).xy;vec2 gP=vec2(p0-p1,p2-p3)*0.5;v=v-gP*dt;gl_FragColor=vec4(v,0.0,1.0);}`;
const VISCOUS_FRAG = `precision highp float;uniform sampler2D velocity;uniform sampler2D velocity_new;uniform float v;uniform vec2 px;uniform float dt;varying vec2 uv;void main(){vec2 old=texture2D(velocity,uv).xy;vec2 n0=texture2D(velocity_new,uv+vec2(px.x*2.0,0.0)).xy;vec2 n1=texture2D(velocity_new,uv-vec2(px.x*2.0,0.0)).xy;vec2 n2=texture2D(velocity_new,uv+vec2(0.0,px.y*2.0)).xy;vec2 n3=texture2D(velocity_new,uv-vec2(0.0,px.y*2.0)).xy;vec2 nv=4.0*old+v*dt*(n0+n1+n2+n3);nv/=4.0*(1.0+v*dt);gl_FragColor=vec4(nv,0.0,0.0);}`;

export default function LiquidEther(props: LiquidEtherProps): React.ReactElement {
  const {
    mouseForce = 20, cursorSize = 100, isViscous = false, viscous = 30,
    iterationsViscous = 32, iterationsPoisson = 32, dt = 0.014, BFECC = true,
    resolution = 0.5, isBounce = false, colors = ["#7c0015", "#F43F5E", "#F97316"],
    style = {}, className = "", autoDemo = true, autoSpeed = 0.5,
    autoIntensity = 2.2, takeoverDuration = 0.25, autoResumeDelay = 3000,
    autoRampDuration = 0.6,
  } = props;

  const mountRef = useRef<HTMLDivElement | null>(null);
  const webglRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    container.style.position = container.style.position || "relative";
    container.style.overflow = "hidden";

    // Build palette texture
    const arr = colors.length < 2 ? [colors[0] || "#fff", colors[0] || "#fff"] : colors;
    const data = new Uint8Array(arr.length * 4);
    for (let i = 0; i < arr.length; i++) {
      const c = new THREE.Color(arr[i]);
      data[i * 4] = Math.round(c.r * 255);
      data[i * 4 + 1] = Math.round(c.g * 255);
      data[i * 4 + 2] = Math.round(c.b * 255);
      data[i * 4 + 3] = 255;
    }
    const paletteTex = new THREE.DataTexture(data, arr.length, 1, THREE.RGBAFormat);
    paletteTex.magFilter = THREE.LinearFilter;
    paletteTex.minFilter = THREE.LinearFilter;
    paletteTex.needsUpdate = true;

    const bgVec4 = new THREE.Vector4(0, 0, 0, 0);

    // Minimal fluid sim engine
    const rect = container.getBoundingClientRect();
    let W = Math.max(1, Math.floor(rect.width));
    let H = Math.max(1, Math.floor(rect.height));

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.prepend(canvas);

    const simW = Math.max(1, Math.round(resolution * W));
    const simH = Math.max(1, Math.round(resolution * H));
    const cellScale = new THREE.Vector2(1 / simW, 1 / simH);
    const fboSize = new THREE.Vector2(simW, simH);
    const boundarySpace = new THREE.Vector2();

    const fboOpts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false };
    const makeFBO = () => new THREE.WebGLRenderTarget(simW, simH, fboOpts);
    const vel0 = makeFBO(), vel1 = makeFBO(), velV0 = makeFBO(), velV1 = makeFBO();
    const divFBO = makeFBO(), p0 = makeFBO(), p1 = makeFBO();

    // Shader pass helper
    const fullscreenGeo = new THREE.PlaneGeometry(2, 2);
    const cam = new THREE.Camera();

    function pass(frag: string, uniforms: any, output: THREE.WebGLRenderTarget | null) {
      const mat = new THREE.RawShaderMaterial({ vertexShader: FACE_VERT, fragmentShader: frag, uniforms });
      const scene = new THREE.Scene();
      scene.add(new THREE.Mesh(fullscreenGeo, mat));
      renderer.setRenderTarget(output);
      renderer.render(scene, cam);
      mat.dispose();
    }

    // Mouse state
    const mouseCoords = new THREE.Vector2();
    const mouseOld = new THREE.Vector2();
    const mouseDiff = new THREE.Vector2();
    let mouseMoved = false;
    let mouseTimer: any = null;
    let isHoverInside = false;
    let lastUserInteraction = performance.now();

    // Auto driver state
    const autoCurrent = new THREE.Vector2(0, 0);
    const autoTarget = new THREE.Vector2();
    let autoActive = false;
    let autoActivationTime = 0;
    const pickTarget = () => autoTarget.set((Math.random() * 2 - 1) * 0.8, (Math.random() * 2 - 1) * 0.8);
    pickTarget();
    let lastAutoTime = performance.now();

    function onMouseMove(e: MouseEvent) {
      const r = container.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { isHoverInside = false; return; }
      isHoverInside = true;
      lastUserInteraction = performance.now();
      if (autoActive) { autoActive = false; }
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      mouseCoords.set(nx, ny);
      mouseMoved = true;
      if (mouseTimer) clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => { mouseMoved = false; }, 100);
    }
    function onMouseLeave() { isHoverInside = false; }

    window.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    // External force mesh
    const forceScene = new THREE.Scene();
    const forceMat = new THREE.RawShaderMaterial({
      vertexShader: MOUSE_VERT, fragmentShader: EXTERNAL_FORCE_FRAG,
      blending: THREE.AdditiveBlending, depthWrite: false,
      uniforms: { px: { value: cellScale }, force: { value: new THREE.Vector2() }, center: { value: new THREE.Vector2() }, scale: { value: new THREE.Vector2(cursorSize, cursorSize) } }
    });
    forceScene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), forceMat));

    // Boundary lines
    const boundaryScene = new THREE.Scene();
    const bVerts = new Float32Array([-1,-1,0,-1,1,0,-1,1,0,1,1,0,1,1,0,1,-1,0,1,-1,0,-1,-1,0]);
    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute("position", new THREE.BufferAttribute(bVerts, 3));
    const bMat = new THREE.RawShaderMaterial({ vertexShader: LINE_VERT, fragmentShader: ADVECTION_FRAG, uniforms: { boundarySpace: { value: cellScale }, px: { value: cellScale }, fboSize: { value: fboSize }, velocity: { value: vel0.texture }, dt: { value: dt }, isBFECC: { value: true } } });
    boundaryScene.add(new THREE.LineSegments(bGeo, bMat));

    // Output quad
    const outScene = new THREE.Scene();
    outScene.add(new THREE.Mesh(fullscreenGeo, new THREE.RawShaderMaterial({
      vertexShader: FACE_VERT, fragmentShader: COLOR_FRAG, transparent: true, depthWrite: false,
      uniforms: { velocity: { value: vel0.texture }, boundarySpace: { value: new THREE.Vector2() }, palette: { value: paletteTex }, bgColor: { value: bgVec4 } }
    })));

    let running = true;
    function loop() {
      if (!running) return;

      // Auto driver
      if (autoDemo) {
        const now = performance.now();
        const idle = now - lastUserInteraction;
        if (idle > autoResumeDelay && !isHoverInside) {
          if (!autoActive) { autoActive = true; autoCurrent.copy(mouseCoords); lastAutoTime = now; autoActivationTime = now; }
          let dtA = (now - lastAutoTime) / 1000;
          lastAutoTime = now;
          if (dtA > 0.2) dtA = 0.016;
          const dir = autoTarget.clone().sub(autoCurrent);
          const dist = dir.length();
          if (dist < 0.01) { pickTarget(); } else {
            dir.normalize();
            let ramp = 1;
            if (autoRampDuration > 0) { const t = Math.min(1, (now - autoActivationTime) / (autoRampDuration * 1000)); ramp = t * t * (3 - 2 * t); }
            const move = Math.min(autoSpeed * dtA * ramp, dist);
            autoCurrent.addScaledVector(dir, move);
            mouseCoords.copy(autoCurrent);
            mouseMoved = true;
          }
        } else if (autoActive) { autoActive = false; }
      }

      // Mouse diff
      mouseDiff.subVectors(mouseCoords, mouseOld);
      mouseOld.copy(mouseCoords);
      if (autoActive) mouseDiff.multiplyScalar(autoIntensity);

      const bs = isBounce ? new THREE.Vector2(0, 0) : cellScale.clone();
      boundarySpace.copy(bs);

      // Advection
      pass(ADVECTION_FRAG, { boundarySpace: { value: bs }, px: { value: cellScale }, fboSize: { value: fboSize }, velocity: { value: vel0.texture }, dt: { value: dt }, isBFECC: { value: BFECC } }, vel1);
      if (isBounce) { renderer.setRenderTarget(vel1); renderer.render(boundaryScene, cam); }

      // External force
      const fx = (mouseDiff.x / 2) * mouseForce;
      const fy = (mouseDiff.y / 2) * mouseForce;
      const csX = cursorSize * cellScale.x, csY = cursorSize * cellScale.y;
      const cx = Math.min(Math.max(mouseCoords.x, -1 + csX + cellScale.x * 2), 1 - csX - cellScale.x * 2);
      const cy = Math.min(Math.max(mouseCoords.y, -1 + csY + cellScale.y * 2), 1 - csY - cellScale.y * 2);
      forceMat.uniforms.force.value.set(fx, fy);
      forceMat.uniforms.center.value.set(cx, cy);
      forceMat.uniforms.scale.value.set(cursorSize, cursorSize);
      renderer.setRenderTarget(vel1);
      renderer.render(forceScene, cam);

      // Viscous
      let velResult = vel1;
      if (isViscous) {
        for (let i = 0; i < iterationsViscous; i++) {
          const src = i % 2 === 0 ? velV0 : velV1;
          const dst = i % 2 === 0 ? velV1 : velV0;
          pass(VISCOUS_FRAG, { boundarySpace: { value: bs }, velocity: { value: vel1.texture }, velocity_new: { value: src.texture }, v: { value: viscous }, px: { value: cellScale }, dt: { value: dt } }, dst);
        }
        velResult = iterationsViscous % 2 === 0 ? velV0 : velV1;
      }

      // Divergence
      pass(DIVERGENCE_FRAG, { boundarySpace: { value: bs }, velocity: { value: velResult.texture }, px: { value: cellScale }, dt: { value: dt } }, divFBO);

      // Poisson
      let pResult = p0;
      for (let i = 0; i < iterationsPoisson; i++) {
        const pIn = i % 2 === 0 ? p0 : p1;
        const pOut = i % 2 === 0 ? p1 : p0;
        pass(POISSON_FRAG, { boundarySpace: { value: bs }, pressure: { value: pIn.texture }, divergence: { value: divFBO.texture }, px: { value: cellScale } }, pOut);
        pResult = pOut;
      }

      // Pressure
      pass(PRESSURE_FRAG, { boundarySpace: { value: bs }, pressure: { value: pResult.texture }, velocity: { value: velResult.texture }, px: { value: cellScale }, dt: { value: dt } }, vel0);

      // Render output
      (outScene.children[0] as THREE.Mesh).material = new THREE.RawShaderMaterial({
        vertexShader: FACE_VERT, fragmentShader: COLOR_FRAG, transparent: true, depthWrite: false,
        uniforms: { velocity: { value: vel0.texture }, boundarySpace: { value: new THREE.Vector2() }, palette: { value: paletteTex }, bgColor: { value: bgVec4 } }
      });
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(outScene, cam);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    // Resize
    const ro = new ResizeObserver(() => {
      const r = container.getBoundingClientRect();
      W = Math.max(1, Math.floor(r.width));
      H = Math.max(1, Math.floor(r.height));
      renderer.setSize(W, H);
      const nW = Math.max(1, Math.round(resolution * W));
      const nH = Math.max(1, Math.round(resolution * H));
      cellScale.set(1 / nW, 1 / nH);
      fboSize.set(nW, nH);
      [vel0, vel1, velV0, velV1, divFBO, p0, p1].forEach(f => f.setSize(nW, nH));
    });
    ro.observe(container);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      ro.disconnect();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      renderer.dispose();
      renderer.forceContextLoss();
      [vel0, vel1, velV0, velV1, divFBO, p0, p1].forEach(f => f.dispose());
      paletteTex.dispose();
    };
  }, [mouseForce, cursorSize, isViscous, viscous, iterationsViscous, iterationsPoisson, dt, BFECC, resolution, isBounce, colors, autoDemo, autoSpeed, autoIntensity, takeoverDuration, autoResumeDelay, autoRampDuration]);

  return <div ref={mountRef} className={`liquid-ether-container ${className}`} style={style} />;
}
