import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const CASE_RADIUS = 1.0;
const CASE_DEPTH = 0.28;
const FRONT_Z = CASE_DEPTH / 2;

let scene;
let camera;
let renderer;
let controls;
let watchGroup;
let dialMesh;
let movementGroup;
let hands;
let skeletonCheck;
let realTimeCheck;
let timeDisplay;
let lastFrame = 0;
let demoSeconds = 0;

function makeCanvasTexture(draw, size = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  draw(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function buildDialTexture() {
  return makeCanvasTexture((ctx, size) => {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.445;

    ctx.clearRect(0, 0, size, size);

    const base = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    base.addColorStop(0, '#232323');
    base.addColorStop(0.45, '#151515');
    base.addColorStop(1, '#050505');
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Centered sunburst so the highlight aligns to the dial center.
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 240; i++) {
      const a = (i / 240) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.05, Math.sin(a) * r * 0.05);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.018)' : 'rgba(255,255,255,0.008)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();

    const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.72);
    centerGlow.addColorStop(0, 'rgba(255,255,255,0.08)');
    centerGlow.addColorStop(0.45, 'rgba(255,255,255,0.025)');
    centerGlow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = centerGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const major = i % 5 === 0;
      const inner = major ? r * 0.82 : r * 0.89;
      const outer = r * 0.975;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
      ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
      ctx.strokeStyle = major ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.56)';
      ctx.lineWidth = major ? 4.5 : 2;
      ctx.stroke();
    }

    const numerals = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    numerals.forEach((num, idx) => {
      const a = (idx / 12) * Math.PI * 2 - Math.PI / 2;
      const nr = r * 0.69;
      const x = cx + Math.cos(a) * nr;
      const y = cy + Math.sin(a) * nr;
      const large = num === 12 || num === 3 || num === 6 || num === 9;
      ctx.font = `${large ? 700 : 600} ${large ? size * 0.078 : size * 0.061}px "Cinzel", serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.97)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(num), x, y);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.86);
    ctx.lineTo(cx - 18, cy - r * 0.79);
    ctx.lineTo(cx + 18, cy - r * 0.79);
    ctx.closePath();
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `700 ${size * 0.052}px "Cinzel", serif`;
    ctx.fillText('DWATCH', cx, cy - r * 0.22);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `${size * 0.023}px "Cinzel", serif`;
    ctx.fillText('AUTOMATIC', cx, cy + r * 0.16);
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.font = `${size * 0.018}px "Cinzel", serif`;
    ctx.fillText('SWISS MADE', cx, cy + r * 0.28);

    const dateWidth = 60;
    const dateHeight = 34;
    const dateX = cx + r * 0.49 - dateWidth / 2;
    const dateY = cy - dateHeight / 2;
    ctx.fillStyle = '#101010';
    ctx.fillRect(dateX, dateY, dateWidth, dateHeight);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 2;
    ctx.strokeRect(dateX, dateY, dateWidth, dateHeight);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = `700 ${size * 0.038}px "Cinzel", serif`;
    ctx.fillText(String(new Date().getDate()), dateX + dateWidth / 2, dateY + dateHeight / 2 + 2);
  });
}

function buildGenevaTexture() {
  return makeCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#86817a';
    ctx.fillRect(0, 0, size, size);
    for (let i = -size; i < size * 2; i += 70) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + size * 0.25, size);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 28;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i + 16, 0);
      ctx.lineTo(i + 16 + size * 0.25, size);
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 8;
      ctx.stroke();
    }
  }, 512);
}

function buildPerlageTexture() {
  return makeCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#4a433c';
    ctx.fillRect(0, 0, size, size);
    for (let y = 28; y < size + 28; y += 38) {
      for (let x = 28; x < size + 28; x += 38) {
        const ox = (y / 38) % 2 === 0 ? 0 : 18;
        const g = ctx.createRadialGradient(x + ox, y, 0, x + ox, y, 15);
        g.addColorStop(0, 'rgba(255,255,255,0.14)');
        g.addColorStop(0.65, 'rgba(255,255,255,0.05)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x + ox, y, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, 512);
}

function makeSteelMaterial(color = 0xd9dde2, roughness = 0.24) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.95,
    roughness
  });
}

function buildBraceletHalf(direction, material) {
  const group = new THREE.Group();
  const startY = direction * (CASE_RADIUS + 0.15);
  const centerMat = makeSteelMaterial(0xe4e8ed, 0.17);
  const shoulderMat = makeSteelMaterial(0xd4dae1, 0.22);
  const outerMat = makeSteelMaterial(0xc3c9d1, 0.3);

  const endLink = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.11, 0.08),
    centerMat
  );
  endLink.position.set(0, direction * (CASE_RADIUS + 0.095), FRONT_Z - 0.02);
  group.add(endLink);

  for (let i = 0; i < 13; i++) {
    const taper = 1 - i * 0.028;
    const y = startY + direction * i * 0.072;
    const z = FRONT_Z - 0.04 - i * 0.004;
    const tilt = direction * 0.018;

    const center = new THREE.Mesh(
      new THREE.BoxGeometry(0.12 * taper, 0.058, 0.042),
      centerMat
    );
    center.position.set(0, y, z + 0.004);
    center.rotation.x = 0.08;
    group.add(center);

    const shoulderLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.08 * taper, 0.052, 0.038),
      shoulderMat
    );
    shoulderLeft.position.set(-0.102 * taper, y, z);
    shoulderLeft.rotation.z = tilt;
    group.add(shoulderLeft);

    const shoulderRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.08 * taper, 0.052, 0.038),
      shoulderMat
    );
    shoulderRight.position.set(0.102 * taper, y, z);
    shoulderRight.rotation.z = -tilt;
    group.add(shoulderRight);

    const outerLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.05 * taper, 0.046, 0.033),
      outerMat
    );
    outerLeft.position.set(-0.19 * taper, y, z - 0.003);
    outerLeft.rotation.z = tilt * 1.15;
    group.add(outerLeft);

    const outerRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.05 * taper, 0.046, 0.033),
      outerMat
    );
    outerRight.position.set(0.19 * taper, y, z - 0.003);
    outerRight.rotation.z = -tilt * 1.15;
    group.add(outerRight);
  }
  return group;
}

function buildCase() {
  const group = new THREE.Group();
  const caseMaterial = makeSteelMaterial(0xd3d8de, 0.22);
  const polishedMaterial = makeSteelMaterial(0xf3f5f7, 0.12);

  const midCase = new THREE.Mesh(
    new THREE.CylinderGeometry(CASE_RADIUS + 0.06, CASE_RADIUS + 0.06, CASE_DEPTH, 96, 1, true),
    caseMaterial
  );
  midCase.rotation.x = Math.PI / 2;
  group.add(midCase);

  const back = new THREE.Mesh(
    new THREE.CircleGeometry(CASE_RADIUS + 0.055, 96),
    makeSteelMaterial(0xb9c0c8, 0.38)
  );
  back.position.z = -FRONT_Z - 0.002;
  back.rotation.y = Math.PI;
  group.add(back);

  const bezelBody = new THREE.Mesh(
    new THREE.TorusGeometry(CASE_RADIUS + 0.015, 0.06, 24, 120),
    polishedMaterial
  );
  bezelBody.position.z = FRONT_Z + 0.01;
  group.add(bezelBody);

  const innerBezel = new THREE.Mesh(
    new THREE.RingGeometry(CASE_RADIUS - 0.03, CASE_RADIUS + 0.01, 96),
    makeSteelMaterial(0xe7eaee, 0.18)
  );
  innerBezel.position.z = FRONT_Z + 0.008;
  group.add(innerBezel);

  const crownTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.06, 20),
    caseMaterial
  );
  crownTube.rotation.z = Math.PI / 2;
  crownTube.position.set(CASE_RADIUS + 0.075, 0, 0.01);
  group.add(crownTube);

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.11, 0.11, 32),
    polishedMaterial
  );
  crown.rotation.z = Math.PI / 2;
  crown.position.set(CASE_RADIUS + 0.14, 0, 0.01);
  group.add(crown);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const notch = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.012, 0.13),
      caseMaterial
    );
    notch.position.set(CASE_RADIUS + 0.14, Math.sin(a) * 0.082, Math.cos(a) * 0.082 + 0.01);
    group.add(notch);
  }

  [1, -1].forEach((s) => {
    const lug = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.1), caseMaterial);
    lug.position.set(0, s * (CASE_RADIUS + 0.08), FRONT_Z - 0.015);
    group.add(lug);
  });

  group.add(buildBraceletHalf(1, caseMaterial));
  group.add(buildBraceletHalf(-1, caseMaterial));

  return group;
}

function buildDial() {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(CASE_RADIUS - 0.07, 96),
    new THREE.MeshBasicMaterial({ map: buildDialTexture(), side: THREE.FrontSide })
  );
  mesh.position.z = FRONT_Z + 0.004;
  return mesh;
}

function buildCrystal() {
  const group = new THREE.Group();

  const crystal = new THREE.Mesh(
    new THREE.CircleGeometry(CASE_RADIUS - 0.055, 96),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.06,
      roughness: 0.02,
      metalness: 0,
      depthWrite: false
    })
  );
  crystal.position.z = FRONT_Z + 0.02;
  crystal.renderOrder = 5;
  group.add(crystal);

  const reflection = new THREE.Mesh(
    new THREE.RingGeometry(CASE_RADIUS * 0.52, CASE_RADIUS * 0.58, 64, 1, Math.PI * 0.95, Math.PI * 0.42),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.09,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  reflection.position.set(-0.08, 0.12, FRONT_Z + 0.021);
  reflection.rotation.z = -0.45;
  reflection.renderOrder = 6;
  group.add(reflection);

  return group;
}

function makeDauphineHand(length, baseWidth, tipWidth, color) {
  const shape = new THREE.Shape();
  shape.moveTo(-baseWidth / 2, -0.04);
  shape.lineTo(baseWidth / 2, -0.04);
  shape.lineTo(baseWidth * 0.25, length * 0.55);
  shape.lineTo(tipWidth / 2, length);
  shape.lineTo(-tipWidth / 2, length);
  shape.lineTo(-baseWidth * 0.25, length * 0.55);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.008,
    bevelEnabled: true,
    bevelSize: 0.0015,
    bevelThickness: 0.0015
  });
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color,
    metalness: 0.95,
    roughness: 0.14
  }));
  mesh.position.z = 0.002;
  const pivot = new THREE.Group();
  pivot.add(mesh);
  return pivot;
}

function makeSecondHand(length) {
  const pivot = new THREE.Group();
  const red = new THREE.MeshBasicMaterial({ color: 0xe13636 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.01, length, 0.004), red);
  body.position.y = length / 2 - 0.1;
  pivot.add(body);

  const counterRing = new THREE.Mesh(new THREE.RingGeometry(0.018, 0.032, 20), red);
  counterRing.position.y = -0.13;
  counterRing.position.z = 0.002;
  pivot.add(counterRing);

  return pivot;
}

function buildHands() {
  const group = new THREE.Group();
  group.position.z = FRONT_Z + 0.012;

  const hour = makeDauphineHand(CASE_RADIUS * 0.42, 0.065, 0.018, 0xf7f7f4);
  const minute = makeDauphineHand(CASE_RADIUS * 0.63, 0.048, 0.013, 0xf7f7f4);
  const second = makeSecondHand(CASE_RADIUS * 0.7);

  group.add(hour);
  group.add(minute);
  group.add(second);

  const hub = new THREE.Mesh(
    new THREE.CircleGeometry(0.038, 28),
    new THREE.MeshBasicMaterial({ color: 0xd4b244 })
  );
  hub.position.z = 0.006;
  group.add(hub);

  return { group, hour, minute, second };
}

function buildGear(radius, teeth, color, roughness = 0.36) {
  const step = (Math.PI * 2) / teeth;
  const inner = radius * 0.7;
  const shape = new THREE.Shape();
  for (let i = 0; i < teeth; i++) {
    const a1 = i * step;
    const a2 = a1 + step * 0.36;
    const a3 = a1 + step * 0.64;
    const a4 = a1 + step;
    if (i === 0) {
      shape.moveTo(Math.cos(a1) * radius, Math.sin(a1) * radius);
    }
    shape.lineTo(Math.cos(a2) * radius, Math.sin(a2) * radius);
    shape.lineTo(Math.cos(a2) * inner, Math.sin(a2) * inner);
    shape.lineTo(Math.cos(a3) * inner, Math.sin(a3) * inner);
    shape.lineTo(Math.cos(a3) * radius, Math.sin(a3) * radius);
    shape.lineTo(Math.cos(a4) * radius, Math.sin(a4) * radius);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: false });
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, metalness: 0.75, roughness }));
  mesh.position.z = -0.006;
  return mesh;
}

function addScrews(group, points) {
  const screwMat = new THREE.MeshStandardMaterial({ color: 0x315a8a, metalness: 0.95, roughness: 0.22 });
  points.forEach(([x, y]) => {
    const screw = new THREE.Mesh(new THREE.CircleGeometry(0.018, 18), screwMat);
    screw.position.set(x, y, 0.008);
    group.add(screw);
  });
}

function buildMovement() {
  const group = new THREE.Group();
  group.position.z = FRONT_Z + 0.002;

  const barrelPos = new THREE.Vector2(0.08, 0.31);
  const centerPos = new THREE.Vector2(0.0, 0.0);
  const thirdPos = new THREE.Vector2(-0.26, 0.08);
  const fourthPos = new THREE.Vector2(-0.42, -0.03);
  const escapePos = new THREE.Vector2(-0.57, -0.11);
  const palletPos = new THREE.Vector2(-0.43, 0.10);
  const balancePos = new THREE.Vector2(-0.48, 0.32);

  const plate = new THREE.Mesh(
    new THREE.CircleGeometry(CASE_RADIUS * 0.88, 96),
    new THREE.MeshStandardMaterial({
      map: buildPerlageTexture(),
      color: 0x5a544c,
      metalness: 0.4,
      roughness: 0.68
    })
  );
  group.add(plate);

  const bridgeMaterial = new THREE.MeshStandardMaterial({
    map: buildGenevaTexture(),
    color: 0xa39b91,
    metalness: 0.82,
    roughness: 0.28
  });

  const barrelBridge = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.02), bridgeMaterial);
  barrelBridge.position.set(0.18, 0.31, 0.01);
  barrelBridge.rotation.z = -0.08;
  group.add(barrelBridge);

  const trainBridge = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.11, 0.02), bridgeMaterial);
  trainBridge.position.set(-0.30, -0.01, 0.012);
  trainBridge.rotation.z = -0.36;
  group.add(trainBridge);

  const balanceCock = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.02), bridgeMaterial);
  balanceCock.position.set(balancePos.x + 0.03, balancePos.y + 0.02, 0.014);
  balanceCock.rotation.z = 0.42;
  group.add(balanceCock);

  const barrel = buildGear(0.14, 40, 0x8e7758, 0.42);
  barrel.position.set(barrelPos.x, barrelPos.y, 0);
  barrel.name = 'barrel';
  group.add(barrel);

  const centerWheel = buildGear(0.19, 48, 0xcaa648, 0.28);
  centerWheel.position.set(centerPos.x, centerPos.y, 0);
  centerWheel.name = 'centerWheel';
  group.add(centerWheel);

  const thirdWheel = buildGear(0.085, 18, 0xaa835c, 0.33);
  thirdWheel.position.set(thirdPos.x, thirdPos.y, 0);
  thirdWheel.name = 'thirdWheel';
  group.add(thirdWheel);

  const fourthWheel = buildGear(0.1, 20, 0xb48e62, 0.33);
  fourthWheel.position.set(fourthPos.x, fourthPos.y, 0);
  fourthWheel.name = 'fourthWheel';
  group.add(fourthWheel);

  const escapeWheel = buildGear(0.072, 15, 0x567369, 0.42);
  escapeWheel.position.set(escapePos.x, escapePos.y, 0);
  escapeWheel.name = 'escapeWheel';
  group.add(escapeWheel);

  const pallet = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.026, 0.01),
    new THREE.MeshStandardMaterial({ color: 0x53606e, metalness: 0.72, roughness: 0.32 })
  );
  pallet.position.set(palletPos.x, palletPos.y, 0.014);
  pallet.rotation.z = 0.5;
  group.add(pallet);

  const jewelMat = new THREE.MeshStandardMaterial({ color: 0xc01a1a, metalness: 0.5, roughness: 0.18, emissive: 0x220000 });
  [
    [centerPos.x, centerPos.y],
    [thirdPos.x, thirdPos.y],
    [fourthPos.x, fourthPos.y],
    [escapePos.x, escapePos.y],
    [balancePos.x, balancePos.y],
    [barrelPos.x, barrelPos.y]
  ].forEach(([x, y]) => {
    const jewel = new THREE.Mesh(new THREE.CircleGeometry(0.026, 20), jewelMat);
    jewel.position.set(x, y, 0.016);
    group.add(jewel);
  });

  addScrews(group, [[-0.28, -0.22], [0.02, 0.32], [0.26, 0.18], [-0.18, 0.18], [-0.49, 0.18]]);

  const balance = new THREE.Mesh(
    new THREE.RingGeometry(0.08, 0.115, 40),
    new THREE.MeshStandardMaterial({ color: 0xcba04c, metalness: 0.85, roughness: 0.28 })
  );
  balance.position.set(balancePos.x, balancePos.y, 0.018);
  balance.name = 'balance';
  group.add(balance);

  [0, 1].forEach((i) => {
    const spoke = new THREE.Mesh(
      new THREE.BoxGeometry(0.006, 0.18, 0.004),
      new THREE.MeshBasicMaterial({ color: 0x8c6d31 })
    );
    spoke.position.set(balancePos.x, balancePos.y, 0.019);
    spoke.rotation.z = i * Math.PI / 2;
    group.add(spoke);
  });

  const points = [];
  for (let i = 0; i <= 58; i++) {
    const t = (i / 58) * Math.PI * 4.6;
    const rr = 0.012 + t * 0.009;
    points.push(new THREE.Vector3(
      balancePos.x + Math.cos(t) * rr,
      balancePos.y + Math.sin(t) * rr,
      0.022
    ));
  }
  const hairspring = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, 0.0035, 5, false),
    new THREE.MeshBasicMaterial({ color: 0xa9b6c2 })
  );
  hairspring.name = 'hairspring';
  group.add(hairspring);

  return group;
}

function getTime() {
  if (realTimeCheck.checked) {
    const d = new Date();
    return {
      hours: d.getHours() % 12 + d.getMinutes() / 60 + d.getSeconds() / 3600,
      minutes: d.getMinutes() + d.getSeconds() / 60,
      seconds: d.getSeconds() + d.getMilliseconds() / 1000
    };
  }

  const delta = (performance.now() - lastFrame) / 1000;
  demoSeconds += Number.isFinite(delta) ? delta : 0;
  const seconds = demoSeconds % 60;
  const minutes = Math.floor(demoSeconds / 60) % 60 + seconds / 60;
  const hours = Math.floor(demoSeconds / 3600) % 12 + minutes / 60;
  return { hours, minutes, seconds };
}

function updateHands(t) {
  hands.hour.rotation.z = -(t.hours / 12) * Math.PI * 2;
  hands.minute.rotation.z = -(t.minutes / 60) * Math.PI * 2;
  hands.second.rotation.z = -(t.seconds / 60) * Math.PI * 2;
}

function updateMovement(t) {
  const min = (t.minutes / 60) * Math.PI * 2;
  const sec = (t.seconds / 60) * Math.PI * 2;
  const balanceAngle = 0.38 * Math.sin(t.seconds * Math.PI * 10);

  const centerWheel = movementGroup.getObjectByName('centerWheel');
  const thirdWheel = movementGroup.getObjectByName('thirdWheel');
  const fourthWheel = movementGroup.getObjectByName('fourthWheel');
  const escapeWheel = movementGroup.getObjectByName('escapeWheel');
  const barrel = movementGroup.getObjectByName('barrel');
  const balance = movementGroup.getObjectByName('balance');
  const hairspring = movementGroup.getObjectByName('hairspring');

  if (barrel) barrel.rotation.z = -min * 0.22;
  if (centerWheel) centerWheel.rotation.z = -min;
  if (thirdWheel) thirdWheel.rotation.z = min * 1.9;
  if (fourthWheel) fourthWheel.rotation.z = -sec;
  if (escapeWheel) escapeWheel.rotation.z = sec * 2.4;
  if (balance) balance.rotation.z = balanceAngle;
  if (hairspring) hairspring.rotation.z = balanceAngle;
}

function initScene() {
  const canvas = document.getElementById('watchCanvas');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8f8f8);

  camera = new THREE.PerspectiveCamera(40, 1, 0.05, 100);
  camera.position.set(0, 0, 4.4);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  scene.add(new THREE.AmbientLight(0xffffff, 1.3));

  const key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(2.4, 3.5, 4.5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xdfe8f2, 0.9);
  fill.position.set(-3.4, 1.2, 3.1);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 0.65);
  rim.position.set(0, -3.5, 2.5);
  scene.add(rim);

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 2.4;
  controls.maxDistance = 8.5;
  controls.enablePan = false;

  watchGroup = new THREE.Group();
  scene.add(watchGroup);
  watchGroup.add(buildCase());

  movementGroup = buildMovement();
  movementGroup.visible = false;
  watchGroup.add(movementGroup);

  dialMesh = buildDial();
  watchGroup.add(dialMesh);

  hands = buildHands();
  watchGroup.add(hands.group);

  watchGroup.add(buildCrystal());

  skeletonCheck = document.getElementById('skeleton');
  realTimeCheck = document.getElementById('realTime');
  timeDisplay = document.getElementById('timeDisplay');

  skeletonCheck.addEventListener('change', () => {
    const enabled = skeletonCheck.checked;
    movementGroup.visible = enabled;
    dialMesh.material.transparent = enabled;
    dialMesh.material.opacity = enabled ? 0.16 : 1;
  });

  realTimeCheck.addEventListener('change', () => {
    if (realTimeCheck.checked) {
      demoSeconds = 0;
    }
  });

  window.addEventListener('resize', onResize);
  onResize();
}

function onResize() {
  const canvas = document.getElementById('watchCanvas');
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function animate(now) {
  requestAnimationFrame(animate);
  lastFrame = lastFrame || now;

  const t = getTime();
  updateHands(t);
  if (movementGroup.visible) {
    updateMovement(t);
  }

  const displayHours = realTimeCheck.checked ? new Date().getHours() : Math.floor(t.hours);
  timeDisplay.textContent = `${String(displayHours).padStart(2, '0')}:${String(Math.floor(t.minutes)).padStart(2, '0')}:${String(Math.floor(t.seconds)).padStart(2, '0')}`;

  controls.update();
  renderer.render(scene, camera);
  lastFrame = now;
}

initScene();
requestAnimationFrame(animate);
