import { SpriteFlags } from "../../common/enums";
import { SpriteStruct } from "../integration/structs";

export const spriteSortOrder = (sprite: SpriteStruct) => {
    let score = 0;
    score |= sprite.elevation;
    score <<= 13;
    score |= sprite.elevation <= 4 ? sprite.y : 0;
    score <<= 1;
    score |= sprite.flags & SpriteFlags.Turret ? 1 : 0;
    return score;
}

export const spriteIsHidden = (sprite: SpriteStruct) => {
    return (sprite.flags & SpriteFlags.Hidden) !== 0;
}