import {Tuio11Container} from "./Tuio11Container.js";
import {TuioState} from "../common/TuioState.js";

export class Tuio11Blob extends Tuio11Container {
    constructor(startTime, blobId, symbolId, xPos, yPos, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel) {
        super(startTime, blobId, xPos, yPos, xSpeed, ySpeed, motionAccel);
        this._blobId = blobId;
        this._angle = angle;
        this._width = width;
        this._height = height;
        this._area = area;
        this._rotationSpeed = rotationSpeed;
        this._rotationAccel = rotationAccel;
    }

    get blobId(){
        return this._blobId;
    }

    get angle(){
        return this._angle;
    }

    get width(){
        return this._angle;
    }

    get height(){
        return this._angle;
    }

    get area(){
        return this._angle;
    }

    get rotationSpeed(){
        return this._rotationSpeed;
    }

    get rotationAccel(){
        return this._rotationAccel;
    }

    _hasChanged(currentTime, xPos, yPos, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel){
        return !(xPos === this.xPos && yPos === this.yPos && angle === this.angle && width === this.width && height === this.height && area === this.area && xSpeed === this.xSpeed && ySpeed === this.ySpeed && rotationSpeed === this.rotationSpeed && motionAccel === this.motionAccel && rotationAccel === this.rotationAccel);
    }

    _update(currentTime, xPos, yPos, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel){
        let lastPoint = this.path[this.path.length - 1];
        let isCalculateSpeeds = (xPos !== this.xPos && xSpeed === 0) || (yPos !== this.yPos && ySpeed === 0);
        this._updateContainer(currentTime, xPos, yPos, xSpeed, ySpeed, motionAccel, isCalculateSpeeds);

        let isCalculateRotation = (angle !== this.angle && rotationSpeed === 0);
        if(isCalculateRotation){
            let dt = currentTime.subtract(lastPoint.startTime).getTotalMilliseconds()/1000.0;
            let lastAngle = this.angle;
            let lastRotationSpeed = this.rotationSpeed;
            let da = (angle - lastAngle) / (2 * Math.PI);
            if(da > 0.5){
                da -= 1;
            } else if(da <= -0.5){
                da += 1;
            }
            this._rotationSpeed = da / dt;
            this._rotationAccel = (this.rotationSpeed - lastRotationSpeed) / dt;
        } else {
            this._rotationSpeed = rotationSpeed;
            this._rotationAccel = rotationAccel;
        }
        this._angle = angle;

        if (this._state !== TuioState.Stopped && this.rotationAccel !== 0) {
            this._state = TuioState.Rotating;
        }

        this._width = width;
        this._height = height;
        this._area = area;
    }
}