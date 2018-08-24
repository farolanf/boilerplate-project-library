/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var ObjectID = require('mongodb').ObjectID;

module.exports = function (app, db) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      db.collection('books').find().toArray((err, list) => {
        if (err) return res.sendStatus(500);
        res.json(list.map(b => {
          delete b.comments;
          return b;
        }));
      });
    })
     
    .post(function (req, res){
      var title = req.body.title; 
      if (!title || title.trim() === '') return res.sendStatus(400);
      //response will contain new book object including atleast _id and title
      db.collection('books').insertOne({ title, comments: [], commentcount: 0 }, (err, r) => {
        if (err) return res.sendStatus(500);
        res.json(r.ops[0]);
      });
    })
     
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      db.collection('books').deleteMany({}, err => {
        if (err) return res.sendStatus(500);
        res.status(200).send('complete delete successful');
      });
    });


 
  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      let oid
      try {
        oid = new ObjectID(bookid)
      }
      catch (x) {
        return res.status(400).send('no book exists');
      }
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      db.collection('books').findOne({ _id: oid }, (err, book) => {
        if (err) return res.sendStatus(500);
        if (!book) return res.status(400).send('no book exists');
        res.json(book);
      });
    })
     
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      let oid
      //json res format same as .get
      try {
        oid = new ObjectID(bookid)
      }
      catch (x) {
        return res.sendStatus(500)
      } 
      db.collection('books').findOneAndUpdate(
        { _id: oid },
        {
          $push: { comments: { comment }},
          $inc: { commentcount: 1 }
        },
        { returnOriginal: false },
        (err, r) => {
          res.json(r.value);
        });
    })
     
    .delete(function(req, res){
      var bookid = req.params.id;
      let oid
      //if successful response will be 'delete successful'
      try {
        oid = new ObjectID(bookid)
      }
      catch (x) {
        return res.sendStatus(500)
      }
      db.collection('books').deleteOne({ _id: oid }, err => {
        if (err) return res.sendStatus(500);
        res.status(200).send('delete successful');
      });
    });
  
};
