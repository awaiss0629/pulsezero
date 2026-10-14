import React, { useEffect, useRef } from 'react';

export default function Oscilloscope({ val, label, color = '#00f0ff' }) {
  const canvasRef = useRef(null);
  const historyRef = useRef(new Array(60).fill(10));

  useEffect(() => {
    // Push new value into history
    const clamped = Math.max(5, Math.min(95, val || 10));
    historyRef.current.push(clamped);
    if (historyRef.current.length > 60) {
      historyRef.current.shift();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 10; y < height; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Gradient fill under wave
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `${color}44`);
    gradient.addColorStop(1, `${color}00`);

    ctx.beginPath();
    const step = width / (historyRef.current.length - 1);
    
    // Draw smooth path
    historyRef.current.forEach((pt, i) => {
      const x = i * step;
      const y = height - (pt / 100) * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();

    // Fill underneath
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [val, color]);

  return (
    <div className="oscilloscope-wrap">
      <div className="oscilloscope-label">{label}</div>
      <canvas ref={canvasRef} width={280} height={55} className="oscilloscope-canvas" />
    </div>
  );
}
