const run = (ms: number) => {
  return new Promise((res) => setTimeout(res, ms));
};

export const Sleep = {
  run,
};
