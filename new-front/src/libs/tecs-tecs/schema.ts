// # Types

export const kind = Symbol('kind');

export const numberK = Symbol('number');
export const float64K = Symbol('float64');
export const stringK = Symbol('string');

export const number = {
  [kind]: numberK,
  byteLength: 2,
  default: () => 0,
} as const;

export const float64 = {
  [kind]: float64K,
  byteLength: 2,
  default: () => 0,
} as const;

export const string = {
  [kind]: stringK,
  byteLength: 2,
  default: () => '',
};

export const Types = {
  number,
  float64,
  string,
} as const;

// # Field

export type FieldKind = typeof numberK | typeof float64K | typeof stringK;

export const FieldKind = {
  number: numberK,
  float64: float64K,
  string: stringK,
} as const;

export type Field = {
  [kind]: FieldKind;
};

// # Schema

export type Schema = { [key: string]: Field | Schema };

export type ExtractSchemaType<T> = T extends typeof float64 | typeof number
  ? number
  : T extends typeof string
  ? string
  : T extends Schema
  ? { [K in keyof T]: ExtractSchemaType<T[K]> }
  : never;
