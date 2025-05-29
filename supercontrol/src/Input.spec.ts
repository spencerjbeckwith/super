import { Input, InputError } from "./Input";
import expect from "expect";

type TestInputType = "one" | "two" | "three";

describe("Input", () => {

    it("initializes all inputs to the initial value", () => {
        const i = new Input(["one", "two", "three"]);
        expect(i.pressed.one).toBe(false);
        expect(i.pressed.two).toBe(false);
        expect(i.pressed.three).toBe(false);
        expect(i.held.one).toBe(false);
        expect(i.held.two).toBe(false);
        expect(i.held.three).toBe(false);
        expect(i.released.one).toBe(false);
        expect(i.released.two).toBe(false);
        expect(i.released.three).toBe(false);
        expect(i.idle.one).toBe(true);
        expect(i.idle.two).toBe(true);
        expect(i.idle.three).toBe(true);
    });

    it("calls register for each input identifier", () => {
        // This should be done as a closure, since trying to add registered as a property to the test class won't be possible.
        // It would have to be initialized before register() is called, but it's called in the constructor, and super() must be before any this initializations.
        const registered: string[] = [];
        class TestInputRegister extends Input<"one" | "two" | "three"> {
            register(input: TestInputType) {
                registered.push(input);
            }
        }
        const i = new TestInputRegister(["one", "two", "three"]);
        expect(registered).toContain("one");
        expect(registered).toContain("two");
        expect(registered).toContain("three");
    });

    it("moves pressed inputs to the held state on update()", () => {
        const i = new Input(["one", "two", "three"]);
        i.pressed.one = true;
        i.pressed.three = true;
        i.update();
        expect(i.pressed.one).toBe(false);
        expect(i.pressed.two).toBe(false);
        expect(i.pressed.three).toBe(false);
        expect(i.held.one).toBe(true);
        expect(i.held.two).toBe(false);
        expect(i.held.three).toBe(true);
    });

    it("moves released inputs to the idle state on update()", () => {
        const i = new Input(["one", "two", "three"]);
        i.released.one = true;
        i.released.two = true;
        i.update();
        expect(i.released.one).toBe(false);
        expect(i.released.two).toBe(false);
        expect(i.released.three).toBe(false);
        expect(i.idle.one).toBe(true);
        expect(i.idle.two).toBe(true);
        expect(i.idle.three).toBe(true); // Idle from the beginning
    });
});