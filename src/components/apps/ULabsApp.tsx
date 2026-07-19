import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Play, Pause, Sparkles, RefreshCcw, 
  Rotate3d, Compass, Info, Cpu, Flame, Orbit, Waves, SlidersHorizontal, Eye
} from 'lucide-react';
import { playSound, speakText } from '../../lib/sounds';

interface Visualizer {
  id: string;
  name: string;
  category: string;
  desc: string;
  icon: React.ComponentType<any>;
  init: (canvas: HTMLCanvasElement) => any;
  update: (
    state: any, 
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    frame: number,
    rx: number,
    ry: number,
    scaleMultiplier: number,
    speed: number,
    accentHue: number,
    density: number
  ) => void;
  onClick?: (state: any, x: number, y: number) => void;
}

// 3D & 4D Projection Math helpers
interface Point3D { x: number; y: number; z: number; }
interface Point4D { x: number; y: number; z: number; w: number; }

function rotate3D(p: Point3D, rx: number, ry: number, rz: number): Point3D {
  let y1 = p.y * Math.cos(rx) - p.z * Math.sin(rx);
  let z1 = p.y * Math.sin(rx) + p.z * Math.cos(rx);
  let x2 = p.x * Math.cos(ry) + z1 * Math.sin(ry);
  let z2 = -p.x * Math.sin(ry) + z1 * Math.cos(ry);
  let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
  let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
  return { x: x3, y: y3, z: z2 };
}

function rotate4D(p: Point4D, xy: number, xz: number, xw: number, yz: number, yw: number, zw: number): Point4D {
  let x = p.x, y = p.y, z = p.z, w = p.w;
  let tmp = x * Math.cos(xy) - y * Math.sin(xy);
  y = x * Math.sin(xy) + y * Math.cos(xy);
  x = tmp;
  tmp = x * Math.cos(xw) - w * Math.sin(xw);
  w = x * Math.sin(xw) + w * Math.cos(xw);
  x = tmp;
  tmp = z * Math.cos(zw) - w * Math.sin(zw);
  w = z * Math.sin(zw) + w * Math.cos(zw);
  z = tmp;
  return { x, y, z, w };
}

// 1. COSMIC WARP TUNNEL
const cosmicWarp: Visualizer = {
  id: 'tunnel',
  name: 'Cosmic Warp Tunnel',
  category: 'Astrophysics',
  desc: 'Warp through an infinite 3D starfield. Drag to steer or change orbit paths dynamically.',
  icon: Flame,
  init: (canvas) => {
    const stars: any[] = [];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: Math.random() * 2000,
        color: `hsl(${(Math.random() * 60 + 200) % 360}, 100%, ${Math.random() * 40 + 60}%)`,
        size: Math.random() * 1.5 + 0.5
      });
    }
    return { stars };
  },
  update: (state, ctx, w, h, frame, rx, ry, scaleMultiplier, speed, accentHue, density) => {
    ctx.fillStyle = 'rgba(3, 3, 8, 0.22)';
    ctx.fillRect(0, 0, w, h);
    
    const centerX = w / 2;
    const centerY = h / 2;
    const calculatedSpeed = speed * 12;
    const currentStarsCount = Math.floor(state.stars.length * density);

    for (let i = 0; i < Math.min(state.stars.length, currentStarsCount); i++) {
      const p = state.stars[i];
      p.z -= calculatedSpeed;
      if (p.z <= 0) {
        p.z = 2000;
        p.x = (Math.random() - 0.5) * 800;
        p.y = (Math.random() - 0.5) * 800;
      }

      const rotated = rotate3D({ x: p.x, y: p.y, z: p.z - 1000 }, rx * 0.1, ry * 0.1, 0);
      const projectedZ = rotated.z + 1000;
      
      if (projectedZ > 20) {
        const depthScale = (350 * scaleMultiplier) / projectedZ;
        const sx = rotated.x * depthScale + centerX;
        const sy = rotated.y * depthScale + centerY;
        
        if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
          const alpha = Math.min(1, (2000 - projectedZ) / 1000);
          ctx.fillStyle = `hsla(${(accentHue + p.z * 0.08) % 360}, 90%, 75%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, p.size * (depthScale * 0.5 + 0.5), 0, Math.PI * 2);
          ctx.fill();
          
          if (i % 25 === 0) {
            ctx.strokeStyle = `hsla(${accentHue}, 90%, 50%, ${alpha * 0.07})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(centerX, centerY, Math.abs(depthScale * 250), 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
    }
  }
};

// 2. DOUBLE-HELIX DNA STRAND
const dnaHelix: Visualizer = {
  id: 'dna',
  name: 'Double-Helix 3D DNA',
  category: 'Biophysics',
  desc: 'Interactive synthesized double-helix nucleotide chain rotating with beautiful 3D particle nodes.',
  icon: Orbit,
  init: () => ({}),
  update: (state, ctx, w, h, frame, rx, ry, scaleMultiplier, speed, accentHue, density) => {
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, w, h);
    
    const centerX = w / 2;
    const centerY = h / 2;
    const numNodes = Math.floor(32 * density);
    const verticalDist = h / 38;
    const radius = 75 * scaleMultiplier;
    
    for (let i = 0; i < numNodes; i++) {
      const theta = i * 0.4 + (frame * 0.02 * speed);
      const yOffset = (i - numNodes / 2) * verticalDist;
      
      const ptA: Point3D = {
        x: Math.sin(theta) * radius,
        y: yOffset,
        z: Math.cos(theta) * radius
      };
      const ptB: Point3D = {
        x: Math.sin(theta + Math.PI) * radius,
        y: yOffset,
        z: Math.cos(theta + Math.PI) * radius
      };

      const rotA = rotate3D(ptA, rx, ry, 0);
      const rotB = rotate3D(ptB, rx, ry, 0);

      const d3 = 300;
      const scaleA = d3 / (d3 + rotA.z);
      const scaleB = d3 / (d3 + rotB.z);
      
      const sxA = rotA.x * scaleA + centerX;
      const syA = rotA.y * scaleA + centerY;
      const sxB = rotB.x * scaleB + centerX;
      const syB = rotB.y * scaleB + centerY;

      const alpha = Math.min(1, Math.max(0.1, (rotA.z + rotB.z) / 400 + 0.5));
      ctx.strokeStyle = `hsla(${(accentHue + i * 8) % 360}, 80%, 45%, ${alpha * 0.35})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sxA, syA);
      ctx.lineTo(sxB, syB);
      ctx.stroke();

      ctx.fillStyle = `hsla(${(accentHue + i * 5) % 360}, 100%, 70%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sxA, syA, Math.max(1, 4.5 * scaleA), 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `hsla(${(accentHue + 180) % 360}, 100%, 70%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sxB, syB, Math.max(1, 4.5 * scaleB), 0, Math.PI * 2);
      ctx.fill();

      const sxMid = (sxA + sxB) / 2;
      const syMid = (syA + syB) / 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sxMid, syMid, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

// 3. HYPERDIMENSIONAL TESSERACT
const tesseract4D: Visualizer = {
  id: 'tesseract',
  name: '4D Tesseract Matrix',
  category: 'Topology Math',
  desc: 'A gorgeous rotating 4D hypercube projected into 3D and rendered onto our 2D glass canvas.',
  icon: Rotate3d,
  init: () => {
    const vertices: Point4D[] = [];
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          for (let w = -1; w <= 1; w += 2) {
            vertices.push({ x, y, z, w });
          }
        }
      }
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diff = 0;
        if (vertices[i].x !== vertices[j].x) diff++;
        if (vertices[i].y !== vertices[j].y) diff++;
        if (vertices[i].z !== vertices[j].z) diff++;
        if (vertices[i].w !== vertices[j].w) diff++;
        if (diff === 1) edges.push([i, j]);
      }
    }
    return { vertices, edges };
  },
  update: (state, ctx, w, h, frame, rx, ry, scaleMultiplier, speed, accentHue, density) => {
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, w, h);
    
    const centerX = w / 2;
    const centerY = h / 2;
    const angle = frame * 0.01 * speed;
    
    const xy = angle;
    const xz = angle * 0.5;
    const xw = angle * 0.7;
    const yz = angle * 0.3;
    const yw = angle * 0.4;
    const zw = angle * 0.6;

    const projected3D: Point3D[] = state.vertices.map((v: Point4D) => {
      const r4d = rotate4D(v, xy, xz, xw, yz, yw, zw);
      const distance4D = 2.4;
      const factor = 1 / (distance4D - r4d.w);
      return {
        x: r4d.x * factor * 115 * scaleMultiplier,
        y: r4d.y * factor * 115 * scaleMultiplier,
        z: r4d.z * factor * 115 * scaleMultiplier
      };
    });

    const final2D = projected3D.map(p => {
      const r3d = rotate3D(p, rx, ry, 0);
      const d3 = 400;
      const scale = d3 / (d3 + r3d.z);
      return {
        x: r3d.x * scale + centerX,
        y: r3d.y * scale + centerY,
        z: r3d.z
      };
    });

    state.edges.forEach(([i, j]: [number, number]) => {
      const p1 = final2D[i];
      const p2 = final2D[j];
      const avgZ = (p1.z + p2.z) / 2;
      const alpha = Math.min(1, Math.max(0.12, (200 - avgZ) / 300));
      
      ctx.strokeStyle = `hsla(${accentHue}, 90%, 65%, ${alpha * 0.7})`;
      ctx.lineWidth = (avgZ < 0) ? 2.2 : 1.0;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    final2D.forEach((p, idx) => {
      const alpha = Math.min(1, Math.max(0.2, (200 - p.z) / 300));
      ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : `hsla(${(accentHue + 120) % 360}, 100%, 75%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, idx % 2 === 0 ? 3.5 : 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
};

// 4. LORENZ ATTRACTOR
const chaosAttractor: Visualizer = {
  id: 'lorenz',
  name: 'Chaos Lorenz Attractor',
  category: 'Chaos Fractal',
  desc: '3D strange attractor orbit path calculated live using high-precision differential equations.',
  icon: Cpu,
  init: () => {
    const x = 0.1, y = 0, z = 0;
    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;
    const dt = 0.01;
    const points: Point3D[] = [];
    let cx = x, cy = y, cz = z;
    
    for (let i = 0; i < 1500; i++) {
      const dx = sigma * (cy - cx) * dt;
      const dy = (cx * (rho - cz) - cy) * dt;
      const dz = (cx * cy - beta * cz) * dt;
      cx += dx;
      cy += dy;
      cz += dz;
      points.push({ x: cx, y: cy, z: cz });
    }
    return { points, currentX: cx, currentY: cy, currentZ: cz, sigma, rho, beta, dt };
  },
  update: (state, ctx, w, h, frame, rx, ry, scaleMultiplier, speed, accentHue, density) => {
    ctx.fillStyle = 'rgba(3, 3, 8, 0.28)';
    ctx.fillRect(0, 0, w, h);
    
    const centerX = w / 2;
    const centerY = h / 2 + 20;
    const steps = Math.max(1, Math.floor(5 * speed));
    
    for (let s = 0; s < steps; s++) {
      const cx = state.currentX;
      const cy = state.currentY;
      const cz = state.currentZ;
      
      const dx = state.sigma * (cy - cx) * state.dt;
      const dy = (cx * (state.rho - cz) - cy) * state.dt;
      const dz = (cx * cy - state.beta * cz) * state.dt;
      
      state.currentX += dx;
      state.currentY += dy;
      state.currentZ += dz;
      
      state.points.push({ x: state.currentX, y: state.currentY, z: state.currentZ });
      if (state.points.length > 1800) state.points.shift();
    }

    const limit = Math.floor(state.points.length * density);
    ctx.beginPath();
    for (let i = 0; i < limit; i++) {
      const pt = state.points[i];
      const rawPt: Point3D = {
        x: pt.x * 4.5 * scaleMultiplier,
        y: pt.y * 4.5 * scaleMultiplier,
        z: (pt.z - 25) * 4.5 * scaleMultiplier
      };
      const rotated = rotate3D(rawPt, rx, ry, 0);
      const d3 = 500;
      const scale = d3 / (d3 + rotated.z);
      const sx = rotated.x * scale + centerX;
      const sy = rotated.y * scale + centerY;

      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    
    ctx.strokeStyle = `hsla(${accentHue}, 95%, 65%, 0.42)`;
    ctx.lineWidth = 1.0;
    ctx.stroke();

    if (state.points.length > 0) {
      const head = state.points[state.points.length - 1];
      const rawHead = {
        x: head.x * 4.5 * scaleMultiplier,
        y: head.y * 4.5 * scaleMultiplier,
        z: (head.z - 25) * 4.5 * scaleMultiplier
      };
      const rotHead = rotate3D(rawHead, rx, ry, 0);
      const scaleHead = 500 / (500 + rotHead.z);
      const sxh = rotHead.x * scaleHead + centerX;
      const syh = rotHead.y * scaleHead + centerY;
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sxh, syh, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

// 5. SINUSOIDAL FABRIC WAVE SPHERE
const waveSphere: Visualizer = {
  id: 'wavesphere',
  name: 'Cosmic Sine-wave Grid',
  category: 'Vibrational Physics',
  desc: 'Multi-layered 3D holographic wireframe sphere of nodes breathing with sinusoidal wave overlays.',
  icon: Waves,
  init: () => {
    const points: { u: number; v: number }[] = [];
    const rings = 14;
    const sectors = 20;
    for (let r = 0; r <= rings; r++) {
      const u = (r / rings) * Math.PI;
      for (let s = 0; s < sectors; s++) {
        const v = (s / sectors) * Math.PI * 2;
        points.push({ u, v });
      }
    }
    return { points };
  },
  update: (state, ctx, w, h, frame, rx, ry, scaleMultiplier, speed, accentHue, density) => {
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, w, h);
    
    const centerX = w / 2;
    const centerY = h / 2;
    const baseRadius = 110 * scaleMultiplier;
    const currentPoints = Math.floor(state.points.length * density);

    state.points.slice(0, currentPoints).forEach((pt: any, i: number) => {
      const osc = Math.sin(pt.u * 4 + pt.v * 3 + frame * 0.04 * speed) * 12;
      const currentRadius = baseRadius + osc;

      const x = Math.sin(pt.u) * Math.cos(pt.v) * currentRadius;
      const y = Math.cos(pt.u) * currentRadius;
      const z = Math.sin(pt.u) * Math.sin(pt.v) * currentRadius;

      const rotated = rotate3D({ x, y, z }, rx, ry, 0);
      const d3 = 500;
      const scale = d3 / (d3 + rotated.z);
      const sx = rotated.x * scale + centerX;
      const sy = rotated.y * scale + centerY;

      const depthColor = Math.min(1, Math.max(0.1, (200 - rotated.z) / 300));
      ctx.fillStyle = `hsla(${(accentHue + pt.v * 40) % 360}, 95%, 65%, ${depthColor})`;
      
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(0.5, 2.2 * scale), 0, Math.PI * 2);
      ctx.fill();

      if (i % 6 === 0 && i < currentPoints - 1) {
        const nextIndex = i + 1;
        const ptNext = state.points[nextIndex];
        if (ptNext) {
          const oscNext = Math.sin(ptNext.u * 4 + ptNext.v * 3 + frame * 0.04 * speed) * 12;
          const radiusNext = baseRadius + oscNext;
          const xNext = Math.sin(ptNext.u) * Math.cos(ptNext.v) * radiusNext;
          const yNext = Math.cos(ptNext.u) * radiusNext;
          const zNext = Math.sin(ptNext.u) * Math.sin(ptNext.v) * radiusNext;
          
          const rotNext = rotate3D({ x: xNext, y: yNext, z: zNext }, rx, ry, 0);
          const scaleNext = d3 / (d3 + rotNext.z);
          const sxNext = rotNext.x * scaleNext + centerX;
          const syNext = rotNext.y * scaleNext + centerY;

          ctx.strokeStyle = `hsla(${accentHue}, 90%, 50%, ${depthColor * 0.12})`;
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sxNext, syNext);
          ctx.stroke();
        }
      }
    });
  }
};

// 6. GEODESIC POLYHEDRAL DOME
const geodesicDome: Visualizer = {
  id: 'polyhedron',
  name: 'Geodesic Ripple Mesh',
  category: 'Structural Topology',
  desc: 'Highly detailed 3D geometric dodecahedron mesh structure. Click/drag nodes to trigger acoustic waves.',
  icon: Compass,
  init: () => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const vertices: Point3D[] = [
      { x: -1, y: phi, z: 0 },
      { x: 1, y: phi, z: 0 },
      { x: -1, y: -phi, z: 0 },
      { x: 1, y: -phi, z: 0 },
      { x: 0, y: -1, z: phi },
      { x: 0, y: 1, z: phi },
      { x: 0, y: -1, z: -phi },
      { x: 0, y: 1, z: -phi },
      { x: phi, y: 0, z: -1 },
      { x: phi, y: 0, z: 1 },
      { x: -phi, y: 0, z: -1 },
      { x: -phi, y: 0, z: 1 },
    ];

    vertices.forEach(v => {
      const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      v.x /= len; v.y /= len; v.z /= len;
    });

    const links: [number, number][] = [];
    const threshold = 1.15;
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const dx = vertices[i].x - vertices[j].x;
        const dy = vertices[i].y - vertices[j].y;
        const dz = vertices[i].z - vertices[j].z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < threshold) {
          links.push([i, j]);
        }
      }
    }
    const waves: { node: number; timer: number; radius: number }[] = [];
    return { vertices, links, waves };
  },
  onClick: (state, x, y) => {
    playSound('move');
    state.waves.push({
      node: Math.floor(Math.random() * state.vertices.length),
      timer: 1.0,
      radius: 0.1
    });
  },
  update: (state, ctx, w, h, frame, rx, ry, scaleMultiplier, speed, accentHue, density) => {
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, w, h);
    
    const centerX = w / 2;
    const centerY = h / 2;

    state.waves.forEach((wv: any) => {
      wv.radius += 0.05 * speed;
      wv.timer -= 0.02 * speed;
    });
    state.waves = state.waves.filter((wv: any) => wv.timer > 0);

    const geometryScale = 110 * scaleMultiplier;

    const projected = state.vertices.map((v: Point3D) => {
      let deformation = 0;
      state.waves.forEach((wv: any) => {
        const vSource = state.vertices[wv.node];
        const distToSource = Math.sqrt(
          Math.pow(v.x - vSource.x, 2) + 
          Math.pow(v.y - vSource.y, 2) + 
          Math.pow(v.z - vSource.z, 2)
        );
        const diff = Math.abs(distToSource - wv.radius);
        if (diff < 0.3) {
          deformation += Math.sin((0.3 - diff) * Math.PI * 3) * 0.14 * wv.timer;
        }
      });

      const activeRadius = geometryScale * (1 + deformation);
      const pMod = {
        x: v.x * activeRadius,
        y: v.y * activeRadius,
        z: v.z * activeRadius
      };

      const rot = rotate3D(pMod, rx, ry, 0);
      const d3 = 500;
      const s = d3 / (d3 + rot.z);
      return {
        x: rot.x * s + centerX,
        y: rot.y * s + centerY,
        z: rot.z,
        deformation
      };
    });

    state.links.forEach(([i, j]: [number, number]) => {
      const p1 = projected[i];
      const p2 = projected[j];
      const avgDeform = (p1.deformation + p2.deformation) / 2;
      const avgZ = (p1.z + p2.z) / 2;
      const alpha = Math.min(1, Math.max(0.1, (200 - avgZ) / 300));
      
      ctx.strokeStyle = `hsla(${(accentHue + avgDeform * 300) % 360}, 90%, ${50 + avgDeform * 50}%, ${alpha * 0.6})`;
      ctx.lineWidth = 1 + Math.abs(avgDeform) * 6;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    projected.forEach((p: any) => {
      const alpha = Math.min(1, Math.max(0.1, (200 - p.z) / 300));
      ctx.fillStyle = p.deformation > 0.02 ? '#ffffff' : `hsla(${(accentHue + 180) % 360}, 90%, 70%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5 + Math.abs(p.deformation) * 10, 0, Math.PI * 2);
      ctx.fill();
    });
  }
};

// 7. QUANTUM ATOMIC ORBITAL SHELLS
const quantumOrbitals: Visualizer = {
  id: 'orbitals',
  name: 'Quantum Orbital Clouds',
  category: 'Quantum Mechanics',
  desc: '3D electron probability clouds calculated by modeling wavefunctions ($2p_z$ and $3d$ harmonics).',
  icon: Sparkles,
  init: () => {
    const particles: Point3D[] = [];
    for (let i = 0; i < 500; i++) {
      const theta = Math.random() * Math.PI;
      const phi = Math.random() * Math.PI * 2;
      const r = (Math.random() * 0.3 + 0.7) * 95;
      const cosTheta = Math.cos(theta);
      const amplitude = Math.abs(3 * cosTheta * cosTheta - 1) * 0.5;

      const scaleAmp = (amplitude + 0.15) * r;
      const x = scaleAmp * Math.sin(theta) * Math.cos(phi);
      const y = scaleAmp * Math.cos(theta);
      const z = scaleAmp * Math.sin(theta) * Math.sin(phi);
      particles.push({ x, y, z });
    }
    return { particles };
  },
  update: (state, ctx, w, h, frame, rx, ry, scaleMultiplier, speed, accentHue, density) => {
    ctx.fillStyle = 'rgba(3, 3, 8, 0.25)';
    ctx.fillRect(0, 0, w, h);
    
    const centerX = w / 2;
    const centerY = h / 2;
    const particlesToDraw = Math.floor(state.particles.length * density);

    state.particles.slice(0, particlesToDraw).forEach((p: Point3D, idx: number) => {
      const jitterX = (Math.random() - 0.5) * 2;
      const jitterY = (Math.random() - 0.5) * 2;
      const jitterZ = (Math.random() - 0.5) * 2;

      const modPt = {
        x: (p.x + jitterX) * scaleMultiplier,
        y: (p.y + jitterY) * scaleMultiplier,
        z: (p.z + jitterZ) * scaleMultiplier
      };

      const rotated = rotate3D(modPt, rx, ry, 0);
      const d3 = 500;
      const scale = d3 / (d3 + rotated.z);
      const sx = rotated.x * scale + centerX;
      const sy = rotated.y * scale + centerY;

      const phase = Math.sin(idx * 0.2 + frame * 0.05 * speed);
      const colorHue = phase > 0 ? accentHue : (accentHue + 180) % 360;
      const alpha = Math.min(1, Math.max(0.1, (200 - rotated.z) / 300)) * (0.4 + Math.abs(phase) * 0.6);

      ctx.fillStyle = `hsla(${colorHue}, 90%, ${70 + phase * 18}%, ${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(0.6, (2.2 * scale) * (0.8 + Math.random() * 0.4)), 0, Math.PI * 2);
      ctx.fill();
    });
  }
};

const visualizers: Visualizer[] = [
  cosmicWarp, 
  dnaHelix, 
  tesseract4D, 
  chaosAttractor, 
  waveSphere, 
  geodesicDome, 
  quantumOrbitals
];

// LIVE RENDERING MINIATURE CANVAS COMPONENT
interface MiniLabCardProps {
  key?: React.Key;
  visualizer: Visualizer;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  speed: number;
  scaleMultiplier: number;
  accentHue: number;
  density: number;
}

function MiniLabCard({ 
  visualizer, 
  index, 
  isActive, 
  onSelect, 
  speed, 
  scaleMultiplier, 
  accentHue, 
  density 
}: MiniLabCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const localStateRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 110;
    canvas.height = 80;

    localStateRef.current = visualizer.init(canvas);

    const render = () => {
      frameCountRef.current++;
      const w = canvas.width;
      const h = canvas.height;
      
      const rx = Math.sin(frameCountRef.current * 0.015) * 0.35;
      const ry = frameCountRef.current * 0.02;

      visualizer.update(
        localStateRef.current,
        ctx,
        w,
        h,
        frameCountRef.current,
        rx,
        ry,
        scaleMultiplier * 0.6,
        speed * 0.8,
        accentHue,
        density * 0.5
      );

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visualizer, speed, scaleMultiplier, accentHue, density]);

  return (
    <div 
      onClick={onSelect}
      className={`relative cursor-pointer flex flex-col gap-1.5 p-2 rounded-xl border transition-all hover:scale-[1.03] active:scale-95 shrink-0 ${
        isActive 
          ? 'bg-fuchsia-600/10 border-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.3)]' 
          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
      }`}
    >
      <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-white/5">
        <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />
        <div className="absolute top-1 left-1 px-1 bg-black/60 text-[7px] font-mono font-bold text-slate-400 border border-white/10 rounded uppercase">
          LAB {index + 1}
        </div>
        {isActive && (
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-ping" />
        )}
      </div>
      
      <div className="flex items-center justify-between px-0.5 text-[10px] font-bold uppercase tracking-wider">
        <span className="truncate w-[80%] text-slate-300">{visualizer.name}</span>
        <visualizer.icon className={`w-3 h-3 ${isActive ? 'text-fuchsia-400' : 'text-slate-500'}`} />
      </div>
    </div>
  );
}

// MAIN APPLET COMPONENT
export default function ULabsApp() {
  const [activeVisualIndex, setActiveVisualIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [density, setDensity] = useState(0.8);
  const [scaleMultiplier, setScaleMultiplier] = useState(1.0);
  const [accentHue, setAccentHue] = useState(280);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const rotRef = useRef({ x: 0, y: 0, isDragging: false, startX: 0, startY: 0, autoX: 0, autoY: 0 });
  const localStateRef = useRef<any>(null);
  const frameIdRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);

  const activeVisual = visualizers[activeVisualIndex];

  // Lifecycle for running animation loop on the main stage
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = containerRef.current;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    localStateRef.current = activeVisual.init(canvas);
    frameCountRef.current = 0;

    const render = () => {
      if (!isPlaying) {
        frameIdRef.current = requestAnimationFrame(render);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      frameCountRef.current += 1;
      
      if (autoRotate) {
        rotRef.current.autoX = Math.sin(frameCountRef.current * 0.005) * 0.5;
        rotRef.current.autoY = frameCountRef.current * 0.008;
      }

      const rx = rotRef.current.x + rotRef.current.autoX;
      const ry = rotRef.current.y + rotRef.current.autoY;

      activeVisual.update(
        localStateRef.current, 
        ctx, 
        w, 
        h, 
        frameCountRef.current,
        rx,
        ry,
        scaleMultiplier,
        speed,
        accentHue,
        density
      );

      frameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [activeVisualIndex, isPlaying, autoRotate, speed, scaleMultiplier, accentHue, density]);

  // Handle Drag & Touch Navigation on Canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    rotRef.current.isDragging = true;
    rotRef.current.startX = e.clientX;
    rotRef.current.startY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!rotRef.current.isDragging) return;
    const dx = e.clientX - rotRef.current.startX;
    const dy = e.clientY - rotRef.current.startY;
    
    rotRef.current.x += dy * 0.01;
    rotRef.current.y += dx * 0.01;
    
    rotRef.current.startX = e.clientX;
    rotRef.current.startY = e.clientY;

    if (!isPlaying && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const rx = rotRef.current.x + rotRef.current.autoX;
        const ry = rotRef.current.y + rotRef.current.autoY;
        activeVisual.update(
          localStateRef.current, 
          ctx, 
          canvasRef.current.width, 
          canvasRef.current.height, 
          frameCountRef.current,
          rx,
          ry,
          scaleMultiplier,
          speed,
          accentHue,
          density
        );
      }
    }
  };

  const handleMouseUpOrLeave = () => {
    rotRef.current.isDragging = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      rotRef.current.isDragging = true;
      rotRef.current.startX = e.touches[0].clientX;
      rotRef.current.startY = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!rotRef.current.isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - rotRef.current.startX;
    const dy = e.touches[0].clientY - rotRef.current.startY;
    
    rotRef.current.x += dy * 0.012;
    rotRef.current.y += dx * 0.012;
    
    rotRef.current.startX = e.touches[0].clientX;
    rotRef.current.startY = e.touches[0].clientY;

    if (!isPlaying && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const rx = rotRef.current.x + rotRef.current.autoX;
        const ry = rotRef.current.y + rotRef.current.autoY;
        activeVisual.update(
          localStateRef.current, 
          ctx, 
          canvasRef.current.width, 
          canvasRef.current.height, 
          frameCountRef.current,
          rx,
          ry,
          scaleMultiplier,
          speed,
          accentHue,
          density
        );
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeVisual.onClick && localStateRef.current) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const lx = e.clientX - rect.left;
        const ly = e.clientY - rect.top;
        activeVisual.onClick(localStateRef.current, lx, ly);
      }
    }
  };

  // Stage Carousel Navigations
  const handlePrev = () => {
    playSound('click');
    const nextIdx = activeVisualIndex === 0 ? visualizers.length - 1 : activeVisualIndex - 1;
    setActiveVisualIndex(nextIdx);
    speakText(`Loaded visual ${nextIdx + 1}. ${visualizers[nextIdx].name}`);
  };

  const handleNext = () => {
    playSound('click');
    const nextIdx = activeVisualIndex === visualizers.length - 1 ? 0 : activeVisualIndex + 1;
    setActiveVisualIndex(nextIdx);
    speakText(`Loaded visual ${nextIdx + 1}. ${visualizers[nextIdx].name}`);
  };

  const handleSelectLab = (idx: number) => {
    playSound('click');
    setActiveVisualIndex(idx);
    speakText(`Loaded visual ${idx + 1}. ${visualizers[idx].name}`);
  };

  // Keyboard navigation listener for Arrow Keys and < >
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' || e.key === '<' || e.key === ',') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight' || e.key === '>' || e.key === '.') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVisualIndex]);

  const resetRotation = () => {
    playSound('success');
    rotRef.current.x = 0;
    rotRef.current.y = 0;
    rotRef.current.autoX = 0;
    rotRef.current.autoY = 0;
    frameCountRef.current = 0;
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col md:flex-row font-sans text-slate-200 select-none overflow-hidden rounded-b-lg">
      
      {/* SIDEBAR FOR CONTROLS & LIVE LAB PREVIEWS */}
      {!isSidebarCollapsed && (
        <div className="w-full md:w-80 bg-slate-900/90 border-b md:border-b-0 md:border-r border-slate-800/80 p-4 shrink-0 flex flex-col gap-4 overflow-y-auto animate-in slide-in-from-left duration-200">
          
          {/* Core Engine Branding Header */}
          <div className="flex items-center gap-2.5 px-1 pb-1 border-b border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/15">
              <Cpu className="w-4.5 h-4.5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest uppercase text-white">U-Labs Engine</h2>
              <p className="text-[9px] text-fuchsia-400 font-bold uppercase tracking-wider font-mono">Multi-Lab Visualizer</p>
            </div>
          </div>

          {/* ALL LABS DISPLAYED OPENED SIDE-BY-SIDE (GRID PREVIEWS) */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block px-1 flex items-center gap-1">
              <Eye className="w-3 h-3 text-fuchsia-400" /> Active Open Simulations ({visualizers.length})
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-56 md:max-h-[340px] overflow-y-auto pr-1">
              {visualizers.map((v, idx) => (
                <MiniLabCard
                  key={v.id}
                  index={idx}
                  visualizer={v}
                  isActive={activeVisualIndex === idx}
                  onSelect={() => handleSelectLab(idx)}
                  speed={speed}
                  scaleMultiplier={scaleMultiplier}
                  accentHue={accentHue}
                  density={density}
                />
              ))}
            </div>
          </div>

          {/* ENGINE CONTROLS SECTION */}
          <div className="space-y-3.5 border-t border-slate-800/60 pt-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-black uppercase tracking-widest">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Physics Constants
            </div>

            {/* Constant 1: Speed */}
            <div className="space-y-1 px-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Warp Speed</span>
                <span className="font-mono text-fuchsia-400">{speed.toFixed(1)}x</span>
              </div>
              <input 
                type="range" min="0.1" max="3.0" step="0.1" value={speed} 
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-fuchsia-500 bg-slate-950 h-1 rounded-full cursor-pointer"
              />
            </div>

            {/* Constant 2: Density */}
            <div className="space-y-1 px-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Shell Density</span>
                <span className="font-mono text-fuchsia-400">{Math.round(density * 100)}%</span>
              </div>
              <input 
                type="range" min="0.2" max="1.5" step="0.1" value={density} 
                onChange={(e) => setDensity(parseFloat(e.target.value))}
                className="w-full accent-fuchsia-500 bg-slate-950 h-1 rounded-full cursor-pointer"
              />
            </div>

            {/* Constant 3: Size */}
            <div className="space-y-1 px-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Grid Projection</span>
                <span className="font-mono text-fuchsia-400">{scaleMultiplier.toFixed(1)}x</span>
              </div>
              <input 
                type="range" min="0.5" max="1.8" step="0.1" value={scaleMultiplier} 
                onChange={(e) => setScaleMultiplier(parseFloat(e.target.value))}
                className="w-full accent-fuchsia-500 bg-slate-950 h-1 rounded-full cursor-pointer"
              />
            </div>

            {/* Constant 4: Hue */}
            <div className="space-y-1 px-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Hologram Color</span>
                <span className="font-mono text-fuchsia-400">{accentHue}°</span>
              </div>
              <input 
                type="range" min="0" max="360" step="10" value={accentHue} 
                onChange={(e) => setAccentHue(parseInt(e.target.value))}
                className="w-full bg-slate-950 h-1 rounded-full cursor-pointer"
                style={{ background: 'linear-gradient(to right, #ef4444, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)' }}
              />
            </div>
          </div>

          {/* BOTTOM ACTION TRIGGERS */}
          <div className="mt-auto space-y-2 border-t border-slate-800/60 pt-3">
            <div className="flex gap-2">
              <button
                onClick={() => { playSound('click'); setIsPlaying(!isPlaying); }}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border ${isPlaying ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-600/20' : 'bg-fuchsia-600 text-white border-fuchsia-500'}`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Freeze State' : 'Unfreeze Live'}
              </button>
              <button
                onClick={resetRotation}
                className="px-3 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
                title="Reset matrix projection angles"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <label className="flex items-center gap-2 px-1 py-1 cursor-pointer text-xs text-slate-400 hover:text-white font-bold transition-colors">
              <input 
                type="checkbox" checked={autoRotate} 
                onChange={(e) => { playSound('click'); setAutoRotate(e.target.checked); }}
                className="accent-fuchsia-500 w-3.5 h-3.5 rounded bg-slate-950 border-slate-800"
              />
              Auto-orbit Gravity
            </label>
          </div>
        </div>
      )}

      {/* STAGE FOCUS AREA (HD RESOLUTION RENDERER) */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* NAV HEADLIGHT STRIP */}
        <div className="absolute top-0 inset-x-0 bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-slate-800/50" style={{ zIndex: 10 }}>
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-fuchsia-400">{activeVisual.category}</span>
            <h3 className="font-black text-sm text-slate-100 flex items-center gap-1.5 truncate uppercase tracking-wider">
              {activeVisual.name}
            </h3>
          </div>

          {/* Quick Step Navigation: < > */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { playSound('click'); setIsSidebarCollapsed(!isSidebarCollapsed); }}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-wider uppercase transition-all ${isSidebarCollapsed ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
              title={isSidebarCollapsed ? "Show Controls Panel" : "Hide Controls Panel (Full Screen Canvas)"}
            >
              {isSidebarCollapsed ? "SHOW SIDEBAR" : "FULL SCREEN"}
            </button>

            <button
              onClick={handlePrev}
              className="px-3 py-1.5 bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 hover:border-fuchsia-500 hover:bg-slate-800 text-fuchsia-400 font-extrabold rounded-lg transition-all flex items-center gap-1.5 hover:shadow-[0_0_10px_rgba(217,70,239,0.3)] active:scale-95"
              title="Previous Lab (Shortcut: <)"
            >
              <span className="font-mono text-sm font-black">&lt;</span>
              <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
            </button>
            
            <div className="px-3 font-mono text-[10px] font-extrabold text-slate-300 bg-slate-950 border border-slate-800 py-1.5 rounded-lg select-none">
              {activeVisualIndex + 1} / {visualizers.length}
            </div>

            <button
              onClick={handleNext}
              className="px-3 py-1.5 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 hover:border-fuchsia-500 hover:bg-slate-800 text-fuchsia-400 font-extrabold rounded-lg transition-all flex items-center gap-1.5 hover:shadow-[0_0_10px_rgba(217,70,239,0.3)] active:scale-95"
              title="Next Lab (Shortcut: >)"
            >
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono text-sm font-black">&gt;</span>
            </button>
          </div>
        </div>

        {/* INTERACTIVE VECTOR FIELD */}
        <div 
          ref={containerRef}
          className="flex-1 relative cursor-grab active:cursor-grabbing select-none overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
          onClick={handleCanvasClick}
        >
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 block h-full w-full bg-[#030308]"
          />

          {/* Interactive Edge Hover Navigation Chevrons */}
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-950/60 hover:bg-fuchsia-600 border border-white/10 hover:border-fuchsia-400 text-slate-200 hover:text-white hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all flex items-center justify-center cursor-pointer z-20"
            title="Previous Simulation Lab (Shortcut: <)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-950/60 hover:bg-fuchsia-600 border border-white/10 hover:border-fuchsia-400 text-slate-200 hover:text-white hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all flex items-center justify-center cursor-pointer z-20"
            title="Next Simulation Lab (Shortcut: >)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Background Gravity Flare */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
            <div className="w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl" />
          </div>

          {/* Contextual Science description plate */}
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/5 shadow-2xl max-w-lg pointer-events-auto">
            <div className="flex gap-2.5">
              <div className="p-1.5 bg-fuchsia-500/10 rounded-lg border border-fuchsia-500/20 shrink-0 h-fit self-start">
                <Info className="w-3.5 h-3.5 text-fuchsia-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Simulation Theory</p>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{activeVisual.desc}</p>
                {activeVisual.onClick && (
                  <p className="text-[9px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1.5 animate-pulse">
                    ⚡ Tap anywhere on stage to fire kinetic shockwaves into geometry!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
