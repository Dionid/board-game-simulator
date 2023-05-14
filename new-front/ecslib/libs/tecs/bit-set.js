const mod32 = 0x0000001f;
export const BitSet = {
  new: (size) => {
    let mask = new Uint32Array(size); // [0, 0, 0, 0]
    return {
      mask,
      size,
    };
  },
  grow(bs, index) {
    let size = bs.size;
    if (index >= size) {
      const oldMask = bs.mask;
      size = index + 1;
      bs.mask = new Uint32Array(size);
      bs.mask.set(oldMask, 0);
    }
  },
  has(bs, value) {
    const index = value >>> 5;
    if (index >= bs.size) return false;
    return Boolean(bs.mask[index] & (1 << (value & mod32)));
  },
  xor(bs, value) {
    const index = value >>> 5;
    BitSet.grow(bs, index);
    bs.mask[index] ^= 1 << (value & mod32); // bs.mask[index] = array[value & mod32]
    return bs;
  },
  or(bs, value) {
    const index = value >>> 5;
    BitSet.grow(bs, index);
    bs.mask[index] |= 1 << (value & mod32);
    return bs;
  },
  not(bs) {
    const set = BitSet.new(bs.size);
    for (let i = 0; i < bs.mask.length; i++) {
      set.mask[i] = ~bs.mask[i];
    }
    return set;
  },
  union(bs, other) {
    if (other.mask === bs.mask) return other;
    const union = BitSet.new(Math.max(bs.size, other.size));
    for (let i = 0; i < other.mask.length; i++) {
      const a = bs.mask[i] || 0;
      const b = other.mask[i] || 0;
      union.mask[i] = a | b;
    }
    return union;
  },
  intersection(bs, other) {
    if (other.mask === bs.mask) return other;
    const intersection = BitSet.new(Math.min(bs.size, other.size));
    for (let i = 0; i < intersection.mask.length; i++) {
      const a = bs.mask[i];
      const b = other.mask[i];
      intersection.mask[i] = a & b;
    }
    return intersection;
  },
  difference(bs, other) {
    if (other.mask === bs.mask) return other;
    const diff = BitSet.new(bs.size);
    for (let i = 0; i < diff.mask.length; i++) {
      const a = bs.mask[i];
      const b = other.mask[i] || 0;
      diff.mask[i] = a & ~b;
    }
    return diff;
  },
  symmetricDifference(bs, other) {
    if (other.mask === bs.mask) return other;
    const symDiff = BitSet.new(Math.max(bs.size, other.size));
    for (let i = 0; i < symDiff.mask.length; i++) {
      const a = bs.mask[i] || 0;
      const b = other.mask[i] || 0;
      symDiff.mask[i] = a ^ b;
    }
    return symDiff;
  },
  contains(bs, other) {
    if (other.mask === bs.mask) return true;
    for (let i = 0; i < other.mask.length; i++) {
      const a = bs.mask[i] || 0;
      const b = other.mask[i];
      if ((a & b) !== b) return false;
    }
    return true;
  },
  intersects(bs, other) {
    if (other.mask === bs.mask) return true;
    const length = Math.min(bs.mask.length, other.mask.length);
    for (let i = 0; i < length; i++) {
      const a = bs.mask[i];
      const b = other.mask[i];
      if ((a & b) !== 0) return true;
    }
    return false;
  },
  toString(bs, radix = 16) {
    if (bs.mask.length === 0) return '0';
    return bs.mask.reduceRight((str, n) => str.concat(n.toString(radix)), '');
  },
  copy(bs) {
    const set = BitSet.new(bs.size);
    set.mask.set(bs.mask, 0);
    return set;
  },
  values(bs) {
    const values = [];
    for (let i = 0, l = bs.mask.length; i < l; i++) {
      const bits = bs.mask[i];
      for (let shift = 0; shift < 32; shift++) {
        if (bits & (1 << shift)) {
          values.push((i << 5) | shift);
        }
      }
    }
    return values;
  },
};
