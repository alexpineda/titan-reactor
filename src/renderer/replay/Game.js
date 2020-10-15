import {
  Group,
  Vector3,
  DefaultLoadingManager,
  Color,
  PositionalAudio,
  AudioLoader,
  Mesh,
  MeshBasicMaterial,
  ConeGeometry,
  Object3D,
} from "three";
import { disposeMesh } from "../utils/dispose";
import { IScriptRunner } from "./IScriptRunner";
import { path } from "ramda";
import {
  headersById,
  iscriptHeaders as headers,
} from "../../common/bwdat/iscriptHeaders";
import { orders, ordersById } from "../../common/bwdat/orders";
import { DebugLog } from "../utils/DebugLog";
import { angleToDirection } from "../utils/conversions";
import { unitTypes } from "../../common/bwdat/unitTypes";
import { BWAPIUnit } from "./BWAPIFrames";
import { createMinimapPoint } from "./Minimap";
const { zergEgg, mineral1, mineral2, mineral3, geyser } = unitTypes;

export class Game {
  constructor(
    bwDat,
    renderImage,
    tileset,
    mapSize,
    getTerrainY,
    audioListener,
    players,
    cameras,
    audioPool = {},
    loadingManager = DefaultLoadingManager
  ) {
    this.units = new Group();
    this.cameras = cameras;
    this.tileset = tileset;
    this.mapSize = {
      w: mapSize[0],
      h: mapSize[1],
    };
    this.deadUnits = [];
    this.getTerrainY = getTerrainY;
    this.shear = new Vector3(0, 0, 0);
    this.bwDat = bwDat;
    this.players = players;
    this.audioListener = audioListener;
    this.loadingManager = loadingManager;
    // more of a cache for the moment
    this.audioPool = audioPool;
    this.renderImage = renderImage;

    this.logger = new DebugLog("units");
    // for 2d sprites only
    this.cameraDirection = {
      direction: 0,
      previousDirection: 0,
    };
    this.supplyTaken = [0, 0];
    this.supplyProvided = [0, 0];
    //@todo refactor out
    this.renderImage.loadAssets && this.renderImage.loadAssets();
  }

  spawnUnitIfNotExists(frameData) {
    const exists = this.units.children.find(
      (child) => child.userData.repId === frameData.repId
    );
    return exists || this.spawnUnit(frameData);
  }

  spawnUnit(frameData) {
    return this._spawnUnit(frameData);
  }

  _spawnUnit(frameData, replaceUnit) {
    let unit = replaceUnit || new Group();

    // mesh.material.opacity = this.bwDat.units[frameData.typeId].permanentCloak()
    //   ? 0.6
    //   : 1;

    // unit.matrixAutoUpdate = false;
    // unit.add(new AxesHelper(2));
    unit.userData.repId = frameData.repId;
    unit.userData.typeId = frameData.typeId;
    unit.userData.current = frameData;
    unit.userData.previous = replaceUnit
      ? replaceUnit.userData.previous
      : new BWAPIUnit();
    unit.userData.currentOrder = {};
    unit.name = this.bwDat.units[unit.userData.typeId].name;
    unit.userData.heatmapScore = 0;

    if (replaceUnit) {
      this.supplyTaken[unit.userData.current.playerId] =
        this.supplyTaken[unit.userData.current.playerId] -
        this.bwDat.units[unit.userData.previous.typeId].supplyRequired;
    } else {
      this.supplyTaken[unit.userData.current.playerId] =
        this.supplyTaken[unit.userData.current.playerId] +
        this.bwDat.units[unit.userData.current.typeId].supplyRequired;
      this.supplyProvided[unit.userData.current.playerId] =
        this.supplyProvided[unit.userData.current.playerId] +
        this.bwDat.units[unit.userData.current.typeId].supplyProvided;
    }

    unit.userData._active = new Mesh(
      new ConeGeometry(0.5, 2),
      new MeshBasicMaterial({ color: 0xffff00 })
    );
    unit.userData._active.position.y = 4;
    unit.userData._active.rotation.x = Math.PI;
    unit.userData._active.visible = false;
    unit.add(unit.userData._active);

    if (!replaceUnit) {
      const unitType = this.bwDat.units[unit.userData.current.typeId];
      const grp = this.bwDat.grps[unitType.flingy.sprite.image.grp];
      // const w = grp.maxFrameW / 32;
      // const h = grp.maxFrameH / 32;
      const w = grp.w / 48;
      const h = grp.h / 48;
      let minimapPoint;
      if (unit.userData.current.playerId >= 0) {
        minimapPoint = createMinimapPoint(
          this.players[unit.userData.current.playerId].color.rgb,
          w,
          h
        );
      } else if (
        [mineral1, mineral2, mineral3, geyser].includes(
          unit.userData.current.typeId
        )
      ) {
        minimapPoint = createMinimapPoint(new Color(0x00e4fc), w, h);
      }

      if (minimapPoint) {
        unit.add(minimapPoint);
      } else {
        debugger;
      }
    }

    unit.userData.runner = this._initRunner(
      unit,
      unit.userData,
      replaceUnit ? replaceUnit.userData.runner.listeners : []
    );
    unit.userData.runner.setFrame(0, false);
    // unit.userData.runner.on("imgul", (runner) => {
    //   runner.state.mesh = this.renderUnit.load(runner.state.image.index);
    // });

    // if (this.bwDat.units[frameData.typeId].subUnit1 !== unitTypeIdByName.none) {
    //   const subUnitTypeId = this.bwDat.units[frameData.typeId].subUnit1;

    //   const subUnit = this.renderUnit.load(
    //     this.renderUnit.loadFromUnitType
    //       ? subUnitTypeId
    //       : this.bwDat.units[subUnitTypeId].flingy.sprite.image.index
    //   );
    //   subUnit.position.z = 0.01;
    //   subUnit.userData.runner = this._initRunner( this.bwDat.units[frameData.typeId].subUnit1);
    //   unit.userData.subUnit = subUnit;
    //   unit.add(subUnit);
    // }

    !replaceUnit && this._initAudio(unit);
    this.units.add(unit);
    return unit;
  }

  // zerg spawn
  replaceWith(frameData, unit) {
    unit.userData.runner.renderImage.remove();
    this._spawnUnit(frameData, unit);
  }

  _initRunner(unit, parent, listeners = []) {
    const image = path(
      ["flingy", "sprite", "image"],
      this.bwDat.units[parent.typeId]
    );

    const runner = new IScriptRunner(
      this.bwDat,
      image,
      parent,
      this.tileset,
      listeners
    );

    runner.setRenderImage(this.renderImage.instance(runner, unit, image.index));

    const addRenderImage = (runner) => {
      runner.setRenderImage(
        this.renderImage.instance(runner, unit, runner.image.index)
      );
      runner.on("end", () => runner.renderImage.remove());
    };

    runner.on("imgul", addRenderImage);
    runner.on("imgol", addRenderImage);
    runner.on("useweapon", (runner) => {
      runner.setRenderImage(
        this.renderImage.instance(runner, unit, runner.image.index)
      );
      runner.on("end", () => runner.renderImage.remove());
    });

    return runner;
  }

  updateUnit(frameData, frame, skippingFrames) {
    const unit = this.spawnUnitIfNotExists(frameData);
    this.logger.assign(unit.userData);

    const previous = unit.userData.previous;
    const current = (unit.userData.current = frameData);
    const currentOrder = unit.userData.currentOrder;

    if (window.dbg) {
      unit.userData._active.visible = window.dbg.repId === current.repId;
    }

    // unit morphed
    if (current.typeId !== previous.typeId && previous.typeId >= 0) {
      this.logger.log(
        `%c ${current.repId} change type ${previous.typeId}->${current.typeId}`,
        "background: #ffff00; color: #000000"
      );
      this.replaceWith(current, unit);
    }

    const runner = unit.userData.runner;
    const unitType = this.bwDat.units[unit.userData.typeId];

    const x = current.x / 32 - this.mapSize.w / 2;
    const z = current.y / 32 - this.mapSize.h / 2;

    //@todo consider setting frame floor once to the lowest frame
    const y = unitType.flyer() || current.lifted() ? 6 : this.getTerrainY(x, z);
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

    const isNow = (prop) => current[prop]() && !previous[prop]();
    const was = (prop) => !current[prop]() && previous[prop]();
    const target = () =>
      this.units.children.find(({ userData }) =>
        [currentOrder.target, currentOrder.orderTarget].includes(userData.repId)
      );
    const targetIsAir = () => {
      const t = target();
      return t && t.userData.current.flying();
    };

    const toAttack = () => {
      targetIsAir() ? run(headers.airAttkInit) : run(headers.gndAttkInit);
    };

    if (
      angleToDirection(current.angle) !== angleToDirection(previous.angle) ||
      this.cameraDirection.direction !== this.cameraDirection.previousDirection
    ) {
      runner.setDirection(
        (angleToDirection(current.angle) + this.cameraDirection.direction) % 32
      );
    }
    runner.update();

    //@todo what are teh cases where these get overwritten if these are dispatched on the first frame??
    if (runner.dispatched["gotorepeatattk"]) {
      currentOrder.repeatAttackAfterCooldown = true;
    }

    //@todo needed?
    if (runner.dispatched["attackwith"]) {
      currentOrder.usingWeaponType = runner.dispatched["attackwith"];
    }

    if (current.anim !== previous.anim && headersById[current.anim]) {
      runner.run(current.anim);
    }

    if (!runner.state.noBrkCode) {
      if (current.order !== previous.order) {
        this.logger.log(
          `%c order ${ordersById[current.order]} <- ${
            ordersById[previous.order]
          }`,
          "background: #222; color: #bada55"
        );

        //items like target are not persisted in bwapi frames, just the initial change
        Object.assign(currentOrder, {
          order: current.order,
          prevOrder: previous.order,
          target: current.target,
          orderTarget: current.orderTarget,
          repeatAttackAfterCooldown: null,
          usingWeaponType: null,
        });

        //for cool down reasons
        if (current.target !== -1 || current.orderTarget !== -1) {
          currentOrder.lastTargetWasAir = targetIsAir();
        }

        //   switch (current.order) {
        //     case orders.move:
        //     case orders.harvest1:
        //     case orders.harvest2:
        //     case orders.moveToMinerals:
        //     case orders.moveToGas:
        //     case orders.returnMinerals:
        //     case orders.attackMove:
        //     case orders.placeBuilding:
        //     case orders.attack1:
        //     case orders.attack2:
        //     case orders.medicHealMove:
        //       runner.run(headers.walking);
        //       break;
        //     case orders.attackUnit:
        //       break;
        //     case orders.incompleteBuilding:
        //     case orders.harvestGas:
        //     case orders.returnGas:
        //       break;
        //     case orders.waitForMinerals:
        //     case orders.waitForGas:
        //       runner.run(headers.walkingToIdle);
        //       break;
        //     case orders.constructingBuilding:
        //     case orders.miningMinerals:
        //       runner.run(headers.almostBuilt);
        //       break;
        //     case orders.harvest3:
        //       runner.run(headers.walkingToIdle);
        //       break;
        //     case orders.harvest4:
        //     case orders.die:
        //     case orders.stop:
        //     case orders.gaurd:
        //     case orders.playerGaurd:
        //     case orders.holdPosition:
        //     case orders.medicHealToIdle:
        //     case orders.medicHoldPosition:
        //     case orders.medic:
        //     case orders.medicHeal:
        //       runner.run(headers.specialState1);
        //       break;
        //     case orders.turretGaurd:
        //     case orders.bunkerGaurd:
        //     case orders.stopReaver:
        //     case orders.towerGaurd:
        //     case orders.attackFixedRange:
        //     case orders.attackTile:
        //     case orders.upgrade:
        //     case orders.buildingLiftOff:
        //       runner.run(headers.liftOff);
        //       break;
        //     case orders.buildingLand:
        //       runner.run(headers.landing);
        //       break;
        //     case orders.zergBirth: //egg->unit or coccoon -> unit
        //     case orders.zergBuildingMorph:
        //     case orders.zergUnitMorph: //larva->egg
        //       break;
        //     case orders.burrowing:
        //       runner.run(headers.burrow);
        //       break;
        //     case orders.unburrowing:
        //       runner.run(headers.unBurrow);
        //       break;
        //     case orders.burrowed:
        //       runner.run(headers.specialState2);
        //       break;
        //     case orders.larva:
        //       runner.run(headers.walking);
        //       break;
        //   }
        // }

        // if (current.subOrder !== previous.subOrder) {
        //   this.logger.log(`subOrder ${ordersById[current.subOrder]}`);
        // }

        // if ([mineral1, mineral2, mineral3].includes(current.typeId)) {
        //   let header = headers.workingToIdle;
        //   if (current.resources < 250) {
        //     header = headers.specialState1;
        //   } else if (current.resources < 500) {
        //     header = headers.specialState2;
        //   } else if (current.resources < 750) {
        //     header = headers.almostBuilt;
        //   }

        //   if (runner.lastRun !== header) {
        //     runner.run(header);
        //   }
      }
    }

    if (current.remainingBuildTime) {
      this.logger.log(`build time ${current.remainingBuildTime}`);
    }

    let visible = true;
    visible = visible && !current.loaded();
    visible = visible && !(current.order === orders.harvestGas);
    visible = visible && (window.showAlive ? true : current.alive);

    unit.visible = visible;

    if (visible) {
      runner.renderImage.assign(unit.userData);
      runner.renderImage.update(this.cameras.main);
    }
    // runner.children.forEach((r) => {
    //   r.renderImage && r.renderImage.update();
    // });

    unit.userData.previous = unit.userData.current;
  }

  updateDeadUnits() {
    this.deadUnits.forEach((unit) =>
      this.updateUnit(unit, unit.userData.current)
    );
  }

  killUnit(unit) {
    //@todo send kill signal to runners without interrupting them

    this.supplyTaken[unit.userData.current.playerId] =
      this.supplyTaken[unit.userData.current.playerId] -
      this.bwDat.units[unit.userData.current.typeId].supplyRequired;

    this.supplyProvided[unit.userData.current.playerId] =
      this.supplyProvided[unit.userData.current.playerId] -
      this.bwDat.units[unit.userData.current.typeId].supplyProvided;

    unit.userData.current.alive = false;
    unit.userData.previous.alive = false;
    unit.userData.runner.run(headers.death);
    this.deadUnits.push(unit);
  }

  onEndFrame() {
    this.players.updateResources(this);
  }

  clear() {
    //@todo dispose without fucking up materials
    this.units.children.forEach((child) => this.units.remove(child));
    this.units.children = [];
    this.deadUnits = [];
    this.supplyTaken = [0, 0];
    this.supplyProvided = [0, 0];
  }

  getUnits() {
    return this.units.children;
  }

  killUnits(repIds) {
    if (!repIds || !repIds.length) {
      return;
    }
    this.units.children
      .filter(({ userData }) => repIds.includes(userData.repId))
      .forEach((unit) => this.killUnit(unit));
  }

  //@todo refactor out of event model
  _initAudio(unit) {
    this.logger.assign(unit.userData);
    const unitSound = new PositionalAudio(this.audioListener);
    unit.add(unitSound);

    const playSound = (soundId) => {
      if (unitSound.isPlaying) {
        this.logger.log(
          `%c 🔊 ${soundId}`,
          "background: #ffff00; color: #000000"
        );
        return;
      } else {
        this.logger.log(
          `%c 🔇 ${soundId}`,
          "background: #990000; color: #ffffff"
        );
      }

      this.logger.log(`play sound ${soundId}`);
      if (this.audioPool[soundId]) {
        unitSound.setBuffer(this.audioPool[soundId]);
        unitSound.play();
        return;
      }

      const audioLoader = new AudioLoader(this.loadingManager);
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
    unit.userData.runner.on("playsnd", playSound);
    unit.userData.runner.on("playsndbtwn", playSound);
    unit.userData.runner.on("playsndrand", playSound);
    unit.userData.runner.on("attackmelee", playSound);
  }

  setShear(shear) {
    this.shear = shear;
  }

  getWorkerCount(player) {
    return this.units.children.reduce((sum, { userData }) => {
      if (
        userData.current.playerId === player &&
        [unitTypes.scv, unitTypes.drone, unitTypes.probe].includes(
          userData.current.typeId
        )
      ) {
        return sum + 1;
      }
      return sum;
    }, 0);
  }

  dispose() {
    this.units.children.forEach(({ userData }) => {
      userData.runner.dispose(disposeMesh);
    });
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
