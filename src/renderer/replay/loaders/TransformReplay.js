import { cmdToJson } from "./ParseCmd";
import { commandsById } from "../../../common/bwdat/commands";
import {
  mineral1,
  mineral2,
  mineral3,
  geyser,
  startLocation,
} from "../../../common/bwdat/unitTypes";

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
