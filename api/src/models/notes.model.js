const NeDB = require('nedb');
const path = require('path');

module.exports = function(app) {
  const dbPath = process.env.DB_PATH || app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, 'notes.db'),
    autoload: true
  });

  return Model;
};
