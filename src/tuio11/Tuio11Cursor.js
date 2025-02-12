import {Tuio11Container} from "./Tuio11Container.js";

export class Tuio11Cursor extends Tuio11Container {
    constructor(startTime, sessionId, cursorId, xPos, yPos, xSpeed, ySpeed, motionAccel) {
        super(startTime, sessionId, xPos, yPos, xSpeed, ySpeed, motionAccel);
        this._cursorId = cursorId;
    }

    get cursorId(){
        return this._cursorId;
    }

    _hasChanged(currentTime, xPos, yPos, xSpeed, ySpeed, motionAccel){
        return !(xPos === this.xPos && yPos === this.yPos && xSpeed === this.xSpeed && ySpeed === this.ySpeed && motionAccel === this.motionAccel);
    }

    _update(currentTime, xPos, yPos, xSpeed, ySpeed, motionAccel){
        let isCalculateSpeeds = (xPos !== this.xPos && xSpeed === 0) || (yPos !== this.yPos && ySpeed === 0);
        this._updateContainer(currentTime, xPos, yPos, xSpeed, ySpeed, motionAccel, isCalculateSpeeds);
    }
}