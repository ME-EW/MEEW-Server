const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, personalityDB } = require('../../../db');

/**
 *  @오늘의_캐릭터_스케줄링_작업
 *  @route POST /personality/scheduling
 */

module.exports = async (req, res) => {
  // @FIX_ME
  // const user = req.user;
  // const userId = user.userId;

  let client;

  try {
    client = await db.connect(req);

    const allUser = await userDB.getAllUser(client);
    const allUserIds = allUser.map((u) => u.id);

    for (let i = 0; i < allUserIds.length; i++) {
      const userId = allUserIds[i];
      const recentHistory = await personalityDB.getRecentHistoryById(client, userId);
      if (recentHistory && !recentHistory.finished) {
        await personalityDB.finishHistoryByHistoryId(client, recentHistory.id);
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

      const newTasksIds = newTasks.map((t) => t.id);

      await personalityDB.createNewHistoryByUserId(client, userId, newPersonalityId, newTasksIds.join());
    }

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SCHEDULING_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
