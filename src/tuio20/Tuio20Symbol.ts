import { Vector } from "vecti";
import { TuioTime } from "../common/TuioTime.js";
import { Tuio20Component } from "./Tuio20Component.js";
import { Tuio20Object } from "./Tuio20Object.js";

export class Tuio20Symbol extends Tuio20Component {
    _tuId: number;
    _cId: number;
    _group: string;
    _data: string;
    constructor(startTime: TuioTime, container: Tuio20Object, tuId: number, cId: number, group: string, data: string) {
        super(startTime, container, new Vector(0, 0), 0, new Vector(0, 0), 0, 0, 0);
        this._tuId = tuId;
        this._cId = cId;
        this._group = group;
        this._data = data;
    }

    get tuId() {
        return this._tuId;
    }

    get cId() {
        return this._cId;
    }

    get group() {
        return this._group;
    }

    get data() {
        return this._data;
    }

    _hasChanged(tuId: number, cId: number, group: string, data: string) {
        return !(tuId === this.tuId && cId === this.cId && group === this.group && data === this.data);
    }

    _update(currentTime: TuioTime, tuId: number, cId: number, group: string, data: string) {
        this._updateComponent(currentTime, new Vector(0, 0), 0, new Vector(0, 0), 0, 0, 0);
        this._tuId = tuId;
        this._cId = cId;
        this._group = group;
        this._data = data;
    }
}