import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  drift: number;
};

const OodaInteractiveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrame = 0;
    let lastFrame = 0;
    let particles: Particle[] = [];

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const pointer = {
      x: window.innerWidth * 0.68,
      y: window.innerHeight * 0.42,
      active: false,
    };

    const makeParticles = () => {
      const count = Math.min(
        62,
        Math.max(28, Math.floor((width * height) / 30000)),
      );

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        radius: 0.8 + Math.random() * 1.8,
        drift: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeParticles();
    };

    const drawBackground = () => {
      const base = context.createLinearGradient(0, 0, width, height);
      base.addColorStop(0, "#080C0A");
      base.addColorStop(0.52, "#0D1210");
      base.addColorStop(1, "#170A0A");
      context.fillStyle = base;
      context.fillRect(0, 0, width, height);

      const glowX = pointer.active ? pointer.x : width * 0.68;
      const glowY = pointer.active ? pointer.y : height * 0.42;
      const glowRadius = Math.max(width, height) * 0.42;
      const glow = context.createRadialGradient(
        glowX,
        glowY,
        0,
        glowX,
        glowY,
        glowRadius,
      );
      glow.addColorStop(0, "rgba(80, 0, 0, 0.34)");
      glow.addColorStop(0.34, "rgba(80, 0, 0, 0.16)");
      glow.addColorStop(1, "rgba(80, 0, 0, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      const wheatGlow = context.createRadialGradient(
        width * 0.18,
        height * 0.82,
        0,
        width * 0.18,
        height * 0.82,
        Math.max(width, height) * 0.34,
      );
      wheatGlow.addColorStop(0, "rgba(239, 214, 172, 0.07)");
      wheatGlow.addColorStop(1, "rgba(239, 214, 172, 0)");
      context.fillStyle = wheatGlow;
      context.fillRect(0, 0, width, height);
    };

    const drawParticles = (timestamp: number) => {
      const maxConnectionDistance = 142;

      particles.forEach((particle, index) => {
        if (!reducedMotion) {
          particle.drift += 0.004;
          particle.x += particle.vx + Math.cos(particle.drift) * 0.025;
          particle.y += particle.vy + Math.sin(particle.drift) * 0.025;

          if (particle.x < -20) particle.x = width + 20;
          if (particle.x > width + 20) particle.x = -20;
          if (particle.y < -20) particle.y = height + 20;
          if (particle.y > height + 20) particle.y = -20;

          if (pointer.active) {
            const dx = pointer.x - particle.x;
            const dy = pointer.y - particle.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 0 && distance < 210) {
              const pull = (1 - distance / 210) * 0.018;
              particle.x += (dx / distance) * pull * 8;
              particle.y += (dy / distance) * pull * 8;
            }
          }
        }

        for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex++) {
          const other = particles[otherIndex];
          const distance = Math.hypot(
            particle.x - other.x,
            particle.y - other.y,
          );

          if (distance < maxConnectionDistance) {
            const alpha =
              (1 - distance / maxConnectionDistance) *
              (0.07 + Math.sin(timestamp / 1800) * 0.01);
            context.strokeStyle = `rgba(239, 214, 172, ${Math.max(
              alpha,
              0.02,
            )})`;
            context.lineWidth = 0.65;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }

        context.fillStyle = "rgba(239, 214, 172, 0.72)";
        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2,
        );
        context.fill();
      });

      if (pointer.active) {
        const halo = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          92,
        );
        halo.addColorStop(0, "rgba(239, 214, 172, 0.13)");
        halo.addColorStop(1, "rgba(239, 214, 172, 0)");
        context.fillStyle = halo;
        context.beginPath();
        context.arc(pointer.x, pointer.y, 92, 0, Math.PI * 2);
        context.fill();
      }
    };

    const render = (timestamp: number) => {
      if (!reducedMotion && timestamp - lastFrame < 33) {
        animationFrame = window.requestAnimationFrame(render);
        return;
      }

      lastFrame = timestamp;
      context.clearRect(0, 0, width, height);
      drawBackground();
      drawParticles(timestamp);

      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    if (reducedMotion) {
      render(0);
    } else {
      animationFrame = window.requestAnimationFrame(render);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export default OodaInteractiveBackground;
