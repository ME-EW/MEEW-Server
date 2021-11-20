const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getUserById = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "user" u
    WHERE id = $1
      AND is_deleted = FALSE
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

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

const getTodoLists = async (client, userId) => {
  const { rows: user } = await client.query(
    `
    SELECT character FROM "user"
    WHERE id = $1
        AND is_deleted = FALSE
    `,
    [userId],
  );

  if (user.length === 0) return false;
  const userPickCharacter = user[0].character;

  const { rows: userTodoLists } = await client.query(
    `
    SELECT * FROM "todo"
    WHERE id NOT IN ($1)
    ORDER BY random()
    LIMIT 3
    `,
    [userPickCharacter],
  );

  return userTodoLists;
};

module.exports = { getUserById, setUserCharacter, getTodoLists };