import { headersById, iscriptHeaders as headers } from "../bwdat/enums/iscriptHeaders";

export const createIScriptRunnerFactory = (bwDat, tileset) => {
  return (...args) => new IScriptRunner(bwDat, tileset, ...args);
};

export class IScriptRunner {
  constructor(bwDat, tileset, image, imageDesc, state = {}) {
    this.bwDat = bwDat;
    this.image = image;
    this.imageDesc = imageDesc;
    this.tileset = tileset;
    this.logger = { log: () => {} };
    this.dispatched = [];
    this.iscript = bwDat.iscript.iscripts[imageDesc.iscript];
    this.alreadyRun = {};
    this.commands = [];
    this.firstHeader = null;
    this.enabled = false;

    this.dbg = {};

    this.image.userData = {
      waiting: 0,
      terminated: false,
      lifted: false,
      noBrkCode: false,
      ignoreRest: false,
      frameset: 0,
      frame: 0,
      frameOffset: 0,
      prevFrame: -1,
      //@todo refactor to exclude flip
      flip: false,
      prevFlip: null,
      //forced flip frame
      flipState: false,
      direction: 0,
      offset: {
        x: 0,
        y: 0,
      },
      ...state,
    };

    if (this.imageDesc.gfxTurns) {
      this.image.userData.frameset = 0;
    }
  }

  get state() {
    return this.image.userData;
  }

  run(header) {
    if (
      !this.imageDesc.useFullIscript &&
      header !== headers.init &&
      header !== headers.death
    ) {
      return;
    }

    this.dbg.prevAnimBlock = {
      commands: this.commands,
      commandIndex: this.commandIndex,
    };
    return this._toAnimationBlock(this.iscript.offsets[header], header);
  }

  _toAnimationBlock(offset, header = -1) {
    const commands = this.bwDat.iscript.animationBlocks[offset];
    if (!commands) {
      let name = "local";
      if (header >= 0) {
        name = headersById[header];
      }
      console.error(`animation block - ${name} - does not exist`, this);
      this.image.userData.ignoreRest = true;
      return;
    }

    if (this.firstHeader === null) {
      this.firstHeader = header;
    }
    this.alreadyRun[header] = true;
    this.commands = commands;
    this.commands.header = header;
    this.commandIndex = 0;
    Object.assign(this.image.userData, {
      waiting: 0,
      ignoreRest: false,
    });

    if (header === headers.liftOff) {
      this.state.lifted = true;
    } else if (header === headers.landing) {
      this.state.lifted = false;
    }

    let prevAnim = "";

    if (this.dbg && this.dbg.prevAnimBlock && this.dbg.prevAnimBlock.commands) {
      if (this.dbg.prevAnimBlock.commands.header === -1) {
        prevAnim = "local";
      } else {
        prevAnim = headersById[this.dbg.prevAnimBlock.commands.header];
      }
    }

    if (header === -1) {
      this.logger.log(`📝 local <- ${prevAnim}`, this);
    } else {
      this.logger.log(`📝 ${headersById[header]} <- ${prevAnim}`, this);
    }

    return this;
  }

  update() {
    this.dispatched.length = 0;

    // update iscript state
    if (this.state.waiting !== 0) {
      this.state.waiting = this.state.waiting - 1;
      return this.dispatched;
    }
    this.next();
    return this.dispatched;
  }

  _dispatch(command, event) {
    this.logger.log(`🧩 ${command}`, event);
    this.dispatched.push([command, event]);
    return true;
  }

  setFrame(frame, flip) {
    this.state.prevFrame = this.state.frame;
    this.state.prevFlip = this.state.flip;
    this.state.flip = flip;
    this.state.frame = this.state.frameset + frame;
    this.state.frameOffset = frame;
  }

  setDirection(direction) {
    if (this.state.flDirect) {
      return;
    }
    if (direction > 31 || direction < 0) {
      throw new Error("direction out of bounds");
    }
    this.state.direction = direction;
    if (this.imageDesc.gfxTurns) {
      this.setFrameBasedOnDirection();
    }
  }

  setFrameBasedOnDirection() {
    if (this.state.direction > 16) {
      this.setFrame(32 - this.state.direction, true);
    } else {
      this.setFrame(this.state.direction, false);
    }
  }

  next() {
    if (this.state.ignoreRest) {
      return true;
    }
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.commandIndex >= this.commands.length) {
        let nextHeader = this.commands.header;
        let nextAnimationBlock;
        do {
          nextHeader = nextHeader + 1;
          nextAnimationBlock = this.run(nextHeader);
        } while (
          !nextAnimationBlock &&
          nextHeader < this.iscript.offsets.length
        );

        if (!nextAnimationBlock) {
          throw new Error("ran out of animation blocks");
        }
      }

      const [command, args] = this.commands[this.commandIndex];
      this.commandIndex++;

      switch (command) {
        case "sproluselo":
        case "imgul":
        case "imgol":
        case "useweapon":
        case "gotorepeatattk":
        case "attackwith":
        case "attack":
        case "domissiledmg":
        case "dogrddamage":
        case "setvertpos":
        case "sethorpos":
        case "setpos":
        case "imgolorig":
        case "imgoluselo":
        case "imguluselo":
        case "imgulnextid":
        case "sprol":
        case "sprul":
        case "lowsprul":
        case "highsprol":
        case "spruluselo":
        case "castspell":
        case "attkshiftproj":
        case "creategasoverlays":
        case "trgtrangecondjmp":
        case "trgtarccondjmp":
        case "grdsprol":
        case "warpoverlay":
        case "curdirectcondjmp":
        case "tmprmgraphicstart":
        case "tmprmgraphicend":
          {
            this._dispatch(command, args);
          }
          break;
        case "waitrand":
          {
            this.state.waiting = args[Math.floor(Math.random() * args.length)];
            this._dispatch(command, this.state.waiting);
          }
          return;
        case "wait":
          {
            this.state.waiting = args[0];
            this._dispatch(command, this.state.waiting);
          }
          return;
        case "ignorerest":
          {
            this.state.ignoreRest = true;
            this._dispatch(command);
          }
          return;

        case "nobrkcodestart":
          {
            this.state.noBrkCode = true;
            this._dispatch(command);
          }
          break;

        case "nobrkcodeend":
          {
            this.state.noBrkCode = false;
            this._dispatch(command);
          }
          break;

        case "playfram":
          {
            if (this.imageDesc.gfxTurns && args[0] % 17 === 0) {
              this.state.frameset = args[0];
              this.setFrameBasedOnDirection();
              if (this.state.frame < 0) {
                throw new Error("frame < 0");
              }
              this._dispatch(command, [this.state.frame, this.state.flip]);
            } else {
              //@todo see if this matters
              this.state.frameset = 0;
              this.setFrame(args[0], this.state.flipState);
              this._dispatch(command, [args[0], this.state.flipState]);
            }
          }
          break;
        case "playframtile":
          {
            this.state.frameset = 0;
            this.setFrame(args[0] + this.tileset, false);
            this._dispatch(command, args[0] + this.tileset);
          }
          break;

        case "engframe":
          {
            this.state.frameset = args[0];
            this.state.direction =
              this.image.sprite.mainImage.userData.direction;
            this.setFrameBasedOnDirection();
            this._dispatch(command, [this.state.frame, this.state.flip]);
          }
          break;

        case "engset":
          {
            this.state.frameset =
              this.image.sprite.mainImage.userData.frameset +
              args[0] * this.image.sprite.mainImage.frames.length;
            this.state.direction =
              this.image.sprite.mainImage.userData.direction;
            this.setFrameBasedOnDirection();
            this._dispatch(command, [this.state.frame, this.state.flip]);
          }
          break;

        case "setflipstate":
          {
            this.state.flipState = args[0];
            this._dispatch(command, args);
          }
          break;

        case "setfldirect":
          {
            this.state.flDirect = true;
            this.state.direction = args[0];
            if (this.state.direction < 0 || this.state.direction > 31) {
              throw new Error("direction out of bounds");
            }
            this.setFrameBasedOnDirection();
            this._dispatch(command, args);
          }
          break;

        case "turnrand":
        case "turncwise":
        case "turnccwise":
          {
            let clockwise = command === "turncwise";
            if (command === "turnrand") {
              clockwise = Math.random() > 0.7 ? true : false;
            }

            if (clockwise) {
              if ((this.state.direction + args[0]) % 32 > 31) {
                throw new Error("direction out of bounds");
              }
              this.state.direction = (this.state.direction += args[0]) % 32;
              this._dispatch(command, args);
            } else {
              this.state.direction = this.state.direction - args[0];
              if (this.state.direction < 0) {
                this.state.direction = 32 - this.state.direction;
              }
              this._dispatch(command, args);
            }
          }
          break;

        case "turn1cwise":
          {
            //			if (iscript_unit && !iscript_unit->order_target.unit)
            this.state.direction = (this.state.direction += 1) % 32;
            this._dispatch(command, args);
          }
          break;
        case "followmaingraphic":
          //carrier, warpflash
          /*
    if (image_t *main_image = image->sprite->main_image)
					{
						auto frame_index = main_image->frame_index;
						bool flipped = i_flag(main_image, image_t::flag_horizontally_flipped);
						if (image->frame_index != frame_index || i_flag(image, image_t::flag_horizontally_flipped) != flipped)
						{
							image->frame_index_base = main_image->frame_index_base;
							set_image_frame_index_offset(image, main_image->frame_index_offset, flipped);
						}
          }
          */

          this._dispatch(command);
          break;

        // melee only needs 1 level of call stack for broodling
        // should we move commands, commandIndex into state and just create a proper stack?
        case "call":
          {
            this.callStack = {
              commands: this.commands,
              commandIndex: this.commandIndex,
            };
            this.commandIndex = 0;
            this.commands = this.bwDat.iscript.animationBlocks[args[0]];
            this._dispatch(command, args);
          }
          return;

        case "return":
          {
            this.commands = this.callStack.commands;
            this.commandIndex = this.callStack.commandIndex;
            delete this.callStack;
            this._dispatch(command);
          }
          return;

        case "randcondjmp":
          {
            if (Math.random() <= args[0] / 255) {
              this._toAnimationBlock(args[1]);
              this._dispatch(command, true);
            } else {
              this._dispatch(command, false);
            }
          }
          break;
        case "goto":
          {
            this._toAnimationBlock(args[0]);
            this._dispatch(command, args);
          }
          break;

        case "playsndrand":
          {
            const [soundCount, ...sounds] = args;
            const soundId = sounds[Math.floor(Math.random() * soundCount)];
            this._dispatch(command, soundId);
          }
          break;
        case "playsndbtwn":
          {
            const soundId =
              Math.floor(Math.random() * (args[1] - args[0] + 1)) + args[0];
            this._dispatch(command, soundId);
          }
          break;
        case "playsnd":
          {
            this._dispatch(command, args[0]);
          }
          break;
        case "attackmelee":
          {
            const [soundCount, ...sounds] = args;
            const soundId = sounds[Math.floor(Math.random() * soundCount)];
            this._dispatch(command, soundId);
          }
          break;
        case "liftoffcondjmp":
          {
            if (this.state.lifted) {
              this._toAnimationBlock(args[0]);
              this._dispatch(command, args[0]);
            } else {
              this._dispatch(command, false);
            }
          }
          break;

        case "end": {
          this.state.terminated = true;
          this._dispatch(command);
          return;
        }
        //won't do
        case "switchul":
        case "setflspeed":
        case "move":
        case "pwrupcondjmp":
        case "sigorder":
        case "orderdone":
        case "setspawnframe":
        case "uflunstable":
        case "__0c":
        case "__2d":
        case "__3e":
        case "__43":
          this.logger.log(command, "not implemented");
          break;
        default:
          throw new Error(`${command} not found in IScriptRunner`);
      }
    }
  }
}
