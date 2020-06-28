import ParseCmd from "./ParseCmd";

const unitIdStartLocation = 0xd6;
const unitIDMineralField1 = 0xb0;
const unitIDMineralField2 = 0xb1;
const unitIDMineralField3 = 0xb2;
const unitIDVespeneGeyser = 0xbc;

const commands = {
  "Keep Alive": 0x05,
  "Save Game": 0x06,
  "Load Game": 0x07,
  "Restart Game": 0x08,
  Select: 0x09,
  "Select Add": 0x0a,
  "Select Remove": 0x0b,
  Build: 0x0c,
  Vision: 0x0d,
  Alliance: 0x0e,
  "Game Speed": 0x0f,
  Pause: 0x10,
  Resume: 0x11,
  Cheat: 0x12,
  Hotkey: 0x13,
  "Right Click": 0x14,
  "Targeted Order": 0x15,
  "Cancel Build": 0x18,
  "Cancel Morph": 0x19,
  Stop: 0x1a,
  "Carrier Stop": 0x1b,
  "Reaver Stop": 0x1c,
  "Order Nothing": 0x1d,
  "Return Cargo": 0x1e,
  Train: 0x1f,
  "Cancel Train": 0x20,
  Cloak: 0x21,
  Decloak: 0x22,
  "Unit Morph": 0x23,
  Unsiege: 0x25,
  Siege: 0x26,
  "Train Fighter": 0x27, // Build interceptor / scarab
  "Unload All": 0x28,
  Unload: 0x29,
  "Merge Archon": 0x2a,
  "Hold Position": 0x2b,
  Burrow: 0x2c,
  Unburrow: 0x2d,
  "Cancel Nuke": 0x2e,
  "Lift Off": 0x2f,
  Tech: 0x30,
  "Cancel Tech": 0x31,
  Upgrade: 0x32,
  "Cancel Upgrade": 0x33,
  "Cancel Addon": 0x34,
  "Building Morph": 0x35,
  Stim: 0x36,
  Sync: 0x37,
  "Voice Enable": 0x38,
  "Voice Disable": 0x39,
  "Voice Squelch": 0x3a,
  "Voice Unsquelch": 0x3b,
  "[Lobby] Start Game": 0x3c,
  "[Lobby] Download Percentage": 0x3d,
  "[Lobby] Change Game Slot": 0x3e,
  "[Lobby] New Net Player": 0x3f,
  "[Lobby] Joined Game": 0x40,
  "[Lobby] Change Race": 0x41,
  "[Lobby] Team Game Team": 0x42,
  "[Lobby] UMS Team": 0x43,
  "[Lobby] Melee Team": 0x44,
  "[Lobby] Swap Players": 0x45,
  "[Lobby] Saved Data": 0x48,
  "Briefing Start": 0x54,
  Latency: 0x55,
  "Replay Speed": 0x56,
  "Leave Game": 0x57,
  "Minimap Ping": 0x58,
  "Merge Dark Archon": 0x5a,
  "Make Game Public": 0x5b,
  Chat: 0x5c,
  "Right Click 1.21": 0x60,
  "Targeted Order 1.21": 0x61,
  "Unload 1.21": 0x62,
  "Select 1.21": 0x63,
  "Select Add 1.21": 0x64,
  "Select Remove 1.21": 0x65,
};

const commandsById = Object.keys(commands).reduce((memo, key) => {
  memo[commands[key]] = key;
  return memo;
}, {});

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
      .filter(({ unitId }) => unitId == unitIDVespeneGeyser)
      .map(({ x, y, resourceAmt }) => ({ x, y, resourceAmt })),
    minerals: chk.units
      .filter(({ unitId }) =>
        [
          unitIDMineralField1,
          unitIDMineralField2,
          unitIDMineralField3,
        ].includes(unitId)
      )
      .map(({ x, y, resourceAmt }) => ({ x, y, resourceAmt })),
    gameType: -1,
    startTime: new Date(header.seed * 1000).toISOString(),
    players: header.players.map((player) => {
      return {
        ...player,
        color: playerColors[playerColorIndex++].rgb,
        startLocation: chk.units.find(
          (u) => u.player == player.id && u.unitId == unitIdStartLocation
        ),
      };
    }),
    commands: commands.map(({ frame, id, player, data }) => {
      const name = commandsById[id];
      if (typeof name === "undefined") {
        console.error("watch out command has no name", id);
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

  return data;
}
