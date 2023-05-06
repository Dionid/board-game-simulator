var run = function (ms) {
  return new Promise(function (res) {
    return setTimeout(res, ms);
  });
};
export var Sleep = {
  run: run,
};
