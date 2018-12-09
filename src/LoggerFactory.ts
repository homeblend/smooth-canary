import { TransformableInfo } from 'logform';
import winston from 'winston';

export default function createLogger(source: string = "Default Source") {
    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.label({label: source}),
            winston.format.printf((info: TransformableInfo) => {
                return `${info.label} ${info.timestamp} ${info.level}: ${info.message}`;
            })
        ),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({
                // make this config driven
                filename: '/var/log/smooth-canary/smooth-canary.log',
                maxsize: 10000000, // 10 MB, make this config driven,
                maxFiles: 20 // only allow max of 20 files
            })
        ],
    });
    return logger;
}
