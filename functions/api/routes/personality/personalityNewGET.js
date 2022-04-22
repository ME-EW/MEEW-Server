const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, personalityDB } = require('../../../db');

/**
 *  @오늘의_캐릭터_새로고침
 *  @route GET /personality/new
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

    if (user.chance < 1) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.LACK_OF_CHANCE));
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

    const updatedUser = await userDB.updateChanceByUserId(client, userId, user.chance - 1);
    const recentHistory = await personalityDB.updateRecentHistory(client, userId, newPersonalityId, newTasks.map((t) => t.id).join());
    const character = await personalityDB.getCharacterByPersonalityId(client, recentHistory.personalityId);
    const personalityImage = await personalityDB.getImageByLevelAndId(client, 0, recentHistory.personalityId);
    const imageUrl = personalityImage.url;

    let todo = [];
    newTasks.forEach((t) => {
      todo.push({
        taskId: t.id,
        content: t.content.trim(),
        complete: false,
      });
    });

    const data = {
      nickname: updatedUser.nickname,
      name: character.name,
      level: 0,
      imageUrl,
      chance: updatedUser.chance,
      todo,
    };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_NEW_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
