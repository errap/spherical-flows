import seedrandom from "./lib/seedrandom";

const randomSeed = () => Math.round(Math.random() * 99999999);

type Generator = () => () => number;

const rnd = () => {
  let seed = randomSeed();
  let gen: Generator = null;

  const getGen = () => {
    if (gen === null) {
      gen = seedrandom(seed);
    }

    return gen;
  };

  const newSeed = () => {
    seed = randomSeed();
    gen = seedrandom(seed);
  };

  const setSeed = (newSeed: number) => {
    seed = newSeed;
    gen = seedrandom(seed);
  };

  const getSeed = () => seed;

  const reset = () => setSeed(seed);

  return { random: () => getGen()(), getSeed, setSeed, reset, newSeed };
};

export default rnd();
