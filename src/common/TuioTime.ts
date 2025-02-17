export class TuioTime {

    private static _startTime: TuioTime = new TuioTime(0, 0);
    private _seconds: number;
    private _microSeconds: number;

    constructor(seconds: number, microSeconds: number) {
        this._seconds = seconds;
        this._microSeconds = microSeconds;
    }

    public static fromOscTime(oscTime: bigint): TuioTime {
        let seconds = Number(oscTime >> 32n);
        const fraction = Number(oscTime & 0xFFFFFFFFn)
        const microseconds = Math.floor((fraction * 1000000) / Math.pow(2, 32));
        return new TuioTime(seconds, microseconds);
    }

    public subtract(tuioTime: TuioTime): TuioTime {
        let seconds = this._seconds - tuioTime._seconds;
        let microSeconds = this._microSeconds - tuioTime._microSeconds;

        if (microSeconds < 0) {
            microSeconds += 1000000;
            seconds = seconds - 1;
        }
        return new TuioTime(seconds, microSeconds);
    }

    public getTotalMilliseconds(): number {
        return 1000 * this._seconds + this._microSeconds / 1000;
    }

    public static init() {
        TuioTime._startTime = TuioTime._getSystemTime();
    }

    public static getCurrentTime(): TuioTime {
        return TuioTime._getSystemTime().subtract(TuioTime._startTime);
    }

    private static _getSystemTime(): TuioTime {
        let performanceNow = performance.now();
        return new TuioTime(Math.floor(performanceNow / 1000), Math.floor(performanceNow * 1000) % 1000000);
    }
}