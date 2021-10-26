import { unstable_batchedUpdates } from "react-dom";
import { Group, MathUtils, Scene } from "three";

import { BwDATType } from "../common/bwdat/core/BwDAT";
import TitanImageHD from "../common/image/TitanImageHD";
import { GetTerrainY, PxToGameUnit } from "../common/types/util";
import range from "../common/utils/range";
import AudioMaster from "./audio/AudioMaster";
import ProjectedCameraView from "./camera/ProjectedCameraView";
import Creep from "./creep/Creep";
import FogOfWar from "./fogofwar/FogOfWar";
import BuildingQueueCountBW from "./game-data/BuildingQueueCountBW";
import CreepBW from "./game-data/CreepBW";
import FrameBW from "./game-data/FrameBW";
import ImagesBW from "./game-data/ImagesBW";
import ResearchBW from "./game-data/ResearchBW";
import SoundsBW from "./game-data/SoundsBW";
import SpritesBW from "./game-data/SpritesBW";
import TilesBW from "./game-data/TilesBW";
import UnitsBW from "./game-data/UnitsBW";
import UpgradeBW from "./game-data/UpgradeBW";
import BuildUnits from "./game/BuildUnits";
import { GameUnitI, ResearchInProduction, UnitInProduction, UpgradeCompleted, UpgradeInProduction, ResearchCompleted } from "./game/GameUnit";
import { Players } from "./game/Players";
import SpriteGroup from "./game/SpriteGroup";
import useHudStore from "./stores/hudStore";
import TechUpgradesWorker from "./tech-upgrades/TechUpgrades.worker";

// Prepares the game from a FrameBW state
// Updates and merges internal unit state
// Creates and updates three.js Sprites, minimap bitmap, audio,
// creep and fog of war
export default class BWFrameSceneBuilder {
  private readonly scene: Scene;
  private readonly createTitanImage: () => void;
  private readonly players: Players;
  private readonly bwDat: BwDATType;
  private readonly group = new Group();

   interactableSprites: TitanImageHD[] = [];
  private _notifiedHudOfUpgrades = false;
  private _notifiedHudOfTech = false;

  private readonly sprites: Map<number, SpriteGroup> = new Map();
  private readonly images: Map<number, TitanImageHD> = new Map();
  private readonly units: Map<number, GameUnitI> = new Map();
  private readonly unitsByIndex: Map<number, GameUnitI> = new Map();
   readonly unitsBySpriteId: Map<number, GameUnitI> = new Map();
   readonly unitsInProduction: UnitInProduction[] = [];

   research: ResearchInProduction[][];
   upgrades: UpgradeInProduction[][];
  private completedUpgrades: UpgradeCompleted[][];
  private completedResearch: ResearchCompleted[][];

  private readonly audioMaster: AudioMaster;
  private readonly creep: Creep;
  private readonly fogOfWar: FogOfWar;
  private readonly projectedCameraView: ProjectedCameraView;

  private readonly techUpgradesWorker: TechUpgradesWorker;
  private readonly soundsBW: SoundsBW;
  private readonly unitsBW = new UnitsBW();
  private readonly tilesBW = new TilesBW();
  private readonly creepBW = new CreepBW();
  private readonly spritesBW = new SpritesBW();
  private readonly imagesBW = new ImagesBW();
  private readonly researchBW = new ResearchBW();
  private readonly upgradeBW = new UpgradeBW();
  private readonly buildQueueBW = new BuildingQueueCountBW();

  private readonly getTerrainY: GetTerrainY;
  private readonly pxToGameUnit: PxToGameUnit;

  constructor(
    scene: Scene,
    creep: Creep,
    bwDat: any,
    pxToGameUnit: PxToGameUnit,
    getTerrainY: GetTerrainY,
    players: Players,
    fogOfWar: FogOfWar,
    audioMaster: AudioMaster,
    createTitanImage: () => void,
    projectedCameraView: ProjectedCameraView
  ) {
    this.players = players;
    this.audioMaster = audioMaster;
    this.createTitanImage = createTitanImage;
    this.projectedCameraView = projectedCameraView;
    this.soundsBW = new SoundsBW(pxToGameUnit, getTerrainY);
    this.bwDat = bwDat;
    this.pxToGameUnit = pxToGameUnit;
    this.getTerrainY = getTerrainY;
    this.creep = creep;
    this.fogOfWar = fogOfWar;

    this.research = range(0, 8).map(() => []);
    this.upgrades = range(0, 8).map(() => []);
    this.completedResearch = range(0, 8).map(() => []);
    this.completedUpgrades = range(0, 8).map(() => []);

    this.scene = scene;
    this.scene.add(this.group);

    this.techUpgradesWorker = new TechUpgradesWorker();
    this.techUpgradesWorker.postMessage({
      type: "init",
      techDat: bwDat.tech,
      upgradesDat: bwDat.upgrades,
    });

    //@todo type workers
    this.techUpgradesWorker.onmessage = ({ data }: any) => {
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
  }

  prepare(bwFrame: FrameBW, elapsed: number): void {
    this.buildSounds(bwFrame, elapsed);
    this.buildFog(bwFrame);
    this.buildCreep(bwFrame);
  }

  buildSounds(bwFrame: FrameBW, elapsed: number) {
    this.soundsBW.count = bwFrame.soundCount;
    this.soundsBW.buffer = bwFrame.sounds;

    for (const sound of this.soundsBW.items()) {
      if (!this.fogOfWar.isVisible(sound.tileX, sound.tileY)) {
        continue;
      }
      const volume = sound.bwVolume(
        this.projectedCameraView.left,
        this.projectedCameraView.top,
        this.projectedCameraView.right,
        this.projectedCameraView.bottom
      );
      if (volume > SoundsBW.minPlayVolume) {
        this.audioMaster.channels.queue(
          sound.object(),
          elapsed
        );
      }
    }
  }

  buildUnitsAndMinimap(bwFrame: FrameBW, units: BuildUnits) {
    this.unitsBW.count = bwFrame.unitCount;
    this.unitsBW.buffer = bwFrame.units;

    this.buildQueueBW.count = bwFrame.buildingQueueCount;
    this.buildQueueBW.buffer = bwFrame.buildingQueue;

    units.refresh(
      this.unitsBW,
      this.buildQueueBW,
      this.units,
      this.unitsBySpriteId,
      this.unitsInProduction
    );
  }

  /**
   * Prerequisite: buildUnitsAndMinimap() to populate unitsBySpriteId
   */
  buildSprites(bwFrame: FrameBW, delta: number, elapsed: number) {
    this.spritesBW.count = bwFrame.spriteCount;
    this.spritesBW.buffer = bwFrame.sprites;

    // we set count below
    this.imagesBW.buffer = bwFrame.images;
    this.interactableSprites = [];

    for (const spriteBW of this.spritesBW.items()) {
      // if (
      //   spriteBW.x < this.projectedCameraView.viewBW.left ||
      //   spriteBW.y < this.projectedCameraView.viewBW.top ||
      //   spriteBW.x > this.projectedCameraView.viewBW.right ||
      //   spriteBW.y > this.projectedCameraView.viewBW.bottom
      // ) {
      //   continue;
      // }

      let sprite = this.sprites.get(spriteBW.index);
      if (!sprite) {
        sprite = new SpriteGroup(spriteBW.index);
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
      const z = this.pxToGameUnit.y(spriteBW.y);
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

      for (const image of this.imagesBW.reverse(spriteBW.imageCount)) {
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

        let z = 0;
        if (image.index === spriteBW.mainImageIndex) {
          sprite.mainImage = titanImage;
          z = titanImage._zOff * (titanImage._spriteScale / 32); //x4 for HD

          if (sprite.unit) {
            titanImage.rotation.y = sprite.unit.angle;
            if (!image.imageType.clickable) {
              sprite.unit.canSelect = false;
            }
            if (sprite.unit.canSelect) {
              this.interactableSprites.push(titanImage);
            }
          }
        }
        sprite.position.z += z - sprite.lastZOff;
        sprite.lastZOff = z;
      }

      this.group.add(sprite);
    }
  }

  /**
   *
   * @param {Number} playerVisionFlags
   */
  buildFog(bwFrame: FrameBW): void {
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

  buildCreep(bwFrame: FrameBW): void {
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
  buildResearchAndUpgrades(bwFrame: FrameBW) {
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
  }

  update(bwFrame: FrameBW, delta: number, elapsed: number, units: BuildUnits) {
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
