import { Vector } from "vecti";
import { TuioTime } from "../common/TuioTime";
import { Tuio11Point } from "./TuioPoint";
import { TuioState } from "../common/TuioState";

export abstract class Tuio11Container extends Tuio11Point {
    private _currentTime: TuioTime;
    private _sessionId: number;
    private _velocity: Vector;
    private _speed: number;
    private _acceleration: number;
    private _state: TuioState;

    constructor(startTime: TuioTime, sessionId: number, position: Vector, velocity: Vector, acceleration: number) {
        super(startTime, position);
        this._currentTime = startTime;
        this._sessionId = sessionId;
        this._velocity = velocity;
        this._speed = velocity.length();
        this._acceleration = 0;
        this._state = TuioState.Idle;
    }

    public get currentTime(): TuioTime {
        return this._currentTime;
    }

    protected set currentTime(time: TuioTime) {
        this._currentTime = time;
    }

    public get sessionId(): number {
        return this._sessionId;
    }

    public get velocity(): Vector {
        return this._velocity;
    }

    protected set velocity(velocity: Vector) {
        this._velocity = velocity;
    }

    public get speed(): number {
        return this._speed;
    }

    protected set speed(speed: number) {
        this._speed = speed;
    }

    public get acceleration(): number {
        return this._acceleration;
    }

    protected set acceleration(acceleration: number) {
        this._acceleration = acceleration;
    }

    public get state(): TuioState {
        return this._state;
    }

    protected set state(state: TuioState) {
        this._state = state;
    }

    public updateContainer(currentTime: TuioTime, position: Vector, velocity: Vector, acceleration: number) {
        this.position = position;
        this.velocity = velocity;
        this.speed = velocity.length();
        this.acceleration = acceleration;

        if (this.acceleration > 0) {
            this.state = TuioState.Accelerating;
        }
        else if (this.acceleration < 0) {
            this.state = TuioState.Decelerating;
        } else {
            this.state = TuioState.Stopped;
        }
    }

    public remove() {
        this.state = TuioState.Removed;
    }
}