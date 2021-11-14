import {Tuio20Point} from "./Tuio20Point.js";
import {TuioState} from "../common/TuioState.js";

export class Tuio20Component extends Tuio20Point {
    MAX_PATH_LENGTH = 128;

    constructor(startTime, container, xPos, yPos, angle, xVel, yVel, aVel, mAcc, rAcc) {
        super(startTime, xPos, yPos);
        this._currentTime = startTime;
        this._container = container;
        this._angle = angle;
        this._xVel = xVel;
        this._yVel = yVel;
        this._mVel = Math.sqrt(xVel * xVel + yVel * yVel);
        this._aVel = aVel;
        this._mAcc = mAcc;
        this._rAcc = rAcc;
        this._state = TuioState.Added;
        this._prevPoints = [];
        this._prevPoints.push(new Tuio20Point(startTime, xPos, yPos));
    }

    get currentTime(){
        return this._currentTime;
    }

    get container(){
        return this._container;
    }

    get sessionId(){
        return this.container.sessionId;
    }

    get angle(){
        return this._angle;
    }

    get xVel(){
        return this._xVel;
    }

    get yVel(){
        return this._yVel;
    }

    get mVel(){
        return this._mVel;
    }

    get aVel(){
        return this._aVel;
    }

    get mAcc(){
        return this._mAcc;
    }

    get rAcc(){
        return this._rAcc;
    }

    get state(){
        return this._state;
    }

    get path(){
        return this._prevPoints;
    }

    _updateComponent(currentTime, xPos, yPos, angle, xVel, yVel, aVel, mAcc, rAcc) {
        this._currentTime = currentTime;
        this._xPos = xPos;
        this._yPos = yPos;
        this._angle = angle;
        this._xVel = xVel;
        this._yVel = yVel;
        this._mVel = Math.sqrt(xVel * xVel + yVel * yVel);
        this._aVel = aVel;
        this._mAcc = mAcc;
        this._rAcc = rAcc;
        this._prevPoints.push(new Tuio20Point(currentTime, xPos, yPos));
        if(this._prevPoints.length > this.MAX_PATH_LENGTH){
            this._prevPoints.shift();
        }
        if(this._mAcc > 0){
            this._state = TuioState.Accelerating;
        } else if (this._mAcc < 0) {
            this._state = TuioState.Decelerating;
        } else if (this._rAcc !== 0 && this._state === TuioState.Stopped){
            this._state = TuioState.Rotating;
        }
        this._container._update(currentTime);
    }

    _remove(currentTime){
        this._currentTime = currentTime;
        this._state = TuioState.Removed;
    }
}