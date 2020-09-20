import { iscriptHeaders } from "../../common/bwdat/iscriptHeaders";

export class IScriptRunner {
  constructor(bwDat, iscriptId, parent, state = {}, listeners = {}) {
    this.bwDat = bwDat;
    this.parent = parent;
    this.iscript = bwDat.iscript[iscriptId];
    this.state = {
      underlays: [],
      overlays: [],
      waiting: 0,
      usingWeapon: null,
      attackAnimAllowed: true,
      image: null,
      x: 0,
      y: 0,
      frame: 0,
      matchParentFrame: false,
      terminated: false,
      ...state,
    };

    this.listeners = listeners;
    this.commands = this.iscript.sections[iscriptHeaders.init];
    this.commandIndex = 0;
  }

  toSection(section) {
    this.commands = this.iscript.sections[section];
    this.commandIndex = 0;
    Object.assign(this.state, {
      waiting: 0,
    });
  }

  update() {
    if (this.state.terminated) {
      return;
    }

    // update graphics state
    if (this.state.matchParentFrame) {
      this.state.frame = this.parent.state.frame;
    }

    this.state.underlays.forEach((underlay) => underlay.iscript.update());
    this.state.overlays.forEach((underlay) => underlay.iscript.update());
    this.state.usingWeapon && this.state.usingWeapon.iscript.update();

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
    // console.log(`dispatch ${command}`, event);
    this.listeners[command] &&
      this.listeners[command].forEach((cb) => cb(event));
  }

  __imgul([imageId, x, y]) {
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
    const underlay = { image, iscript };
    this.state.underlays.push(underlay);
    this._dispatch("imgul", underlay);
  }

  __imgol([imageId, x, y]) {
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
    const overlay = { image, iscript };

    this.state.overlays.push(overlay);
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

  //@todo fix this
  __goto([offset]) {
    this.commandIndex = 0;
    this.commands = this.iscript.sections[this.iscript.offsets.indexOf(offset)];
    if (!this.commands) {
      // wider search
      this.state.terminated = true;
      console.error(`goto ${offset}`);
      //   const otherScript = this.bwDat.iscript.find((script) => {
      //     if (!script || !script.offsets) {
      //       debugger;
      //       return false;
      //     }
      //     return script.offsets.indexOf(offset) > -1;
      //   });
      //   this.commands = otherScript.sections[otherScript.offsets.indexOf(offset)];
      //   if (!this.commands) {
      //     throw new Error("goto offset not found");
      //   }
    }
    this._dispatch("goto", offset);
  }

  __playfram([frame]) {
    this.state.frame = frame;
    this._dispatch("playframe", frame);
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

  __end() {
    this.state.terminated = true;
    this._dispatch("end");
  }

  __setvertpos([y]) {
    this.state.y = y;
    this._dispatch("setvertpos", y);
  }

  // 1 = ground, 2 = air
  __attackwith([weapon]) {
    this.state.attackAnimAllowed = false;
    this._dispatch("attackwith", weapon);
  }

  __gotorepeatattk() {
    this.state.attackAnimAllowed = true;
    this._dispatch("gotorepeatattk");
  }

  __useweapon([weaponId]) {
    const weapon = this.bwDat.weapons[weaponId];
    const iscript = new IScriptRunner(
      this.bwDat,
      weapon.flingy.sprite.image.iscript,
      this,
      {},
      this.listeners
    );
    this.state.usingWeapon = {
      weapon,
      iscript,
    };
    this._dispatch("useweapon", weapon);
  }

  next() {
    if (this.commandIndex >= this.commands.length) {
      return;
    }
    const [command, ...args] = this.commands[this.commandIndex];
    switch (command) {
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
      case "attackmelee":
      case "randcondjmp":
      case "turnccwise":
      case "turncwise":
      case "turn1cwise":
      case "turnrand":
      case "setspawnframe":
      case "sigorder":
      case "attack":
      case "castspell":
      case "move":
      case "engframe":
      case "engset":
      case "nobrkcodestart":
      case "nobrkcodeend":
      case "ignorerest":
      case "attkshiftproj":
      case "tmprmgraphicstart":
      case "tmprmgraphicend":
      case "setfldirect":
      case "call":
      case "return":
      case "setflspeed":
      case "creategasoverlays":
      case "pwrupcondjmp":
      case "trgtrangecondjmp":
      case "trgtarccondjmp":
      case "curdirectcondjmp":
      case "liftoffcondjmp":
      case "imageulnextid":
      case "orderdone":
      case "grdsprol":
      case "dogrddamage":
      case "warpoverlay":
      case "domissiledmg":
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
