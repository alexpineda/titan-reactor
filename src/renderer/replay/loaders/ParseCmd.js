import { ordersById } from "../../../common/bwdat/orders";

const unitTag = (uint16) => uint16 & 0x7ff;
const unitTagIsValid = (uint16) => uint16 != 0xffff;
const unitTagRecycle = (uint16) => uint16 >> 12;
const hotkeyTypes = {
  0x00: "Assign",
  0x01: "Select",
  0x02: "Add",
};

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
