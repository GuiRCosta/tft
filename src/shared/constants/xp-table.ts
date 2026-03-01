// XP necessario para avancar de nivel no TFT
// Chave = nivel atual, valor = XP total para proximo nivel
export const XP_TO_NEXT_LEVEL: Readonly<Record<number, number>> = {
  1: 2,
  2: 2,
  3: 6,
  4: 10,
  5: 20,
  6: 36,
  7: 48,
  8: 76,
  9: 84,
};

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 10;
