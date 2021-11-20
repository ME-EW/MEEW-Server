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

module.exports = { getMyCharacter };
