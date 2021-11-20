const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getAllCharacters = async (client) => {
  const { rows } = await client.query(
    `
    SELECT * FROM character
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getAllCharacters };