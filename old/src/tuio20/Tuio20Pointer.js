import {Tuio20Component} from "./Tuio20Component.js";

export class Tuio20Pointer extends Tuio20Component {
    constructor(startTime, container, tuId, cId, xPos, yPos, angle, shear, radius, press, xVel, yVel, pVel, mAcc, pAcc){
        super(startTime, container, xPos, yPos, angle, xVel, yVel, 0, mAcc, 0);
        this._tuId = tuId;
        this._cId = cId;
        this._shear = shear;
        this._radius = radius;
        this._press = press;
        this._pVel = pVel;
        this._pAcc = pAcc;
    }

    get tuId(){
        return this._tuId;
    }

    get cId(){
        return this._cId;
    }

    get shear(){
        return this._shear;
    }

    get radius(){
        return this._radius;
    }

    get press(){
        return this._press;
    }

    get pVel(){
        return this._pVel;
    }

    get pAcc(){
        return this._pAcc;
    }

    _hasChanged(tuId, cId, xPos, yPos, angle, shear, radius, press, xVel, yVel, pVel, mAcc, pAcc){
        return !(tuId === this.tuId && cId === this.cId && xPos === this.xPos && yPos === this.yPos && angle === this.angle && shear === this.shear && radius === this.radius && press === this.press && xVel === this.xVel && yVel === this.yVel && pVel === this.pVel && mAcc === this.mAcc && pAcc === this.pAcc);
    }

    _update(currentTime, tuId, cId, xPos, yPos, angle, shear, radius, press, xVel, yVel, pVel, mAcc, pAcc){
        this._updateComponent(currentTime, xPos, yPos, angle, xVel, yVel, 0, mAcc, 0);
        this._tuId = tuId;
        this._cId = cId;
        this._shear = shear;
        this._radius = radius;
        this._press = press;
        this._pVel = pVel;
        this._pAcc = pAcc;
    }
}