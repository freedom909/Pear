"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ErrorHandler = exports.LogLevel = void 0;
const config_1 = require("../config");
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["NONE"] = "none";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
const LOG_LEVEL_WEIGHT = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
    [LogLevel.NONE]: 4,
};
class Logger {
    namespace;
    level;
    isDev;
    isDebug;
    constructor(namespace = 'app', level = config_1.SYSTEM_CONFIG.LOG_LEVEL) {
        this.namespace = namespace;
        this.level = level;
        this.isDev = config_1.SYSTEM_CONFIG.IS_DEV;
        this.isDebug = config_1.SYSTEM_CONFIG.DEBUG;
    }
    setLevel(level) {
        if (Object.values(LogLevel).includes(level)) {
            this.level = level;
        }
    }
    shouldLog(level) {
        return LOG_LEVEL_WEIGHT[level] >= LOG_LEVEL_WEIGHT[this.level];
    }
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] [${this.namespace}] ${message}`;
    }
    debug(message, data) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const formattedMessage = this.formatMessage(LogLevel.DEBUG, message);
            if (this.isDev || this.isDebug) {
                console.debug(formattedMessage);
                if (data !== undefined) {
                    console.debug(data);
                }
            }
        }
    }
    info(message, data) {
        if (this.shouldLog(LogLevel.INFO)) {
            const formattedMessage = this.formatMessage(LogLevel.INFO, message);
            console.info(formattedMessage);
            if (data !== undefined) {
                console.info(data);
            }
        }
    }
    warn(message, data) {
        if (this.shouldLog(LogLevel.WARN)) {
            const formattedMessage = this.formatMessage(LogLevel.WARN, message);
            console.warn(formattedMessage);
            if (data !== undefined) {
                console.warn(data);
            }
        }
    }
    error(message, error) {
        if (this.shouldLog(LogLevel.ERROR)) {
            const formattedMessage = this.formatMessage(LogLevel.ERROR, message);
            console.error(formattedMessage);
            if (error !== undefined) {
                console.error(error);
            }
        }
    }
    time(label) {
        if (this.isDev || this.isDebug) {
            console.time(`[${this.namespace}] ${label}`);
        }
    }
    timeEnd(label) {
        if (this.isDev || this.isDebug) {
            console.timeEnd(`[${this.namespace}] ${label}`);
        }
    }
    createSubLogger(subNamespace) {
        return new Logger(`${this.namespace}:${subNamespace}`, this.level);
    }
}
class ErrorHandler {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    handleApiError(error, fallbackMessage = '操作失败，请稍后重试') {
        let message = fallbackMessage;
        if (error.data && error.data.message) {
            message = error.data.message;
        }
        else if (error.message) {
            message = error.message;
        }
        this.logger.error('API错误', error);
        return {
            success: false,
            message,
            error,
        };
    }
    handleError(error, context = '', fallbackMessage = '发生错误，请稍后重试') {
        let message = fallbackMessage;
        if (error.message) {
            message = error.message;
        }
        const logMessage = context ? `${context}: ${message}` : message;
        this.logger.error(logMessage, error);
        return {
            success: false,
            message,
            error,
        };
    }
    handleValidationError(errors) {
        const firstError = Object.values(errors)[0];
        const message = firstError || '表单验证失败';
        this.logger.warn('表单验证错误', errors);
        return {
            success: false,
            message,
            errors,
        };
    }
}
exports.ErrorHandler = ErrorHandler;
const logger = new Logger();
exports.errorHandler = new ErrorHandler(logger);
exports.default = logger;
//# sourceMappingURL=logger.js.map