(function () {
  'use strict';

  const canvas = document.getElementById('watch');
  const ctx = canvas.getContext('2d');
  const skeletonCheck = document.getElementById('skeleton');
  const realTimeCheck = document.getElementById('realTime');
  const timeDisplay = document.getElementById('timeDisplay');

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const size = 520;
  const center = size / 2;
  const watchRadius = 200;
  let demoSeconds = 0;
  let lastTime = 0;

  function setSize() {
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getTime() {
    if (realTimeCheck.checked) {
      const d = new Date();
      return {
        hours: d.getHours() % 12 + d.getMinutes() / 60 + d.getSeconds() / 3600,
        minutes: d.getMinutes() + d.getSeconds() / 60,
        seconds: d.getSeconds() + (d.getMilliseconds() || 0) / 1000
      };
    }
    demoSeconds += (performance.now() - lastTime) / 1000;
    lastTime = performance.now();
    const s = demoSeconds % 60;
    const m = (Math.floor(demoSeconds / 60)) % 60;
    const h = (Math.floor(demoSeconds / 3600)) % 12 + m / 60 + s / 3600;
    return { hours: h, minutes: m, seconds: s };
  }

  function drawGear(cx, cy, outerR, teeth, rotation, color1, color2) {
    const innerR = outerR * 0.6;
    const toothH = (outerR - innerR) * 0.9;
    const step = (2 * Math.PI) / teeth;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);

    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a1 = i * step;
      const a2 = a1 + step * 0.35;
      const a3 = a1 + step * 0.65;
      const a4 = a1 + step;
      const r1 = innerR;
      const r2 = outerR;
      ctx.moveTo(Math.cos(a1) * r2, Math.sin(a1) * r2);
      ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
      ctx.lineTo(Math.cos(a2) * r1, Math.sin(a2) * r1);
      ctx.lineTo(Math.cos(a3) * r1, Math.sin(a3) * r1);
      ctx.lineTo(Math.cos(a3) * r2, Math.sin(a3) * r2);
      ctx.lineTo(Math.cos(a4) * r2, Math.sin(a4) * r2);
    }
    ctx.closePath();
    ctx.fillStyle = color1;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, innerR * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = color2;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.stroke();

    ctx.restore();
  }

  function drawBalanceWheel(cx, cy, rotation, color1, color2) {
    const r = 28;
    const rim = 4;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);

    ctx.beginPath();
    ctx.arc(0, 0, r + rim, 0, Math.PI * 2);
    ctx.arc(0, 0, r, 0, Math.PI * 2, true);
    ctx.fillStyle = color1;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
      const a = (i * 90 * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r - 6), Math.sin(a) * (r - 6));
      ctx.lineTo(Math.cos(a) * (r + 2), Math.sin(a) * (r + 2));
      ctx.strokeStyle = color2;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = color2;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function drawMovementPlate() {
    const r = watchRadius - 12;
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, r, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(center, center, 0, center, center, r);
    g.addColorStop(0, 'rgba(40, 38, 35, 0.92)');
    g.addColorStop(0.6, 'rgba(28, 26, 24, 0.95)');
    g.addColorStop(1, 'rgba(18, 16, 14, 0.98)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const holeR = 8;
    const holes = [
      [center, center],
      [center, center + 55],
      [center - 42, center + 18],
      [center + 48, center - 25],
      [center + 38, center + 42]
    ];
    ctx.fillStyle = 'rgba(10, 9, 8, 0.9)';
    holes.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, holeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(201, 162, 39, 0.2)';
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawCaseAndDial(t) {
    const r = watchRadius;
    const cx = center;
    const cy = center;

    const caseGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r * 1.1);
    caseGrad.addColorStop(0, '#3a3640');
    caseGrad.addColorStop(0.4, '#2a2630');
    caseGrad.addColorStop(0.8, '#1a161c');
    caseGrad.addColorStop(1, '#0e0c10');

    ctx.beginPath();
    ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
    if (skeletonCheck.checked) {
      ctx.arc(cx, cy, r - 10, 0, Math.PI * 2, true);
    }
    ctx.fillStyle = caseGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const dialAlpha = skeletonCheck.checked ? 0.3 : 1;
    const dialGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r - 8);
    dialGrad.addColorStop(0, `rgba(220, 215, 205, ${dialAlpha})`);
    dialGrad.addColorStop(0.7, `rgba(200, 195, 185, ${dialAlpha})`);
    dialGrad.addColorStop(1, `rgba(180, 175, 165, ${dialAlpha})`);

    ctx.beginPath();
    ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
    ctx.fillStyle = dialGrad;
    ctx.fill();
    if (!skeletonCheck.checked) {
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let i = 1; i <= 12; i++) {
      const a = ((i - 3) * 30 * Math.PI) / 180;
      const R = r - 18;
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R;
      ctx.save();
      ctx.globalAlpha = dialAlpha;
      ctx.font = i === 12 ? 'bold 18px Cormorant Garamond' : '16px Cormorant Garamond';
      ctx.fillStyle = '#1a1816';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i), x, y);
      ctx.restore();
    }

    const tickR = r - 10;
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const a = ((i - 15) * 6 * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (tickR - 4), cy + Math.sin(a) * (tickR - 4));
      ctx.lineTo(cx + Math.cos(a) * tickR, cy + Math.sin(a) * tickR);
      ctx.strokeStyle = `rgba(0,0,0,${0.25 * dialAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  function drawHands(t) {
    const cx = center;
    const cy = center;
    const r = watchRadius - 28;

    const secA = ((t.seconds - 15) * 6 * Math.PI) / 180;
    const minA = ((t.minutes - 15) * 6 * Math.PI) / 180;
    const hourA = ((t.hours - 3) * 30 * Math.PI) / 180;

    ctx.save();

    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(hourA) * (r * 0.5), cy + Math.sin(hourA) * (r * 0.5));
    ctx.strokeStyle = '#1a1816';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(minA) * (r * 0.78), cy + Math.sin(minA) * (r * 0.78));
    ctx.strokeStyle = '#1a1816';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(secA) * (r * 0.88), cy + Math.sin(secA) * (r * 0.88));
    ctx.strokeStyle = '#8b1a1a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#c9a227';
    ctx.fill();
    ctx.strokeStyle = '#1a1816';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  function drawCrystal() {
    const r = watchRadius;
    const cx = center;
    const cy = center;
    const grad = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(255,255,255,0.12)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.02)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, size, size);

    const t = getTime();

    if (skeletonCheck.checked) {
      drawMovementPlate();
      const secDeg = t.seconds * 6;
      const minDeg = t.minutes * 6;
      const hourDeg = t.hours * 30;
      const balanceDeg = 35 * Math.sin(t.seconds * Math.PI * 2 * (5/3));

      drawGear(center, center, 42, 60, -minDeg, '#c9a227', '#8b7320');
      drawGear(center, center + 55, 22, 20, secDeg, '#6b5344', '#5a4838');
      drawGear(center - 42, center + 18, 18, 16, -minDeg * 2.2, '#8b7355', '#6b5344');
      drawGear(center + 48, center - 25, 16, 15, secDeg * 1.8, '#4a7c59', '#3d6b4a');
      drawBalanceWheel(center + 38, center + 42, balanceDeg, '#2a3540', '#3d6b8a');
    }

    drawCaseAndDial(t);
    drawHands(t);
    drawCrystal();

    const sec = Math.floor(t.seconds);
    const min = Math.floor(t.minutes);
    let hh;
    if (realTimeCheck.checked) {
      const d = new Date();
      hh = d.getHours();
      timeDisplay.textContent =
        String(hh).padStart(2, '0') + ':' +
        String(min).padStart(2, '0') + ':' +
        String(sec).padStart(2, '0');
    } else {
      hh = Math.floor(t.hours) % 12;
      timeDisplay.textContent =
        String(hh).padStart(2, '0') + ':' +
        String(min).padStart(2, '0') + ':' +
        String(sec).padStart(2, '0');
    }
  }

  function loop(now) {
    lastTime = lastTime || now;
    draw();
    lastTime = now;
    requestAnimationFrame(loop);
  }

  skeletonCheck.addEventListener('change', draw);
  realTimeCheck.addEventListener('change', function () {
    if (this.checked) demoSeconds = 0;
    draw();
  });

  setSize();
  window.addEventListener('resize', setSize);
  requestAnimationFrame(loop);
})();
