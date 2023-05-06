var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i['return'])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
import { UNSAFE_internals } from './internals';
var isPromise = function (object) {
  return typeof object === 'object' && object !== null && 'then' in object;
};
export var createHook = function (factory, options) {
  if (options === void 0) {
    options = { singletonPerStep: false };
  }
  var shared = options.singletonPerStep;
  // # Matrix of system hook data by world id and system id
  // [World 1: [SystemHookData, SystemHookData], World 2: [SystemHookData]]
  var systemHookDataByWorldId = [];
  // # For understanding if we are in the same world step
  var previousStep;
  // # We need this to reset the cell count when the current world changes
  var previousWorld;
  // # We can understand if hook called in another or same system
  var previousSystem;
  var currentWorld;
  var latestSystemId;
  var cellCount = -1;
  return function hook() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    currentWorld = UNSAFE_internals.currentWorldId;
    var world = UNSAFE_internals.worlds[currentWorld];
    var step = world.step;
    // # Get current world system hook data list
    var currentWorldSystemHookData = systemHookDataByWorldId[currentWorld];
    if (currentWorldSystemHookData === undefined) {
      currentWorldSystemHookData = systemHookDataByWorldId[currentWorld] = [];
    }
    latestSystemId = shared ? 0 : world.latestSystemId;
    var currentSystemHook = currentWorldSystemHookData[latestSystemId];
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
      var previousSystemHookData = currentWorldSystemHookData[previousSystem];
      if (previousSystemHookData.cellCount !== -1 && previousSystemHookData.cellCount !== cellCount) {
        throw new Error(
          'Failed to execute hook: encountered too '.concat(
            previousSystemHookData.cellCount > cellCount ? 'few' : 'many',
            ' hooks this step'
          )
        );
      }
      // # Save previous system cell count
      previousSystemHookData.cellCount = cellCount;
      cellCount = 0;
    } else {
      // # Increment the cell count when the hook is not shared and the system is the same
      cellCount++;
    }
    var cell = currentSystemHook.cells[cellCount];
    if (!cell) {
      cell = currentSystemHook.cells[cellCount] = {
        executor: factory(world),
        lockShare: false,
        lockAsync: false,
        lockShareStep: null,
        state: null,
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
    var result = cell.executor.apply(cell, __spreadArray([], __read(args), false));
    if (isPromise(result)) {
      cell.lockAsync = true;
      result
        .then(function (result) {
          return (cell.state = result);
        })
        .catch(function (error) {
          return console.error('Uncaught error in hook: '.concat(error.message), error);
        })
        .finally(function () {
          cell.lockAsync = false;
        });
    } else {
      // # Set cell new state
      cell.state = result;
    }
    // # Rewrite previous values
    previousStep = step;
    previousWorld = currentWorld;
    previousSystem = latestSystemId;
    return cell.state;
  };
};
