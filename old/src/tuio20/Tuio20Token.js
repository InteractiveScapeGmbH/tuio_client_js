import {Tuio20Component} from "./Tuio20Component.js";

export class Tuio20Token extends Tuio20Component {
    constructor(startTime, container, tuId, cId, xPos, yPos, angle, xVel, yVel, aVel, mAcc, rAcc){
        super(startTime, container, xPos, yPos, angle, xVel, yVel, aVel, mAcc, rAcc);
        this._tuId = tuId;
        this._cId = cId;
    }

    get tuId(){
        return this._tuId;
    }

    get cId(){
        return this._cId;
    }

    _hasChanged(tuId, cId, xPos, yPos, angle, xVel, yVel, aVel, mAcc, rAcc){
        return !(tuId === this.tuId && cId === this.cId && xPos === this.xPos && yPos === this.yPos && angle === this.angle && xVel === this.xVel && yVel === this.yVel && aVel === this.aVel && mAcc === this.mAcc && rAcc === this.rAcc);
    }

    _update(currentTime, tuId, cId, xPos, yPos, angle, xVel, yVel, aVel, mAcc, rAcc){
        this._updateComponent(currentTime, xPos, yPos, angle, xVel, yVel, aVel, mAcc, rAcc);
        this._tuId = tuId;
        this._cId = cId;
    }
}