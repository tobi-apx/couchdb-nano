'use strict';

var async = require('async');
var helpers = require('../helpers');
var harness = helpers.harness(__filename);
var it = harness.it;
var db = harness.locals.db;
var nano = harness.locals.nano;

it('should insert a bunch of items', helpers.insertThree);

it('creates a bunch of database replicas', function(assert) {
  async.forEach(['db_replica', 'db_replica2'],
  nano.db.create, function(error) {
    assert.equal(error, undefined, 'created database(s)');
    assert.end();
  });
});

it('should be able to replicate three docs', function(assert) {
  var replica = nano.use('db_replica');

  db.replicate('db_replica', function(error) {
    assert.equal(error, null, 'replication should work');
    replica.list(function(error, list) {
      assert.equal(error, null, 'should be able to invoke list');
      assert.equal(list['total_rows'], 3, 'and have three documents');
      assert.end();
    });
  });
});

it('should be able to replicate to a `nano` object', function(assert) {
  var replica2 = nano.use('db_replica2');

  nano.db.replicate(db, replica2, function(error) {
    assert.equal(error, null, 'should replicate');
    replica2.list(function(error, list) {
      assert.equal(error, null, 'should list');
      assert.equal(list['total_rows'], 3, 'and have three documents');
      assert.end();
    });
  });
});

it('should destroy the extra databases', function(assert) {
  async.forEach(['db_replica', 'db_replica2'],
  nano.db.destroy, function(error) {
    assert.equal(error, undefined, 'deleted databases');
    assert.end();
  });
});
