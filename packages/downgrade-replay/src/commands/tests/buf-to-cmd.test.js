const BufferList = require("bl/BufferList");
const { uint8, uint16 } = require("../../util/alloc");
const bufferToCommand = require("../buf-to-cmd");
const { CMDS } = require("../commands");

describe("bufferToCommand", () => {
  test("should read RIGHT_CLICK command", () => {
    const data = new BufferList([
      uint16(0),
      uint16(1),
      uint16(2),
      uint16(3),
      uint8(4),
    ]);
    const result = bufferToCommand(CMDS.RIGHT_CLICK.id, data);
    expect(result).toMatchObject({
      x: 0,
      y: 1,
      unitTag: 2,
      unit: 3,
      queued: 4,
    });
  });

  test.each([CMDS.SELECT, CMDS.SELECTION_ADD, CMDS.SELECTION_REMOVE])(
    "should read $name command",
    ({ id }) => {
      const data = new BufferList([uint8(3), uint16(0), uint16(1), uint16(2)]);
      const result = bufferToCommand(id, data);
      expect(result).toMatchObject({
        unitTags: [0, 1, 2],
      });
    }
  );

  test("should read HOTKEY command", () => {
    const data = new BufferList([uint8(44), uint8(77)]);
    const result = bufferToCommand(CMDS.HOTKEY.id, data);
    expect(result).toMatchObject({
      hotkeyType: 44,
      group: 77,
    });
  });

  test.each([CMDS.TRAIN, CMDS.UNIT_MORPH, CMDS.BUILDING_MORPH])(
    "should read $name command",
    ({ id }) => {
      const data = new BufferList(uint16(77));
      const result = bufferToCommand(id, data);
      expect(result).toMatchObject({
        unitTypeId: 77,
      });
    }
  );

  test("should read TARGETED_ORDER command", () => {
    const data = new BufferList([
      uint16(0),
      uint16(1),
      uint16(2),
      uint16(3),
      uint8(4),
      uint8(5),
    ]);
    const result = bufferToCommand(CMDS.TARGETED_ORDER.id, data);
    expect(result).toMatchObject({
      x: 0,
      y: 1,
      unitTag: 2,
      unitTypeId: 3,
      order: 4,
      queued: 5,
    });
  });

  test("should read BUILD command", () => {
    const data = new BufferList([uint8(0), uint16(1), uint16(2), uint16(3)]);
    const result = bufferToCommand(CMDS.BUILD.id, data);
    expect(result).toMatchObject({
      order: 0,
      x: 1,
      y: 2,
      unitTypeId: 3,
    });
  });

  test.each([
    CMDS.STOP,
    CMDS.BURROW,
    CMDS.UNBURROW,
    CMDS.RETURN_CARGO,
    CMDS.HOLD_POSITION,
    CMDS.UNLOAD_ALL,
    CMDS.UNSIEGE,
    CMDS.CLOAK,
    CMDS.DECLOAK,
  ])("should read $name command", ({ id }) => {
    const data = new BufferList(uint8(77));
    const result = bufferToCommand(id, data);
    expect(result).toMatchObject({
      queued: 77,
    });
  });

  test.each([CMDS.MINIMAP_PING, CMDS.LIFTOFF])(
    "should read $name command",
    ({ id }) => {
      const data = new BufferList([uint16(77), uint16(99)]);
      const result = bufferToCommand(id, data);
      expect(result).toMatchObject({
        x: 77,
        y: 99,
      });
    }
  );

  //@todo test cstring message
  test("should read CHAT command", () => {
    const data = new BufferList([uint8(77), Buffer.alloc(79).fill("A")]);
    const result = bufferToCommand(CMDS.CHAT.id, data);
    expect(result).toMatchObject({
      senderSlot: 77,
      message: "A".repeat(79),
    });
  });

  test.each([CMDS.CANCEL_TRAIN, CMDS.UNLOAD])(
    "should read $name command",
    ({ id }) => {
      const data = new BufferList([uint16(77)]);
      const result = bufferToCommand(id, data);
      expect(result).toMatchObject({
        unitTag: 77,
      });
    }
  );

  test.each([CMDS.UPGRADE, CMDS.TECH, CMDS.LEAVE_GAME])(
    "should read $name command",
    ({ id }) => {
      const data = new BufferList([uint8(77)]);
      const result = bufferToCommand(id, data);
      expect(result).toMatchObject({
        value: 77,
      });
    }
  );

  test.each([
    CMDS.RIGHT_CLICK_EXT,
    CMDS.SELECT_EXT,
    CMDS.SELECTION_ADD_EXT,
    CMDS.SELECTION_REMOVE_EXT,
    CMDS.TARGETED_ORDER_EXT,
    CMDS.UNLOAD_EXT,
  ])("should ignore $name command", ({ id }) => {
    const result = bufferToCommand(id);
    expect(result).toBeNull();
  });
});
