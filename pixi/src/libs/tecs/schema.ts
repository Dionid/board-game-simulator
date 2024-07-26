// # Types
import { $defaultFn, $kind, Id } from './core';
import { safeGuard } from './switch';

export type KindSt = {
  [$kind]: symbol;
  [$defaultFn]: () => unknown;
};

// # Primitive types

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

export type PrimitiveKind =
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

// # Complex types

export const $array = Symbol('array');
export const $union = Symbol('union');

// ## Array
export function arrayOf<K extends KindSt | Schema>(field: K) {
  return {
    field,
    [$kind]: $array,
    [$defaultFn]: () => [],
  };
}

// ## Union

export function union<K extends PrimitiveKind, V extends PrimitiveKindToType<K>[]>(
  field: K,
  ...variants: V
) {
  return {
    field,
    variants,
    [$kind]: $union,
    [$defaultFn]: () => variants[0],
  };
}

export type ArrayKind = ReturnType<typeof arrayOf>;
export type UnionKind = ReturnType<typeof union>;

export type ComplexKind = ArrayKind | UnionKind;

export type Kind = PrimitiveKind | ComplexKind;

export function isKindSt(value: unknown): value is KindSt {
  return value !== null && typeof value === 'object' && $kind in value && $defaultFn in value;
}

export function isPrimitiveKind(value: unknown): value is PrimitiveKind {
  return (
    isKindSt(value) &&
    (value[$kind] === $uint8 ||
      value[$kind] === $uint16 ||
      value[$kind] === $uint32 ||
      value[$kind] === $int8 ||
      value[$kind] === $int16 ||
      value[$kind] === $int32 ||
      value[$kind] === $float32 ||
      value[$kind] === $float64 ||
      value[$kind] === $string8 ||
      value[$kind] === $string16 ||
      value[$kind] === $boolean)
  );
}

export function isComplexKind(value: unknown): value is ComplexKind {
  return isKindSt(value) && (value[$kind] === $array || value[$kind] === $union);
}

export function isKind(value: unknown): value is Kind {
  return isPrimitiveKind(value) || isComplexKind(value);
}

// # Schema

export const $aos = Symbol('aos');
export const $soa = Symbol('soa');
export const $tag = Symbol('tag');

export type SchemaKind = typeof $aos | typeof $soa | typeof $tag;

export type Schema = {
  [key: string]: KindSt | Schema;
  [$kind]: SchemaKind;
  [$defaultFn]: () => unknown;
};

export type SchemaId = Id;

// # To Type

export type PrimitiveKindToType<T> = T extends typeof uint8 | typeof uint16 | typeof uint32
  ? number
  : T extends typeof int8 | typeof int16 | typeof int32
  ? number
  : T extends typeof float32 | typeof float64
  ? number
  : T extends typeof string8 | typeof string16
  ? string
  : T extends typeof boolean
  ? boolean
  : never;

export type ComplexKindToType<T> = T extends ArrayKind
  ? SchemaToType<T['field']>[]
  : T extends UnionKind
  ? T['variants'][number]
  : never;

export type KindToType<T> = T extends PrimitiveKind
  ? PrimitiveKindToType<T>
  : T extends ComplexKind
  ? ComplexKindToType<T>
  : T extends KindSt
  ? ReturnType<T[typeof $defaultFn]>
  : never;

export type SchemaToType<T> = T extends Schema
  ? { [K in keyof T as K extends symbol ? never : K]: SchemaToType<T[K]> }
  : KindToType<T>;

export function isSchema(value: unknown): value is Schema {
  return (
    typeof value === 'object' &&
    value !== null &&
    $kind in value &&
    (value[$kind] === $tag || value[$kind] === $aos || value[$kind] === $soa)
  );
}

export function defaultFromSchema<S extends Omit<Schema, typeof $defaultFn>>(
  schema: S
): SchemaToType<S> {
  switch (schema[$kind]) {
    case $aos:
      const component = {} as SchemaToType<S>;
      for (const key in schema) {
        const field = schema[key];

        if (isKind(field) || isSchema(field)) {
          component[key as keyof SchemaToType<S>] = field[$defaultFn]() as any;
        } else {
          throw new Error('Invalid schema');
        }
      }
      return component;
    case $tag:
      return {} as SchemaToType<S>;
    case $soa:
      throw new Error('Not implemented');
    default:
      return safeGuard(schema[$kind]);
  }
}

export function newSchema<S extends Omit<Schema, typeof $kind | typeof $defaultFn>>(
  schema: S,
  kind?: SchemaKind,
  defaultFn?: () => SchemaToType<S>
): S & { [$kind]: SchemaKind; [$defaultFn]: () => SchemaToType<S> } {
  const newSchema: S & { [$kind]: SchemaKind } = {
    ...schema,
    [$kind]: kind ?? $aos,
  };

  const newDefaultFn = defaultFn ?? (() => defaultFromSchema(newSchema));

  return {
    ...newSchema,
    [$defaultFn]: newDefaultFn,
  } as S & { [$kind]: SchemaKind; [$defaultFn]: () => SchemaToType<S> };
}

export const Schema = {
  new: newSchema,
  default: <S extends Schema>(schema: S): SchemaToType<S> => {
    switch (schema[$kind]) {
      case $tag:
      case $aos:
        return schema[$defaultFn]() as SchemaToType<S>;
      case $soa:
        throw new Error('Not implemented');
      default:
        return safeGuard(schema[$kind]);
    }
  },
};

// # Tag

export const newTag = (): Schema & { [$kind]: typeof $tag } => {
  return {
    [$kind]: $tag,
    [$defaultFn]: () => {},
  };
};

export const Tag = {
  new: newTag,
};
