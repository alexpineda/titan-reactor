const { CMDS } = require("./commands");
const range = require("../util/range");

const bufToSCRCommand = (id, data) => {
  switch (id) {
    case CMDS.RIGHT_CLICK_EXT.id: {
      return {
        x: data.readUInt16LE(0),
        y: data.readUInt16LE(2),
        unitTag: data.readUInt16LE(4),
        unk: data.readUInt16LE(6),
        unit: data.readUInt16LE(8),
        queued: data.readUInt8(10),
      };
    }
    case CMDS.SELECT_EXT.id:
    case CMDS.SELECTION_ADD_EXT.id:
    case CMDS.SELECTION_REMOVE_EXT.id: {
      const count = data.readUInt8(0);
      const unitTags = range(0, count).map((i) => data.readUInt16LE(1 + i * 4)); //skip 2 bytes in SCR

      return {
        unitTags,
      };
    }
    case CMDS.TARGETED_ORDER_EXT.id: {
      const unitTag = data.readUInt16LE(4);

      return {
        x: data.readUInt16LE(0),
        y: data.readUInt16LE(2),
        unitTag,
        unk: data.readUInt16LE(6),
        unitTypeId: data.readUInt16LE(8),
        order: data.readUInt8(10),
        queued: data.readUInt8(11),
      };
    }
    case CMDS.UNLOAD_EXT.id: {
      const unitTag = data.readUInt16LE(0);
      return {
        unitTag,
      };
    }
    default:
      // ignore remainder
      return {};
  }
};

module.exports = bufToSCRCommand;
