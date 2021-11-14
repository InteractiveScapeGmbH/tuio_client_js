export class Tuio20Point {
    constructor(startTime, xPos, yPos) {
        this._startTime = startTime;
        this._xPos = xPos;
        this._yPos = yPos;
    }

    get startTime(){
        return this._startTime;
    }

    get xPos(){
        return this._xPos;
    }

    get yPos(){
        return this._yPos;
    }
}