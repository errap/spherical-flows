import * as THREE from "three";
import { Renderer } from "./renderer";

const createMaterial = (alpha: number) =>
  new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      opacity: { value: alpha },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float opacity;
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, opacity);
      }
    `,
    transparent: true,
  });

const createScene = ({ alpha }: { alpha: number }) => {
  const plane = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(plane, createMaterial(alpha));
  const scene = new THREE.Scene();
  scene.add(mesh);

  return scene;
};

/**
 * Fade class creates a new scene that paints a black rectangle with some opacity in front of the camera.
 * This is used to create trails for all particles in the rendering phase.
 */
export class Fade {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.Camera;

  constructor({ alpha }: { alpha: number }) {
    this.scene = createScene({ alpha });
    this.camera = new THREE.Camera();
  }

  addToRenderer(renderer: Renderer) {
    renderer.add({ camera: this.camera, scene: this.scene });
  }

  render(renderer: THREE.WebGLRenderer) {
    renderer.render(this.scene, this.camera);
  }
}
