
// @ts-nocheck
import { BwDAT } from "../types";
import { iscriptHeaders as headers } from "../bwdat/enums/iscript-headers";
import { IScriptState } from "./iscript-state"

export class IScriptRunner {
  private bwDat: BwDAT;
  tileset: number;
  logger: { log: () => void };
  dispatched = [];

  constructor(
    bwDat: BwDAT,
    tileset: number,
  ) {
    this.bwDat = bwDat;
    this.tileset = tileset;
    this.logger = { log: () => { } };
  }

  run(header: number, state: IScriptState) {
    if (
      !state.imageDesc.useFullIscript &&
      header !== headers.init &&
      header !== headers.death
    ) {
      return;
    }

    state.debugStorePreviousCommands();
    return this._toAnimationBlock(state.iscript.offsets[header], header, state);
  }

  _toAnimationBlock(offset: number, header = -1, state: IScriptState) {
    const commands = this.bwDat.iscript.animationBlocks[offset];
    if (!commands) {
      let name = "local";
      if (header >= 0) {
        name = headers[header];
      }
      console.error(`animation block - ${name} - does not exist`, this);
      state.ignoreRest = true;
      return;
    }

    Object.assign(state, {
      commands,
      commandIndex: 0,
      waiting: 0,
      ignoreRest: false,
    });
    state.alreadyRun[header] = true;
    state.commands.header = header;

    if (header === headers.liftOff) {
      state.lifted = true;
    } else if (header === headers.landing) {
      state.lifted = false;
    }

    let prevAnim = "";

    if (state.dbg && state.dbg.prevAnimBlock && state.dbg.prevAnimBlock.commands) {
      if (state.dbg.prevAnimBlock.commands.header === -1) {
        prevAnim = "local";
      } else {
        prevAnim = headers[state.dbg.prevAnimBlock.commands.header];
      }
    }

    if (header === -1) {
      this.logger.log(`📝 local <- ${prevAnim}`, state);
    } else {
      this.logger.log(`📝 ${headers[header]} <- ${prevAnim}`, state);
    }

    return this;
  }

  update(state: IScriptState) {
    this.dispatched.length = 0;

    // update iscript state
    if (state.waiting !== 0) {
      state.waiting = state.waiting - 1;
      return this.dispatched;
    }
    this.next(state);
    return this.dispatched;
  }

  //@todo fix types
  _dispatch(command: any, event?: any) {
    this.logger.log(`🧩 ${command}`, event);
    this.dispatched.push([command, event]);
    return true;
  }

  setFrame(frame: number, flip: boolean, state: IScriptState) {
    state.prevFrame = state.frame;
    state.prevFlip = state.flip;
    state.flip = flip;
    state.frame = state.frameset + frame;
    state.frameOffset = frame;
  }

  setDirection(direction: number, state: IScriptState) {
    if (state.flDirect) {
      return;
    }
    if (direction > 31 || direction < 0) {
      throw new Error("direction out of bounds");
    }
    state.direction = direction;
    if (state.imageDesc.gfxTurns) {
      this.setFrameBasedOnDirection(state);
    }
  }

  setFrameBasedOnDirection(state: IScriptState) {
    if (state.direction > 16) {
      this.setFrame(32 - state.direction, true, state);
    } else {
      this.setFrame(state.direction, false, state);
    }
  }

  next(state: IScriptState) {
    if (state.ignoreRest) {
      return true;
    }
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (state.commandIndex >= state.commands.length) {
        let nextHeader = state.commands.header;
        if (!nextHeader) {
          throw new Error("command must have header");
        }
        let nextAnimationBlock;
        do {
          nextHeader = nextHeader + 1;
          nextAnimationBlock = this.run(nextHeader, state);
        } while (
          !nextAnimationBlock &&
          nextHeader < state.iscript.offsets.length
        );

        if (!nextAnimationBlock) {
          throw new Error("ran out of animation blocks");
        }
      }

      const [command, args] = state.commands[state.commandIndex];
      state.commandIndex++;

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
            state.waiting = args[Math.floor(Math.random() * args.length)];
            this._dispatch(command, state.waiting);
          }
          return;
        case "wait":
          {
            state.waiting = args[0];
            this._dispatch(command, state.waiting);
          }
          return;
        case "ignorerest":
          {
            state.ignoreRest = true;
            this._dispatch(command);
          }
          return;

        case "nobrkcodestart":
          {
            state.noBrkCode = true;
            this._dispatch(command);
          }
          break;

        case "nobrkcodeend":
          {
            state.noBrkCode = false;
            this._dispatch(command);
          }
          break;

        case "playfram":
          {
            if (state.imageDesc.gfxTurns && args[0] % 17 === 0) {
              state.frameset = args[0];
              this.setFrameBasedOnDirection(state);
              if (state.frame < 0) {
                throw new Error("frame < 0");
              }
              this._dispatch(command, [state.frame, state.flip]);
            } else {
              //@todo see if this matters
              state.frameset = 0;
              this.setFrame(args[0], state.flipState, state);
              this._dispatch(command, [args[0], state.flipState]);
            }
          }
          break;
        case "playframtile":
          {
            state.frameset = 0;
            this.setFrame(args[0] + this.tileset, false);
            this._dispatch(command, args[0] + this.tileset);
          }
          break;

        case "engframe":
          {
            state.frameset = args[0];
            state.direction =
              this.image.sprite.mainImage.userData.direction;
            this.setFrameBasedOnDirection(state);
            this._dispatch(command, [state.frame, state.flip]);
          }
          break;

        case "engset":
          {
            // state.frameset =
            //   state.frameset +
            //   args[0] * this.image.sprite.mainImage.frames.length;
            // state.direction =
            //   this.image.sprite.mainImage.userData.direction;
            // this.setFrameBasedOnDirection(state);
            // this._dispatch(command, [state.frame, state.flip]);
          }
          break;

        case "setflipstate":
          {
            state.flipState = Boolean(args[0]);
            this._dispatch(command, args);
          }
          break;

        case "setfldirect":
          {
            state.flDirect = true;
            state.direction = args[0];
            if (state.direction < 0 || state.direction > 31) {
              throw new Error("direction out of bounds");
            }
            this.setFrameBasedOnDirection(state);
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
              if ((state.direction + args[0]) % 32 > 31) {
                throw new Error("direction out of bounds");
              }
              state.direction = (state.direction += args[0]) % 32;
              this._dispatch(command, args);
            } else {
              state.direction = state.direction - args[0];
              if (state.direction < 0) {
                state.direction = 32 - state.direction;
              }
              this._dispatch(command, args);
            }
          }
          break;

        case "turn1cwise":
          {
            //			if (iscript_unit && !iscript_unit->order_target.unit)
            state.direction = (state.direction += 1) % 32;
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
            state.callStack = {
              commands: state.commands,
              commandIndex: state.commandIndex,
            };
            state.commandIndex = 0;
            state.commands = this.bwDat.iscript.animationBlocks[args[0]];
            this._dispatch(command, args);
          }
          return;

        case "return":
          {
            if (!state.callStack) {
              throw new Error("return without callstack");
            }
            state.commands = state.callStack.commands;
            state.commandIndex = state.callStack.commandIndex;
            delete state.callStack;
            this._dispatch(command);
          }
          return;

        case "randcondjmp":
          {
            if (Math.random() <= args[0] / 255) {
              this._toAnimationBlock(args[1], undefined, state);
              this._dispatch(command, true);
            } else {
              this._dispatch(command, false);
            }
          }
          break;
        case "goto":
          {
            this._toAnimationBlock(args[0], undefined, state);
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
            if (state.lifted) {
              this._toAnimationBlock(args[0], undefined, state);
              this._dispatch(command, args[0]);
            } else {
              this._dispatch(command, false);
            }
          }
          break;

        case "end": {
          state.terminated = true;
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
