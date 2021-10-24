type IScriptRawType = {
  id: number;
  type: number;
  offset: number;
  offsets: number[];
};

type opPlayFrame = ["playfram", [number]];
type opPlayframtile = ["playframtile", [number]];
type opSetHorPos = ["sethorpos", [number]];
type opSetVertPos = ["setvertpos", [number]];
type opSetPos = ["setpos", [number, number]];
type opWait = ["wait", [number]];
type opWaitRand = ["wait", [number, number]];
type opGoto = ["goto", [number]];

// type imgol", [typeImageId, typeSByte, typeSByte]],
// type imgul", [typeImageId, typeSByte, typeSByte]],
// type imgolorig", [typeImageId]],
// type switchul", [typeImageId]],
// type __0c", []],
// type imgoluselo", [typeImageId, typeSByte, typeSByte]],
// type imguluselo", [typeImageId, typeSByte, typeSByte]],
// type sprol", [typeSpriteId, typeSByte, typeSByte]],
// type highsprol", [typeSpriteId, typeSByte, typeSByte]],
// type lowsprul", [typeSpriteId, typeSByte, typeSByte]],
// type uflunstable", [typeFlingy]],
// type spruluselo", [typeSpriteId, typeSByte, typeSByte]],
// type sprul", [typeSpriteId, typeSByte, typeSByte]],
// type sproluselo", [typeSpriteId, typeOverlayId]],
// type end", []],
// type setflipstate", [typeFlipState]],
// type playsnd", [typeSoundId]],
// type playsndrand", [typeSounds, typeSoundId]],
// type playsndbtwn", [typeSoundId, typeSoundId]],
// type domissiledmg", []],
// type attackmelee", [typeSounds, typeSoundId]],
// type followmaingraphic", []],
// type randcondjmp", [typeByte, typeLabel]],
// type turnccwise", [typeByte]],
// type turncwise", [typeByte]],
// type turn1cwise", []],
// type turnrand", [typeByte]],
// type setspawnframe", [typeByte]],
// type sigorder", [typeSignalId]],
// type attackwith", [typeWeapon]],
// type attack", []],
// type castspell", []],
// type useweapon", [typeWeaponId]],
// type move", [typeByte]],
// type gotorepeatattk", []],
// type engframe", [typeBFrame]],
// type engset", [typeFrameset]],
// type __2d", []],
// type nobrkcodestart", []],
// type nobrkcodeend", []],
// type ignorerest", []],
// type attkshiftproj", [typeByte]],
// type tmprmgraphicstart", []],
// type tmprmgraphicend", []],
// type setfldirect", [typeByte]],
// type call", [typeLabel]],
// type return", []],
// type setflspeed", [typeSpeed]],
// type creategasoverlays", [typeGasOverlay]],
// type pwrupcondjmp", [typeLabel]],
// type trgtrangecondjmp", [typeShort, typeLabel]],
// type trgtarccondjmp", [typeShort, typeShort, typeLabel]],
// type curdirectcondjmp", [typeShort, typeShort, typeLabel]],
// type imgulnextid", [typeSByte, typeSByte]],
// type __3e", []],
// type liftoffcondjmp", [typeLabel]],
// type warpoverlay", [typeFrame]],
// type orderdone", [typeSignalId]],
// type grdsprol", [typeSpriteId, typeSByte, typeSByte]],
// type __43", []],
// type dogrddamage", []],
// ];

type Operations =
  | opGoto
  | opPlayFrame
  | opPlayframtile
  | opSetHorPos
  | opSetVertPos
  | opSetPos
  | opWait
  | opWaitRand;

type AnimationBlockType = Operations[];

export type IScriptDATType = {
  iscript: Record<number, IScriptRawType>;
  animationBlocks: Record<number, AnimationBlockType>;
};
