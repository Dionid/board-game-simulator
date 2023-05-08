import { $systemId } from './system';
import { Essence } from './essence';
import { UNSAFE_internals } from './internals';
export const World = {
  new: (world) => {
    const systems = world.systems || [];
    let systemIds = world.systemIds || 0;
    for (let i = 0; i < systems.length; i++) {
      const system = systems[i];
      system[$systemId] = systemIds++;
    }
    const newWorld = {
      id: UNSAFE_internals.worlds.length,
      systemIds,
      step: world.step || 0,
      latestSystemId: -1,
      ctx: world.ctx,
      essence: world.essence,
      systems,
    };
    UNSAFE_internals.worlds.push(newWorld);
    return newWorld;
  },
  run: (world) => {
    // # Store previous world
    let prevWorld = UNSAFE_internals.currentWorldId;
    // # Assign current one
    UNSAFE_internals.currentWorldId = world.id;
    // # Activate pending events
    Essence.flushEvents(world.essence);
    // # Run systems
    for (const system of world.systems) {
      // # Assign current system
      world.latestSystemId = system[$systemId];
      // # Run system
      system(world);
    }
    // # Remove done events
    Essence.clearEvents(world.essence);
    // # Increment step
    world.step++;
    // # Restore previous world
    UNSAFE_internals.currentWorldId = prevWorld;
  },
};
