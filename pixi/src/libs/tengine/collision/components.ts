import { newSchema, arrayOf, union, literal, number, newTag, string } from '../../tecs';
import { Axes2, Vector2, Vertices2 } from '../core';

// # Check this object for collisions with any other Colliders
export const CollisionsMonitoring = newTag('CollisionsMonitoring');

// # Forbid penetration of solid Colliders
export const Impenetrable = newTag('Impenetrable');

// # Awaken
export const Awaken = newTag('Awaken');
