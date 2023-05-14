const run = (ms) => {
  return new Promise((res) => setTimeout(res, ms));
};
export const Sleep = {
  run,
};
