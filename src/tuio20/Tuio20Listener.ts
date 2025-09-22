import { TuioTime } from "../common/TuioTime";
import { Tuio20Object } from "./Tuio20Object"

export interface Tuio20Listener {
    tuioAdd(tuioObject: Tuio20Object): void;
    tuioUpdate(tuioObject: Tuio20Object): void;
    tuioRemove(tuioObject: Tuio20Object): void;
    tuioRefresh(tuioTime: TuioTime): void;
}