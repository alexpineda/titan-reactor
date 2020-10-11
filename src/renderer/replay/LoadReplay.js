import ReplayParser from "jssuh";
import concat from "concat-stream";
import { imageChk } from "../utils/loadChk";
import Chk from "../../../libs/bw-chk";
import { ordersById } from "../../common/bwdat/orders";
import { commandsById } from "../../common/bwdat/commands";
import { unitTypes } from "../../common/bwdat/unitTypes";
import fs from "fs";

const { mineral1, mineral2, mineral3, geyser, startLocation } = unitTypes;

const unitTag = (uint16) => uint16 & 0x7ff;
const unitTagIsValid = (uint16) => uint16 != 0xffff;
const unitTagRecycle = (uint16) => uint16 >> 12;

const playerColors = [
  { name: "Red", id: 0x00, rgb: 0xf40404 },
  { name: "Blue", id: 0x01, rgb: 0x0c48cc },
  { name: "Teal", id: 0x02, rgb: 0x2cb494 },
  { name: "Purple", id: 0x03, rgb: 0x88409c },
  { name: "Orange", id: 0x04, rgb: 0xf88c14 },
  { name: "Brown", id: 0x05, rgb: 0x703014 },
  { name: "White", id: 0x06, rgb: 0xcce0d0 },
  { name: "Yellow", id: 0x07, rgb: 0xfcfc38 },
  { name: "Green", id: 0x08, rgb: 0x088008 },
  { name: "Pale Yellow", id: 0x09, rgb: 0xfcfc7c },
  { name: "Tan", id: 0x0a, rgb: 0xecc4b0 },
  { name: "Aqua", id: 0x0b, rgb: 0x4068d4 },
  { name: "Pale Green", id: 0x0c, rgb: 0x74a47c },
  { name: "Blueish Grey", id: 0x0d, rgb: 0x9090b8 },
  { name: "Pale Yellow2", id: 0x0e, rgb: 0xfcfc7c },
  { name: "Cyan", id: 0x0f, rgb: 0x00e4fc },
];
const hotkeyTypes = {
  0x00: "Assign",
  0x01: "Select",
  0x02: "Add",
};

export function fromScrepJSON({ Header, Computed, MapData, Commands }) {
  return {
    getPlayerById: function (id) {
      return this.players.find((p) => p.id == id);
    },
    map: {
      name: Header.Map,
      width: Header.MapWidth,
      height: Header.MapHeight,
      geysers: MapData.Geysers.map((g) => ({ x: g.X, y: g.Y })),
      minerals: MapData.MineralFields.map((g) => ({ x: g.X, y: g.Y })),
      tileset: {
        name: MapData.TileSet.Name,
        id: MapData.TileSet.ID,
      },
      tiles: MapData.Tiles,
      version: MapData.Version,
    },
    gameType: Header.Type.ShortName,
    startTime: Header.StartTime,
    players: Header.Players.map((p) => {
      const pd = Computed.PlayerDescs.find((pd) => pd.PlayerID == p.ID);

      const player = {
        color: p.Color.RGB,
        id: p.ID,
        name: p.Name,
        race: p.Race.Name.toLowerCase(),
        team: p.Team,
        startLocation: {
          x: pd.StartLocation.X,
          y: pd.StartLocation.Y,
        },
      };

      return player;
    }),
    commands: Commands.Cmds.map((raw) => {
      const cmd = {
        frame: raw.Frame,
        playerId: raw.PlayerID,
        type: {
          id: raw.Type.ID,
          name: raw.Type.Name,
        },
        x: raw.Pos && raw.Pos.X,
        y: raw.Pos && raw.Pos.Y,
        unitTag: raw.UnitTag,
        unitTags: raw.UnitTags,
        unit: raw.Unit,
        queued: raw.Queued,
        hotkeyType: raw.HotkeyType,
        group: raw.Group,
        order: raw.Order,

        senderSlotID: raw.SenderSlotID,
        message: raw.Message,

        data: raw.Data,
        speed: raw.Speed,
        tech: raw.Tech,
        upgrade: raw.Upgrade,
        latency: raw.Latency,
      };

      return cmd;
    }),
    durationFrames: Header.Frames,
  };
}

export function fromJssuhJSON(header, commands, chk) {
  let playerColorIndex = 0;

  return {
    chk,
    geysers: chk.units
      .filter(({ unitId }) => unitId == geyser)
      .map(({ x, y, resourceAmt }) => ({ x, y, resourceAmt })),
    minerals: chk.units
      .filter(({ unitId }) => [mineral1, mineral2, mineral3].includes(unitId))
      .map(({ x, y, resourceAmt }) => ({ x, y, resourceAmt })),
    gameType: -1,
    startTime: new Date(header.seed * 1000).toISOString(),
    players: header.players.map((player) => {
      return {
        ...player,
        color: playerColors[playerColorIndex++].rgb,
        startLocation: chk.units.find(
          (u) => u.player == player.id && u.unitId == startLocation
        ),
      };
    }),
    commands: commands.map(({ frame, id, player, data }) => {
      const name = commandsById[id];
      if (typeof name === "undefined") {
        console.error("command has no name", id);
      }

      let cmd = {
        frame,
        playerId: player,
        type: {
          id,
          name,
        },
      };

      return { ...cmd, ...cmdToJson(cmd, data) };
    }),
    durationFrames: header.durationFrames,
  };
}

export const cmdToJson = function ({ type: { name } }, buffer) {
  //todo use id in signature
  const data = new Buffer(buffer);
  switch (name) {
    case "Right Click":
      return {
        x: data.readUInt16LE(0),
        y: data.readUInt16LE(2),
        unitTag: unitTag(data.readUInt16LE(4)),
        unit: data.readUInt16LE(6),
        queued: data.readUInt8(8) != 0,
      };
    case "Select":
    case "Select Add":
    case "Select Remove":
      const count = data.readUInt8(0);
      const unitTags = range(0, count).map((i) => data.readUInt16LE(1 + i * 2));
      return {
        unitTags,
      };
    case "Hotkey":
      return {
        hotkeyType: data.readUInt8(0),
        group: data.readUInt8(1),
      };
    case "Train":
    case "Unit Morph":
      return {
        unit: data.readUInt16LE(0),
      };
    case "Targeted Order":
      return {
        x: data.readUInt16LE(0),
        y: data.readUInt16LE(2),
        unitTag: unitTag(data.readUInt16LE(4)),
        unit: data.readUInt16LE(6),
        order: {
          name: ordersById[data.readUInt8(8)],
          id: data.readUInt8(8),
        },
        queued: data.readUInt8(9) != 0,
      };
    case "Build":
      return {
        order: {
          name: ordersById[data.readUInt8(0)],
          id: data.readUInt8(0),
        },
        x: data.readUInt16LE(1),
        y: data.readUInt16LE(3),
        unit: data.readUInt16LE(5),
      };
    case "Stop":
    case "Burrow":
    case "Unburrow":
    case "Return Cargo":
    case "Hold Position":
    case "Unload All":
    case "Unsiege":
    case "Siege":
    case "Cloak":
    case "Decloak":
      return {
        queued: data.readUInt8(0) != 0,
      };

    case "Cancel Train":
      return {
        unitTag: unitTag(data.readInt16LE(0)),
      };
    case "Lift Off":
      return {
        x: data.readInt16LE(0),
        y: data.readInt16LE(2),
      };

    case "Tech":
      return {
        tech: data.readUInt8(0),
      };
    case "Upgrade":
      return {
        upgrade: data.readUInt8(0),
      };
    case "Building Morph":
      return {
        unit: data.readUInt16LE(0),
      };
    default:
      return null;
  }

  // skipped: vision, alliance, gamespeed, UNLOAD, cheat, latency, savegame, chat, minimap ping,
};

export const jssuhLoadReplay = (replayFile, bwDataPath) => {
  const reppi = fs.createReadStream(replayFile).pipe(new ReplayParser());
  const headerPromise = new Promise((resolve) => {
    reppi.on("replayHeader", (header) => {
      resolve(header);
    });
  });

  const chkPromise = new Promise((res, rej) => {
    reppi.pipeChk(
      Chk.createStream((err, data) => {
        if (err) return rej(err);
        res(imageChk(data, bwDataPath));
      })
    );
  });

  const commandsPromise = new Promise((resolve) => reppi.pipe(concat(resolve)));

  return new Promise((resolve, reject) => {
    reppi.on("error", reject);

    Promise.all([headerPromise, commandsPromise, chkPromise]).then(
      ([header, commands, chk]) => {
        resolve(fromJssuhJSON(header, commands, chk));
      }
    );
  });
};
