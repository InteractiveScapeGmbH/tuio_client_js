import { Vector } from "vecti";
import { TuioTime } from "../common/TuioTime.js";
import { Tuio20Component } from "./Tuio20Component.js";
import { Tuio20Object } from "./Tuio20Object.js";

export class Tuio20Pointer extends Tuio20Component {
    _tuId: number;
    _cId: number;
    _shear: number;
    _radius: number;
    _press: number;
    _pVel: number;
    _pAcc: number;

    constructor(startTime: TuioTime, container: Tuio20Object, tuId: number, cId: number, position: Vector, angle: number, shear: number, radius: number, press: number, velocity: Vector, pVel: number, mAcc: number, pAcc: number) {
        super(startTime, container, position, angle, velocity, 0, mAcc, 0);
        this._tuId = tuId;
        this._cId = cId;
        this._shear = shear;
        this._radius = radius;
        this._press = press;
        this._pVel = pVel;
        this._pAcc = pAcc;
    }

    get tuId() {
        return this._tuId;
    }

    get cId() {
        return this._cId;
    }

    get shear() {
        return this._shear;
    }

    get radius() {
        return this._radius;
    }

    get press() {
        return this._press;
    }

    get pVel() {
        return this._pVel;
    }

    get pAcc() {
        return this._pAcc;
    }

    _hasChanged(tuId: number, cId: number, position: Vector, angle: number, shear: number, radius: number, press: number, velocity: Vector, pVel: number, mAcc: number, pAcc: number) {
        return !(tuId === this.tuId && cId === this.cId && position === this.position && angle === this.angle && shear === this.shear && radius === this.radius && press === this.press && velocity === this.velocity && pVel === this.pVel && mAcc === this.mAcc && pAcc === this.pAcc);
    }

    _update(currentTime: TuioTime, tuId: number, cId: number, position: Vector, angle: number, shear: number, radius: number, press: number, velocity: Vector, pVel: number, mAcc: any, pAcc: number) {
        this._updateComponent(currentTime, position, angle, velocity, 0, mAcc, 0);
        this._tuId = tuId;
        this._cId = cId;
        this._shear = shear;
        this._radius = radius;
        this._press = press;
        this._pVel = pVel;
        this._pAcc = pAcc;
    }
}