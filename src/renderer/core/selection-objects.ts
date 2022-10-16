import { SelectionCircleHD } from "@core/selection-circle-hd";
import { SelectionBars } from "@core/selection-bars";
import range from "common/utils/range";
import { Camera, Group, Vector3 } from "three";
import { SpriteDAT, SpriteType } from "common/types";
import { Image3D, ImageHD, Unit } from "@core";
import { SpriteEntities } from "@core/sprite-entities";
import { Assets } from "@image/assets";
import { SelectionCircle3D } from "./selection-circle-3d";
const _cameraWorldDirection = new Vector3();

export class SelectionObject extends Group {
    #circle3d = new SelectionCircle3D();
    #circle2d = new SelectionCircleHD();
    #bars = new SelectionBars();

    #group2d = new Group();

    constructor() {
        super();
        this.visible = false;
        this.name = "SelectionObject";

        this.#group2d.add( this.#circle2d, this.#bars );

        this.add( this.#group2d, this.#circle3d );

        if ( import.meta.hot ) {
            import.meta.hot.accept( "./selection-circle-3d", ( module ) => {
                if ( module && module.SelectionCircle3D ) {
                    this.remove( this.#circle3d );
                    this.#circle3d =
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        new module.SelectionCircle3D() as SelectionCircle3D;
                    this.add( this.#circle3d );
                }
            } );
        }
    }

    update(
        unit: Unit,
        sprite: SpriteType,
        spriteDat: SpriteDAT,
        completedUpgrades: number[]
    ) {
        this.#bars.update( unit, spriteDat, completedUpgrades, sprite.renderOrder );

        this.position.copy( sprite.position );

        if ( sprite.userData.mainImage instanceof ImageHD ) {
            this.#circle2d.visible = true;
            this.#circle3d.visible = false;

            this.#circle2d.update( spriteDat );
        } else if ( sprite.userData.mainImage instanceof Image3D ) {
            this.#circle2d.visible = false;
            this.#circle3d.visible = true;

            this.#circle3d.update( spriteDat, sprite.userData.mainImage );
        }

        this.#group2d.lookAt(
            this.position.x - _cameraWorldDirection.x,
            this.position.y - _cameraWorldDirection.y,
            this.position.z - _cameraWorldDirection.z
        );

        this.updateMatrixWorld();
    }
}

export const createSelectionDisplayComposer = ( assets: Assets ) => {
    const objects = range( 0, 12 ).map( ( _ ) => new SelectionObject() );

    const hideSelections = () => {
        for ( const selectionObject of objects ) {
            selectionObject.visible = false;
        }
    };

    function update(
        camera: Camera,
        sprites: SpriteEntities,
        completedUpgrades: number[][],
        selectedUnits: Unit[]
    ) {
        camera.getWorldDirection( _cameraWorldDirection );
        let sprite: SpriteType | undefined;

        for ( let i = 0; i < 12; i++ ) {
            const unit = selectedUnits[i] as Unit | undefined;
            objects[i].visible = !!unit;
            if ( unit ) {
                sprite = sprites.get( unit.spriteIndex );
                if ( sprite ) {
                    objects[i].update(
                        unit,
                        sprite,
                        assets.bwDat.sprites[sprite.userData.typeId],
                        completedUpgrades[unit.owner]
                    );
                }
            }
        }
    }

    return {
        objects,
        hideSelections,
        update,
    };
};
