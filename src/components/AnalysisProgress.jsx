import { useState, useEffect } from 'react';

const STEPS = [
  { id: 1, label: '解析图像像素数据', duration: 400 },
  { id: 2, label: '分析色彩直方图', duration: 500 },
  { id: 3, label: '提取暗部/中间调/高光', duration: 600 },
  { id: 4, label: '计算色相与饱和度', duration: 500 },
  { id: 5, label: '识别调色风格', duration: 400 },
  { id: 6, label: '生成 Lightroom 参数', duration: 300 },
];

export default function AnalysisProgress({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    let elapsed = 0;
    const timers = [];

    STEPS.forEach((step, i) => {
      const t1 = setTimeout(() => {
        setCurrentStep(i + 1);
      }, elapsed);
      timers.push(t1);

      elapsed += step.duration;

      const t2 = setTimeout(() => {
        setCompletedSteps(prev => [...prev, step.id]);
      }, elapsed);
      timers.push(t2);
    });

    const finalTimer = setTimeout(() => {
      onComplete?.();
    }, elapsed + 100);
    timers.push(finalTimer);

    return () => timers.forEach(clearTimeout);
  }, []);

  const totalDuration = STEPS.reduce((a, b) => a + b.duration, 0);
  const elapsedDuration = STEPS.slice(0, completedSteps.length).reduce((a, b) => a + b.duration, 0);
  const progress = Math.round((elapsedDuration / totalDuration) * 100);

  return (
    <div className="glass-card p-8">
      {/* 标题 */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20
                        border border-violet-400/20 flex items-center justify-center">
          <div className="relative">
            <div className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
            <div className="absolute inset-1 w-6 h-6 border-2 border-blue-400/20 border-b-blue-400 
                            rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white">正在分析调色风格</h3>
        <p className="text-sm text-gray-500 mt-1">AI 正在深度解析图像色彩特征...</p>
      </div>

      {/* 步骤列表 */}
      <div className="space-y-3 mb-7">
        {STEPS.map((step, i) => {
          const isDone = completedSteps.includes(step.id);
          const isActive = currentStep === i + 1 && !isDone;

          return (
            <div key={step.id} className={`flex items-center gap-3 transition-all duration-300
              ${isDone ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-30'}`}>
              {/* 状态图标 */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                ${isDone
                  ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                  : isActive
                    ? 'bg-violet-500/20 border border-violet-500'
                    : 'bg-dark-500 border border-white/10'
                }`}>
                {isDone ? (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                ) : (
                  <span className="text-xs text-gray-600">{i + 1}</span>
                )}
              </div>

              <span className={`text-sm transition-colors duration-300
                ${isDone ? 'text-gray-300' : isActive ? 'text-white font-medium' : 'text-gray-600'}`}>
                {step.label}
              </span>

              {isActive && (
                <div className="flex-1 h-0.5 bg-dark-500 rounded-full overflow-hidden ml-auto max-w-24 shimmer">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-blue-400 rounded-full
                                  animate-[width_0.5s_ease-in-out]" style={{ width: '60%' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 进度条 */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>分析进度</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-dark-500 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
