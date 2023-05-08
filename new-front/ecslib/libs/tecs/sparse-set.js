export const SparseSet = {
  new: () => {
    return {
      sparse: [],
      dense: [],
    };
  },
  has: (sSet, x) => {
    return sSet.dense[sSet.sparse[x]] === x;
  },
  add: (sSet, value) => {
    if (
      value >= sSet.sparse.length ||
      sSet.sparse[value] === undefined ||
      sSet.sparse[value] >= sSet.dense.length ||
      sSet.dense[sSet.sparse[value]] !== value
    ) {
      sSet.sparse[value] = sSet.dense.length;
      sSet.dense.push(value);
    }
    // sSet.sparse[x] = sSet.dense.push(x) - 1;
  },
  remove: (sSet, value) => {
    if (sSet.dense[sSet.sparse[value]] === value) {
      const swap = sSet.dense.pop();
      if (swap !== value) {
        sSet.dense[sSet.sparse[value]] = swap;
        sSet.sparse[swap] = sSet.sparse[value];
      }
    }
  },
};
