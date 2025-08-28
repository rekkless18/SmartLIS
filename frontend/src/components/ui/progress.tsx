import * as React from "react";
import { cn } from "../../lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  className?: string;
}

/**
 * 进度条组件
 * @param value - 当前进度值
 * @param max - 最大进度值，默认为100
 * @param className - 自定义样式类名
 * @param props - 其他HTML属性
 * @returns 进度条组件
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-gray-200",
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-blue-600 transition-all duration-300 ease-in-out"
          style={{
            transform: `translateX(-${100 - percentage}%)`
          }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
export type { ProgressProps };