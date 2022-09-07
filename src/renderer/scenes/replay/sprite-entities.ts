import { Unit } from "@core/unit";
import { SparseList } from "@utils/sparse-list";
import { SpriteType } from "common/types";
import { Group } from "three";

export class SpriteEntities {
    group = new Group();

    #spritesMap: Map<number, SpriteType> = new Map();
    #spritePool: Group[] = [];

    // duplicate access
    #unitsBySprite: Map<number, Unit> = new Map();
    #spritesList = new SparseList<SpriteType>();

    constructor() {
        this.group.name = "sprites";
    }

    get(spriteIndex: number) {
        return this.#spritesMap.get(spriteIndex);
    }

    getOrCreate(spriteIndex: number, spriteTypeId: number) {
        let sprite = this.#spritesMap.get(spriteIndex);
        if (!sprite) {
            if (this.#spritePool.length) {
                sprite = this.#spritePool.pop() as SpriteType;
            } else {
                sprite = new Group() as SpriteType;
                sprite.name = "sprite";
            }
            this.#spritesMap.set(spriteIndex, sprite);
            this.group.add(sprite);
            this.#spritesList.add(sprite);
            sprite.matrixAutoUpdate = false;

        }

        // openbw recycled the id for the sprite, so we reset some things
        if (sprite.userData.typeId !== spriteTypeId) {
            delete sprite.userData.fixedY;
        }
        sprite.userData.typeId = spriteTypeId;

        return sprite;
    }

    free(spriteIndex: number) {
        const sprite = this.#spritesMap.get(spriteIndex);
        if (sprite) {
            sprite.removeFromParent();
            this.#spritePool.push(sprite);
            this.#spritesMap.delete(spriteIndex);
            this.#spritesList.delete(sprite);

            // reset userData
            delete sprite.userData.fixedY;
            sprite.userData.typeId = -1;
            sprite.userData.renderOrder = 0
        }
        this.#unitsBySprite.delete(spriteIndex);
    }

    clear() {
        this.#spritesMap.clear();
        this.#unitsBySprite.clear();
        this.#spritesList.clear();
    }

    getUnit(spriteIndex: number) {
        return this.#unitsBySprite.get(spriteIndex);
    }

    setUnit(spriteIndex: number, unit: Unit) {
        this.#unitsBySprite.set(spriteIndex, unit);
    }

    get iterator() {
        return this.#spritesList;
    }
}