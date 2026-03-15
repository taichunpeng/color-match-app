/**
 * 颜色分析引擎
 * 从图像中提取调色参数，生成 Lightroom 兼容的调色数据
 */

// RGB 转 HSL
export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

// RGB 转 Lab (近似)
export function rgbToLab(r, g, b) {
  // sRGB to linear
  let R = r / 255, G = g / 255, B = b / 255;
  R = R > 0.04045 ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
  G = G > 0.04045 ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
  B = B > 0.04045 ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;

  // to XYZ (D65)
  let X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  let Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
  let Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041;

  X /= 0.95047; Z /= 1.08883;
  const f = v => v > 0.008856 ? Math.cbrt(v) : (7.787 * v + 16 / 116);
  const fX = f(X), fY = f(Y), fZ = f(Z);

  return [116 * fY - 16, 500 * (fX - fY), 200 * (fY - fZ)];
}

// 计算亮度
export function getLuminance(r, g, b) {
  return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
}

/**
 * 从 canvas 像素数据中分析色彩
 * @param {HTMLCanvasElement} canvas
 * @returns {Object} 分析结果
 */
export function analyzeImageColors(canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const pixels = imageData.data;

  // 采样（每8像素取一个）
  const step = 8;
  let rSum = 0, gSum = 0, bSum = 0;
  let rMin = 255, gMin = 255, bMin = 255;
  let rMax = 0, gMax = 0, bMax = 0;
  let count = 0;

  // 直方图桶（0-255 分成 32 段）
  const buckets = 32;
  const rHist = new Array(buckets).fill(0);
  const gHist = new Array(buckets).fill(0);
  const bHist = new Array(buckets).fill(0);
  const lumHist = new Array(buckets).fill(0);

  // 色相分布
  const hueCount = new Array(12).fill(0); // 12个色相区间

  // 分区域采样：暗部/中间调/亮部
  let darkPixels = [], midPixels = [], brightPixels = [];
  let shadowRGB = { r: 0, g: 0, b: 0, n: 0 };
  let midtoneRGB = { r: 0, g: 0, b: 0, n: 0 };
  let highlightRGB = { r: 0, g: 0, b: 0, n: 0 };

  for (let i = 0; i < pixels.length; i += 4 * step) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    rSum += r; gSum += g; bSum += b;
    rMin = Math.min(rMin, r); gMin = Math.min(gMin, g); bMin = Math.min(bMin, b);
    rMax = Math.max(rMax, r); gMax = Math.max(gMax, g); bMax = Math.max(bMax, b);

    const bIdx = Math.floor;
    rHist[Math.floor(r / 256 * buckets)]++;
    gHist[Math.floor(g / 256 * buckets)]++;
    bHist[Math.floor(b / 256 * buckets)]++;

    const lum = getLuminance(r, g, b);
    lumHist[Math.floor(lum * (buckets - 1))]++;

    const [h, s] = rgbToHsl(r, g, b);
    if (s > 10) {
      hueCount[Math.floor(h / 30) % 12]++;
    }

    if (lum < 0.25) {
      shadowRGB.r += r; shadowRGB.g += g; shadowRGB.b += b; shadowRGB.n++;
    } else if (lum < 0.65) {
      midtoneRGB.r += r; midtoneRGB.g += g; midtoneRGB.b += b; midtoneRGB.n++;
    } else {
      highlightRGB.r += r; highlightRGB.g += g; highlightRGB.b += b; highlightRGB.n++;
    }

    count++;
  }

  const avgR = Math.round(rSum / count);
  const avgG = Math.round(gSum / count);
  const avgB = Math.round(bSum / count);
  const avgLum = getLuminance(avgR, avgG, avgB);

  // 归一化直方图
  const normalize = arr => {
    const m = Math.max(...arr) || 1;
    return arr.map(v => v / m);
  };

  // 计算主色相
  const maxHueIdx = hueCount.indexOf(Math.max(...hueCount));
  const hueNames = ['红', '橙红', '橙', '黄橙', '黄', '黄绿', '绿', '青绿', '青', '蓝', '紫蓝', '紫'];
  const dominantHue = hueNames[maxHueIdx];

  // 色彩偏向分析
  const colorBias = {
    warm: avgR > avgB ? (avgR - avgB) / 255 : 0,
    cool: avgB > avgR ? (avgB - avgR) / 255 : 0,
    green: avgG > (avgR + avgB) / 2 ? (avgG - (avgR + avgB) / 2) / 255 : 0,
  };

  // 对比度分析
  const lumValues = [];
  for (let i = 0; i < pixels.length; i += 4 * 16) {
    lumValues.push(getLuminance(pixels[i], pixels[i + 1], pixels[i + 2]));
  }
  lumValues.sort((a, b) => a - b);
  const p5 = lumValues[Math.floor(lumValues.length * 0.05)];
  const p95 = lumValues[Math.floor(lumValues.length * 0.95)];
  const contrast = p95 - p5;

  // 饱和度分析
  let satSum = 0, satCount = 0;
  for (let i = 0; i < pixels.length; i += 4 * step) {
    const [, s] = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2]);
    satSum += s; satCount++;
  }
  const avgSat = satSum / satCount;

  // 暗部/中间调/亮部平均色
  const getAvgColor = zone => zone.n > 0
    ? { r: Math.round(zone.r / zone.n), g: Math.round(zone.g / zone.n), b: Math.round(zone.b / zone.n) }
    : { r: 0, g: 0, b: 0 };

  return {
    avgColor: { r: avgR, g: avgG, b: avgB },
    avgLuminance: avgLum,
    avgSaturation: avgSat,
    contrast,
    dominantHue,
    colorBias,
    histogram: {
      r: normalize(rHist),
      g: normalize(gHist),
      b: normalize(bHist),
      lum: normalize(lumHist),
    },
    toneZones: {
      shadow: getAvgColor(shadowRGB),
      midtone: getAvgColor(midtoneRGB),
      highlight: getAvgColor(highlightRGB),
    },
    hueDistribution: hueCount.map(v => v / (Math.max(...hueCount) || 1)),
  };
}

/**
 * 根据图像分析数据生成 Lightroom 调色参数
 */
export function generateLightroomParams(analysis) {
  const { avgColor, avgLuminance, avgSaturation, contrast, colorBias, toneZones } = analysis;

  // === 基础面板 ===
  // 曝光：基于平均亮度调整
  const exposure = +(((avgLuminance - 0.45) * -2.5).toFixed(2));

  // 对比度：低对比度图像增加，高对比度图像减少
  const contrastAdj = Math.round((0.4 - contrast) * 60);

  // 高光/阴影
  const shadow = toneZones.shadow.r
    ? Math.round((getLuminance(toneZones.shadow.r, toneZones.shadow.g, toneZones.shadow.b) - 0.1) * 80)
    : 0;
  const highlight = toneZones.highlight.r
    ? Math.round((0.85 - getLuminance(toneZones.highlight.r, toneZones.highlight.g, toneZones.highlight.b)) * 80)
    : 0;

  // 白色/黑色
  const whites = Math.round(contrast > 0.6 ? -15 : 15);
  const blacks = Math.round(avgLuminance < 0.35 ? -20 : 0);

  // 清晰度：根据对比度
  const clarity = Math.round((contrast - 0.3) * 40);

  // 去朦胧
  const dehaze = colorBias.warm > 0.1 ? -5 : 5;

  // 鲜艳度 & 饱和度
  const vibrance = Math.round(30 - avgSaturation * 0.3);
  const saturation = Math.round((50 - avgSaturation) * 0.15);

  // === 色调曲线 ===
  // 根据色彩偏向生成 RGB 曲线偏移
  const curveShadowR = toneZones.shadow.r ? Math.round((toneZones.shadow.r - 30) * 0.3) : 0;
  const curveShadowG = toneZones.shadow.g ? Math.round((toneZones.shadow.g - 30) * 0.2) : 0;
  const curveShadowB = toneZones.shadow.b ? Math.round((toneZones.shadow.b - 30) * 0.3) : 0;
  const curveHighR = toneZones.highlight.r ? Math.round((toneZones.highlight.r - 220) * 0.2) : 0;
  const curveHighG = toneZones.highlight.g ? Math.round((toneZones.highlight.g - 220) * 0.15) : 0;
  const curveHighB = toneZones.highlight.b ? Math.round((toneZones.highlight.b - 220) * 0.2) : 0;

  // === HSL 色相饱和度明度 ===
  // 暖色偏移
  const hslOrangeHue = colorBias.warm > 0.05 ? Math.round(colorBias.warm * 15) : 0;
  const hslOrangeSat = Math.round(colorBias.warm * 20);
  const hslYellowHue = colorBias.warm > 0.05 ? -5 : 0;
  const hslBlueHue = colorBias.cool > 0.05 ? Math.round(colorBias.cool * 10) : 0;
  const hslBlueSat = Math.round(colorBias.cool * 15);

  // === 色彩分级（暗部/亮部偏色）===
  const shadowHue = (() => {
    const { r, g, b } = toneZones.shadow;
    if (b > r && b > g) return 220; // 冷蓝
    if (r > b && r > g) return 30;  // 暖橙
    if (g > r && g > b) return 120; // 绿
    return 0;
  })();
  const shadowSat = Math.round(Math.min(Math.abs(toneZones.shadow.r - toneZones.shadow.b) / 255 * 25, 25));

  const highlightHue = (() => {
    const { r, g, b } = toneZones.highlight;
    if (r > b + 5) return 40;   // 暖高光
    if (b > r + 5) return 210;  // 冷高光
    return 60;
  })();
  const highlightSat = Math.round(Math.min(Math.abs(toneZones.highlight.r - toneZones.highlight.b) / 255 * 20, 20));

  // 色温：映射到 Lightroom 绝对开尔文值范围 2000~9000K
  // 中性图像(r≈b) → 5500K (日光)
  // 暖色(r>b) → 更高K值(暖白/白炽灯方向)，但LR中高K=暖，低K=冷
  // avgColor.r - avgColor.b 范围约 -200~+200，映射到 ±2000K 偏移
  const tempBias = (avgColor.r - avgColor.b); // 正=暖，负=冷
  const tempKelvin = Math.round(5500 + tempBias * 10); // 每单位色差对应10K
  const temp = Math.max(2000, Math.min(9000, tempKelvin));

  // 色调(Tint)：LR中 -150~+150，负=偏绿，正=偏品红
  // avgG 高于 RB 均值时图像偏绿，需要正Tint（加品红）修正
  const tintBias = avgColor.g - (avgColor.r + avgColor.b) / 2;
  const tint = Math.max(-150, Math.min(150, Math.round(tintBias * -0.5)));

  return {
    // 基础
    Temperature: temp,
    Tint: tint,
    Exposure: Math.max(-5, Math.min(5, exposure)),
    Contrast: Math.max(-100, Math.min(100, contrastAdj)),
    Highlights: Math.max(-100, Math.min(100, highlight)),
    Shadows: Math.max(-100, Math.min(100, shadow)),
    Whites: Math.max(-100, Math.min(100, whites)),
    Blacks: Math.max(-100, Math.min(100, blacks)),
    Clarity: Math.max(-100, Math.min(100, clarity)),
    Dehaze: Math.max(-100, Math.min(100, dehaze)),
    Vibrance: Math.max(-100, Math.min(100, vibrance)),
    Saturation: Math.max(-100, Math.min(100, saturation)),

    // HSL
    HueAdjustmentRed: Math.round(colorBias.warm * 8),
    HueAdjustmentOrange: hslOrangeHue,
    HueAdjustmentYellow: hslYellowHue,
    HueAdjustmentGreen: colorBias.green > 0.05 ? -5 : 0,
    HueAdjustmentAqua: 0,
    HueAdjustmentBlue: hslBlueHue,
    HueAdjustmentPurple: 0,
    HueAdjustmentMagenta: 0,
    SaturationAdjustmentRed: Math.round(colorBias.warm * 15),
    SaturationAdjustmentOrange: hslOrangeSat,
    SaturationAdjustmentYellow: Math.round(colorBias.warm * 10),
    SaturationAdjustmentGreen: Math.round(colorBias.green * 20),
    SaturationAdjustmentAqua: 0,
    SaturationAdjustmentBlue: hslBlueSat,
    SaturationAdjustmentPurple: 0,
    SaturationAdjustmentMagenta: 0,
    LuminanceAdjustmentRed: 0,
    LuminanceAdjustmentOrange: Math.round(colorBias.warm * 5),
    LuminanceAdjustmentYellow: 0,
    LuminanceAdjustmentGreen: 0,
    LuminanceAdjustmentAqua: 0,
    LuminanceAdjustmentBlue: Math.round(colorBias.cool * -5),
    LuminanceAdjustmentPurple: 0,
    LuminanceAdjustmentMagenta: 0,

    // 色调曲线点
    ToneCurvePV2012: [
      [0, Math.max(0, blacks < 0 ? blacks + 5 : 0)],
      [64, 64 + Math.round(shadow / 3)],
      [128, 128],
      [192, 192 + Math.round(highlight / 3)],
      [255, 255],
    ],
    ToneCurvePV2012Red: [
      [0, Math.max(0, curveShadowR)],
      [128, 128 + Math.round(curveHighR / 2)],
      [255, Math.min(255, 255 + curveHighR)],
    ],
    ToneCurvePV2012Green: [
      [0, Math.max(0, curveShadowG)],
      [128, 128],
      [255, Math.min(255, 255 + curveHighG)],
    ],
    ToneCurvePV2012Blue: [
      [0, Math.max(0, curveShadowB)],
      [128, 128 + Math.round(curveHighB / 2)],
      [255, Math.min(255, 255 + curveHighB)],
    ],

    // 色彩分级
    ColorGradeShadowHue: shadowHue,
    ColorGradeShadowSat: shadowSat,
    ColorGradeHighlightHue: highlightHue,
    ColorGradeHighlightSat: highlightSat,
    ColorGradeMidtoneHue: 0,
    ColorGradeMidtoneSat: 0,
    ColorGradeBlending: 50,
    ColorGradeGlobalHue: 0,
    ColorGradeGlobalSat: 0,
    ColorGradeGlobalLum: 0,

    // 细节
    Sharpness: 40,
    SharpenRadius: 1.0,
    SharpenDetail: 25,
    SharpenEdgeMasking: 0,
    LuminanceSmoothing: 0,
    LuminanceNoiseReductionDetail: 50,
    ColorNoiseReduction: 25,
    ColorNoiseReductionDetail: 50,
    ColorNoiseReductionSmoothness: 50,
  };
}

/**
 * 分析图像整体风格并给出名称
 */
export function detectColorStyle(analysis, params) {
  const { avgLuminance, avgSaturation, contrast, colorBias, toneZones } = analysis;

  const styles = [];

  // 色调温度
  if (colorBias.warm > 0.08) styles.push('暖调');
  else if (colorBias.cool > 0.08) styles.push('冷调');
  else styles.push('中性');

  // 亮度风格
  if (avgLuminance > 0.65) styles.push('明亮');
  else if (avgLuminance < 0.3) styles.push('暗调');
  else styles.push('自然曝光');

  // 对比度
  if (contrast > 0.55) styles.push('高对比');
  else if (contrast < 0.25) styles.push('低对比');

  // 饱和度
  if (avgSaturation > 40) styles.push('高饱和');
  else if (avgSaturation < 15) styles.push('低饱和 / 胶片感');

  // 特殊风格检测
  const shadowB = toneZones.shadow.b;
  const shadowR = toneZones.shadow.r;
  const highR = toneZones.highlight.r;
  const highB = toneZones.highlight.b;

  if (shadowB > shadowR + 15 && highR > highB + 10) styles.push('橙青风格');
  if (avgSaturation < 10 && contrast > 0.4) styles.push('黑白风格');
  if (avgLuminance > 0.7 && avgSaturation < 20) styles.push('日系清淡');
  if (colorBias.warm > 0.1 && avgLuminance < 0.45) styles.push('复古胶片');

  const mainStyle = (() => {
    if (styles.includes('橙青风格')) return '🎬 好莱坞橙青风';
    if (styles.includes('黑白风格')) return '⬛ 黑白电影风';
    if (styles.includes('日系清淡')) return '🌸 日系小清新';
    if (styles.includes('复古胶片')) return '🎞 复古胶片风';
    if (styles.includes('暖调') && styles.includes('高对比')) return '🌅 暖色电影风';
    if (styles.includes('冷调') && styles.includes('高对比')) return '🌊 冷蓝科技风';
    if (styles.includes('暖调')) return '☀️ 温暖自然风';
    if (styles.includes('冷调')) return '❄️ 清冷淡雅风';
    return '📷 自然写实风';
  })();

  return {
    name: mainStyle,
    tags: styles,
    description: generateStyleDescription(styles, analysis),
  };
}

function generateStyleDescription(styles, analysis) {
  const { avgLuminance, avgSaturation, contrast } = analysis;
  const parts = [];

  if (styles.includes('暖调')) parts.push('整体色调偏暖，营造温馨舒适的视觉氛围');
  else if (styles.includes('冷调')) parts.push('整体色调偏冷，呈现清冽沉静的视觉质感');
  else parts.push('色温中性，还原自然真实的色彩');

  if (avgLuminance > 0.6) parts.push('曝光充足、画面明亮');
  else if (avgLuminance < 0.35) parts.push('低调暗沉、层次丰富');
  else parts.push('曝光自然均衡');

  if (contrast > 0.5) parts.push('对比强烈、黑白分明');
  else if (contrast < 0.3) parts.push('对比柔和、色调平缓');

  if (avgSaturation > 35) parts.push('色彩饱满鲜艳');
  else if (avgSaturation < 15) parts.push('饱和度低、呈现胶片质感');

  return parts.join('，') + '。';
}
