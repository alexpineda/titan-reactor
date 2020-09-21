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
  Color,
  PositionalAudio,
  AudioLoader,
} from "three";
import { disposeMesh } from "../utils/meshes/dispose";
import { IScriptRunner } from "./IScriptRunner";
import { is, path } from "ramda";
import { ReplayUnits } from "./ReplayUnits";
import { iscriptHeaders as headers } from "../../common/bwdat/iscriptHeaders";

const red = new Color(0x990000);
const green = new Color(0x009900);
const white = new Color(0x999999);

export class ReplayUnits3D extends ReplayUnits {
  constructor(
    bwDat,
    getTerrainY,
    audioListener,
    audioPool = {},
    fileAccess,
    loadManager = DefaultLoadingManager
  ) {
    super();
    const prefabs = {
      999: () => {
        const mesh = new Mesh(
          new SphereBufferGeometry(1),
          new MeshStandardMaterial({ color: 0x999999 })
        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
      },
    };

    this.prefabs = prefabs;
    this.units = new Group();
    this.deadUnits = [];
    this.getTerrainY = getTerrainY;
    this.shear = new Vector3(0, 0, 0);
    this.bwDat = bwDat;
    this.audioListener = audioListener;
    this.loadManager = loadManager;
    // more of a cache for the moment
    this.audioPool = audioPool;
    this.loadAssets();
  }

  loadAssets() {
    const loadModel = new LoadModel(this.loadManager);
    const assignModel = (id) => (model) => {
      this.prefabs[id] = () => model.clone();
    };
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
    loadModel.load(`_alex/marine.glb`).then(assignModel(0x0));
    loadModel.load(`_alex/scarab.glb`).then(assignModel(0x55));

    // loadModel.load(`_alex/medic.glb`).then(assignModel(0x22));
  }

  spawn(frameData) {
    const prefab = this.prefabs[frameData.typeId] || this.prefabs[999];
    const unit = prefab();
    // unit.matrixAutoUpdate = false;
    // unit.add(new AxesHelper(2));

    unit.userData.current = frameData;
    unit.userData.repId = frameData.repId;
    unit.userData.typeId = frameData.typeId;
    unit.name = this.bwDat.units[unit.userData.typeId].name;

    const runner = (unit.userData.runner = new IScriptRunner(
      this.bwDat,
      path(
        ["flingy", "sprite", "image", "iscript"],
        this.bwDat.units[unit.userData.typeId]
      ),
      {
        typeId: unit.userData.typeId,
        repId: unit.userData.repId,
        lifted: unit.userData.current.lifted,
      }
    ));

    const unitSound = new PositionalAudio(this.audioListener);
    unit.add(unitSound);

    const playSound = (soundId) => {
      if (unitSound.isPlaying) {
        return;
      }
      if (this.audioPool[soundId]) {
        unitSound.setBuffer(this.audioPool[soundId]);
        unitSound.play();
        return;
      }

      console.log("playsnd", soundId);
      const audioLoader = new AudioLoader(this.loadManager);
      audioLoader.load(
        `./sound/${this.bwDat.sounds[soundId].file}`,
        (buffer) => {
          this.audioPool[soundId] = buffer;
          unitSound.setBuffer(buffer);
          unitSound.setRefDistance(10);
          unitSound.setRolloffFactor(2.2);
          unitSound.setDistanceModel("exponential");
          unitSound.setVolume(1);
          unitSound.play();
        }
      );
    };
    runner.on("playsnd", playSound);
    runner.on("playsndbtwn", playSound);
    runner.on("playsndrand", playSound);

    this.units.add(unit);
    return unit;
  }

  update(unit, frameData) {
    const previous = (unit.userData.previous = unit.userData.current);
    const current = (unit.userData.current = frameData);

    const x = current.x / 32 - 64;
    const z = current.y / 32 - 64;

    const y = current.flying ? 6 : this.getTerrainY(x, z);
    const position = new Vector3(x, y, z);
    const rotationY = -current.angle + Math.PI / 2;

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

    const runner = unit.userData.runner;
    const isNow = (prop) => current[prop] && !previous[prop];
    const was = (prop) => !current[prop] && previous[prop];
    const run = (section) => runner.toAnimationBlock(section);

    if (!runner.state.noBrkCode) {
      //@todo
      //if cooldown timer && repeatAttk run(repeatAttk)

      if (isNow("attacking") && unit.material) {
        unit.material.color = red;
        unit.material.needsUpdate = true;
      } else if (was("attacking") && unit.material) {
        unit.material.color = white;
        unit.material.needsUpdate = true;
      }

      if (current.groundWeaponCooldown && !previous.groundWeaponCooldown) {
        run(headers.gndAttkInit);
      } else if (current.airWeaponCooldown && !previous.airWeaponCooldown) {
        run(headers.airAttkInit);
      }

      if (!current.groundWeaponCooldown && previous.groundWeaponCooldown) {
        if (runner.state.repeatAttackAfterCooldown) {
          run(headers.gndAttkRpt);
        } else {
          run(headers.gndAttkToIdle);
        }
      } else if (!current.airWeaponCooldown && previous.airdWeaponCooldown) {
        if (runner.state.repeatAttackAfterCooldown) {
          run(headers.airAttkRpt);
        } else {
          run(headers.airAttkToIdle);
        }
      }

      // if (isNow("moving")) {
      //   run(headers.walking);
      // } else if (was("moving")) {
      //   run(headers.walkingToIdle);
      // }

      if (isNow("lifted")) {
        run(headers.liftOff);
      } else if (was("lifted")) {
        run(headers.landing);
      }

      if (isNow("burrowed")) {
        run(headers.burrow);
      } else if (was("burrowed")) {
        run(headers.unBurrow);
      }
    }
    /*
    iscriptHeaders.init X
    iscriptHeaders.death; X
    iscriptHeaders.gndAttkInit; X
    iscriptHeaders.airAttkInit; X
    iscriptHeaders.unused1;
    iscriptHeaders.gndAttkRpt; X
    iscriptHeaders.airAttkRpt; X
    iscriptHeaders.castSpell
    iscriptHeaders.gndAttkToIdle; X
    iscriptHeaders.airAttkToIdle; X
    iscriptHeaders.unused2;
    iscriptHeaders.walking; X
    iscriptHeaders.walkingToIdle; X
    iscriptHeaders.specialState1
    iscriptHeaders.specialState2
    iscriptHeaders.almostBuilt
    iscriptHeaders.built
    iscriptHeaders.landing X
    iscriptHeaders.liftOff X
    iscriptHeaders.working 
    iscriptHeaders.workingToIdle
    iscriptHeaders.warpIn
    iscriptHeaders.unused3
    iscriptHeaders.starEditInit
    iscriptHeaders.disable
    iscriptHeaders.burrow X
    iscriptHeaders.unBurrow X
    iscriptHeaders.enable

    */

    // if (diff("idle")) {
    //   unit.userData.runner.toAnimationBlock(iscriptHeaders.init);
    // }

    runner.update();
  }

  updateDeadUnits() {
    this.deadUnits.forEach((unit) => this.update(unit, unit.userData.current));
  }

  killUnit(unit) {
    unit.userData.current.alive = false;
    unit.userData.runner.toAnimationBlock(headers.death);
    this.deadUnits.push(unit);
  }

  clear() {
    this.units = new Group();
    this.deadUnits = [];
  }

  dispose() {
    disposeMesh(this.units);
    this.clear();
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
