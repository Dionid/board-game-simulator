import { boolean, newSchema, newTag } from '../../tecs';

export const RigidBody = newTag();

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
