export const logger = {
    log: (...args: any[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(...args);
        }
    },
    error: console.error, // Always log errors
    warn: (...args: any[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(...args);
        }
    }
};
