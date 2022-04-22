const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, personalityDB } = require('../../../db');

/**
 *  @TODO_Check_Uncheck_Toggle
 *  @route PATCH /personality/check
 *  @error
 *    1. 전달받은 taskId가 사용자의 TODO Task에 포함되어 있지 않은 경우
 */

module.exports = async (req, res) => {
  // @FIX_ME
  // const user = req.user;
  // const userId = user.userId;

  const { taskId } = req.body;

  let client;

  try {
    client = await db.connect(req);

    const user = await userDB.getUserByUserId(client, 1);
    const userId = user.id;

    const recentHistory = await personalityDB.getRecentHistoryById(client, userId);
    const character = await personalityDB.getCharacterByPersonalityId(client, recentHistory.personalityId);

    const allTaskIds = recentHistory.allTask.split(',').map((t) => +t);
    let completeTaskIds = [];
    if (recentHistory.completeTask) {
      completeTaskIds = recentHistory.completeTask.split(',').map((t) => +t);
    }

    // @error1. 전달받은 taskId가 사용자의 TODO Task에 포함되어 있지 않은 경우
    if (!allTaskIds.includes(taskId)) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INVALID_TASKID));
    }

    // Check
    if (!completeTaskIds.includes(taskId)) {
      completeTaskIds.push(taskId);
    } else {
      // Uncheck
      completeTaskIds = completeTaskIds.filter((t) => t !== taskId);
    }

    const updatedHistory = await personalityDB.updateTODO(client, userId, completeTaskIds.join());
    const imageUrl = await personalityDB.getImageByLevelAndId(client, completeTaskIds.length, updatedHistory.personalityId);

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
      imageUrl,
      chance: user.chance,
      todo,
    };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.TODO_UPDATE_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
