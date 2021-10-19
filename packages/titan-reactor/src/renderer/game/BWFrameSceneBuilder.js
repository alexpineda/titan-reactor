import { Group, MathUtils } from "three";
import BuildingQueueCountBW from "./bw/BuildingQueueCountBW";
import CreepBW from "./bw/CreepBW";
import ImagesBW from "./bw/ImagesBW";
import SoundsBW from "./bw/SoundsBW";
import SpritesBW from "./bw/SpritesBW";
import TilesBW from "./bw/TilesBW";
import UnitsBW from "./bw/UnitsBW";
import ResearchBW from "./bw/ResearchBW";
import UpgradeBW from "./bw/UpgradeBW";
import GameSprite from "./sprite/GameSprite";
import { range } from "ramda";
import useHudStore from "../stores/hudStore";
import { unstable_batchedUpdates } from "react-dom";
import TechUpgradesWorker from "./tech-upgrades/TechUpgrades.worker";

export default class BWFrameSceneBuilder {
  /**
   *
   * @param {TitanReactorScene} scene
   * @param {Number} mapWidth
   * @param {Number} mapHeight
   * @param {Object} bwDat
   * @param {Function} pxToGameUnit
   * @param {Function} getTerrainY
   * @param {Players} players
   * @param {FogOfWar} fogOfWar
   */
  constructor(
    scene,
    creep,
    bwDat,
    pxToGameUnit,
    getTerrainY,
    players,
    fogOfWar,
    audioMaster,
    createTitanImage,
    projectedCameraView
  ) {
    this.players = players;
    this.audioMaster = audioMaster;
    this.createTitanImage = createTitanImage;
    this.projectedCameraView = projectedCameraView;
    this.unitsBW = new UnitsBW();
    this.tilesBW = new TilesBW();
    this.creepBW = new CreepBW();
    this.soundsBW = new SoundsBW(pxToGameUnit, getTerrainY);
    this.spritesBW = new SpritesBW();
    this.imagesBW = new ImagesBW();
    this.researchBW = new ResearchBW();
    this.upgradeBW = new UpgradeBW();
    this.buildQueueBW = new BuildingQueueCountBW();
    this.bwDat = bwDat;
    this.pxToGameUnit = pxToGameUnit;
    this.getTerrainY = getTerrainY;
    this.creep = creep;
    this.fogOfWar = fogOfWar;

    this.techUpgradesWorker = new TechUpgradesWorker();
    this.techUpgradesWorker.postMessage({
      type: "init",
      techDat: bwDat.tech,
      upgradesDat: bwDat.upgrades,
    });
    this.techUpgradesWorker.onmessage = ({ data }) => {
      const {
        techNearComplete,
        upgradeNearComplete,
        hasTech,
        hasUpgrade,
        research,
        upgrades,
        completedUpgrades,
        completedResearch,
      } = data;

      if (hasUpgrade) {
        this._notifyHudOfUpgrades();
      }

      if (upgradeNearComplete) {
        useHudStore.getState().onUpgradeNearComplete();
      }

      if (hasTech) {
        this._notifyHudOfTech();
      }

      if (techNearComplete) {
        useHudStore.getState().onTechNearComplete();
      }

      this.research = research;
      this.upgrades = upgrades;
      this.completedUpgrades = completedUpgrades;
      this.completedResearch = completedResearch;
    };

    this.sprites = new Map();
    this.images = new Map();
    this.units = new Map();
    this.unitsByIndex = new Map();
    this.unitsBySpriteId = new Map();
    this.unitsInProduction = [];
    this.research = range(0, 8).map(() => []);
    this.upgrades = range(0, 8).map(() => []);
    this.completedResearch = range(0, 8).map(() => []);
    this.completedUpgrades = range(0, 8).map(() => []);

    this.scene = scene;
    this.group = new Group();
    this.scene.add(this.group);
    this.scene.unitGroup = this.group;
    this.interactableSprites = [];
  }

  prepare(bwFrame, elapsed) {
    this.buildSounds(bwFrame, elapsed);
    this.buildFog(bwFrame);
    this.buildCreep(bwFrame);
  }

  /**
   *
   * @param {ProjectedCameraView} view
   * @param {AudioMaster} audioMaster
   * @param {Number} elapsed
   */
  buildSounds(bwFrame, elapsed) {
    this.soundsBW.count = bwFrame.soundCount;
    this.soundsBW.buffer = bwFrame.sounds;

    for (let sound of this.soundsBW.items()) {
      const volume = sound.bwVolume(
        this.projectedCameraView.left,
        this.projectedCameraView.top,
        this.projectedCameraView.right,
        this.projectedCameraView.bottom
      );
      if (volume > SoundsBW.minPlayVolume) {
        if (!this.fogOfWar.isVisible(sound.tileX, sound.tileY)) {
          continue;
        }

        this.audioMaster.channels.queue(
          {
            ...sound.object(),
            volume,
            pan: sound.bwPan(
              this.projectedCameraView.left,
              this.projectedCameraView.width
            ),
          },
          elapsed
        );
      }
    }
  }

  /**
   * @param {Units} units
   */
  buildUnitsAndMinimap(bwFrame, units) {
    this.unitsBW.count = bwFrame.unitCount;
    this.unitsBW.buffer = bwFrame.units;

    this.buildQueueBW.count = bwFrame.buildingQueueCount;
    this.buildQueueBW.buffer = bwFrame.buildingQueue;

    units.refresh(
      this.unitsBW,
      this.buildQueueBW,
      this.units,
      this.unitsBySpriteId,
      this.unitsInProduction,
      bwFrame.frame
    );
  }

  /**
   * Prerequisite: buildUnitsAndMinimap() to populate unitsBySpriteId
   */
  buildSprites(bwFrame, delta, elapsed) {
    this.spritesBW.count = bwFrame.spriteCount;
    this.spritesBW.buffer = bwFrame.sprites;

    // we set count below
    this.imagesBW.buffer = bwFrame.images;
    this.interactableSprites = [];

    for (const spriteBW of this.spritesBW.items()) {
      // if (
      //   spriteBW.x < view.viewBW.left ||
      //   spriteBW.y < view.viewBW.top ||
      //   spriteBW.x > view.viewBW.right ||
      //   spriteBW.y > view.viewBW.bottom
      // ) {
      //   continue;
      // }

      let sprite = this.sprites.get(spriteBW.index);
      if (!sprite) {
        sprite = new GameSprite(spriteBW.index);
        this.sprites.set(spriteBW.index, sprite);
      }
      sprite.spriteType = spriteBW.spriteType;

      const buildingIsExplored =
        sprite.unit &&
        sprite.unit.unitType.isBuilding &&
        this.fogOfWar.isExplored(spriteBW.tileX, spriteBW.tileY);

      // doodads and resources are always visible
      // also show units as fog is lifting from or lowering to explored
      // also show if a building has been explored
      sprite.visible =
        spriteBW.owner === 11 ||
        spriteBW.spriteType.image.iscript === 336 ||
        spriteBW.spriteType.image.iscript === 337 ||
        this.fogOfWar.isSomewhatVisible(spriteBW.tileX, spriteBW.tileY);

      // don't update explored building frames so viewers only see last built frame
      const dontUpdate =
        buildingIsExplored &&
        !this.fogOfWar.isVisible(spriteBW.tileX, spriteBW.tileY);

      sprite.clear();

      sprite.renderOrder = spriteBW.order * 10;
      let _imageRenderOrder = sprite.renderOrder;

      const x = this.pxToGameUnit.x(spriteBW.x);
      let z = this.pxToGameUnit.y(spriteBW.y);
      let y = this.getTerrainY(x, z);

      sprite.unit = this.unitsBySpriteId.get(spriteBW.index);
      if (sprite.unit) {
        if (sprite.unit.isFlying) {
          const targetY = Math.min(6, y + 2.5);
          if (sprite.position.y === 0) {
            y = targetY;
          } else {
            y = MathUtils.damp(sprite.position.y, targetY, 0.001, delta);
          }
        }

        //if selected show selection sprites, also check canSelect again in case it died
        if (sprite.unit.selected && sprite.unit.canSelect) {
          sprite.select(this.completedUpgrades);
        } else {
          sprite.unselect();
        }
      }

      // liftoff z - 42, y+
      // landing z + 42, y-

      sprite.position.set(x, y, z);

      const player = this.players.playersById[spriteBW.owner];

      sprite.mainImage = null;

      for (let image of this.imagesBW.reverse(spriteBW.imageCount)) {
        if (image.hidden) continue;

        const titanImage =
          sprite.images.get(image.id) ||
          this.createTitanImage(image.id, sprite);
        if (!titanImage) continue;
        sprite.add(titanImage);

        // if (!sprite.visible || dontUpdate) {
        //   continue;
        // }

        if (player) {
          titanImage.setTeamColor(player.color.three);
        }
        titanImage.offsetX = titanImage.position.x = image.x / 32;
        titanImage.offsetY = titanImage.position.z = image.y / 32;
        titanImage.renderOrder = _imageRenderOrder++;

        //@todo: add special overlay to material for certain sprites
        if (sprite.unit) {
          if (!image.isShadow) {
            titanImage.setCloaked(sprite.unit.isCloaked);

            if (sprite.unit.warpingIn !== undefined) {
              titanImage.setWarpingIn(
                sprite.unit.warpingIn,
                sprite.unit.warpingLen,
                elapsed
              );
            }
          }
        }

        titanImage.setFrame(image.frameIndex, image.flipped);

        if (!sprite.images.has(image.id)) {
          sprite.images.set(image.id, titanImage);
        }

        if (image.index === spriteBW.mainImageIndex) {
          sprite.mainImage = titanImage;

          if (sprite.unit) {
            titanImage.rotation.y = sprite.unit.angle;
            if (!image.imageType.clickable) {
              sprite.unit.canSelect = false;
            }
            if (sprite.unit.canSelect) {
              this.interactableSprites.push(titanImage);
            }
          }
          // sprite.position.y -=
          //   titanImage.atlas.grpHeight / 2 / titanImage._spriteScale;

          // sprite.position.y =
          //   sprite.position.y -
          //   (titanImage.atlas.grpHeight -
          //     titanImage.lastSetFrame.y -
          //     titanImage.lastSetFrame.h) /
          //     titanImage._spriteScale;
        }
      }

      this.group.add(sprite);
    }
  }

  /**
   *
   * @param {Number} playerVisionFlags
   */
  buildFog(bwFrame) {
    this.tilesBW.count = bwFrame.tilesCount;
    this.tilesBW.buffer = bwFrame.tiles;

    this.fogOfWar.generate(
      this.tilesBW,
      this.players
        .filter((p) => p.vision)
        .reduce((flags, { id }) => (flags |= 1 << id), 0),
      bwFrame.frame
    );
  }

  buildCreep(bwFrame) {
    this.creepBW.count = bwFrame.creepCount;
    this.creepBW.buffer = bwFrame.creep;

    this.creep.generate(this.creepBW, bwFrame.frame);
  }

  _notifyHudOfTech() {
    if (this._notifiedHudOfTech) return;
    unstable_batchedUpdates(() =>
      useHudStore.setState({
        hasTech: true,
      })
    );
    this._notifiedHudOfTech = true;
  }

  _notifyHudOfUpgrades() {
    if (this._notifiedHudOfUpgrades) return;
    unstable_batchedUpdates(() =>
      useHudStore.setState({
        hasUpgrades: true,
      })
    );
    this._notifiedHudOfUpgrades = true;
  }

  //@todo refactor to re-use objects, maybe web worker
  buildResearchAndUpgrades(bwFrame) {
    this.researchBW.count = bwFrame.researchCount;
    this.researchBW.buffer = bwFrame.research;
    this.upgradeBW.count = bwFrame.upgradeCount;
    this.upgradeBW.buffer = bwFrame.upgrades;

    const msg = {
      frame: bwFrame.frame,
      researchCount: bwFrame.researchCount,
      researchBuffer: bwFrame.research,
      upgradeCount: bwFrame.upgradeCount,
      upgradeBuffer: bwFrame.upgrades,
    };

    this.techUpgradesWorker.postMessage(msg);

    this.research.needsUpdate = true;
    this.upgrades.needsUpdate = true;
  }

  update(bwFrame, delta, elapsed, units) {
    this.group.clear();
    this.buildUnitsAndMinimap(bwFrame, units);
    this.buildSprites(bwFrame, delta, elapsed);
    this.buildResearchAndUpgrades(bwFrame);

    this.fogOfWar.texture.needsUpdate = true;
    this.creep.creepValuesTexture.needsUpdate = true;
    this.creep.creepEdgesValuesTexture.needsUpdate = true;
  }

  dispose() {
    this.techUpgradesWorker.terminate();
  }
}
