const jwt = require('jsonwebtoken');
const randToken = require('rand-token');
const dotenv = require('dotenv');
const secreyKey = process.env.JWT_SECRET;
const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

dotenv.config();

const createJwtValue = async (userId) => {
    const payload = {
        userId: userId
    }
    const options =  {
        expiresIn: '7d'
    }
    const result = {
        userId: userId,
        accessToken: jwt.sign(payload, secreyKey, options),
        refreshToken: randToken.uid(256)
    };
    return result;
}

const verifyJwt = async (accessToken) => {
    let decoded;
    try {
        decoded = jwt.verify(accessToken, secreyKey);
    } catch (err) {
        if (err.message === 'jwt expired') {
            return TOKEN_EXPIRED;
        } else if (err.message === 'invalid token') {
            return TOKEN_INVALID;
        } else {
            return TOKEN_INVALID;
        }
    }
    return decoded;
}

module.exports = {
    createJwtValue,
};
  