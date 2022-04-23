const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, personalityDB } = require('../../../db');

/**
 *  @오늘의_캐릭터_보러가기
 *  @route POST /personality/new
 *  @error
 *    1. 이미 오늘의 캐릭터가 존재함
 */

module.exports = async (req, res) => {
  // @FIX_ME
  // const user = req.user;
  // const userId = user.userId;

  let client;

  try {
    client = await db.connect(req);

    const user = await userDB.getUserByUserId(client, 1);
    const userId = user.id;

    const recentHistory = await personalityDB.getRecentHistoryById(client, userId);
    if (recentHistory) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_EXIST));
    }

    const newPersonalityId = Math.floor(Math.random() * 8) + 1;
    let tasks = await personalityDB.getTasksByPersonalityId(client, newPersonalityId);
    let newTasks = [];

    Array.prototype.random = function () {
      return this[Math.floor(Math.random() * this.length)];
    };

    for (let i = 0; i < 4; i++) {
      const newTask = tasks.random();
      newTasks.push(newTask);
      tasks = tasks.filter((t) => t !== newTask);
    }

    await personalityDB.createNewHistoryByUserId(client, userId, newPersonalityId, newTasks.join());

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.FINISH_TODAY_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
