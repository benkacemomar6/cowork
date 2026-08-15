class AppError extends Error {
    constructor(message, statusCode) {
        super(message);       // sets this.message = message (inherited from built-in Error)
        this.statusCode = statusCode;
    }
}

module.exports = AppError;