const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
// const mongoose = require('mongoose');
const Issue = require('../models');

chai.use(chaiHttp);

let test_id;

suite('Functional Tests', function() {
  test("Create an issue with every field: POST request ot /api/issues/{project}", function(done) {
    chai
      .request(server)
      .post('/api/issues/apitest')
      .type('form')
      .send({
        issue_title: "test chai",
        issue_text: "test chai text",
        created_by: "chai",
        assigned_to: "chai tester",
        status_text: "chai status text",
        project: "apitest",
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'Response status is always 200');
        const response = JSON.parse(res.text);
        assert.hasAnyKeys({
          issue_title: "test chai",
          issue_text: "test chai text",
          created_by: "chai",
          assigned_to: "chai tester",
          status_text: "chai status text",
          project: "apitest",
        }, response);
        
        test_id = response._id;
        done();
      })
  });

  test("Create an issue with only required fields: POST request to /api/issues/{project}", function(done) {
    chai
      .request(server)
      .post('/api/issues/apitest')
      .type('form')
      .send({
        issue_title: "test chai",
        issue_text: "test chai text",
        created_by: "chai",
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'Response status is always 200');
        const response = JSON.parse(res.text);
        assert.include(response, {
          issue_title: "test chai",
          issue_text: "test chai text",
          created_by: "chai",
        });
        done();
      });
  });

  test("Create an issue with missing required fields: POST request to /api/issues/{project}", function(done) {
    chai
      .request(server)
      .post('/api/issues/apitest')
      .type('form')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200, 'Response status is always 200');
        const response = JSON.parse(res.text);
        assert.include(response, { error: 'required field(s) missing' });
        done();
    });
  });

  test("View issues on a project: GET request to /api/issues/{project}", function(done) {
    chai
      .request(server)
      .get('/api/issues/apitest')
      .end(function(err, res) {
        assert.equal(res.status, 200, 'Response status is always 200');
        const response = JSON.parse(res.text);
        assert.isArray(response, 'array of issue records');
        done();
    });
  });

  test("View issues on a project with one filter: GET request to /api/issues/{project}", function(done) {
    chai
      .request(server)
      .get('/api/issues/apitest')
      .query({open: true})
      .end(function(err, res) {
        assert.equal(res.status, 200, 'Response status is always 200');
        const response = JSON.parse(res.text);
        assert.isArray(response, 'array of issue records');
        assert.isAtLeast(response.length, 1, 'contains our test issue object data')
        done();
    });
  });

  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function(done) {
    chai
      .request(server)
      .get('/api/issues/apitest')
      .query({open: true, issue_title: "test chai"})
      .end(function(err, res) {
        assert.equal(res.status, 200, 'Response status is always 200');
        const response = JSON.parse(res.text);
        assert.isArray(response, 'array of issue records');
        assert.isAbove(response.length, 0, 'contains our test issue object data');
        assert.include(response[0], { open: true, issue_title: "test chai"}, "Fitered response object consists of required field with data");
        done();
  });
  });



  test("Update one field on an issue: PUT request to /api/issues/{project}", function(done) {    
    
  chai
    .request(server)
    .put('/api/issues/apitest')
    .send({
      _id: test_id,
      issue_title: 'chai issue title update'
    })
    .end(function(err, res) {

      assert.equal(res.status, 200, 'Response status is always 200');
      const response = JSON.parse(res.text);
      assert.include(response, {  result: 'successfully updated', '_id': test_id });
      done();
  });



  });

  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function(done) {
  chai
    .request(server)
    .put('/api/issues/apitest')
    .send({
      _id: test_id,
      issue_title: 'chai issue title update',
      issue_test: 'chai issue text',
      created_by: 'chai'
    })
    .end(function(err, res) {
      assert.equal(res.status, 200, 'Response status is always 200');
      const response = JSON.parse(res.text);
      assert.include(response, {  result: 'successfully updated', '_id': test_id });
      done();
    });
  });

  test("Update an issue with missing _id: PUT request to /api/issues/{project}", function(done) {
    chai
      .request(server)
      .put('/api/issues/apitest')
      .send({
        issue_title: 'chai issue title update',
        issue_test: 'chai issue text',
        created_by: 'chai'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'Response status is always 200');
        const response = JSON.parse(res.text);
        assert.include(response, { error: 'missing _id' });
        done();
    });

  });

  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function(done) {
    chai
      .request(server)
      .put('/api/issues/apitest')
      .send({
        _id: test_id,
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'Response status is always 200');
        const response = JSON.parse(res.text);
        assert.include(response, { error: 'no update field(s) sent', '_id': test_id });
        done();
    });

  });

  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function(done) {
    chai
      .request(server)
      .put('/api/issues/apitest')
      .send({
        _id: "testchaihash",
        issue_title: "test chai title 2"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'Response status is always 200');
        const response = JSON.parse(res.text);
        assert.include(response, { error: 'could not update', '_id': "testchaihash" });
        done();
    });
  });

  test("Delete an issue: DELETE request to /api/issues/{project}", function(done) {
      chai
        .request(server)
        .delete('/api/issues/apitest')
        .send({
          _id: test_id,
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, 'Response status is always 200');
          const response = JSON.parse(res.text);
          assert.include(response, { result: 'successfully deleted', '_id': test_id });
          done();
      });
  });

  test("Delete an issue: DELETE request to /api/issues/{project}", function(done) {
      chai
        .request(server)
        .delete('/api/issues/apitest')
        .send({})
        .end(function(err, res) {
          assert.equal(res.status, 200, 'Response status is always 200');
          const response = JSON.parse(res.text);
          assert.include(response, { error: 'missing _id' });
          done();
      });
  });

  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function(done) {
      chai
        .request(server)
        .delete('/api/issues/apitest')
        .send({
          _id: "testchaihash"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, 'Response status is always 200');
          const response = JSON.parse(res.text);
          assert.include(response, { error: 'could not delete', '_id': "testchaihash" });
          done();
      });
  });
  
});
