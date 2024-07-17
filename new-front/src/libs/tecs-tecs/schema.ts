// # Types
import { $defaultFn, Id, $kind } from './core';
import { safeGuard } from './switch';

// # Kinds

export const $uint8 = Symbol('uint8');
export const $uint16 = Symbol('uint16');
export const $uint32 = Symbol('uint32');

export const $int8 = Symbol('int8');
export const $int16 = Symbol('int16');
export const $int32 = Symbol('int32');

export const $float32 = Symbol('float32');
export const $float64 = Symbol('float64');

export const $string8 = Symbol('string8');
export const $string16 = Symbol('string16');

export const $boolean = Symbol('boolean');

export const $number = $float64;
export const $string = $string16;

export const uint8 = {
  [$kind]: $uint8,
  byteLength: 1,
  [$defaultFn]: () => 0,
} as const;

export const uint16 = {
  [$kind]: $uint16,
  byteLength: 2,
  [$defaultFn]: () => 0,
} as const;

export const uint32 = {
  [$kind]: $uint32,
  byteLength: 4,
  [$defaultFn]: () => 0,
} as const;

export const int8 = {
  [$kind]: $int8,
  byteLength: 1,
  [$defaultFn]: () => 0,
} as const;

export const int16 = {
  [$kind]: $int16,
  byteLength: 2,
  [$defaultFn]: () => 0,
} as const;

export const int32 = {
  [$kind]: $int32,
  byteLength: 4,
  [$defaultFn]: () => 0,
} as const;

export const float32 = {
  [$kind]: $float32,
  byteLength: 4,
  [$defaultFn]: () => 0,
} as const;

export const float64 = {
  [$kind]: $float64,
  byteLength: 8,
  [$defaultFn]: () => 0,
} as const;

export const string8 = {
  [$kind]: $string8,
  byteLength: 1,
  [$defaultFn]: () => '',
};

export const string16 = {
  [$kind]: $string16,
  byteLength: 2,
  [$defaultFn]: () => '',
};

export const boolean = {
  [$kind]: $boolean,
  byteLength: 1,
  [$defaultFn]: () => false,
};

export const number = float64;
export const string = string16;

// # Field

export type FieldKind =
  | typeof $uint8
  | typeof $uint16
  | typeof $uint32
  | typeof $int8
  | typeof $int16
  | typeof $int32
  | typeof $float32
  | typeof $float64
  | typeof $string8
  | typeof $string16
  | typeof $boolean;

export const FieldKind = {
  uint8: $uint8,
  uint16: $uint16,
  uint32: $uint32,
  int8: $int8,
  int16: $int16,
  int32: $int32,
  float32: $float32,
  float64: $float64,
  string8: $string8,
  string16: $string16,
  boolean: $boolean,
} as const;

export type Field =
  | typeof uint8
  | typeof uint16
  | typeof uint32
  | typeof int8
  | typeof int16
  | typeof int32
  | typeof float32
  | typeof float64
  | typeof string8
  | typeof string16
  | typeof boolean
  | typeof number
  | typeof string;

export const Field = {
  uint8,
  uint16,
  uint32,
  int8,
  int16,
  int32,
  float32,
  float64,
  string8,
  string16,
  boolean,
  number,
  string,
} as const;

export function isField(value: unknown): value is Field {
  return (
    value === uint8 ||
    value === uint16 ||
    value === uint32 ||
    value === int8 ||
    value === int16 ||
    value === int32 ||
    value === float32 ||
    value === float64 ||
    value === string8 ||
    value === string16 ||
    value === boolean ||
    value === number ||
    value === string
  );
}

// # Schema

export const $aos = Symbol('aos');
export const $soa = Symbol('soa');
export const $tag = Symbol('tag');

export type SchemaKind = typeof $tag | typeof $aos | typeof $soa;

export type Schema = {
  [key: string]: Field | Schema;
  [$kind]: SchemaKind;
};
export type SchemaId = Id;

export type SchemaType<T> = T extends typeof float64 | typeof number
  ? number
  : T extends typeof string
  ? string
  : T extends Schema
  ? { [K in keyof T as K extends symbol ? never : K]: SchemaType<T[K]> }
  : never;

export function isSchema(value: unknown): value is Schema {
  return (
    typeof value === 'object' &&
    value !== null &&
    $kind in value &&
    (value[$kind] === $tag || value[$kind] === $aos || value[$kind] === $soa)
  );
}

export const Schema = {
  new: <S extends Omit<Schema, typeof $kind>>(schema: S, kind?: SchemaKind): S & { [$kind]: SchemaKind } => {
    return {
      ...schema,
      [$kind]: kind ?? $aos,
    };
  },
  default: <S extends Schema>(schema: S): SchemaType<S> => {
    switch (schema[$kind]) {
      case $aos:
        const component = {} as SchemaType<S>;

        for (const key in schema) {
          const field = schema[key];

          if (isField(field)) {
            const v = field[$defaultFn]();
            component[key] = v as any;
            continue;
          } else if (isSchema(field)) {
            component[key] = Schema.default(field) as any;
          } else {
            throw new Error('Invalid schema');
          }
        }

        return component;
      case $tag:
        return {} as SchemaType<S>;
      case $soa:
        throw new Error('Not implemented');
      default:
        return safeGuard(schema[$kind]);
    }
  },
};

export const Tag = {
  new: (): Schema => {
    return Schema.new({}, $tag);
  },
};
