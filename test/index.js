'use strict';

var cls = require('continuation-local-storage');
var clsNamespace = cls.createNamespace('app');

var mongoose = require('mongoose');

var clsMongoose = require('..');
clsMongoose(clsNamespace);

var getMongooseVersion = function() {
  var fs = require('fs');
  var file = 'node_modules/mongoose/package.json';
  file = fs.readFileSync(file, 'utf8');
  var json = JSON.parse(file);
  var version = json.version;
  return (version);
};

describe("mongoose with cls", function() {

  var mongooseVersion = getMongooseVersion();

  var TestModel = mongoose.model('test_model', mongoose.Schema({value: String}));

  before(function(done) {

    console.log("mongoose version: " + mongooseVersion);
    mongoose.connect('mongodb://localhost/mongoose-cls-test', {useMongoClient: true}, done);
  });


  after(function() {
    mongoose.disconnect();
  });


  it("Model#find callback", function*() {
    yield function(callback) {
      TestModel.find({}, callback);
    };
  });

  it("Model#find promise", function*() {
    yield TestModel.find({});
  });

  it("Model#update callback", function*() {
    yield function(callback) {
      TestModel.update(
        {"nonexistent_field": "nonexistent_value"},
        {$set: {value: "modified entry"}},
        callback
      );
    };
  });

  it("Model#find promise", function*() {
    yield TestModel.update(
      {"nonexistent_field": "nonexistent_value"},
      {$set: {value: "modified entry"}}
    );
  });


  it("Model#distinct callback", function*() {
    yield function(callback) {
      TestModel.distinct('doesntExist', callback);
    };
  });
  it("Model#distinct promise", function*() {
    yield TestModel.distinct('doesntExist');
  });

  it("Model#count callback", function*() {
    yield function(callback) {
      TestModel.count({}, callback);
    };
  });

  it("Model#count promise", function(done) {
    TestModel.count({}).then(done.bind(null, null), done);
  });


  it("Model#find callback", function(done) {
    clsNamespace.run(function() {
      var value = Math.random();
      clsNamespace.set("value", value);

      TestModel.find({"nothing": "nothing"}, function(err) {
        if (err) return done(err);
        clsNamespace.get("value").should.be.eql(value);
        done();
      });
    });
  });

  it("Model#update callback", function(done) {
    clsNamespace.run(function() {
      var value = Math.random();
      clsNamespace.set("value", value);

      TestModel.update({"nothing": "nothing"}, {$set: {"nonexistent_field": "nonexistent_value"}}, function(err) {
        if (err) return done(err);
        clsNamespace.get("value").should.be.eql(value);
        done();
      });
    });
  });


  it("Model#findOneAndupdate callback", function(done) {
    clsNamespace.run(function() {
      var value = Math.random();
      clsNamespace.set("value", value);
      const testModel = new TestModel({'value': "nonexistent_value"});
      testModel.save(function (error, testModel) {
        should.not.exist(error);
        TestModel.findOneAndUpdate({'value': "nonexistent_value"}, {'value': "existent_value"}, {upsert: true,'new': true}, function (error, updatedValue) {
          should.not.exist(error);
          clsNamespace.set("otherValue", 0);
          clsNamespace.get("value").should.be.eql(value);
          done();
        });
      });
    });
  });

  it("Model#aggregate callback", function(done) {
    clsNamespace.run(function() {
      var value = Math.random();
      clsNamespace.set("value", value);

      TestModel.aggregate({$match: {"nonexistent_field": "nonexistent_value"}}, function(err) {
        if (err) return done(err);
        clsNamespace.get("value").should.be.eql(value);
        done();
      });
    });
  });


  it("Model#aggregate promise", function(done) {
    clsNamespace.run(function() {
      var value = Math.random();
      clsNamespace.set("value", value);

      TestModel.aggregate({$match: {"nonexistent_field": "nonexistent_value"}}).exec().then(function() {
        clsNamespace.get("value").should.be.eql(value);

        done();
      }, done);
    });
  });

});

