export interface Champion {
  readonly id: string;
  readonly name: string;
  readonly cost: 1 | 2 | 3 | 4 | 5;
  readonly starLevel: 1 | 2 | 3;
  readonly items: readonly Item[];
  readonly traits: readonly string[];
  readonly position: { readonly row: number; readonly col: number };
}

export interface Item {
  readonly id: string;
  readonly name: string;
  readonly components: readonly string[];
  readonly stats: Readonly<Record<string, number>>;
}
