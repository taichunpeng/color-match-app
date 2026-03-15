import { useEffect, useRef } from 'react';

/**
 * 直方图显示组件
 */
export function Histogram({ data, color, label }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 背景
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, h);

    // 绘制直方图
    const barW = w / data.length;
    const colors = {
      r: 'rgba(248, 113, 113, 0.8)',
      g: 'rgba(74, 222, 128, 0.8)',
      b: 'rgba(96, 165, 250, 0.8)',
      lum: 'rgba(200, 200, 220, 0.7)',
    };

    ctx.fillStyle = colors[color] || colors.lum;
    data.forEach((val, i) => {
      const barH = val * h * 0.92;
      ctx.fillRect(i * barW, h - barH, barW - 0.5, barH);
    });
  }, [data, color]);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      <canvas
        ref={canvasRef}
        width={128}
        height={48}
        className="rounded w-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}

/**
 * 色调曲线可视化
 */
export function ToneCurve({ points, color = 'white', width = 180, height = 180 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!points || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const pad = 10;
    const cw = w - pad * 2, ch = h - pad * 2;

    // 背景
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, w, h);

    // 网格
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(pad + cw * i / 4, pad);
      ctx.lineTo(pad + cw * i / 4, pad + ch);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pad, pad + ch * i / 4);
      ctx.lineTo(pad + cw, pad + ch * i / 4);
      ctx.stroke();
    }

    // 对角参考线
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.moveTo(pad, pad + ch);
    ctx.lineTo(pad + cw, pad);
    ctx.stroke();

    // 曲线
    const colorMap = { white: '#d0d0e0', r: '#f87171', g: '#4ade80', b: '#60a5fa' };
    ctx.strokeStyle = colorMap[color] || colorMap.white;
    ctx.lineWidth = 2;
    ctx.beginPath();

    points.forEach(([x, y], i) => {
      const cx = pad + (x / 255) * cw;
      const cy = pad + ch - (y / 255) * ch;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();

    // 控制点
    ctx.fillStyle = colorMap[color] || colorMap.white;
    points.forEach(([x, y]) => {
      const cx = pad + (x / 255) * cw;
      const cy = pad + ch - (y / 255) * ch;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    });

  }, [points, color]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg"
      style={{ width: '100%', maxWidth: width }}
    />
  );
}

/**
 * 调色参数数值条
 */
export function ParamBar({ label, value, min = -100, max = 100, unit = '' }) {
  const range = max - min;
  const percentage = ((value - min) / range) * 100;
  const isPositive = value >= 0;
  const centerPct = ((0 - min) / range) * 100;

  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-xs text-gray-500 w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 relative h-1.5 bg-dark-500 rounded-full overflow-hidden">
        {/* 中心点 */}
        <div
          className="absolute top-0 bottom-0 w-px bg-white/20"
          style={{ left: `${centerPct}%` }}
        />
        {/* 数值条 */}
        <div
          className={`absolute top-0 bottom-0 rounded-full transition-all duration-700
            ${isPositive ? 'bg-gradient-to-r from-violet-500 to-blue-400' : 'bg-gradient-to-l from-orange-500 to-red-400'}`}
          style={{
            left: isPositive ? `${centerPct}%` : `${percentage}%`,
            width: `${Math.abs(percentage - centerPct)}%`,
          }}
        />
      </div>
      <span className={`text-xs font-mono w-12 text-right flex-shrink-0
        ${value > 0 ? 'text-violet-400' : value < 0 ? 'text-orange-400' : 'text-gray-500'}`}>
        {value > 0 ? '+' : ''}{value}{unit}
      </span>
    </div>
  );
}

/**
 * 颜色色块展示
 */
export function ColorSwatch({ color, label, size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const hex = `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`${sizes[size]} rounded-xl border-2 border-white/10 shadow-lg`}
        style={{ backgroundColor: hex }}
        title={hex}
      />
      {label && <span className="text-xs text-gray-500">{label}</span>}
      <span className="text-xs text-gray-600 font-mono">{hex}</span>
    </div>
  );
}
