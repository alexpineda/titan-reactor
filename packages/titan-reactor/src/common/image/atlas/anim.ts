// import { UnitTileScale } from "../../../renderer/core";
// import { CompressedTexture } from "three";

// import { ImageDAT } from "../../bwdat/core/images-dat";
// import { AnimDds, AnimSprite, GrpFrameType, GRPInterface } from "../../types";
// import { parseAnim, createDDSTexture } from "../formats";

// class Anim implements GRPInterface {
//     unitTileScale: UnitTileScale = UnitTileScale.HD;
//     textureWidth = 0;
//     textureHeight = 0;
//     spriteWidth = 0;
//     spriteHeight = 0;
//     imageIndex = -1;
//     frames: GrpFrameType[] = [];
//     diffuse?: CompressedTexture;
//     teamcolor?: CompressedTexture;

//     dispose() {
//         this.diffuse && this.diffuse.dispose();
//         this.teamcolor && this.teamcolor.dispose();
//     }
// }