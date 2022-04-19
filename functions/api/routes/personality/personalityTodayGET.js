const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { personalityDB } = require('../../../db');

/**
 *  @오늘의_캐릭터_확인
 *  @route GET /personality/today
 */

module.exports = async (req, res) => {
  // @FIX_ME
  // const user = req.user;
  // const userId = user.userId;
  const userId = 1;
  const user = {
    userID: 1,
    nickname: '영권',
    chance: 3,
  };

  let client;

  try {
    client = await db.connect(req);

    const recentHistory = await personalityDB.getRecentCharacterById(client, userId);
    const character = await personalityDB.getCharacterByPersonalityId(client, recentHistory.personalityId);

    const allTaskIds = recentHistory.allTask.split(',');
    const completeTaskIds = recentHistory.completeTask.split(',');
    let todo = [];
    for (let i = 0; i < allTaskIds.length; i++) {
      const taskId = allTaskIds[i];
      const complete = completeTaskIds.filter((e) => e === taskId).length === 1 ? true : false;
      const task = await personalityDB.getTaskByTaskId(client, taskId);

      todo.push({
        taskId,
        content: task.content.trim(),
        complete,
      });
    }

    const data = {
      nickname: user.nickname,
      name: character.name,
      level: completeTaskIds.length,
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
