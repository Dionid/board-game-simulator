import { safeGuard } from '../switch';
import { BitSet } from './bit-set';
import { ComponentSchemaKind } from './component';
import { SparseSet } from './sparse-set';
export const Archetype = {
  // TODO: Pass component schemas to prefabricate components
  new: (id, componentSchemas, mask) => {
    const sSet = SparseSet.new();
    const components = [];
    for (let i = 0; i < componentSchemas.length; i++) {
      const componentSchema = componentSchemas[i];
      switch (componentSchema.kind) {
        case ComponentSchemaKind.SoA: {
          components[componentSchema.id] = {
            schema: componentSchema,
            data: componentSchema.default(),
          };
          break;
        }
        case ComponentSchemaKind.Tag: {
          components[componentSchema.id] = {
            schema: componentSchema,
            data: undefined,
          };
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
      components: components,
    };
  },
  hasComponent: (arch, componentId) => {
    return BitSet.has(arch.mask, componentId);
  },
  getComponent: (arch, componentSchema) => {
    const componentId = componentSchema.id;
    const component = arch.components[componentId];
    if (!component) {
      throw new Error(`Can't find component ${componentSchema.id} on this archetype ${arch.id}`);
    }
    return component;
  },
  hasEntity: (arch, entity) => {
    return SparseSet.has(arch.sSet, entity);
  },
  removeEntity: (arch, entity) => {
    const swapEntityId = arch.sSet.dense.pop();
    if (swapEntityId !== entity) {
      // # If we popped incorrect entity, than pop it from all components and swap with correct
      const swapIndexInDense = arch.sSet.sparse[entity];
      arch.sSet.dense[swapIndexInDense] = swapEntityId;
      arch.sSet.sparse[swapEntityId] = swapIndexInDense;
      for (let i = 0; i < arch.components.length; i++) {
        const component = arch.components[i];
        if (!component) continue;
        // # Skip tags
        switch (component.schema.kind) {
          case ComponentSchemaKind.SoA: {
            // # Get shape keys (like x, y in Position)
            for (let i = 0; i < component.schema.shape.length; i++) {
              const key = component.schema.shape[i];
              const array = component.data[key];
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
        if (!component) continue;
        // # Skip tags
        switch (component.schema.kind) {
          case ComponentSchemaKind.SoA: {
            // # Get shape keys (like x, y in Position)
            for (let i = 0; i < component.schema.shape.length; i++) {
              const key = component.schema.shape[i];
              const array = component.data[key];
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
  addEntity: (arch, entity) => {
    arch.sSet.dense.push(entity);
    const archDenseIndex = arch.sSet.dense.length - 1;
    arch.sSet.sparse[entity] = archDenseIndex;
    for (let i = 0; i < arch.components.length; i++) {
      const component = arch.components[i];
      if (!component) continue;
      switch (component.schema.kind) {
        case ComponentSchemaKind.SoA: {
          // # Create default
          const def = component.schema.defaultValues();
          // # Get shape keys (like x, y in Position)
          for (let i = 0; i < component.schema.shape.length; i++) {
            const key = component.schema.shape[i];
            const array = component.data[key];
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
  moveEntity: (from, to, entity) => {
    // # Check if entity is in `to` or not in `from`
    if (to.sSet.dense[to.sSet.sparse[entity]] === entity || from.sSet.dense[from.sSet.sparse[entity]] !== entity) {
      return false;
    }
    // # Add to new archetype
    const swapIndexInDense = from.sSet.sparse[entity];
    to.sSet.dense.push(entity);
    const toDenseIndex = to.sSet.dense.length - 1;
    to.sSet.sparse[entity] = toDenseIndex;
    for (let i = 0; i < to.components.length; i++) {
      const component = to.components[i];
      if (!component) continue;
      switch (component.schema.kind) {
        case ComponentSchemaKind.SoA: {
          // # Get shape keys (like x, y in Position)
          for (let i = 0; i < component.schema.shape.length; i++) {
            const key = component.schema.shape[i];
            const array = component.data[key];
            array[toDenseIndex] = from.components[component.schema.id].data[key][swapIndexInDense];
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
