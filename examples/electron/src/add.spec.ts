import { add } from "./add";
import { expect } from "expect";

it("adds correctly", () => {
    expect(add(2, 7)).toBe(9);
});