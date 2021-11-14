import {TuioTime} from "../common/TuioTime.js";
import {Tuio20Object} from "./Tuio20Object.js";
import {Tuio20Token} from "./Tuio20Token.js";
import {Tuio20Pointer} from "./Tuio20Pointer.js";
import {Tuio20Bounds} from "./Tuio20Bounds.js";
import {Tuio20Symbol} from "./Tuio20Symbol.js";

export class Tuio20Client {
    constructor(tuioReceiver) {
        this._tuioReceiver = tuioReceiver;
        this._tuioReceiver.addMessageListener("/tuio2/frm", this._onFrm.bind(this));
        this._tuioReceiver.addMessageListener("/tuio2/alv", this._onAlv.bind(this));
        this._tuioReceiver.addMessageListener("/tuio2/tok", this._onOther.bind(this));
        this._tuioReceiver.addMessageListener("/tuio2/ptr", this._onOther.bind(this));
        this._tuioReceiver.addMessageListener("/tuio2/bnd", this._onOther.bind(this));
        this._tuioReceiver.addMessageListener("/tuio2/sym", this._onOther.bind(this));
        this._tuioListeners = [];

        this._tuioObjects = new Map();

        this._frmMessage = null;
        this._otherMessages = [];

        this._currentFrameId = 0;
        this._currentFrameTime = null;

        this._dim = null;
        this._source = null;
    }

    connect(){
        this._currentFrameTime = new TuioTime(0, 0);
        this._tuioReceiver.connect();
    }

    disconnect(){
        this._tuioReceiver.disconnect();
    }

    get dim(){
        return this._dim;
    }

    get source(){
        return this._source;
    }

    addTuioListener(tuioListener){
        this._tuioListeners.push(tuioListener);
    }

    getTuioPointerList(){
        let ret = [];
        for (let [sessionId, tuioObject] of this._tuioObjects) {
            if(tuioObject.containsTuioPointer()){
                ret.push(tuioObject._pointer);
            }
        }
        return ret;
    }

    getTuioTokenList(){
        let ret = [];
        for (let [sessionId, tuioObject] of this._tuioObjects) {
            if(tuioObject.containsTuioToken()){
                ret.push(tuioObject._token);
            }
        }
        return ret;
    }

    getTuioBoundsList(){
        let ret = [];
        for (let [sessionId, tuioObject] of this._tuioObjects) {
            if(tuioObject.containsTuioBounds()){
                ret.push(tuioObject._bounds);
            }
        }
        return ret;
    }

    getTuioSymbolList(){
        let ret = [];
        for (let [sessionId, tuioObject] of this._tuioObjects) {
            if(tuioObject.containsTuioSymbol()){
                ret.push(tuioObject._symbol);
            }
        }
        return ret;
    }

    removeTuioListener(tuioListener){
        let index = this._tuioListeners.indexOf(tuioListener);
        if(index > -1) {
            this._tuioListeners.splice(index, 1);
        }
    }

    removeAllTuioListeners(){
        this._tuioListeners = [];
    }

    _onFrm(oscMessage){
        this._otherMessages = [];
        this._frmMessage = oscMessage;
    }

    _onOther(oscMessage){
        this._otherMessages.push(oscMessage);
    }

    _onAlv(oscMessage){
        if(this._frmMessage === null){
            return;
        }
        let [frameId, frameTime, dim, source] = this._frmMessage.args.map(arg => arg.value);
        let currentFrameTime = TuioTime.fromOscTime(frameTime);
        if(frameId >= this._currentFrameId || frameId === 0 || currentFrameTime.subtract(this._currentFrameTime).getTotalMilliseconds() >= 1000){
            this._currentFrameTime = currentFrameTime;
            this._currentFrameId = frameId;
            this._dim = dim;
            this._source = source;
            let currentSessionIds = new Set(this._tuioObjects.keys());
            let aliveSessionIds = new Set(oscMessage.args.map(arg => arg.value));
            let newSessionIds = new Set([...aliveSessionIds].filter(x => !currentSessionIds.has(x)));
            let addedSessionIds = new Set(newSessionIds);
            let updatedSessionIds = new Set();
            let removedSessionIds = new Set([...currentSessionIds].filter(x => !aliveSessionIds.has(x)));
            for (let sessionId of newSessionIds){
                let tuioObject = new Tuio20Object(this._currentFrameTime, sessionId);
                this._tuioObjects.set(sessionId, tuioObject);
            }
            for (let otherOscMessage of this._otherMessages){
                let otherArgs = otherOscMessage.args.map(arg => arg.value);
                if(otherOscMessage.address === "/tuio2/tok"){
                    let [sId, tuId, cId, xPos, yPos, angle, ...optionalArgs] = otherArgs;
                    if(aliveSessionIds.has(sId)){
                        optionalArgs = optionalArgs.concat(new Array(5-optionalArgs.length).fill(0));
                        let [xVel, yVel, aVel, mAcc, rAcc] = optionalArgs;
                        let tuioObject = this._tuioObjects.get(sId);
                        if(tuioObject.token === null){
                            addedSessionIds.add(sId);
                            tuioObject.setTuioToken(new Tuio20Token(this._currentFrameTime, tuioObject, tuId, cId, xPos, yPos, angle, xVel, yVel, aVel, mAcc, rAcc));
                        } else {
                            if(tuioObject.token._hasChanged(tuId, cId, xPos, yPos, angle, xVel, yVel, aVel, mAcc, rAcc)){
                                updatedSessionIds.add(sId);
                                tuioObject.token._update(this._currentFrameTime, tuId, cId, xPos, yPos, angle, xVel, yVel, aVel, mAcc, rAcc);
                            }
                        }
                    }
                } else if (otherOscMessage.address === "/tuio2/ptr"){
                    let [sId, tuId, cId, xPos, yPos, angle, shear, radius, press, ...optionalArgs] = otherArgs;
                    if(aliveSessionIds.has(sId)) {
                        optionalArgs = optionalArgs.concat(new Array(5 - optionalArgs.length).fill(0));
                        let [xVel, yVel, pVel, mAcc, pAcc] = optionalArgs;
                        let tuioObject = this._tuioObjects.get(sId);
                        if(tuioObject.pointer === null){
                            addedSessionIds.add(sId);
                            tuioObject.setTuioPointer(new Tuio20Pointer(this._currentFrameTime, tuioObject, tuId, cId, xPos, yPos, angle, shear, radius, press, xVel, yVel, pVel, mAcc, pAcc));
                        } else {
                            if(tuioObject.pointer._hasChanged(tuId, cId, xPos, yPos, angle, shear, radius, press, xVel, yVel, pVel, mAcc, pAcc)){
                                updatedSessionIds.add(sId);
                                tuioObject.pointer._update(this._currentFrameTime, tuId, cId, xPos, yPos, angle, shear, radius, press, xVel, yVel, pVel, mAcc, pAcc);
                            }
                        }
                    }
                } else if (otherOscMessage.address === "/tuio2/bnd"){
                    let [sId, xPos, yPos, angle, width, height, area, ...optionalArgs] = otherArgs;
                    if(aliveSessionIds.has(sId)) {
                        optionalArgs = optionalArgs.concat(new Array(5 - optionalArgs.length).fill(0));
                        let [xVel, yVel, aVel, mAcc, rAcc] = optionalArgs;
                        let tuioObject = this._tuioObjects.get(sId);
                        if(tuioObject.bounds === null){
                            addedSessionIds.add(sId);
                            tuioObject.setTuioBounds(new Tuio20Bounds(this._currentFrameTime, tuioObject, xPos, yPos, angle, width, height, area, xVel, yVel, aVel, mAcc, rAcc));
                        } else {
                            if(tuioObject.bounds._hasChanged(xPos, yPos, angle, width, height, area, xVel, yVel, aVel, mAcc, rAcc)){
                                updatedSessionIds.add(sId);
                                tuioObject.bounds._update(this._currentFrameTime, xPos, yPos, angle, width, height, area, xVel, yVel, aVel, mAcc, rAcc);
                            }
                        }
                    }
                } else if (otherOscMessage.address === "/tuio2/sym"){
                    let [sId, tuId, cId, group, data] = otherArgs;
                    if(aliveSessionIds.has(sId)) {
                        let tuioObject = this._tuioObjects.get(sId);
                        if(tuioObject.symbol === null){
                            addedSessionIds.add(sId);
                            tuioObject.setTuioSymbol(new Tuio20Symbol(this._currentFrameTime, tuioObject, tuId, cId, group, data));
                        } else {
                            if(tuioObject.symbol._hasChanged(tuId, cId, group, data)){
                                updatedSessionIds.add(sId);
                                tuioObject.symbol._update(this._currentFrameTime, tuId, cId, group, data);
                            }
                        }
                    }
                }
            }
            for (let sessionId of addedSessionIds){
                let tuioObject = this._tuioObjects.get(sessionId);
                for (let tuioListener of this._tuioListeners){
                    tuioListener.tuioAdd(tuioObject);
                }
            }
            updatedSessionIds = new Set([...updatedSessionIds].filter(x => !newSessionIds.has(x)));
            for (let sessionId of updatedSessionIds){
                let tuioObject = this._tuioObjects.get(sessionId);
                for (let tuioListener of this._tuioListeners){
                    tuioListener.tuioUpdate(tuioObject);
                }
            }
            for (let sessionId of removedSessionIds){
                let tuioObject = this._tuioObjects.get(sessionId);
                tuioObject._remove(this._currentFrameTime);
                for (let tuioListener of this._tuioListeners){
                    tuioListener.tuioRemove(tuioObject);
                }
                this._tuioObjects.delete(sessionId);
            }
            for (let tuioListener of this._tuioListeners){
                tuioListener.tuioRefresh(this._currentFrameTime);
            }
        }
        this._frmMessage = null;
    }
}