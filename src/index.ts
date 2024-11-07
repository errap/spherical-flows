import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Simulation } from "./simulation";
import { Sphere } from "./sphere";
import { Fade } from "./fade";

const createCamera = () => {
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
  camera.up = new THREE.Vector3(0, 0, 1);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.translateX(10);
  camera.translateY(10);
  camera.translateZ(10);

  return camera;
};

const createOrbitControls = (camera: THREE.Camera, renderer: THREE.Renderer) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = false;
  return controls;
};

const createScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000);
  const camera = createCamera();

  return { scene, camera };
};

const main = () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.autoClearColor = false;

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const gl = renderer.getContext();
  const { scene, camera } = createScene();

  const sphere = new Sphere(5);
  const simulation = new Simulation({ numberOfParticles: 100000 });

  sphere.init({ simulation, scene });

  renderer.render(scene, camera);

  const controls = createOrbitControls(camera, renderer);
  controls.update();

  const fade = new Fade(0.002);

  // const svgRenderer = new SVGRenderer();
  // svgRenderer.setSize(window.innerWidth, window.innerHeight);
  // document.body.appendChild(svgRenderer.domElement);
  // svgRenderer.render(scene, camera);

  let step = 0;
  function animate() {
    requestAnimationFrame(animate);

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    simulation.update();
    sphere.update(simulation, step);

    // Enable and configure blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    renderer.render(scene, camera);
    fade.render(renderer);

    step += 1;
  }
  requestAnimationFrame(animate);
};

document.addEventListener("DOMContentLoaded", main);
