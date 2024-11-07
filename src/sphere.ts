import * as THREE from "three";
import { Simulation } from "./simulation";
import { getGradient } from "./color";

const gradient = getGradient("spectral");

export class Sphere {
  private geometry = new THREE.BufferGeometry();
  private vertices: number[] = [];
  private colors: number[] = [];
  private material: THREE.PointsMaterial;
  private sprite = new THREE.TextureLoader().load("textures/sprites/disc.png");
  private particles: THREE.Points;

  constructor(private radius: number) {}

  init({ scene, simulation }: { scene: THREE.Scene; simulation: Simulation }) {
    simulation.particles.forEach((particle) => {
      const x = this.radius * Math.sin(particle.position.phi) * Math.cos(particle.position.theta);
      const y = this.radius * Math.sin(particle.position.phi) * Math.sin(particle.position.theta);
      const z = this.radius * Math.cos(particle.position.phi);

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
      size: 0.001,
      vertexColors: true, // Enable vertex colors
      map: this.sprite,
    });

    this.particles = new THREE.Points(this.geometry, this.material);
    scene.add(this.particles);
  }

  update(simulation: Simulation, step: number) {
    const positions = this.particles.geometry.attributes.position.array;
    const colors = this.particles.geometry.attributes.color.array;

    simulation.particles.forEach((particle, index) => {
      positions[index * 3] = this.radius * Math.sin(particle.position.phi) * Math.cos(particle.position.theta);
      positions[index * 3 + 1] = this.radius * Math.sin(particle.position.phi) * Math.sin(particle.position.theta);
      positions[index * 3 + 2] = this.radius * Math.cos(particle.position.phi);

      // Map the speed to a color (red-ish for higher speeds)
      const color = gradient(step / 2000).gl();
      // const color = new THREE.Color();
      // color.setHSL(0.15, 0.7, 0.5); // Adjust the HSL values as needed for desired effect
      // color.setHSL(speed * 20, speed * 255, speed * 255); // Adjust the HSL values as needed for desired effect

      colors[index * 3] = color[0];
      colors[index * 3 + 1] = color[1];
      colors[index * 3 + 2] = color[2];
    });

    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.color.needsUpdate = true;
  }
}
