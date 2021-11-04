import { Apm, MIN_APM_CALCULATION_FRAME } from "../apm";

describe("apm", () => {
  it("should not calculate any apm if game frame < MIN_APM_CALCULATION_FRAME", () => {
    const players = [{ id: 0 }];
    const apm = new Apm(players);
    const cmds = [
      {
        player: 0,
      },
    ];
    apm.update(cmds, MIN_APM_CALCULATION_FRAME - 1);
    expect(apm.actions[0]).toBe(1);
    expect(apm.apm[0]).toBe(0);
  });

  it("should calculate apm properly when below a minute of play time", () => {
    const players = [{ id: 0 }, { id: 3 }];
    const apm = new Apm(players);

    const cmds = [];
    // @todo have seperate number of actions per player
    // in order to confirm players are calculated separately and correctly
    for (let i = 0; i < 1000; i++) {
      cmds.push({ player: 0 });
      cmds.push({ player: 3 });
    }

    apm.update(cmds, MIN_APM_CALCULATION_FRAME);
    apm.update(cmds, MIN_APM_CALCULATION_FRAME * 2);

    // 2000 actions, 201 game frames * 42ms = 8442ms / 60000 = 0.14min

    const expectedApm = Math.floor(2000 / 0.14);
    expect(apm.actions[0]).toBe(2000);
    expect(apm.actions[3]).toBe(2000);
    expect(apm.apm[0]).toBe(expectedApm);
    expect(apm.apm[3]).toBe(expectedApm);
  });

  it("should calculate apm properly when above a minute of play time", () => {
    const players = [{ id: 0 }, { id: 3 }];
    const apm = new Apm(players);

    const cmds = [];
    for (let i = 0; i < 1000; i++) {
      cmds.push({ player: 0 });
      cmds.push({ player: 3 });
    }

    apm.update(cmds, 1000);
    apm.update(cmds, 2000);

    // 2000 actions, 2000 game frames * 42ms, 84_000ms / 60000 = 1.4m

    const expectedApm = Math.floor(2000 / 1.4);
    expect(apm.actions[0]).toBe(2000);
    expect(apm.actions[3]).toBe(2000);
    expect(apm.apm[0]).toBe(expectedApm);
    expect(apm.apm[3]).toBe(expectedApm);
  });
});
