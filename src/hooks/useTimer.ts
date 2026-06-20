import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimerStatus, TimerSettings, PomodoroRecord, UseTimerReturn } from '../types';

/** LocalStorage 键名 */
const STORAGE_KEYS = {
  settings: 'pomodoro_settings',
  records: 'pomodoro_records',
};

/**
 * 获取今日日期字符串（格式：YYYY-MM-DD）
 */
const getTodayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * 从 LocalStorage 加载记录
 */
const loadRecords = (): PomodoroRecord[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.records);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    console.warn('Failed to load records from localStorage');
  }
  return [];
};

/**
 * 使用 Web Audio API 生成"叮"声
 */
const playDingSound = (): void => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch {
    console.warn('Failed to play sound');
  }
};

/**
 * 请求通知权限并发送通知
 */
const sendNotification = async (title: string, body: string): Promise<void> => {
  try {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    }
  } catch {
    console.warn('Failed to send notification');
  }
};

/**
 * 自定义 Hook：管理番茄钟定时器逻辑
 * @param settings 定时器设置
 * @returns 定时器状态和操作方法
 */
export const useTimer = (settings: TimerSettings): UseTimerReturn => {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [secondsLeft, setSecondsLeft] = useState(settings.workMinutes * 60);
  const [totalSeconds, setTotalSeconds] = useState(settings.workMinutes * 60);
  const [todayCount, setTodayCount] = useState(() => {
    const records = loadRecords();
    const today = getTodayString();
    const todayRecord = records.find(r => r.date === today);
    return todayRecord?.count || 0;
  });

  const workCyclesRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  /**
   * 根据状态获取当前阶段的总秒数
   */
  const getSecondsForStatus = useCallback((currentStatus: TimerStatus): number => {
    switch (currentStatus) {
      case 'working':
        return settings.workMinutes * 60;
      case 'shortBreak':
        return settings.shortBreakMinutes * 60;
      case 'longBreak':
        return settings.longBreakMinutes * 60;
      default:
        return settings.workMinutes * 60;
    }
  }, [settings]);

  /**
   * 保存番茄记录到 LocalStorage
   */
  const savePomodoro = useCallback(() => {
    const records = loadRecords();
    const today = getTodayString();
    const existingIndex = records.findIndex(r => r.date === today);

    if (existingIndex >= 0) {
      records[existingIndex].count += 1;
    } else {
      records.push({ date: today, count: 1 });
    }

    try {
      localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
      setTodayCount(prev => prev + 1);
    } catch {
      console.warn('Failed to save pomodoro record');
    }
  }, []);

  /**
   * 切换到下一个阶段
   */
  const nextPhase = useCallback(() => {
    setStatus(prevStatus => {
      let nextStatus: TimerStatus;

      if (prevStatus === 'working') {
        workCyclesRef.current += 1;

        if (workCyclesRef.current >= settings.longBreakInterval) {
          workCyclesRef.current = 0;
          nextStatus = 'longBreak';
        } else {
          nextStatus = 'shortBreak';
        }

        savePomodoro();
      } else {
        nextStatus = 'working';
      }

      const newTotalSeconds = getSecondsForStatus(nextStatus);
      setTotalSeconds(newTotalSeconds);
      setSecondsLeft(newTotalSeconds);

      return nextStatus;
    });
  }, [settings.longBreakInterval, savePomodoro, getSecondsForStatus]);

  /**
   * 开始定时器
   */
  const start = useCallback(() => {
    if (intervalRef.current) return;

    setStatus(prev => prev === 'idle' ? 'working' : prev);

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          playDingSound();
          sendNotification(
            status === 'working' ? '专注时间结束！' : '休息时间结束！',
            status === 'working' ? '该休息一下了' : '准备开始新的专注吧'
          );
          nextPhase();
          return getSecondsForStatus(status);
        }
        return prev - 1;
      });
    }, 1000);
  }, [status, nextPhase, getSecondsForStatus]);

  /**
   * 暂停定时器
   */
  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * 重置定时器
   */
  const reset = useCallback(() => {
    pause();
    setStatus('idle');
    const workSeconds = settings.workMinutes * 60;
    setSecondsLeft(workSeconds);
    setTotalSeconds(workSeconds);
  }, [pause, settings.workMinutes]);

  /**
   * 跳过当前阶段
   */
  const skip = useCallback(() => {
    nextPhase();
  }, [nextPhase]);

  /**
   * 监听页面可见性变化，页面隐藏时暂停定时器
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && intervalRef.current) {
        pause();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pause]);

  /**
   * 组件卸载时清理定时器
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    secondsLeft,
    status,
    totalSeconds,
    todayCount,
    start,
    pause,
    reset,
    skip,
  };
};

export default useTimer;
