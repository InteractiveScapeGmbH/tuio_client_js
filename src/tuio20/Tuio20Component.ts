import { Tuio20Point } from "./Tuio20Point.js";
import { TuioState } from "../common/TuioState.js";
import { Vector } from "vecti";
import { TuioTime } from "../common/TuioTime.js";
import { Tuio20Object } from "./Tuio20Object.js";

export class Tuio20Component extends Tuio20Point {
    MAX_PATH_LENGTH = 128;
    _currentTime: TuioTime;
    _container: Tuio20Object;
    _angle: number;
    _velocity: Vector;
    _mVel: number;
    _aVel: number;
    _mAcc: number;
    _rAcc: number;
    _state: TuioState;
    _prevPoints: Tuio20Point[];

    constructor(startTime: TuioTime, container: Tuio20Object, position: Vector, angle: number, velocity: Vector, aVel: number, mAcc: number, rAcc: number) {
        super(startTime, position);
        this._currentTime = startTime;
        this._container = container;
        this._angle = angle;
        this._velocity = velocity;
        this._mVel = velocity.length();
        this._aVel = aVel;
        this._mAcc = mAcc;
        this._rAcc = rAcc;
        this._state = TuioState.Added;
        this._prevPoints = [];
        this._prevPoints.push(new Tuio20Point(startTime, position));
    }

    get currentTime() {
        return this._currentTime;
    }

    get container() {
        return this._container;
    }

    get sessionId() {
        return this.container.sessionId;
    }

    get angle() {
        return this._angle;
    }

    get velocity() {
        return this._velocity;
    }

    get mVel() {
        return this._mVel;
    }

    get aVel() {
        return this._aVel;
    }

    get mAcc() {
        return this._mAcc;
    }

    get rAcc() {
        return this._rAcc;
    }

    get state() {
        return this._state;
    }

    get path() {
        return this._prevPoints;
    }

    _updateComponent(currentTime: TuioTime, position: Vector, angle: number, velocity: Vector, aVel: number, mAcc: number, rAcc: number) {
        this._currentTime = currentTime;
        this.position = position;
        this._angle = angle;
        this._velocity = velocity;
        this._mVel = velocity.length();
        this._aVel = aVel;
        this._mAcc = mAcc;
        this._rAcc = rAcc;
        this._prevPoints.push(new Tuio20Point(currentTime, position));
        if (this._prevPoints.length > this.MAX_PATH_LENGTH) {
            this._prevPoints.shift();
        }
        if (this._mAcc > 0) {
            this._state = TuioState.Accelerating;
        } else if (this._mAcc < 0) {
            this._state = TuioState.Decelerating;
        } else if (this._rAcc !== 0 && this._state === TuioState.Stopped) {
            this._state = TuioState.Rotating;
        }
        this._container._update(currentTime);
    }

    _remove(currentTime: TuioTime) {
        this._currentTime = currentTime;
        this._state = TuioState.Removed;
    }
}