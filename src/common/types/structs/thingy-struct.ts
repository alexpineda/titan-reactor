import type { SpritesBufferView } from "../../../renderer/buffer-view";

export interface ThingyStruct {
    hp: number;
    /**
     * @internal
     */
    owSprite: SpritesBufferView;
    spriteIndex: number;
}
