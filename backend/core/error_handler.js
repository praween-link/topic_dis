const errors = {}
errors.errorHeandler = (error, req, res, next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status = statusCode;

    const responseBody = {
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? "***" : error.stack,
    }

    console.log(`Error: ${responseBody}`);

    res.json(responseBody);
}

module.exports = errors;