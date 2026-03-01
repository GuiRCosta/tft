import { useState, useCallback } from 'react';
import { tokens } from '../../shared/design/tokens';

interface ChampionIconProps {
  readonly name: string;
  readonly imageUrl: string;
  readonly cost: 1 | 2 | 3 | 4 | 5;
  readonly size?: number;
}

export function ChampionIcon({ name, imageUrl, cost, size = 24 }: ChampionIconProps) {
  const [hasError, setHasError] = useState(false);
  const handleError = useCallback(() => setHasError(true), []);
  const costColor = tokens.colors.cost[cost];

  return (
    <div
      className="relative rounded overflow-hidden flex-shrink-0"
      style={{
        width: size,
        height: size,
        border: `1.5px solid ${costColor}`,
        backgroundColor: tokens.colors.background.tertiary,
      }}
    >
      {hasError ? (
        <div
          className="w-full h-full flex items-center justify-center text-[8px] font-bold"
          style={{ color: costColor }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
}
