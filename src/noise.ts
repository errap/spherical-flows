import * as noise from "./lib/noise";
import rnd from "./random";

export const getPerlinNoiseVectorFn = ({ resolution }: { resolution: number }) => {
  const seed = rnd.random();
  noise.seed(seed);

  return (x: number, y: number, z: number) => {
    const angle = noise.perlin3(x * resolution, y * resolution, z * resolution) * Math.PI * 2;

    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  };
};
