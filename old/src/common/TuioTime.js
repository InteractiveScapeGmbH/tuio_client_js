export class TuioTime {
    static _startTime = new TuioTime(0, 0);

    constructor(seconds, microSeconds) {
        this._seconds = seconds;
        this._microSeconds = microSeconds;
    }

    static fromOscTime(oscTime){
        let seconds = oscTime.raw[0];
        let microseconds = oscTime.raw[1] / 4294967296;
        return new TuioTime(seconds, microseconds);
    }

    subtract(tuioTime) {
        let seconds = this._seconds - tuioTime._seconds;
        let microSeconds = this._microSeconds - tuioTime._microSeconds;

        if (microSeconds < 0) {
            microSeconds += 1000000;
            seconds = seconds - 1;
        }
        return new TuioTime(seconds, microSeconds);
    }

    getTotalMilliseconds() {
        return 1000 * this._seconds + this._microSeconds / 1000;
    }

    static init(){
        TuioTime._startTime = TuioTime._getSystemTime();
    }

    static _getSystemTime(){
        let performanceNow = performance.now();
        return new TuioTime(Math.floor(performanceNow / 1000), Math.floor(performanceNow * 1000) % 1000000);
    }

    static getCurrentTime(){
        return TuioTime._getSystemTime().subtract(TuioTime._startTime);
    }
}