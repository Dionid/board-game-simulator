import { UNSAFE_internals } from '../internals';
import { World } from '../world';

export type EffectExecutor<$Return, $Args extends unknown[]> = (...args: $Args) => $Return;

type UnwrappedEffectState<$Return> = $Return extends Promise<infer $Resolve> ? $Resolve | null : $Return;

export type EffectApi<$Return, $Args extends unknown[]> = EffectExecutor<UnwrappedEffectState<$Return>, $Args>;

const isPromise = <$Resolve = unknown>(object: unknown): object is Promise<$Resolve> => {
  return typeof object === 'object' && object !== null && 'then' in object;
};

export type EffectFactory<$Return, $Args extends unknown[] = [], Ctx extends Record<any, any> = Record<any, any>> = (
  world: World<Ctx>
) => EffectExecutor<$Return, $Args>;

export type EffectOptions = {
  shared?: boolean;
};
type CellEffectData<$Return, $Args extends unknown[]> = {
  executor: EffectExecutor<$Return, $Args>;
  lockAsync: boolean;
  lockShare: boolean;
  lockShareStep: number | null;
  state: UnwrappedEffectState<$Return>;
};

type SystemEffectData<$Return = unknown, $Args extends unknown[] = []> = {
  cellCount: number;
  cells: CellEffectData<$Return, $Args>[];
};

export const createEffect = <
  Ctx extends Record<any, any> = Record<any, any>,
  $Return = unknown,
  $Args extends unknown[] = []
>(
  factory: EffectFactory<$Return, $Args, Ctx>,
  options: EffectOptions = { shared: false }
): EffectApi<$Return, $Args> => {
  const { shared } = options;

  // # Matrix of system effect data by world id and system id
  // [World 1: [SystemEffectData, SystemEffectData], World 2: [SystemEffectData]]
  const systemEffectDataByWorldId: SystemEffectData[][] = [];

  // # For understanding if we are in the same world step
  let previousStep: number;
  // # We need this to reset the cell count when the current world changes
  let previousWorld: number;
  // # We can understand if effect called in another or same system
  let previousSystem: number;

  let currentWorld: number;
  let latestSystemId: number;
  let cellCount: number = -1;

  return function effect(...args: $Args) {
    currentWorld = UNSAFE_internals.currentWorldId;

    const world = UNSAFE_internals.worlds[currentWorld] as World<Ctx>;
    const step = world.step;

    // # Get current world system effect data list
    let currentWorldSystemEffectData = systemEffectDataByWorldId[currentWorld];

    if (currentWorldSystemEffectData === undefined) {
      currentWorldSystemEffectData = systemEffectDataByWorldId[currentWorld] = [];
    }

    latestSystemId = shared ? 0 : world.latestSystemId;

    let currentSystemEffect = currentWorldSystemEffectData[latestSystemId];

    if (currentSystemEffect === undefined) {
      currentSystemEffect = currentWorldSystemEffectData[latestSystemId] = {
        cells: [],
        cellCount: -1,
      };
    }

    if (shared === true || (previousWorld !== currentWorld && previousWorld !== undefined)) {
      // # Reset the cell count when the current world changes
      // or when the effect is shared (because than it is singleton between all worlds)
      cellCount = 0;
    } else if (previousSystem !== undefined && (previousStep !== step || previousSystem !== latestSystemId)) {
      let previousSystemEffectData = currentWorldSystemEffectData[previousSystem];

      if (previousSystemEffectData.cellCount !== -1 && previousSystemEffectData.cellCount !== cellCount) {
        throw new Error(
          `Failed to execute effect: encountered too ${
            previousSystemEffectData.cellCount > cellCount ? 'few' : 'many'
          } effects this step`
        );
      }

      // # Save previous system cell count
      previousSystemEffectData.cellCount = cellCount;
      cellCount = 0;
    } else {
      // # Increment the cell count when the effect is not shared and the system is the same
      cellCount++;
    }

    let cell = currentSystemEffect.cells[cellCount] as CellEffectData<$Return, $Args>;

    if (!cell) {
      cell = currentSystemEffect.cells[cellCount] = {
        executor: factory(world),
        lockShare: false,
        lockAsync: false,
        lockShareStep: null,
        state: null as UnwrappedEffectState<$Return>,
      };
    }

    // # If cell is shared, than we need to check:
    // 1. If it is current step, cell must be locked
    // 2. If it is not current step, cell must be unlocked
    if (shared) {
      if (cell.lockShareStep !== world.step) {
        cell.lockShare = false;
        cell.lockShareStep = world.step;
      } else {
        cell.lockShare = true;
      }
    }

    // # If cell is locked by shared or async, than we need to return the previous state
    if (cell.lockShare || cell.lockAsync) {
      return cell.state;
    }

    // # Run effect executor
    const result = cell.executor(...args);

    if (isPromise<UnwrappedEffectState<$Return>>(result)) {
      cell.lockAsync = true;

      result
        .then((result) => (cell.state = result))
        .catch((error) => console.error(`Uncaught error in effect: ${error.message}`, error))
        .finally(() => {
          cell.lockAsync = false;
        });
    } else {
      // # Set cell new state
      cell.state = result as UnwrappedEffectState<$Return>;
    }

    // # Rewrite previous values
    previousStep = step;
    previousWorld = currentWorld;
    previousSystem = latestSystemId;

    return cell.state;
  };
};
