/**
 * 番茄钟状态类型
 * - idle: 空闲状态
 * - working: 工作状态
 * - shortBreak: 短休息状态
 * - longBreak: 长休息状态
 */
export type TimerStatus = 'idle' | 'working' | 'shortBreak' | 'longBreak';

/**
 * 番茄钟设置接口
 */
export interface TimerSettings {
  /** 工作时长（分钟） */
  workMinutes: number;
  /** 短休息时长（分钟） */
  shortBreakMinutes: number;
  /** 长休息时长（分钟） */
  longBreakMinutes: number;
  /** 触发长休息所需的工作次数 */
  longBreakInterval: number;
}

/**
 * 每日番茄记录接口
 */
export interface PomodoroRecord {
  /** 日期（格式：YYYY-MM-DD） */
  date: string;
  /** 完成的番茄数量 */
  count: number;
}

/**
 * 定时器返回值接口
 */
export interface UseTimerReturn {
  /** 当前剩余秒数 */
  secondsLeft: number;
  /** 当前状态 */
  status: TimerStatus;
  /** 当前阶段总秒数 */
  totalSeconds: number;
  /** 今日完成番茄数 */
  todayCount: number;
  /** 开始定时器 */
  start: () => void;
  /** 暂停定时器 */
  pause: () => void;
  /** 重置定时器 */
  reset: () => void;
  /** 跳过当前阶段 */
  skip: () => void;
}
