const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, personalityDB } = require('../../../db');

/**
 *  @오늘은_나로_살기
 *  @route GET /personality/me
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

    const newPersonalityId = user.personality;
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

    const recentHistory = await personalityDB.updateRecentHistory(client, userId, newPersonalityId, newTasks.map((t) => t.id).join());
    const character = await personalityDB.getCharacterByPersonalityId(client, recentHistory.personalityId);

    let todo = [];
    newTasks.forEach((t) => {
      todo.push({
        taskId: t.id,
        content: t.content.trim(),
        complete: false,
      });
    });

    const data = {
      nickname: user.nickname,
      name: character.name,
      level: 0,
      chance: user.chance,
      todo,
    };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.LIVE_ME_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
