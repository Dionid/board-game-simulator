import { boolean, literal, newSchema, newTag, number, union } from '../../tecs';

export const RigidBody = newSchema({
  elasticity: number,
  elasticityMode: union(literal('average'), literal('min'), literal('multiply'), literal('max')),
});

export const Static = newTag();
export const Kinematic = newTag();
export const Dynamic = newTag();

export const LockTranslation2 = newSchema({
  x: boolean,
  y: boolean,
});

// export const Rotation = newSchema({
//   value: number,
// });

// export const LockRotation2 = newSchema({
//   x: boolean,
//   y: boolean,
// });
