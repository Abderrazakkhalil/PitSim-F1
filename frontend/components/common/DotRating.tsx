'use client';

interface DotRatingProps {
  value: number;
  max?: number;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export function DotRating({ value, max = 10, color, size = 'md' }: DotRatingProps) {
  const sizeMap = {
    sm: { width: 5, height: 5 },
    md: { width: 7, height: 7 },
    lg: { width: 10, height: 10 },
  };

  const dims = sizeMap[size];

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: dims.width,
            height: dims.height,
            borderRadius: '50%',
            backgroundColor: i < value ? color : 'rgba(255,255,255,0.12)',
            transition: 'background-color 0.2s ease',
          }}
        />
      ))}
    </div>
  );
}
