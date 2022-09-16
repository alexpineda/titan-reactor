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
import { chkToTerrainMesh } from "@image/generate-map/chk-to-terrain-mesh";
import BaseScene from "@render/base-scene";
import { imageIsDoodad, imageIsFrozen, imageIsHidden, imageNeedsRedraw } from "@utils/image-utils";
import Janitor from "@utils/janitor";
import { spriteIsHidden, spriteSortOrder } from "@utils/sprite-utils";
import { unitIsFlying } from "@utils/unit-utils";
import { drawFunctions, unitTypes } from "common/enums";
import { ImageStruct, UnitTileScale } from "common/types";
import { Assets } from "@image/assets";
import { floor32, makePxToWorld } from "common/utils/conversions";
import { ViewComposer } from "@core/world/view-composer";
import { Color, MathUtils, Vector3 } from "three";
import { createPlayersGameTimeApi } from "./players-api";
import { World } from "./world";
import { Unit } from "@core/unit";
import { IterableSet } from "@utils/iterable-set";

export type SceneComposer = Awaited<ReturnType<typeof createSceneComposer>>;
const white = new Color(0xffffff);

// Primarily concerned about converting OpenBW state to three objects and animations
export const createSceneComposer = async ({ map, players: basePlayers, openBW, fogOfWar, events }: World, viewports: ViewComposer, assets: Assets) => {

    const janitor = new Janitor();

    const { terrain, ...terrainExtra } = janitor.mop(await chkToTerrainMesh(
        map, UnitTileScale.HD,
    ));

    const pxToWorld = makePxToWorld(map.size[0], map.size[1], terrain.getTerrainY);

    const players = new Players(basePlayers);

    const startLocations =
        map.units.filter((u) => u.unitId === unitTypes.startLocation)
            .sort((a, b) => a.player - b.player)
            .map(location => pxToWorld.xyz(location.x, location.y, new Vector3()));

    const getPlayerColor = (playerId: number) => players.get(playerId)?.color ?? white;

    const units = new UnitEntities();
    units.externalOnClearUnits = () => events.emit("units-cleared");
    units.externalOnCreateUnit = (unit) => events.emit("unit-created", unit);

    openBW.uploadHeightMap(terrainExtra.heightMaps.singleChannel, terrainExtra.heightMaps.displacementImage.width, terrainExtra.heightMaps.displacementImage.height);

    const scene = janitor.mop(new BaseScene(map.size[0], map.size[1], terrain, assets.skyBox, assets.envMap));
    const sprites = janitor.mop(new SpriteEntities());
    const images = janitor.mop(new ImageEntities());
    images.onCreateImage = (image) => events.emit("image-created", image);
    images.onFreeImage = (image) => events.emit("image-destroyed", image);

    scene.add(sprites.group);

    const followedUnits = new IterableSet<Unit>((units) => events.emit("followed-units-changed", units));
    const selectedUnits = new IterableSet<Unit>((units) => events.emit("selected-units-changed", units));

    events.on("units-cleared", () => {
        selectedUnits.clear();
        followedUnits.clear();
    });

    events.on("unit-killed", (unit) => {
        selectedUnits.delete(unit);
        followedUnits.delete(unit);
    });

    events.on("unit-destroyed", (unit) => {
        selectedUnits.delete(unit);
        followedUnits.delete(unit);
    });

    const unitsBufferViewIterator = new UnitsBufferViewIterator(openBW);

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

    const buildUnits = (
    ) => {

        for (const unitId of killedUnitIterator(openBW)) {
            unit = units.get(unitId);
            if (unit) {
                units.free(unit);
                events.emit("unit-killed", unit);
            }
        }

        for (const unitId of destroyedUnitsIterator(openBW)) {
            unit = units.get(unitId);
            if (unit) {
                units.free(unit);
                events.emit("unit-destroyed", unit);
            }
        }

        for (const unit of unitsBufferViewIterator) {
            buildUnit(unit);
        }

    }

    const spritesIterator = new SpritesBufferViewIterator(openBW);
    const imageBufferView = new ImageBufferView(openBW);

    let _spriteY = 0;

    const buildSprite = (spriteData: SpritesBufferView, delta: number) => {

        const unit = sprites.getUnit(spriteData.index);
        let sprite = sprites.getOrCreate(spriteData.index, spriteData.typeId);

        const dat = assets.bwDat.sprites[spriteData.typeId];

        // doodads and resources are always visible
        // show units as fog is lifting from or lowering to explored
        // show if a building has been explored
        sprite.visible = !spriteIsHidden(spriteData) && (
            spriteData.owner === 11 ||
            imageIsDoodad(dat.image) ||
            fogOfWar.isSomewhatVisible(floor32(spriteData.x), floor32(spriteData.y)));

        sprite.renderOrder = viewports.primaryViewport!.renderMode3D ? 0 : spriteSortOrder(spriteData);

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

        let imageCounter = 1;
        overlayEffectsMainImage.image = null

        for (const imgAddr of spriteData.images.reverse()) {
            const imageData = imageBufferView.get(imgAddr);

            let image = images.getOrCreate(imageData.index, imageData.typeId);
            if (!image) {
                continue;
            }

            // only draw shadow if main image is not 3d
            const drawShadow = image.dat.drawFunction !== drawFunctions.rleShadow || image.dat.drawFunction === drawFunctions.rleShadow && !viewports.primaryViewport?.renderMode3D;

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

                applyViewportToFrameOnImageHD(imageData, image, viewports.primaryViewport!);
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
            imageCounter++;
        }

    }

    const buildSprites = (delta: number) => {


        for (const spriteIndex of deletedSpritesIterator(openBW)) {
            sprites.free(spriteIndex);
        }

        for (const imageIndex of deletedImageIterator(openBW)) {
            images.free(imageIndex);
        }

        for (const sprite of spritesIterator) {

            buildSprite(sprite, delta);

        }

    };

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
        pxToWorldInverse: makePxToWorld(map.size[0], map.size[1], terrain.getTerrainY, true),
        startLocations,
        players,
        getPlayerColor,
        onFrame(delta: number) {

            fogOfWar.onFrame(players.getVisionFlag());

            buildUnits();
            buildSprites(delta);

        },
        onFrameReset() {
            images.clear();
            sprites.clear();
            units.clear();
            sprites.group.clear();
        },
        dispose: () => janitor.dispose(),
        resetImageCache() {
            images.dispose();
        },
        sceneGameTimeApi: {
            ...createPlayersGameTimeApi(players, basePlayers, fogOfWar),
            pxToWorld,
            scene
        }
    })
}