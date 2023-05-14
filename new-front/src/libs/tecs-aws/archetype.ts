import { safeGuard } from '../switch';
import { BitSet } from './bit-set';
import { ComponentListFromSchemaList, ComponentSchema, ComponentSchemaId, ComponentSchemaKind } from './component';
import { Entity } from './entity';
import { SparseSet } from './sparse-set';

export type ArchetypeId = string;

export type Archetype<CSL extends ReadonlyArray<ComponentSchema> = ReadonlyArray<ComponentSchema>> = {
  // # Identifiers
  id: ArchetypeId;
  mask: BitSet;

  // # Archetypes graph
  adjacent: Archetype<any>[];

  // # Entities
  sSet: SparseSet<Entity>;
  entities: Entity[];

  // # Components
  components: ComponentListFromSchemaList<CSL>;
};

export const Archetype = {
  // TODO: Pass component schemas to prefabricate components
  new: <CSL extends ReadonlyArray<ComponentSchema>>(
    id: ArchetypeId,
    componentSchemas: CSL,
    mask: BitSet
  ): Archetype<CSL> => {
    const sSet = SparseSet.new();

    const components = [];

    for (let i = 0; i < componentSchemas.length; i++) {
      const componentSchema = componentSchemas[i];

      switch (componentSchema.kind) {
        case ComponentSchemaKind.SoA: {
          components[componentSchema.id] = componentSchema.default();

          break;
        }
        case ComponentSchemaKind.Tag: {
          components[componentSchema.id] = undefined;

          break;
        }
        default: {
          safeGuard(componentSchema);
        }
      }
    }

    return {
      sSet: sSet,
      entities: sSet.dense,
      id,
      mask,
      adjacent: [],
      components: components as ComponentListFromSchemaList<CSL>,
    };
  },

  hasComponent: (arch: Archetype, componentId: ComponentSchemaId) => {
    return BitSet.has(arch.mask, componentId);
  },

  hasEntity: (arch: Archetype, entity: Entity) => {
    return SparseSet.has(arch.sSet, entity);
  },

  removeEntity: (arch: Archetype, entity: Entity) => {
    const swapEntityId = arch.sSet.dense.pop()!;

    if (swapEntityId !== entity) {
      // # If we popped incorrect entity, than pop it from all components and swap with correct
      const swapIndexInDense = arch.sSet.sparse[entity]!;
      arch.sSet.dense[swapIndexInDense] = swapEntityId;
      arch.sSet.sparse[swapEntityId] = swapIndexInDense;

      for (let i = 0; i < arch.components.length; i++) {
        const component = arch.components[i];
        // # Skip tags
        switch (component.schema.kind) {
          case ComponentSchemaKind.SoA: {
            // # Get shape keys (like x, y in Position)
            for (let i = 0; i < component.schema.shape.length; i++) {
              const key = component.schema.shape[i];
              const array = component.data![key];
              const val = array.pop();
              // # Swap
              array[swapIndexInDense] = val;
            }
            break;
          }
          case ComponentSchemaKind.Tag: {
            break;
          }
          default: {
            safeGuard(component.schema);
          }
        }
      }
    } else {
      // # If we popped correct entity, than just pop it from all components
      for (let i = 0; i < arch.components.length; i++) {
        const component = arch.components[i];
        // # Skip tags
        switch (component.schema.kind) {
          case ComponentSchemaKind.SoA: {
            // # Get shape keys (like x, y in Position)
            for (let i = 0; i < component.schema.shape.length; i++) {
              const key = component.schema.shape[i];
              const array = component.data![key];
              array.pop();
            }
            break;
          }
          case ComponentSchemaKind.Tag: {
            break;
          }
          default: {
            safeGuard(component.schema);
          }
        }
      }
    }
  },

  addEntity: (arch: Archetype, entity: Entity) => {
    arch.sSet.dense.push(entity);
    const archDenseIndex = arch.sSet.dense.length - 1;
    arch.sSet.sparse[entity] = archDenseIndex;

    for (let i = 0; i < arch.components.length; i++) {
      const component = arch.components[i];
      switch (component.schema.kind) {
        case ComponentSchemaKind.SoA: {
          // # Create default
          const def = component.schema.default();
          // # Get shape keys (like x, y in Position)
          for (let i = 0; i < component.schema.shape.length; i++) {
            const key = component.schema.shape[i];
            const array = component.data![key];
            array[archDenseIndex] = def[key];
          }
          break;
        }
        case ComponentSchemaKind.Tag: {
          // # Skip tags
          break;
        }
        default: {
          safeGuard(component.schema);
        }
      }
    }
  },

  moveEntity: (from: Archetype, to: Archetype, entity: Entity) => {
    // # Check if entity is in `to` or not in `from`
    if (to.sSet.dense[to.sSet.sparse[entity]!] === entity || from.sSet.dense[from.sSet.sparse[entity]!] !== entity) {
      return false;
    }

    // # Add to new archetype
    const swapIndexInDense = from.sSet.sparse[entity]!;

    to.sSet.dense.push(entity);
    const toDenseIndex = to.sSet.dense.length - 1;
    to.sSet.sparse[entity] = toDenseIndex;

    for (let i = 0; i < to.components.length; i++) {
      const component = to.components[i];
      switch (component.schema.kind) {
        case ComponentSchemaKind.SoA: {
          // # Get shape keys (like x, y in Position)
          for (let i = 0; i < component.schema.shape.length; i++) {
            const key = component.schema.shape[i];
            const array = component.data![key];
            array[toDenseIndex] = from.components[component.schema.id].data![key][swapIndexInDense];
          }
          break;
        }
        case ComponentSchemaKind.Tag: {
          // # Skip tags
          break;
        }
        default: {
          safeGuard(component.schema);
        }
      }
    }

    // # Remove it from `from` entities (sSet dense) and components
    Archetype.removeEntity(from, entity);

    return true;
  },
};
