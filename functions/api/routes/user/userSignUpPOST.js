const functions = require('firebase-functions');
const util = require('../../../lib/util');
const jwt = require('jsonwebtoken');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const request = require('request');
const nodeRSA = require('node-rsa');
const { userDB } = require('../../../db');
const jwtUtil = require('../../../lib/jwtUtil');

module.exports = async (req, res) => {

  const { socialToken, socialType, nickname, personalityId } = req.body;

  let client;
  let options;

  try {
    client = await db.connect(req);

    const user = await userDB.checkAvailableName(client, nickname);
    if (user) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_EXIST_NICKNAME));
    }

    if (socialType === 'KAKAO') {
      options = {
        uri: "https://kapi.kakao.com/v2/user/me",
        method:'GET',
        headers: {
          'Content-Type': "application/x-www-form-urlencoded",
          'Authorization': "Bearer " + socialToken
        }
      };
      request(options, async function(error, response, body){
        const { id: socialId } = JSON.parse(response.body);
        let user;
        try {
          user = await userDB.createNewUser(client, socialType, socialId, nickname, personalityId);
        } catch (error) {
          functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
          console.log(error);
          res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SIGN_UP_SUCCESS, await jwtUtil.createJwtValue(user.id)));
      });
    }

    if (socialType === 'APPLE') {
      const headerIdToken = socialToken.split(".")[0];
      const idToken = JSON.parse(Buffer.from(headerIdToken, 'base64'));

      options = {
        uri: "https://appleid.apple.com/auth/keys",
        method: 'GET',
        headers: {
          'Content-Type': "application/x-www-form-urlencoded",
        }
      }
      request(options, async function(error, response, body){
        const { keys } = JSON.parse(response.body);
        
        let jwtClaims;
        keys.forEach(key => {
          if (idToken.kid == key.kid && idToken.alg == key.alg) {
            const pubKey = new nodeRSA();
            pubKey.importKey({ n: Buffer.from(key.n, 'base64'), e: Buffer.from(key.e, 'base64') }, 'components-public');
            const applePublicKey = pubKey.exportKey(['public']);
            jwtClaims = jwt.verify(headerIdToken, applePublicKey, { algorithms: 'RS256' });
            return false;
          }
        });
        const socialId = jwtClaims.body.subject;

        let user;
        try {
          user = await userDB.createNewUser(client, socialType, socialId, nickname, personalityId);
        } catch (error) {
          functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
          console.log(error);
          res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SIGN_UP_SUCCESS, await jwtUtil.createJwtValue(user.id)));
      });
    }
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
