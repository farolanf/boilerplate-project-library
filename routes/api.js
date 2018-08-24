/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;

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
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
  
};
