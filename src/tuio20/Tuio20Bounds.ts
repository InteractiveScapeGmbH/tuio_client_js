import { Vector } from "vecti";
import { TuioTime } from "../common/TuioTime.js";
import { Tuio20Component } from "./Tuio20Component.js";
import { Tuio20Object } from "./Tuio20Object.js";

export class Tuio20Bounds extends Tuio20Component {
    _size: Vector;
    _area: number;

    constructor(startTime: TuioTime, container: Tuio20Object, position: Vector, angle: number, size: Vector, area: number, velocity: Vector, aVel: number, mAcc: number, rAcc: number) {
        super(startTime, container, position, angle, velocity, aVel, mAcc, rAcc);
        this._size = size;
        this._area = area;
    }

    get size(): Vector {
        return this._size;
    }

    get area() {
        return this._area;
    }

    _hasChanged(position: Vector, angle: number, size: Vector, area: number, velocity: Vector, aVel: number, mAcc: number, rAcc: number) {
        return !(position === this.position && angle === this.angle && size === this.size && area === this.area && velocity === this.velocity && aVel === this.aVel && mAcc === this.mAcc && rAcc === this.rAcc);
    }

    _update(currentTime: TuioTime, position: Vector, angle: number, size: Vector, area: number, velocity: Vector, aVel: number, mAcc: number, rAcc: number) {
        this._updateComponent(currentTime, position, angle, velocity, aVel, mAcc, rAcc);
        this._size = size;
        this._area = area;
    }
}