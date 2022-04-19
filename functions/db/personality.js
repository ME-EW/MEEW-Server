const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getRecentCharacterById = async (client, userId) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.history
      WHERE id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getTaskByTaskId = async (client, taskId) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.task
      WHERE id = $1
    `,
    [taskId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getCharacterByPersonalityId = async (client, personalityId) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.personality
      WHERE id = $1
    `,
    [personalityId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  getRecentCharacterById,
  getTaskByTaskId,
  getCharacterByPersonalityId,
};
