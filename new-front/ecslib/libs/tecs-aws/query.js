import { BitSet } from './bit-set';
export const Query = {
  new: (components) => {
    const result = [];
    const mask = Query.makeMask(components.map((c) => c.id));
    return {
      result,
      mask,
      tryAdd: (archetype) => {
        if (!BitSet.contains(archetype.mask, mask)) {
          return false;
        }
        const resultComponents = [];
        for (let i = 0; i < components.length; i++) {
          const componentId = components[i].id;
          resultComponents.push(archetype.components[componentId].data);
        }
        result.push([archetype, resultComponents]);
        return true;
      },
    };
  },
  makeMask: (componentIds) => {
    const max = Math.max(...componentIds);
    const mask = BitSet.new(Math.ceil(max / 32));
    for (let i = 0; i < componentIds.length; i++) {
      BitSet.or(mask, componentIds[i]);
    }
    return mask;
  },
};
