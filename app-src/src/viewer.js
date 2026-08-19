// viewer.js
// Minimal three.js scene that displays a binary STL and re-frames the camera to
// fit each new model. OrbitControls for rotate/zoom/pan.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

export class Viewer {
  constructor(mount) {
    this.mount = mount;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1c22);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
    this.camera.position.set(120, 90, 120);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Lights
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x333340, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(1, 2, 1.5);
    this.scene.add(key);

    // Ground grid for scale reference (42mm gridfinity pitch feels natural).
    this.grid = new THREE.GridHelper(420, 10, 0x444a58, 0x2a2e38);
    this.scene.add(this.grid);

    this.loader = new STLLoader();
    this.mesh = null;
    this.material = new THREE.MeshStandardMaterial({
      color: 0x4f9dff,
      metalness: 0.1,
      roughness: 0.6,
      flatShading: false,
    });

    this._resize = this._resize.bind(this);
    window.addEventListener('resize', this._resize);
    this._resize();
    this._animate();
  }

  showStl(uint8) {
    // STLLoader wants an ArrayBuffer.
    const buf = uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength);
    const geom = this.loader.parse(buf);
    geom.computeVertexNormals();
    geom.center();

    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
    }
    this.mesh = new THREE.Mesh(geom, this.material);
    // OpenSCAD is Z-up; three.js is Y-up. Rotate so the print sits flat.
    this.mesh.rotation.x = -Math.PI / 2;
    this.scene.add(this.mesh);

    this._frame(geom);
  }

  _frame(geom) {
    geom.computeBoundingSphere();
    const r = geom.boundingSphere.radius || 50;
    const dist = r * 2.6;
    this.camera.position.set(dist, dist * 0.8, dist);
    this.camera.near = r / 100;
    this.camera.far = r * 100;
    this.camera.updateProjectionMatrix();
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  _resize() {
    const w = this.mount.clientWidth;
    const h = this.mount.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h || 1;
    this.camera.updateProjectionMatrix();
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
