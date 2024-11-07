import * as THREE from "three";
import { Simulation } from "./simulation";
import { Gradient } from "./color";
import { Renderer } from "./renderer";

const createCamera = () => {
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
  camera.up = new THREE.Vector3(0, 0, 1);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.translateX(100);
  camera.translateY(100);
  camera.translateZ(100);

  return camera;
};

const createScene = ({ backgroundColor }: { backgroundColor: THREE.ColorRepresentation }) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(backgroundColor);
  return scene;
};

export interface GlParticlesConstructorProps {
  sphereRadius: number;
  particleSize: number;
  backgroundColor: THREE.ColorRepresentation;
  gradient: Gradient;
}

/**
 * The GlParticles class is responsible for representing and managing a
 * collection of particles in a 3D space, rendered using WebGL.
 */
export class GlParticles {
  private readonly sphereRadius: number;
  private readonly particleSize: number;
  private gradient: Gradient;
  private geometry = new THREE.BufferGeometry();
  private vertices: number[] = [];
  private colors: number[] = [];
  private material: THREE.PointsMaterial;
  private sprite = new THREE.TextureLoader().load("textures/sprites/disc.png");
  private points: THREE.Points;
  camera: THREE.Camera;
  scene: THREE.Scene;

  constructor({ backgroundColor, gradient, sphereRadius, particleSize }: GlParticlesConstructorProps) {
    this.camera = createCamera();
    this.scene = createScene({ backgroundColor });
    this.gradient = gradient;
    this.particleSize = particleSize;
    this.sphereRadius = sphereRadius;
  }

  init({ simulation }: { simulation: Simulation }) {
    simulation.particles.forEach((particle) => {
      const x = this.sphereRadius * Math.sin(particle.position.phi) * Math.cos(particle.position.theta);
      const y = this.sphereRadius * Math.sin(particle.position.phi) * Math.sin(particle.position.theta);
      const z = this.sphereRadius * Math.cos(particle.position.phi);

      this.vertices.push(x, y, z);

      // Calculate the velocity magnitude
      const speed = Math.sqrt(
        particle.velocity.x * particle.velocity.x +
          particle.velocity.y * particle.velocity.y +
          particle.velocity.z * particle.velocity.z
      );

      // Map the speed to a color (red-ish for higher speeds)
      const color = new THREE.Color();
      color.setHSL(0, speed * 10, 0.5); // Adjust the HSL values as needed for desired effect

      this.colors.push(color.r, color.g, color.b);
    });

    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.vertices, 3));
    this.geometry.setAttribute("color", new THREE.Float32BufferAttribute(this.colors, 3));

    this.material = new THREE.PointsMaterial({
      size: this.particleSize,
      vertexColors: true, // Enable vertex colors
      map: this.sprite,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  addToRenderer(renderer: Renderer) {
    renderer.add({ scene: this.scene, camera: this.camera }, { addControls: true });
  }

  update(simulation: Simulation, step: number) {
    const positions = this.points.geometry.attributes.position.array;
    const colors = this.points.geometry.attributes.color.array;

    simulation.particles.forEach((particle, index) => {
      positions[index * 3] = this.sphereRadius * Math.sin(particle.position.phi) * Math.cos(particle.position.theta);
      positions[index * 3 + 1] =
        this.sphereRadius * Math.sin(particle.position.phi) * Math.sin(particle.position.theta);
      positions[index * 3 + 2] = this.sphereRadius * Math.cos(particle.position.phi);

      // Map the speed to a color (red-ish for higher speeds)
      const color = this.gradient(step / 2000).gl();
      // const color = new THREE.Color();
      // color.setHSL(0.15, 0.7, 0.5); // Adjust the HSL values as needed for desired effect
      // color.setHSL(speed * 20, speed * 255, speed * 255); // Adjust the HSL values as needed for desired effect

      colors[index * 3] = color[0];
      colors[index * 3 + 1] = color[1];
      colors[index * 3 + 2] = color[2];
    });

    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
  }
}
