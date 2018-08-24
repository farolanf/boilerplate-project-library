/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var mongo = require('mongodb');
var server = require('../server');

chai.use(chaiHttp);

/* global before beforeEach afterEach suite test */

let db
 
before('Init DB', function(done) {
  mongo.connect(process.env.DB, (err, _db) => {
    if (err) throw err;
    db = _db;
    done();
  });
});
 
beforeEach('Add test data', function(done) {
  db.collection('books').insertOne({
    title: 'test title',
    comments: [
      { comment: 'great book' }
    ],
    commentcount: 1,
    test: true
  }, done);
});

afterEach('Remove test data', function(done) {
  db.collection('books').deleteMany({ test: true }, done);
});

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'book title' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.title, 'book title');
            assert.property(res.body, '_id');
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 400);
            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'commentcount');
            done();
          });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/invalid')
          .end((err, res) => {
            assert.equal(res.status, 400);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .get('/api/books/test title')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.equal(res.body.title, 'test title');
            assert.isArray(res.body.comments);
            assert.equal(res.body.comments[0].comment, 'great book');
            assert.equal(res.body.commentcount, 1);
            done();
          });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .post('/api/books/test title')
          .send({ comment: 'tragic' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.equal(res.body.title, 'test title');
            assert.isArray(res.body.comments);
            assert.equal(res.body.comments[0].comment, 'great book');
            assert.equal(res.body.comments[1].comment, 'tragic');
            assert.equal(res.body.commentcount, 2);
            done();
          });
      });
      
    });

  });

});
