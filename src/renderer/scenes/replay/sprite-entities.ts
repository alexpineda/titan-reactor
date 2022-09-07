import { Unit } from "@core/unit";
import { SparseList } from "@utils/sparse-list";
import { OpenBW, SpriteType } from "common/types";
import { Group } from "three";

export class SpriteEntities {
    group = new Group();
    #openBW: OpenBW;

    #spritesMap: Map<number, SpriteType> = new Map();
    #spritePool: SpriteType[] = [];

    // duplicate access
    #unitsBySprite: Map<number, Unit> = new Map();
    #spritesList = new SparseList<SpriteType>();
    // child spriteIndex -> parent spriteIndex
    #linkedSprites = new Map<number, number>();

    constructor(openBw: OpenBW) {
        this.#openBW = openBw;
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
            this.#linkedSprites.delete(spriteIndex);
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
            this.#resetSpriteUserData(sprite);
        }
        this.#linkedSprites.delete(spriteIndex);
        this.#unitsBySprite.delete(spriteIndex);
    }

    #resetSpriteUserData(sprite: SpriteType) {
        sprite.userData.typeId = -1;
        sprite.userData.renderOrder = 0
    }

    clear() {
        for (const sprite of this.#spritesMap.values()) {
            this.#resetSpriteUserData(sprite);
            this.#spritePool.push(sprite);
        }
        this.#spritesMap.clear();
        this.#unitsBySprite.clear();
        this.#spritesList.clear();
        this.#linkedSprites.clear();
        // we do not clear this.group as we do that before first frame to avoid flickering
    }

    getUnit(spriteIndex: number) {
        return this.#unitsBySprite.get(spriteIndex);
    }

    setUnit(spriteIndex: number, unit: Unit) {
        this.#unitsBySprite.set(spriteIndex, unit);
    }

    getParent(spriteIndex: number) {
        const parentIndex = this.#linkedSprites.get(spriteIndex);
        if (parentIndex !== undefined) {
            return this.get(parentIndex);
        }
    }

    updateLinkedSprites() {
        // linked sprites are a psuedo link of sprites the create their own sprites in the iscript
        // eg. sprol, which openbw then calls create_thingy_at_image
        // the reason we need to track this link is because some bullets create trails
        // titan-reactor.h only sends us sprites of halo rocket trail and long bolt/gemini missile trail
        const linkedSpritesAddr = this.#openBW.getLinkedSpritesAddress();
        for (let i = 0; i < this.#openBW.getLinkedSpritesCount(); i++) {
            const addr = (linkedSpritesAddr >> 2) + (i << 1);
            this.#linkedSprites.set(this.#openBW.HEAP32[addr + 1], this.#openBW.HEAP32[addr]);
        }
    }
}