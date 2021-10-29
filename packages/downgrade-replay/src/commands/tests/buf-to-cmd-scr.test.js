const BufferList = require("bl/BufferList");
const { uint8, uint16 } = require("../../util/alloc");
const bufferToSCRCommand = require("../buf-to-cmd-scr");
const { CMDS } = require("../commands");

describe("bufferToSCRCommand", () => {
  test("should read RIGHT_CLICK command", () => {
    const data = new BufferList([
      uint16(0),
      uint16(1),
      uint16(2),
      uint16(3),
      uint16(4),
      uint8(5),
    ]);
    const result = bufferToSCRCommand(CMDS.RIGHT_CLICK_EXT.id, data);
    expect(result).toMatchObject({
      x: 0,
      y: 1,
      unitTag: 2,
      unk: 3,
      unit: 4,
      queued: 5,
    });
  });

  test.each([
    CMDS.SELECT_EXT,
    CMDS.SELECTION_ADD_EXT,
    CMDS.SELECTION_REMOVE_EXT,
  ])("should read $name command", ({ id }) => {
    const data = new BufferList([
      uint8(3),
      uint16(1),
      uint16(0),
      uint16(2),
      uint16(0),
      uint16(3),
      uint16(3),
    ]);
    const result = bufferToSCRCommand(id, data);
    expect(result).toMatchObject({
      unitTags: [1, 2, 3],
    });
  });

  test("should read TARGETED_ORDER_EXT command", () => {
    const data = new BufferList([
      uint16(0),
      uint16(1),
      uint16(2),
      uint16(3),
      uint16(4),
      uint8(5),
      uint8(6),
    ]);
    const result = bufferToSCRCommand(CMDS.TARGETED_ORDER_EXT.id, data);
    expect(result).toMatchObject({
      x: 0,
      y: 1,
      unitTag: 2,
      unk: 3,
      unitTypeId: 4,
      order: 5,
      queued: 6,
    });
  });

  test.each([CMDS.CANCEL_TRAIN, CMDS.UNLOAD_EXT])(
    "should read $name command",
    ({ id }) => {
      const data = new BufferList(uint16(77));
      const result = bufferToSCRCommand(id, data);
      expect(result).toMatchObject({
        unitTag: 77,
      });
    }
  );

  test.each([
    CMDS.RIGHT_CLICK,
    CMDS.SELECT,
    CMDS.SELECTION_ADD,
    CMDS.SELECTION_REMOVE,
    CMDS.TARGETED_ORDER,
    CMDS.UNLOAD,
    CMDS.HOTKEY,
    CMDS.TRAIN,
    CMDS.UNIT_MORPH,
    CMDS.BUILDING_MORPH,
    CMDS.TARGETED_ORDER,
    CMDS.BUILD,
    CMDS.STOP,
    CMDS.BURROW,
    CMDS.UNBURROW,
    CMDS.RETURN_CARGO,
    CMDS.HOLD_POSITION,
    CMDS.UNLOAD_ALL,
    CMDS.UNSIEGE,
    CMDS.CLOAK,
    CMDS.DECLOAK,
    CMDS.MINIMAP_PING,
    CMDS.LIFTOFF,
    CMDS.CHAT,
    CMDS.UNLOAD,
    CMDS.UPGRADE,
    CMDS.TECH,
  ])("should ignore $name command", ({ id }) => {
    const result = bufferToSCRCommand(id);
    expect(result).toBeNull();
  });
});
