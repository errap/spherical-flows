import { getPerlinNoiseVectorFn } from "./noise";
import { GlParticles, GlParticlesConstructorProps } from "./glParticles";
import { Renderer } from "./renderer";

interface PolarCoordinates {
  theta: number;
  phi: number;
}

interface Vector2D {
  x: number;
  y: number;
}

interface Vector3D {
  x: number;
  y: number;
  z: number;
}

interface Particle {
  // Position of the particle in polar coordinates
  position: PolarCoordinates;
  // Velocity in local tangent plane (Cartesian coordinates)
  velocity: Vector3D;
}

const FRICTION = 0.01;

const createParticle = () => {
  // Generate random position on sphere using uniform sampling
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);

  // Generate random velocity in tangent plane
  const velocityX = Math.random() * 0.01 - 0.005;
  const velocityY = Math.random() * 0.001 - 0.0005;
  const velocityZ = Math.random() * 0.001 - 0.0005;

  return {
    position: { theta, phi },
    velocity: { x: velocityX, y: velocityY, z: velocityZ },
  };
};

interface SimulationConstructorProps extends GlParticlesConstructorProps {
  numberOfParticles: number;
}

/**
 * Class representing a simulation of particles on the surface of a sphere.
 * They move according to their own velocity and a vector field generated with perlin noise.
 */
export class Simulation {
  private readonly glParticles: GlParticles;
  private readonly sphereRadius: number;
  private readonly vectorField: (x: number, y: number, z: number) => Vector2D;
  particles: Particle[] = [];

  constructor(props: SimulationConstructorProps) {
    this.vectorField = getPerlinNoiseVectorFn({ resolution: 0.05 });
    this.sphereRadius = props.sphereRadius;
    this.particles = new Array(props.numberOfParticles).fill(0).map(createParticle);
    this.glParticles = new GlParticles(props);
  }

  init() {
    this.glParticles.init({ simulation: this });
  }

  addToRenderer(renderer: Renderer) {
    this.glParticles.addToRenderer(renderer);
  }

  fromPolarToCartesian(coords: PolarCoordinates): Vector3D {
    const x = this.sphereRadius * Math.sin(coords.phi) * Math.cos(coords.theta);
    const y = this.sphereRadius * Math.sin(coords.phi) * Math.sin(coords.theta);
    const z = this.sphereRadius * Math.cos(coords.phi);

    return { x, y, z };
  }

  fromCartesianToPolar(cart: { x: number; y: number; z: number }): PolarCoordinates {
    const r = Math.sqrt(cart.x * cart.x + cart.y * cart.y + cart.z * cart.z);

    return { theta: Math.atan2(cart.y, cart.x), phi: Math.acos(cart.z / r) };
  }

  update({ deltaTime, step }: { deltaTime: number; step: number }) {
    this.particles.forEach((particle) => {
      const cartesianPosition = this.fromPolarToCartesian(particle.position);

      const vectorFieldVelocity = this.vectorField(cartesianPosition.x, cartesianPosition.y, cartesianPosition.z);
      particle.velocity.x += 0.05 * vectorFieldVelocity.x * deltaTime;
      particle.velocity.y += 0.05 * vectorFieldVelocity.y * deltaTime;

      cartesianPosition.x += particle.velocity.x * deltaTime;
      cartesianPosition.y += particle.velocity.y * deltaTime;
      cartesianPosition.z += particle.velocity.z * deltaTime;

      const newRadialDistance = Math.sqrt(
        cartesianPosition.x ** 2 + cartesianPosition.y ** 2 + cartesianPosition.z ** 2
      );

      // Normalize to move it back to the Earth's surface
      cartesianPosition.x *= this.sphereRadius / newRadialDistance;
      cartesianPosition.y *= this.sphereRadius / newRadialDistance;
      cartesianPosition.z *= this.sphereRadius / newRadialDistance;

      // Update the plane's position
      particle.position = this.fromCartesianToPolar(cartesianPosition);

      // Now also update the velocity vector to reflect it being on the sphere
      const surfaceNormal = {
        x: cartesianPosition.x / this.sphereRadius,
        y: cartesianPosition.y / this.sphereRadius,
        z: cartesianPosition.z / this.sphereRadius,
      };
      const dotProduct =
        particle.velocity.x * surfaceNormal.x +
        particle.velocity.y * surfaceNormal.y +
        particle.velocity.z * surfaceNormal.z;

      // Subtract the normal component from the current velocity to keep it tangent to the sphere
      particle.velocity = {
        x: particle.velocity.x - dotProduct * surfaceNormal.x,
        y: particle.velocity.y - dotProduct * surfaceNormal.y,
        z: particle.velocity.z - dotProduct * surfaceNormal.z,
      };

      particle.velocity.x *= 1 - FRICTION;
      particle.velocity.y *= 1 - FRICTION;
      particle.velocity.z *= 1 - FRICTION;

      const velocityMagnitude = Math.sqrt(
        particle.velocity.x ** 2 + particle.velocity.y ** 2 + particle.velocity.z ** 2
      );

      if (velocityMagnitude < 0.01) {
        const newParticle = createParticle();
        particle.position = newParticle.position;
        particle.velocity = newParticle.velocity;
      }
    });

    this.glParticles.update(this, step);
  }
}
