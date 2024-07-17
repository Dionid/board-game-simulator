// # Types
import { Id } from './core';

export const kind = Symbol('kind');
export const defaultFn = Symbol('defaultFn');

// # Kinds

export const uint8K = Symbol('uint8');
export const uint16K = Symbol('uint16');
export const uint32K = Symbol('uint32');

export const int8K = Symbol('int8');
export const int16K = Symbol('int16');
export const int32K = Symbol('int32');

export const float32K = Symbol('float32');
export const float64K = Symbol('float64');

export const string8K = Symbol('string8');
export const string16K = Symbol('string16');

export const booleanK = Symbol('boolean');

export const numberK = float64K;
export const stringK = string16K;

export const uint8 = {
  [kind]: uint8K,
  byteLength: 1,
  [defaultFn]: () => 0,
} as const;

export const uint16 = {
  [kind]: uint16K,
  byteLength: 2,
  [defaultFn]: () => 0,
} as const;

export const uint32 = {
  [kind]: uint32K,
  byteLength: 4,
  [defaultFn]: () => 0,
} as const;

export const int8 = {
  [kind]: int8K,
  byteLength: 1,
  [defaultFn]: () => 0,
} as const;

export const int16 = {
  [kind]: int16K,
  byteLength: 2,
  [defaultFn]: () => 0,
} as const;

export const int32 = {
  [kind]: int32K,
  byteLength: 4,
  [defaultFn]: () => 0,
} as const;

export const float32 = {
  [kind]: float32K,
  byteLength: 4,
  [defaultFn]: () => 0,
} as const;

export const float64 = {
  [kind]: float64K,
  byteLength: 8,
  [defaultFn]: () => 0,
} as const;

export const string8 = {
  [kind]: string8K,
  byteLength: 1,
  [defaultFn]: () => '',
};

export const string16 = {
  [kind]: string16K,
  byteLength: 2,
  [defaultFn]: () => '',
};

export const number = float64;
export const string = string16;

export type Types = typeof number | typeof float64 | typeof string;

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
  [defaultFn]: () => SchemaType<Types>;
};

// # Schema

export const aosK = Symbol('aos');
export const soaK = Symbol('soa');
export const tagK = Symbol('tag');

export type SchemaKind = typeof tagK | typeof aosK | typeof soaK;

export type Schema = {
  [key: string]: Field | Schema;
  [kind]?: SchemaKind;
};
export type SchemaId = Id;

export type SchemaType<T> = T extends typeof float64 | typeof number
  ? number
  : T extends typeof string
  ? string
  : T extends Schema
  ? { [K in keyof T as K extends symbol ? never : K]: SchemaType<T[K]> }
  : never;

export const Tag = {
  new: (): Schema => {
    return {
      [kind]: tagK,
    };
  },
};

export const Schema = {
  default: <S extends Schema>(schema: S): SchemaType<S> => {
    const schemaKind = schema[kind];

    if (schemaKind === tagK) {
      return {} as SchemaType<S>;
    }

    const component = {} as SchemaType<S>;
    // TODO: How to add tags
    // TODO: Add recursive default props
    for (const key in schema) {
      const field = schema[key];
      if (defaultFn in field) {
        component[key] = field[defaultFn]() as any;
      }
    }
    return component;
  },
};
