import { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import AnalysisProgress from './components/AnalysisProgress';
import AnalysisResult from './components/AnalysisResult';
import { analyzeImageColors, generateLightroomParams, detectColorStyle } from './utils/colorAnalysis';

const STATE = {
  IDLE: 'idle',
  ANALYZING: 'analyzing',
  DONE: 'done',
};

export default function App() {
  const [appState, setAppState] = useState(STATE.IDLE);
  const [imageInfo, setImageInfo] = useState(null);
  const [result, setResult] = useState(null);

  const handleImageLoaded = useCallback((info) => {
    setImageInfo(info);
    setAppState(STATE.ANALYZING);
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    if (!imageInfo?.canvas) return;

    // 执行实际分析
    const analysis = analyzeImageColors(imageInfo.canvas);
    const params = generateLightroomParams(analysis);
    const style = detectColorStyle(analysis, params);

    setResult({ analysis, params, style });
    setAppState(STATE.DONE);
  }, [imageInfo]);

  const handleReset = useCallback(() => {
    setAppState(STATE.IDLE);
    setImageInfo(null);
    setResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-emerald-600/4 rounded-full blur-3xl" />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <Header />

        {/* 主区域 */}
        <main className="mt-8">
          {appState === STATE.IDLE && (
            <div className="space-y-5">
              <ImageUploader onImageLoaded={handleImageLoaded} />
              <FeatureCards />
            </div>
          )}

          {appState === STATE.ANALYZING && (
            <AnalysisProgress onComplete={handleAnalysisComplete} />
          )}

          {appState === STATE.DONE && result && (
            <AnalysisResult
              analysis={result.analysis}
              params={result.params}
              style={result.style}
              imageInfo={imageInfo}
              onReset={handleReset}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-700">
          <p>ColorMatch AI · 一键仿色，智能生成 Lightroom 预设</p>
          <p className="mt-1">支持 Lightroom Classic 7.0+ / Lightroom CC</p>
        </footer>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="text-center">
      <div className="inline-flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 
                        flex items-center justify-center shadow-lg shadow-violet-500/30">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </div>
        <span className="text-xs font-semibold text-gray-500 tracking-widest uppercase">ColorMatch AI</span>
      </div>

      <h1 className="text-4xl font-bold leading-tight">
        <span className="gradient-text">一键仿色</span>
      </h1>
      <p className="mt-3 text-gray-400 text-base max-w-md mx-auto leading-relaxed">
        上传任意参考照片，AI 自动分析调色风格，
        <br />生成专业 <span className="text-violet-400 font-medium">Lightroom 预设文件</span>
      </p>
    </header>
  );
}

function FeatureCards() {
  const features = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: '色彩深度分析',
      desc: '像素级直方图、HSL、色调区域全面解析',
      color: 'from-violet-500/10 to-violet-500/5 border-violet-500/15',
      iconColor: 'text-violet-400',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: '智能风格识别',
      desc: '橙青、日系、胶片、电影等多种风格自动识别',
      color: 'from-blue-500/10 to-blue-500/5 border-blue-500/15',
      iconColor: 'text-blue-400',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      title: '生成 XMP 预设',
      desc: '完整的 Lightroom .xmp 预设，含曲线、HSL、分级',
      color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/15',
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {features.map(f => (
        <div key={f.title} className={`bg-gradient-to-br ${f.color} border rounded-xl p-3.5`}>
          <div className={`${f.iconColor} mb-2`}>{f.icon}</div>
          <h3 className="text-sm font-semibold text-gray-200 mb-1">{f.title}</h3>
          <p className="text-xs text-gray-600 leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
