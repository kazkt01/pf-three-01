import * as THREE from "three";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls";

// レンダラーの設定
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// シーンの作成
const scene = new THREE.Scene();

// カメラの設定
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(4, 5, 11);

// OrbitControlsの設定
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = true;
controls.autoRotateSpeed = -0.3;
controls.update();

// 地面の作成
const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  side: THREE.DoubleSide,
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// 照明の設定
const spotLight = new THREE.SpotLight(0xffffff, 3000, 100, 0.22, 1);
spotLight.position.set(0, 25, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

// GLTFモデルの読み込み
let mesh;
const loader = new GLTFLoader();
const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://pf-three-01-ws68-bofhvt3xy-kazkt01s-projects.vercel.app"
    : "";
const modelPath = `${baseUrl}/90s_desktop_pc_-_psx/scene.gltf`;
console.log("Attempting to load:", modelPath);

loader.load(
  modelPath,
  (gltf) => {
    console.log("Model loaded successfully");
    mesh = gltf.scene;

    mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    mesh.position.set(0, 0, -1);
    scene.add(mesh);

    controls.target.copy(mesh.position);
    controls.update();

    document.getElementById("progress-container").style.display = "none";
  },
  (xhr) => {
    console.log(`Loading progress: ${(xhr.loaded / xhr.total) * 100}%`);
  },
  (error) => {
    console.error("An error happened while loading the model:", error);
  }
);

// ウィンドウリサイズ時の処理
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// タッチデバイスのイベント処理
document.addEventListener("DOMContentLoaded", (event) => {
  const canvas = document.querySelector("canvas");
  if (canvas) {
    canvas.addEventListener("touchstart", (e) => e.preventDefault(), {
      passive: false,
    });
    canvas.addEventListener("touchmove", (e) => e.preventDefault(), {
      passive: false,
    });
  }
});
