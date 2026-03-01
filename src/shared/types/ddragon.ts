export interface DDragonChampion {
  readonly id: string;
  readonly name: string;
  readonly cost: number;
  readonly imageUrl: string;
  readonly imageName: string;
}

export interface DDragonItem {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string;
  readonly imageName: string;
}

export interface DDragonTrait {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string;
  readonly imageName: string;
}

export interface DDragonLoadedPayload {
  readonly version: string;
  readonly currentSet: number;
  readonly championCount: number;
  readonly itemCount: number;
  readonly traitCount: number;
  readonly locale: string;
}

export interface DDragonUpdatingPayload {
  readonly fromVersion: string | null;
  readonly toVersion: string;
}

export interface DDragonErrorPayload {
  readonly message: string;
  readonly recoverable: boolean;
}
