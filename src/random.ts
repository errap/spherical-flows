import seedrandom, { PRNG } from "seedrandom";

const randomSeed = () => `${Math.round(Math.random() * 99999999)}`;

const rnd = () => {
  let seed = randomSeed();
  let gen: PRNG = null;

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

  const setSeed = (newSeed: string) => {
    seed = newSeed;
    gen = seedrandom(seed);
  };

  const getSeed = () => seed;

  const reset = () => setSeed(seed);

  return { random: () => getGen()(), getSeed, setSeed, reset, newSeed };
};

export default rnd();
