import { useState } from 'react';
import { Histogram, ToneCurve, ParamBar, ColorSwatch } from './Visualizers';
import { generateXMP, downloadXMP } from '../utils/xmpGenerator';

const TABS = [
  { id: 'overview', label: '概览' },
  { id: 'basic', label: '基础面板' },
  { id: 'hsl', label: 'HSL' },
  { id: 'curve', label: '色调曲线' },
  { id: 'colorgrade', label: '色彩分级' },
];

export default function AnalysisResult({ analysis, params, style, imageInfo, onReset }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [downloading, setDownloading] = useState(false);
  const [presetName, setPresetName] = useState('ColorMatch_Preset');

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      const xmp = generateXMP(params, presetName);
      downloadXMP(xmp, `${presetName}.xmp`);
      setDownloading(false);
    }, 300);
  };

  return (
    <div className="space-y-5">
      {/* 顶部：图片信息 + 风格 */}
      <div className="glass-card p-5">
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 relative">
            <img
              src={imageInfo.dataUrl}
              alt="分析图片"
              className="w-28 h-20 object-cover rounded-xl border border-white/10"
            />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full 
                            flex items-center justify-center shadow-lg">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-white truncate">{style.name}</h2>
                <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{style.description}</p>
              </div>
              <button onClick={onReset} className="btn-secondary text-xs px-3 py-1.5 flex-shrink-0">
                重新上传
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {style.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-violet-500/15 border border-violet-500/20 
                                           text-violet-300 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-700/80 rounded-xl border border-white/5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-dark-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div className="glass-card p-5">
        {activeTab === 'overview' && (
          <OverviewTab analysis={analysis} params={params} />
        )}
        {activeTab === 'basic' && (
          <BasicPanelTab params={params} />
        )}
        {activeTab === 'hsl' && (
          <HSLTab params={params} />
        )}
        {activeTab === 'curve' && (
          <CurveTab params={params} />
        )}
        {activeTab === 'colorgrade' && (
          <ColorGradeTab params={params} />
        )}
      </div>

      {/* 下载区域 */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1.5 block">预设名称</label>
            <input
              type="text"
              value={presetName}
              onChange={e => setPresetName(e.target.value.replace(/[^\w\u4e00-\u9fa5_\-]/g, ''))}
              className="w-full bg-dark-500 border border-white/10 rounded-xl px-3 py-2.5 text-sm 
                         text-gray-200 focus:outline-none focus:border-violet-500/50 focus:bg-dark-400
                         transition-colors"
              placeholder="输入预设名称..."
            />
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary w-full flex items-center justify-center gap-2.5"
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>生成中...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>下载 Lightroom 预设 (.xmp)</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-600 mt-3 text-center">
          将 .xmp 文件导入 Lightroom Classic → 预设面板 → 右键 → 导入预设
        </p>
      </div>
    </div>
  );
}

/* ===== 概览 Tab ===== */
function OverviewTab({ analysis, params }) {
  const { histogram, toneZones, avgColor, avgSaturation, avgLuminance, contrast } = analysis;

  return (
    <div className="space-y-5">
      {/* 主要颜色指标 */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label="平均亮度"
          value={`${Math.round(avgLuminance * 100)}%`}
          sub={avgLuminance > 0.6 ? '偏亮' : avgLuminance < 0.35 ? '偏暗' : '正常'}
          color="violet"
        />
        <MetricCard
          label="饱和度"
          value={`${Math.round(avgSaturation)}%`}
          sub={avgSaturation > 35 ? '高饱和' : avgSaturation < 15 ? '低饱和' : '中等'}
          color="blue"
        />
        <MetricCard
          label="对比度"
          value={`${Math.round(contrast * 100)}%`}
          sub={contrast > 0.5 ? '强对比' : contrast < 0.25 ? '弱对比' : '自然'}
          color="emerald"
        />
      </div>

      {/* 色调区域 */}
      <div>
        <h4 className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">色调区域分析</h4>
        <div className="flex justify-around">
          <ColorSwatch color={toneZones.shadow} label="暗部" size="lg" />
          <ColorSwatch color={toneZones.midtone} label="中间调" size="lg" />
          <ColorSwatch color={toneZones.highlight} label="高光" size="lg" />
          <ColorSwatch color={avgColor} label="平均色" size="lg" />
        </div>
      </div>

      {/* 直方图 */}
      <div>
        <h4 className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">色彩直方图</h4>
        <div className="grid grid-cols-2 gap-3">
          <Histogram data={histogram.lum} color="lum" label="亮度" />
          <Histogram data={histogram.r} color="r" label="红色通道" />
          <Histogram data={histogram.g} color="g" label="绿色通道" />
          <Histogram data={histogram.b} color="b" label="蓝色通道" />
        </div>
      </div>

      {/* 关键参数速览 */}
      <div>
        <h4 className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">关键参数</h4>
        <div className="space-y-1">
          <ParamBar label="色温" value={params.Temperature} min={-100} max={100} />
          <ParamBar label="曝光" value={Math.round(params.Exposure * 10) / 10} min={-5} max={5} />
          <ParamBar label="对比度" value={params.Contrast} />
          <ParamBar label="鲜艳度" value={params.Vibrance} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, color }) {
  const colors = {
    violet: 'from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400',
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-3 text-center`}>
      <div className={`text-xl font-bold ${colors[color].split(' ').pop()}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
      <div className="text-xs text-gray-600 mt-0.5">{sub}</div>
    </div>
  );
}

/* ===== 基础面板 Tab ===== */
function BasicPanelTab({ params }) {
  const items = [
    { label: '色温 Temperature', value: params.Temperature },
    { label: '色调 Tint', value: params.Tint },
    { label: '曝光 Exposure', value: Math.round(params.Exposure * 100) / 100, min: -5, max: 5 },
    { label: '对比度 Contrast', value: params.Contrast },
    { label: '高光 Highlights', value: params.Highlights },
    { label: '阴影 Shadows', value: params.Shadows },
    { label: '白色 Whites', value: params.Whites },
    { label: '黑色 Blacks', value: params.Blacks },
    { label: '清晰度 Clarity', value: params.Clarity },
    { label: '去朦胧 Dehaze', value: params.Dehaze },
    { label: '鲜艳度 Vibrance', value: params.Vibrance },
    { label: '饱和度 Saturation', value: params.Saturation },
  ];

  return (
    <div className="space-y-0.5">
      {items.map(item => (
        <ParamBar
          key={item.label}
          label={item.label}
          value={item.value}
          min={item.min ?? -100}
          max={item.max ?? 100}
        />
      ))}
    </div>
  );
}

/* ===== HSL Tab ===== */
function HSLTab({ params }) {
  const colors = ['红', '橙', '黄', '绿', '青', '蓝', '紫', '品红'];
  const keys = ['Red', 'Orange', 'Yellow', 'Green', 'Aqua', 'Blue', 'Purple', 'Magenta'];

  return (
    <div className="space-y-5">
      {['Hue', 'Saturation', 'Luminance'].map(type => {
        const labels = { Hue: '色相 Hue', Saturation: '饱和度 Saturation', Luminance: '明度 Luminance' };
        return (
          <div key={type}>
            <h4 className="text-xs text-gray-500 mb-2 font-medium">{labels[type]}</h4>
            <div className="space-y-0.5">
              {keys.map((key, i) => (
                <ParamBar
                  key={key}
                  label={`${colors[i]}`}
                  value={params[`${type}Adjustment${key}`] || 0}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===== 曲线 Tab ===== */
function CurveTab({ params }) {
  const curves = [
    { label: '亮度曲线', color: 'white', points: params.ToneCurvePV2012 },
    { label: '红色', color: 'r', points: params.ToneCurvePV2012Red },
    { label: '绿色', color: 'g', points: params.ToneCurvePV2012Green },
    { label: '蓝色', color: 'b', points: params.ToneCurvePV2012Blue },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {curves.map(curve => (
        <div key={curve.label}>
          <p className="text-xs text-gray-500 mb-2 text-center">{curve.label}</p>
          <ToneCurve points={curve.points} color={curve.color} />
        </div>
      ))}
    </div>
  );
}

/* ===== 色彩分级 Tab ===== */
function ColorGradeTab({ params }) {
  const zones = [
    {
      label: '阴影',
      hue: params.ColorGradeShadowHue,
      sat: params.ColorGradeShadowSat,
      color: `hsl(${params.ColorGradeShadowHue}, ${params.ColorGradeShadowSat}%, 35%)`,
    },
    {
      label: '中间调',
      hue: params.ColorGradeMidtoneHue,
      sat: params.ColorGradeMidtoneSat,
      color: `hsl(${params.ColorGradeMidtoneHue}, ${params.ColorGradeMidtoneSat}%, 50%)`,
    },
    {
      label: '高光',
      hue: params.ColorGradeHighlightHue,
      sat: params.ColorGradeHighlightSat,
      color: `hsl(${params.ColorGradeHighlightHue}, ${params.ColorGradeHighlightSat}%, 65%)`,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {zones.map(zone => (
          <div key={zone.label} className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-full border-4 border-white/10 shadow-xl"
              style={{ backgroundColor: zone.sat > 0 ? zone.color : '#888' }}
            />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-300">{zone.label}</p>
              <p className="text-xs text-gray-600">色相 {zone.hue}°</p>
              <p className="text-xs text-gray-600">饱和 {zone.sat}%</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-xs text-gray-500 mb-2 font-medium">混合度 Blending</h4>
        <ParamBar label="色彩分级混合" value={params.ColorGradeBlending} min={0} max={100} />
      </div>
    </div>
  );
}
