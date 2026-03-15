// generate-icons.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 生成 SVG 内容（渐变背景 + 相机图标 + 彩色光谱条）
function generateSVG(size) {
  const r = size / 2;
  const padding = size * 0.12;
  const camW = size * 0.55;
  const camH = size * 0.40;
  const camX = (size - camW) / 2;
  const camY = (size - camH) / 2 - size * 0.04;
  const lensR = size * 0.13;
  const barH = size * 0.07;
  const barY = camY + camH + size * 0.06;
  const barW = size * 0.65;
  const barX = (size - barW) / 2;
  const cornerR = size * 0.22;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e1b4b"/>
      <stop offset="100%" style="stop-color:#312e81"/>
    </linearGradient>
    <linearGradient id="spectrum" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   style="stop-color:#f43f5e"/>
      <stop offset="25%"  style="stop-color:#f59e0b"/>
      <stop offset="50%"  style="stop-color:#22c55e"/>
      <stop offset="75%"  style="stop-color:#3b82f6"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
    <clipPath id="roundRect">
      <rect width="${size}" height="${size}" rx="${cornerR}" ry="${cornerR}"/>
    </clipPath>
  </defs>
  <!-- 背景 -->
  <rect width="${size}" height="${size}" rx="${cornerR}" ry="${cornerR}" fill="url(#bg)"/>
  <!-- 相机机身 -->
  <rect x="${camX}" y="${camY}" width="${camW}" height="${camH}"
        rx="${size * 0.05}" ry="${size * 0.05}"
        fill="none" stroke="white" stroke-width="${size * 0.04}" stroke-linejoin="round"/>
  <!-- 镜头圆 -->
  <circle cx="${r}" cy="${camY + camH / 2 + size * 0.01}" r="${lensR}"
          fill="none" stroke="white" stroke-width="${size * 0.04}"/>
  <!-- 取景器小方块 -->
  <rect x="${camX + size * 0.07}" y="${camY - size * 0.065}" 
        width="${size * 0.15}" height="${size * 0.07}"
        rx="${size * 0.02}" ry="${size * 0.02}" fill="white" opacity="0.9"/>
  <!-- 彩色调色光谱条 -->
  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}"
        rx="${barH / 2}" ry="${barH / 2}" fill="url(#spectrum)"/>
</svg>`;
}

// 将 SVG 写为文件（以 .svg 备用），并生成 data URI 嵌入 HTML 供浏览器截图
// 由于纯 Node.js 无法直接将 SVG 光栅化为 PNG（没有安装 sharp/canvas），
// 我们生成一个自动截图页面，或者直接用 SVG 作为图标（现代浏览器支持）

let allSVGs = '';
sizes.forEach(size => {
  const svg = generateSVG(size);
  const svgPath = path.join(outDir, `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svg, 'utf8');
  console.log(`✓ 生成 icon-${size}.svg`);
  allSVGs += `<div style="display:inline-block;margin:8px;text-align:center">
    <img src="icons/icon-${size}.svg" width="${Math.min(size,128)}" height="${Math.min(size,128)}" style="display:block;border-radius:22%;border:1px solid #ccc"/>
    <div style="font-size:12px;margin-top:4px">${size}×${size}</div>
  </div>`;
});

// 同时更新 manifest.json 使用 SVG 图标（现代安卓 Chrome 支持）
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'manifest.json'), 'utf8'));
manifest.icons = sizes.map(size => ({
  src: `/icons/icon-${size}.svg`,
  sizes: `${size}x${size}`,
  type: 'image/svg+xml',
  purpose: 'any maskable'
}));
// 保留一个 PNG 声明（万一有不支持 SVG 图标的设备）
// 实际上现代安卓 Chrome 完全支持 SVG 图标
fs.writeFileSync(path.join(__dirname, 'public', 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log('✓ 更新 manifest.json（使用 SVG 图标）');

// 生成预览页
const preview = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>PWA 图标预览</title>
<style>body{font-family:sans-serif;background:#1e1b4b;color:white;padding:20px;}h2{margin-bottom:16px;}</style>
</head><body>
<h2>🎨 ColorMatch PWA 图标预览</h2>
<div>${allSVGs}</div>
</body></html>`;
fs.writeFileSync(path.join(__dirname, 'public', 'icon-preview.html'), preview, 'utf8');
console.log('✓ 生成图标预览页: public/icon-preview.html');
console.log('\n所有图标已生成完毕！');
