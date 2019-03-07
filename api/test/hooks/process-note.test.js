const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const processNote = require('../../src/hooks/process-note');

describe('process-note hook', () => {
  let app;

  beforeEach(() => {
    // Create a new plain Feathers application
    app = feathers();

    // Register a dummy custom service that just return the
    // note data back
    app.use('/notes', {
      async create(data) {
        return data;
      }
    });

    // Register the `processnote` hook on that service
    app.service('notes').hooks({
      before: {
        create: processNote()
      }
    });
  });

  it('processes the note as expected', async () => {
    // A user stub with just an `_id`
    const user = { _id: 'test' };
    // The service method call `params`
    const params = { user };

    // Create a new note with params that contains our user
    const note = await app.service('notes').create(
      {
        x: 20,
        y: 25,
        text: 'Hi there',
        additional: 'should be removed'
      },
      params
    );

    assert.equal(note.text, 'Hi there');
    // `userId` was set
    assert.equal(note.userId, 'test');
    // `additional` property has been removed
    assert.ok(!note.additional);
  });
});
