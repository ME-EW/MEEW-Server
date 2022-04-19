const dayjs = require('dayjs');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const updateChanceById = async (client, userId, newChanceCount) => {
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
  updateChanceById,
};
