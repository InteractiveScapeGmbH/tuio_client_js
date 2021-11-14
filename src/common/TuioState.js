export class TuioState {
    static Added = new TuioState('Added');
    static Accelerating = new TuioState('Accelerating');
    static Decelerating = new TuioState('Decelerating');
    static Stopped = new TuioState('Stopped');
    static Removed = new TuioState('Removed');
    static Rotating = new TuioState('Rotating');
    static Idle = new TuioState('Idle');

    constructor(name) {
        this.name = name;
    }

    toString() {
        return `TuioState.${this.name}`;
    }
}