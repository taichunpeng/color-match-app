import { useCallback, useState } from 'react';

export default function ImageUploader({ onImageLoaded }) {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 创建离屏 canvas 用于像素分析
        const maxSize = 800;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        onImageLoaded({
          dataUrl: e.target.result,
          canvas,
          fileName: file.name,
          width: img.width,
          height: img.height,
          size: file.size,
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [onImageLoaded]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e) => {
    processFile(e.target.files[0]);
    e.target.value = '';
  }, [processFile]);

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer
        ${isDragging
          ? 'border-violet-400 bg-violet-500/10 drop-zone-active'
          : 'border-white/15 hover:border-white/30 bg-dark-700/50 hover:bg-dark-600/50'
        }`}
      style={{ minHeight: '280px' }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => document.getElementById('file-input').click()}
    >
      <input
        id="file-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        {/* 上传图标 */}
        <div className={`mb-5 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 
                          border border-violet-400/20 flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-200 mb-2">
          {isDragging ? '松开鼠标上传图片' : '上传参考照片'}
        </h3>
        <p className="text-sm text-gray-500 mb-1">
          拖拽图片到此处，或点击选择文件
        </p>
        <p className="text-xs text-gray-600">
          支持 JPG、PNG、WEBP、HEIC 格式
        </p>

        <div className="mt-6 flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
            分析色彩风格
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            提取调色参数
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            生成 .xmp 文件
          </div>
        </div>
      </div>
    </div>
  );
}
