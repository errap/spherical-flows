import * as noise from "./lib/noise";
import rnd from "./random";

/**
 * Generates a function that computes a Perlin noise vector.
 *
 * @param {Object} params - The parameters object.
 * @param {number} params.resolution - The resolution factor for the Perlin noise.
 * @returns {function(number, number, number): Object} A function that takes x, y, z coordinates and returns an object containing a force and angle computed using Perlin noise.
 */
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
