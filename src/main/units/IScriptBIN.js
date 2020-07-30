import { openFileBinary, openFileLines } from "../fs";
import { range } from "ramda";
const IScriptHeaders = [
  "Init",
  "Death",
  "GndAttkInit",
  "AirAttkInit",
  "Unused1",
  "GndAttkRpt",
  "AirAttkRpt",
  "CastSpell",
  "GndAttkToIdle",
  "AirAttkToIdle",
  "Unused2",
  "Walking",
  "WalkingToIdle",
  "SpecialState1",
  "SpecialState2",
  "AlmostBuilt",
  "Built",
  "Landing",
  "LiftOff",
  "IsWorking",
  "WorkingToIdle",
  "WarpIn",
  "Unused3",
  "StarEditInit",
  "Disable",
  "Burrow",
  "UnBurrow",
  "Enable",
];

const IScriptEntryTypes = {
  0: 2,
  1: 2,
  2: 4,
  12: 14,
  13: 14,
  14: 16,
  15: 16,
  20: 22,
  21: 22,
  23: 24,
  24: 26,
  26: 28,
  27: 28,
  28: 28,
  29: 28,
};

const typeFrame = { size: 2, name: "frame" };
const typeFrameset = { size: 1, name: "frameset" };
const typeSByte = { size: 1, name: "sbyte" };
const typeByte = { size: 1, name: "byte" };
const typeLabel = { size: 2, name: "label" };
const typeImageId = { size: 2, name: "imageid" };
const typeSpriteId = { size: 2, name: "spriteid" };
const typeFlingy = { size: 2, name: "flingy" };
const typeFlipState = { size: 1, name: "flipstate" };
const typeSoundId = { size: 2, name: "soundid" };
const typeSounds = { size: 1, name: "sounds" };
const typeSignalId = { size: 1, name: "signalid" };
const typeWeapon = { size: 1, name: "weapon" };
const typeWeaponId = { size: 1, name: "weaponid" };
const typeSpeed = { size: 2, name: "speed" };
const typeBFrame = { size: 1, name: "bframe" };
const typeGasOverlay = { size: 1, name: "gasoverlay" };
const typeShort = { size: 2, name: "short" };
const typeOverlayId = { size: 1, name: "overlayid" };

const reader = (buf) => {};

const IScriptOPCodes = [
  ["playfram", [typeFrame]],
  ["playframtile", [typeFrame]],
  ["sethorpos", [typeSByte]],
  ["setvertpos", [typeSByte]],
  ["setpos", [typeSByte, typeSByte]],
  ["wait", [typeByte]],
  ["waitrand", [typeByte, typeByte]],
  ["goto", [typeLabel]],
  ["imgol", [typeImageId, typeSByte, typeSByte]],
  ["imgul", [typeImageId, typeSByte, typeSByte]],
  ["imgolorig", [typeImageId]],
  ["switchul", [typeImageId]],
  ["__0c", []],
  ["imgoluselo", [typeImageId, typeSByte, typeSByte]],
  ["imguluselo", [typeImageId, typeSByte, typeSByte]],
  ["sprol", [typeSpriteId, typeSByte, typeSByte]],
  ["highsprol", [typeSpriteId, typeSByte, typeSByte]],
  ["lowsprul", [typeSpriteId, typeSByte, typeSByte]],
  ["uflunstable", [typeFlingy]],
  ["spruluselo", [typeSpriteId, typeSByte, typeSByte]],
  ["sprul", [typeSpriteId, typeSByte, typeSByte]],
  ["sproluselo", [typeSpriteId, typeOverlayId]],
  ["end", []],
  ["setflipstate", [typeFlipState]],
  ["playsnd", [typeSoundId]],
  ["playsndrand", [typeSounds, typeSoundId]],
  ["playsndbtwn", [typeSoundId, typeSoundId]],
  ["domissiledmg", []],
  ["attackmelee", [typeSounds, typeSoundId]],
  ["followmaingraphic", []],
  ["randcondjmp", [typeByte, typeLabel]],
  ["turnccwise", [typeByte]],
  ["turncwise", [typeByte]],
  [["turn1cwise", "turnlcwise"], []],
  ["turnrand", [typeByte]],
  ["setspawnframe", [typeByte]],
  ["sigorder", [typeSignalId]],
  ["attackwith", [typeWeapon]],
  ["attack", []],
  ["castspell", []],
  ["useweapon", [typeWeaponId]],
  ["move", [typeByte]],
  ["gotorepeatattk", []],
  ["engframe", [typeBFrame]],
  ["engset", [typeFrameset]],
  ["__2d", []],
  ["nobrkcodestart", []],
  ["nobrkcodeend", []],
  ["ignorerest", []],
  ["attkshiftproj", [typeByte]],
  ["tmprmgraphicstart", []],
  ["tmprmgraphicend", []],
  ["setfldirect", [typeByte]],
  ["call", [typeLabel]],
  ["return", []],
  ["setflspeed", [typeSpeed]],
  ["creategasoverlays", [typeGasOverlay]],
  ["pwrupcondjmp", [typeLabel]],
  ["trgtrangecondjmp", [typeShort, typeLabel]],
  ["trgtarccondjmp", [typeShort, typeShort, typeLabel]],
  ["curdirectcondjmp", [typeShort, typeShort, typeLabel]],
  ["imgulnextid", [typeSByte, typeSByte]],
  ["__3e", []],
  ["liftoffcondjmp", [typeLabel]],
  ["warpoverlay", [typeFrame]],
  ["orderdone", [typeSignalId]],
  ["grdsprol", [typeSpriteId, typeSByte, typeSByte]],
  ["__43", []],
  ["dogrddamage", []],
];

const read = (buf, size, pos) => {
  let value = null;
  if (size === 1) {
    value = buf.readUInt8(pos);
  } else if (size === 2) {
    value = buf.readUInt16LE(pos);
  }
  return value;
};

export class IScriptBIN {
  constructor() {}

  init() {
    if (this.initialized) return this.initialized;

    return (this.initialized = new Promise((res) => {
      res();
    }));
  }

  async load() {
    await this.init();
    const buf = await openFileBinary(
      `${process.env.BWDATA}/scripts/iscript.bin`
    );

    const headers = [];

    readSection(buf.readUInt16LE(0));

    function readSection(pos) {
      if (pos > buf.byteLength - 4) return;

      const headerId = buf.readUInt16LE(pos);
      if (headers[headerId]) {
        throw new Error("duplicate header id");
      }

      const offset = buf.readUInt16LE(pos + 2);

      if (headerId == 65535 && offset == 0) {
        return;
      }

      if (buf.toString("utf8", offset, offset + 4) != "SCPE") {
        throw new Error(`invalid header`);
      }

      const header = {
        id: headerId,
        // name: IScriptHeaders[headerId], //probabl not right since we have that missing index 1
        entryType: buf.readUInt8(offset + 4),
        offset,
        offsets: [],
      };

      const ct = IScriptEntryTypes[header.entryType];
      header.offsets = range(0, ct).map((x) =>
        buf.readUInt16LE(offset + 8 + 2 * x)
      );
      headers[headerId] = header;
      readSection(pos + 4);
    }

    function loadOffset(offset) {
      const opIndex = buf.readUInt8(offset);
      if (opIndex >= IScriptOPCodes.length) {
        throw new Error("invalid command");
      }

      const [opName, params] = IScriptOPCodes[opIndex];
      const op = { opName, opIndex, offset };
      const args = [];
      if (params.length) {
        if (params[0].name != "sounds") {
          params.reduce((pos, { name, size }) => {
            args.push({ name, val: read(buf, size, pos) });
            return pos + size;
          }, offset + 1);
        } else {
          const [sounds, { name, size }] = params;

          const numSounds = read(buf, sounds.size, offset + sounds.size);
          args.push({ name: sounds.name, val: numSounds, special: true });
          range(0, numSounds).forEach((x) => {
            args.push({
              name,
              val: read(buf, size, offset + 2 + size * x),
            });
          });
        }
      } //end params

      if (opIndex == 7) {
        // go to
        return { ...loadOffset(args[0].val), gotoFrom: opIndex };
      } else if ([22, 54].includes(opIndex)) {
        //end and return
      } else if ([30, 53, 57, 58, 59, 60, 63].includes(opIndex)) {
        //randcondjump,call,pwrupcondjmp,trgtrangecondjmp,trgtarccondjmp,curdirectcondjmp,liftoffcondjump
        return {
          ...loadOffset(args[args.length - 1].val),
          jumpedFrom: op,
        };
      }

      return { op, args };
    }

    headers
      .filter((h) => h)
      .forEach((header) => {
        header.commands = header.offsets.filter((o) => o).map(loadOffset);
      });

    this.headers = headers;
  }
}
