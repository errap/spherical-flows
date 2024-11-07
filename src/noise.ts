import { createNoise3D } from "simplex-noise";
import rnd from "./random";

export type NoiseFn = ReturnType<typeof getNoiseFn>;

export const getNoiseFn = ({ resolution }: { resolution: number }) => {
  const randomFn = createNoise3D(rnd.random);

  return (x: number, y: number, z: number) => {
    /**
     * We interpret the noise value as an angle for the velocity vector. The noise generation function
     * returns a numeric value in the range [-1, 1] and we need to transform that into [-PI, PI] to offer
     * a full range of angles (in radians).
     *
     * Finally, the X component is the cosine of the angle and the Y component is its sine
     */
    const angle = randomFn(x * resolution, y * resolution, z * resolution) * Math.PI;

    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  };
};
