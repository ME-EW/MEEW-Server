const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { personalityDB } = require('../../../db');

/**
 *  @오늘의_캐릭터_새로고침
 *  @route GET /personality/new
 */

module.exports = async (req, res) => {
  // @FIX_ME
  // const user = req.user;
  // const userId = user.userId;
  const userId = 1;
  const user = {
    id: 1,
    nickname: '영권',
    personality: 1,
    chance: 3,
  };

  let client;

  try {
    client = await db.connect(req);

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

    const character = await personalityDB.updateRecentCharacter(client, userId, newPersonalityId, newTasks.join());

    let todo = [];
    newTasks.forEach((t) => {
      todo.push({
        content: t.content,
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

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_TODAY_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
