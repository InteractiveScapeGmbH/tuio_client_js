import {Tuio11Point} from "./Tuio11Point.js";
import {TuioState} from "../common/TuioState.js";

export class Tuio11Container extends Tuio11Point {
    MAX_PATH_LENGTH = 128;

    constructor(startTime, sessionId, xPos, yPos, xSpeed, ySpeed, motionAccel) {
        super(startTime, xPos, yPos);
        this._currentTime = startTime;
        this._sessionId = sessionId;
        this._xSpeed = xSpeed;
        this._ySpeed = ySpeed;
        this._motionSpeed = Math.sqrt(xSpeed * xSpeed + ySpeed * ySpeed);
        this._motionAccel = motionAccel;
        this._state = TuioState.Added;
        this._prevPoints = [];
        this._prevPoints.push(new Tuio11Point(startTime, xPos, yPos));
    }

    get currentTime() {
        return this._currentTime;
    }

    get sessionId() {
        return this._sessionId;
    }

    get xSpeed() {
        return this._xSpeed;
    }

    get ySpeed()
    {
        return this._ySpeed;
    }

    get motionSpeed()
    {
        return this._motionSpeed;
    }

    get motionAccel()
    {
        return this._motionAccel;
    }

    get state()
    {
        return this._state;
    }

    get path()
    {
        return this._prevPoints
    }

    _updateContainer(currentTime, xPos, yPos, xSpeed, ySpeed, motionAccel, isCalculateSpeeds) {
        let lastPoint = this.path[this.path.length - 1];
        this._xPos = xPos;
        this._yPos = yPos;
        if(isCalculateSpeeds){
            let dt = currentTime.subtract(lastPoint.startTime).getTotalMilliseconds()/1000.0;
            let dx = this.xPos - lastPoint.xPos;
            let dy = this.yPos - lastPoint.yPos;
            let dist = Math.sqrt(dx * dx + dy * dy);
            let lastMotionSpeed = this.motionSpeed;
            this._xSpeed = dx / dt;
            this._ySpeed = dy / dt;
            this._motionSpeed = dist / dt;
            this._motionAccel = (this.motionSpeed - lastMotionSpeed) / dt;
        } else {
            this._xSpeed = xSpeed;
            this._ySpeed = ySpeed;
            this._motionSpeed = Math.sqrt(xSpeed * xSpeed + ySpeed * ySpeed);
            this._motionAccel = motionAccel;
        }

        this._currentTime = currentTime;
        this._prevPoints.push(new Tuio11Point(currentTime, xPos, yPos));
        if(this._prevPoints.length > this.MAX_PATH_LENGTH){
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

    _remove(currentTime){
        this._currentTime = currentTime;
        this._state = TuioState.Removed;
    }
}