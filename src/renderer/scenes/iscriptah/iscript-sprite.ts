import { Group } from "three";

import {
  drawFunctions,
  imageTypes,
  iscriptHeaders,
  overlayTypes,
} from "common/enums";
import { BwDAT, ImageDAT, UnitDAT } from "common/types";
import pick from "common/utils/pick";
import { ImageBase } from "@core";
import { IScriptRunner } from "./iscript-runner";
import { IScriptState } from "./iscript-state";

enum ImageOrder {
  bottom,
  top,
  above,
  below,
}

type IScriptImage = {
  image: ImageBase;
  state: IScriptState;
  sprite: IScriptSprite;
  setFrame: (frame: number, flip: boolean) => void;
}

/**
 * A sprite group. It is a group of images each with their own iscript execution.
 */
export class IScriptSprite extends Group {
  private bwDat: BwDAT;
  iscriptImages: IScriptImage[] = [];
  mainImage?: IScriptImage;
  lastZOff: number;
  unit: any | null;
  createSprite: (unit: UnitDAT | null | undefined) => IScriptSprite;
  createSpriteCb: (titanSprite: IScriptSprite) => void;
  destroyTitanSpriteCb: (titanSprite: IScriptSprite) => void;
  createTitanImage: (
    image: number
  ) => ImageBase
  runner: IScriptRunner;

  iscriptOptions: {
    createBullets: boolean;
    moveUnit: boolean;
  };

  constructor(
    unit: any = null,
    bwDat: BwDAT,
    createTitanSprite: (unit: UnitDAT | null | undefined) => IScriptSprite,
    createTitanImage: (
      image: number
    ) => ImageBase,
    runner: IScriptRunner,
    createTitanSpriteCb: (titanSprite: IScriptSprite) => void,
    destroyTitanSpriteCb: (titanSprite: IScriptSprite) => void = () => { },
  ) {
    super();
    this.unit = unit;
    this.bwDat = bwDat;
    this.createSprite = createTitanSprite;
    this.createSpriteCb = createTitanSpriteCb;
    this.destroyTitanSpriteCb = destroyTitanSpriteCb;
    this.createTitanImage = createTitanImage;
    this.runner = runner;
    this.iscriptOptions = {
      createBullets: false,
      moveUnit: false,
    };
    this.renderOrder = 4;
    this.lastZOff = 0;
  }

  spawnIScriptImage(imageIndex: number, imageOrder?: ImageOrder, rel?: number): any {
    const relImage =
      rel === undefined
        ? this.iscriptImages.indexOf(this.mainImage!)
        : rel;
    let pos = relImage;

    switch (imageOrder) {
      case ImageOrder.below:
        {
          pos = relImage - 1;
        }
        break;
      case ImageOrder.bottom:
        {
          pos = 0;
        }
        break;
      case ImageOrder.top:
        {
          pos = this.iscriptImages.length - 1;
        }
        break;
    }

    const image = this.createTitanImage(imageIndex);
    if (!image) {
      return null;
    }
    if (image.dat.drawFunction === drawFunctions.rleShadow) {
      return null;
    }
    this.add(image);

    const state = new IScriptState(this.bwDat.iscript.iscripts[image.dat.iscript], image.dat);
    const iscriptImage = { image, state, sprite: this, setFrame: () => { } };

    this.runner.run(iscriptHeaders.init, state)

    if (this.iscriptImages.length === 0) {
      this.mainImage = iscriptImage;
      this.iscriptImages.push(iscriptImage);
    } else {
      this.iscriptImages.splice(pos, 0, iscriptImage);
    }
    this._update(iscriptImage);
    return iscriptImage;
  }

  //it might be that we dont want to change frame if sprite is not on a frameset
  setDirection(direction: number) {
    if (direction === this.direction || !this.mainImage) return;

    this.runner.setDirection(direction, this.mainImage.state);
    this.runner.setFrame(this.mainImage.state.frame, this.mainImage.state.flip, this.mainImage.state);
  }

  //iscript_execute_sprite
  update(delta: number, cameraDirection: number) { //
    if (this.unit) {
      this.position.copy(this.unit.position);
      this.rotation.copy(this.unit.rotation);
      this.setDirection((this.unit.direction + cameraDirection) % 32);
      this.visible = this.unit.visible;

      if (
        this.unit.current.anim !== this.unit.previous.anim &&
        iscriptHeaders[this.unit.current.anim]
      ) {
        this.run(this.unit.current.anim);
      }
    }

    delta;

    let _terminated = false;
    for (const iscriptImage of this.iscriptImages) {
      // if (iscriptImage.image instanceof Image3D && iscriptImage.image.mixer) {
      //   iscriptImage.image.mixer.update(0); //3d animation mixer
      // }
      this._update(iscriptImage);
      if (iscriptImage.state.terminated) {
        _terminated = true;
        this.remove(iscriptImage.image);
      }
    }

    if (_terminated) {
      this.iscriptImages = this.iscriptImages.filter((image) => !image.state.terminated);
      if (!this.iscriptImages.find((i) => i === this.mainImage)) {
        this.mainImage = this.iscriptImages[this.iscriptImages.length - 1];
      }
      if (this.iscriptImages.length === 0) {
        this.destroyTitanSpriteCb(this);
      }
    }

    const nextZOff = this.mainImage
      ? (this.mainImage?.image._zOff * this.mainImage?.image.unitTileScale) / 32
      : 0;
    this.position.z = this.position.z - this.lastZOff + nextZOff;
    this.lastZOff = nextZOff;

    return this.iscriptImages.length;
  }

  _update(iscriptImage: IScriptImage) {
    //image modifier == 2 || 5 update cloak
    // 4o r 7 -> decloak
    //17 ? warpin
    //destroyed? iscript exec returns false
    //if destroyed main image, set main image to front most image
    //if no more images terminate this sprite

    const dispatched = this.runner.update(iscriptImage.state);
    //@ts-ignore
    for (const [key, val] of dispatched) {
      switch (key) {
        case "playfram":
          {
            iscriptImage.image.setFrame(val[0], val[1]);
          }
          break;
        case "imgol":
          {
            //@ts-ignore
            const [imageId, x, y] = val;

            const image = this.spawnIScriptImage(imageId, ImageOrder.above);
            if (!image) break;
            image.image.position.set(x, y, 0);
          }
          break;
        case "imgul":
          {
            //@ts-ignore
            const [imageId, x, y] = val;

            const spawnedImage = this.spawnIScriptImage(imageId, ImageOrder.below);
            if (!spawnedImage) break;
            spawnedImage.image.position.set(x, -y, 0);
          }
          break;
        case "imgolorig":
          {
            /* 
            if (!i_flag(new_image, image_t::flag_uses_special_offset))
            {
              i_set_flag(new_image, image_t::flag_uses_special_offset);
              update_image_special_offset(new_image);
            }
            */
            //@ts-ignore
            const [imageId] = val;
            //get_image_lo_offset(image->sprite->main_image, 2, 0)
            const image = this.spawnIScriptImage(imageId, ImageOrder.above);
            if (!image) break;
            const [ox, oy] = this._getImageLoOffset(
              this.mainImage!,
              overlayTypes.specialOverlay,
              0
            );
            image.image.position.set(ox, oy, 32);
          }
          break;
        case "imgoluselo":
          {
            //@ts-ignore
            const [imageId, x, y] = val;

            const image = this.spawnIScriptImage(imageId, ImageOrder.above);
            if (!image) break;
            //@ts-ignore
            const ox = image.state.los[x];
            //@ts-ignore
            const oy = image.image.los[y];
            image.image.position.set(ox, oy, 32);
          }
          break;
        case "imguluselo":
          {
            // const [imageId, x, y] = val;

            // const image = this.spawnIScriptImage(imageId, ImageOrder.below);
            // if (!image) break;
            // const ox = image.state.los[x];
            // const oy = image.image.los[y];
            // image.image.setPosition(ox, oy, 32);
          }
          break;
        case "imgulnextid":
          {
            //@ts-ignore
            const [x, y] = val;
            const image = this.spawnIScriptImage(
              iscriptImage.state.imageDesc.index + 1,
              ImageOrder.below
            );
            if (!image) break;
            image.image.position.set(x, y, 32);
          }
          break;

        case "sprol":
          {
            //@ts-ignore
            const [spriteId, x, y] = val;

            // FIXME:
            // if is bullet && parent->goliath && charonboosted
            // change spriteId to halo rockets trail

            const sprite = this.createSprite(null);
            sprite.spawnIScriptImage(this.bwDat.sprites[spriteId].image.index);
            sprite.run(iscriptHeaders.init);

            //FIXME: ensure main image otherwise the sprite is dead
            sprite.mainImage?.image.position.set(x, y, 0);
            sprite.position.copy(this.position);
            this.createSpriteCb(sprite);
          }
          break;
        case "sprul":
          {
            //<sprite#> <x> <y> - spawns a sprite one animation level below the current image overlay at a specific offset position. The new sprite inherits the direction of the current sprite.

            //@ts-ignore
            const [spriteId, x, y] = val;

            /* 
            FIXME:
            "if unit and is cloaked and not always visible dont spawn"
            if (iscript_unit && (u_requires_detector(iscript_unit) || u_cloaked(iscript_unit)) && !sprite->image->always_visible)
            break;
            */

            const sprite = this.createSprite(null);
            sprite.spawnIScriptImage(this.bwDat.sprites[spriteId].image.index);
            sprite.setDirection(this.direction);
            sprite.run(iscriptHeaders.init);

            sprite.mainImage?.image.position.set(x, y, 0);
            sprite.position.copy(this.position);
            this.createSpriteCb(sprite);
          }
          break;
        case "lowsprul":
          {
            //FIXME: check if we set direction
            //<sprite#> <x> <y> - spawns a sprite at the lowest animation level at a specific offset position.
            // sprites.push([...val, 1]);
            //@ts-ignore
            const [spriteId, x, y] = val;

            //FIXME: elevation 1
            const sprite = this.createSprite(null);
            sprite.spawnIScriptImage(this.bwDat.sprites[spriteId].image.index);
            sprite.run(iscriptHeaders.init);

            sprite.mainImage?.image.position.set(x, y, 0);
            sprite.position.copy(this.position);
            this.createSpriteCb(sprite);
          }
          break;
        case "highsprol":
          {
            //<sprite#> <x> <y> - spawns a sprite at the highest animation level at a specific offset position.
            //@ts-ignore
            const [spriteId, x, y] = val;

            const sprite = this.createSprite(null);
            sprite.spawnIScriptImage(this.bwDat.sprites[spriteId].image.index);
            sprite.run(iscriptHeaders.init);

            sprite.mainImage?.image.position.set(x, y, 0);
            sprite.position.copy(this.position);
            this.createSpriteCb(sprite);
          }
          break;
        case "sproluselo":
          {
            //@ts-ignore
            const [spriteId, overlay] = val;
            // <sprite#> <overlay#> - spawns a sprite one animation level above the current image overlay, using a specified LO* file for the offset position information. The new sprite inherits the direction of the current sprite.

            //FIXME: this.userData.elevation + 1
            const sprite = this.createSprite(null);
            sprite.spawnIScriptImage(this.bwDat.sprites[spriteId].image.index);
            // titanSprite.run(0);
            sprite.setDirection(this.direction);
            const [ox, oy] = this._getImageLoOffset(iscriptImage, overlay, 0);

            //@ts-ignore
            sprite.mainImage?.image.position.set(ox, oy, 0);
            sprite.run(iscriptHeaders.init);

            sprite.position.copy(this.position);
            this.createSpriteCb(sprite);
          }
          break;
        case "spruluselo":
          {
            //<sprite#> <x> <y> - spawns a sprite one animation level below the current image overlay at a specific offset position. The new sprite inherits the direction of the current sprite. Requires LO* file for unknown reason.
            /*
            if (iscript_unit && (u_requires_detector(iscript_unit) || u_cloaked(iscript_unit)) && !sprite->image->always_visible)
              break;
              */
            //set direction
            // sprites.push([...val, this.userData.elevation]);
          }
          break;
        case "sethorpos":
          {

            //@ts-ignore
            const [x] = val;
            iscriptImage.image.position.setX(x);
          }
          break;
        case "setvertpos":
          {
            //@ts-ignore
            const [y] = val;

            //mostly for flyer hover effect

            // if (!iscript_unit || (!u_requires_detector(iscript_unit) && !u_cloaked(iscript_unit)))
            //
            iscriptImage.image.position.setY(y);
          }
          break;
        case "creategasoverlays":
          {
            const imageOffset = val[0];
            const imageId = imageTypes.gasOverlay;
            //FIXME: support imageTypes.depletedGasOverlay;

            const iscriptImage = this.spawnIScriptImage(
              imageId + imageOffset,
              ImageOrder.above
            );
            if (!iscriptImage) break;

            const los = this.bwDat.los[iscriptImage.state.imageDesc.specialOverlay - 1];

            //@ts-ignore
            const [ox, oy] = los[iscriptImage.state.frame][imageOffset];

            iscriptImage.image.position.x = ox / 32;
            iscriptImage.image.position.z = oy / 32;
          }
          break;
        // case "useweapon":
        //   {
        //   }
        //   break;
        // case "attackwith":
        //   {
        //   }
        //   break;
        // case "attack":
        //   {
        //   }
        //   break;
        // case "domissiledmg":
        //   {
        //   }
        //   break;
        // case "dogrddamage":
        //   {
        //   }
        //   break;
        // case "dogrddamage":
        //   {
        //   }
        //   break;
        // case "castspell":
        //   {
        //   }
        //   break;
        // case "attkshiftproj":
        //   {
        //   }
        //   break;
        // case "trgtrangecondjmp":
        //   {
        //   }
        //   break;
        // case "trgtarccondjmp":
        //   {
        //   }
        //   break;
        // case "curdirectcondjmp":
        //   {
        //   }
        //   break;

        // case "grdsprol":
        //   {
        //   }
        //   break;
        // case "warpoverlay":
        //   {
        //   }
        //   break;

        case "setpos":
          {
            //@ts-ignore
            const [x, y] = val;

            iscriptImage.image.position.set(x, y, 0);
          }
          break;

        case "end":
          {
            //FIXME: allow_main_image_destruction
            iscriptImage.state.terminated = true;
          }
          break;
        case "followmaingraphic":
          {
            if (this.mainImage) {
              Object.assign(
                iscriptImage.state,
                pick(["frame", "flip"], this.mainImage.state)
              );
              iscriptImage.image.setFrame(iscriptImage.state.frame, iscriptImage.state.flip);
            }
          }
          break;
        case "setflipstate":
          {
            /*
            if (i_flag(image, image_t::flag_horizontally_flipped) != (a != 0))
          {
            i_set_flag(image, image_t::flag_horizontally_flipped, a != 0);
            set_image_modifier(image, image->modifier);
            if (image->flags & image_t::flag_uses_special_offset)
              update_image_special_offset(image);
          }*/
          }
          break;

        case "engframe":
          {
            iscriptImage.image.setFrame(val[0], val[1]);
            //corsair, scout, wraith
            //engframe - <frame#> - plays a particular frame, often used in engine glow animations.
          }
          break;
        case "engset":
          {
            iscriptImage.image.setFrame(val[0], val[1]);
            //arbiter, bc, scv, valk
            //engset - <frameset#> - plays a particular frame set, often used in engine glow animations.
          }
          break;
        case "tmprmgraphicstart":
          {
            iscriptImage.image.visible = false;
          }
          break;
        case "tmprmgraphicend":
          {
            iscriptImage.image.visible = true;
          }
          break;
        default:
          break;
      }
    }
  }

  _getImageLoOffset(
    iscriptImage: IScriptImage,
    overlay: number,
    imageOffset: number,
    useFrameset = false
  ) {
    const frame = useFrameset ? iscriptImage.state.frameset : iscriptImage.state.frame;

    const overlayKey = overlayTypes[overlay - 1] as keyof ImageDAT;
    const losIndex = iscriptImage.state.imageDesc[overlayKey] as number;
    const los = this.bwDat.los[losIndex];
    if (!los || los.length == 0) {
      throw new Error("no los here");
    }

    //@ts-ignore
    const [x, y] = los[frame][imageOffset];

    if (iscriptImage.state.flip) {
      return [-x, y];
    } else {
      return [x, y];
    }
  }

  run(header: number) {
    for (const image of this.iscriptImages) {
      this.runner.run(header, image.state);
    }
  }

  get direction() {
    return this.mainImage?.state.direction || 0;
  }

  dispose() { }
}
export default IScriptSprite;
