export interface RawMetaComp {
  readonly name: string;
  readonly champions: readonly string[];
  readonly coreItems: Readonly<Record<string, readonly string[]>>;
  readonly winrate: number;
  readonly avgPlacement: number;
  readonly difficulty: string;
  readonly contested: number;
  readonly tier: string;
}

export interface MetaCompsLoadedPayload {
  readonly version: string;
  readonly patch: string;
  readonly compCount: number;
}

export interface MetaCompsErrorPayload {
  readonly message: string;
  readonly recoverable: boolean;
}
