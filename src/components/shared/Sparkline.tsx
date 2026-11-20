import React from 'react';

interface SparklineProps {
  data: readonly number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  ariaLabel: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 120,
  height = 32,
  strokeColor = '#3b82f6',
  ariaLabel,
}) => {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 2;

  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1 || 1)) * (width - 2 * padding);
      const y = height - padding - ((val - min) / range) * (height - 2 * padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const summary = `Trend: from ${data[0]} to ${data[data.length - 1]}, lowest ${min}, peak ${max}.`;

  return (
    <div className="inline-flex items-center">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
      <span className="sr-only">
        {ariaLabel}. {summary}
      </span>
    </div>
  );
};
