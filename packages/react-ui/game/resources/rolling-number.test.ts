import RollingNumber from "./rolling-number";

describe("Rolling Number", () => {
  test("rolling number should default to constructor values", () => {
    const rn = new RollingNumber(77);

    expect(rn.rollingValue).toBe(77);
  });

  test("rolling number should not update until value is met", () => {
    const rn = new RollingNumber(77);

    rn.start(99);
    const result = rn.update(0);
    expect(result).toBe(false);

    expect(rn.update(rn.upSpeed)).toBe(true);
    expect(rn.rollingValue).toBe(78);

    expect(rn.update(10)).toBe(false);
    expect(rn.rollingValue).toBe(78);

    expect(rn.update(rn.upSpeed)).toBe(true);
    expect(rn.rollingValue).toBe(79);

    rn.start(77);
    expect(rn.update(rn.downSpeed)).toBe(true);
    expect(rn.rollingValue).toBe(78);

    expect(rn.update(10)).toBe(false);
    expect(rn.rollingValue).toBe(78);

    expect(rn.update(rn.downSpeed)).toBe(true);
    expect(rn.rollingValue).toBe(77);

    expect(rn.update(rn.downSpeed)).toBe(false);
  });
});
