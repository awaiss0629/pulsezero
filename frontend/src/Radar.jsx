import React, { useEffect, useRef } from 'react';

export default function Radar({ activeThreat }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;
    let animationFrameId;

    // Simulated blips
    const blips = [
      { r: 50, theta: 0.8, color: '#00ff88', size: 3 },
      { r: 85, theta: 2.4, color: '#00f0ff', size: 4 },
      { r: 110, theta: 4.1, color: '#00f0ff', size: 3 },
      { r: 35, theta: 5.2, color: '#00ff88', size: 2 },
    ];

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(cx, cy) - 10;

      ctx.clearRect(0, 0, width, height);

      // Radar Background & Grid
      ctx.strokeStyle = activeThreat?.active ? 'rgba(255, 42, 95, 0.25)' : 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;

      // Concentric Circles
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (maxRadius / 4) * i, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - maxRadius, cy);
      ctx.lineTo(cx + maxRadius, cy);
      ctx.moveTo(cx, cy - maxRadius);
      ctx.lineTo(cx, cy + maxRadius);
      ctx.stroke();

      // Sweeping beam
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const beamColor = activeThreat?.active ? 'rgba(255, 42, 95, ' : 'rgba(0, 240, 255, ';
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
      grad.addColorStop(0, beamColor + '0.4)');
      grad.addColorStop(1, beamColor + '0.0)');

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxRadius, -0.35, 0);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Beam lead line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxRadius, 0);
      ctx.strokeStyle = activeThreat?.active ? '#ff2a5f' : '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      // Draw blips
      blips.forEach((b) => {
        const bx = cx + b.r * Math.cos(b.theta);
        const by = cy + b.r * Math.sin(b.theta);

        ctx.beginPath();
        ctx.arc(bx, by, b.size, 0, Math.PI * 2);
        ctx.fillStyle = activeThreat?.active ? '#ffaa00' : b.color;
        ctx.shadowColor = activeThreat?.active ? '#ffaa00' : b.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // If active threat, draw alarming pulsing threat blip in red
      if (activeThreat?.active) {
        const tx = cx + 75 * Math.cos(1.2);
        const ty = cy + 75 * Math.sin(1.2);
        const pulse = Math.sin(Date.now() / 150) * 4 + 7;

        ctx.beginPath();
        ctx.arc(tx, ty, pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#ff2a5f';
        ctx.shadowColor = '#ff2a5f';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ff2a5f';
        ctx.fillText(`THREAT: ${activeThreat.name}`, tx + 12, ty + 3);
      }

      angle += 0.035;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [activeThreat]);

  return (
    <div className="radar-container">
      <div className="radar-header">
        <span className="radar-title">DEFENSE SECTOR RADAR</span>
        <span className="radar-status">{activeThreat?.active ? 'HOSTILE BLIP' : 'SURVEILLANCE OK'}</span>
      </div>
      <canvas ref={canvasRef} width={260} height={260} className="radar-canvas" />
    </div>
  );
}
