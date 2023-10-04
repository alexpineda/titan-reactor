import { SelectionCircleHD } from "@core/selection-circle-hd";
import { SelectionBars } from "@core/selection-bars";
import range from "common/utils/range";
import { Group } from "three";
import { SpriteDAT, SpriteType } from "common/types";
import { Unit } from "@core";
import { SpriteEntities } from "@core/sprite-entities";
import { Assets } from "@image/assets";
import { SelectionCircle3D } from "./selection-circle-3d";
import { isImage3d, isImageHd } from "@utils/image-utils";

/**
 * A selection wrapper that supports showing a selection circle for 2d or 3d image objects
 */
export class SelectionObject extends Group {
    #circle3d = new SelectionCircle3D();
    #circle2d = new SelectionCircleHD();
    #bars = new SelectionBars();

    constructor() {
        super();
        this.visible = false;
        this.name = "SelectionObject";

        this.add( this.#circle2d, this.#bars, this.#circle3d );
        this.frustumCulled = false;
    }

    update(
        unit: Unit,
        sprite: SpriteType,
        spriteDat: SpriteDAT,
        completedUpgrades: number[]
    ) {
        // this.position.copy( sprite.position );
        // this.updateMatrix();
        // this.updateMatrixWorld();
        this.matrix.copy( sprite.matrix );
        this.matrixWorld.copy( sprite.matrixWorld );

        this.#bars.update(
            unit,
            sprite,
            spriteDat,
            completedUpgrades,
            sprite.renderOrder
        );

        if ( isImageHd( sprite.userData.mainImage ) ) {
            this.#circle2d.visible = true;
            this.#circle3d.visible = false;

            this.#circle2d.update( sprite, spriteDat );
        } else if ( isImage3d( sprite.userData.mainImage ) ) {
            this.#circle2d.visible = false;
            this.#circle3d.visible = true;

            this.#circle3d.update( spriteDat, sprite.userData.mainImage );
        }
    }
}

/**
 * Manages the selection up to 12 selection objects.
 */
export const createSelectionDisplayComposer = ( assets: Assets ) => {
    const objects = range( 0, 12 ).map( ( _ ) => new SelectionObject() );

    const hideSelections = () => {
        for ( const selectionObject of objects ) {
            selectionObject.visible = false;
        }
    };

    function update(
        sprites: SpriteEntities,
        completedUpgrades: number[][],
        selectedUnits: Unit[]
    ) {
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
