import {Tuio20Component} from "./Tuio20Component.js";

export class Tuio20Bounds extends Tuio20Component {
    constructor(startTime, container, xPos, yPos, angle, width, height, area, xVel, yVel, aVel, mAcc, rAcc){
        super(startTime, container, xPos, yPos, angle, xVel, yVel, aVel, mAcc, rAcc);
        this._width = width;
        this._height = height;
        this._area = area;
    }

    get width(){
        return this._width;
    }

    get height(){
        return this._height;
    }

    get area(){
        return this._area;
    }

    _hasChanged(xPos, yPos, angle, width, height, area, xVel, yVel, aVel, mAcc, rAcc){
        return !(xPos === this.xPos && yPos === this.yPos && angle === this.angle && width === this.width && height === this.height && area === this.area && xVel === this.xVel && yVel === this.yVel && aVel === this.aVel && mAcc === this.mAcc && rAcc === this.rAcc);
    }

    _update(currentTime, xPos, yPos, angle, width, height, area, xVel, yVel, aVel, mAcc, rAcc){
        this._updateComponent(currentTime, xPos, yPos, angle, xVel, yVel, aVel, mAcc, rAcc);
        this._width = width;
        this._height = height;
        this._area = area;
    }
}