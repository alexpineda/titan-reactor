import { Group, MathUtils } from "three";
import Creep from "../creep/Creep";
import BuildingQueueCountBW from "../bw/BuildingQueueCountBW";
import CreepBW from "../bw/CreepBW";
import ImagesBW from "../bw/ImagesBW";
import SoundsBW from "../bw/SoundsBW";
import SpritesBW from "../bw/SpritesBW";
import TilesBW from "../bw/TilesBW";
import UnitsBW from "../bw/UnitsBW";
import ResearchBW from "../bw/ResearchBW";
import UpgradeBW from "../bw/UpgradeBW";
import Sprite from "../Sprite";
import { range } from "ramda";

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
    mapWidth,
    mapHeight,
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
    this.unitsBW = new UnitsBW(bwDat);
    this.tilesBW = new TilesBW();
    this.creepBW = new CreepBW();
    this.soundsBW = new SoundsBW(bwDat, pxToGameUnit, getTerrainY);
    this.spritesBW = new SpritesBW(bwDat);
    this.imagesBW = new ImagesBW(bwDat);
    this.researchBW = new ResearchBW();
    this.upgradeBW = new UpgradeBW();
    this.buildQueueBW = new BuildingQueueCountBW(bwDat);
    this.bwDat = bwDat;
    this.pxToGameUnit = pxToGameUnit;
    this.getTerrainY = getTerrainY;
    this.creep = new Creep(
      mapWidth,
      mapHeight,
      scene.creepUniform.value,
      scene.creepEdgesUniform.value
    );
    this.fogOfWar = fogOfWar;

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
   * @param {ReplaySprites} sprites
   * @param {ProjectedCameraView} view
   */
  buildSprites(bwFrame, delta) {
    this.spritesBW.count = bwFrame.spriteCount;
    this.spritesBW.buffer = bwFrame.sprites;

    // we set count below
    this.imagesBW.buffer = bwFrame.images;

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
      }

      const buildingIsExplored =
        sprite.unit &&
        sprite.unit.isBuilding &&
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
      const player = this.players.playersById[spriteBW.owner];

      let _afterMainImage = false;
      for (let image of this.imagesBW.reverse(spriteBW.imageCount)) {
        if (image.hidden) continue;

        const titanImage =
          sprite.images.get(image.id) ||
          this.createTitanImage(image.id, sprite);
        if (!titanImage) continue;
        sprite.add(titanImage);

        if (!sprite.visible || dontUpdate) {
          continue;
        }

        if (player) {
          titanImage.setTeamColor(player.color.three);
        }
        titanImage.position.x = image.x / 32;
        titanImage.position.z = image.y / 32;
        titanImage.renderOrder = _imageRenderOrder++;

        //@todo: add special overlay to material for certain sprites
        // if (_afterMainImage) {
        //   titanImage.setScale(new Vector3(1.01, 1.01, 1));
        // }
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

        if (image.index === spriteBW.mainImageIndex) {
          _afterMainImage = true;
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

  buildResearchAndUpgrades(bwFrame) {
    this.researchBW.count = bwFrame.researchCount;
    this.researchBW.buffer = bwFrame.research;
    this.upgradeBW.count = bwFrame.upgradeCount;
    this.upgradeBW.buffer = bwFrame.upgrades;

    const researchInProgress = this.researchBW.instances();
    const upgradesInProgress = this.upgradeBW.instances();

    for (let i = 0; i < 8; i++) {
      this.research[i] = [...this.completedResearch[i]];
      this.upgrades[i] = [...this.completedUpgrades[i]];

      for (const research of researchInProgress) {
        if (research.owner === i) {
          const researchObj = {
            ...research,
            icon: this.bwDat.tech[research.typeId].icon,
            count: 1,
            buildTime: this.bwDat.tech[research.typeId].researchTime,
            isTech: true,
          };
          this.research[i].push(researchObj);
          if (research.remainingBuildTime === 0) {
            this.completedResearch[i].push(researchObj);
          }
        }
      }

      for (const upgrade of upgradesInProgress) {
        if (upgrade.owner === i) {
          const upgradeObj = {
            ...upgrade,
            icon: this.bwDat.upgrades[upgrade.typeId].icon,
            count: upgrade.level,
            buildTime:
              this.bwDat.upgrades[upgrade.typeId].researchTimeBase +
              this.bwDat.upgrades[upgrade.typeId].researchTimeFactor *
                upgrade.level,
            isUpgrade: true,
          };
          this.upgrades[i].push(upgradeObj);
          if (upgrade.remainingBuildTime === 0) {
            this.completedUpgrades[i].push(upgradeObj);
          }
        }
      }
    }

    this.research.needsUpdate = true;
    this.upgrades.needsUpdate = true;
  }

  update(bwFrame, delta, units) {
    this.group.clear();
    this.buildUnitsAndMinimap(bwFrame, units);
    this.buildSprites(bwFrame, delta);
    this.buildResearchAndUpgrades(bwFrame);

    this.fogOfWar.texture.needsUpdate = true;
    this.creep.creepValuesTexture.needsUpdate = true;
    this.creep.creepEdgesValuesTexture.needsUpdate = true;
  }
}
