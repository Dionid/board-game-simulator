import {
  archetypeByEntity,
  newSchema,
  newTag,
  number,
  removeComponent,
  setComponent,
  System,
  tryComponent,
} from 'libs/tecs';
import { Collider, collisionEndedTopic, collisionStartedTopic } from '../collision';

export const Ground = newTag('Ground');
export const GroundDetection = newTag('GroundDetection');

export const IsGrounded = newSchema(
  {
    entity: number,
    collider: Collider,
  },
  {
    name: 'IsGrounded',
  }
);

export const COLLIDER_GROUND_DETECTOR_TAG = 'ground-detector-collider';

export function isGrounded(): System {
  return ({ essence }) => {
    // # Add IsGrounded component
    for (const event of collisionStartedTopic) {
      const { a, b } = event;

      console.log('collisionStartedTopic', event);

      const aIsGroundDetectorCollider = a.collider.tags.some(
        (t) => t === COLLIDER_GROUND_DETECTOR_TAG
      );
      const bIsGroundDetectorCollider = b.collider.tags.some(
        (t) => t === COLLIDER_GROUND_DETECTOR_TAG
      );

      // # If both are not ground detector, skip
      if (!aIsGroundDetectorCollider && !bIsGroundDetectorCollider) {
        continue;
      }

      const aArchetype = archetypeByEntity(essence, a.entity);
      const bArchetype = archetypeByEntity(essence, b.entity);

      const aGroundDetection = tryComponent(aArchetype, a.entity, GroundDetection);
      const bGroundDetection = tryComponent(bArchetype, b.entity, GroundDetection);

      // # If non has ground detection or both has ground detection, skip
      if ((!aGroundDetection && !bGroundDetection) || (aGroundDetection && bGroundDetection)) {
        continue;
      }

      const aGround = tryComponent(aArchetype, a.entity, Ground);
      const bGround = tryComponent(bArchetype, b.entity, Ground);

      // # If both are ground or both are not ground, skip
      if ((aGround && bGround) || (!aGround && !bGround)) {
        continue;
      }

      const groundDetection = aGroundDetection ? a : b;
      const ground = aGround ? a : b;

      setComponent(essence, groundDetection.entity, IsGrounded, {
        entity: ground.entity,
        collider: ground.collider,
      });
    }

    // # Remove IsGrounded component
    for (const event of collisionEndedTopic) {
      const { a, b } = event;

      console.log('collisionEndedTopic', event);

      // # If colliding collider is not ground detector, skip
      if (
        !a.collider.tags.some((t) => t === COLLIDER_GROUND_DETECTOR_TAG) &&
        !b.collider.tags.some((t) => t === COLLIDER_GROUND_DETECTOR_TAG)
      ) {
        continue;
      }

      const aArchetype = archetypeByEntity(essence, a.entity);
      const bArchetype = archetypeByEntity(essence, b.entity);

      const aIsGrounded = tryComponent(aArchetype, a.entity, IsGrounded);
      const bIsGrounded = tryComponent(bArchetype, b.entity, IsGrounded);

      // # If not already grounded, skip
      if (!aIsGrounded && !bIsGrounded) {
        continue;
      }

      const isGroundedComponent = aIsGrounded ?? bIsGrounded;

      if (!isGroundedComponent) {
        continue;
      }

      const aGround = tryComponent(aArchetype, a.entity, Ground);
      const bGround = tryComponent(bArchetype, b.entity, Ground);

      // # If both are ground or both are not ground, skip
      if ((aGround && bGround) || (!aGround && !bGround)) {
        continue;
      }

      const isGroundedCollision = aIsGrounded ? a : b;
      const ground = aGround ? a : b;

      // # If not grounded to the same entity, skip
      if (isGroundedComponent.entity !== ground.entity) {
        continue;
      }

      // # Remove IsGrounded component
      removeComponent(essence, isGroundedCollision.entity, IsGrounded);
    }
  };
}
