import { LoadModel } from "../utils/meshes/LoadModels";
import {
  Mesh,
  SphereBufferGeometry,
  MeshStandardMaterial,
  Group,
  AxesHelper,
  Vector3,
  DefaultLoadingManager,
  Quaternion,
  Euler,
  Matrix4,
} from "three";
import { disposeMesh } from "../utils/meshes/dispose";

export class ReplayUnits3D {
  constructor(getTerrainY, loadManager = DefaultLoadingManager) {
    const prefabs = {
      999: new Mesh(
        new SphereBufferGeometry(1),
        new MeshStandardMaterial({ color: 0x999999 })
      ),
    };

    prefabs[999].castShadow = true;
    prefabs[999].receiveShadow = true;

    this.prefabs = prefabs;
    this.units = new Group();
    this.getTerrainY = getTerrainY;
    this.shear = new Vector3(0, 0, 0);
    this.loadModels(loadManager);
  }

  loadModels(loadManager) {
    const { prefabs } = this;
    const loadModel = new LoadModel(loadManager);
    const assignModel = (id) => (model) => (prefabs[id] = model);

    loadModel.load(`_alex/scvm.glb`).then(assignModel(0x7));
    loadModel.load(`_alex/probe.glb`).then(assignModel(0x40));
    loadModel.load(`_alex/supply.glb`).then(assignModel(0x6d));
    loadModel.load(`_alex/pylon.glb`).then(assignModel(0x9c));
    loadModel.load(`_alex/nexus.glb`).then(assignModel(0x9a));
    loadModel.load(`_alex/command-center.glb`).then(assignModel(0x6a));
    loadModel.load(`_alex/refinery.glb`).then(assignModel(0x6e));
    loadModel.load(`_alex/barracks.glb`).then(assignModel(0x6f));
    loadModel.load(`_alex/assimilator.glb`).then(assignModel(0x9d));
    loadModel.load(`_alex/gateway.glb`).then(assignModel(0xa0));
    loadModel.load(`_alex/dropship.glb`).then(assignModel(0xb));
  }

  spawn(frameData) {
    const prefab = this.prefabs[frameData.typeId] || this.prefabs[999];
    const unit = prefab.clone();
    // unit.matrixAutoUpdate = false;
    unit.add(new AxesHelper(2));
    unit.userData.frameData = frameData;
    this.units.add(unit);
    return unit;
  }

  spawnIfNotExists(frameData) {
    const exists = this.units.children.find(
      (child) => child.userData.frameData.repId === frameData.repId
    );
    return exists || this.spawn(frameData);
  }

  update(unit, frameData) {
    const x = frameData.x / 32 - 64;
    const y = frameData.y / 32 - 64;

    const position = new Vector3(x, 6, y);
    const rotationY = frameData.angle * window.angleMult + window.angleAdd;

    unit.position.copy(position);
    unit.rotation.y = rotationY;

    // const rotation = new Quaternion();
    // rotation.setFromEuler(new Euler(0, rotationY, 0));

    // const rotScaleTranslation = new Matrix4();
    // rotScaleTranslation.compose(position, rotation, new Vector3(1, 1, 1));
    // unit.matrix
    //   .makeShear(this.shear.x, 0, this.shear.z)
    //   .multiply(rotScaleTranslation);
    // unit.matrix.copy(rotScaleTranslation);
    // unit.updateMatrix();

    unit.userData.movement = new Vector3();
    unit.userData.nextPosition = new Vector3();
    unit.userData.nextPosition.copy(unit.position);
    unit.userData.typeId = frameData.typeId;
    unit.userData.hp = frameData.hp;
    unit.userData.shields = frameData.shields;
    unit.userData.energy = frameData.energy;
  }

  cameraUpdate({ position }, { target }) {
    const delta = new Vector3();
    this.shear = delta.subVectors(position, target);
  }

  getUnits() {
    return this.units.children;
  }

  destroy() {}

  dispose() {
    this.units.children.forEach(disposeMesh);
    disposeMesh(this.units);
    this.units = new Group();
  }
}
