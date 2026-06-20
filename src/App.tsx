import { useState, useMemo } from 'react';
import { useTimer } from './hooks/useTimer';
import { CircularProgress } from './components/CircularProgress';
import { SettingsModal } from './components/SettingsModal';
import type { TimerStatus, TimerSettings } from './types';

/** 默认设置 */
const DEFAULT_SETTINGS: TimerSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
};

/** LocalStorage 键名 */
const SETTINGS_KEY = 'pomodoro_settings';

/**
 * 从 LocalStorage 加载设置
 */
const loadSettings = (): TimerSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {
    console.warn('Failed to load settings from localStorage');
  }
  return { ...DEFAULT_SETTINGS };
};

/**
 * 格式化秒数为 MM:SS 格式
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * 根据状态获取显示文字
 * @param status 当前状态
 * @returns 状态显示文字
 */
const getStatusText = (status: TimerStatus): string => {
  switch (status) {
    case 'working':
      return '专注时间';
    case 'shortBreak':
      return '短休息';
    case 'longBreak':
      return '长休息';
    default:
      return '准备开始';
  }
};

/**
 * 主应用组件
 */
function App() {
  const [settings, setSettings] = useState<TimerSettings>(loadSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    secondsLeft,
    status,
    totalSeconds,
    todayCount,
    start,
    pause,
    reset,
    skip,
  } = useTimer(settings);

  /** 计算进度 */
  const progress = useMemo(() => {
    return totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  }, [secondsLeft, totalSeconds]);

  /**
   * 处理设置保存
   */
  const handleSaveSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
  };

  /**
   * 获取按钮配置
   */
  const buttonConfig = useMemo(() => {
    if (status === 'idle') {
      return {
        primary: { label: '开始', onClick: start, color: 'bg-red-500 hover:bg-red-600' },
        secondary: null,
      };
    }

    return {
      primary: {
        label: status === 'working' ? '暂停' : '继续',
        onClick: status === 'working' ? pause : start,
        color: status === 'working' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600',
      },
      secondary: { label: '跳过', onClick: skip, color: 'bg-gray-200 hover:bg-gray-300 text-gray-700' },
    };
  }, [status, start, pause, skip]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        {/* 标题 */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">番茄钟</h1>

        {/* 环形进度条 */}
        <div className="relative inline-block mb-6">
          <CircularProgress progress={progress} size={300} strokeWidth={12} color="#E74C3C" />
          
          {/* 时间显示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-mono font-bold text-gray-800">
              {formatTime(secondsLeft)}
            </span>
          </div>
        </div>

        {/* 状态文字 */}
        <p className="text-xl text-gray-600 mb-8">
          {getStatusText(status)}
        </p>

        {/* 控制按钮 */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={buttonConfig.primary.onClick}
            className={`px-8 py-3 text-white font-semibold rounded-full shadow-lg transition-all transform hover:scale-105 ${buttonConfig.primary.color}`}
          >
            {buttonConfig.primary.label}
          </button>
          
          {buttonConfig.secondary && (
            <button
              onClick={buttonConfig.secondary.onClick}
              className={`px-6 py-3 font-semibold rounded-full shadow transition-all ${buttonConfig.secondary.color}`}
            >
              {buttonConfig.secondary.label}
            </button>
          )}

          {status !== 'idle' && (
            <button
              onClick={reset}
              className="px-6 py-3 text-gray-600 font-semibold rounded-full shadow transition-all hover:bg-gray-100"
            >
              重置
            </button>
          )}
        </div>
      </div>

      {/* 底部信息栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-gray-600">今日完成：{todayCount} 个番茄</span>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>设置</span>
          </button>
        </div>
      </div>

      {/* 设置 Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

export default App;
