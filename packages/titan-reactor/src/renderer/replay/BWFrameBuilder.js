import { MathUtils } from "three";
import Creep from "titan-reactor-shared/map/Creep";
import BuildingQueueCountBW from "./bw/BuildingQueueCountBW";
import CreepBW from "./bw/CreepBW";
import ImagesBW from "./bw/ImagesBW";
import SoundsBW from "./bw/SoundsBW";
import SpritesBW from "./bw/SpritesBW";
import TilesBW from "./bw/TilesBW";
import UnitsBW from "./bw/UnitsBW";
import BWFrameScene from "./BWFrameScene";
import Sprite from "./Sprite";

export default class BWFrameSceneBuilder {
  /**
   *
   * @param {TitanReactorScene} scene
   * @param {Number} mapWidth
   * @param {Number} mapHeight
   * @param {Scene} minimapScene
   * @param {Object} bwDat
   * @param {Function} pxToGameUnit
   * @param {Function} getTerrainY
   * @param {Object} playersById
   * @param {FogOfWar} fogOfWar
   */
  constructor(
    scene,
    mapWidth,
    mapHeight,
    minimapScene,
    bwDat,
    pxToGameUnit,
    getTerrainY,
    playersById,
    fogOfWar
  ) {
    this.bwScene = new BWFrameScene(scene, 1);
    this.minimapBwScene = new BWFrameScene(minimapScene, 1);
    this.unitsBW = new UnitsBW(bwDat);
    this.tilesBW = new TilesBW();
    this.creepBW = new CreepBW();
    this.soundsBW = new SoundsBW(bwDat, pxToGameUnit, getTerrainY);
    this.spritesBW = new SpritesBW(bwDat);
    this.imagesBW = new ImagesBW(bwDat);
    this.buildQueueBW = new BuildingQueueCountBW(bwDat);
    this.pxToGameUnit = pxToGameUnit;
    this.getTerrainY = getTerrainY;
    this.creep = new Creep(
      mapWidth,
      mapHeight,
      scene.creepUniform.value,
      scene.creepEdgesUniform.value
    );
    this.playersById = playersById;
    this.fogOfWar = fogOfWar;

    this.sprites = new Map();
    this.images = new Map();
    this.units = new Map();
    this.unitsByIndex = new Map();
    this.unitsBySpriteId = new Map();
    this.production = new Map();
  }

  buildStart(nextFrame, updateMinimap) {
    this.nextFrame = nextFrame;
    this.updateMinimap = updateMinimap;
    this.bwScene.swap();
    if (updateMinimap) {
      this.minimapBwScene.swap();
    }
  }

  /**
   *
   * @param {ProjectedCameraView} view
   * @param {AudioMaster} audioMaster
   * @param {Number} elapsed
   */
  buildSounds(view, audioMaster, elapsed) {
    this.soundsBW.count = this.nextFrame.soundCount;
    this.soundsBW.buffer = this.nextFrame.sounds;

    for (let sound of this.soundsBW.items()) {
      const volume = sound.bwVolume(
        view.left,
        view.top,
        view.right,
        view.bottom
      );
      if (volume > SoundsBW.minPlayVolume) {
        if (!this.fogOfWar.isVisible(sound.tileX, sound.tileY)) {
          continue;
        }

        audioMaster.channels.queue(
          {
            ...sound.object(),
            volume,
            pan: sound.bwPan(view.left, view.width),
          },
          elapsed
        );
      }
    }
  }

  /**
   * @param {Units} units
   */
  buildUnitsAndMinimap(units) {
    this.unitsBW.count = this.nextFrame.unitCount;
    this.unitsBW.buffer = this.nextFrame.units;

    this.buildQueueBW.count = this.nextFrame.buildingQueueCount;
    this.buildQueueBW.buffer = this.nextFrame.buildingQueue;

    for (const minimapUnit of units.refresh(
      this.unitsBW,
      this.buildQueueBW,
      this.units,
      this.unitsBySpriteId,
      this.production
    )) {
      if (this.updateMinimap && minimapUnit) {
        minimapUnit.visible = minimapUnit.userData.isResourceContainer
          ? true
          : this.fogOfWar.isVisible(
              minimapUnit.userData.tileX,
              minimapUnit.userData.tileY
            );
        this.minimapBwScene.add(minimapUnit);
      }
    }
  }

  /**
   * Prerequisite: buildUnitsAndMinimap() to populate unitsBySpriteId
   * @param {ReplaySprites} sprites
   * @param {ProjectedCameraView} view
   */
  buildSprites(view, delta, createImage) {
    this.spritesBW.count = this.nextFrame.spriteCount;
    this.spritesBW.buffer = this.nextFrame.sprites;

    // we set count below
    this.imagesBW.buffer = this.nextFrame.images;

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
        sprite = new Sprite(spriteBW.index);
        this.sprites.set(spriteBW.index, sprite);
      } else {
        sprite.clear();
      }

      sprite.renderOrder = spriteBW.order * 10;
      let _imageRenderOrder = sprite.renderOrder;

      const x = this.pxToGameUnit.x(spriteBW.x);
      let z = this.pxToGameUnit.y(spriteBW.y);
      let y = this.getTerrainY(x, z);

      sprite.unit = this.unitsBySpriteId.get(spriteBW.index);
      if (sprite.unit) {
        if (sprite.unit.isFlying || sprite.unit.isFlyingBuilding) {
          //@todo: get max terrain height + 1 for max
          //use a different step rather than 2? based on elevations?

          // undo the y offset for floating building since we manage that ourselves
          if (sprite.unit.isFlyingBuilding && sprite.unit.isFlying) {
            z = z - 42 / 32;
          }

          const targetY = sprite.unit.isFlying ? Math.min(6, y + 4) : y;
          if (!sprite.initialized) {
            y = targetY;
          } else {
            y = MathUtils.damp(sprite.position.y, targetY, 0.0001, delta);
          }
        }
      }

      sprite.position.set(x, y, z);

      sprite.initialized = true;
      const player = this.playersById[spriteBW.owner];

      // const buildingIsExplored =
      //   sprite.unit &&
      //   sprite.unit.isBuilding &&
      //   this.fogOfWar.isExplored(spriteBW.tileX, spriteBW.tileY);

      // doodads and resources are always visible
      sprite.visible =
        spriteBW.owner === 11 ||
        spriteBW.spriteType.image.iscript === 336 ||
        spriteBW.spriteType.image.iscript === 337 ||
        this.fogOfWar.isSomewhatVisible(spriteBW.tileX, spriteBW.tileY);

      // const dontUpdate =
      //   buildingIsExplored &&
      //   !this.fogOfWar.isVisible(spriteBW.tileX, spriteBW.tileY);

      for (let image of this.imagesBW.reverse(spriteBW.imageCount)) {
        if (image.hidden) continue;

        const titanImage =
          sprite.images.get(image.id) || createImage(image.id, sprite);
        if (!titanImage) continue;
        sprite.add(titanImage);

        //don't update the image so that explored fog of war shows last played frame
        if (!sprite.visible) {
          continue;
        }

        if (player) {
          titanImage.setTeamColor(player.color.three);
        }
        titanImage.position.x = image.x / 32;
        titanImage.position.z = image.y / 32;
        titanImage.renderOrder = _imageRenderOrder++;

        if (sprite.unit) {
          //@todo move this to material
          if (!image.isShadow) {
            titanImage.material.opacity = sprite.unit.isCloaked ? 0.5 : 1;
          }

          // if (spriteBW.mainImageIndex === image.index) {
          //   titanImage.setWarpingIn(sprite.unit.warpingIn);
          // }
        }

        titanImage.setFrame(image.frameIndex, image.flipped);

        if (!sprite.images.has(image.id)) {
          sprite.images.set(image.id, titanImage);
        }
      }

      this.bwScene.add(sprite);
    }
  }

  /**
   *
   * @param {Number} playerVisionFlags
   */
  buildFog(playerVisionFlags) {
    this.tilesBW.count = this.nextFrame.tilesCount;
    this.tilesBW.buffer = this.nextFrame.tiles;

    this.fogOfWar.generate(this.tilesBW, playerVisionFlags);
  }

  buildCreep() {
    this.creepBW.count = this.nextFrame.creepCount;
    this.creepBW.buffer = this.nextFrame.creep;

    this.creep.generate(this.creepBW);
  }

  compile(...args) {
    this.bwScene.compile(...args);
  }
}
