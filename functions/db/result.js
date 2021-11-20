const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const writeResult = async (client, userID, characterID, complete) => {
  const { rows } = await client.query(
    `
    INSERT INTO "result" ("user", character, completed)
    VALUES ($1, $2, $3) 
    RETURNING *
    `,
    [userID, characterID, complete],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { writeResult };
