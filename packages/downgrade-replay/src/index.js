// based HEAVILY on jssuh, screp & openbw <3
const { BufferList } = require("bl");
const iconv = require("iconv-lite");
const zlib = require("zlib");
const { Writable, Readable } = require("stream");
const pkware = require("../libs/pkware-wasm/pkware");
const crc32 = require("../libs/crc32");
const downgradeChk = require("../libs/chk-downgrader/chk-downgrader.js");

const HeaderMagicClassic = 0x53526572;
const HeaderMagicScrModern = 0x53526573;
const MAX_CHUNK_SIZE = 0x2000;

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

//https://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-a-range-within-the-supp
const range = (startAt, size) => {
  return [...Array(size).keys()].map((i) => i + startAt);
};

const inflate = async (buf) => {
  if (buf.readUInt8(0) !== 0x78) {
    return pkware.explode(buf);
  }

  return new Promise((res, rej) => {
    new Readable({
      read: function () {
        this.push(buf);
        this.push(null);
      },
    })
      .pipe(zlib.createInflate())
      .pipe(
        new Writable({
          write(inf, enc, done) {
            res(inf);
            done();
          },
        })
      );
  });
};

const deflate = async (buf) => {
  return pkware.implode(buf, pkware.ImplodeDictSize1);
};

const block = async (buf, blockSize) => {
  if (blockSize === 0) {
    console.warn("block size 0");
    return;
  }
  const checksum = buf.readUInt32LE(0);
  const chunkCount = buf.readUInt32LE(4);
  buf.consume(8);

  const expectedChunks = Math.ceil(blockSize / MAX_CHUNK_SIZE);
  if (chunkCount !== expectedChunks) {
    throw new Error(`Expected ${expectedChunks} chunks, got ${chunkCount}`);
  }
  const chunks = [];

  const actualBlockSize = range(0, chunkCount).reduce((pos) => {
    const chunkSize = buf.readUInt32LE(pos);
    buf.consume(4);

    chunks.push({
      buf: buf.slice(pos, pos + chunkSize),
    });

    return pos + chunkSize;
  }, 0);

  buf.consume(actualBlockSize);

  const isDeflated = actualBlockSize < blockSize;

  let deflated = await Promise.all(
    chunks.map((chunk) => (isDeflated ? inflate(chunk.buf) : chunk.buf))
  );

  const result = deflated.reduce(
    (buf, chunk) => buf.append(chunk),
    new BufferList()
  );

  // @todo these fail on 2nd last block size for 116 reps, 2nd last block doesn't get
  // deflated to 8192 but only 4096 :S
  if (result.length != blockSize)
    throw new Error(`read bytes, expected:${blockSize} got:${result.length}`);

  const calcChecksum = crc32(result.slice(0));
  if (calcChecksum !== checksum) {
    throw new Error(`crc32 mismatch expected:${checksum} got:${calcChecksum}`);
  }

  return result;
};

const Version = {
  classic: 0,
  remastered: 1,
};

const parseReplay = async (buf) => {
  const bl = new BufferList();
  bl.append(buf);

  const magic = (await block(bl, 4)).readUInt32LE(0);
  let version = -1;

  if (magic === HeaderMagicClassic) {
    version = Version.classic;
  } else if (magic === HeaderMagicScrModern) {
    version = Version.remastered;
  } else {
    throw new Error("not a replay");
  }
  if (version === Version.remastered) {
    // ignore scr sections
    bl.consume(4);
  }

  const rawHeader = await block(bl, 0x279);
  const header = parseHeader(rawHeader);

  const cmdsSize = (await block(bl, 4)).readUInt32LE(0);
  const rawCmds = await block(bl, cmdsSize);
  const players = [];
  for (let i = 0; i < 8; i++) {
    const offset = 0xa1 + 0x24 * i;
    const stormId = rawHeader.readInt32LE(offset + 0x4);
    if (stormId >= 0) {
      players[i] = rawHeader.readUInt32LE(offset);
    }
  }
  const cmds = parseCommands(rawCmds, players);

  const chkSize = (await block(bl, 4)).readUInt32LE(0);
  const chk = await block(bl, chkSize);

  return {
    version,
    rawHeader,
    header,
    rawCmds,
    cmds,
    chk,
  };
};

const cstring = (buf) => {
  let text = buf;
  const end = buf.indexOf(0);
  if (end !== -1) {
    text = buf.slice(0, end);
  }

  const string = iconv.decode(text, "cp949");
  if (string.indexOf("\ufffd") !== -1) {
    return iconv.decode(text, "cp1252");
  } else {
    return string;
  }
};

const parseHeader = (buf) => {
  let pos = 0;
  const nextUint8 = () => {
    const v = buf.readUInt8(pos);
    pos = pos + 1;
    return v;
  };
  const nextUint16 = () => {
    const v = buf.readInt16LE(pos);
    pos = pos + 2;
    return v;
  };
  const nextUint32 = () => {
    const v = buf.readUInt32LE(pos);
    pos = pos + 4;
    return v;
  };
  const next = (n) => {
    const v = buf.slice(pos, pos + n);
    pos = pos + n;
    return v;
  };

  const isBroodwar = nextUint8();
  const frameCount = nextUint32();
  const campaignId = nextUint16();
  const commandByte = nextUint8(1);

  const randomSeed = nextUint32();
  const playerBytes = next(8);
  const unk1 = nextUint32();
  const playerName = next(24);

  const gameFlags = nextUint32();
  const mapWidth = nextUint16();
  const mapHeight = nextUint16();
  const activePlayerCount = nextUint8();

  const slotCount = nextUint8();
  const gameSpeed = nextUint8();
  const gameState = nextUint8();
  const gameType = nextUint16();

  const gameSubtype = nextUint16();
  const unk2 = nextUint32();
  const tileset = nextUint16();
  const replayAutoSave = nextUint8();

  const computerPlayerCount = nextUint8();
  const gameName = cstring(next(25));
  const mapName = cstring(next(32));
  const unk3 = nextUint16();

  const unk4 = nextUint16();
  const unk5 = nextUint16();
  const unk6 = nextUint16();
  const victoryCondition = nextUint8();

  const resourceType = nextUint8();
  const useStandardUnitStats = nextUint8();
  const fogOfWarEnabled = nextUint8();
  const createInitialUnits = nextUint8();

  const useFixedPositions = nextUint8();
  const restrictionFlags = nextUint8();
  const alliesEnabled = nextUint8();
  const teamsEnabled = nextUint8();

  const cheatsEnabled = nextUint8();
  const tournamentMode = nextUint8();
  const victoryConditionValue = nextUint32();
  const startingMinerals = nextUint32();

  const startingGas = nextUint32();
  const unk7 = nextUint8();

  const raceStr = (race) => {
    switch (race) {
      case 0:
        return "zerg";
      case 1:
        return "terran";
      case 2:
        return "protoss";
      default:
        return "unknown";
    }
  };

  const playerColors = [
    { name: "Red", id: 0x00, rgb: 0xf40404, hex: "#f40404" },
    { name: "Blue", id: 0x01, rgb: 0x0c48cc, hex: "#0c48cc" },
    { name: "Teal", id: 0x02, rgb: 0x2cb494, hex: "#2cb494" },
    { name: "Purple", id: 0x03, rgb: 0x88409c, hex: "#88409c" },
    { name: "Orange", id: 0x04, rgb: 0xf88c14, hex: "#f88c14" },
    { name: "Brown", id: 0x05, rgb: 0x703014, hex: "#703014" },
    { name: "White", id: 0x06, rgb: 0xcce0d0, hex: "#cce0d0" },
    { name: "Yellow", id: 0x07, rgb: 0xfcfc38, hex: "#fcfc38" },
    { name: "Green", id: 0x08, rgb: 0x088008, hex: "#088008" },
    { name: "Pale Yellow", id: 0x09, rgb: 0xfcfc7c, hex: "#fcfc7c" },
    { name: "Tan", id: 0x0a, rgb: 0xecc4b0, hex: "#ecc4b0" },
    { name: "Aqua", id: 0x0b, rgb: 0x4068d4, hex: "#4068d4" },
    { name: "Pale Green", id: 0x0c, rgb: 0x74a47c, hex: "#74a47c" },
    { name: "Blueish Grey", id: 0x0d, rgb: 0x9090b8, hex: "#9090b8" },
    { name: "Pale Yellow2", id: 0x0e, rgb: 0xfcfc7c, hex: "#fcfc7c" },
    { name: "Cyan", id: 0x0f, rgb: 0x00e4fc, hex: "#00e4fc" },
  ];

  const players = [];
  const getPlayerColor = (p) => {
    if (p < 8) {
      return playerColors[p];
    } else {
      return playerColors[0x6];
    }
  };

  for (let i = 0; i < 8; i++) {
    const offset = 0xa1 + 0x24 * i;
    const type = buf.readUInt8(offset + 0x8);
    if (type === 1 || type === 2) {
      players.push({
        id: buf.readUInt32LE(offset),
        isComputer: type === 1,
        race: raceStr(buf.readUInt8(offset + 0x9)),
        name: cstring(buf.slice(offset + 0xb, offset + 0xb + 0x19)),
        team: buf.readUInt8(offset + 0xa),
        color: getPlayerColor(buf.readUInt32LE(0x251 + i * 4)),
      });
    }
  }
  return {
    isBroodwar,
    gameName,
    mapName,
    gameType,
    gameSubtype,
    players,
    frameCount,
    randomSeed,
    ancillary: {
      campaignId,
      commandByte,
      playerBytes,
      unk1,
      playerName,
      gameFlags,
      mapWidth,
      mapHeight,
      activePlayerCount,
      slotCount,
      gameSpeed,
      gameState,
      unk2,
      tileset,
      replayAutoSave,
      computerPlayerCount,
      unk3,
      unk4,
      unk5,
      unk6,
      victoryCondition,
      resourceType,
      useStandardUnitStats,
      fogOfWarEnabled,
      createInitialUnits,
      useFixedPositions,
      restrictionFlags,
      alliesEnabled,
      teamsEnabled,
      cheatsEnabled,
      tournamentMode,
      victoryConditionValue,
      startingMinerals,
      startingGas,
      unk7,
    },
  };
};

const parseCommands = (origBuf, players) => {
  if (!origBuf) return;
  const buf = origBuf.duplicate();
  const commands = [];
  while (true) {
    if (buf.length < 5) {
      return commands;
    }
    const frame = buf.readUInt32LE(0);
    const frameLength = buf.readUInt8(4);
    const frameEnd = 5 + frameLength;
    if (buf.length < frameEnd) {
      return commands;
    }
    let pos = 5;

    while (pos < frameEnd) {
      const player = buf.readUInt8(pos);
      pos += 1;
      const id = buf.readUInt8(pos);
      pos += 1;
      const len = commandLength(id, buf.shallowSlice(pos));
      if (len === null || pos + len > frameEnd) {
        console.error(frame, player, id, pos);
        continue;
        //@todo error?
        return commands;
      }
      const data = buf.slice(pos, pos + len);
      pos += len;

      if (!commands[frame]) {
        commands[frame] = [];
      }
      commands[frame].push(
        Object.assign(
          {
            frame,
            id,
            player,
            data,
          },
          dataToCommand(id, data)
        )
      );
    }
    buf.consume(frameEnd);
  }
};

const dataToCommand = (id, buf) => {
  switch (id) {
    case CMDS.RIGHT_CLICK.id:
      return {
        x: buf.readUInt16LE(0),
        y: buf.readUInt16LE(2),
        unitTag: buf.readUInt16LE(4),
        unit: buf.readUInt16LE(6),
        queued: buf.readUInt8(8) != 0,
      };

    case CMDS.RIGHT_CLICK_EXT.id: {
      const data = new BufferList();
      data.append(buf.slice(0, 6)).append(buf.slice(8, 11));

      return {
        data,
        id: CMDS.RIGHT_CLICK.id,
        x: buf.readUInt16LE(0),
        y: buf.readUInt16LE(2),
        unitTag: buf.readUInt16LE(4),
        unk: buf.readUInt16LE(6),
        unit: buf.readUInt16LE(8),
        queued: buf.readUInt8(10) != 0,
      };
    }

    case CMDS.SELECT.id:
    case CMDS.SELECTION_ADD.id:
    case CMDS.SELECTION_REMOVE.id: {
      const count = buf.readUInt8(0);
      const unitTags = range(0, count).map((i) => buf.readUInt16LE(1 + i * 2));
      return {
        unitTags,
      };
    }
    case CMDS.SELECT_EXT.id:
    case CMDS.SELECTION_ADD_EXT.id:
    case CMDS.SELECTION_REMOVE_EXT.id: {
      const mapping = {};
      mapping[CMDS.SELECT_EXT.id] = CMDS.SELECT;
      mapping[CMDS.SELECTION_ADD_EXT.id] = CMDS.SELECTION_ADD;
      mapping[CMDS.SELECTION_REMOVE_EXT.id] = CMDS.SELECTION_REMOVE;

      const count = buf.readUInt8(0);
      const unitTags = range(0, count).map((i) => buf.readUInt16LE(1 + i * 4)); //skip 2 bytes in SCR
      const bwUnitTags = new Uint16Array(count);
      unitTags.forEach((val, i) => (bwUnitTags[i] = val));
      const data = new BufferList();
      data.append(buf.slice(0, 1)).append(bwUnitTags);
      return {
        data,
        id: mapping[id].id,
        unitTags,
      };
    }
    case CMDS.HOTKEY.id:
      return {
        hotkeyType: buf.readUInt8(0),
        group: buf.readUInt8(1),
      };
    case CMDS.TRAIN.id:
    case CMDS.UNIT_MORPH.id:
      return {
        unitTypeId: buf.readUInt16LE(0),
      };
    case CMDS.TARGETED_ORDER.id:
      return {
        x: buf.readUInt16LE(0),
        y: buf.readUInt16LE(2),
        unitTag: buf.readUInt16LE(4),
        unitTypeId: buf.readUInt16LE(6),
        order: buf.readUInt8(8),
        queued: buf.readUInt8(9) != 0,
      };
    case CMDS.TARGETED_ORDER_EXT.id:
      const data = new BufferList();
      data.append(buf.slice(0, 6)).append(buf.slice(8, 12));
      return {
        data,
        id: CMDS.TARGETED_ORDER.id,
        x: buf.readUInt16LE(0),
        y: buf.readUInt16LE(2),
        unitTag: buf.readUInt16LE(4),
        unk: buf.readUInt16LE(6),
        unitTypeId: buf.readUInt16LE(8),
        order: buf.readUInt8(10),
        queued: buf.readUInt8(11) != 0,
      };
    case CMDS.BUILD.id:
      return {
        order: buf.readUInt8(0),
        x: buf.readUInt16LE(1),
        y: buf.readUInt16LE(3),
        unitTypeId: buf.readUInt16LE(5),
      };
    case CMDS.STOP.id:
    case CMDS.BURROW.id:
    case CMDS.UNBURROW.id:
    case CMDS.RETURN_CARGO.id:
    case CMDS.HOLD_POSITION.id:
    case CMDS.UNLOAD_ALL.id:
    case CMDS.UNSIEGE.id:
    case CMDS.SIEGE.id:
    case CMDS.CLOAK.id:
    case CMDS.DECLOAK.id:
      return {
        queued: buf.readUInt8(0) != 0,
      };

    case CMDS.MINIMAP_PING.id:
      return {
        x: buf.readUInt16LE(0),
        y: buf.readUInt16LE(2),
      };

    case CMDS.CHAT.id:
      return {
        senderSlot: buf.readUInt8(0),
        //@todo figure out length
        message: cstring(buf.slice(1, 80)),
      };
    case CMDS.CANCEL_TRAIN.id:
      return {
        unitTag: buf.readInt16LE(0),
      };
    case CMDS.UNLOAD.id:
    case CMDS.UNLOAD_EXT.id:
      return {
        id: CMDS.UNLOAD.id,
        unitTag: buf.readInt16LE(0),
      };

    case CMDS.LIFTOFF.id:
      return {
        x: buf.readInt16LE(0),
        y: buf.readInt16LE(2),
      };

    case CMDS.TECH.id:
      return {
        tech: buf.readUInt8(0),
      };
    case CMDS.UPGRADE.id:
      return {
        upgrade: buf.readUInt8(0),
      };
    case CMDS.BUILDING_MORPH.id:
      return {
        unitTypeId: buf.readUInt16LE(0),
      };
    default:
      return {
        buf,
      };
  }
};

const convertReplayTo116 = async (buf) => {
  const replay = await parseReplay(buf);
  // if (replay.version === Version.classic) {
  //   return buf;
  // }
  const bl = new BufferList();
  const alloc = (n, cb) => {
    const b = Buffer.alloc(n);
    cb(b);
    return b;
  };
  const uint32le = (val) => alloc(4, (b) => b.writeUInt32LE(val));
  const uint8 = (val) => alloc(1, (b) => b.writeUInt8(val));

  await writeBlock(bl, uint32le(HeaderMagicClassic), false);
  await writeBlock(bl, replay.rawHeader, true);

  const commands = replay.cmds
    .map((commands, i) => ({
      commands,
      frame: i,
    }))
    .filter(({ commands }) => commands && commands.length >= 0)
    .reduce((cmdBl, { commands, frame }) => {
      cmdBl.append(uint32le(frame));

      const size = commands.reduce((size, { data }) => {
        return size + data.length + 2;
      }, 0);
      cmdBl.append(uint8(size));

      commands.forEach(({ data, player, id }) => {
        cmdBl.append(uint8(player));
        cmdBl.append(uint8(id));
        cmdBl.append(data);
      });

      return cmdBl;
    }, new BufferList());

  // await writeBlock(bl, uint32le(0), false);
  await writeBlock(bl, uint32le(commands.length), false);
  await writeBlock(bl, commands, true);
  const chk = downgradeChk(replay.chk.slice(0));
  await writeBlock(bl, uint32le(chk.byteLength), false);
  await writeBlock(bl, chk, true);

  return bl.slice(0);
};

const writeBlock = async (out, data, compress) => {
  const numChunks = Math.ceil(data.length / MAX_CHUNK_SIZE);
  let checksum = crc32(data.slice(0));
  let outBlockSize = 0;

  out.append(new Uint32Array([checksum]));
  out.append(new Uint32Array([numChunks]));

  for (let i = 0; i < numChunks; i++) {
    const chunk = data.slice(
      i * MAX_CHUNK_SIZE,
      i * MAX_CHUNK_SIZE + Math.min(MAX_CHUNK_SIZE, data.length)
    );
    const chunkOut = compress ? await deflate(chunk) : chunk;
    out.append(new Uint32Array([chunkOut.byteLength]));
    out.append(chunkOut);
    outBlockSize = outBlockSize + chunkOut.byteLength;
  }

  return outBlockSize;
};

module.exports = {
  parseReplay,
  convertReplayTo116,
};
