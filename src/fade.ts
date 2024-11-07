import * as THREE from "three";

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

export class Fade {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.Camera;

  constructor(private alpha: number) {
    this.scene = this.createScene();
    this.camera = new THREE.Camera();
  }

  render(renderer: THREE.WebGLRenderer) {
    renderer.render(this.scene, this.camera);
  }

  private createScene() {
    const plane = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(plane, createMaterial(this.alpha));
    const scene = new THREE.Scene();
    scene.add(mesh);

    return scene;
  }
}
