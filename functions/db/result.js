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

const getResultByID = async (client, userID) => {
  const { rows } = await client.query(
    `
    SELECT c.name, c.images, r.completed
    FROM "result" as "r"
    JOIN
      "character" as c
    ON c.id = r.character
    WHERE "user" = $1
    `,
    [userID],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { writeResult, getResultByID };
