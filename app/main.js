var async = require('async'),
    express = require('express'),
    app = express(),
    db = require('./db');


// movies

app.get('/movies/:movie_id', function(req, res) {
  db.getMovie(req.params.movie_id, function(err, movie) {
    if (err) { return console.error(err); }
    if (movie) {
      res.json({ movie: movie });
    }
    else {
      res.json(404);
    }
  });
});

app.post('/movies', express.bodyParser(), function(req, res) {
  var title = 'Untitled';
  if(req.body.title) {
    title = req.body.title;
  }
  db.createMovie(title, function(err, movie) {
    if (err) { return console.error(err); }
    res.json({ movie: movie });
  });
});

app.put('/movies/:movie_id', express.bodyParser(), function(req, res) {
  db.updateMovie(req.body.movie, function(err) {
    if (err) { return console.error(err); }
    res.json(200);
  });
});

// members

app.post('/members', express.bodyParser(), function(req, res) {
  db.createMember(req.body.member, function(err, member) {
    if (err) { return console.error(err); }
    res.json({ member: member });
  });
});

app.delete('/members/:member_id', function(req, res) {
  db.deleteMember(req.params.member_id, function(err) {
    if (err) { return console.error(err); }
    res.json(200);
  });
});

app.listen(3000);
