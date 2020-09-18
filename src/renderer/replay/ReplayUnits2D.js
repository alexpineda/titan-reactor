import { LoadSprite } from "../utils/meshes/LoadSprites";
import { Group, Vector3, DefaultLoadingManager } from "three";
import { disposeMesh } from "../utils/meshes/dispose";
import { IScriptRunner } from "./IScriptRunner";
import { path } from "ramda";
import { ReplayUnits } from "./ReplayUnits";
import { iscriptHeaders } from "../../common/bwdat/iscriptHeaders";

export class ReplayUnits2D extends ReplayUnits {
  constructor(
    bwDat,
    getTerrainY,
    audioListener,
    fileAccess,
    loadManager = DefaultLoadingManager
  ) {
    super();
    const loadSprite = new LoadSprite(loadManager, fileAccess);

    const prefabs = {
      999: loadSprite.loadSync(`_alex/marine.bmp`),
    };

    this.prefabs = prefabs;
    this.units = new Group();
    this.getTerrainY = getTerrainY;
    this.shear = new Vector3(0, 0, 0);
    this.bwDat = bwDat;
    this.loadAssets(loadManager);
  }

  loadAssets(loadManager) {
    const { prefabs } = this;
    // const loadModel = new LoadModel(loadManager);
    const assignModel = (id) => (model) => (prefabs[id] = model);

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
    // unit.material.map.rotation = rotationY;

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

    unit.userData.previous = unit.userData.current;
    unit.userData.current = frameData;
    unit.userData.runner.update();
  }

  killUnit(unit) {
    unit.visible = false;
    runSection(iscriptHeaders.death);
  }

  dispose() {
    this.units.children.forEach(disposeMesh);
    disposeMesh(this.units);
    this.units = new Group();
  }
}
