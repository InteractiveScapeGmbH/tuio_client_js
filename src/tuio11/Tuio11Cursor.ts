import { Vector } from "vecti";
import { TuioTime } from "../common/TuioTime.js";
import { Tuio11Container } from "./Tuio11Container.js";

export class Tuio11Cursor extends Tuio11Container {
    private _cursorId: number;
    constructor(startTime: TuioTime, sessionId: number, cursorId: number, position: Vector, velocity: Vector, motionAccel: number) {
        super(startTime, sessionId, position, velocity, motionAccel);
        this._cursorId = cursorId;
    }

    public get cursorId(): number {
        return this._cursorId;
    }

    public hasChanged(position: Vector, velocity: Vector, motionAccel: number) {
        return !(position === this.position && velocity === this.velocity && motionAccel === this.motionAccel);
    }

    public update(currentTime: TuioTime, position: Vector, velocity: Vector, motionAccel: number) {
        let isCalculateSpeeds = (position.x !== this.position.x && velocity.x === 0) || (position.y !== this.position.y && velocity.y === 0);
        this.updateContainer(currentTime, position, velocity, motionAccel, isCalculateSpeeds);
    }
}