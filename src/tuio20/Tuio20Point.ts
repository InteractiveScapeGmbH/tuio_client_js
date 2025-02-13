import { Vector } from "vecti";
import { TuioTime } from "../common/TuioTime";

export class Tuio20Point {

    private _startTime: TuioTime;
    private _position: Vector;

    constructor(startTime: TuioTime, position: Vector) {
        this._startTime = startTime;
        this._position = position;
    }

    public get startTime(): TuioTime {
        return this._startTime;
    }

    public get position(): Vector {
        return this._position;
    }

    protected set position(position: Vector) {
        this._position = position;
    }
}