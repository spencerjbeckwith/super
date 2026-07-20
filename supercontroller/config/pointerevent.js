// Polyfill PointerEvent for the jsdom test environment.
//
// jsdom does not implement PointerEvent (or element.setPointerCapture), but every
// real browser does. We only define a stand-in when it is missing so the specs can
// construct and dispatch pointer events. PointerEvent extends MouseEvent, so the shim
// just layers the extra pointer properties on top of the existing MouseEvent.
if (typeof global.PointerEvent === "undefined") {
    class PointerEvent extends MouseEvent {
        constructor(type, params = {}) {
            super(type, params);
            this.pointerId = params.pointerId ?? 0;
            this.pointerType = params.pointerType ?? "mouse";
            this.isPrimary = params.isPrimary ?? false;
            this.width = params.width ?? 1;
            this.height = params.height ?? 1;
            this.pressure = params.pressure ?? 0;
        }
    }
    global.PointerEvent = PointerEvent;
}
