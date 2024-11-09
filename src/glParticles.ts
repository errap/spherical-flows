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
  
      const color = new THREE.Color();
      color.setHSL(0.1, 0.8, 0.7); // Warm color
  
      this.colors.push(color.r, color.g, color.b);
    });

    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.vertices, 3));
    this.geometry.setAttribute("color", new THREE.Float32BufferAttribute(this.colors, 3));

    this.material = new THREE.PointsMaterial({
      size: this.particleSize * 2,
      vertexColors: true,
      map: this.sprite,
      transparent: true,
      opacity: 0.8,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  addToRenderer(renderer: Renderer) {
    renderer.add({ scene: this.scene, camera: this.camera }, { addControls: true });
  }

  update(simulation: Simulation, step: number, frequencyData: Uint8Array, radius: number, color: number) {
    const positions = this.points.geometry.attributes.position.array;
    const colors = this.points.geometry.attributes.color.array;

    // Get the frequency value (normalized between 0 and 1) for scaling the radius
    const frequencyValue = frequencyData[0] / 255;  // Use the first frequency bin for simplicity
    
    // Sphere radius pulsation based on frequency (use the passed radius to update it)
    const radiusPulse = this.sphereRadius * (1 + frequencyValue * 0.03); // Increase the effect for a noticeable pulse

    // Dynamic spike pulse effect based on frequency
    const spikePulse = Math.sin(frequencyValue * Math.PI * 4) * 2; // Increase to be more noticeable and faster

    // Combine both effects for a dynamic radius of each particle. 
    // Remember, both values contribute to the dynamicRadius so a small change in say radiusPulse
    // alone may not be enough to reduce the radius pulse. Both values need to be reduced.
    const dynamicRadius = radiusPulse + spikePulse;

    // Earth rotation effect for smooth spinning
    const rotationAngle = step * 0.002; // Adjust the speed of rotation if needed

    simulation.particles.forEach((particle, index) => {
        // Update the particle's position based on the dynamic radius and rotation
        positions[index * 3] = dynamicRadius * Math.sin(particle.position.phi) * Math.cos(particle.position.theta + rotationAngle);
        positions[index * 3 + 1] = dynamicRadius * Math.sin(particle.position.phi) * Math.sin(particle.position.theta + rotationAngle);
        positions[index * 3 + 2] = dynamicRadius * Math.cos(particle.position.phi);

        // Calculate the speed of the particle and use it to influence the color intensity
        const speed = Math.sqrt(particle.velocity.x ** 2 + particle.velocity.y ** 2 + particle.velocity.z ** 2);
        const colorIntensity = Math.min(1, frequencyValue + speed * 0.2); // Incorporate speed into color intensity

        // Add a pulsing effect to the color intensity based on the frequency data
        const colorIntensityPulse = Math.sin(frequencyValue * Math.PI * 2) * 0.3 + 0.5; // Pulsing effect
        const finalColorIntensity = Math.min(1, colorIntensity + colorIntensityPulse);

        // Use the gradient to calculate the particle color based on the intensity
        const particleColor = this.gradient(finalColorIntensity).gl();

        // Update the particle color
        colors[index * 3] = particleColor[0];
        colors[index * 3 + 1] = particleColor[1];
        colors[index * 3 + 2] = particleColor[2];
    });

    // Mark the geometry attributes as needing updates
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
}

}