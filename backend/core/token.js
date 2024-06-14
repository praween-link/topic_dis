const jwt = require("jsonwebtoken");
require('dotenv').config();

module.exports = {
    checkToken: (request, response, next) => {
        let token = request.get("authorization");
        // console.log("Req Token: "+token);
        if (token) {
            token = token.split(' ')[1];
            jwt.verify(token, process.env.AUTH_TOKEN_KEY, (error, decoded) => {
                // console.log("Decoded: "+decoded.email);
                if (error) {
                    response.status(401).json({
                        success: false,
                        message: "Access denied! Invalid token!",
                        body: {},
                    });
                    return undefined;
                } else {
                    next();
                    return decoded;
                }
            });
        } else {
            response.status(401).json({
                success: false,
                message: "Access denied! Unautorized user!",
                body: {},
            });
            return undefined;
        }

    },
    tokenDecode(token, respDecoded) {
        if (token) {
            jwt.verify(token, process.env.AUTH_TOKEN_KEY, (error, decoded) => {
                // console.log("Decoded: "+decoded.email);
                if (error) {
                    return respDecoded(undefined);
                } else {
                    return respDecoded(decoded);
                }
            });
        } else {
            return respDecoded(undefined);
        }
    }
}