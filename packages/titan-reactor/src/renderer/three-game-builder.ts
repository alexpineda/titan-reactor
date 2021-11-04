import { unstable_batchedUpdates } from "react-dom";
import { Group, MathUtils, Scene } from "three";

import { ImageInstance, TitanImageHD } from "../common/image";
import {
  BwDATType,
  GetTerrainY,
  ImageIndex,
  PxToGameUnit,
  SpriteIndex,
  UnitTag,
} from "../common/types";
import range from "../common/utils/range";
import AudioMaster from "./audio/audio-master";
import ProjectedCameraView from "./camera/projected-camera-view";
import Creep from "./creep/creep";
import FogOfWar from "./fogofwar/fog-of-war";
import {
  BuildingQueueCountBW,
  CreepBW,
  FrameBW,
  ImagesBW,
  ResearchBW,
  SoundsBW,
  SpritesBW,
  TilesBW,
  UnitsBW,
  UpgradeBW,
} from "./game-data";
import { BuildUnits, Players, SpriteInstance } from "./game";
import {
  ResearchCompleted,
  ResearchInProduction,
  UnitInProduction,
  UnitInstance,
  UpgradeCompleted,
  UpgradeInProduction,
} from "./game/unit-instance";
import useHudStore from "./stores/hud-store";
import TechUpgradesWorker from "./tech-upgrades/tech-upgrades.worker";

// Prepares the game from a FrameBW state
// Updates and merges internal unit state
// Creates and updates three.js Sprites, minimap bitmap, audio,
// creep and fog of war
export default class BWFrameSceneBuilder {
  private readonly scene: Scene;
  private readonly createTitanImage: (
    id: number,
    sprite: SpriteInstance
  ) => ImageInstance;
  private readonly players: Players;
  private readonly bwDat: BwDATType;
  private readonly group = new Group();

  interactableSprites: ImageInstance[] = [];
  private _notifiedHudOfUpgrades = false;
  private _notifiedHudOfTech = false;

  private readonly sprites: Map<SpriteIndex, SpriteInstance> = new Map();
  private readonly images: Map<ImageIndex, TitanImageHD> = new Map();
  private readonly units: Map<UnitTag, UnitInstance> = new Map();
  readonly unitsBySpriteId: Map<SpriteIndex, UnitInstance> = new Map();
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
    createTitanImage: (id: number, sprite: SpriteInstance) => ImageInstance,
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

  prepare(bwFrame: FrameBW): void {
    this.buildSounds(bwFrame);
    this.buildFog(bwFrame);
    this.buildCreep(bwFrame);
  }

  buildSounds(bwFrame: FrameBW) {
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
        this.audioMaster.channels.queue(sound.object());
      }
    }
  }

  buildUnitsAndMinimap(bwFrame: FrameBW, buildUnits: BuildUnits) {
    this.unitsBW.count = bwFrame.unitCount;
    this.unitsBW.buffer = bwFrame.units;

    this.buildQueueBW.count = bwFrame.buildingQueueCount;
    this.buildQueueBW.buffer = bwFrame.buildingQueue;

    buildUnits.refresh(
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
  buildSprites(bwFrame: FrameBW, delta: number) {
    this.spritesBW.count = bwFrame.spriteCount;
    this.spritesBW.buffer = bwFrame.sprites;

    // we set count below
    this.imagesBW.buffer = bwFrame.images;
    this.interactableSprites = [];

    for (const spriteBW of this.spritesBW.items()) {
      let sprite = this.sprites.get(spriteBW.index);
      if (!sprite) {
        sprite = new SpriteInstance(spriteBW.index);
        this.sprites.set(spriteBW.index, sprite);
      }
      sprite.spriteType = spriteBW.spriteType;

      const buildingIsExplored =
        sprite.unit &&
        sprite.unit.unitType.isBuilding &&
        this.fogOfWar.isExplored(spriteBW.tileX, spriteBW.tileY);

      // doodads and resources are always visible
      // show units as fog is lifting from or lowering to explored
      // show if a building has been explored
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

        //@todo we should clear sprite.images, and somehow incorporate "free images" for re-use
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
        // overlay position
        titanImage.offsetX = titanImage.position.x = image.x / 32;
        titanImage.offsetY = titanImage.position.z = image.y / 32;
        titanImage.renderOrder = _imageRenderOrder++;

        // 63-48=15
        if (image.modifier === 14) {
          titanImage.setWarpingIn((image.modifierData1 - 48) / 15);
        } else {
          //@todo see if we even need this
          titanImage.setWarpingIn(0);
        }
        //@todo use modifier 1 for opacity value
        titanImage.setCloaked(image.modifier === 2 || image.modifier === 5);

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
        //@todo is this the reason for overlays displaying in 0,0?
        // sprite.position.z += z - sprite.lastZOff;
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

  update(
    bwFrame: FrameBW,
    delta: number,
    elapsed: number,
    buildUnits: BuildUnits
  ) {
    this.group.clear();
    this.buildUnitsAndMinimap(bwFrame, buildUnits);
    this.buildSprites(bwFrame, delta);
    this.buildResearchAndUpgrades(bwFrame);

    this.fogOfWar.texture.needsUpdate = true;
    this.creep.creepValuesTexture.needsUpdate = true;
    this.creep.creepEdgesValuesTexture.needsUpdate = true;
  }

  dispose() {
    this.techUpgradesWorker.terminate();
  }
}
