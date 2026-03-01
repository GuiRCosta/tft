import { useState, useCallback } from 'react';
import { tokens } from '../../shared/design/tokens';

interface ItemIconProps {
  readonly name: string;
  readonly imageUrl: string;
  readonly size?: number;
}

export function ItemIcon({ name, imageUrl, size = 14 }: ItemIconProps) {
  const [hasError, setHasError] = useState(false);
  const handleError = useCallback(() => setHasError(true), []);

  return (
    <div
      className="relative rounded-sm overflow-hidden flex-shrink-0"
      style={{
        width: size,
        height: size,
        border: `1px solid ${tokens.colors.accent.goldDark}`,
        backgroundColor: tokens.colors.background.tertiary,
      }}
    >
      {hasError ? (
        <div
          className="w-full h-full flex items-center justify-center text-[6px] font-bold"
          style={{ color: tokens.colors.accent.gold }}
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
