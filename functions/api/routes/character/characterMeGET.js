const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { characterDB } = require('../../../db');

module.exports = async (req, res) => {
  let client;
  const { characterID } = req.params;
  try {
    // db/db.js에 정의한 connect 함수를 통해 connection pool에서 connection을 빌려옵니다.
    client = await db.connect(req);

    const character = await characterDB.getMyCharacter(client, characterID);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ALL_USERS_SUCCESS, character));
  } catch (error) {
    // try문 안에서 에러가 발생했을 시 catch문으로 error객체가 넘어옵니다.
    console.log(error);
    // 이 때, console.log만 해주는 것이 아니라, Firebase 콘솔에서도 에러를 모아볼 수 있게 functions.logger.error도 함께 찍어줍니다.
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    // db.connect(req)를 통해 빌려온 connection을 connection pool에 되돌려줍니다. (Necessary)
    client.release();
  }
};
