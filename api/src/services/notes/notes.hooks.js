const { authenticate } = require('@feathersjs/authentication').hooks;

const processNote = require('../../hooks/process-note');

const populateUser = require('../../hooks/populate-user');

const processNoteUpdate = require('../../hooks/process-note-update');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [processNote()],
    update: [processNoteUpdate()],
    patch: [processNoteUpdate()],
    remove: []
  },

  after: {
    all: [populateUser()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
