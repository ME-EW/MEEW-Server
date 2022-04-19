const dayjs = require('dayjs');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getUserByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.user
      WHERE id = $1
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateChanceByUserId = async (client, userId, newChanceCount) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
      UPDATE public.user
      SET chance = $2, updated_at = $3
      WHERE id = $1
      RETURNING *
    `,
    [userId, newChanceCount, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  getUserByUserId,
  updateChanceByUserId,
};
