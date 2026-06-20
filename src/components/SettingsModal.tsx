import { useState, useEffect } from 'react';
import type { TimerSettings } from '../types';

/**
 * 设置 Modal 组件
 * @param isOpen 是否打开
 * @param onClose 关闭回调
 * @param settings 当前设置
 * @param onSave 保存设置回调
 */
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onSave: (settings: TimerSettings) => void;
}

/** LocalStorage 键名 */
const STORAGE_KEY = 'pomodoro_settings';

export const SettingsModal = ({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) => {
  const [workMinutes, setWorkMinutes] = useState(settings.workMinutes);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(settings.shortBreakMinutes);
  const [longBreakMinutes, setLongBreakMinutes] = useState(settings.longBreakMinutes);

  /** 当 settings 变化时更新本地状态 */
  useEffect(() => {
    if (isOpen) {
      setWorkMinutes(settings.workMinutes);
      setShortBreakMinutes(settings.shortBreakMinutes);
      setLongBreakMinutes(settings.longBreakMinutes);
    }
  }, [isOpen, settings]);

  /**
   * 处理保存
   */
  const handleSave = () => {
    const newSettings: TimerSettings = {
      ...settings,
      workMinutes: Math.max(1, workMinutes),
      shortBreakMinutes: Math.max(1, shortBreakMinutes),
      longBreakMinutes: Math.max(1, longBreakMinutes),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      console.warn('Failed to save settings to localStorage');
    }

    onSave(newSettings);
    onClose();
  };

  /**
   * 处理关闭
   */
  const handleClose = () => {
    onClose();
  };

  /**
   * 点击遮罩层关闭
   */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">设置</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* 工作时长设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              工作时长（分钟）
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={workMinutes}
              onChange={(e) => setWorkMinutes(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* 短休息时长设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              短休息时长（分钟）
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={shortBreakMinutes}
              onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* 长休息时长设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              长休息时长（分钟）
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={longBreakMinutes}
              onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
