import { Object3D } from "three";

import { IScriptRunner } from "../iscript";
import { BwDAT, ImageDAT } from "./bwdat";

export type createIScriptRunner = (
  image: Object3D,
  imageDesc: ImageDAT,
  state?: any
) => IScriptRunner;

export type createIScriptRunnerFactory = (
  bwDat: BwDAT,
  tileset: number
) => createIScriptRunner;

export type IScriptRawType = {
  id: number;
  type: number;
  offset: number;
  offsets: number[];
};

export type opArgNone = [];
export type opArgOne = [number];
export type opArgTwo = [number, number];
export type opArgThree = [number, number, number];

// not implemented
type opSwitchUlt = ["switchul", opArgNone];
type opSetFlSpeed = ["setflspeed", opArgOne];
type opMove = ["move", opArgNone];
type opPowerupCondJmp = ["pwrupcondjmp", opArgNone];
type opSigOrder = ["sigorder", opArgNone];
type opOrderDone = ["orderdone", opArgNone];
type opSetSpawnFrame = ["setspawnframe", opArgNone];
type opUflUnstable = ["uflunstable", opArgNone];
type op__0c = ["__0c", opArgNone];
type op__2d = ["__2d", opArgNone];
type op__3e = ["__3e", opArgNone];
type op__43 = ["__43", opArgNone];

type opPlayFrame = ["playfram", opArgOne];
type opPlayframtile = ["playframtile", opArgOne];
type opSetHorPos = ["sethorpos", opArgOne];
type opSetVertPos = ["setvertpos", opArgOne];
type opSetPos = ["setpos", opArgTwo];
type opWait = ["wait", opArgOne];
type opWaitRand = ["waitrand", opArgTwo];
type opGoto = ["goto", opArgOne];
type opImgol = ["imgol", opArgThree];
type opImgul = ["imgul", opArgThree];
type opImgolUselo = ["imgoluselo", opArgThree];
type opImgulUselo = ["imguluselo", opArgThree];
type opSprol = ["sprol", opArgThree];
type opHighSprol = ["highsprol", opArgThree];
type opLowSprul = ["lowsprul", opArgThree];
type opSprulUselo = ["spruluselo", opArgThree];
type opSprul = ["sprul", opArgThree];
type opSprolUselo = ["sproluselo", opArgTwo];
type opImgOlOrig = ["imgolorig", opArgOne];
type opSwitchUl = ["switchul", opArgOne];
type opEnd = ["end", opArgOne];
type opSetFlipState = ["setflipstate", opArgOne];
type opPlaySnd = ["playsnd", opArgOne];
type opPlaySndRand = ["playsndrand", opArgTwo];
type opPlaySndBtwn = ["playsndbtwn", opArgTwo];
type opDoMissileDmg = ["domissiledmg", opArgNone];
type opAttackMelee = ["attackmelee", opArgTwo];
type opFollowMainGraphic = ["followmaingraphic", opArgNone];
type opRandCondJmp = ["randcondjmp", opArgTwo];
type opTurnCCWise = ["turnccwise", opArgOne];
type opTurnCWise = ["turncwise", opArgOne];
type opTurn1CWise = ["turn1cwise", opArgNone];
type opTurnRand = ["turnrand", opArgOne];
type opAttackWith = ["attackwith", opArgOne];
type opAttack = ["attack", opArgNone];
type opCastSpell = ["castspell", opArgNone];
type opUseWeapon = ["useweapon", opArgOne];
type opGotoRepeatAttk = ["gotorepeatattk", opArgNone];
type opEngFrame = ["engframe", opArgOne];
type opEngSet = ["engset", opArgOne];
type opNoBrkCodeStart = ["nobrkcodestart", opArgNone];
type opNoBrkCodeEnd = ["nobrkcodeend", opArgNone];
type opIgnoreRest = ["ignorerest", opArgNone];
type opTmprmGraphicStart = ["tmprmgraphicstart", opArgNone];
type opTmprmGraphicEnd = ["tmprmgraphicend", opArgNone];
type opReturn = ["return", opArgNone];
type opAttkShiftProj = ["attkshiftproj", opArgOne];
type opSetFlDirect = ["setfldirect", opArgOne];
type opCall = ["call", opArgOne];
type opCreateGasOverlays = ["creategasoverlays", opArgOne];
type opTargetRangeCondJmp = ["trgtrangecondjmp", opArgTwo];
type opTargetArcCondJmp = ["trgtarccondjmp", opArgThree];
type opCurDirectCondJump = ["curdirectcondjmp", opArgThree];
type opImgulNextId = ["imgulnextid", opArgTwo];
type opLiftOffCondJmp = ["liftoffcondjmp", [number]];
type opWarpOverlay = ["warpoverlay", [number]];
type opGrdSprol = ["grdsprol", [number, number, number]];
type opDoGrdDamage = ["dogrddamage", opArgNone];

type Operations =
  | opGoto
  | opPlayFrame
  | opPlayframtile
  | opSetHorPos
  | opSetVertPos
  | opSetPos
  | opWait
  | opWaitRand
  | opSwitchUlt
  | opSetFlSpeed
  | opMove
  | opPowerupCondJmp
  | opSigOrder
  | opOrderDone
  | opSetSpawnFrame
  | opUflUnstable
  | op__0c
  | op__2d
  | op__3e
  | op__43
  | opImgol
  | opImgul
  | opImgolUselo
  | opImgulUselo
  | opSprol
  | opHighSprol
  | opLowSprul
  | opSprulUselo
  | opSprul
  | opSprolUselo
  | opImgOlOrig
  | opSwitchUl
  | opEnd
  | opSetFlipState
  | opPlaySnd
  | opPlaySndRand
  | opPlaySndBtwn
  | opDoMissileDmg
  | opAttackMelee
  | opFollowMainGraphic
  | opRandCondJmp
  | opTurnCCWise
  | opTurnCWise
  | opTurn1CWise
  | opTurnRand
  | opAttackWith
  | opAttack
  | opCastSpell
  | opUseWeapon
  | opGotoRepeatAttk
  | opEngFrame
  | opEngSet
  | opNoBrkCodeStart
  | opNoBrkCodeEnd
  | opIgnoreRest
  | opTmprmGraphicStart
  | opTmprmGraphicEnd
  | opReturn
  | opAttkShiftProj
  | opSetFlDirect
  | opCall
  | opCreateGasOverlays
  | opTargetRangeCondJmp
  | opTargetArcCondJmp
  | opCurDirectCondJump
  | opImgulNextId
  | opLiftOffCondJmp
  | opWarpOverlay
  | opGrdSprol
  | opDoGrdDamage;

export type AnimationBlockType = Operations[];

export type IScriptDATType = {
  iscripts: Record<number, IScriptRawType>;
  animationBlocks: Record<number, AnimationBlockType>;
};
