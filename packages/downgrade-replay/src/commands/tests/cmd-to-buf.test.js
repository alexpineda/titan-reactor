const BufferList = require("bl/BufferList");
const bufferToCommand = require("../buf-to-cmd");
const commandToBuf = require("../cmd-to-buf");
const { CMDS } = require("../commands");

describe("commandToBuffer", () => {
  test("should write RIGHT_CLICK", () => {
    const id = CMDS.RIGHT_CLICK_EXT.id;
    const bwId = CMDS.RIGHT_CLICK.id;
    const command = {
      x: 0,
      y: 1,
      unitTag: 2,
      unk: 3,
      unit: 4,
      queued: 5,
    };
    const [newId, buf] = commandToBuf(id, command);
    const result = bufferToCommand(bwId, buf);
    expect(result).toMatchObject({
      x: 0,
      y: 1,
      unitTag: 2,
      unit: 4,
      queued: 5,
    });
    expect(newId).toBe(bwId);
  });

  test.each([
    [CMDS.SELECT_EXT, CMDS.SELECT],
    [CMDS.SELECTION_ADD_EXT, CMDS.SELECTION_ADD],
    [CMDS.SELECTION_REMOVE_EXT, CMDS.SELECTION_REMOVE],
  ])("should read $name command", ({ id }, { id: bwId }) => {
    const command = {
      unitTags: [1, 2, 3],
    };

    const [newId, buf] = commandToBuf(id, command);
    const result = bufferToCommand(bwId, buf);
    expect(result).toMatchObject(command);
    expect(newId).toBe(bwId);
  });

  test("should read TARGETED_ORDER_EXT command", () => {
    const id = CMDS.TARGETED_ORDER_EXT.id;
    const bwId = CMDS.TARGETED_ORDER.id;
    const command = {
      x: 0,
      y: 1,
      unitTag: 2,
      unk: 3,
      unitTypeId: 4,
      order: 5,
      queued: 6,
    };
    const [newId, buf] = commandToBuf(id, command);

    const result = bufferToCommand(bwId, buf);
    expect(result).toMatchObject({
      x: 0,
      y: 1,
      unitTag: 2,
      unitTypeId: 4,
      order: 5,
      queued: 6,
    });
    expect(newId).toBe(bwId);
  });

  test.each([
    [CMDS.CANCEL_TRAIN, CMDS.CANCEL_TRAIN],
    [CMDS.UNLOAD_EXT, CMDS.UNLOAD],
  ])("should read $name command", ({ id }, { id: bwId }) => {
    const command = {
      unitTag: 99,
    };
    const [newId, buf] = commandToBuf(id, command);
    const result = bufferToCommand(bwId, buf);
    expect(result).toMatchObject(command);
    expect(newId).toBe(bwId);
  });

  test.each([[CMDS.CANCEL_TRAIN, CMDS.CANCEL_TRAIN]])(
    "should not write $name command if SCR flag is off",
    ({ id }, { id: bwId }) => {
      const command = {
        unitTag: 99,
        data: "alex",
      };
      const [newId, buf] = commandToBuf(id, command, false);
      expect(buf).toEqual(command.data);
      expect(newId).toBe(bwId);
    }
  );

  test("should ignore anything with data", () => {
    const id = 77;
    const data = new BufferList();
    const [newId, CmdData] = commandToBuf(77, {
      data,
    });
    expect(newId).toBe(id);
    expect(data).toBe(data);
  });
});
