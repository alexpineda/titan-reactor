import {
  Object3D,
  Color,
  Mesh,
  ConeBufferGeometry,
  MeshBasicMaterial,
} from "three";
import { createMinimapPoint } from "../mesh/Minimap";
import { orders } from "titan-reactor-shared/types/orders";
import { unitTypes } from "titan-reactor-shared/types/unitTypes";
import BWAPIUnit from "titan-reactor-shared/bwapi/BWAPIUnit";
const { mineral1, mineral2, mineral3, geyser } = unitTypes;
import { DebugLog } from "../utils/DebugLog";
import { iscriptHeaders } from "titan-reactor-shared/types/iscriptHeaders";

class Unit extends Object3D {
  constructor(bwDat, getTerrainY, createSprite, players, mapWidth, mapHeight) {
    super();
    this.bwDat = bwDat;
    this.players = players;
    this._getTerrainY = getTerrainY;
    this._createSprite = createSprite;
    this.logger = new DebugLog("unit");
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  init(frameData, previous) {
    Object.assign(this.userData, frameData, {
      current: new BWAPIUnit(frameData),
      previous: previous ? previous : new BWAPIUnit(),
      currentOrder: {},
      name: this.bwDat.units[frameData.typeId].name,
      heatmapScore: 0,
    });

    this.logger.assign(this.userData);

    if (frameData.repId === 3626 && previous) {
      debugger;
    }
    this.sprite = this._createSprite(this);
    this.sprite.logger = this.logger;
    this.sprite.position.copy(this.position);
    this.sprite.addImage(this.unitType.flingy.sprite.image.index);

    this._addMinimapPoint(this.sprite);
    this._addActiveHelper(this.sprite);
  }

  _addActiveHelper(sprite) {
    this.userData._active = new Mesh(
      new ConeBufferGeometry(0.5, 2),
      new MeshBasicMaterial({ color: 0xffff00 })
    );
    this.userData._active.position.y = 4;
    this.userData._active.rotation.x = Math.PI;
    this.userData._active.visible = false;
    sprite.add(this.userData._active);
  }

  _addMinimapPoint(sprite) {
    const grp = this.bwDat.grps[this.unitType.flingy.sprite.image.grp];
    const w = grp.w / 48;
    const h = grp.h / 48;

    let minimapPoint;
    if (this.playerId >= 0) {
      minimapPoint = createMinimapPoint(
        this.players[this.playerId].color.rgb,
        w,
        h
      );
    } else if ([mineral1, mineral2, mineral3, geyser].includes(this.typeId)) {
      minimapPoint = createMinimapPoint(new Color(0x00e4fc), w, h);
    }

    if (minimapPoint) {
      sprite.userData.minimapPoint = minimapPoint;
      sprite.attach(minimapPoint);
    } else {
      console.log(`no minimap point for ${this.typeId}`);
    }
  }

  update(frameData) {
    this.userData.previous = this.userData.current;
    const current = (this.userData.current = new BWAPIUnit(frameData));

    if (window.dbg) {
      this.userData._active.visible = window.dbg.repId === current.repId;
    }

    const x = current.x / 32 - this.mapWidth / 2;
    const z = current.y / 32 - this.mapHeight / 2;

    const y =
      this.unitType.flyer() || current.lifted() ? 5 : this._getTerrainY(x, z);
    this.position.set(x, y, z);
    this.rotation.y = current.angleRad;

    let visible = true;
    visible = visible && !current.loaded();
    visible = visible && !(current.order === orders.harvestGas);
    visible =
      visible && !(current.remainingBuildTime && !this.unitType.building()); //hide if unit is training
    // visible = visible && (window.showAlive ? true : current.alive);

    this.visible = visible;
    // this.sprite.userData.minimapPoint.position.copy(this.position);
  }

  die() {
    this.sprite.run(iscriptHeaders.death);
  }

  get current() {
    return this.userData.current;
  }

  get previous() {
    return this.userData.previous;
  }

  get direction() {
    return this.userData.current.direction;
  }

  get repId() {
    return this.userData.current.repId;
  }

  get typeId() {
    return this.userData.current.typeId;
  }

  get unitType() {
    return this.bwDat.units[this.typeId];
  }

  get playerId() {
    return this.userData.current.playerId;
  }
}

export default Unit;
