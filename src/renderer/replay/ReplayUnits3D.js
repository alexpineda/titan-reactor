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
  PositionalAudio,
  AudioLoader,
} from "three";
import { disposeMesh } from "../utils/meshes/dispose";
import { IScriptRunner } from "./IScriptRunner";
import { path } from "ramda";
import { ReplayUnits } from "./ReplayUnits";
import { iscriptHeaders } from "../../common/bwdat/iscriptHeaders";

export class ReplayUnits3D extends ReplayUnits {
  constructor(
    bwDat,
    getTerrainY,
    audioListener,
    fileAccess,
    loadManager = DefaultLoadingManager
  ) {
    super();
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
    this.bwDat = bwDat;
    this.audioListener = audioListener;
    this.loadManager = loadManager;
    this.loadAssets();
  }

  loadAssets() {
    const { prefabs } = this;
    const loadModel = new LoadModel(this.loadManager);
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
    // loadModel.load(`_alex/medic.glb`).then(assignModel(0x22));
  }

  spawn(frameData) {
    const prefab = this.prefabs[frameData.typeId] || this.prefabs[999];
    const unit = prefab.clone();
    // unit.matrixAutoUpdate = false;
    // unit.add(new AxesHelper(2));

    unit.userData.current = frameData;
    unit.userData.repId = frameData.repId;
    unit.userData.typeId = frameData.typeId;
    unit.name = this.bwDat.units[unit.userData.typeId].name;

    unit.userData.runner = new IScriptRunner(
      this.bwDat,
      path(
        ["flingy", "sprite", "image", "iscript"],
        this.bwDat.units[unit.userData.typeId]
      )
    );

    const unitSound = new PositionalAudio(this.audioListener);
    unit.add(unitSound);

    unit.userData.runner.on("playsnd", (soundId) => {
      console.log("playsnd", soundId);
      const audioLoader = new AudioLoader(this.loadManager);
      audioLoader.load(`./sound/${this.bwDat.sounds[soundId].file}`, function (
        buffer
      ) {
        unitSound.setBuffer(buffer);
        unitSound.setRefDistance(10);
        unitSound.setRolloffFactor(2.2);
        unitSound.setDistanceModel("exponential");
        unitSound.setVolume(1);
        unitSound.play();
        console.log("play", soundId);
      });
    });

    this.units.add(unit);
    return unit;
  }

  update(unit, frameData) {
    const x = frameData.x / 32 - 64;
    const z = frameData.y / 32 - 64;

    const y = frameData.isFlying ? 6 : this.getTerrainY(x, z);
    const position = new Vector3(x, y, z);
    const rotationY = -frameData.angle + Math.PI / 2;

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
    const { hp, shields, energy, frame, order, subOrder } = frameData;

    unit.userData.previous = unit.userData.current;
    unit.userData.current = frameData;
    if (!unit.userData.current.exists && unit.userData.previous.exists) {
      console.log("died", unit.userData.current);
    }
    unit.userData.runner.update();
    // unit.userData.current = {
    //   hp,
    //   shields,
    //   energy,
    //   frame,
    //   order,
    //   subOrder,
    // };
  }
  killUnit(unit) {
    unit.visible = false;
    unit.userData.runner.toSection(iscriptHeaders.death);
  }

  dispose() {
    this.units.children.forEach(disposeMesh);
    disposeMesh(this.units);
    this.units = new Group();
  }
}

// //#region lepring movement and adjusting position according to terrain
// units.getUnits().forEach((model) => {
//     if (model.userData.nextPosition) {
//       model.position.lerpVectors(
//         model.userData.startPosition,
//         model.userData.nextPosition,
//         (worldFrame % physicsFrameSkip) / physicsFrameSkip
//       );
//     }
//   }

// displacement = {
//   image: floor.material.displacementMap.image
//     .getContext("2d")
//     .getImageData(0, 0, disp.width, disp.height),
//   width: disp.width,
//   scale: floor.material.displacementScale,
// };

// if (worldFloor && worldFrame % 50 === 0) {
//   const testPoint = new Vector3();
//   const raycaster = new THREE.Raycaster(
//     testPoint.addVectors(model.position, new Vector3(0, 20, 0)),
//     new Vector3(0, -1, 0)
//   );
//   const result = raycaster.intersectObject(worldFloor, false);
//   if (result && result.length) {
//     const point = result[0].point;
//     model.position.copy(point.add);
//   }
// }
