import { is, pick } from "ramda";
import { Group } from "three";
import { iscriptHeaders } from "titan-reactor-shared/types/iscriptHeaders";
import { imageTypes } from "titan-reactor-shared/types/imageTypes";
import {
  overlayTypesById,
  overlayTypes,
} from "titan-reactor-shared/types/overlayTypes";
import { drawFunctions } from "titan-reactor-shared/types/drawFunctions";

const ImageOrder = {
  bottom: "bottom",
  top: "top",
  above: "above",
  below: "below",
};

export default class TitanSprite extends Group {
  constructor(unit, bwDat, createTitanImage, createTitanSpriteCb) {
    super();
    this.unit = unit;
    this.bwDat = bwDat;
    this.images = [];
    this.createTitanSpriteCb = createTitanSpriteCb;
    this.createTitanImage = createTitanImage;
    this.userData.elevation = 0;
    this.userData.direction = null;
    this.iscriptOptions = {
      createBullets: false,
      moveUnit: false,
    };
  }

  addImage(image, imageOrder, rel) {
    if (!is(Number, image)) {
      throw new Error("image must be Number");
    }
    const relImage =
      rel === undefined ? this.images.indexOf(this.mainImage) : rel;
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
          pos = this.images.length - 1;
        }
        break;
    }

    const titanImage = this.createTitanImage(image, this);
    if (!titanImage) {
      return null;
    }
    if (titanImage.imageDef.drawFunction === drawFunctions.rleShadow) {
      return null;
    }
    this.add(titanImage);
    titanImage.iscript.run(iscriptHeaders.init);
    if (this.images.length === 0) {
      this.mainImage = titanImage;
      this.images.push(titanImage);
    } else {
      this.images.splice(pos, 0, titanImage);
    }
    this._update(titanImage);
    return titanImage;
  }

  //it might be that we dont want to change frame if sprite is not on a frameset
  setDirection(direction) {
    this.userData.direction = direction;
    for (let image of this.images) {
      image.iscript.setDirection(direction);
      image.setFrame(
        image.userData.frame,
        image.userData.flip,
        image.userData.framesetIndex
      );
    }
  }

  //iscript_execute_sprite
  update(delta) {
    for (let image of this.images) {
      if (image.mixer) {
        image.mixer.update(0); //3d animation mixer
      }
      this._update(image);
      if (image.userData.terminated) {
        this.remove(image);
      }
    }

    this.images = this.images.filter((image) => !image.userData.terminated);
    // if (this.images.length === 0) {
    //   this.destroyTitanSpriteCb(this);
    // }
    return this.images.length;
  }

  _update(image) {
    //image modifier == 2 || 5 update cloak
    // 4o r 7 -> decloak
    //17 ? warpin
    //destroyed? iscript exec returns false
    //if destroyed main image, set main image to front most image
    //if no more images terminate this sprite

    const dispatched = image.iscript.update(image);
    for (let [key, val] of dispatched) {
      switch (key) {
        case "playfram":
          {
            image.setFrame(val[0], val[1], val[2]);
          }
          break;
        case "imgol":
          {
            const [imageId, x, y] = val;

            const titanImage = this.addImage(imageId, ImageOrder.above);
            if (!titanImage) break;
            titanImage.setPosition(x, y);
          }
          break;
        case "imgul":
          {
            const [imageId, x, y] = val;

            const titanImage = this.addImage(imageId, ImageOrder.below);
            if (!titanImage) break;
            titanImage.setPosition(x, -y);
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
            const [imageId] = val;
            //get_image_lo_offset(image->sprite->main_image, 2, 0)
            const titanImage = this.addImage(imageId, ImageOrder.above);
            const [ox, oy] = this._getImageLoOffset(
              this.mainImage,
              overlayTypes.specialOverlay,
              0
            );
            titanImage.setPosition(ox, oy, 32);
          }
          break;
        case "imgoluselo":
          {
            const [imageId, x, y] = val;

            const titanImage = this.addImage(imageId, ImageOrder.above);
            if (!titanImage) break;
            const ox = titanImage.image.los[x];
            const oy = titanImage.image.los[y];
            titanImage.setPosition(ox, oy);
          }
          break;
        case "imguluselo":
          {
            const [imageId, x, y] = val;

            const titanImage = this.addImage(imageId, ImageOrder.below);
            if (!titanImage) break;
            const ox = titanImage.image.los[x];
            const oy = titanImage.image.los[y];
            titanImage.setPosition(ox, oy);
          }
          break;
        case "imgulnextid":
          {
            const [x, y] = val;
            const titanImage = this.addImage(
              image.imageDef.index + 1,
              ImageOrder.below
            );
            if (!titanImage) break;
            titanImage.setPosition(x, y);
          }
          break;

        case "sprol":
          {
            //<sprite#> <x> <y> - spawns a sprite one animation level above the current image overlay at a specific offset position.
            //if is bullet && parent->goliath && charonboosted
            ///create hailo rocket
            //else
            //create sprite val
            // sprites.push([...val, this.userData.elevation + 1]);
          }
          break;
        case "sprul":
          {
            //<sprite#> <x> <y> - spawns a sprite one animation level below the current image overlay at a specific offset position. The new sprite inherits the direction of the current sprite.
            /*
            if (iscript_unit && (u_requires_detector(iscript_unit) || u_cloaked(iscript_unit)) && !sprite->image->always_visible)
              break;
              */
            //set direction
            // sprites.push([...val, this.userData.elevation - 1]);
          }
          break;
        case "lowsprul":
          {
            //@todo check if we set direction
            //<sprite#> <x> <y> - spawns a sprite at the lowest animation level at a specific offset position.
            // sprites.push([...val, 1]);
            const [spriteId, x, y] = val;

            //@todo elevation 1
            const titanSprite = new TitanSprite(
              null,
              this.bwDat,
              this.createTitanImage,
              this.createTitanSpriteCb
            );
            titanSprite.addImage(this.bwDat.sprites[spriteId].image.index);

            //titanSprite.setDirection(this.userData.direction);
            titanSprite.mainImage.setPosition(x, y);
            console.log("lowsprul", [x, y]);
          }
          break;
        case "highsprol":
          {
            //<sprite#> <x> <y> - spawns a sprite at the highest animation level at a specific offset position.
          }
          break;
        case "sproluselo":
          {
            const [spriteId, overlay] = val;
            // <sprite#> <overlay#> - spawns a sprite one animation level above the current image overlay, using a specified LO* file for the offset position information. The new sprite inherits the direction of the current sprite.

            //@todo this.userData.elevation + 1
            const titanSprite = new TitanSprite(
              null,
              this.bwDat,
              this.createTitanImage,
              this.createTitanSpriteCb
            );
            titanSprite.addImage(this.bwDat.sprites[spriteId].image.index);

            titanSprite.setDirection(this.userData.direction);
            const [ox, oy] = this._getImageLoOffset(image, overlay, 0);

            titanSprite.mainImage.setPosition(ox, oy);
            console.log("sproluselo", [ox, oy, image.userData.frame]);
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
            const [x] = val;
            image.setPositionX(x);
          }
          break;
        case "setvertpos":
          {
            const [y] = val;

            //mostly for flyer hover effect

            // if (!iscript_unit || (!u_requires_detector(iscript_unit) && !u_cloaked(iscript_unit)))
            //
            image.setPositionY(y);
          }
          break;
        case "creategasoverlays":
          {
            const imageOffset = val[0];
            const imageId = true
              ? // const imageId = this.unit.resources
                imageTypes.gasOverlay
              : imageTypes.depletedGasOverlay;

            const titanImage = this.addImage(
              imageId + imageOffset,
              ImageOrder.above
            );

            const los = this.bwDat.los[image.imageDef.specialOverlay - 1];
            const [ox, oy] = los[titanImage.userData.frame][imageOffset];

            console.log(
              "geyser",
              this._getImageLoOffset(image, 2, imageOffset),
              [ox, oy]
            );

            titanImage.setPosition(ox, oy);
          }
          break;
        case "setpos":
          {
            const [x, y] = val;

            image.setPosition(x, y);
          }
          break;

        case "end":
          {
            //@todo allow_main_image_destruction
            image.userData.terminated = true;
          }
          break;
        case "followmaingraphic":
          {
            if (this.mainImage) {
              Object.assign(
                image.userData,
                pick(["frameset", "frame", "flip"], this.mainImage.userData)
              );
              image.setFrame(
                image.userData.frame,
                image.userData.flip,
                image.userData.framesetIndex
              );
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
            //engframe - <frame#> - plays a particular frame, often used in engine glow animations.
            /*
image->frame_index_base = a;
					set_image_frame_index_offset(image, image->sprite->main_image->frame_index_offset, i_flag(image->sprite->main_image, image_t::flag_horizontally_flipped));
    */
          }
          break;
        case "engset":
          {
            //engset - <frameset#> - plays a particular frame set, often used in engine glow animations.
            /*
					image->frame_index_base = image->sprite->main_image->frame_index_base + (image->sprite->main_image->grp->frames.size() & 0x7fff) * a;
					set_image_frame_index_offset(image, image->sprite->main_image->frame_index_offset, i_flag(image->sprite->main_image, image_t::flag_horizontally_flipped));
    */
          }
          break;
        case "tmprmgraphicstart":
          {
            image.visible = false;
          }
          break;
        case "tmprmgraphicend":
          {
            image.visible = true;
          }
          break;
        default:
          break;
      }
    }
  }

  _getImageLoOffset(image, overlay, imageOffset, useFrameset = false) {
    const frame = useFrameset ? image.userData.frameset : image.userData.frame;

    const los = this.bwDat.los[image.imageDef[overlayTypesById[overlay]] - 1];
    if (!los || los.length == 0) {
      throw new Error("no los here");
    }
    const [x, y] = los[frame][imageOffset];

    if (image.userData.flip) {
      return [-x, y];
    } else {
      return [x, y];
    }
  }

  run(header) {
    for (let image of this.images) {
      image.iscript.run(header);
    }
  }

  dispose() {}
}
