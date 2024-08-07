import { literal, newSchema, newTag, number, union } from '../../tecs';

export const RigidBody = newSchema({
  elasticity: number,
  elasticityMode: union(literal('average'), literal('min'), literal('multiply'), literal('max')),
});

export const Static = newTag();
export const Kinematic = newTag();
export const Dynamic = newTag();

export const Force2 = newSchema({
  x: number,
  y: number,
});

export const Impulse2 = newSchema({
  x: number,
  y: number,
});
