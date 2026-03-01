// Probabilidade de encontrar campeao por custo, baseado no nivel
// Nivel: [1-cost, 2-cost, 3-cost, 4-cost, 5-cost] em %
export const ROLL_ODDS: Readonly<Record<number, readonly number[]>> = {
  1: [100, 0, 0, 0, 0],
  2: [100, 0, 0, 0, 0],
  3: [75, 25, 0, 0, 0],
  4: [55, 30, 15, 0, 0],
  5: [45, 33, 20, 2, 0],
  6: [30, 40, 25, 5, 0],
  7: [19, 35, 35, 10, 1],
  8: [18, 25, 32, 22, 3],
  9: [10, 20, 25, 30, 15],
  10: [5, 10, 20, 40, 25],
};

// Pool total de campeoes por custo
export const CHAMPION_POOL: Readonly<Record<number, number>> = {
  1: 22,
  2: 20,
  3: 17,
  4: 10,
  5: 9,
};
