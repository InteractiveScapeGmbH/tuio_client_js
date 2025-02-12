const microsecondsPerSecond = 1000000;

export class TuioTime {
    private static startTime: TuioTime;
    private seconds: number;
    private microseconds: number;


    constructor(seconds: number, microseconds: number) {
        this.seconds = seconds;
        this.microseconds = microseconds;
    }

    public subtract(tuioTime: TuioTime) {
        let seconds = this.seconds - tuioTime.seconds;
        let microseconds = this.microseconds - tuioTime.microseconds;
        if (microseconds < 0) {
            microseconds += microsecondsPerSecond;
            seconds -= 1;
        }
        return new TuioTime(seconds, microseconds);
    }

    public static init() {
        TuioTime.startTime = TuioTime.getSystemTime();
    }

    public getTotalMilliseconds(): number {
        return 1000 * this.seconds + this.microseconds / 1000;
    }

    private static getSystemTime() {
        const timeInMs = Date.now();
        return new TuioTime(Math.floor(timeInMs / 1000), Math.floor(timeInMs * 1000) % microsecondsPerSecond);
    }

    public static getCurrentTime(): TuioTime {
        return TuioTime.getSystemTime().subtract(TuioTime.startTime);
    }

}