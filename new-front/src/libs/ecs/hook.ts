import { UNSAFE_internals } from './internals';
import { World } from './world';

export type HookExecutor<$Return, $Args extends unknown[]> = (...args: $Args) => $Return;

type UnwrappedHookState<$Return> = $Return extends Promise<infer $Resolve> ? $Resolve | null : $Return;

export type HookApi<$Return, $Args extends unknown[]> = HookExecutor<UnwrappedHookState<$Return>, $Args>;

const isPromise = <$Resolve = unknown>(object: unknown): object is Promise<$Resolve> => {
  return typeof object === 'object' && object !== null && 'then' in object;
};

export type HookFactory<$Return, $Args extends unknown[] = [], Ctx extends Record<any, any> = Record<any, any>> = (
  world: World<Ctx>
) => HookExecutor<$Return, $Args>;

export type HookOptions = {
  singletonPerStep?: boolean;
};

type CellHookData<$Return, $Args extends unknown[]> = {
  executor: HookExecutor<$Return, $Args>;
  lockAsync: boolean;
  lockShare: boolean;
  lockShareStep: number | null;
  state: UnwrappedHookState<$Return>;
};

type SystemHookData<$Return = unknown, $Args extends unknown[] = []> = {
  cellCount: number;
  cells: CellHookData<$Return, $Args>[];
};

export const createHook = <
  Ctx extends Record<any, any> = Record<any, any>,
  $Return = unknown,
  $Args extends unknown[] = []
>(
  factory: HookFactory<$Return, $Args, Ctx>,
  options: HookOptions = { singletonPerStep: false }
): HookApi<$Return, $Args> => {
  const { singletonPerStep: shared } = options;

  // # Matrix of system hook data by world id and system id
  // [World 1: [SystemHookData, SystemHookData], World 2: [SystemHookData]]
  const systemHookDataByWorldId: SystemHookData[][] = [];

  // # For understanding if we are in the same world step
  let previousStep: number;
  // # We need this to reset the cell count when the current world changes
  let previousWorld: number;
  // # We can understand if hook called in another or same system
  let previousSystem: number;

  let currentWorld: number;
  let latestSystemId: number;
  let cellCount: number = -1;

  return function hook(...args: $Args) {
    currentWorld = UNSAFE_internals.currentWorldId;

    const world = UNSAFE_internals.worlds[currentWorld] as World<Ctx>;
    const step = world.step;

    // # Get current world system hook data list
    let currentWorldSystemHookData = systemHookDataByWorldId[currentWorld];

    if (currentWorldSystemHookData === undefined) {
      currentWorldSystemHookData = systemHookDataByWorldId[currentWorld] = [];
    }

    latestSystemId = shared ? 0 : world.latestSystemId;

    let currentSystemHook = currentWorldSystemHookData[latestSystemId];

    if (currentSystemHook === undefined) {
      currentSystemHook = currentWorldSystemHookData[latestSystemId] = {
        cells: [],
        cellCount: -1,
      };
    }

    if (shared === true || (previousWorld !== currentWorld && previousWorld !== undefined)) {
      // # Reset the cell count when the current world changes
      // or when the hook is shared (because than it is singleton between all worlds)
      cellCount = 0;
    } else if (previousSystem !== undefined && (previousStep !== step || previousSystem !== latestSystemId)) {
      let previousSystemHookData = currentWorldSystemHookData[previousSystem];

      if (previousSystemHookData.cellCount !== -1 && previousSystemHookData.cellCount !== cellCount) {
        throw new Error(
          `Failed to execute hook: encountered too ${
            previousSystemHookData.cellCount > cellCount ? 'few' : 'many'
          } hooks this step`
        );
      }

      // # Save previous system cell count
      previousSystemHookData.cellCount = cellCount;
      cellCount = 0;
    } else {
      // # Increment the cell count when the hook is not shared and the system is the same
      cellCount++;
    }

    let cell = currentSystemHook.cells[cellCount] as CellHookData<$Return, $Args>;

    if (!cell) {
      cell = currentSystemHook.cells[cellCount] = {
        executor: factory(world),
        lockShare: false,
        lockAsync: false,
        lockShareStep: null,
        state: null as UnwrappedHookState<$Return>,
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

    // # Run hook executor
    const result = cell.executor(...args);

    if (isPromise<UnwrappedHookState<$Return>>(result)) {
      cell.lockAsync = true;

      result
        .then((result) => (cell.state = result))
        .catch((error) => console.error(`Uncaught error in hook: ${error.message}`, error))
        .finally(() => {
          cell.lockAsync = false;
        });
    } else {
      // # Set cell new state
      cell.state = result as UnwrappedHookState<$Return>;
    }

    // # Rewrite previous values
    previousStep = step;
    previousWorld = currentWorld;
    previousSystem = latestSystemId;

    return cell.state;
  };
};
