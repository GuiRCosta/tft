// Componentes base de itens
export const BASE_COMPONENTS = [
  'BFSword',
  'RecurveBow',
  'NeedlesslyLargeRod',
  'TearOfTheGoddess',
  'ChainVest',
  'NegatronCloak',
  'GiantsBelt',
  'SparringGloves',
  'Spatula',
] as const;

export type BaseComponent = (typeof BASE_COMPONENTS)[number];

export interface ItemRecipe {
  readonly name: string;
  readonly components: readonly [BaseComponent, BaseComponent];
}

// Receitas de itens combinados
export const ITEM_RECIPES: readonly ItemRecipe[] = [
  { name: 'Deathblade', components: ['BFSword', 'BFSword'] },
  { name: 'Giant Slayer', components: ['BFSword', 'RecurveBow'] },
  { name: 'Hextech Gunblade', components: ['BFSword', 'NeedlesslyLargeRod'] },
  { name: 'Spear of Shojin', components: ['BFSword', 'TearOfTheGoddess'] },
  { name: 'Edge of Night', components: ['BFSword', 'ChainVest'] },
  { name: 'Bloodthirster', components: ['BFSword', 'NegatronCloak'] },
  { name: 'Zekes Herald', components: ['BFSword', 'GiantsBelt'] },
  { name: 'Infinity Edge', components: ['BFSword', 'SparringGloves'] },
];
