import { reject } from "ramda";
import {
  iscriptHeaders as headers,
  headersById,
} from "../../common/bwdat/iscriptHeaders";

export class IScriptRunner {
  constructor(bwDat, iscriptId, parent, state = {}, listeners = {}) {
    this.bwDat = bwDat;
    // unit if its the first IScript runner, or IScriptRunner if it is a child
    this.parent = parent;
    this.iscriptId = iscriptId;
    this.iscript = bwDat.iscript[iscriptId];
    this.state = {
      children: [],
      waiting: 0,
      image: null,
      x: 0,
      y: 0,
      frame: 0,
      matchParentFrame: false,
      terminated: false,
      isGndWpnAnimationBlock: false,
      isAirWpnAnimationBlock: false,
      repeatAttackAfterCooldown: true,
      noBrkCode: false,
      ignoreRest: false,
      //@todo refactor to flingy?
      flingyDirection: 0,
      ...state,
    };
    this.listeners = listeners;
    this.toAnimationBlock(headers.init);
  }

  toAnimationBlock(header) {
    if (this.iscriptId === 144) {
      debugger;
    }
    this.commands = this.iscript.blocks[header];
    this.commands.header = header;
    this.commandIndex = 0;
    Object.assign(this.state, {
      waiting: 0,
      repeatAttackAfterCooldown: false,
      ignoreRest: false,
    });

    console.log(
      `animation block ${headersById[header]} ${
        this.parent.userData ? this.parent.userData.repId : ""
      }`,
      this
    );
  }

  update() {
    this.state.children.forEach((underlay) => underlay.iscript.update());
    this.state.children = this.state.children.filter(
      ({ iscript }) => !iscript.state.terminated
    );

    if (this.state.terminated) {
      return;
    }

    // update graphics state
    // if (this.state.matchParentFrame) {
    //   this.state.frame = this.parent.state.frame;
    // }

    // update iscript state
    if (this.state.waiting !== 0) {
      this.state.waiting = this.state.waiting - 1;
      return;
    }
    this.next();
  }

  on(command, cb) {
    this.listeners[command] = this.listeners[command] || [];
    this.listeners[command].push(cb);
  }

  _dispatch(command, event) {
    console.log(`dispatch ${command}`, event);
    this.listeners[command] &&
      this.listeners[command].forEach((cb) => cb(event));
    return true;
  }

  __imgul([imageId, x, y]) {
    return;
    const image = this.bwDat.images[imageId];
    const iscript = new IScriptRunner(
      this.bwDat,
      image.iscript,
      this,
      {
        x,
        y,
        image,
      },
      this.listeners
    );
    const underlay = { underlay: true, image, iscript };
    this.state.children.push(underlay);
    this._dispatch("imgul", underlay);
  }

  __imgol([imageId, x, y]) {
    return;

    const image = this.bwDat.images[imageId];
    const iscript = new IScriptRunner(
      this.bwDat,
      image.iscript,
      this,
      {
        x,
        y,
        image,
      },
      this.listeners
    );
    const overlay = { overlay: true, image, iscript };

    this.state.children.push(overlay);
    this._dispatch("imgol", overlay);
  }

  __wait([frames]) {
    this.state.waiting = frames;
    this._dispatch("wait", frames);
  }

  __waitrand(frames) {
    this.state.waiting = frames[Math.floor(Math.random() * frames.length)];
    this._dispatch("waitrand", this.state.waiting);
  }

  __followmaingraphic() {
    this.state.matchParentFrame = true;
    this._dispatch("followmaingraphic");
  }

  __randcondjmp([probability, offset]) {
    if (Math.floor(Math.random()) == probability) {
      this.__goto(
        [offset],
        this._dispatch("randcondjmp", { probability, offset, result: true })
      );
    } else {
      this._dispatch("randcondjmp", { probability, offset, result: false });
    }
  }

  //@todo fix this
  __goto([offset], alreadyDispatched) {
    this.commandIndex = 0;
    this.commands = this.iscript.blocks[this.iscript.offsets.indexOf(offset)];
    if (!this.commands) {
      // wider search
      this.state.ignoreRest = true;
      console.error(`goto ${offset}`);
      //   const otherScript = this.bwDat.iscript.find((script) => {
      //     if (!script || !script.offsets) {
      //       debugger;
      //       return false;
      //     }
      //     return script.offsets.indexOf(offset) > -1;
      //   });
      //   this.commands = otherScript.blocks[otherScript.offsets.indexOf(offset)];
      //   if (!this.commands) {
      //     throw new Error("goto offset not found");
      //   }
    }
    !alreadyDispatched && this._dispatch("goto", offset);
  }

  // melee only needs 1 level of call stack for broodling
  // should we move commands, commandIndex into state and just create a proper stack?
  __call([offset]) {
    this.callStack = {
      commands: this.commands,
      commandIndex: this.commandIndex,
    };
    this.commandIndex = 0;
    this.commands = this.iscript.blocks[this.iscript.offsets.indexOf(offset)];
    this._dispatch("call", offset);
  }

  __return() {
    this.commands = this.callStack.commands;
    this.commandIndex = this.callStack.commandIndex;
    delete this.callStack;
    this._dispatch("return");
  }

  __playsnd([soundId]) {
    this._dispatch("playsnd", soundId);
  }

  __playsndbtwn([soundA, soundB]) {
    const soundId = Math.floor(Math.random() * (soundB - soundA + 1)) + soundA;
    this._dispatch("playsndbtwn", soundId);
  }

  __playsndrand([numSounds, ...sounds]) {
    const soundId = sounds[Math.floor(Math.random() * numSounds)];
    this._dispatch("playsndrand", soundId);
  }

  __attackmelee([numSounds, ...sounds]) {
    const soundId = sounds[Math.floor(Math.random() * numSounds)];
    this._dispatch("attackmelee", soundId);
  }

  __end() {
    this.state.terminated = true;
    const hasDeathBlock = ({ iscript }) =>
      iscript.commands.header != headers.death && iscript.blocks[headers.death];

    this.state.children
      .filter(hasDeathBlock)
      .forEach(({ iscript }) => iscript.toAnimationBlock(headers.death));

    //@todo dispose children with graceful end ??
    // reject(hasDeathBlock, this.state.children).forEach(({ iscript }) =>
    //   iscript.dispose()
    // );

    this._dispatch("end");
  }

  __setvertpos([y]) {
    this.state.y = y;
    this._dispatch("setvertpos", y);
  }

  __gotorepeatattk() {
    this.state.repeatAttackAfterCooldown = true;
    this._dispatch("gotorepeatattk");
  }

  __nobrkcodestart() {
    this.state.noBrkCode = true;
    this._dispatch("nobrkcodestart");
  }

  __nobrkcodeend() {
    this.state.noBrkCode = false;
    this._dispatch("nobrkcodeend");
  }

  __attackwith([weaponType]) {
    const unitDef = this.bwDat.units[this.parent.typeId];
    this.__useweapon(
      [weaponType === 1 ? unitDef.groundWeapon : unitDef.airWeapon],
      this._dispatch("attackwith", weaponType)
    );
  }

  __useweapon([weaponId], alreadyDispatched) {
    // carriers, reavers, etc have "no weapon" and use 130 for weaponId
    if (weaponId >= this.bwDat.weapons.length) {
      return;
    }
    const weapon = this.bwDat.weapons[weaponId];
    const iscript = new IScriptRunner(
      this.bwDat,
      weapon.flingy.sprite.image.iscript,
      this,
      {},
      this.listeners
    );
    const entry = { weapon, iscript };
    this.state.children.push(entry);

    !alreadyDispatched && this._dispatch("useweapon", weapon);
  }

  //@todo send the weapon id / have better way to manage that state
  __domissiledmg() {
    this._dispatch("domissiledmg");
  }

  __dogrddamage() {
    this._dispatch("dogrddamage");
  }

  __liftoffcondjmp([offset]) {
    if (this.parent.lifted) {
      this.__goto([offset], this._dispatch("liftoffcondjmp", true));
    } else {
      this._dispatch("liftoffcondjmp", false);
    }
  }

  __ignorerest() {
    this.state.ignoreRest = true;
    this._dispatch("ignorerest");
  }

  next() {
    if (this.state.ignoreRest) {
      return;
    }
    if (this.commandIndex >= this.commands.length) {
      let nextHeader = this.commands.header + 1;
      while (
        !this.iscript.blocks[nextHeader] &&
        nextHeader < this.iscript.blocks.length
      ) {
        nextHeader = nextHeader + 1;
      }

      //@todo be able to access next units commands as well
      if (nextHeader >= this.iscript.blocks.length) {
        throw new Error("ran out of commands");
      }
      return this.toAnimationBlock(nextHeader);
    }

    const [command, ...args] = this.commands[this.commandIndex];
    switch (command) {
      case "attack":
      case "castspell":

      case "setfldirect":
      case "playfram":
      case "playframtile":
      case "sethorpos":
      case "setpos":
      case "imgolorig":
      case "switchul":
      case "imgoluselo":
      case "imguluselo":
      case "sprol":
      case "sproluselo":
      case "highsprol":
      case "lowsprul":
      case "sprul":
      case "spruluselo":
      case "setflipstate":
      case "turnccwise":
      case "turncwise":
      case "turn1cwise":
      case "turnrand":
      // will require getOrder and getOrderTarget from BWAPI
      case "move":
      case "engframe":
      case "engset":
      case "attkshiftproj":
      case "tmprmgraphicstart":
      case "tmprmgraphicend":
      case "setflspeed":
      case "creategasoverlays":
      case "trgtrangecondjmp":
      case "trgtarccondjmp":
      case "imageulnextid":
      case "grdsprol":
      case "warpoverlay":
      //nuclear missile only
      case "curdirectcondjmp":

      case "pwrupcondjmp":
      case "sigorder":
      case "orderdone":
      case "setspawnframe":
      case "uflunstable":
      case "__0c":
      case "__2d":
      case "__3e":
      case "__43":
        break;
      default:
        this.commandIndex++;
        if (typeof this[`__${command}`] !== "function") {
          throw new Error(`${command} not found in IScriptRunner`);
        }
        this[`__${command}`](args);
    }
  }
}
