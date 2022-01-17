//lifted straight from jssuh
const CMDS = (() => {
  const c = (id, len) => ({ id, length: () => len });
  const fun = (id, func) => ({ id, length: func });
  const saveLength = (data) => {
    if (data.length < 5) {
      return null;
    }
    const pos = data.indexOf(0, 5);
    return pos === -1 ? data.length : pos;
  };
  const selectLength = (data) => {
    if (data.length < 1) {
      return null;
    }
    return 1 + data.readUInt8(0) * 2;
  };
  const extSelectLength = (data) => {
    if (data.length < 1) {
      return null;
    }
    return 1 + data.readUInt8(0) * 4;
  };
  return {
    KEEP_ALIVE: c(0x5, 0),
    SAVE: fun(0x6, saveLength),
    LOAD: fun(0x7, saveLength),
    RESTART: c(0x8, 0),
    SELECT: fun(0x9, selectLength),
    SELECTION_ADD: fun(0xa, selectLength),
    SELECTION_REMOVE: fun(0xb, selectLength),
    BUILD: c(0xc, 7),
    VISION: c(0xd, 2),
    ALLIANCE: c(0xe, 4),
    GAME_SPEED: c(0xf, 1),
    PAUSE: c(0x10, 0),
    RESUME: c(0x11, 0),
    CHEAT: c(0x12, 4),
    HOTKEY: c(0x13, 2),
    RIGHT_CLICK: c(0x14, 9),
    TARGETED_ORDER: c(0x15, 10),
    CANCEL_BUILD: c(0x18, 0),
    CANCEL_MORPH: c(0x19, 0),
    STOP: c(0x1a, 1),
    CARRIER_STOP: c(0x1b, 1),
    REAVER_STOP: c(0x1c, 0),
    ORDER_NOTHING: c(0x1d, 0),
    RETURN_CARGO: c(0x1e, 1),
    TRAIN: c(0x1f, 2),
    CANCEL_TRAIN: c(0x20, 2),
    CLOAK: c(0x21, 1),
    DECLOAK: c(0x22, 1),
    UNIT_MORPH: c(0x23, 2),
    UNSIEGE: c(0x25, 1),
    SIEGE: c(0x26, 1),
    TRAIN_FIGHTER: c(0x27, 0),
    UNLOAD_ALL: c(0x28, 1),
    UNLOAD: c(0x29, 2),
    MERGE_ARCHON: c(0x2a, 0),
    HOLD_POSITION: c(0x2b, 1),
    BURROW: c(0x2c, 1),
    UNBURROW: c(0x2d, 1),
    CANCEL_NUKE: c(0x2e, 0),
    LIFTOFF: c(0x2f, 4),
    TECH: c(0x30, 1),
    CANCEL_TECH: c(0x31, 0),
    UPGRADE: c(0x32, 1),
    CANCEL_UPGRADE: c(0x33, 0),
    CANCEL_ADDON: c(0x34, 0),
    BUILDING_MORPH: c(0x35, 2),
    STIM: c(0x36, 0),
    SYNC: c(0x37, 6),
    VOICE_ENABLE1: c(0x38, 0),
    VOICE_ENABLE2: c(0x39, 0),
    VOICE_SQUELCH1: c(0x3a, 1),
    VOICE_SQUELCH2: c(0x3b, 1),
    START_GAME: c(0x3c, 0),
    DOWNLOAD_PERCENTAGE: c(0x3d, 1),
    CHANGE_GAME_SLOT: c(0x3e, 5),
    NEW_NET_PLAYER: c(0x3f, 7),
    JOINED_GAME: c(0x40, 17),
    CHANGE_RACE: c(0x41, 2),
    TEAM_GAME_TEAM: c(0x42, 1),
    UMS_TEAM: c(0x43, 1),
    MELEE_TEAM: c(0x44, 2),
    SWAP_PLAYERS: c(0x45, 2),
    SAVED_DATA: c(0x48, 12),
    BRIEFING_START: c(0x54, 0),
    LATENCY: c(0x55, 1),
    REPLAY_SPEED: c(0x56, 9),
    LEAVE_GAME: c(0x57, 1),
    MINIMAP_PING: c(0x58, 4),
    MERGE_DARK_ARCHON: c(0x5a, 0),
    MAKE_GAME_PUBLIC: c(0x5b, 0),
    CHAT: c(0x5c, 81),
    SET_TURN_RATE: c(0x5f, 0x1),
    RIGHT_CLICK_EXT: c(0x60, 0xb),
    TARGETED_ORDER_EXT: c(0x61, 0xc),
    UNLOAD_EXT: c(0x62, 4),
    SELECT_EXT: fun(0x63, extSelectLength),
    SELECTION_ADD_EXT: fun(0x64, extSelectLength),
    SELECTION_REMOVE_EXT: fun(0x65, extSelectLength),
    NEW_NETWORK_SPEED: c(0x66, 3),
  };
})();

for (const key of Object.keys(CMDS)) {
  CMDS[key].name = key;
  CMDS[CMDS[key].id] = CMDS[key];
}

function commandLength(id, data) {
  const cmd = CMDS[id];
  if (!cmd) {
    return null;
  }
  return cmd.length(data);
}

module.exports = {
  CMDS,
  commandLength,
};
