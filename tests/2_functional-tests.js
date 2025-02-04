const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  test('Creating a new thread: POST request to /api/threads/{board}', function (done) {
    chai
      .request(server)
      .post("/api/threads/functional_tests")
      .send({
        text: "functional test 1",
        delete_password: "password"
      })
      .end((err, res) => {
        assert.equal(res.body.thread.text, "functional test 1")
        done();
      })
  })

  test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", function (done) {
    chai
      .request(server)
      .get("/api/threads/functional_tests")
      .end((err, res) => {
        assert.isArray(res.body)
        assert.isAtMost(res.body.length, 10)
        for (let i = 0; i < res.body.length; i ++) {
          assert.isAtMost(res.body[i].replies.length, 3)
        }
        done();
      })
  })

  test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", function (done) {
    chai
      .request(server)
      .delete("/api/threads/functional_tests")
      .send({
        thread_id: 181,
        delete_password: "wrong password"
      })
      .end((err, res) => {
        assert.equal(res.text, "incorrect password")
        done();
      })
  })

  test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", function (done) {
    chai
      .request(server)
      .delete("/api/threads/functional_tests")
      .send({
        thread_id: 181,
        delete_password: "password"
      })
      .end((err, res) => {
        assert.equal(res.text, "success")
        done();
      })
  })

  test("Reporting a thread: PUT request to /api/threads/{board}", function (done) {
    chai
      .request(server)
      .put("/api/threads/functional_tests")
      .send({
        thread_id: 183
      })
      .end((err, res) => {
        assert.equal(res.text, "reported")
        done();
      })
  })

  test("Creating a new reply: POST request to /api/replies/{board}", function (done) {
    chai
      .request(server)
      .post("/api/replies/functional_tests")
      .send({
        thread_id: 201,
        text: "test reply",
        delete_password: "password"
      })
      .end((err, res) => {
        console.log("TEST RES.BODY:", res.body)
        assert.equal(res.body.success, true)
        done();
      })
  })

  test("Viewing a single thread with all replies: GET request to /api/replies/{board}", function (done) {
    chai
      .request(server)
      .get("/api/replies/functional_tests")
      .query({
        thread_id: 201
      })
      .end((err, res) => {
        assert.isObject(res.body)
        assert.property(res.body, "replies")
        done();
      })
  })

  test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", function (done) {
    chai
      .request(server)
      .delete("/api/replies/functional_tests")
    .send({
      thread_id: 201,
      reply_id: 5,
      delete_password: "wrong password"
    })
    .end((err, res) => {
      assert.equal(res.text, "incorrect password")
      done();
    })
  })

  test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", function (done) {
    chai
      .request(server)
      .delete("/api/replies/functional_tests")
    .send({
      thread_id: 201,
      reply_id: 5,
      delete_password: "password"
    })
    .end((err, res) => {
      assert.equal(res.text, "success")
      done();
    })
  })

  test("Reporting a reply: PUT request to /api/replies/{board}", function (done) {
    chai
      .request(server)
      .put("/api/replies/functional_tests")
      .send({
        thread_id: 201,
        reply_id: 6
      })
      .end((err, res) => {
        assert.equal(res.text, "reported")
        done();
      })
  })
  
});
