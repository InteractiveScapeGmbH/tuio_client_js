import { Tuio11Point } from "./Tuio11Point.js";
import { TuioTime } from "../common/TuioTime.js";
import { Vector } from "vecti";
import { TuioState } from "../common/TuioState.js";

export class Tuio11Container extends Tuio11Point {
    MAX_PATH_LENGTH = 128;

    private _currentTime: TuioTime;
    private _sessionId: number;
    private _velocity: Vector;
    private _motionSpeed: number;
    private _motionAccel: number;
    private _state: TuioState;
    private _prevPoints: Tuio11Point[];

    constructor(startTime: TuioTime, sessionId: number, position: Vector, velocity: Vector, motionAccel: number) {
        super(startTime, position);
        this._currentTime = startTime;
        this._sessionId = sessionId;
        this._velocity = velocity;
        this._motionSpeed = velocity.length();
        this._motionAccel = motionAccel;
        this._state = TuioState.Added;
        this._prevPoints = [];
        this._prevPoints.push(new Tuio11Point(startTime, position));
    }

    public get currentTime(): TuioTime {
        return this._currentTime;
    }

    public get sessionId(): number {
        return this._sessionId;
    }

    public get velocity(): Vector {
        return this._velocity;
    }

    public get motionSpeed(): number {
        return this._motionSpeed;
    }

    public get motionAccel(): number {
        return this._motionAccel;
    }

    public get state(): TuioState {
        return this._state;
    }

    protected set state(state: TuioState) {
        this._state = state;
    }

    public get path(): Tuio11Point[] {
        return this._prevPoints
    }

    protected updateContainer(currentTime: TuioTime, position: Vector, velocity: Vector, motionAccel: number, isCalculateSpeeds: boolean) {
        let lastPoint = this.path[this.path.length - 1];
        this.position = position;
        if (isCalculateSpeeds) {
            const dt = currentTime.subtract(lastPoint.startTime).getTotalMilliseconds() / 1000.0;
            const deltaPosition = this.position.subtract(lastPoint.position);
            let dist = deltaPosition.length();
            let lastMotionSpeed = this.motionSpeed;
            this._velocity = deltaPosition.divide(dt);
            this._motionSpeed = dist / dt;
            this._motionAccel = (this.motionSpeed - lastMotionSpeed) / dt;
        } else {
            this._velocity = velocity;
            this._motionSpeed = this._velocity.length();
            this._motionAccel = motionAccel;
        }

        this._currentTime = currentTime;
        this._prevPoints.push(new Tuio11Point(currentTime, position));
        if (this._prevPoints.length > this.MAX_PATH_LENGTH) {
            this._prevPoints.shift();
        }

        if (this._motionAccel > 0) {
            this._state = TuioState.Accelerating;
        } else if (this._motionAccel < 0) {
            this._state = TuioState.Decelerating;
        } else {
            this._state = TuioState.Stopped;
        }
    }

    public remove(currentTime: TuioTime) {
        this._currentTime = currentTime;
        this._state = TuioState.Removed;
    }
}