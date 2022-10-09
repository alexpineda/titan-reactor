import { deletedImageIterator, ImageBufferView } from "@buffer-view/images-buffer-view";
import { SpritesBufferView } from "@buffer-view/sprites-buffer-view";
import { deletedSpritesIterator, SpritesBufferViewIterator } from "@buffer-view/sprites-buffer-view-iterator";
import { destroyedUnitsIterator, killedUnitIterator, UnitsBufferView, UnitsBufferViewIterator } from "@buffer-view/units-buffer-view";
import { Image3D } from "@core/image-3d";
import { ImageEntities } from "@core/image-entities";
import { ImageHD } from "@core/image-hd";
import { ImageHDInstanced } from "@core/image-hd-instanced";
import { applyModelEffectsOnImage3d, applyOverlayEffectsToImageHD, applyViewportToFrameOnImageHD, overlayEffectsMainImage } from "@core/model-effects";
import { Players } from "@core/players";
import { SpriteEntities } from "@core/sprite-entities";
import { UnitEntities } from "@core/unit-entities";
import { terrainComposer } from "@image/generate-map/terrain-composer";
import BaseScene from "@render/base-scene";
import { imageIsDoodad, imageIsFrozen, imageIsHidden, imageNeedsRedraw } from "@utils/image-utils";
import { Janitor, JanitorLogLevel } from "three-janitor";
import { spriteIsHidden, spriteSortOrder } from "@utils/sprite-utils";
import { unitIsFlying } from "@utils/unit-utils";
import { drawFunctions, unitTypes } from "common/enums";
import { ImageStruct, UnitTileScale } from "common/types";
import { Assets } from "@image/assets";
import { floor32, makePxToWorld } from "common/utils/conversions";
import { Color, MathUtils, Vector3 } from "three";
import { createPlayersGameTimeApi } from "./players-api";
import { World } from "./world";
import { Unit } from "@core/unit";
import { IterableSet } from "@utils/iterable-set";
import { Borrowed } from "@utils/object-utils";
import { getJanitorLogLevel } from "@core/global";
import { getMapTiles } from "@utils/chk-utils";

export type SceneComposer = Awaited<ReturnType<typeof createSceneComposer>>;
const white = new Color(0xffffff);

// Primarily concerned about converting OpenBW state to three objects and animations
export const createSceneComposer = async (world: Borrowed<World>, assets: Assets) => {

    const janitor = new Janitor("SceneComposer");

    const { terrain, ...terrainExtra } = janitor.mop(await terrainComposer(
        ...world.map!.size, world.map!.tileset, getMapTiles(world.map!), UnitTileScale.HD,
    ), "terrain");

    const pxToWorld = makePxToWorld(...world.map!.size, terrain.getTerrainY);

    const players = new Players(world.players!);

    const startLocations =
        world.map!.units.filter((u) => u.unitId === unitTypes.startLocation)
            .map(location => pxToWorld.xyz(location.x, location.y, new Vector3()));

    const playerStartLocations =
        world.map!.units.filter((u) => u.unitId === unitTypes.startLocation && world.players!.find((p) => p.id === u.player))
            .map(location => pxToWorld.xyz(location.x, location.y, new Vector3()));

    const getPlayerColor = (playerId: number) => players.get(playerId)?.color ?? white;

    const units = new UnitEntities();
    units.externalOnClearUnits = () => world.events!.emit("units-cleared");
    units.externalOnCreateUnit = (unit) => world.events!.emit("unit-created", unit);

    world.openBW!.uploadHeightMap(terrainExtra.heightMaps.singleChannel, terrainExtra.heightMaps.texture.image.width, terrainExtra.heightMaps.texture.image.height);

    const scene = janitor.mop(new BaseScene(...world.map!.size, terrain, assets.skyBox, assets.envMap), "scene");
    const sprites = janitor.mop(new SpriteEntities(), "sprites");
    const images = janitor.mop(new ImageEntities(), "images");
    images.onCreateImage = (image) => world.events!.emit("image-created", image);
    images.onFreeImage = (image) => world.events!.emit("image-destroyed", image);

    scene.add(sprites.group);

    const followedUnits = new IterableSet<Unit>((units) => world.events!.emit("followed-units-changed", units));
    const selectedUnits = new IterableSet<Unit>((units) => world.events!.emit("selected-units-changed", units));

    world.events!.on("box-selection-end", units => {
        selectedUnits.set(units);
    })

    world.events!.on("units-cleared", () => {
        selectedUnits.clear();
        followedUnits.clear();
    });

    world.events!.on("unit-killed", (unit) => {
        selectedUnits.delete(unit);
        followedUnits.delete(unit);
    });

    world.events!.on("unit-destroyed", (unit) => {
        selectedUnits.delete(unit);
        followedUnits.delete(unit);
    });

    world.events!.on("frame-reset", () => {
        images.clear();
        sprites.clear();
        units.clear();
        sprites.group.clear();
    })

    const unitsBufferViewIterator = new UnitsBufferViewIterator(world.openBW!);

    const buildUnit = (unitData: UnitsBufferView) => {
        const unit = units.getOrCreate(unitData);

        sprites.setUnit(unitData.spriteIndex, unit);

        //if receiving damage, blink 3 times, hold blink 3 frames
        if (
            !unit.extras.recievingDamage &&
            (unit.hp > unitData.hp || unit.shields > unitData.shields)
            && unit.typeId === unitData.typeId // ignore morphs
        ) {
            unit.extras.recievingDamage = 0b000111000111000111;
        } else if (unit.extras.recievingDamage) {
            unit.extras.recievingDamage = unit.extras.recievingDamage >> 1;
        }

        // unit morph
        if (unit.typeId !== unitData.typeId) {
            unit.extras.dat = assets.bwDat.units[unitData.typeId];
        }

        unitData.copyTo(unit);

    }

    let unit: Unit | undefined;

    const spritesIterator = new SpritesBufferViewIterator(world.openBW!);
    const imageBufferView = new ImageBufferView(world.openBW!);

    let _spriteY = 0;

    const buildSprite = (spriteData: SpritesBufferView, delta: number, renderMode3D: boolean, direction: number) => {

        const unit = sprites.getUnit(spriteData.index);
        const sprite = sprites.getOrCreate(spriteData.index, spriteData.typeId);

        const dat = assets.bwDat.sprites[spriteData.typeId];

        // doodads and resources are always visible
        // show units as fog is lifting from or lowering to explored
        // show if a building has been explored
        sprite.visible = !spriteIsHidden(spriteData) && (
            spriteData.owner === 11 ||
            imageIsDoodad(dat.image) ||
            world.fogOfWar!.isSomewhatVisible(floor32(spriteData.x), floor32(spriteData.y)));

        sprite.renderOrder = renderMode3D ? 0 : spriteSortOrder(spriteData);

        _spriteY = spriteData.extYValue + (spriteData.extFlyOffset * 1);
        _spriteY = _spriteY * terrain.geomOptions.maxTerrainHeight + 0.1;

        if (sprite.userData.isNew || !unit || !unitIsFlying(unit)) {
            sprite.position.set(pxToWorld.x(spriteData.x), _spriteY, pxToWorld.y(spriteData.y))
            sprite.userData.isNew = false;
        } else {
            _spriteY = MathUtils.damp(sprite.position.y, _spriteY, 0.001, delta);
            sprite.position.set(pxToWorld.x(spriteData.x), _spriteY, pxToWorld.y(spriteData.y))
        }

        sprite.updateMatrix();
        sprite.matrixWorld.copy(sprite.matrix);

        // const groundY = terrain.getTerrainY(sprite.position.x, sprite.position.y);

        let imageCounter = 1;
        overlayEffectsMainImage.image = null

        for (const imgAddr of spriteData.images.reverse()) {
            const imageData = imageBufferView.get(imgAddr);

            const image = images.getOrCreate(imageData.index, imageData.typeId);
            if (!image) {
                continue;
            }

            // only draw shadow if main image is not 3d
            const drawShadow = image.dat.drawFunction !== drawFunctions.rleShadow || image.dat.drawFunction === drawFunctions.rleShadow && !renderMode3D;

            image.visible = sprite.visible && !imageIsHidden(imageData as ImageStruct) && drawShadow;
            image.matrixWorldNeedsUpdate = false;

            // if (image.visible) {
            image.matrixWorldNeedsUpdate = imageNeedsRedraw(imageData as ImageStruct);
            image.setTeamColor(getPlayerColor(spriteData.owner));
            image.setModifiers(imageData.modifier, imageData.modifierData1, imageData.modifierData2);
            image.position.set(0, 0, 0)
            image.rotation.set(0, 0, 0);

            //overlay offsets typically
            if (image instanceof ImageHD) {
                image.position.x = imageData.x / 32;
                // flying building or drone, don't use 2d offset
                image.position.y = imageIsFrozen(imageData) ? 0 : -imageData.y / 32;

            }

            image.renderOrder = imageCounter;

            // if we're a shadow, we act independently from a sprite since our Y coordinate
            // needs to be in world space
            if (image.isInstanced) {
                if (image.parent !== sprites.group) {
                    sprites.group.add(image);
                }
            } else {
                if (image.parent !== sprite) {
                    sprite.add(image);
                }
            }

            if (imageData.index === spriteData.mainImageIndex) {

                if (image instanceof Image3D) {
                    overlayEffectsMainImage.image = image;
                }

                if (unit) {
                    // only rotate if we're 3d and the frame is part of a frame set
                    images.setUnit(image, unit);
                }

            }

            //debug
            image.userData.imageAddress = imageData._address;

            if (image instanceof ImageHD) {

                applyViewportToFrameOnImageHD(imageData, image, renderMode3D, direction);
                applyOverlayEffectsToImageHD(imageData, image);

            } else if (image instanceof Image3D) {

                applyModelEffectsOnImage3d(imageData, image, unit);

            }

            if (image instanceof ImageHDInstanced) {
                image.updateInstanceMatrix(sprite.matrixWorld);
            } else if (image instanceof ImageHD) {
                image.updateMatrixPosition(sprite.position);
            } else if (image instanceof Image3D) {
                image.updateMatrix();
                image.updateMatrixWorld();
            }

            world.events!.emit("image-updated", image);

            imageCounter++;
        }

    }

    world.events!.on("dispose", () => {
        if (Janitor.logLevel === JanitorLogLevel.Debug) {
            Janitor.logLevel = JanitorLogLevel.Verbose;
        }
        janitor.dispose()
        Janitor.logLevel = getJanitorLogLevel();
    });

    return Object.freeze({
        images,
        sprites,
        units,
        selectedUnits,
        followedUnits,
        scene,
        terrain,
        terrainExtra,
        pxToWorld,
        pxToWorldInverse: makePxToWorld(...world.map!.size, terrain.getTerrainY, true),
        startLocations,
        playerStartLocations,
        players,
        getPlayerColor,
        onFrame(delta: number, renderMode3D: boolean, direction: number) {

            world.fogOfWar!.onFrame(players.getVisionFlag());

            terrain.userData.update(delta);

            for (const unitId of killedUnitIterator(world.openBW!)) {
                unit = units.get(unitId);
                if (unit) {
                    units.free(unit);
                    world.events!.emit("unit-killed", unit);
                }
            }

            for (const unitId of destroyedUnitsIterator(world.openBW!)) {
                unit = units.get(unitId);
                if (unit) {
                    units.free(unit);
                    world.events!.emit("unit-destroyed", unit);
                }
            }

            for (const unit of unitsBufferViewIterator) {
                buildUnit(unit);
            }

            for (const spriteIndex of deletedSpritesIterator(world.openBW!)) {
                sprites.free(spriteIndex);
            }

            for (const imageIndex of deletedImageIterator(world.openBW!)) {
                images.free(imageIndex);
            }

            for (const sprite of spritesIterator) {

                buildSprite(sprite, delta, renderMode3D, direction);

            }

        },
        resetImageCache() {
            images.dispose();
        },
        sceneGameTimeApi: {
            ...createPlayersGameTimeApi(players, world.players!, world.fogOfWar!),
            pxToWorld,
            scene
        }
    })
}