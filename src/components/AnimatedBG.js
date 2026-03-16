import React, { useEffect, useRef } from 'react';

const AnimatedBG = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, frameCount = 0;
    let ecgX = -200, ecgPoints = [];
    let particles = [];

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.r = Math.random() * 2 + 0.8;
        this.alpha = Math.random() * 0.5 + 0.15;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.018 + 0.008;
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.pulse += this.pulseSpeed;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
      }
      draw() {
        const a = this.alpha + Math.sin(this.pulse) * 0.12;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,179,237,${a})`; ctx.fill();
      }
    }
    for (let i = 0; i < 80; i++) particles.push(new Particle());

    function getECGY(x, baseY) {
      const seg = (x / canvas.width * 10) % 10;
      if (seg > 3 && seg < 3.08) return baseY - 70;
      if (seg > 3.08 && seg < 3.18) return baseY + 18;
      if (seg > 3.18 && seg < 3.55) return baseY - 110;
      if (seg > 3.55 && seg < 3.82) return baseY + 14;
      if (seg > 3.82 && seg < 4.1) return baseY - 28;
      return baseY + Math.sin(x * 0.018) * 5;
    }

    const animate = () => {
      frameCount++;
      // Deep dark base
      ctx.fillStyle = 'rgba(4,12,30,0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated orbs
      const orbs = [
        { fx: 0.15, fy: 0.3,  r: 350, c: 'rgba(37,99,235,0.09)',   dx: 0.004, dy: 0.003 },
        { fx: 0.85, fy: 0.65, r: 280, c: 'rgba(6,182,212,0.07)',    dx: 0.005, dy: 0.004 },
        { fx: 0.5,  fy: 0.08, r: 220, c: 'rgba(16,185,129,0.05)',   dx: 0.003, dy: 0.006 },
        { fx: 0.75, fy: 0.15, r: 180, c: 'rgba(99,102,241,0.06)',   dx: 0.006, dy: 0.003 },
      ];
      orbs.forEach((o, i) => {
        const ox = canvas.width  * o.fx + Math.sin(frameCount * o.dx + i * 1.3) * 55;
        const oy = canvas.height * o.fy + Math.cos(frameCount * o.dy + i * 0.9) * 45;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        g.addColorStop(0, o.c); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Particle network
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx*dx+dy*dy);
          if (d < 130) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56,189,248,${0.18*(1-d/130)})`;
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
        particles[i].update(); particles[i].draw();
      }

      // ECG line
      const baseY = canvas.height * 0.72;
      ecgX += 1.4;
      if (ecgX > canvas.width + 200) { ecgX = -200; ecgPoints = []; }
      ecgPoints.push({ x: ecgX, y: getECGY(ecgX, baseY) });
      if (ecgPoints.length > 450) ecgPoints.shift();
      if (ecgPoints.length > 2) {
        ctx.beginPath(); ctx.moveTo(ecgPoints[0].x, ecgPoints[0].y);
        for (let i = 1; i < ecgPoints.length; i++) ctx.lineTo(ecgPoints[i].x, ecgPoints[i].y);
        const grad = ctx.createLinearGradient(ecgPoints[0].x, 0, ecgX, 0);
        grad.addColorStop(0, 'rgba(56,189,248,0)');
        grad.addColorStop(0.65, 'rgba(56,189,248,0.35)');
        grad.addColorStop(1, 'rgba(56,189,248,0.9)');
        ctx.strokeStyle = grad; ctx.lineWidth = 2;
        ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(56,189,248,0.5)';
        ctx.stroke(); ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(animate);
    };

    // Initial dark fill
    ctx.fillStyle = '#04081e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, width: '100%', height: '100%',
      zIndex: 0, pointerEvents: 'none', background: '#04081e'
    }} />
  );
};

export default AnimatedBG;
