const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const setUserCharacter = async (client, character, userId) => {
  const { rows: existingRows } = await client.query(
    `
    SELECT * FROM "user"
    WHERE id = $1
        AND is_deleted = FALSE
    `,
    [userId],
  );

  if (existingRows.length === 0) return false;

  const data = _.merge({}, convertSnakeToCamel.keysToCamel(existingRows[0]), { character });

  const { rows } = await client.query(
    `
    UPDATE "user" u
    SET character = $1, updated_at = now()
    WHERE id = $2
    RETURNING * 
    `,
    [data.character, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { setUserCharacter };