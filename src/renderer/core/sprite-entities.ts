import { Unit } from "@core/unit";
import { IterableMap } from "@utils/data-structures/iteratible-map";
import { SpriteType } from "common/types";
import { Group } from "three";

export class SpriteEntities {
    group = new Group();

    #spritesMap = new IterableMap<number, SpriteType>();
    #spritePool: SpriteType[] = [];

    #unitsBySprite = new Map<number, Unit>();

    constructor() {
        this.group.name = "sprites";
        this.group.matrixAutoUpdate = false;
        // @ts-expect-error
        this.group.matrixWorldAutoUpdate = false;
    }

    get isEmpty() {
        return this.#spritesMap.length === 0;
    }

    [Symbol.iterator]() {
        return this.#spritesMap[Symbol.iterator]();
    }

    get( spriteIndex: number ) {
        return this.#spritesMap.get( spriteIndex );
    }

    getOrCreate( spriteIndex: number, spriteTypeId: number ) {
        let sprite = this.#spritesMap.get( spriteIndex );
        if ( !sprite ) {
            if ( this.#spritePool.length ) {
                sprite = this.#spritePool.pop()!;
            } else {
                sprite = new Group() as SpriteType;
                sprite.name = "sprite";
            }
            this.#spritesMap.set( spriteIndex, sprite );
            this.group.add( sprite );
            sprite.matrixAutoUpdate = false;
            // @ts-expect-error
            sprite.matrixWorldAutoUpdate = false;
            sprite.userData.isNew = true;
        }

        // if (sprite.userData.typeId !== spriteTypeId) {
        // }
        sprite.userData.typeId = spriteTypeId;

        return sprite;
    }

    free( spriteIndex: number ) {
        const sprite = this.#spritesMap.get( spriteIndex );
        if ( sprite ) {
            sprite.removeFromParent();
            this.#spritePool.push( sprite );
            this.#spritesMap.delete( spriteIndex );
            this.#resetSpriteUserData( sprite );
        }
        this.#unitsBySprite.delete( spriteIndex );
    }

    #resetSpriteUserData( sprite: SpriteType ) {
        sprite.userData.typeId = -1;
    }

    clear() {
        for ( const sprite of this.#spritesMap ) {
            this.#resetSpriteUserData( sprite );
            this.#spritePool.push( sprite );
        }
        this.#spritesMap.clear();
        this.#unitsBySprite.clear();
        // we do not clear this.group as we do that before first frame to avoid flickering
    }

    getUnit( spriteIndex: number ): Unit | undefined {
        return this.#unitsBySprite.get( spriteIndex );
    }

    setUnit( spriteIndex: number, unit: Unit ) {
        this.#unitsBySprite.set( spriteIndex, unit );
    }
}
