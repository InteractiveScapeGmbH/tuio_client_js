import { Vector } from "vecti";
import { TuioTime } from "../common/TuioTime.js";
import { Tuio20Component } from "./Tuio20Component.js";
import { Tuio20Object } from "./Tuio20Object.js";

export class Tuio20Token extends Tuio20Component {
    _tuId: number;
    _cId: number;
    constructor(startTime: TuioTime, container: Tuio20Object, tuId: number, cId: number, position: Vector, angle: number, velocity: Vector, aVel: number, mAcc: number, rAcc: number) {
        super(startTime, container, position, angle, velocity, aVel, mAcc, rAcc);
        this._tuId = tuId;
        this._cId = cId;
    }

    get tuId() {
        return this._tuId;
    }

    get cId() {
        return this._cId;
    }

    _hasChanged(tuId: number, cId: number, position: Vector, angle: number, velocity: Vector, aVel: number, mAcc: number, rAcc: number) {
        return !(tuId === this.tuId && cId === this.cId && position === this.position && angle === this.angle && velocity === this.velocity && aVel === this.aVel && mAcc === this.mAcc && rAcc === this.rAcc);
    }

    _update(currentTime: TuioTime, tuId: number, cId: number, position: Vector, angle: number, velocity: Vector, aVel: number, mAcc: number, rAcc: number) {
        this._updateComponent(currentTime, position, angle, velocity, aVel, mAcc, rAcc);
        this._tuId = tuId;
        this._cId = cId;
    }
}