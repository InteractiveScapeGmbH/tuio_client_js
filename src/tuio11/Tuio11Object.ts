import { Tuio11Container } from "./Tuio11Container.js";
import { TuioState } from "../common/TuioState.js";
import { Vector } from "vecti";
import { TuioTime } from "../common/TuioTime.js";

export class Tuio11Object extends Tuio11Container {
    private _symbolId: number;
    private _angle: number;
    private _rotationSpeed: number;
    private _rotationAccel: number;

    constructor(startTime: TuioTime, sessionId: number, symbolId: number, position: Vector, angle: number, velocity: Vector, rotationSpeed: number, motionAccel: number, rotationAccel: number) {
        super(startTime, sessionId, position, velocity, motionAccel);
        this._symbolId = symbolId;
        this._angle = angle;
        this._rotationSpeed = rotationSpeed;
        this._rotationAccel = rotationAccel;
    }

    public get symbolId(): number {
        return this._symbolId;
    }

    public get angle(): number {
        return this._angle;
    }

    public get rotationSpeed(): number {
        return this._rotationSpeed;
    }

    public get rotationAccel(): number {
        return this._rotationAccel;
    }

    private hasChanged(currentTime: TuioTime, position: Vector, angle: number, velocity: Vector, rotationSpeed: number, motionAccel: number, rotationAccel: number) {
        return !(position === this.position && angle === this.angle && velocity === this.velocity && rotationSpeed === this.rotationSpeed && motionAccel === this.motionAccel && rotationAccel === this.rotationAccel);
    }

    private update(currentTime: TuioTime, position: Vector, angle: number, velocity: Vector, rotationSpeed: number, motionAccel: number, rotationAccel: number) {
        let lastPoint = this.path[this.path.length - 1];
        let isCalculateSpeeds = (position.x !== this.position.x && velocity.x === 0) || (position.y !== this.position.y && velocity.y === 0);
        this.updateContainer(currentTime, position, velocity, motionAccel, isCalculateSpeeds);

        let isCalculateRotation = (angle !== this.angle && rotationSpeed === 0);
        if (isCalculateRotation) {
            let dt = currentTime.subtract(lastPoint.startTime).getTotalMilliseconds() / 1000.0;
            let lastAngle = this.angle;
            let lastRotationSpeed = this.rotationSpeed;
            let da = (angle - lastAngle) / (2 * Math.PI);
            if (da > 0.5) {
                da -= 1;
            } else if (da <= -0.5) {
                da += 1;
            }
            this._rotationSpeed = da / dt;
            this._rotationAccel = (this.rotationSpeed - lastRotationSpeed) / dt;
        } else {
            this._rotationSpeed = rotationSpeed;
            this._rotationAccel = rotationAccel;
        }
        this._angle = angle;

        if (this.state !== TuioState.Stopped && this.rotationAccel !== 0) {
            this.state = TuioState.Rotating;
        }
    }
}