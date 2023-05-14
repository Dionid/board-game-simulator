export type ComponentSchemaId = number;

export enum ComponentSchemaKind {
  SoA,
  Tag,
  // AoS,
}

export type ComponentSchemaSoA<Data extends Record<string, any[]> = Record<string, any[]>> = {
  id: ComponentSchemaId;
  kind: ComponentSchemaKind.SoA;
  shape: (keyof Data)[];
  default: () => Data;
};

export type ComponentSchemaTag = {
  id: ComponentSchemaId;
  kind: ComponentSchemaKind.Tag;
};

export type ComponentSchema<Data extends Record<string, any[]> | undefined = Record<string, any[]> | undefined> =
  Data extends Record<string, any[]> ? ComponentSchemaSoA<Data> : ComponentSchemaTag;

export type DataFromComponentSchemas<$Type extends ReadonlyArray<ComponentSchema>> = {
  [K in keyof $Type]: $Type[K] extends ComponentSchema
    ? $Type[K] extends ComponentSchemaSoA<any>
      ? ReturnType<$Type[K]['default']>
      : undefined
    : never;
};

// # Component

export type Component<Data extends Record<string, any[]> | undefined = Record<string, any[]> | undefined> = {
  schema: ComponentSchema<Data>;
  data: Data;
};

export type ComponentFromSchema<C extends ComponentSchema> = C extends ComponentSchemaSoA<infer Data>
  ? Component<Data>
  : Component<undefined>;

export type ComponentListFromSchemaList<C extends ReadonlyArray<ComponentSchema>> = {
  [K in keyof C]: ComponentFromSchema<C[K]>;
};
