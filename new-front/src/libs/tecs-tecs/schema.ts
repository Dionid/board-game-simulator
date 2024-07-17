// # Types
import { Id } from './core';

export const kind = Symbol('kind');
export const defaultFn = Symbol('defaultFn');

export const numberK = Symbol('number');
export const float64K = Symbol('float64');
export const stringK = Symbol('string');

export const number = {
  [kind]: numberK,
  byteLength: 2,
  [defaultFn]: () => 0,
} as const;

export const float64 = {
  [kind]: float64K,
  byteLength: 2,
  [defaultFn]: () => 0,
} as const;

export const string = {
  [kind]: stringK,
  byteLength: 2,
  [defaultFn]: () => '',
};

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
