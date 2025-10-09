class Logger{
    private static instance: Logger;

    private constructor() {}

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public log(message: string): void {
        console.log(message);
    }
}

// usage

const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();

logger1.log("Message 1");
logger2.log("Message 2");
