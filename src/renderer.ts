import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface Renderable {
  scene: THREE.Scene;
  camera: THREE.Camera;
}

const createOrbitControls = (camera: THREE.Camera, renderer: THREE.Renderer) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = false;
  return controls;
};

/**
 * The Renderer class sets up and manages the rendering of scenes using WebGL.
 */
export class Renderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly gl: WebGLRenderingContext;
  private renderables: Renderable[] = [];
  private controls?: OrbitControls;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.gl = this.renderer.getContext();
  }

  init() {
    this.renderer.autoClearColor = false;

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  add(renderable: Renderable, { addControls = true } = {}) {
    this.renderables.push(renderable);

    if (addControls) {
      this.controls = createOrbitControls(renderable.camera, this.renderer);
      this.controls.update();
    }

    return this;
  }

  render() {
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.controls?.update();

    for (const renderable of this.renderables) {
      this.renderer.render(renderable.scene, renderable.camera);
    }
  }
}
