const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getMyCharacter = async (client, characterID) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "character" u
    WHERE id = $1
    `,
    [characterID],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getCharacterByUserId = async (client, userId) => {
  const { rows: user } = await client.query(
    `
    SELECT * FROM "user"
    WHERE id = $1
    `,
    [userId],
  );

  const userPickCharacter = user[0].character;
  const { rows: character } = await client.query(
    `
    SELECT * FROM "character"
    WHERE id = $1
    `,
    [userPickCharacter],
  );

  return character;
};

module.exports = { getMyCharacter, getCharacterByUserId };
