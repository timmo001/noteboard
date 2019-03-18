const NeDB = require('nedb');
const path = require('path');

module.exports = function(app) {
  const dbPath = process.env.DB_PATH || app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, 'users.db'),
    autoload: true
  });

  Model.ensureIndex({ fieldName: 'email', unique: true });

  return Model;
};
