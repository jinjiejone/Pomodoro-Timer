/**
 * SVG 环形进度条组件
 * @param progress 进度值（0-1）
 * @param size 圆环大小
 * @param strokeWidth 描边宽度
 * @param color 圆环颜色
 */
interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const CircularProgress = ({
  progress,
  size = 300,
  strokeWidth = 12,
  color = '#E74C3C',
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      {/* 背景圆环 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#f0f0f0"
        strokeWidth={strokeWidth}
      />
      {/* 进度圆环 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-linear"
      />
    </svg>
  );
};

export default CircularProgress;
