import {
  clearBodyRegistry,
  getBodyPosition,
  registerBody,
} from "./body-registry";

describe("body registry", () => {
  beforeEach(() => {
    clearBodyRegistry();
  });

  it("returns null for unknown bodies", () => {
    expect(getBodyPosition("nope")).toBeNull();
  });

  it("reads the live position through the registered getter", () => {
    const position = { x: 1, y: 2, z: 3 };
    registerBody("a", () => position);
    expect(getBodyPosition("a")).toEqual({ x: 1, y: 2, z: 3 });
    position.x = 9;
    expect(getBodyPosition("a")?.x).toBe(9);
  });

  it("unregisters via the returned disposer", () => {
    const dispose = registerBody("a", () => ({ x: 0, y: 0, z: 0 }));
    dispose();
    expect(getBodyPosition("a")).toBeNull();
  });

  it("does not let a stale disposer remove a newer registration", () => {
    const stale = registerBody("a", () => ({ x: 0, y: 0, z: 0 }));
    registerBody("a", () => ({ x: 5, y: 0, z: 0 }));
    stale();
    expect(getBodyPosition("a")?.x).toBe(5);
  });
});
