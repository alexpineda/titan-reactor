import type { SpritesBufferView } from "@openbw/structs/sprites-buffer-view";
import type {
    UnitsBufferView,
} from "@openbw/structs/units-buffer-view";
import { ImageEntities } from "@core/image-entities";
import { ImageHD } from "@core/image-hd";
import {
    applyModelEffectsToImage3d,
    applyRenderModeToSprite,
    overlayEffectsMainImage,
} from "@core/model-effects";
import { SpriteEntities } from "@core/sprite-entities";
import { UnitEntities } from "@core/unit-entities";
import BaseScene from "@render/base-scene";
import {
    imageIsDoodad,
    imageIsFrozen,
    imageIsHidden,
    isImage3d,
    isImageHd,
    isInstancedImageHd,
} from "@utils/image-utils";
import { Janitor, JanitorLogLevel } from "three-janitor";
import { spriteIsHidden, spriteSortOrder } from "@utils/sprite-utils";
import { calculateFollowedUnitsTarget, unitIsCompleted, unitIsFlying } from "@utils/unit-utils";
import { drawFunctions, imageTypes  } from "common/enums";
import { ImageStruct, UnitStruct  } from "common/types";
import { Assets } from "@image/assets";
import { PxToWorld, floor32 } from "common/utils/conversions";
import { Color, MathUtils, Vector2, Vector3 } from "three";
import { World } from "./world";
import { Unit } from "@core/unit";
import { IterableSet } from "@utils/data-structures/iterable-set";
import { borrow, Borrowed } from "@utils/object-utils";
import { getJanitorLogLevel } from "@ipc/global";
import { ImageBase } from "..";
import { ImageHDMaterial } from "@core/image-hd-material";
import { calculateImagesFromTechTreeUnit } from "@utils/preload-map-units-and-sprites";
import { IterableMap } from "@utils/data-structures/iteratible-map";
import { SimpleQuadtree } from "@utils/data-structures/simple-quadtree";
import { settingsStore } from "@stores/settings-store";
import { HeightMaps } from "@image/generate-map";
import { Terrain } from "@core/terrain";
import { ViewControllerComposer } from "./view-controller-composer";
import gameStore from "@stores/game-store";

export type SceneComposer = Awaited<ReturnType<typeof createSceneComposer>>;
export type SceneComposerApi = SceneComposer["api"];

const white = new Color( 0xffffff );

type AdditionalSceneParams = {
    terrain: Terrain;
    heightMaps: HeightMaps,
    pxToWorld: PxToWorld
}

// Primarily concerned about converting OpenBW state to three objects and animations
export const createSceneComposer = async ( world: World, assets: Assets, viewController: ViewControllerComposer, { terrain, pxToWorld, heightMaps } : AdditionalSceneParams ) => {
    const janitor = new Janitor( "SceneComposer" );
    const _world = borrow( world );

    const units = new UnitEntities();
    units.externalOnClearUnits = () => _world.events!.emit( "units-cleared" );
    units.externalOnCreateUnit = ( unit ) => _world.events!.emit( "unit-created", unit );

    world.openBW.uploadHeightMap(
        heightMaps.singleChannel,
        ( heightMaps.texture.image as ImageData ).width,
        ( heightMaps.texture.image as ImageData ).height
    );

    const scene = janitor.mop(
        new BaseScene( ...world.map.size, terrain, assets.skyBox, assets.envMap ),
        "scene"
    );
    const sprites = janitor.mop( new SpriteEntities(), "sprites" );
    const images = janitor.mop( new ImageEntities(), "images" );
    images.onCreateImage = ( image ) => _world.events!.emit( "image-created", image );
    images.onFreeImage = ( image ) => _world.events!.emit( "image-destroyed", image );

    scene.add( sprites.group );

    const followedUnits = new IterableSet<Unit>( ( units ) =>
        _world.events!.emit( "followed-units-changed", units )
    );
    const selectedUnits = new IterableSet<Unit>( ( units ) =>
        _world.events!.emit( "selected-units-changed", units )
    );

    world.events.on( "box-selection-end", ( units ) => {
        selectedUnits.set( units );
    } );

    world.events.on( "units-cleared", () => {
        selectedUnits.clear();
        followedUnits.clear();
    } );

    world.events.on( "unit-killed", ( unit ) => {
        selectedUnits.delete( unit );
        followedUnits.delete( unit );
    } );

    world.events.on( "unit-destroyed", ( unit ) => {
        selectedUnits.delete( unit );
        followedUnits.delete( unit );
    } );

    world.events.on( "frame-reset", () => {
        images.clear();
        sprites.clear();
        units.clear();
        sprites.group.clear();
    } );

    // passed to inputComposer for intersection testing
    const mapScale = new Vector2(world.map.size[0], world.map.size[1]);
    const worldOffset = new Vector2().copy(mapScale).divideScalar(2)
    const imageQuadtree =new SimpleQuadtree<ImageBase>(4, mapScale, worldOffset);

    const unitQuadtree = new SimpleQuadtree<UnitStruct>(8, mapScale, worldOffset);

    const createUnitQuadTree = (size: number) => {
        return new SimpleQuadtree<UnitStruct>(size, mapScale, worldOffset);
    }

    const _unitPos = new Vector3();
    const _preloadedUnit = new Set<number>();

    const buildUnit = ( unitStruct: UnitsBufferView ) => {
        const unit = units.getOrCreate( unitStruct );

        sprites.setUnit( unitStruct.spriteIndex, unit );

        //if receiving damage, blink 3 times, hold blink 3 frames
        if (
            !unit.extras.recievingDamage &&
            ( unit.hp > unitStruct.hp || unit.shields > unitStruct.shields ) &&
            unit.typeId === unitStruct.typeId // ignore morphs
        ) {
            unit.extras.recievingDamage = 0b000111000111000111;
        } else if ( unit.extras.recievingDamage ) {
            unit.extras.recievingDamage = unit.extras.recievingDamage >> 1;
        }

        // unit morph
        if ( unit.typeId !== unitStruct.typeId ) {
            unit.extras.dat = assets.bwDat.units[unitStruct.typeId];
        }

        const isCompleted = unitIsCompleted( unit ) && !unitIsCompleted( unitStruct );
        
        // copy last so we can diff above
        unitStruct.copyTo( unit );

        pxToWorld.xyz( unitStruct.x, unitStruct.y, _unitPos );
        unitQuadtree.add( _unitPos.x, _unitPos.z, unit);

        world.events.emit( "unit-updated", unit );


        if ( isCompleted ) {
            world.events.emit( "unit-completed", unit );

            if ( settingsStore().data.graphics.preloadMapSprites ) {
                // get next units in tech tree and start loading their images
                const preloads = calculateImagesFromTechTreeUnit(unit.typeId, _preloadedUnit);
                for (const img of preloads) {
                    assets.loader.loadImage(img, 2);
                }
            }
        }

        

    };

    let unit: Unit | undefined;

    let _spriteY = 0;
    const _images: ImageBase[] = [];

    const buildSprite = (
        spriteStruct: SpritesBufferView,
        delta: number,
        renderMode3D: boolean,
    ) => {
        const unit = sprites.getUnit( spriteStruct.index );
        const sprite = sprites.getOrCreate( spriteStruct.index, spriteStruct.typeId );

        const dat = assets.bwDat.sprites[spriteStruct.typeId];

        // doodads and resources are always visible
        // show units as fog is lifting from or lowering to explored
        // show if a building has been explored
        sprite.visible =
            !spriteIsHidden( spriteStruct ) &&
            ( spriteStruct.owner === 11 ||
                imageIsDoodad( dat.image ) ||
                world.fogOfWar.isSomewhatVisible(
                    floor32( spriteStruct.x ),
                    floor32( spriteStruct.y )
                ) );

        sprite.renderOrder = renderMode3D ? 0 : spriteSortOrder( spriteStruct );

        _spriteY = spriteStruct.extYValue + spriteStruct.extFlyOffset * 1;
        _spriteY = _spriteY * terrain.geomOptions.maxTerrainHeight + 0.1;

        if ( sprite.userData.isNew || unit === undefined || !unitIsFlying( unit ) ) {
            sprite.position.set(
                pxToWorld.x( spriteStruct.x ),
                _spriteY,
                pxToWorld.y( spriteStruct.y )
            );
            sprite.userData.isNew = false;
        } else {
            _spriteY = MathUtils.damp( sprite.position.y, _spriteY, 0.001, delta );
            sprite.position.set(
                pxToWorld.x( spriteStruct.x ),
                _spriteY,
                pxToWorld.y( spriteStruct.y )
            );
        }

        // const groundY = terrain.getTerrainY(sprite.position.x, sprite.position.y);

        _images.length = 0;
        overlayEffectsMainImage.image = null;


        for ( const imgAddr of spriteStruct.images.reverse() ) {
            const imageStruct = world.openBW.structs.image.get( imgAddr );

            const image = images.getOrCreate( imageStruct.index, imageStruct.typeId );
            if ( !image ) {
                continue;
            }

            const shadowVisible =
                ( image.dat.drawFunction === drawFunctions.rleShadow && !renderMode3D ) ||
                image.dat.drawFunction !== drawFunctions.rleShadow;
            image.visible =
                sprite.visible &&
                !imageIsHidden( imageStruct as ImageStruct ) &&
                shadowVisible;
            image.userData.imageAddress = imageStruct._address;

            if ( !image.visible ) continue;

            //TODO: optimize depending on imageNeedsRedraw

            image.setTeamColor( world.players.get(spriteStruct.owner)?.color ?? white );
            image.setModifiers(
                imageStruct.modifier,
                imageStruct.modifierData1,
                imageStruct.modifierData2
            );
            image.position.set( 0, 0, 0 );

            //overlay offsets typically
            if (
                image instanceof ImageHD &&
                imageStruct.typeId !== imageTypes.bunkerOverlay
            ) {
                image.position.x = imageStruct.x / 32;
                // flying building or drone, don't use 2d offset
                image.position.y = imageIsFrozen( imageStruct ) ? 0 : -imageStruct.y / 32;
            }

            image.renderOrder = _images.length;

            // if we're a shadow, we act independently from a sprite since our Y coordinate
            // needs to be in world space
            if ( image.isInstanced ) {
                if ( image.parent !== sprites.group ) {
                    sprites.group.add( image );
                }
            } else {
                if ( image.parent !== sprite ) {
                    sprite.add( image );
                }
            }

            if ( imageStruct.index === spriteStruct.mainImageIndex ) {
                imageQuadtree.add( sprite.position.x, sprite.position.z, image );

                sprite.userData.mainImage = image;

                if ( unit ) {
                    images.setUnit( image, unit );
                    if (unit.isAttacking) {
                        const weapon = gameStore().assets?.bwDat.weapons[unit.extras.dat.groundWeapon] || gameStore().assets?.bwDat.weapons[unit.extras.dat.airWeapon];
                        if (weapon) {
                            viewController.doShakeCalculation(weapon.explosionType, weapon.damageType, sprite.position);
                        }
                    }
                }

                if ( isImage3d( image ) ) {
                    overlayEffectsMainImage.image = image;
                }

            }

            if (isImage3d( image ) ) {
                applyModelEffectsToImage3d( imageStruct, image, images.getUnit(image ) );
            }


            _images.push( image );
        }

        applyRenderModeToSprite(
            spriteStruct.typeId,
            sprite,
        );

        sprite.updateMatrix();
        sprite.matrixWorld.copy( sprite.matrix );
        sprite.matrixWorldNeedsUpdate = false;

        for ( const image of _images ) {
            if ( isInstancedImageHd( image ) ) {
                image.updateInstanceMatrix( sprite.matrixWorld );
            } else if ( isImageHd( image ) ) {
                image.updateMatrix();

                // for raycasting (frustum culling), need worldMatrix
                image.updateMatrixWorld();

                // for spherical projection
                ( image.material as ImageHDMaterial ).parentMatrix.copy(
                    sprite.matrixWorld
                );

                ( image.material as ImageHDMaterial ).localMatrix.copy( image.matrix );
            } else if ( isImage3d( image ) ) {
                image.updateMatrix();
                image.updateMatrixWorld();
            }

            world.events.emit( "image-updated", image );
        }
    };

    world.events.on( "dispose", () => {
        if ( Janitor.logLevel === JanitorLogLevel.Debug ) {
            Janitor.logLevel = JanitorLogLevel.Verbose;
        }
        janitor.dispose();
        Janitor.logLevel = getJanitorLogLevel();
    } );


    return {
        images,
        sprites,
        units,
        imageQuadrants: imageQuadtree,
        unitQuadrants: unitQuadtree,
        selectedUnits,
        followedUnits,
        scene,
        onFrame(
            delta: number,
            renderMode3D: boolean,
        ) {

            world.fogOfWar.onFrame( world.players.getVisionFlag() );

            terrain.userData.update( delta );

            for ( const unitId of world.openBW.iterators.killedUnitsThisFrame() ) {
                unit = units.get( unitId );
                if ( unit ) {
                    units.free( unit );
                    world.events.emit( "unit-killed", unit );
                }
            }

            for ( const unitId of world.openBW.iterators.destroyedUnitsThisFrame() ) {
                unit = units.get( unitId );
                if ( unit ) {
                    units.free( unit );
                    world.events.emit( "unit-destroyed", unit );
                }
            }

            unitQuadtree.clear();

            for ( const unit of world.openBW.iterators.units ) {
                buildUnit( unit );
            }

            for ( const spriteIndex of world.openBW.iterators.deletedSpritesThisFrame()) {
                sprites.free( spriteIndex );
            }

            for ( const imageIndex of  world.openBW.iterators.deletedImagesThisFrame()) {
                images.free( imageIndex );
            }

            imageQuadtree.clear();

            // support precompile w/out viewport

            for ( const sprite of world.openBW.iterators.sprites ) {
                buildSprite(
                    sprite,
                    delta,
                    renderMode3D,
                );
            }
        },
        resetImageCache() {
            images.dispose();
        },
        api: ( (   _world: Borrowed<World> ) => ( {
            get players() {
                return _world.players!;
            },
            //TODO: deprecate by using world event
            toggleFogOfWarByPlayerId( playerId: number ) {
                _world.players!.togglePlayerVision( playerId );
                _world.fogOfWar!.forceInstantUpdate = true;
            },
            pxToWorld,
            get units() : IterableMap<number, Unit> {
                return units.units
            },
            imageQuadtree,
            unitQuadtree,
            scene,
            followedUnits,
            //TODO: extend followedunits instead
            getFollowedUnitsCenterPosition: () => calculateFollowedUnitsTarget( followedUnits, pxToWorld ),
            selectedUnits,
            createUnitQuadTree
        } ) )( borrow( world ) ),
    };
};
